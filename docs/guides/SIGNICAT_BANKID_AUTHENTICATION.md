# Signicat BankID Authentication - Complete Guide

**Status:** ✅ WORKING AND LOCKED
**Last Tested:** 2026-01-17
**Testing Frequency:** After every deployment
**DO NOT MODIFY WITHOUT APPROVAL**

---

## 🔒 CRITICAL: This Configuration is LOCKED

This authentication system took **4+ hours** to debug and get working. It is now **STABLE** and **TESTED**.

**DO NOT:**
- ❌ Change the API endpoints
- ❌ Modify cookie configuration
- ❌ Change redirect logic
- ❌ Update environment variables without testing
- ❌ Create new authentication controllers

**IF YOU NEED TO CHANGE SOMETHING:**
1. Read this entire document
2. Get explicit approval
3. Test thoroughly on staging first
4. Follow the deployment checklist

---

## ✅ Working Configuration (LOCKED)

### Environment Variables (Production)

```bash
# OAuth Token Endpoint (Tenant-specific)
IDPORTEN_BASE_URL=https://digilist.sandbox.signicat.com

# REST API Sessions Endpoint (Production API - NOT sandbox!)
# THIS IS THE KEY: Use production API even for sandbox auth
IDPORTEN_API_URL=https://api.signicat.com

# Callback URL
IDPORTEN_CALLBACK_URL=https://api.digilist.no/api/auth/idporten/callback

# Credentials
IDPORTEN_CLIENT_ID=sandbox-fantastic-house-812
IDPORTEN_CLIENT_SECRET=US1SxD0ett3Hczv00dOzdSxPyGjYK1PtbbDrXmMJLTVAkvlB
```

### Critical Files (DO NOT MODIFY)

1. **Controller:** `apps/api/src/modules/auth/idporten.controller.ts`
   - REST API implementation (NOT OIDC)
   - Endpoint: `/api/auth/idporten`
   - Single source of truth for authentication

2. **Session Service:** `apps/api/src/modules/auth/session.service.ts`
   - Session management
   - Cookie creation

3. **Cookie Config:** `apps/api/src/config/cookies.ts`
   - Cookie names: `dl_at`, `dl_rt`, `dl_csrf`
   - Domain: `.digilist.no` (cross-subdomain SSO)

4. **Frontend SDK:** `packages/client-sdk/src/services/idporten.service.ts`
   - Calls `/api/auth/idporten` (NOT `/api/auth/idporten-oidc`)
   - basePath: `/api/auth/idporten`

---

## 🎯 Key Insights (Lessons Learned)

### Insight #1: Production API for Sessions

**CRITICAL:** The REST API sessions endpoint is on the **production API**, even when using **sandbox credentials**.

```typescript
// ✅ CORRECT - Production API
const apiUrl = 'https://api.signicat.com/auth/rest/sessions';

// ❌ WRONG - Sandbox API (returns 404)
const apiUrl = 'https://api.sandbox.signicat.com/auth/rest/sessions';
```

**Why:** Signicat's architecture uses:
- **Tenant-specific URL** for OAuth token endpoint: `https://digilist.sandbox.signicat.com/oauth/token`
- **Production API** for REST session management: `https://api.signicat.com/auth/rest/sessions`

This is by design and documented in Signicat's REST API documentation.

### Insight #2: Single Controller Only

There should be **exactly ONE** authentication controller: `idporten.controller.ts`

**Removed duplicates:**
- ❌ `signicat.controller.ts` (alias name - caused confusion)
- ❌ `idporten-oidc.controller.ts` (different flow - not used by SDK)

**Why:** Multiple controllers caused:
- Confusion about which one is active
- Inconsistent behavior
- Maintenance nightmares
- Wasted debugging time

### Insight #3: Cookie Domain is Critical

Cookies MUST be set with domain `.digilist.no` (note the leading dot):

```typescript
// ✅ CORRECT - Cross-subdomain SSO
reply.setCookie('dl_at', token, {
  domain: '.digilist.no',  // Works for web.digilist.no, backoffice.digilist.no, etc.
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
});

// ❌ WRONG - No cross-subdomain
reply.setCookie('dl_at', token, {
  domain: 'api.digilist.no',  // Only works on API domain
});
```

### Insight #4: Redirect Must Preserve Full URL

