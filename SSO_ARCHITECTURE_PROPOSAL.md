# Centralized SSO Authentication Architecture
**Date:** 2026-01-16 19:07 CET  
**Status:** Proposal - Implementation Recommended

## Current Situation

You currently have **4 separate apps** with **duplicated AuthProvider code**:
- `apps/minside/src/providers/AuthProvider.tsx` (446 lines)
- `apps/backoffice/src/providers/AuthProvider.tsx` (382 lines)
- `apps/saas-admin/src/providers/AuthProvider.tsx` (~300 lines)
- `apps/tenant-admin/src/providers/AuthProvider.tsx` (~300 lines)

**Total duplicated code:** ~1,400 lines of nearly identical authentication logic!

## The Good News: You Already Have SSO Infrastructure! 🎉

Your current architecture already implements most of SSO:

### ✅ What You Have
1. **Centralized Auth Service**
   - `@digilist/client-sdk/services/authService`
   - All apps use the same service

2. **Shared Session Cookies**
   - HTTP-only cookies set by `api.digilist.no`
   - Domain: `.digilist.no` (works across all subdomains)
   - When user logs into one app, cookie is shared with all apps!

3. **OAuth Integration**
   - ID-porten, Microsoft, Vipps providers
   - Proper OAuth 2.0 Authorization Code flow
   - Single callback endpoint per app

### ❌ What's Duplicated (The Problem)
- AuthProvider component logic (1,400+ lines!)
- Mock auth code (security risk)
- Session validation logic
- Flow context restoration
- Logout logic

## Recommended Architecture: Centralized AuthProvider

### Phase 1: Create Shared Auth Package (Immediate)

```
packages/auth/
├── src/
│   ├── providers/
│   │   └── AuthProvider.tsx       # Single source of truth
│   ├── hooks/
│   │   ├── useAuth.ts             # Consolidated hook
│   │   └── useAuthGuard.ts        # Protected route logic
│   ├── components/
│   │   ├── ProtectedRoute.tsx     # Shared guard component
│   │   └── LoginPage.tsx          # Optional: shared login UI
│   └── types/
│       └── auth.types.ts          # Unified types
└── package.json
```

**Benefits:**
- ✅ Single source of truth for auth logic
- ✅ No code duplication
- ✅ No mock auth (removed entirely)
- ✅ Easier to test (one test suite)
- ✅ Consistent behavior across all apps
- ✅ Bug fixes apply to all apps automatically

### Phase 2: Enhanced SSO Features (Future)

Once the shared provider is in place, you can add:

1. **Cross-Tab Session Sync** (already partially implemented!)
   - When user logs out in one tab, all tabs log out
   - When session expires, all tabs redirect to login

2. **Single Login Page**
   - Create `auth.digilist.no` or use `api.digilist.no/login`
   - All apps redirect there for login
   - After login, redirect back to original app

3. **Token Refresh**
   - Automatic session renewal
   - Sliding window expiration

4. **Role-Based Routing**
   - Different users see different apps based on roles
   - Admin dashboard at `admin.digilist.no`
   - Citizen portal at `minside.digilist.no`

## Implementation Plan

### Step 1: Create `@xala/auth` Package (2-3 hours)

```bash
# Create package structure
mkdir -p packages/auth/src/{providers,hooks,components,types}

# Move consolidated AuthProvider to shared package
# This becomes the SINGLE source of truth
```

**File: `packages/auth/src/providers/AuthProvider.tsx`**
```typescript
/**
 * Centralized Authentication Provider
 * Used by ALL applications in the Digilist ecosystem
 * 
 * ✅ NO MOCK AUTH - Always uses real OAuth
 * ✅ HTTP-only cookie-based sessions
 * ✅ Cross-subdomain SSO via .digilist.no cookies
 */
import { authService } from '@digilist/client-sdk/services';

export function AuthProvider({ children, appType }: AuthProviderProps) {
  // Single implementation used by all apps
  // appType: 'backoffice' | 'minside' | 'saas-admin' | 'tenant-admin'
  
  // Role-based access control per app type
  // Backoffice: admin, saksbehandler allowed
  // Minside: citizen, admin allowed
  // SaaS Admin: super_admin, admin allowed
  // Tenant Admin: tenant_admin allowed
}
```

### Step 2: Update Each App (30 min per app)

**Before:**
```typescript
// apps/minside/src/providers/AuthProvider.tsx (446 lines)
export function AuthProvider({ children }: AuthProviderProps) {
  // 446 lines of duplicated logic...
}
```

**After:**
```typescript
// apps/minside/src/App.tsx
import { AuthProvider } from '@xala/auth';

function App() {
  return (
    <AuthProvider appType="minside">
      <YourApp />
    </AuthProvider>
  );
}
```

**Lines of code reduction:** 1,400 → ~50 lines!

### Step 3: Add Comprehensive Tests (2 hours)

Test once in `@xala/auth`, benefit everywhere:
```typescript
// packages/auth/src/__tests__/AuthProvider.test.tsx
describe('AuthProvider', () => {
  it('validates session on mount', async () => {});
  it('handles OAuth callback', async () => {});
  it('enforces role-based access', async () => {});
  it('clears session on logout', async () => {});
  it('syncs across tabs', async () => {});
});
```

