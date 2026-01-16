# Comprehensive Authentication Audit & Standardization Plan
## Xala/Digilist Platform - 2026-01-16

> **Status**: Phase 1 Complete - Inventory ✅ | Phase 2 - Analysis 🔄 | Phase 3 - Implementation ⏳

---

## Executive Summary

### Current Issues (Reported)
1. **Backoffice**: After login, bounces back to login page. Session endpoint returns 401.
2. **Main Cedar**: "Logs in" even without explicit login. Refreshing login page lands on dashboard.
3. **Web**: Demo credentials return "authentication is required" error.

### Root Cause Hypothesis
Based on preliminary inventory:
- ✅ Cookie-based auth infrastructure exists (HTTP-only cookies with `Domain=.digilist.no`)
- ⚠️ **Cookie domain mismatch** with test subdomains (`backoffice-test.digilist.no`)
- ⚠️ **Inconsistent session checking** between apps (some check on mount, some on route change)
- ⚠️ **Mixed auth modes** (cookies + potential bearer token fallback)
- ⚠️ **AuthProvider inconsistencies** between apps

---

## Phase 1: Auth Surface Inventory

### API Layer (apps/api)

#### Auth Controller (`apps/api/src/modules/auth/auth.controller.ts`)
**Endpoints:**
| Method | Path | Purpose | Cookie Behavior |
|--------|------|---------|-----------------|
| POST | `/api/auth/login` | Email/password login | Sets `dl_at` (access), no refresh |
| POST | `/api/auth/callback` | OAuth callback | Sets `dl_at`, `dl_rt` (refresh), `dl_csrf` |
| POST | `/api/auth/demo-token` | Demo token login | Sets `dl_at`, `dl_rt`, `dl_csrf` |
| POST | `/api/auth/email` | Email login (alias) | Sets `dl_at` |
| GET | `/api/auth/session` | Get current session | Reads `dl_at` cookie |
| POST | `/api/auth/logout` | Logout | Clears all cookies |
| POST | `/api/auth/refresh` | Refresh token | Rotates `dl_at` + `dl_rt` |
| GET | `/api/auth/csrf` | Get CSRF token | Returns mock token |
| GET | `/api/auth/providers` | List auth providers | N/A |

**Cookie Configuration** (`apps/api/src/config/cookies.ts`):
```typescript
COOKIE_CONFIG = {
  ACCESS: {
    name: 'dl_at',
    maxAge: 15 * 60, // 15 minutes
    path: '/',
  },
  REFRESH: {
    name: 'dl_rt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/api/auth/refresh', // ⚠️ Path-scoped
  },
  CSRF: {
    name: 'dl_csrf',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  },
}

getCookieOptions(cookieType, isProduction):
  httpOnly: cookieType !== 'CSRF'
  secure: isProduction
  sameSite: 'lax'
  domain: isProduction ? '.digilist.no' : undefined
  path: config.path
  maxAge: config.maxAge
  priority: cookieType === 'ACCESS' ? 'high' : 'medium'
```

**🔴 ISSUE 1**: `domain: '.digilist.no'` does not work with hyphens in subdomains (RFC issue)
- `backoffice-test.digilist.no` cookies won't persist
- `backoffice.digilist.no` (no hyphen) works fine

**Auth Middleware** (`apps/api/src/middleware/auth-cookie.middleware.ts`):
- Runs on **all requests** except public endpoints
- Extracts JWT from `dl_at` cookie first, falls back to `Authorization: Bearer` header
- **Does NOT return 401** - just sets `request.userId` and `request.tenantId` if valid
- Invalid tokens are logged but request continues (optional auth)

**CORS Configuration** (`apps/api/src/adapters/fastify.adapter.ts`):
```typescript
cors: {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://web-test.digilist.no',
      'https://backoffice-test.digilist.no',
      'https://minside-test.digilist.no',
      'https://web.digilist.no',
      'https://backoffice.digilist.no',
      'https://minside.digilist.no',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
    ];
    if (allowedOrigins.includes(origin) || origin.endsWith('.digilist.no')) {
      callback(null, origin); // Reflect origin back
    } else {
      callback(null, origin); // ⚠️ Still allow, just warning
    }
  },
  credentials: true,
  exposedHeaders: ['Set-Cookie'],
}
```