Users must return to the **exact page** they were on before login:

```typescript
// ✅ CORRECT - Preserve full URL path
const redirectUrl = buildRedirectUrl(returnTo, {
  auth_success: 'true',
  auth_provider: 'bankid',
});
reply.redirect(redirectUrl);

// ❌ WRONG - Strip to origin only
const returnToUrl = new URL(returnTo);
const dashboardUrl = `${returnToUrl.origin}/`;  // Loses path!
reply.redirect(dashboardUrl);
```

**Example:**
- User is on: `https://backoffice.digilist.no/bookings/create/step-2`
- After login, redirect to: `https://backoffice.digilist.no/bookings/create/step-2?auth_success=true`
- NOT to: `https://backoffice.digilist.no/?auth_success=true`

---

## 🔄 Authentication Flow (Step-by-Step)

### 1. User Initiates Login

```
User clicks "Logg inn med BankID"
  ↓
Frontend calls: idPortenService.authorize(returnTo)
  ↓
GET https://api.digilist.no/api/auth/idporten/authorize?returnTo=https://backoffice.digilist.no/bookings/create
```

### 2. API Gets Access Token (OAuth)

```typescript
// POST https://digilist.sandbox.signicat.com/oauth/token
const tokenResponse = await fetch(`${config.tenantUrl}/oauth/token`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
  },
  body: 'grant_type=client_credentials&scope=openid',
});

const { access_token } = await tokenResponse.json();
```

### 3. API Creates BankID Session

```typescript
// POST https://api.signicat.com/auth/rest/sessions
// NOTE: Production API, NOT sandbox API!
const sessionResponse = await fetch('https://api.signicat.com/auth/rest/sessions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${access_token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    flow: 'redirect',
    include: ['name', 'nin'],
    language: 'nb',
    allowedProviders: ['nbid'],  // Norwegian BankID
  }),
});

const { id: sessionId, url: signicatUrl } = await sessionResponse.json();
```

### 4. User Redirected to Signicat/BankID

```
API redirects user to Signicat:
  ↓
GET https://digicat.sandbox.signicat.com/sessions/{sessionId}
  ↓
User completes BankID authentication
  ↓
Signicat redirects back to callback URL
```

### 5. API Handles Callback

```
GET https://api.digilist.no/api/auth/idporten/callback?state=...
  ↓
API verifies callback
  ↓
Creates user session in database (platform.sessions table)
  ↓
Creates/updates user in database (platform.users table)
  ↓
Logs audit event (compliance.audit_logs table)
```

### 6. API Sets Authentication Cookies

```typescript
// Set 3 HTTP-only cookies
reply.setCookie('dl_at', accessToken, {
  domain: '.digilist.no',
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  maxAge: 15 * 60,  // 15 minutes
});

reply.setCookie('dl_rt', refreshToken, {
  domain: '.digilist.no',
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60,  // 7 days
  path: '/api/auth/refresh',
});

reply.setCookie('dl_csrf', csrfToken, {
  domain: '.digilist.no',
  httpOnly: false,  // Readable by JS for double-submit pattern
  secure: true,
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60,  // 7 days
});
```

### 7. API Redirects to Frontend

```typescript
// Redirect to original URL with success flag
const redirectUrl = buildRedirectUrl(returnTo, {
  auth_success: 'true',
  auth_provider: 'bankid',
});

reply.redirect(redirectUrl);
// Example: https://backoffice.digilist.no/bookings/create?auth_success=true&auth_provider=bankid
```

### 8. Frontend Verifies Authentication

```typescript
// Frontend checks for auth_success query param
const searchParams = new URLSearchParams(window.location.search);
if (searchParams.get('auth_success') === 'true') {
  // Verify session with API
  const session = await idPortenService.getSession();

  if (session.user) {
    // User is authenticated!
    // Cookies are automatically sent with subsequent requests
  }
}
```

---

## 🧪 Testing Checklist

### Manual Testing (REQUIRED after deployment)

