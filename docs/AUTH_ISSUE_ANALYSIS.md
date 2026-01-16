# Authentication Issue Analysis - Session Not Registered After OAuth

**Date:** 2026-01-16
**Status:** 🔴 Critical Bug Identified
**Impact:** Users cannot complete OAuth authentication flow

---

## Problem Statement

After completing OAuth authentication, users are redirected back to the login screen with a 401 error when attempting to retrieve the session. The authentication succeeds on the OAuth provider side, but the session is never registered in the application.

### Error Log

```
GET https://api.digilist.no/api/auth/session 401 (Unauthorized)
request @ fetch-client.ts:97
get @ fetch-client.ts:192
getSession @ auth.service.ts:103
(anonymous) @ AuthProvider.tsx:237
```

---

## Root Cause Analysis

### The Bug

**Location:** `packages/auth/src/providers/AuthProvider.tsx:229`

The AuthProvider attempts to call a **non-existent method** when handling OAuth callbacks:

```typescript
// Line 229 in AuthProvider.tsx
const response = await authService.handleOAuthCallback(code);
```

**Problem:** The method `handleOAuthCallback` **DOES NOT EXIST** in the authService (`packages/client-sdk/src/services/auth.service.ts`).

### What Happens

1. ✅ User initiates OAuth login via `authService.initiateOAuth()`
2. ✅ User is redirected to OAuth provider (Vipps/Microsoft/ID-porten)
3. ✅ User authenticates successfully with OAuth provider
4. ✅ OAuth provider redirects back to app with authorization code: `?code=xxx`
5. ❌ **AuthProvider detects `code` parameter and calls `authService.handleOAuthCallback(code)`**
6. ❌ **Method doesn't exist → Call fails → Caught by try/catch**
7. ❌ Code falls through to normal session check
8. ❌ Session check returns 401 (no session cookie set yet)
9. ❌ User redirected back to login screen

### Evidence

**AuthProvider.tsx Lines 220-274:**
```typescript
// Check URL for OAuth callback with authorization code
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');

if (code) {
  debug('OAuth callback detected, exchanging code for session...');

  try {
    // 🔴 BUG: This method doesn't exist!
    const response = await authService.handleOAuthCallback(code);
    const session = response.data;
    // ... rest of code never executes
  } catch (error) {
    debug('OAuth callback failed:', error);
    window.history.replaceState({}, document.title, window.location.pathname);
    setUser(null);
    setIsLoading(false);
    return;
  }
}
```

**auth.service.ts (packages/client-sdk/src/services/):**
```typescript
export class AuthService extends BaseService {
  // ❌ handleOAuthCallback method is MISSING
  // Available methods:
  // - login()
  // - loginWithEmail()
  // - getSession()
  // - logout()
  // - refreshToken()
  // - getProviders()
  // - getCsrfToken()
  // - initiateOAuth() ✅
  // - requireAuth()
  // - resumeFlow()
  // - loginWithDemoToken()
}
```

---

## Expected OAuth Flow

### Current API Architecture

The API has a proper OAuth callback endpoint:

**Endpoint:** `GET /api/auth/idporten-oidc/callback`
**Location:** `apps/api/src/modules/auth/idporten-oidc.controller.ts:119`

**Flow:**
1. User redirected to `/api/auth/idporten-oidc/authorize?returnTo=/dashboard`
2. API redirects to OAuth provider (Signicat/ID-porten)
3. User authenticates
4. OAuth provider redirects to `/api/auth/idporten-oidc/callback?code=xxx&state=yyy`
5. API exchanges code for tokens
6. API verifies ID token
7. API creates user session
8. API sets HTTP-only cookies (access token, refresh token, CSRF token)
9. API redirects back to `returnTo` URL

### Frontend Integration Missing

The frontend AuthProvider needs to:
1. Detect authorization code in URL
2. **Call API endpoint to exchange code for session** ← MISSING
3. Receive session data with HTTP-only cookies set
4. Store user data locally
5. Clean URL and continue

---

## Solution

### 1. Add Missing Method to AuthService

**File:** `packages/client-sdk/src/services/auth.service.ts`

Add the following method to the `AuthService` class:

```typescript
/**
 * Handle OAuth callback
 * Exchanges authorization code for session
 *
 * @param code - Authorization code from OAuth provider
 * @param state - State parameter for CSRF protection (optional)
 * @returns Promise with authenticated session data
 *
 * @example
 * ```typescript
 * // After OAuth redirect with ?code=xxx
 * const session = await authService.handleOAuthCallback(code);
 * console.log('Logged in as:', session.data.user.email);
 * ```
 */
async handleOAuthCallback(
  code: string,
  state?: string
): Promise<SingleResponse<AuthSession>> {
  const params: Record<string, string> = { code };
  if (state) {
    params.state = state;
  }

  // Call the API's OAuth callback endpoint
  // This will exchange the code for tokens and set HTTP-only cookies
  return this.client.get(this.buildPath('/idporten-oidc/callback'), { params });
}
```

### 2. Alternative: Use Existing API Flow

The current API implementation uses server-side redirects. The frontend could skip the code exchange and rely on the API to handle the entire flow:

**Current API Flow (Server-Side):**
- Frontend → `/api/auth/idporten-oidc/authorize?returnTo=/dashboard`
- API handles entire OAuth flow
- API redirects back to `/dashboard` with cookies set

**Issue:** AuthProvider is trying to handle the callback client-side instead of letting the API handle it.

### 3. Recommended Approach

**Option A: Add the missing method** (Quick fix)
- Pros: Minimal changes, fixes immediate bug
- Cons: Frontend still involved in OAuth flow

**Option B: Server-side OAuth only** (Better architecture)
- Remove client-side OAuth callback handling
- Let API handle entire flow with server redirects
- Frontend only initiates login via redirect to API endpoint
- Pros: Simpler, more secure (no code exposure in frontend)
- Cons: Requires refactoring AuthProvider

---

## Security Considerations

### Current Issues

1. **Authorization code exposed in frontend URL** - Security risk if code is logged or shared
2. **Client-side state management** - State parameter should be verified server-side only
3. **Cookie dependency** - HTTP-only cookies must be set by API, not frontend

### Recommended Security Model

**HTTP-Only Cookie-Based Authentication** (Already documented in AuthProvider.tsx:8-14):
- NO tokens in URLs or localStorage
- NO mock authentication in PRODUCTION
- HTTP-only cookies set by api.digilist.no
- Domain: .digilist.no (SSO across subdomains)
- OAuth 2.0 Authorization Code flow (RFC 8252 compliant)

This is correctly implemented in the API layer but not properly integrated in the frontend.

---

## Testing Checklist

After implementing fix:

- [ ] OAuth login redirects to provider
- [ ] User completes authentication
- [ ] Callback URL contains authorization code
- [ ] Frontend exchanges code for session
- [ ] HTTP-only cookies are set
- [ ] Session is registered in AuthProvider
- [ ] User is NOT redirected back to login
- [ ] Session persists across page refreshes
- [ ] Logout clears all session data

---

## Related Files

### Frontend
- `packages/auth/src/providers/AuthProvider.tsx` - Auth context provider
- `packages/client-sdk/src/services/auth.service.ts` - Auth service (FIX HERE)

### Backend
- `apps/api/src/modules/auth/idporten-oidc.controller.ts` - OAuth callback handler
- `apps/api/src/modules/auth/auth.controller.ts` - Session management
- `apps/api/src/config/cookies.ts` - Cookie configuration

### Supporting
- `packages/sdk-core/src/http/fetch-client.ts` - HTTP client (credentials: 'include')
- `apps/api/src/modules/auth/session.service.ts` - Session management

---

## Recommendations

### Immediate Action (Critical)

1. **Add `handleOAuthCallback` method to AuthService** - Fixes the immediate bug
2. **Test OAuth flow end-to-end** - Verify cookies are set correctly
3. **Add error logging** - Better debugging for OAuth failures

### Long-term Improvements

1. **Refactor to server-side OAuth only** - Remove client-side code handling
2. **Add integration tests** - Test OAuth flow in CI/CD
3. **Improve error messages** - User-friendly OAuth error handling
4. **Add OAuth provider detection** - Support multiple providers gracefully

---

## Conclusion

The authentication works correctly up until the OAuth callback. The bug is a **missing method** (`handleOAuthCallback`) in the authService that prevents the frontend from exchanging the authorization code for a session.

**Fix:** Add the missing method to `packages/client-sdk/src/services/auth.service.ts` to call the API's OAuth callback endpoint.

**Priority:** 🔴 **P0 - Critical** - Blocks all OAuth-based logins