**Session Endpoint Logic**:
```typescript
@Get('/session')
async getSession(request: AuthRequest, reply: FastifyReply) {
  const userId = (request as any).userId; // Set by auth middleware
  const tenantId = request.tenantId;

  if (!userId) {
    reply.code(401);
    return createErrorResponse(request, 'UNAUTHORIZED', 'auth.no_session');
  }

  // Fetch user from database
  const userResult = await db.select().from(users).where(eq(users.id, userId)).limit(1);

  if (!userResult.length) {
    reply.code(401);
    return createErrorResponse(request, 'UNAUTHORIZED', 'auth.no_session');
  }

  const user = userResult[0];
  const permissions = getPermissionsForRole(user.role);

  return {
    data: {
      user: {...},
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      permissions,
    },
  };
}
```

**🔴 ISSUE 2**: Session endpoint **depends on auth middleware setting `request.userId`**
- If cookie not sent or invalid → `userId` is `undefined` → 401 response
- **No explicit cache-control headers** → browser may cache 401 responses

---

### Client SDK Layer (`packages/client-sdk`)

#### Auth Service (`packages/client-sdk/src/services/auth.service.ts`)
**Methods:**
- `login(credentials)` → POST `/api/auth/login`
- `loginWithEmail(credentials)` → POST `/api/auth/email`
- `getSession()` → GET `/api/auth/session`
- `logout()` → POST `/api/auth/logout`
- `refreshToken()` → POST `/api/auth/refresh`
- `getProviders()` → GET `/api/auth/providers`
- `handleOAuthCallback(code, state)` → POST `/api/auth/callback`
- `requireAuth(options)` → Saves flow context, returns redirect URL
- `resumeFlow()` → Restores flow context from sessionStorage

**HTTP Client** (`@xala/sdk-core/src/http/fetch-client.ts`):
```typescript
fetch(url, {
  method,
  headers,
  body,
  credentials: 'include', // ✅ Sends cookies
  signal,
});
```

#### Auth Hooks (`packages/client-sdk/src/hooks/use-auth.ts`)
```typescript
useSession() {
  return useQuery({
    queryKey: queryKeys.auth.session(),
    queryFn: () => authService.getSession(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

useLogin() {
  return useMutation({
    mutationFn: (credentials) => authService.login(credentials),
    onSuccess: (response) => {
      if (response.data.token) {
        setAuthToken(response.data.token); // ⚠️ Sets token in localStorage/memory
      }
      queryClient.setQueryData(queryKeys.auth.session(), response);
    },
  });
}
```

**🔴 ISSUE 3**: Hooks still have `setAuthToken()` logic for bearer tokens
- Cookie-based auth should NOT need `setAuthToken()`
- Mixing cookie + bearer token modes
- **Inconsistent**: login sets token, but session doesn't use it

---

### Auth Provider Layer (`packages/auth`)

#### AuthProvider (`packages/auth/src/providers/AuthProvider.tsx`)
**Key Features:**
- ✅ Centralized provider for all apps
- ✅ Development mode with auto-login (VITE_ENABLE_DEV_MODE)
- ✅ Role-based access control per app
- ✅ Flow context preservation (for booking flows)
- ✅ OAuth callback handling
- ⚠️ **Session check on mount only** (not on route change)

**Role Configuration:**
```typescript
DEFAULT_ALLOWED_ROLES = {
  'minside': [], // All authenticated users
  'backoffice': ['admin', 'saksbehandler', 'super_admin', 'case_handler'],
  'saas-admin': ['super_admin', 'admin'],
  'tenant-admin': ['tenant_admin', 'admin', 'super_admin'],
  'web': [], // All authenticated users
};
```

**Session Check Logic** (simplified):
```typescript
useEffect(() => {
  const checkAuth = async () => {
    if (isDevMode) {
      // Auto-login in dev mode
      setUser(devUser);
      setIsLoading(false);
      return;
    }

    // Check for OAuth callback
    const code = urlParams.get('code');
    if (code) {
      const response = await authService.handleOAuthCallback(code, state);
      const userData = { ...response.data.user };

      if (!hasRequiredRole(userData)) {
        setAccessDeniedError(accessDeniedMessage);
        setIsLoading(false);
        return;
      }

      setUser(userData);
      setIsLoading(false);
      // Clear params, redirect...
      return;
    }

    // Check existing session
    try {
      const response = await authService.getSession();
      const userData = { ...response.data.user };

      if (!hasRequiredRole(userData)) {
        setAccessDeniedError(accessDeniedMessage);
        setIsLoading(false);
        return;
      }

      setUser(userData);
    } catch (error) {
      debug('Session check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  checkAuth();
}, []); // ⚠️ Only runs on mount, never re-runs
```