```bash
# 1. Test BankID Login Flow
✅ Navigate to: https://backoffice-test.digilist.no/
✅ Click "Logg inn med BankID"
✅ Complete BankID authentication in test mode
✅ Verify redirect back to backoffice
✅ Verify dashboard loads (not login page)
✅ Verify cookies set in browser dev tools:
   - dl_at (access token)
   - dl_rt (refresh token)
   - dl_csrf (CSRF token)
   - All have domain: .digilist.no

# 2. Test Session Persistence
✅ Refresh page
✅ Verify still authenticated (no redirect to login)
✅ Navigate to different page
✅ Verify still authenticated

# 3. Test Deep Link Preservation
✅ Navigate to: https://backoffice-test.digilist.no/bookings/create/step-2
✅ Click login (or trigger auth redirect)
✅ Complete BankID authentication
✅ Verify redirect to: https://backoffice-test.digilist.no/bookings/create/step-2
✅ NOT to: https://backoffice-test.digilist.no/

# 4. Test Logout
✅ Click "Logg ut"
✅ Verify redirect to login page
✅ Verify cookies cleared
✅ Verify cannot access protected pages

# 5. Test Cross-Subdomain SSO
✅ Login on backoffice.digilist.no
✅ Navigate to minside.digilist.no
✅ Verify automatically authenticated (cookies work cross-subdomain)
```

### Automated Testing

```typescript
// E2E test in Playwright
test('BankID authentication flow', async ({ page }) => {
  // Navigate to app
  await page.goto('https://backoffice-test.digilist.no/');

  // Click login
  await page.click('button:has-text("Logg inn med BankID")');

  // Wait for redirect to Signicat
  await page.waitForURL(/signicat\.com/);

  // Complete BankID (test mode)
  // ... mock BankID interaction ...

  // Wait for redirect back
  await page.waitForURL(/backoffice-test\.digilist\.no/);

  // Verify authenticated
  const cookies = await page.context().cookies();
  expect(cookies.find(c => c.name === 'dl_at')).toBeTruthy();
  expect(cookies.find(c => c.name === 'dl_at')?.domain).toBe('.digilist.no');

  // Verify dashboard loads
  await expect(page.locator('h1')).toContainText('Dashboard');
});
```

---

## 🚨 Troubleshooting

### Problem: "session_creation_failed" 404 Error

**Symptoms:**
```json
{
  "error": "session_creation_failed",
  "message": "Failed to create authentication session",
  "details": "<!DOCTYPE html>...Not found..."
}
```

**Root Cause:** Using sandbox API URL instead of production API URL

**Solution:**
```bash
# Check environment variable
ssh root@api.digilist.no "pm2 env 0 | grep IDPORTEN_API_URL"

# Should be:
IDPORTEN_API_URL: https://api.signicat.com

# If it shows sandbox URL, fix it:
ssh root@api.digilist.no "sed -i \"s|api.sandbox.signicat.com|api.signicat.com|g\" /var/www/digilist-api/ecosystem.config.cjs"
ssh root@api.digilist.no "pm2 restart digilist-api --update-env"
```

### Problem: Redirects to Login After Authentication

**Symptoms:**
- BankID authentication completes successfully
- User redirected back to app
- Immediately redirected to login page again

**Possible Causes:**

1. **Cookies not set with correct domain**
   ```bash
   # Check cookie domain in browser dev tools
   # Should be: .digilist.no (with leading dot)
   # NOT: api.digilist.no or backoffice.digilist.no
   ```

2. **Session not created in database**
   ```sql
   -- Check if sessions table exists in correct schema
   SELECT * FROM platform.sessions ORDER BY created_at DESC LIMIT 5;

   -- If table doesn't exist or is empty, check database schema
   SELECT schemaname, tablename FROM pg_tables
   WHERE schemaname = 'platform' AND tablename = 'sessions';
   ```

3. **Frontend not sending cookies**
   ```typescript
   // Check API calls in network tab
   // Request headers should include: Cookie: dl_at=...; dl_rt=...
   ```

### Problem: "invalid_client" Error

**Symptoms:**
```json
{
  "error": "invalid_client",
  "error_uri": "https://api.signicat.com/auth/open/config/errors/invalid_client"
}
```

**Root Cause:** Wrong client ID or client secret

**Solution:**
```bash
# Verify credentials in PM2 config
ssh root@api.digilist.no "pm2 env 0 | grep IDPORTEN_CLIENT"

# Should be:
IDPORTEN_CLIENT_ID: sandbox-fantastic-house-812
IDPORTEN_CLIENT_SECRET: US1SxD0ett3Hczv00dOzdSxPyGjYK1PtbbDrXmMJLTVAkvlB
```