### Step 4: Enhanced Cookie Configuration

Update API to set better cookie attributes:

```typescript
// API: apps/api/src/middleware/session.ts
{
  httpOnly: true,          // ✅ Already have
  secure: true,            // ✅ Already have
  sameSite: 'lax',         // 🔄 Change from 'strict' to 'lax'
  domain: '.digilist.no',  // ✅ Already have
  path: '/',               // ✅ Already have
  maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
}
```

**Why `sameSite: 'lax'` instead of `'strict'`?**
- Allows cookies on OAuth redirects (ID-porten → your app)
- Still protects against CSRF
- Better UX for SSO flows

## Security Considerations

### Current Security Issues (Fixed)
1. ✅ Mock auth disabled in all apps
2. ✅ Session validation fixes applied
3. ✅ Stale localStorage cleared on session failure

### Additional Security (Recommended)
1. **Session Fingerprinting**
   ```typescript
   // Detect session hijacking
   - Store User-Agent + IP hash on session creation
   - Validate on each request
   - Logout if mismatch detected
   ```

2. **Rate Limiting**
   ```typescript
   // Prevent brute force
   - Max 5 login attempts per IP per hour
   - Exponential backoff
   ```

3. **Audit Logging**
   ```typescript
   // Track authentication events
   - Log all login attempts (success/failure)
   - Log session creation/destruction
   - Log OAuth provider used
   ```

## Migration Path

### Option A: Big Bang (Recommended for small team)
1. Create `@xala/auth` package (1 day)
2. Update all 4 apps at once (1 day)
3. Test thoroughly (1 day)
4. Deploy all apps together

**Pros:** Clean, complete solution  
**Cons:** Risky, all-or-nothing

### Option B: Gradual Migration (Safer for production)
1. Create `@xala/auth` package (1 day)
2. Migrate `minside` first (1 day, test)
3. Migrate `backoffice` (1 day, test)
4. Migrate `saas-admin` (1 day, test)
5. Migrate `tenant-admin` (1 day, test)

**Pros:** Lower risk, incremental validation  
**Cons:** Slower, temporary inconsistency

## Technical Specifications

### Package Dependencies
```json
{
  "name": "@xala/auth",
  "version": "1.0.0",
  "dependencies": {
    "@digilist/client-sdk": "workspace:*",
    "react": "^18.2.0",
    "react-router-dom": "^6.20.0"
  },
  "peerDependencies": {
    "react": "^18.0.0"
  }
}
```

### Exports
```typescript
// packages/auth/src/index.ts
export { AuthProvider } from './providers/AuthProvider';
export { useAuth } from './hooks/useAuth';
export { ProtectedRoute } from './components/ProtectedRoute';
export type { 
  AuthContextType, 
  User, 
  UserRole 
} from './types';
```

### App-Specific Configuration
```typescript
// Each app can customize behavior
<AuthProvider
  appType="backoffice"
  allowedRoles={['admin', 'saksbehandler']}
  loginRedirect="/dashboard"
  unauthorizedRedirect="/access-denied"
  onAuthError={(error) => console.error(error)}
/>
```

## Comparison: Current vs Proposed

| Aspect | Current (4 Providers) | Proposed (Centralized) |
|--------|----------------------|------------------------|
| **Lines of Code** | ~1,400 | ~400 (70% reduction) |
| **Maintenance** | Fix bug 4 times | Fix once |
| **Testing** | Test 4 implementations | Test once |
| **Consistency** | Can drift apart | Always identical |
| **Mock Auth** | In all apps (risk) | Removed entirely |
| **SSO** | Works, but complex | Works, simplified |
| **Onboarding** | Review 4 files | Review 1 file |

## Next Steps

### Immediate (Today)
- ✅ Mock auth disabled in all apps (DONE)
- ✅ Security fixes applied (DONE)

### Short-term (This Week)
1. Create `@xala/auth` package structure
2. Consolidate AuthProvider logic
3. Add comprehensive tests
4. Migrate first app (minside)

### Medium-term (Next Week)
1. Migrate remaining apps
2. Remove old AuthProvider files
3. Document centralized auth system
4. Update deployment workflows

### Long-term (Next Sprint)
1. Add session fingerprinting
2. Implement audit logging
3. Add token refresh
4. Create unified login portal

## Estimated Effort

- **Package Creation:** 1-2 days
- **Migration (all apps):** 2-3 days
- **Testing & Documentation:** 1-2 days
- **Total:** 4-7 days for complete SSO centralization

## Conclusion

**You already have SSO!** The HTTP-only cookies with `.digilist.no` domain work across all subdomains. The issue is code duplication and mock auth security risks.

**Recommendation:** Create `@xala/auth` package to consolidate the 4 AuthProviders into one. This will:
- ✅ Eliminate 1,000+ lines of duplicated code
- ✅ Remove all mock auth (security improvement)
- ✅ Make SSO behavior explicit and testable
- ✅ Simplify future enhancements
- ✅ Reduce maintenance burden

**Want to proceed?** I can start creating the `@xala/auth` package right now!

---
**Created:** 2026-01-16 19:07 CET  
**Author:** Antigravity AI  
**Status:** Ready for implementation