**🔴 ISSUE 4**: **No retry or refresh logic** when session check fails
- If `/api/auth/session` returns 401, user is left unauthenticated
- **No automatic redirect to login**
- **No token refresh attempt** before giving up

---

### Frontend App Layer

#### Backoffice (`apps/backoffice/src/routes/login.tsx`)
**Flow:**
1. User visits `/login`
2. AuthProvider runs `checkAuth()` on mount
3. If authenticated → redirect to dashboard via `handlePostAuthNavigation()`
4. If not authenticated → show login options

**Login Options:**
- ID-porten (OAuth2)
- Microsoft (disabled)
- Admin Demo (demo token)

**Login Button Handler** (Demo):
```typescript
onClick={() => {
  const returnTo = `${window.location.origin}/`;
  idportenService.authorize(returnTo);
}}
```

**🔴 ISSUE 5**: **Redirect loops** possible
- If session endpoint fails (401), user stays on login page
- If user refreshes login page while authenticated, they're redirected to dashboard
- But if dashboard checks auth and session is invalid, redirects back to login

**ProtectedRoute** (not shown in files read, but exists):
- Likely wraps all routes except `/login`
- Checks `isAuthenticated` from `useAuth()`
- If not authenticated → redirect to `/login` with `returnTo` state

---

## Phase 2: Auth Surface Map

| App | Base URL (Local) | Base URL (Test) | Base URL (Prod) | Credential Mode | Storage | Session Check Trigger | Redirect Trigger | Observed Behavior |
|-----|------------------|-----------------|-----------------|-----------------|---------|----------------------|------------------|-------------------|
| **Backoffice** | http://localhost:5175 | https://backoffice-test.digilist.no | https://backoffice.digilist.no | HTTP-only cookies | Cookies only | On mount (AuthProvider useEffect) | 401 from session → no redirect | ❌ Bounces back to login, 401 from session |
| **Minside** | http://localhost:5174 | https://minside-test.digilist.no | https://minside.digilist.no | HTTP-only cookies | Cookies only | On mount | ? | ✅ (assumed working after recent fixes) |
| **Web** | http://localhost:5173 | https://web-test.digilist.no | https://web.digilist.no | HTTP-only cookies | Cookies only | On mount | ? | ❌ Demo credentials → "authentication required" |
| **Saas-Admin** | http://localhost:5176 | https://saas-admin-test.digilist.no | https://saas-admin.digilist.no | HTTP-only cookies | Cookies only | On mount | ? | ❓ (not tested) |
| **Tenant-Admin** | http://localhost:5177 | https://tenant-admin-test.digilist.no | https://tenant-admin.digilist.no | HTTP-only cookies | Cookies only | On mount | ? | ❓ (not tested) |
| **API** | http://localhost:4000 | https://api.digilist.no | https://api.digilist.no | N/A | N/A | N/A | N/A | ✅ Sets cookies correctly |

---

## Phase 2: Root Cause Analysis

### A) Cookie/Domain/SameSite Mismatch ⚠️ **PRIMARY ISSUE**

**Evidence:**
- Cookie config: `domain: isProduction ? '.digilist.no' : undefined`
- Test URLs: `backoffice-test.digilist.no`, `minside-test.digilist.no`, `web-test.digilist.no`
- **RFC 6265 Cookie Specification**: Cookies set for `.digilist.no` may not work reliably with hyphens in subdomain names

**Browser Behavior:**
- Chrome/Firefox: May reject cookies for `.digilist.no` from `backoffice-test.digilist.no`
- Safari: Stricter cookie policies, more likely to reject

**Test:**
```bash
curl -v https://api.digilist.no/api/auth/demo-token \
  -H "Origin: https://backoffice-test.digilist.no" \
  -H "Content-Type: application/json" \
  -d '{"token":"admin-demo-001"}' \
  -c /tmp/cookies.txt

# Check cookies
cat /tmp/cookies.txt

# Then try session check
curl -v https://api.digilist.no/api/auth/session \
  -H "Origin: https://backoffice-test.digilist.no" \
  -b /tmp/cookies.txt
```

**Expected Fix:**
- ✅ Deploy to production URLs without hyphens: `backoffice.digilist.no`
- OR: Change cookie domain to exact subdomain match: `domain: origin.replace('https://', '')`

