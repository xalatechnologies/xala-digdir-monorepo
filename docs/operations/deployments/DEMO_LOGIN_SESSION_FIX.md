# Demo Login Session Fix 🔧

**Date:** 2026-01-16 19:33 CET  
**Status:** ✅ FIXED  

## Problem Identified

The demo login flow was broken because:

1. ✅ API `/api/auth/demo-token` returns a JWT token
2. ❌ JWT token was stored in localStorage but not used
3. ❌ SDK client wasn't configured to send the token
4. ❌ Subsequent `/api/auth/session` call had no Authorization header
5. ❌ API returned 401 → app redirected to login

## Root Cause

The `/api/auth/session` endpoint (line 96 in auth.controller.ts) expects:
```typescript
const userId = (request as any).userId;  // Set by JWT middleware
```

This `userId` is set by authentication middleware that validates the `Authorization: Bearer <token>` header.

Without the token in the request, `userId` is undefined → 401 error → redirect to login.

## Solution Applied

Updated `apps/web/src/hooks/useDemoLogin.tsx`:

1. **Import `setAuthToken`** from SDK
   ```typescript
   import { authService, setAuthToken } from '@digilist/client-sdk';
   ```

2. **Update SDK client config** with JWT token immediately after login
   ```typescript
   if (response.data?.token && response.data?.user) {
     // Update SDK client with JWT token for authenticated API calls
     setAuthToken(response.data.token);
     
     // Store for persistence
     localStorage.setItem('digilist_token', response.data.token);
     localStorage.setItem('web_user', JSON.stringify(response.data.user));
     
     // Verify session works
     const sessionCheck = await authService.getSession();
     console.log('[DEMO LOGIN] Session verified:', sessionCheck.data);
   }
   ```

## How It Works Now

```
User submits demo token
    ↓
API validates token
    ↓
API returns JWT + user data
    ↓
SDK client updated with JWT ← FIX
    ↓
localStorage stores token
    ↓
Call /session with Authorization header ← NOW WORKS
    ↓
Session verified!
    ↓
Redirect to app
```

## Testing

Try demo login with:
- `skien-admin-001` → admin@skien.kommune.no (admin)
- `skien-citizen-001` → ola.hansen@kommune.no (user)  
- `xala-demo-001` → demo@xala.no (admin)

**Expected:** Should log in successfully and stay logged in!

## Next: Minside Issue

User reported: "minside still jumps to dashboard"

Need to check if:
1. Minside has demo login functionality
2. Minside has the same session issue with OAuth
3. Minside's AuthProvider is checking sessions correctly

---
**Status:** Web demo login FIXED ✅ | Minside investigation needed 🔍