### Problem: User Not Redirected to Original Page

**Symptoms:**
- User was on `/bookings/create/step-2`
- After login, redirected to `/` (root)
- Loses progress in workflow

**Root Cause:** Redirect logic strips URL path

**Solution:**
Check `apps/api/src/modules/auth/idporten.controller.ts` callback handler:

```typescript
// ✅ CORRECT
const redirectUrl = buildRedirectUrl(returnTo, {
  auth_success: 'true',
  auth_provider: 'bankid',
});

// ❌ WRONG
const returnToUrl = new URL(returnTo);
const dashboardUrl = `${returnToUrl.origin}/`;  // Strips path!
```

---

## 📊 Monitoring

### API Logs

```bash
# Check authentication logs
ssh root@api.digilist.no "pm2 logs digilist-api | grep -i 'SIGNICAT\|IDPORTEN\|AUTH'"

# Key log messages to look for:
# ✅ "[ID-PORTEN TOKEN] ✅ Access token received successfully"
# ✅ "[SIGNICAT SESSION] ✅ Session created successfully"
# ✅ "[AUTH] User authenticated via BankID"
# ❌ "[ERROR] session_creation_failed"
# ❌ "[ERROR] invalid_client"
```

### Database Monitoring

```sql
-- Check recent authentication sessions
SELECT
  u.email,
  s.created_at,
  s.expires_at,
  s.user_agent
FROM platform.sessions s
JOIN platform.users u ON u.id = s.user_id
ORDER BY s.created_at DESC
LIMIT 10;

-- Check authentication audit logs
SELECT
  action,
  user_id,
  created_at,
  metadata
FROM compliance.audit_logs
WHERE action = 'login'
ORDER BY created_at DESC
LIMIT 10;
```

### Browser Monitoring

```javascript
// Check cookies in browser console
document.cookie.split(';').forEach(c => console.log(c.trim()));

// Should show:
// dl_at=eyJ...
// dl_rt=eyJ...
// dl_csrf=...

// Check cookie properties (dev tools → Application → Cookies)
// Domain: .digilist.no
// Path: / (for dl_at and dl_csrf), /api/auth/refresh (for dl_rt)
// HttpOnly: true (for dl_at and dl_rt), false (for dl_csrf)
// Secure: true
// SameSite: Lax
```

---

## 🔐 Security Considerations

### HTTP-Only Cookies

Tokens are stored in HTTP-only cookies to prevent XSS attacks:

```typescript
// Access token (short-lived, 15 minutes)
httpOnly: true,  // Cannot be accessed by JavaScript
secure: true,    // HTTPS only
sameSite: 'lax', // CSRF protection

// Refresh token (long-lived, 7 days)
httpOnly: true,
secure: true,
sameSite: 'lax',
path: '/api/auth/refresh',  // Path-scoped for additional security

// CSRF token (readable by JS for double-submit pattern)
httpOnly: false,  // Needs to be readable for CSRF validation
secure: true,
sameSite: 'lax',
```

### Token Rotation

Refresh tokens are rotated on use:

```typescript
// When refresh token is used, issue new access token + new refresh token
POST /api/auth/refresh
  ↓
Validate old refresh token
  ↓
Generate new access token (15 min expiry)
  ↓
Generate new refresh token (7 day expiry)
  ↓
Invalidate old refresh token
```

### Session Management

Sessions are stored in database with expiration:

```sql
CREATE TABLE platform.sessions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES platform.users(id),
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  user_agent TEXT,
  ip_address TEXT
);

-- Expired sessions are automatically cleaned up
DELETE FROM platform.sessions WHERE expires_at < NOW();
```

---

## 📝 Configuration Reference

### Complete PM2 Ecosystem Config

