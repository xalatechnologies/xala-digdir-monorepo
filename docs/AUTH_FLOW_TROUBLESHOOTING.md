# Authentication Flow Troubleshooting Guide

## Overview
This document provides comprehensive guidance for debugging and fixing authentication issues in the Digilist platform, specifically focusing on BankID/Vipps OAuth flows via Signicat.

---

## Common Issues and Solutions

### 1. **User Not Found After Successful BankID Authentication**

#### **Symptoms**
- BankID authentication succeeds
- User is redirected back with `auth_error=user_not_found`
- API logs show "NO USER" despite data existing in database

#### **Root Causes**

##### A. Database Schema Mismatch
**Problem**: Drizzle ORM field names don't match database column names

**Example**:
```typescript
// Schema definition
nationalId: varchar('national_id', { length: 11 })  // Drizzle field → DB column mapping
```

**Fix**: Always use consistent snake_case for DB columns and map them in Drizzle:
```typescript
// ✅ CORRECT
nationalId: varchar('national_id', { length: 11 })

// ❌ WRONG - column name doesn't exist
nationalId: varchar('nationalId', { length: 11 })
```

##### B. Missing tenant_id Filter
**Problem**: Query filters by tenant_id but session doesn't have one

**Solution**: For initial login, don't require tenant_id:
```typescript
// Query without tenant filter for initial user lookup
const userQuery = db.select().from(users).where(eq(users.nationalId, nin));

// Only add tenant filter if we have tenant context
if (session.tenantId) {
  userQuery.where(eq(users.tenantId, session.tenantId));
}

const userResult = await userQuery.limit(1);
```

##### C. Stale Code Deployment
**Problem**: API code not reloaded after schema changes

**Fix**:
```bash
# Always rebuild AND restart after schema changes
cd apps/api
npm run build
scp dist/* root@SERVER:/var/www/digilist-api/
ssh root@SERVER "pm2 restart digilist-api"
```

---

### 2. **Router Context Error (`useNavigate()` outside Router)**

#### **Symptoms**
```
Error: useNavigate() may be used only in the context of a <Router> component
```

#### **Root Cause**
SDK hooks (`useAuthRedirectGuard`, `useSessionRestoration`) are called before React Router is initialized.

#### **Solution**
Disable these hooks temporarily or ensure they're only called after Router is mounted:

```typescript
// apps/minside/src/providers/AuthProvider.tsx
// Disable problematic hooks:
// useAuthRedirectGuard(!!user, isLoading);  // COMMENTED OUT
```

---

### 3. **Redirect to Wrong URL After Auth**

#### **Symptoms**
- Login initiated from `localhost:5176`
- After auth, redirected to `minside-test.digilist.no`

#### **Root Cause**
`returnTo` parameter not properly captured or `DEFAULT_REDIRECT_URL` env var takes precedence

#### **Solution**
1. **Ensure returnTo is passed during authorization**:
```typescript
// Web app login
const returnTo = window.location.href;  // Current page
idportenService.authorize(returnTo);
```

2. **Store returnTo in session**:
```typescript
await sessionStore.set(state, {
  sessionId: session.id,
  state,
  createdAt: Date.now(),
  status: 'pending',
  returnTo: validatedReturnTo,  // ✅ Must be stored
  tenantId,
});
```

3. **Use returnTo from session in callback**:
```typescript
const session = await sessionStore.get(state);
const returnTo = session.returnTo || DEFAULT_REDIRECT_URL;
```

---

## Testing Authentication Flow

### Prerequisites
1. **Test Users with NIns**:
```sql
-- Add test users with Norwegian National ID Numbers
INSERT INTO users (id, tenant_id, email, name, role, national_id)
VALUES
  ('...', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'bruker.bankid@demo.no', 'Bruker (BankID)', 'CITIZEN', '15860771346'),
  ('...', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'admin.bankid@demo.no', 'Admin (BankID)', 'ADMIN', '30916326773');
```

2. **Local Development Config** (`apps/web/.env`):
```bash
VITE_API_URL=https://api.digilist.no
VITE_WS_URL=wss://api.digilist.no
```

### Test Flow
1. Open `http://localhost:5176/login`
2. Click "Logg inn med ID-porten"
3. Use BankID test credentials:
   - NIN: `15860771346`  
   - Birth date: `07/08/1986`
4. Complete BankID flow  
5. **Expected**: Redirect back to `localhost:5176` with authenticated session
6. **Check**: User dropdown in header shows user name

---

## Debugging Tools

### 1. **Live API Logs**
```bash
ssh root@SERVER "pm2 logs digilist-api --lines 0"
# Then trigger login and watch logs in real-time
```

### 2. **Database Query Verification**
```bash
# Check if user exists
ssh root@SERVER "psql DB_URL -c \"SELECT * FROM users WHERE national_id = 'NIN';\""
```

### 3. **Session Inspection**
```typescript
// Add logging in idporten.controller.ts
console.log('[ID-PORTEN CALLBACK] Retrieved session:', session);
console.log('[ID-PORTEN CALLBACK] Extracted NIN:', nin);
console.log('[ID-PORTEN CALLBACK] Session tenantId:', session.tenantId);
```

---

## Database Schema Standards

### Always Use snake_case for DB Columns
```typescript
// ✅ CORRECT Pattern
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(()=> tenants.id),
  nationalId: varchar('national_id', { length: 11 }),  // camelCase → snake_case mapping
  createdAt: timestamp('created_at').defaultNow(),
});
```

### Migration Workflow
1. **Update schema** (`apps/api/src/database/schema/index.ts`)
2. **Add column** to production DB:
```sql
ALTER TABLE users ADD COLUMN national_id VARCHAR(11);
CREATE UNIQUE INDEX users_national_id_idx ON users(national_id);
```
3. **Rebuild API**:
```bash
cd apps/api && npm run build
```
4. **Deploy**:
```bash
scp dist/* root@SERVER:/var/www/digilist-api/
ssh root@SERVER "pm2 restart digilist-api"
```

---

## Production Deployment Checklist

- [ ] Schema changes applied to production DB
- [ ] Test users seeded with correct NIns
- [ ] API rebuilt with latest schema
- [ ] PM2 process fully restarted (not just reloaded)
- [ ] Environment variables loaded (check `.env` in deployment directory)
- [ ] Health check passes: `curl http://localhost:4000/health`
- [ ] Test complete auth flow from local dev → production API → redirect back

---

## Common Pitfalls

1. **❌ PM2 not picking up .env file**
   - **Fix**: Start PM2 with explicit env loading:
   ```bash
   cd /var/www/digilist-api
   pm2 start 'node --env-file=.env main.js' --name digilist-api
   ```

2. **❌ Drizzle query returning empty despite data existing**
   - **Check**: Column name mapping in schema
   -**Check**: Tenant filtering when not needed

3. **❌ Schema deployed but still getting "column does not exist"**
   - **Fix**: Ensure PM2 process fully restarted, not just code reload

4. **❌ Case-sensitive column names (PostgreSQL)**
   - Always use lowercase unquoted column names
   - Avoid `"nationalId"` (quotes make it case-sensitive)
   - Use `national_id` (unquoted, lowercase)

---

## Support Resources

- **Signicat Sandbox**: https://developer.signicat.com/
- **BankID Test Users**: Use Signicat-provided test NIns
- **Drizzle ORM Docs**: https://orm.drizzle.team/
- **PostgreSQL Naming**: https://www.postgresql.org/docs/current/sql-syntax-lexical.html#SQL-SYNTAX-IDENTIFIERS

---

**Last Updated**: January 16, 2026
**Maintainer**: Platform Team
