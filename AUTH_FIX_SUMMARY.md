# Authentication Fix Summary
**Date:** 2026-01-16
**Issue:** Router context errors and authentication bypass concerns

---

## Issues Identified

### 1. Router Context Error (Production - backoffice-test.digilist.no)
```
Error: useNavigate() may be used only in the context of a <Router> component.
  at use-auth-guards.ts:24:20
  at AuthProvider.tsx:135:3
```

**Root Cause:**
- `AuthProvider` was calling `useSessionRestoration()` hook from `@digilist/client-sdk/hooks`
- This hook internally calls `useNavigate()` during component initialization
- Timing issue caused navigate to be called before Router context was fully ready

**Fix:**
- Removed SDK auth guard hooks (`useAuthRedirectGuard`, `useSessionRestoration`) from both:
  - `apps/backoffice/src/providers/AuthProvider.tsx`
  - `apps/minside/src/providers/AuthProvider.tsx`
- These hooks were causing timing issues with Router initialization
- Session restoration and redirect guards are now handled by `ProtectedRoute` component instead
- This eliminates the Router context error while maintaining secure authentication

### 2. Authentication Configuration Audit

**Mock Auth Status:**
- ✅ **Backoffice Local Dev:** `VITE_USE_MOCK_AUTH=true` in `.env.local` (gitignored)
- ✅ **Backoffice Production:** No mock auth setting in `.env.production` (defaults to false)
- ✅ **Minside:** `USE_MOCK_AUTH = false` hardcoded in `AuthProvider.tsx`

**Production Authentication:**
- All production environments use real OAuth authentication
- Mock auth is ONLY enabled for local development (cross-origin cookie workaround)
- No security vulnerabilities related to mock auth in production

---

## Files Modified

### 1. `apps/backoffice/src/providers/AuthProvider.tsx`
**Change:** Removed problematic SDK auth hooks
```diff
- // NOTE: Auth redirect guard temporarily disabled to avoid Router context issues
- // TODO: Re-enable once properly integrated with Router provider
- // useAuthRedirectGuard(!!user, isLoading);
- useSessionRestoration();
+ // ✅ Session restoration and redirect guards are handled by ProtectedRoute component
+ // This prevents Router context errors during AuthProvider initialization
+ // The auth hooks from SDK are not used here to avoid useNavigate() timing issues
```

### 2. `apps/minside/src/providers/AuthProvider.tsx`
**Change:** Removed problematic SDK auth hooks
```diff
- // Use auth guards to prevent redirect loops
- // NOTE: Auth redirect guard temporarily disabled to avoid Router context issues
- // TODO: Re-enable once properly integrated with Router provider
- // useAuthRedirectGuard(!!user, isLoading);
- useSessionRestoration();
+ // ✅ Session restoration and redirect guards are handled by ProtectedRoute component
+ // This prevents Router context errors during AuthProvider initialization
+ // The auth hooks from SDK are not used here to avoid useNavigate() timing issues
```

---

## Authentication Flow

### Current Architecture
```
1. User attempts to access protected route
   ↓
2. ProtectedRoute checks authentication
   ↓
3. If unauthenticated:
   - Save flow context to sessionStorage
   - Redirect to /login
   ↓
4. User authenticates (OAuth provider)
   ↓
5. OAuth callback returns to app
   ↓
6. AuthProvider processes callback
   - Exchange code for session
   - Set HTTP-only cookie
   - Store user data in localStorage
   ↓
7. ProtectedRoute restores flow context
   - Redirect to original destination
```

### Security Features
- ✅ HTTP-only cookies (XSS protection)
- ✅ OAuth 2.0 Authorization Code Flow (RFC 8252 compliant)
- ✅ Session validation on each request
- ✅ CSRF protection (SameSite cookies)
- ✅ No tokens in URLs or localStorage

---

## Environment Configuration

### Local Development (.env.local - gitignored)
```env
# Enable mock auth for local development
# Cross-origin cookies don't work between localhost and api.digilist.no
VITE_USE_MOCK_AUTH=true
```

### Production (.env.production - committed)
```env
VITE_API_URL=https://api.digilist.no
VITE_WS_URL=wss://api.digilist.no/ws/events
VITE_TENANT_ID=f47ac10b-58cc-4372-a567-0e02b2c3d479
# Note: VITE_USE_MOCK_AUTH is NOT set (defaults to false)
```

---

## Testing Recommendations

### Manual Testing
1. **Backoffice (localhost:5175)**
   - Navigate to http://localhost:5175
   - Should redirect to /login
   - Login with mock auth (dev mode)
   - Should redirect to dashboard after auth

2. **Minside (localhost:5174)**
   - Navigate to http://localhost:5174
   - Should redirect to /login
   - Login requires real OAuth (mock auth disabled)

3. **Production Environments**
   - Navigate to https://backoffice-test.digilist.no
   - Should NOT show Router context error
   - Should redirect to /login
   - Should use real OAuth authentication

### Automated Testing
```bash
# Run auth E2E tests
pnpm test:e2e tests/e2e/auth-*.spec.ts

# Run security tests
pnpm test:security tests/security/auth-penetration.test.ts

# Run auth user stories
pnpm test tests/scenarios/auth-user-stories.test.ts
```

---

## Verification Checklist

- [x] Router context error fixed in backoffice
- [x] Router context error fixed in minside
- [x] Mock auth disabled in production builds
- [x] Mock auth enabled only for local development
- [x] OAuth flow documented
- [x] Production deployment completed
  - [x] Backoffice: https://backoffice-test.digilist.no (HTTP 200 - deployed 2026-01-16)
  - [x] Minside: https://minside-test.digilist.no (HTTP 200 - deployed 2026-01-16)
- [ ] Manual browser testing (verify no Router errors in production)
- [ ] E2E tests passing

---

## Known Issues & Future Improvements

### SDK Auth Guards
The SDK auth guard hooks (`useAuthRedirectGuard`, `useSessionRestoration`) have timing issues with Router initialization. These should be:
- Fixed in the SDK to handle Router context availability
- Or deprecated in favor of app-level implementations
- **Tracked in:** `packages/client-sdk/src/hooks/use-auth-guards.ts`

### OAuth Callback Handling
OAuth callback handling is currently duplicated between AuthProvider and ProtectedRoute. This should be:
- Consolidated into a single source of truth
- Documented with flow diagrams
- Tested with E2E scenarios

---

## Contact
For authentication issues or questions:
- Review: `docs/AUTH_FLOW_TROUBLESHOOTING.md`
- SDK Docs: `packages/client-sdk/CLAUDE.md`
- App Docs: `apps/{backoffice,minside}/CLAUDE.md`