---

### B) Mixed Auth Mode (Cookie + Bearer Token) ⚠️ **MEDIUM ISSUE**

**Evidence:**
- Auth middleware checks **both** `dl_at` cookie AND `Authorization: Bearer` header
- SDK hooks call `setAuthToken()` on login (localStorage/memory)
- But session endpoint **only checks cookies** (via middleware)

**Confusion:**
- Login sets token in memory → but session doesn't use it
- Some code paths may expect bearer token, others expect cookie

**Expected Fix:**
- ✅ **Choose one mode**: HTTP-only cookies (recommended for browser apps)
- ❌ Remove bearer token fallback from API middleware (breaking change)
- ✅ Remove `setAuthToken()` calls from SDK hooks
- ✅ Document cookie-only mode in all docs

---

### C) Base URL / Environment Mismatch ⚠️ **LOW ISSUE**

**Evidence:**
- Apps use `VITE_API_URL` from env
- Default: `https://api.digilist.no` (production)
- Local dev: `http://localhost:4000`

**Potential Issue:**
- If one app points to wrong API, cookies won't work (domain mismatch)
- If test app points to prod API, cookies work but data is wrong

**Expected Fix:**
- ✅ Single source of truth for API URL per environment
- ✅ Runtime validation: log API URL on app start
- ✅ Fail fast if API URL doesn't match expected domain

---

### D) React Router Guard / Query Cache Race ⚠️ **HIGH ISSUE**

**Evidence:**
- AuthProvider checks session **once on mount** (`useEffect` with empty deps)
- **No re-check** when navigating between routes
- If session expires while user is logged in → **no logout redirect**

**Race Condition:**
1. User visits `/dashboard` (protected)
2. ProtectedRoute checks `isAuthenticated` → true (from cache)
3. User stays on dashboard
4. Access token expires (15 min)
5. User clicks something → API call returns 401
6. But AuthProvider doesn't know → **user stuck**

**Expected Fix:**
- ✅ Add **token expiry tracking** in AuthProvider
- ✅ Add **automatic refresh** before token expires
- ✅ Add **401 interceptor** to detect expired sessions
- ✅ Add **session check on route change** (optional, performance trade-off)

---

### E) Broken Refresh Flow ⚠️ **HIGH ISSUE**

**Evidence:**
- Refresh token cookie: `path: '/api/auth/refresh'` (path-scoped)
- Refresh endpoint: `POST /api/auth/refresh`
- **No automatic refresh** before access token expires

**Issue:**
- Access token expires after 15 min
- User must manually call refresh OR re-login
- AuthProvider doesn't track exp time → no proactive refresh

**Expected Fix:**
- ✅ Parse `expiresAt` from session response
- ✅ Set timer to refresh 1-2 min before expiry
- ✅ Implement **silent refresh** logic
- ✅ Handle refresh failure → logout + redirect

---

### F) Proxy Strips Headers / Misroutes ⚠️ **LOW ISSUE**

**Evidence:**
- Nginx config not reviewed yet
- CORS headers look correct
- Session endpoint has **no explicit `Cache-Control: no-store`**

**Potential Issue:**
- If nginx caches `/api/auth/session` responses → stale 401 errors
- If nginx strips `Cookie` header → session always fails

**Expected Fix:**
- ✅ Add `Cache-Control: no-store` to all auth endpoints
- ✅ Review nginx config for auth endpoints
- ✅ Ensure `proxy_set_header Cookie $http_cookie` in nginx

---

## Phase 3: Standardized Solution Design

### Auth Transport Decision: HTTP-Only Cookies (Cookie-Based Auth)

