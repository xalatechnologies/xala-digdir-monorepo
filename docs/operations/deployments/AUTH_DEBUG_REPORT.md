# Authentication Debug Report
**Date**: January 16, 2026  
**Issue**: User lookup fails after BankID authentication

---

## Problem Summary

After successful BankID authentication, user lookup in the database consistently fails with either:
1. **"No user found"** - Query returns empty
2. **"query.getSQL is not a function"** - TypeError in Drizzle ORM

---

## Evidence

### 1. Data Exists in Database ✅
```sql
-- Manual query WORKS
SELECT id, email, name, national_id, tenant_id 
FROM users 
WHERE national_id = '30916326773' 
AND tenant_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

-- Result:
-- id: 80e697c7-e4ae-4521-9c4b-f5b0e5462dbf
-- email: admin.bankid@demo.no
-- name: Admin (BankID)
-- national_id: 30916326773
-- tenant_id: f47ac10b-58cc-4372-a567-0e02b2c3d479
```

### 2. Current Error Logs
```
67|digilis | [ID-PORTEN CALLBACK] Looking up user with NIN: 309163***
67|digilis | [ID-PORTEN CALLBACK] Using tenantId: f47ac10b-58cc-4372-a567-0e02b2c3d479
67|digilis | [ID-PORTEN CALLBACK] Error occurred: TypeError: query.getSQL is not a function
67|digilis |     at PgDatabase.execute (file:///var/www/digilist-api/node_modules/.pnpm/drizzle-orm@0.33.0_postgres@3.4.8/node_modules/drizzle-orm/pg-core/db.js:260:23)
67|digilis |     at IdPortenAuthController.callback (file:///var/www/digilist-api/main.js:11328:31)
```

### 3. Database Schema
```typescript
// apps/api/src/database/schema/index.ts
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  nationalId: varchar('national_id', { length: 11 }),  // ← Maps nationalId → national_id
  email: varchar('email', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  // ...
});
```

---

## Root Cause Analysis

### Issue #1: Drizzle `execute()` API Mismatch

**What we're doing**:
```typescript
const db = container.resolve<any>('Database');  // This is Drizzle ORM instance
const sql = `SELECT * FROM users WHERE national_id = $1 AND tenant_id = $2`;
const result = await db.execute(sql, [nin, tenantId]);  // ❌ WRONG
```

**Why it fails**:
- `db` is a Drizzle ORM `PgDatabase` instance
- Drizzle's `.execute()` expects a **Drizzle SQL query object** (has `.getSQL()` method)
- We're passing a **raw string**, which doesn't have `.getSQL()`

**Drizzle Source Code** (`drizzle-orm/pg-core/db.js:260`):
```javascript
execute(query) {
  const sql = query.getSQL();  // ← Expects query.getSQL() to exist
  // ...
}
```

### Issue #2: Container Registration

**In `main.ts` line 120**:
```typescript
container.registerValue('Database', db);  // db = drizzle(client)
```

The `db` registered is the **Drizzle ORM wrapper**, not the raw postgres client.

---

## Solutions Attempted

### ❌ Attempt 1: Drizzle ORM Query Builder
```typescript
const userResult = await db.select()
  .from(users)
  .where(and(
    eq(users.nationalId, nin),
    eq(users.tenantId, tenantId)
  ))
  .limit(1);
```
**Result**: Returns empty array despite data existing

### ❌ Attempt 2: Raw SQL via Drizzle's execute()
```typescript
const sql = `SELECT * FROM users WHERE national_id = $1 AND tenant_id = $2`;
const result = await db.execute(sql, [nin, tenantId]);
```
**Result**: `TypeError: query.getSQL is not a function`

---

## Required Fix

### Option A: Use Drizzle's SQL Tagged Template
```typescript
import { sql } from 'drizzle-orm';

const result = await db.execute(sql`
  SELECT * FROM users 
  WHERE national_id = ${nin} 
  AND tenant_id = ${tenantId}
  LIMIT 1
`);
```

### Option B: Access Raw Postgres Client
```typescript
// Register raw client separately
container.registerValue('PostgresClient', client);  // Raw postgres connection

// Then use it
const client = container.resolve<any>('PostgresClient');
const result = await client.query(
  'SELECT * FROM users WHERE national_id = $1 AND tenant_id = $2 LIMIT 1',
  [nin, tenantId]
);
const userResult = result.rows;
```

### Option C: Use Drizzle's sql.raw()
```typescript
import { sql } from 'drizzle-orm';

const result = await db.execute(
  sql.raw(`SELECT * FROM users WHERE national_id = '${nin}' AND tenant_id = '${tenantId}' LIMIT 1`)
);
```

---

## Environment Variables

```bash
# Production API .env
VITE_TENANT_ID=f47ac10b-58cc-4372-a567-0e02b2c3d479
DATABASE_URL=postgresql://digilist:digilist_secure_2026@localhost:5432/unified_api
```

---

## Test Users

```sql
-- Citizen (BankID)
NIN: 15860771346
Email: bruker.bankid@demo.no

-- Admin (BankID)
NIN: 30916326773
Email: admin.bankid@demo.no
```

---

## Next Steps

1. **Implement Option A** (Drizzle's SQL tagged template) - **RECOMMENDED**
2. Test with live BankID login
3. Verify logs show "user found"
4. Confirm successful redirect with authenticated session

---

## Additional Context

- **Drizzle Version**: 0.33.0
- **Postgres Client**: `@neondatabase/serverless` v3.4.8
- **Node Version**: v22.x
- **Database**: PostgreSQL 14+

---

**Status**: BLOCKING - Authentication completely broken  
**Priority**: P0 - Critical  
**Owner**: Platform Team
