# Authentication System Testing Guide

**Created:** 2026-01-16
**Status:** Production Testing
**Scope:** All 5 applications (web, backoffice, minside, saas-admin, tenant-admin)

---

## Table of Contents

1. [Demo Login Testing](#demo-login-testing)
2. [OAuth Login Testing](#oauth-login-testing)
3. [Session Validation Testing](#session-validation-testing)
4. [Logout Testing](#logout-testing)
5. [Role-Based Access Control Testing](#role-based-access-control-testing)
6. [Protected Routes Testing](#protected-routes-testing)
7. [Cross-Tab Synchronization Testing](#cross-tab-synchronization-testing)
8. [API Endpoint Testing](#api-endpoint-testing)
9. [Error Handling Testing](#error-handling-testing)
10. [Automated Test Scripts](#automated-test-scripts)

---

## Demo Login Testing

### Available Demo Tokens

All demo tokens are seeded in the database via `apps/api/src/database/seeds/demo-login-users.seed.ts`.

#### Backoffice App

| Email | Demo Token | Role | Tenant |
|-------|-----------|------|--------|
| ola.nordmann@digilist.no | `demo-backoffice-super-admin-001` | super_admin | Trondheim |
| kari.hansen@digilist.no | `demo-backoffice-admin-002` | admin | Trondheim |
| per.olsen@digilist.no | `demo-backoffice-case-handler-003` | case_handler | Trondheim |

#### Minside App

| Email | Demo Token | Role | Tenant |
|-------|-----------|------|--------|
| lars.andersen@example.com | `demo-minside-user-001` | citizen | Trondheim |
| emma.pedersen@example.com | `demo-minside-user-002` | citizen | Oslo |

#### SaaS Admin App

| Email | Demo Token | Role | Tenant |
|-------|-----------|------|--------|
| admin@digilist.no | `demo-saas-admin-super-admin-001` | super_admin | platform |
| support@digilist.no | `demo-saas-admin-admin-002` | admin | platform |

#### Tenant Admin App

| Email | Demo Token | Role | Tenant |
|-------|-----------|------|--------|
| kristine.johnsen@trondheim.kommune.no | `demo-tenant-admin-admin-001` | tenant_admin | Trondheim |
| ole.hansen@oslo.kommune.no | `demo-tenant-admin-admin-002` | tenant_admin | Oslo |

#### Multi-App Access

| Email | Demo Token | Role | Apps |
|-------|-----------|------|------|
| test.fullaccess@digilist.no | `demo-all-apps-super-admin-001` | super_admin | All 5 apps |
| test.backoffice@digilist.no | `demo-backoffice-web-minside-001` | admin | backoffice, web, minside |

### Manual Demo Login Testing

#### Test 1: Backoffice Demo Login

1. Navigate to https://backoffice-test.digilist.no
2. Click "Demo Login" button
3. Enter token: `demo-backoffice-super-admin-001`
4. Click "Continue"

**Expected Result:**
- ✅ Redirected to `/dashboard`
- ✅ User profile shows: Ola Nordmann
- ✅ Role shows: super_admin
- ✅ Tenant shows: Trondheim Kommune
- ✅ localStorage contains `backoffice_user`
- ✅ Session cookie is set (check DevTools → Application → Cookies)

**Browser Console Verification:**
```javascript
// Check localStorage
JSON.parse(localStorage.getItem('backoffice_user'))

// Check cookies
document.cookie.split(';').find(c => c.includes('session'))
```

#### Test 2: Minside Demo Login

1. Navigate to https://minside-test.digilist.no
2. Click "Demo Login"
3. Enter token: `demo-minside-user-001`
4. Click "Continue"

**Expected Result:**
- ✅ Redirected to `/dashboard`
- ✅ User profile shows: Lars Andersen
- ✅ Role shows: citizen
- ✅ localStorage contains `minside_user`
- ✅ Session cookie is set

#### Test 3: SaaS Admin Demo Login

1. Navigate to https://saas-admin.digilist.no
2. Enter token: `demo-saas-admin-super-admin-001`
3. Click "Continue"

**Expected Result:**
- ✅ Redirected to `/dashboard`
- ✅ User profile shows: Admin User
- ✅ Role shows: super_admin
- ✅ localStorage contains `saas-admin_user`

#### Test 4: Tenant Admin Demo Login

1. Navigate to https://tenant-admin.digilist.no
2. Enter token: `demo-tenant-admin-admin-001`
3. Click "Continue"

**Expected Result:**
- ✅ Redirected to `/dashboard`
- ✅ User profile shows: Kristine Johnsen
- ✅ Role shows: tenant_admin
- ✅ Tenant shows: Trondheim Kommune
- ✅ localStorage contains `tenant-admin_user`

#### Test 5: Multi-App Access

1. Login to backoffice with `demo-all-apps-super-admin-001`
2. Open new tab → https://minside-test.digilist.no
3. Should auto-login (SSO via cookie domain `.digilist.no`)

**Expected Result:**
- ✅ No login prompt in minside
- ✅ Automatically authenticated
- ✅ User profile shows: Test Full Access
- ✅ Same session cookie across both apps

---

## OAuth Login Testing

### ID-porten (Norwegian eID)

**Apps:** backoffice, minside

#### Test 1: Backoffice ID-porten Login

1. Navigate to https://backoffice-test.digilist.no/login
2. Click "Logg inn med ID-porten"
3. Authenticate with test user credentials

**Expected Flow:**
1. Redirect to `https://idporten.test.no/authorize?...`
2. User authenticates
3. Redirect back to `https://backoffice-test.digilist.no/auth/callback?code=...`
4. Backend exchanges code for access token
5. Backend creates session and sets HTTP-only cookie
6. Frontend redirected to `/dashboard`

**Expected Result:**
- ✅ User authenticated
- ✅ Session cookie set
- ✅ User data stored in localStorage
- ✅ Audit log entry created

**Verify OAuth Config:**
```bash
# Check environment variables
cat apps/backoffice/.env.production | grep IDPORTEN

# Expected:
VITE_IDPORTEN_CLIENT_ID=your-client-id
VITE_IDPORTEN_REDIRECT_URI=https://backoffice-test.digilist.no/auth/callback
```

#### Test 2: Minside ID-porten Login

Same steps as backoffice, but with URL: https://minside-test.digilist.no

### Microsoft OAuth (Azure AD)

**Apps:** saas-admin, tenant-admin

#### Test 1: SaaS Admin Microsoft Login

1. Navigate to https://saas-admin.digilist.no/login
2. Click "Logg inn med Microsoft"
3. Authenticate with Microsoft credentials

**Expected Flow:**
1. Redirect to `https://login.microsoftonline.com/...`
2. User authenticates
3. Redirect back to callback URL
4. Session created
5. Redirected to dashboard

**Verify OAuth Config:**
```bash
# Check environment variables
cat apps/saas-admin/.env.production | grep MICROSOFT

# Expected:
VITE_MICROSOFT_CLIENT_ID=your-client-id
VITE_MICROSOFT_REDIRECT_URI=https://saas-admin.digilist.no/auth/callback
```

#### Test 2: Tenant Admin Microsoft Login

Same steps as saas-admin, but with URL: https://tenant-admin.digilist.no

---

## Session Validation Testing

### Test 1: Session Persistence on Page Reload

1. Login to any app with demo token
2. Reload the page (F5)

**Expected Result:**
- ✅ User remains authenticated
- ✅ No redirect to /login
- ✅ GET `/api/auth/session` returns 200 OK
- ✅ User data loaded from localStorage

**Browser Console:**
```javascript
// Before reload - check session
fetch('https://api.digilist.no/api/auth/session', { credentials: 'include' })
  .then(r => r.json())
  .then(console.log)
```

### Test 2: Session Expiry

1. Login to any app
2. Wait for session to expire (default: 7 days)
3. Reload page

**Expected Result:**
- ✅ GET `/api/auth/session` returns 401 Unauthorized
- ✅ User redirected to `/login`
- ✅ localStorage cleared
- ✅ Access denied message shown

### Test 3: Invalid Session Cookie

1. Login to any app
2. Open DevTools → Application → Cookies
3. Delete or modify the session cookie
4. Reload page

**Expected Result:**
- ✅ GET `/api/auth/session` returns 401 Unauthorized
- ✅ User redirected to `/login`
- ✅ localStorage cleared

### Test 4: Cross-Domain Session (SSO)

1. Login to backoffice-test.digilist.no
2. Open new tab → minside-test.digilist.no
3. Check if session is shared

**Expected Result:**
- ✅ Session cookie domain is `.digilist.no`
- ✅ User authenticated in minside without login
- ✅ Same session ID across both apps

**Note:** SSO only works if cookie domain is configured correctly.

---

## Logout Testing

### Test 1: Standard Logout

1. Login to backoffice
2. Click "Logg ut" button
3. Confirm logout

**Expected Result:**
- ✅ POST `/api/auth/logout` returns 200 OK
- ✅ Session cookie cleared
- ✅ localStorage `backoffice_user` cleared
- ✅ Redirected to `/login`
- ✅ Audit log entry created

**Browser Console Verification:**
```javascript
// After logout
localStorage.getItem('backoffice_user') // null
document.cookie.includes('session') // false
```

### Test 2: Cross-Tab Logout Synchronization

1. Login to backoffice in Tab 1
2. Open backoffice in Tab 2
3. Logout in Tab 1
4. Switch to Tab 2

**Expected Result:**
- ✅ Tab 2 detects logout via storage event
- ✅ Tab 2 automatically redirects to `/login`
- ✅ Both tabs show logged out state

**Implementation Check:**
```typescript
// packages/auth/src/providers/AuthProvider.tsx lines 150-160
useEffect(() => {
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === storageKey && event.newValue === null) {
      // User logged out in another tab
      setUser(null);
      window.location.href = config.loginRedirect || '/login';
    }
  };
  window.addEventListener('storage', handleStorageChange);
  return () => window.removeEventListener('storage', handleStorageChange);
}, [config.loginRedirect, storageKey]);
```

### Test 3: Logout with Flow Context

1. Login to minside
2. Navigate to `/booking/123/payment` (mid-flow)
3. Logout
4. Login again

**Expected Result:**
- ✅ Logout clears flow context
- ✅ User redirected to `/login` (not back to payment page)
- ✅ After login, user redirected to `/dashboard` (not payment page)

**Note:** Flow context is intentionally cleared on logout for security.

---

## Role-Based Access Control Testing

### Test 1: Correct Role Access

**Backoffice - Allowed Roles:** admin, saksbehandler, super_admin, case_handler

1. Login with `demo-backoffice-super-admin-001`

**Expected Result:**
- ✅ Access granted
- ✅ Redirected to `/dashboard`
- ✅ No access denied message

### Test 2: Wrong Role Access

**Backoffice - Disallowed Role:** citizen

1. Login with `demo-minside-user-001` (role: citizen)
2. Navigate to https://backoffice-test.digilist.no

**Expected Result:**
- ✅ Access denied message shown
- ✅ Redirected to `/access-denied`
- ✅ Error message: "Du har ikke tilgang til denne applikasjonen"
- ✅ Suggested action: "Be din administrator om tilgang"

**Browser Console:**
```javascript
// Check AuthProvider state
// Should show accessDeniedError
```

### Test 3: Role Matrix Verification

| App | Allowed Roles |
|-----|---------------|
| minside | citizen, admin, super_admin |
| backoffice | admin, saksbehandler, super_admin, case_handler |
| saas-admin | super_admin, admin |
| tenant-admin | tenant_admin, admin, super_admin |
| web | (all authenticated users) |

**Test Each:**
1. Use demo tokens with different roles
2. Verify access granted/denied correctly

### Test 4: Backoffice grantedRoles Logic

**Special Case:** Backoffice checks both `user.role` AND `user.grantedRoles[]`

1. Login with user that has:
   - `role: "tenant_admin"`
   - `grantedRoles: ["case_handler"]`
2. Navigate to backoffice

**Expected Result:**
- ✅ Access granted (grantedRoles contains case_handler)
- ✅ User can access backoffice features

**Implementation Check:**
```typescript
// packages/auth/src/providers/AuthProvider.tsx lines 80-90
const hasRequiredRole = useCallback((user: User): boolean => {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  const userHasRole = allowedRoles.includes(user.role);

  // For backoffice, also check grantedRoles
  if (config.appType === 'backoffice' && user.grantedRoles) {
    const grantedRoleMatch = user.grantedRoles.some(grantedRole =>
      allowedRoles.includes(grantedRole as UserRole)
    );
    return userHasRole || grantedRoleMatch;
  }
  return userHasRole;
}, [allowedRoles, config.appType]);
```

---

## Protected Routes Testing

### Test 1: Unauthenticated Access

1. Open incognito window
2. Navigate to https://backoffice-test.digilist.no/dashboard

**Expected Result:**
- ✅ Redirected to `/login`
- ✅ URL shows: `/login?returnTo=/dashboard`
- ✅ After login, redirected to `/dashboard`

### Test 2: Flow Context Preservation

**Minside Booking Flow:**

1. Logout (if logged in)
2. Navigate to https://minside-test.digilist.no/booking/123/confirm
3. Should redirect to `/login?returnTo=/booking/123/confirm&flowContext=booking-123`
4. Login with demo token
5. Should redirect back to `/booking/123/confirm`

**Expected Result:**
- ✅ Flow context preserved during auth
- ✅ User returns to booking confirmation after login
- ✅ Booking data still available

**Implementation Check:**
```typescript
// packages/auth/src/components/ProtectedRoute.tsx
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <LoadingSpinner />;

  if (!user) {
    const returnTo = location.pathname + location.search;
    return <Navigate to={`/login?returnTo=${encodeURIComponent(returnTo)}`} replace />;
  }

  return <>{children}</>;
}
```

### Test 3: Role-Based Route Protection

**Backoffice Admin-Only Route:**

1. Login with `demo-backoffice-case-handler-003` (role: case_handler)
2. Navigate to `/admin/users` (super_admin only)

**Expected Result:**
- ✅ Access denied
- ✅ Redirected to `/forbidden`
- ✅ Error message shown

**Implementation:** Handled by `@digilist/client-sdk` permission checks

---

## Cross-Tab Synchronization Testing

### Test 1: Login Synchronization

1. Open backoffice in Tab 1 (logged out)
2. Open backoffice in Tab 2
3. Login in Tab 1
4. Switch to Tab 2

**Expected Result:**
- ✅ Tab 2 detects login via storage event
- ✅ Tab 2 automatically updates user state
- ✅ Both tabs show logged in state

**Note:** Current implementation does NOT sync login (only logout). This is by design to avoid race conditions.

### Test 2: Logout Synchronization

1. Open backoffice in Tab 1 (logged in)
2. Open backoffice in Tab 2
3. Logout in Tab 1
4. Switch to Tab 2

**Expected Result:**
- ✅ Tab 2 detects logout immediately
- ✅ Tab 2 redirects to `/login`
- ✅ Both tabs show logged out state

### Test 3: Session Expiry Synchronization

1. Open backoffice in Tab 1
2. Wait for session to expire
3. Tab 1 shows session expired error
4. Switch to Tab 2

**Expected Result:**
- ✅ Tab 2 also detects expired session
- ✅ Tab 2 redirects to `/login`

---

## API Endpoint Testing

### cURL Commands for Manual Testing

#### 1. Demo Login

```bash
# Backoffice demo login
curl -X POST https://api.digilist.no/api/auth/demo/login \
  -H "Content-Type: application/json" \
  -d '{
    "token": "demo-backoffice-super-admin-001",
    "app": "backoffice"
  }' \
  -c cookies.txt \
  -v

# Expected response:
# HTTP/1.1 200 OK
# Set-Cookie: session=...; HttpOnly; Secure; SameSite=None; Domain=.digilist.no
# {
#   "data": {
#     "user": {
#       "id": "...",
#       "name": "Ola Nordmann",
#       "email": "ola.nordmann@digilist.no",
#       "role": "super_admin",
#       "tenantId": "..."
#     },
#     "expiresAt": "2026-01-23T...",
#     "permissions": [...]
#   }
# }
```

#### 2. Session Validation

```bash
# Get current session
curl https://api.digilist.no/api/auth/session \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -v

# Expected response (authenticated):
# HTTP/1.1 200 OK
# {
#   "data": {
#     "user": { ... },
#     "expiresAt": "...",
#     "permissions": [...]
#   }
# }

# Expected response (unauthenticated):
# HTTP/1.1 401 Unauthorized
# {
#   "error": {
#     "code": "UNAUTHORIZED",
#     "message": "No active session"
#   }
# }
```

#### 3. Logout

```bash
# Logout
curl -X POST https://api.digilist.no/api/auth/logout \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -v

# Expected response:
# HTTP/1.1 200 OK
# Set-Cookie: session=; Expires=Thu, 01 Jan 1970 00:00:00 GMT
# {
#   "data": {
#     "success": true
#   }
# }
```

#### 4. OAuth Callback

```bash
# ID-porten callback (simulated)
curl https://api.digilist.no/api/auth/idporten/callback?code=ABC123&state=XYZ \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -v

# Expected response:
# HTTP/1.1 302 Found
# Location: https://backoffice-test.digilist.no/dashboard
# Set-Cookie: session=...; HttpOnly; Secure
```

### Test Script for All Endpoints

```bash
#!/bin/bash

# Test script for authentication endpoints
# Save as: scripts/test-auth-endpoints.sh

API_BASE="https://api.digilist.no"
COOKIE_FILE="test-cookies.txt"

echo "======================================"
echo "Authentication Endpoints Test Suite"
echo "======================================"
echo ""

# Test 1: Demo Login
echo "[TEST 1] Demo Login (Backoffice)"
RESPONSE=$(curl -s -X POST "${API_BASE}/api/auth/demo/login" \
  -H "Content-Type: application/json" \
  -d '{"token":"demo-backoffice-super-admin-001","app":"backoffice"}' \
  -c "${COOKIE_FILE}" \
  -w "\nHTTP_CODE:%{http_code}")

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | grep -v "HTTP_CODE")

if [ "$HTTP_CODE" == "200" ]; then
  echo "✅ PASS - HTTP 200"
  echo "Response: $BODY"
else
  echo "❌ FAIL - HTTP $HTTP_CODE"
  echo "Response: $BODY"
fi
echo ""

# Test 2: Session Validation
echo "[TEST 2] Session Validation"
RESPONSE=$(curl -s "${API_BASE}/api/auth/session" \
  -b "${COOKIE_FILE}" \
  -w "\nHTTP_CODE:%{http_code}")

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | grep -v "HTTP_CODE")

if [ "$HTTP_CODE" == "200" ]; then
  echo "✅ PASS - HTTP 200"
  echo "Response: $BODY"
else
  echo "❌ FAIL - HTTP $HTTP_CODE"
  echo "Response: $BODY"
fi
echo ""

# Test 3: Logout
echo "[TEST 3] Logout"
RESPONSE=$(curl -s -X POST "${API_BASE}/api/auth/logout" \
  -b "${COOKIE_FILE}" \
  -w "\nHTTP_CODE:%{http_code}")

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | grep -v "HTTP_CODE")

if [ "$HTTP_CODE" == "200" ]; then
  echo "✅ PASS - HTTP 200"
  echo "Response: $BODY"
else
  echo "❌ FAIL - HTTP $HTTP_CODE"
  echo "Response: $BODY"
fi
echo ""

# Test 4: Session After Logout (Should be 401)
echo "[TEST 4] Session After Logout (Expected: 401)"
RESPONSE=$(curl -s "${API_BASE}/api/auth/session" \
  -b "${COOKIE_FILE}" \
  -w "\nHTTP_CODE:%{http_code}")

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | grep -v "HTTP_CODE")

if [ "$HTTP_CODE" == "401" ]; then
  echo "✅ PASS - HTTP 401 (Correctly unauthenticated)"
  echo "Response: $BODY"
else
  echo "❌ FAIL - HTTP $HTTP_CODE (Expected 401)"
  echo "Response: $BODY"
fi
echo ""

# Cleanup
rm -f "${COOKIE_FILE}"

echo "======================================"
echo "Test Suite Complete"
echo "======================================"
```

**Run the test script:**
```bash
chmod +x scripts/test-auth-endpoints.sh
./scripts/test-auth-endpoints.sh
```

---

## Error Handling Testing

### Test 1: Invalid Demo Token

```bash
curl -X POST https://api.digilist.no/api/auth/demo/login \
  -H "Content-Type: application/json" \
  -d '{"token":"invalid-token-123","app":"backoffice"}' \
  -v
```

**Expected Response:**
```json
{
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Invalid demo token",
    "status": 401
  }
}
```

### Test 2: Expired Session

1. Login with demo token
2. Wait for session to expire
3. Make API request

**Expected Response:**
```json
{
  "error": {
    "code": "SESSION_EXPIRED",
    "message": "Your session has expired. Please login again.",
    "status": 401
  }
}
```

### Test 3: Access Denied (Wrong Role)

1. Login with citizen role
2. Navigate to backoffice

**Expected UI:**
- Access denied page shown
- Error message: "Du har ikke tilgang til denne applikasjonen"
- Suggested action: "Be din administrator om tilgang"

### Test 4: Network Error

1. Disconnect internet
2. Attempt to login

**Expected UI:**
- Error toast shown
- Message: "Kunne ikke koble til server. Sjekk nettverkstilkoblingen."

---

## Automated Test Scripts

### Playwright E2E Test: Demo Login Flow

Save as: `tests/e2e/auth/demo-login.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Demo Login Flow', () => {
  test('should login successfully with valid demo token', async ({ page }) => {
    // Navigate to backoffice
    await page.goto('https://backoffice-test.digilist.no');

    // Wait for login page
    await expect(page).toHaveURL(/\/login/);

    // Click Demo Login button
    await page.click('text=Demo Login');

    // Enter demo token
    await page.fill('input[name="token"]', 'demo-backoffice-super-admin-001');

    // Click Continue
    await page.click('button:has-text("Continue")');

    // Wait for redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);

    // Verify user is logged in
    const userProfile = await page.textContent('[data-testid="user-profile"]');
    expect(userProfile).toContain('Ola Nordmann');

    // Verify localStorage
    const storageUser = await page.evaluate(() =>
      localStorage.getItem('backoffice_user')
    );
    expect(storageUser).toBeTruthy();

    // Verify session cookie
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(c => c.name === 'session');
    expect(sessionCookie).toBeDefined();
    expect(sessionCookie?.httpOnly).toBe(true);
    expect(sessionCookie?.secure).toBe(true);
  });

  test('should show error with invalid demo token', async ({ page }) => {
    await page.goto('https://backoffice-test.digilist.no/login');

    await page.click('text=Demo Login');
    await page.fill('input[name="token"]', 'invalid-token-123');
    await page.click('button:has-text("Continue")');

    // Wait for error message
    await expect(page.locator('text=Invalid demo token')).toBeVisible();
  });
});
```

### Playwright E2E Test: Logout Flow

Save as: `tests/e2e/auth/logout.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Logout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('https://backoffice-test.digilist.no/login');
    await page.click('text=Demo Login');
    await page.fill('input[name="token"]', 'demo-backoffice-super-admin-001');
    await page.click('button:has-text("Continue")');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should logout successfully', async ({ page }) => {
    // Click logout button
    await page.click('[data-testid="user-menu"]');
    await page.click('text=Logg ut');

    // Wait for redirect to login
    await expect(page).toHaveURL(/\/login/);

    // Verify localStorage cleared
    const storageUser = await page.evaluate(() =>
      localStorage.getItem('backoffice_user')
    );
    expect(storageUser).toBeNull();

    // Verify session cookie cleared
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(c => c.name === 'session');
    expect(sessionCookie).toBeUndefined();
  });

  test('should sync logout across tabs', async ({ context }) => {
    const page1 = await context.newPage();
    const page2 = await context.newPage();

    // Login in page1
    await page1.goto('https://backoffice-test.digilist.no/login');
    await page1.click('text=Demo Login');
    await page1.fill('input[name="token"]', 'demo-backoffice-super-admin-001');
    await page1.click('button:has-text("Continue")');
    await expect(page1).toHaveURL(/\/dashboard/);

    // Open page2 (should be logged in via SSO)
    await page2.goto('https://backoffice-test.digilist.no/dashboard');
    await expect(page2).toHaveURL(/\/dashboard/);

    // Logout in page1
    await page1.click('[data-testid="user-menu"]');
    await page1.click('text=Logg ut');

    // Wait a bit for storage event
    await page2.waitForTimeout(1000);

    // page2 should redirect to login
    await expect(page2).toHaveURL(/\/login/);
  });
});
```

### Vitest Unit Test: Auth Hook

Save as: `packages/auth/src/hooks/useAuth.test.ts`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from './useAuth';
import { AuthProvider } from '../providers/AuthProvider';

describe('useAuth', () => {
  it('should return null user when not authenticated', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider config={{ appType: 'backoffice' }}>
        {children}
      </AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should login with demo token', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider config={{ appType: 'backoffice' }}>
        {children}
      </AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Mock API call
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          data: {
            user: {
              id: '1',
              name: 'Test User',
              email: 'test@example.com',
              role: 'admin',
            },
          },
        }),
      })
    ) as any;

    await result.current.loginWithDemo('demo-token-123');

    await waitFor(() => {
      expect(result.current.user).toBeTruthy();
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  it('should logout successfully', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider config={{ appType: 'backoffice' }}>
        {children}
      </AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Login first
    await result.current.loginWithDemo('demo-token-123');

    // Logout
    await result.current.logout();

    await waitFor(() => {
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });
});
```

---

## Testing Checklist

Use this checklist to systematically test all authentication functionality:

### Demo Login

- [ ] Backoffice demo login works with correct token
- [ ] Backoffice demo login fails with invalid token
- [ ] Minside demo login works
- [ ] SaaS Admin demo login works
- [ ] Tenant Admin demo login works
- [ ] Multi-app demo token works across all apps

### OAuth Login

- [ ] Backoffice ID-porten login works
- [ ] Minside ID-porten login works
- [ ] SaaS Admin Microsoft login works
- [ ] Tenant Admin Microsoft login works
- [ ] OAuth callback handles errors correctly

### Session Management

- [ ] Session persists on page reload
- [ ] Session expires after configured timeout
- [ ] Invalid session cookie redirects to login
- [ ] Cross-domain SSO works (cookie domain `.digilist.no`)

### Logout

- [ ] Logout clears localStorage
- [ ] Logout clears session cookie
- [ ] Logout redirects to login page
- [ ] Logout creates audit log entry
- [ ] Cross-tab logout synchronization works

### Role-Based Access Control

- [ ] Backoffice allows: admin, saksbehandler, super_admin, case_handler
- [ ] Backoffice denies: citizen
- [ ] Minside allows: citizen, admin, super_admin
- [ ] SaaS Admin allows: super_admin, admin
- [ ] Tenant Admin allows: tenant_admin, admin, super_admin
- [ ] Access denied page shows correct error message

### Protected Routes

- [ ] Unauthenticated users redirected to /login
- [ ] Flow context preserved during auth redirect
- [ ] Return URL works correctly after login
- [ ] Role-based route protection works

### Cross-Tab Synchronization

- [ ] Logout in one tab affects all tabs
- [ ] Session expiry detected across tabs
- [ ] Login state synchronized (if implemented)

### API Endpoints

- [ ] POST /api/auth/demo/login returns 200 on success
- [ ] POST /api/auth/demo/login returns 401 on invalid token
- [ ] GET /api/auth/session returns 200 when authenticated
- [ ] GET /api/auth/session returns 401 when unauthenticated
- [ ] POST /api/auth/logout returns 200 and clears session
- [ ] OAuth callback endpoints work correctly

### Error Handling

- [ ] Invalid demo token shows error message
- [ ] Expired session shows re-login prompt
- [ ] Access denied shows helpful message
- [ ] Network errors handled gracefully

---

## Running All Tests

### Manual Testing

1. Follow each test section above
2. Check off items in the Testing Checklist
3. Document any failures in GitHub Issues

### Automated Testing

```bash
# Run all auth E2E tests
pnpm test:e2e tests/e2e/auth/

# Run specific test
pnpm test:e2e tests/e2e/auth/demo-login.spec.ts

# Run unit tests
pnpm test packages/auth/

# Run API endpoint test script
./scripts/test-auth-endpoints.sh
```

---

## Troubleshooting

### Issue: 401 Unauthorized on /api/auth/session

**Cause:** No active session (user not logged in)

**Solution:** This is expected behavior. AuthProvider will redirect to `/login`.

### Issue: Access Denied after login

**Cause:** User role not allowed for the app

**Solution:**
1. Check user role in localStorage
2. Verify app's `allowedRoles` configuration
3. Use correct demo token for the app

### Issue: Cross-tab logout not working

**Cause:** Browser blocking storage events (Privacy mode)

**Solution:**
1. Test in normal browsing mode (not incognito)
2. Check browser console for errors
3. Verify storage event listener is registered

### Issue: OAuth redirect fails

**Cause:** Redirect URI mismatch

**Solution:**
1. Check OAuth provider configuration
2. Verify VITE_*_REDIRECT_URI environment variable
3. Ensure URL matches exactly (including https://)

---

## Next Steps

1. ✅ Complete manual testing using this guide
2. ✅ Implement automated E2E tests
3. ✅ Document any bugs found
4. ✅ Create regression test suite
5. ✅ Update AUTH_SYSTEM_COMPLETE.md with findings

---

## References

- **Auth System Documentation:** [AUTH_SYSTEM_COMPLETE.md](./AUTH_SYSTEM_COMPLETE.md)
- **Centralized Auth Package:** `packages/auth/`
- **Demo Seed File:** `apps/api/src/database/seeds/demo-login-users.seed.ts`
- **Auth Controller:** `apps/api/src/modules/auth/auth.controller.ts`
- **OAuth Callbacks:** `apps/api/src/modules/auth/oauth.controller.ts`
