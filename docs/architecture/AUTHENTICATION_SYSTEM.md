# Authentication System - Final Architecture

> **🔒 HARD LINE - NO CHANGES WITHOUT APPROVAL**
>
> This document describes the production authentication system that is **WORKING AND STABLE**.
> Any changes to this system require explicit approval and thorough testing.
>
> **Last Updated:** 2026-01-17
> **Status:** ✅ PRODUCTION STABLE

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication Methods](#authentication-methods)
3. [Session Management](#session-management)
4. [Cookie Architecture](#cookie-architecture)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)
7. [Frontend Integration](#frontend-integration)
8. [Troubleshooting](#troubleshooting)
9. [Security Considerations](#security-considerations)

---

## Overview

The Xala/Digilist platform uses a **multi-method authentication system** with:

- **BankID/ID-porten** - Norwegian national identity authentication via Signicat
- **Demo Login** - Token-based authentication for testing and demonstrations
- **Vipps** - Mobile authentication (temporarily disabled)
- **Microsoft SSO** - Coming soon

### Key Principles

1. **HTTP-only cookies** - No tokens in localStorage or URLs
2. **Cross-subdomain SSO** - Single sign-on across minside, backoffice, web
3. **Database-backed sessions** - Sessions stored in PostgreSQL
4. **Audit-first** - All authentication events logged
5. **Multi-tenant** - Tenant isolation at database level

---

## Authentication Methods

### 1. BankID/ID-porten (Primary Method)

**Used by:** Personal users on minside, backoffice admins

**Flow:**
```
1. User clicks "ID-porten" button
   ↓
2. Frontend calls: GET /api/auth/idporten/authorize?returnTo={currentUrl}
   ↓
3. Backend redirects to Signicat (302)
   ↓
4. User completes BankID authentication
   ↓
5. Signicat redirects to: /api/auth/idporten/callback?code={authCode}
   ↓
6. Backend:
   - Exchanges code for tokens
   - Creates or finds user by nationalId
   - Creates session in database
   - Sets three HTTP-only cookies (dl_at, dl_rt, dl_csrf)
   - Logs authentication event to audit_logs
   ↓
7. Backend redirects to: {frontendOrigin}/?auth_success=true
   ↓
8. Frontend:
   - Cookies automatically sent on requests
   - Calls GET /api/auth/session to load user data
   - Redirects to dashboard
```

**Critical Files:**
- `apps/api/src/modules/auth/idporten.controller.ts` - Controller (REST API)
- `apps/api/src/modules/auth/session.service.ts` - Session management
- `packages/client-sdk/src/services/idporten.service.ts` - Frontend SDK

**Environment Variables:**
```bash
SIGNICAT_CLIENT_ID=digilist-production
SIGNICAT_CLIENT_SECRET=***
SIGNICAT_ISSUER=https://digilist.sandbox.signicat.com/oidc
SIGNICAT_REDIRECT_URI=https://api.digilist.no/api/auth/idporten/callback
```

### 2. Demo Login

**Used by:** Testing, demos, local development

**Flow:**
```
1. User clicks "Admin Demo" button
   ↓
2. User enters name, email, and demo token
   ↓
3. Frontend calls: POST /api/auth/demo-token
   Body: { name, email, token }
   ↓
4. Backend:
   - Validates demo token against database
   - Finds user with matching demoToken
   - Creates session
   - Sets three HTTP-only cookies
   - Logs authentication event
   ↓
5. Backend returns user data
   ↓
6. Frontend redirects to dashboard
```

**Valid Demo Tokens:**
```javascript
// From database seed (demo-seed-v3.ts)
{
  'skien-admin-001': { email: 'admin@skien.kommune.no', role: 'admin' },
  'xala-demo-001': { email: 'demo@xala.no', role: 'admin' },
  'porsgrunn-admin-001': { email: 'leder@porsgrunn-il.no', role: 'admin' },
  'skien-citizen-001': { email: 'ola.hansen@kommune.no', role: 'member' },
  'skien-staff-001': { email: 'staff@skien.kommune.no', role: 'case_handler' }
}
```

**Critical Files:**
- `apps/api/src/modules/auth/demo.controller.ts` - Demo authentication
- `apps/api/src/database/seeds/demo-seed-v3.ts` - Demo users and tokens

---

## Session Management

### Session Creation

```typescript
// apps/api/src/modules/auth/session.service.ts

const userSession = await sessionService.createSession({
  userId: string,
  tenantId: string,
  userAgent?: string,
  ipAddress?: string,
  metadata?: Record<string, any>
});

// Returns:
{
  sessionId: string,
  accessToken: string,    // JWT, expires in 15 minutes
  refreshToken: string,   // JWT, expires in 7 days
  expiresAt: Date
}
```

### Session Storage

Sessions are stored in the **platform.sessions** table:

```sql
CREATE TABLE platform.sessions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES platform.users(id),
  tenant_id UUID NOT NULL REFERENCES platform.tenants(id),
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  user_agent TEXT,
  ip_address TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Session Validation

```typescript
// Middleware: apps/api/src/middleware/auth.ts

1. Extract dl_at cookie from request
2. Verify JWT signature and expiration
3. Look up session in database
4. Check session is not expired
5. Load user and tenant data
6. Attach to request.user and request.tenant
7. If expired → return 401, frontend should redirect to /login
```

---

## Cookie Architecture

### Three-Cookie System

We use **three HTTP-only cookies** for security and functionality:

| Cookie Name | Purpose | Max Age | Path | HttpOnly | Domain |
|-------------|---------|---------|------|----------|--------|
| `dl_at` | Access Token (JWT) | 15 min | `/` | ✅ Yes | `.digilist.no` |
| `dl_rt` | Refresh Token (JWT) | 7 days | `/api/auth/refresh` | ✅ Yes | `.digilist.no` |
| `dl_csrf` | CSRF Protection | 7 days | `/` | ❌ No | `.digilist.no` |

### Cookie Configuration

```typescript
// apps/api/src/config/cookies.ts

export const COOKIE_CONFIG = {
  ACCESS: {
    name: 'dl_at',
    maxAge: 15 * 60, // 15 minutes
    path: '/',
  },
  REFRESH: {
    name: 'dl_rt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/api/auth/refresh',
  },
  CSRF: {
    name: 'dl_csrf',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  },
};

export function getCookieOptions(cookieType: 'ACCESS' | 'REFRESH' | 'CSRF', isProduction: boolean) {
  const config = COOKIE_CONFIG[cookieType];
  return {
    httpOnly: cookieType !== 'CSRF', // CSRF needs to be readable by JS
    secure: isProduction,             // HTTPS only in production
    sameSite: 'lax' as const,         // CSRF protection
    domain: isProduction ? '.digilist.no' : undefined, // Cross-subdomain SSO
    path: config.path,
    maxAge: config.maxAge,
  };
}
```

### Setting Cookies (Backend)

```typescript
// In idporten.controller.ts, demo.controller.ts

import { COOKIE_CONFIG, getCookieOptions } from '../../config/cookies';

const isProduction = process.env.NODE_ENV === 'production';
const csrfToken = randomBytes(32).toString('base64url');

reply
  .setCookie(COOKIE_CONFIG.ACCESS.name, userSession.accessToken, getCookieOptions('ACCESS', isProduction))
  .setCookie(COOKIE_CONFIG.REFRESH.name, userSession.refreshToken, getCookieOptions('REFRESH', isProduction))
  .setCookie(COOKIE_CONFIG.CSRF.name, csrfToken, getCookieOptions('CSRF', isProduction));
```

### Reading Cookies (Frontend)

**NEVER read cookies directly in frontend JavaScript**. Cookies are HTTP-only and automatically sent with requests.

```typescript
// ✅ CORRECT - Cookies sent automatically
const response = await fetch('https://api.digilist.no/api/auth/session', {
  credentials: 'include' // Important!
});

// ❌ WRONG - Cannot access HTTP-only cookies
const token = document.cookie; // Returns empty string
```

---

## Database Schema

### Critical Schema Structure

**⚠️ HARD REQUIREMENT:** The code expects tables in **named schemas**, not the `public` schema.

```sql
-- Create schemas (REQUIRED)
CREATE SCHEMA IF NOT EXISTS platform;   -- User/tenant infrastructure
CREATE SCHEMA IF NOT EXISTS domain;     -- Business domain tables
CREATE SCHEMA IF NOT EXISTS compliance; -- Audit and GDPR
CREATE SCHEMA IF NOT EXISTS monitoring; -- Health checks, metrics
CREATE SCHEMA IF NOT EXISTS saas;       -- Billing, subscriptions
```

### Schema Assignment

| Schema | Tables | Purpose |
|--------|--------|---------|
| **platform** | users, tenants, organizations, sessions, org_memberships, permission_assignments, case_handler_scopes, branding_tokens, branding_versions | Core platform infrastructure |
| **domain** | rental_objects, bookings, alerts, allocations, seasonal_leases, conversations, messages, seasons, season_applications, priority_rules, access_grants | Business domain entities |
| **compliance** | audit_logs, gdpr_requests | Legal compliance and audit trail |
| **monitoring** | health_checks, metrics | (Future) System monitoring |
| **saas** | billing, subscriptions | (Future) SaaS features |

### Users Table

```sql
CREATE TABLE platform.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES platform.tenants(id),
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  national_id VARCHAR(11), -- Norwegian fødselsnummer
  demo_token VARCHAR(50), -- For demo login
  role VARCHAR(50) NOT NULL DEFAULT 'member',
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, email),
  UNIQUE(tenant_id, national_id),
  UNIQUE(demo_token)
);

CREATE INDEX idx_users_tenant_id ON platform.users(tenant_id);
CREATE INDEX idx_users_email ON platform.users(email);
CREATE INDEX idx_users_national_id ON platform.users(national_id);
CREATE INDEX idx_users_demo_token ON platform.users(demo_token);
```

### Sessions Table

```sql
CREATE TABLE platform.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES platform.tenants(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  user_agent TEXT,
  ip_address TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id ON platform.sessions(user_id);
CREATE INDEX idx_sessions_tenant_id ON platform.sessions(tenant_id);
CREATE INDEX idx_sessions_expires_at ON platform.sessions(expires_at);
```

### Audit Logs Table

```sql
CREATE TABLE compliance.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES platform.tenants(id),
  user_id UUID REFERENCES platform.users(id),
  action VARCHAR(100) NOT NULL, -- e.g., 'login', 'logout', 'booking:create'
  resource VARCHAR(100), -- e.g., 'auth', 'booking'
  resource_id UUID,
  metadata JSONB DEFAULT '{}', -- Additional context
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_tenant_id ON compliance.audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_user_id ON compliance.audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON compliance.audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON compliance.audit_logs(created_at);
```

### Drizzle Schema Definitions

```typescript
// apps/api/src/database/schema/index.ts

import { pgSchema } from 'drizzle-orm/pg-core';

// Define schemas
export const platformSchema = pgSchema('platform');
export const domainSchema = pgSchema('domain');
export const complianceSchema = pgSchema('compliance');
export const monitoringSchema = pgSchema('monitoring');
export const saasSchema = pgSchema('saas');

// Define tables in their respective schemas
export const users = platformSchema.table('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  email: varchar('email', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  nationalId: varchar('national_id', { length: 11 }),
  demoToken: varchar('demo_token', { length: 50 }),
  role: varchar('role', { length: 50 }).notNull().default('member'),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const sessions = platformSchema.table('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  userAgent: text('user_agent'),
  ipAddress: text('ip_address'),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const audit_logs = complianceSchema.table('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  userId: uuid('user_id').references(() => users.id),
  action: varchar('action', { length: 100 }).notNull(),
  resource: varchar('resource', { length: 100 }),
  resourceId: uuid('resource_id'),
  metadata: jsonb('metadata').default({}),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
```

---

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Purpose | Body | Response |
|--------|----------|---------|------|----------|
| GET | `/api/auth/idporten/authorize` | Start BankID flow | Query: `returnTo` | 302 Redirect to Signicat |
| GET | `/api/auth/idporten/callback` | BankID callback | Query: `code`, `state` | 302 Redirect to frontend |
| GET | `/api/auth/idporten/config` | Get ID-porten config | - | `{ data: IdPortenConfig }` |
| POST | `/api/auth/demo-token` | Demo login | `{ name, email, token }` | `{ data: { user, expiresAt } }` |
| GET | `/api/auth/session` | Get current session | - | `{ data: { user, tenant } }` |
| POST | `/api/auth/refresh` | Refresh access token | - | Sets new `dl_at` cookie |
| POST | `/api/auth/logout` | End session | - | Clears cookies, 200 OK |

### Example Requests

**BankID Authorization:**
```bash
curl -I 'https://api.digilist.no/api/auth/idporten/authorize?returnTo=https://minside-test.digilist.no/'

# Response:
HTTP/2 302
location: https://digilist.sandbox.signicat.com/broker/sp/external-service/login?messageId=...
```

**Demo Login:**
```bash
curl -X POST 'https://api.digilist.no/api/auth/demo-token' \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Admin Skien",
    "email": "admin@skien.kommune.no",
    "token": "skien-admin-001"
  }'

# Response:
{
  "data": {
    "user": {
      "id": "a0000000-0000-0000-0000-000000000001",
      "email": "admin@skien.kommune.no",
      "name": "Admin Skien",
      "role": "admin",
      "tenantId": "f47ac10b-58cc-4372-a567-0e02b2c3d479"
    },
    "expiresAt": "2026-01-24T09:27:54.539Z"
  }
}
```

**Get Current Session:**
```bash
curl 'https://api.digilist.no/api/auth/session' \
  -H 'Cookie: dl_at=eyJhbGciOiJIUzI1NiIs...'

# Response:
{
  "data": {
    "user": {
      "id": "...",
      "email": "admin@skien.kommune.no",
      "name": "Admin Skien",
      "role": "admin"
    },
    "tenant": {
      "id": "...",
      "name": "Skien Kommune"
    }
  }
}
```

**Logout:**
```bash
curl -X POST 'https://api.digilist.no/api/auth/logout' \
  -H 'Cookie: dl_at=eyJhbGciOiJIUzI1NiIs...'

# Response:
{
  "data": {
    "success": true,
    "message": "Logget ut"
  }
}
# Cookies cleared via Set-Cookie headers
```

---

## Frontend Integration

### SDK Service (packages/client-sdk)

```typescript
// packages/client-sdk/src/services/idporten.service.ts

import { getClient } from '../core/client-factory';

class IdPortenService {
  private basePath = '/api/auth/idporten'; // ⚠️ NOT '/api/auth/idporten-oidc'

  /**
   * Get the authorization URL to start OAuth flow
   */
  getAuthorizeUrl(redirectPath?: string): string {
    const apiBaseUrl = this.getApiBaseUrl();
    let url = `${apiBaseUrl}${this.basePath}/authorize`;
    if (redirectPath) {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const fullRedirectUrl = redirectPath.startsWith('http')
        ? redirectPath
        : `${origin}${redirectPath.startsWith('/') ? '' : '/'}${redirectPath}`;
      url += `?returnTo=${encodeURIComponent(fullRedirectUrl)}`;
    }
    return url;
  }

  /**
   * Start authorization flow by redirecting to ID-porten
   */
  authorize(redirectUrl?: string): void {
    if (typeof window !== 'undefined') {
      window.location.href = this.getAuthorizeUrl(redirectUrl);
    }
  }

  /**
   * Logout by clearing cookies
   */
  async logout(): Promise<void> {
    await getClient().post('/api/auth/logout');
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }
}

export const idportenService = new IdPortenService();
```

### Login Component (apps/minside)

```typescript
// apps/minside/src/routes/login.tsx

import { idportenService } from '@digilist/client-sdk';

export function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, isLoading]);

  const handleIdPortenLogin = () => {
    // Pass current URL for session persistence
    const returnTo = window.location.href;
    idportenService.authorize(returnTo);
  };

  return (
    <LoginLayout>
      <LoginOption
        icon={<IdPortenIcon />}
        title="ID-porten"
        description="Logg inn med BankID"
        onClick={handleIdPortenLogin}
      />
      {/* Other login options */}
    </LoginLayout>
  );
}
```

### Auth Provider (apps/minside)

```typescript
// apps/minside/src/providers/AuthProvider.tsx

import { useQuery } from '@tanstack/react-query';
import { authService } from '@digilist/client-sdk';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['auth', 'session'],
    queryFn: () => authService.getSession(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const user = data?.data?.user;
  const tenant = data?.data?.tenant;
  const isAuthenticated = !!user;

  // Redirect to login if 401
  useEffect(() => {
    if (error && error.status === 401) {
      window.location.href = '/login';
    }
  }, [error]);

  return (
    <AuthContext.Provider value={{ user, tenant, isAuthenticated, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### Protected Route

```typescript
// apps/minside/src/components/ProtectedRoute.tsx

import { Navigate } from 'react-router-dom';
import { useAuth } from '@xala/auth';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. "Redirects back to login after authentication"

**Symptoms:**
- User completes BankID authentication
- Redirected to frontend
- Frontend calls `/api/auth/session` → 401
- Redirected back to `/login`

**Root Cause:**
- Cookies not being set properly
- Database schema mismatch
- Session not created in database

**Solution:**
```bash
# 1. Check cookies are set in browser dev tools (Application → Cookies)
# Should see: dl_at, dl_rt, dl_csrf with domain .digilist.no

# 2. Verify database schemas exist
psql -d digilist_prod -c "\dn"
# Should show: platform, domain, compliance schemas

# 3. Verify tables are in correct schemas
psql -d digilist_prod -c "SELECT schemaname, tablename FROM pg_tables WHERE schemaname IN ('platform', 'domain', 'compliance') ORDER BY schemaname, tablename;"

# 4. Check API logs for errors
pm2 logs xala-api --lines 100

# 5. Restart API server
pm2 restart xala-api
```

#### 2. "PostgresError: relation 'platform.users' does not exist"

**Root Cause:**
Tables exist in `public` schema but code expects named schemas.

**Solution:**
```sql
-- Move tables to correct schemas
ALTER TABLE public.users SET SCHEMA platform;
ALTER TABLE public.sessions SET SCHEMA platform;
ALTER TABLE public.audit_logs SET SCHEMA compliance;
-- ... (see database schema section for full list)

-- Restart API
pm2 restart xala-api
```

#### 3. "Demo login fails with 'Ugyldig demo-token'"

**Root Cause:**
- Demo token not in database
- User not seeded

**Solution:**
```bash
# Check if demo users exist
psql -d digilist_prod -c "SELECT email, demo_token, role FROM platform.users WHERE demo_token IS NOT NULL;"

# If empty, run seed
cd apps/api
pnpm db:seed
```

#### 4. "CORS errors on API requests"

**Root Cause:**
Frontend domain not in CORS whitelist.

**Solution:**
```bash
# Check CORS_ORIGIN environment variable
ssh root@72.61.23.56 'pm2 env xala-api | grep CORS'

# Should include:
CORS_ORIGIN=https://minside-test.digilist.no,https://backoffice-test.digilist.no,https://web-test.digilist.no

# Update if needed
pm2 restart xala-api --update-env
```

#### 5. "Cookies not being sent on requests"

**Root Cause:**
Frontend not sending `credentials: 'include'` on fetch requests.

**Solution:**
```typescript
// ✅ CORRECT
fetch('https://api.digilist.no/api/auth/session', {
  credentials: 'include' // Required for cookies
});

// ❌ WRONG
fetch('https://api.digilist.no/api/auth/session'); // No credentials
```

---

## Security Considerations

### 1. HTTP-Only Cookies

✅ **DO:** Use HTTP-only cookies for tokens
- Protects against XSS attacks
- Cannot be accessed by JavaScript
- Automatically sent with requests

❌ **DON'T:** Store tokens in localStorage
- Vulnerable to XSS attacks
- Accessible to any script on page

### 2. CSRF Protection

✅ **DO:** Use CSRF tokens for state-changing operations
- `dl_csrf` cookie readable by JavaScript
- Include in POST/PUT/DELETE request headers
- Validate on backend

```typescript
// Frontend
const csrfToken = getCookie('dl_csrf');
fetch('/api/bookings', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': csrfToken,
  },
  credentials: 'include',
});
```

### 3. Secure Cookie Settings

```typescript
{
  httpOnly: true,           // Cannot be accessed by JavaScript
  secure: isProduction,     // HTTPS only in production
  sameSite: 'lax',          // CSRF protection
  domain: '.digilist.no',   // Cross-subdomain SSO
}
```

### 4. Token Expiration

- **Access Token:** 15 minutes (short-lived)
- **Refresh Token:** 7 days (longer-lived)
- **Session:** Auto-deleted when expired

### 5. Audit Logging

**ALL authentication events are logged:**

```typescript
await auditLog({
  action: 'login',
  resource: 'auth',
  resourceId: userId,
  userId,
  tenantId,
  metadata: {
    method: 'bankid', // or 'demo'
    provider: 'nbid',
    returnTo: originalUrl,
  },
  ipAddress: request.ip,
  userAgent: request.headers['user-agent'],
});
```

### 6. Multi-Tenant Isolation

**EVERY query MUST include tenant_id:**

```typescript
// ✅ CORRECT - Tenant-scoped
const user = await db.select()
  .from(users)
  .where(
    and(
      eq(users.id, userId),
      eq(users.tenantId, tenantId) // REQUIRED
    )
  );

// ❌ WRONG - No tenant isolation
const user = await db.select()
  .from(users)
  .where(eq(users.id, userId));
```

---

## Deployment Checklist

Before deploying authentication changes:

- [ ] All tests passing (`pnpm test`, `pnpm test:e2e`)
- [ ] Database schemas created and tables migrated
- [ ] Environment variables set correctly
- [ ] Cookies configuration verified (domain, httpOnly, secure)
- [ ] CORS whitelist includes all frontend domains
- [ ] Demo users seeded in database
- [ ] Signicat credentials configured
- [ ] Audit logging tested
- [ ] Manual test: BankID login → dashboard
- [ ] Manual test: Demo login → dashboard
- [ ] Manual test: Logout → clears cookies
- [ ] Manual test: Session expiry → redirects to login
- [ ] PM2 restart after deployment
- [ ] Monitor logs for 10 minutes post-deployment

---

## Summary

🎉 **The authentication system is now STABLE and WORKING.**

**Key Points:**
1. ✅ BankID/ID-porten authentication works end-to-end
2. ✅ Demo login works for testing
3. ✅ HTTP-only cookies provide security
4. ✅ Cross-subdomain SSO enabled
5. ✅ Database schemas properly organized
6. ✅ Audit logging captures all auth events
7. ✅ Multi-tenant isolation enforced

**Hard Line:** Do not change the core authentication flow without explicit approval and comprehensive testing.

**Last Tested:** 2026-01-17
**Status:** ✅ PRODUCTION STABLE

---

**Questions or Issues?** Refer to the troubleshooting section or check audit logs for authentication events.