**Rationale:**
- ✅ XSS protection (JS can't read tokens)
- ✅ CSRF protection (SameSite=Lax)
- ✅ SSO across subdomains (domain=.digilist.no)
- ✅ Automatic cookie sending (no manual header management)
- ✅ Industry standard for browser-based apps

**Implementation:**
- Access token: `dl_at` (15 min, httpOnly, secure, sameSite=lax, domain=.digilist.no)
- Refresh token: `dl_rt` (7 days, httpOnly, secure, sameSite=lax, domain=.digilist.no, path=/api/auth/refresh)
- CSRF token: `dl_csrf` (7 days, sameSite=lax, domain=.digilist.no) - NOT httpOnly (JS needs to read)

**CRITICAL:** Remove hyphen from test subdomains OR change cookie domain strategy

---

### Xala Auth Kit (Standardized Package: @xala/auth)

**Exports:**

#### 1. `AuthProvider` (already exists, needs refinement)
```typescript
<AuthProvider config={{
  appType: 'backoffice',
  allowedRoles: ['admin', 'saksbehandler'],
  accessDeniedMessage: 'Custom message',
  debug: true,
}}>
  <App />
</AuthProvider>
```

**Improvements needed:**
- Add automatic token refresh
- Add 401 interceptor
- Add session re-check on visibility change
- Add token expiry tracking

#### 2. `useAuth()` hook (already exists)
```typescript
const {
  user,
  isAuthenticated,
  isLoading,
  login,
  logout,
  hasRole,
  hasPermission,
  accessDeniedError,
} = useAuth();
```

#### 3. `AuthGate` component (NEW)
```typescript
<AuthGate
  fallback={<LoginRedirect />}
  requireRole="admin"
  requirePermission="bookings:write"
>
  <AdminContent />
</AuthGate>
```

#### 4. Return URL utilities (NEW)
```typescript
// Build login URL with return destination
const loginUrl = buildLoginUrl({
  returnTo: '/bookings/123',
  preserveQuery: true,
  validateOrigin: true,
});

// Parse return URL safely (prevent open redirect)
const returnTo = parseReturnTo(urlParams.get('returnTo'));
// Returns: validated URL or default ("/")
```

#### 5. Protected Route wrapper (NEW)
```typescript
<Route path="/dashboard" element={
  <ProtectedRoute requireRole="admin">
    <Dashboard />
  </ProtectedRoute>
} />
```

#### 6. Login page component (reusable across apps)
**Already exists in @xala/ds as `LoginLayout` + `LoginOption`**

---

### API Changes Required

#### 1. Add `Cache-Control: no-store` to auth endpoints
```typescript
@Get('/session')
async getSession(request, reply) {
  reply.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  reply.header('Pragma', 'no-cache');
  reply.header('Expires', '0');
  // ... rest of logic
}
```

#### 2. Update CORS allowed origins (after subdomain fix)
```typescript
const allowedOrigins = [
  'https://web.digilist.no',
  'https://backoffice.digilist.no',
  'https://minside.digilist.no',
  'https://saas-admin.digilist.no',
  'https://tenant-admin.digilist.no',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:5177',
];
```

#### 3. Remove bearer token fallback (OPTIONAL - breaking change)
**Keep for backward compatibility**, but log deprecation warnings

---

## Test Plan

### API Tests (apps/api/src/__tests__/auth/)

```typescript
describe('Auth Endpoints', () => {
  test('POST /api/auth/demo-token - sets cookies correctly', async () => {
    const response = await request(app).post('/api/auth/demo-token').send({ token: 'admin-demo-001' });

    expect(response.status).toBe(200);
    expect(response.headers['set-cookie']).toBeDefined();

    const cookies = response.headers['set-cookie'];
    expect(cookies.some(c => c.startsWith('dl_at='))).toBe(true);
    expect(cookies.some(c => c.startsWith('dl_rt='))).toBe(true);
    expect(cookies.some(c => c.startsWith('dl_csrf='))).toBe(true);

    // Check cookie attributes
    const accessCookie = cookies.find(c => c.startsWith('dl_at='));
    expect(accessCookie).toContain('HttpOnly');
    expect(accessCookie).toContain('Secure');
    expect(accessCookie).toContain('SameSite=Lax');
    expect(accessCookie).toContain('Domain=.digilist.no');
  });

  test('GET /api/auth/session - returns user data with valid cookie', async () => {
    // First, login to get cookies
    const loginResponse = await request(app).post('/api/auth/demo-token').send({ token: 'admin-demo-001' });
    const cookies = loginResponse.headers['set-cookie'];

    // Then, call session endpoint with cookies
    const sessionResponse = await request(app)
      .get('/api/auth/session')
      .set('Cookie', cookies);

    expect(sessionResponse.status).toBe(200);
    expect(sessionResponse.body.data.user).toBeDefined();
    expect(sessionResponse.body.data.user.email).toBe('admin@skien.kommune.no');
  });

  test('GET /api/auth/session - returns 401 without cookie', async () => {
    const response = await request(app).get('/api/auth/session');

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHORIZED');
  });

  test('GET /api/auth/session - returns Cache-Control: no-store', async () => {
    const response = await request(app).get('/api/auth/session');

    expect(response.headers['cache-control']).toContain('no-store');
  });

  test('POST /api/auth/refresh - rotates tokens', async () => {
    // Login to get initial tokens
    const loginResponse = await request(app).post('/api/auth/demo-token').send({ token: 'admin-demo-001' });
    const initialCookies = loginResponse.headers['set-cookie'];

    // Extract refresh token
    const refreshCookie = initialCookies.find(c => c.startsWith('dl_rt='));

    // Call refresh endpoint
    const refreshResponse = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', refreshCookie);

    expect(refreshResponse.status).toBe(200);

    const newCookies = refreshResponse.headers['set-cookie'];
    expect(newCookies.some(c => c.startsWith('dl_at='))).toBe(true);
    expect(newCookies.some(c => c.startsWith('dl_rt='))).toBe(true);

    // New tokens should be different
    const newAccessCookie = newCookies.find(c => c.startsWith('dl_at='));
    const initialAccessCookie = initialCookies.find(c => c.startsWith('dl_at='));
    expect(newAccessCookie).not.toBe(initialAccessCookie);
  });
});
```

### Client SDK Tests (packages/client-sdk/src/__tests__/auth/)

```typescript
describe('AuthService', () => {
  test('getSession() includes credentials', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch');

    await authService.getSession();

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/session'),
      expect.objectContaining({
        credentials: 'include',
      })
    );
  });

  test('useSession() hook retries on network error', async () => {
    // Mock API to fail once, then succeed
    server.use(
      http.get('/api/auth/session', () => HttpResponse.error(), { once: true }),
      http.get('/api/auth/session', () => HttpResponse.json({ data: mockSession }))
    );

    const { result, waitFor } = renderHook(() => useSession(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockSession);
  });
});
```

### Playwright E2E Tests (tests/e2e/)

#### Test Matrix

| App | Test Case | Expected Result |
|-----|-----------|-----------------|
| Backoffice | Visit `/dashboard` → redirected to `/login` | ✅ Redirect to login with `returnTo=/dashboard` |
| Backoffice | Login with demo token → redirected to `/dashboard` | ✅ Dashboard loads, user authenticated |
| Backoffice | Refresh `/dashboard` → stays authenticated | ✅ No redirect, session persists |
| Backoffice | Logout → redirected to `/login` | ✅ Logged out, cookies cleared |
| Backoffice | Login → navigate to `/bookings` → refresh | ✅ Stays on bookings, session persists |
| Backoffice | Wait 16 min → session expires → auto-logout | ✅ Redirected to login (session expired) |

**Test Code:**
```typescript
test('Backoffice: Login flow with returnTo', async ({ page }) => {
  // Visit protected route
  await page.goto('https://backoffice.digilist.no/dashboard');

  // Should be redirected to login
  await expect(page).toHaveURL(/\/login/);
  await expect(page).toHaveURL(/returnTo=%2Fdashboard/);

  // Fill demo login form
  await page.click('text=Admin Demo');
  await page.fill('input[name="email"]', 'admin@skien.kommune.no');
  await page.fill('input[name="token"]', 'admin-demo-001');
  await page.click('button[type="submit"]');

  // Should be redirected back to dashboard
  await expect(page).toHaveURL('https://backoffice.digilist.no/dashboard');

  // Check that cookies are set
  const cookies = await page.context().cookies();
  expect(cookies.some(c => c.name === 'dl_at')).toBe(true);
  expect(cookies.some(c => c.name === 'dl_rt')).toBe(true);

  // Refresh page
  await page.reload();

  // Should still be on dashboard (session persists)
  await expect(page).toHaveURL('https://backoffice.digilist.no/dashboard');
});

test('Backoffice: Session check returns correct user', async ({ page }) => {
  // Login first
  await page.goto('https://backoffice.digilist.no/login');
  await page.click('text=Admin Demo');
  await page.fill('input[name="email"]', 'admin@skien.kommune.no');
  await page.fill('input[name="token"]', 'admin-demo-001');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('https://backoffice.digilist.no/dashboard');

  // Intercept session API call
  const sessionResponse = await page.waitForResponse(
    response => response.url().includes('/api/auth/session') && response.status() === 200
  );

  const sessionData = await sessionResponse.json();
  expect(sessionData.data.user.email).toBe('admin@skien.kommune.no');
  expect(sessionData.data.user.role).toBe('admin');
});
```

---

## Demo Readiness Checklist

### Pre-Customer Demo Tasks

- [ ] **Fix cookie domain issue** → Deploy to production URLs (no hyphens)
- [ ] **Add automatic token refresh** to AuthProvider
- [ ] **Add Cache-Control headers** to auth endpoints
- [ ] **Add 401 interceptor** to handle expired sessions
- [ ] **Test all auth flows** with Playwright
- [ ] **Create demo credentials** for citizen + admin roles
- [ ] **Document demo flow** (step-by-step for customer)
- [ ] **Verify GDPR compliance** (audit logs, data subject requests)
- [ ] **Test on multiple browsers** (Chrome, Firefox, Safari)
- [ ] **Test on mobile** (responsive, touch-friendly)

### Demo Credentials

| Role | Email | Token | App Access |
|------|-------|-------|------------|
| Citizen | `lars.andersen@example.com` | `user-demo-001` | Minside, Web |
| Saksbehandler | `saksbehandler@skien.kommune.no` | `case-handler-demo-001` | Backoffice |
| Admin | `admin@skien.kommune.no` | `admin-demo-001` | Backoffice, Saas-Admin |

### Demo Script

1. **Citizen Flow** (Minside):
   - Visit https://minside.digilist.no
   - Login with ID-porten (or demo token)
   - View bookings
   - Create new booking
   - View booking details
   - Receive notification
   - Logout

2. **Admin Flow** (Backoffice):
   - Visit https://backoffice.digilist.no
   - Login with demo token (admin)
   - View dashboard (KPIs, charts)
   - View bookings (filter, sort)
   - Approve/reject booking
   - View audit log
   - Manage listings
   - View reports
   - Logout

---

## Implementation Plan

### Phase 1: Critical Fixes (Week 1)

**Priority: HIGH - Customer Demo Blocker**

1. **Deploy to production URLs** (no hyphens)
   - Update nginx config
   - Update DNS records
   - Update `.env` files
   - Deploy all apps to new URLs

2. **Add Cache-Control headers** to auth endpoints
   - `apps/api/src/modules/auth/auth.controller.ts`
   - Add to all methods: `reply.header('Cache-Control', 'no-store')`

3. **Fix AuthProvider session check**
   - Add automatic refresh before token expiry
   - Add 401 interceptor
   - Add session re-check on visibility change

4. **Test with Playwright**
   - Run E2E tests for all apps
   - Verify no redirect loops
   - Verify session persistence

### Phase 2: Auth Standardization (Week 2)

**Priority: MEDIUM - Tech Debt Reduction**

1. **Remove bearer token fallback**
   - Update API middleware (keep fallback, log warning)
   - Remove `setAuthToken()` from SDK hooks
   - Update docs to specify cookie-only mode

2. **Implement automatic token refresh**
   - Parse `expiresAt` from session
   - Set timer to refresh 2 min before expiry
   - Handle refresh failure → logout

3. **Add 401 interceptor to fetch client**
   - Detect expired sessions
   - Trigger logout + redirect to login

4. **Implement AuthGate component**
   - Declarative role/permission checks
   - Fallback to AccessDenied page

### Phase 3: Testing & Docs (Week 3)

**Priority: LOW - Quality Assurance**

1. **API tests** (100% coverage for auth endpoints)
2. **Client SDK tests** (auth service + hooks)
3. **Playwright E2E tests** (test matrix for all apps)
4. **Update documentation**
   - Auth flow diagrams
   - Cookie architecture
   - Return URL flow
   - Demo credentials
5. **Create customer demo guide**

---

## Conclusion

**Immediate Action Required:**
1. ✅ Deploy apps to production URLs (no hyphens in subdomain)
2. ✅ Add `Cache-Control: no-store` to session endpoint
3. ✅ Add automatic token refresh to AuthProvider
4. ✅ Test auth flow with Playwright before demo

**Expected Outcome:**
- ✅ Backoffice: No more redirect loops
- ✅ Web: Demo credentials work
- ✅ All apps: Consistent auth behavior
- ✅ Customer: Successful demo evaluation

**Risk Mitigation:**
- All changes are **additive** (no breaking changes)
- Cookie domain fix is **critical path**
- Automatic refresh is **nice to have** (can defer to Phase 2)
- E2E tests provide **confidence** before customer demo