```javascript
// /var/www/digilist-api/ecosystem.config.cjs
module.exports = {
  apps: [{
    name: 'digilist-api',
    script: './dist/main.js',
    cwd: '/var/www/digilist-api',
    env_production: {
      NODE_ENV: 'production',
      API_PORT: 4000,
      API_HOST: '0.0.0.0',
      API_BASE_URL: 'https://api.digilist.no',

      // Database
      DATABASE_URL: 'postgresql://digilist:***@localhost:5432/digilist_prod',

      // Security
      JWT_SECRET: '***',
      JWT_REFRESH_SECRET: '***',
      CSRF_SECRET: '***',
      SESSION_SECRET: '***',

      // ID-porten / BankID Authentication (LOCKED CONFIG)
      IDPORTEN_BASE_URL: 'https://digilist.sandbox.signicat.com',
      IDPORTEN_API_URL: 'https://api.signicat.com',  // PRODUCTION API!
      IDPORTEN_CALLBACK_URL: 'https://api.digilist.no/api/auth/idporten/callback',
      IDPORTEN_CLIENT_ID: 'sandbox-fantastic-house-812',
      IDPORTEN_CLIENT_SECRET: 'US1SxD0ett3Hczv00dOzdSxPyGjYK1PtbbDrXmMJLTVAkvlB',

      // CORS
      CORS_ORIGIN: 'https://web.digilist.no,https://backoffice.digilist.no,https://minside.digilist.no',
    },
  }],
};
```

### Nginx Configuration

```nginx
# /etc/nginx/sites-available/api.digilist.no
server {
    listen 443 ssl http2;
    server_name api.digilist.no;

    ssl_certificate /etc/letsencrypt/live/api.digilist.no/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.digilist.no/privkey.pem;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🎯 Deployment Checklist

### Before Deployment

- [ ] Read this entire guide
- [ ] Verify database schemas exist (`platform`, `domain`, `compliance`)
- [ ] Verify environment variables in PM2 config
- [ ] Test on staging first
- [ ] Have rollback plan ready

### During Deployment

```bash
# 1. Build API
cd /Volumes/Laravel/Xala-SAAS/tools/xala-digdir-monorepo
pnpm -F @digilist/api build

# 2. Deploy to VPS
rsync -avz --delete apps/api/dist/ root@api.digilist.no:/var/www/digilist-api/dist/

# 3. Restart with environment variables
ssh root@api.digilist.no "pm2 restart digilist-api --update-env"

# 4. Verify API is running
ssh root@api.digilist.no "pm2 logs digilist-api --lines 20"

# 5. Check environment variables loaded
ssh root@api.digilist.no "pm2 env 0 | grep IDPORTEN"
```

### After Deployment (CRITICAL)

- [ ] Test BankID login flow (manual test required)
- [ ] Verify cookies set with correct domain
- [ ] Test deep link preservation
- [ ] Check API logs for errors
- [ ] Test logout
- [ ] Monitor for 10 minutes

### Rollback Plan

```bash
# If authentication breaks after deployment:

# 1. Check what changed
git diff HEAD~1 apps/api/src/modules/auth/

# 2. Revert to previous version
git checkout HEAD~1 apps/api/src/modules/auth/
pnpm -F @digilist/api build
rsync -avz --delete apps/api/dist/ root@api.digilist.no:/var/www/digilist-api/dist/
ssh root@api.digilist.no "pm2 restart digilist-api"

# 3. Test authentication works again
# 4. Fix issue in separate branch
# 5. Test thoroughly before redeploying
```

---

## 📚 References

- **Signicat Documentation:** https://developer.signicat.com/docs/connect-to-signicat-apis/quick-start-guide/
- **BankID Norway:** https://www.bankid.no/
- **ID-porten:** https://docs.digdir.no/docs/idporten/
- **Authentication System Architecture:** `docs/architecture/AUTHENTICATION_SYSTEM.md`
- **Lessons Learned:** `docs/operations/LESSONS_LEARNED_AUTH_FIX_2026-01-17.md`

---

## ✅ Success Criteria

Authentication is working if ALL of these are true:

1. ✅ User can complete BankID authentication
2. ✅ User redirected back to original page (not root)
3. ✅ Three cookies set with domain `.digilist.no`
4. ✅ Session persists across page refreshes
5. ✅ Cross-subdomain SSO works
6. ✅ Logout clears cookies
7. ✅ No errors in API logs
8. ✅ No errors in browser console
9. ✅ Session stored in database
10. ✅ Audit log created

---

**Last Updated:** 2026-01-17
**Status:** ✅ WORKING
**Next Test:** After every deployment
**Maintainer:** Development Team
**Escalation:** If authentication breaks, check this guide first, then escalate.
