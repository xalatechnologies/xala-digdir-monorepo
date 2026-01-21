# SaaS Admin Platform-Only Audit Report

**Date:** 2026-01-21
**Audit Scope:** apps/saas-admin dependency analysis
**Goal:** Verify saas-admin is platform-only (no @digilist/* domain imports)

---

## Executive Summary

The `apps/saas-admin` application currently has **3 files** with `@digilist/*` imports. These are marked with `// platform-exempt` comments indicating intentional exemptions. However, since saas-admin should be a **platform-only application**, these imports represent architectural violations that should be remediated.

**Verdict:** PARTIAL COMPLIANCE - 3 domain imports found, all remediable

---

## 1. Current @digilist/* Imports Found

### 1.1 Source Code Imports

| File | Import | Usage |
|------|--------|-------|
| `src/hooks/useDemoLogin.tsx:9` | `authService` from `@digilist/client-sdk` | Demo token validation |
| `src/routes/login.tsx:16` | `idportenService` from `@digilist/client-sdk` | OAuth authorization initiation |
| `src/routes/users/index.tsx:18` | `useUsers` from `@digilist/client-sdk/hooks` | Platform-wide user listing |

### 1.2 Configuration References

**vite.config.ts** contains aliases for `@digilist/client-sdk`:
```typescript
'@digilist/client-sdk/hooks': path.resolve(__dirname, '../../packages/client-sdk/dist/hooks/index.mjs'),
'@digilist/client-sdk/types': path.resolve(__dirname, '../../packages/client-sdk/dist/types/index.mjs'),
'@digilist/client-sdk/services': path.resolve(__dirname, '../../packages/client-sdk/dist/services/index.mjs'),
'@digilist/client-sdk': path.resolve(__dirname, '../../packages/client-sdk/dist/index.mjs'),
```

### 1.3 Documentation References (Not Code Issues)

The following files reference `@digilist/client-sdk` in documentation/examples only:
- `apps/saas-admin/CLAUDE.md` - Integration examples
- `apps/saas-admin/AGENTS.md` - Code patterns

---

## 2. Package.json Analysis

**Current dependencies in package.json:**

```json
{
  "dependencies": {
    "@xala/auth": "workspace:*",
    "@xala/config": "workspace:*",
    "@xalatechnologies/platform": "workspace:*",
    "@xala/i18n": "workspace:*",
    "@xala/runtime": "workspace:*"
  }
}
```

**Finding:** NO explicit `@digilist/*` dependencies in package.json. The imports work via Vite aliases pointing to `packages/client-sdk/dist/`.

---

## 3. Why saas-admin SHOULD Be Platform-Only

The saas-admin application manages:
- **Tenant configuration** - Cross-tenant, not domain-specific
- **Billing/subscriptions** - Platform infrastructure
- **Feature flags** - Platform-level toggles
- **Plan management** - SaaS tiers, not booking domain
- **Route/Nav policies** - Access control configuration
- **User management** - Platform users across all tenants

None of these features require domain-specific (Digilist booking) contracts or services. The current `@digilist/client-sdk` imports could all be replaced with platform-level equivalents.

---

## 4. Recommended Changes

### 4.1 Authentication Services (authService, idportenService)

**Current Import:**
```typescript
import { authService } from '@digilist/client-sdk';
import { idportenService } from '@digilist/client-sdk';
```

**Recommended Migration:**

These services are already exported from `@digilist/client-sdk/platform-services`:
```typescript
// packages/client-sdk/src/platform-services/index.ts
export { AuthService, authService } from '../services/auth.service';
export { idportenService } from '../services/idporten.service';
```

**Solution Options:**

1. **Option A (Recommended):** Create platform SDK export
   - Create `@xalatechnologies/platform/sdk` entry point
   - Re-export platform services from client-sdk
   - Update saas-admin to import from platform package

2. **Option B:** Use `@xala/auth` dependency injection
   - The `@xala/auth` package supports dependency injection
   - Inject auth service via `AuthServiceProvider`

### 4.2 User Management Hook (useUsers)

**Current Import:**
```typescript
import { useUsers } from '@digilist/client-sdk/hooks';
```

**Recommended Migration:**

The `useUsers` hook fetches platform users (not domain-specific). Options:

1. **Option A (Recommended):** Move to platform hooks
   - Export `useUsers` from `@xalatechnologies/platform/hooks`
   - This hook is inherently platform-level (user management)

2. **Option B:** Create saas-specific user service
   - Create `@xala/runtime/services/user.service.ts`
   - Export hook from `@xala/runtime/hooks`

### 4.3 Vite Configuration

**Recommended Changes:**

Remove `@digilist/client-sdk` aliases from `vite.config.ts` after migration:
```typescript
// REMOVE these after migration:
'@digilist/client-sdk/hooks': ...,
'@digilist/client-sdk/types': ...,
'@digilist/client-sdk/services': ...,
'@digilist/client-sdk': ...,
```

Update `optimizeDeps.exclude` to remove:
```typescript
exclude: ['@digilist/client-sdk'], // REMOVE
```

---

## 5. Migration Path

### Phase 1: Create Platform SDK Exports (Low Risk)

1. Create `packages/platform/src/sdk/index.ts` with platform services
2. Export `authService`, `idportenService` from platform-services
3. Export `useUsers` hook (platform-level user management)

### Phase 2: Update saas-admin Imports (Medium Risk)

1. Update `src/hooks/useDemoLogin.tsx`:
   ```typescript
   // Before
   import { authService } from '@digilist/client-sdk';

   // After
   import { authService } from '@xalatechnologies/platform/sdk';
   ```

2. Update `src/routes/login.tsx`:
   ```typescript
   // Before
   import { idportenService } from '@digilist/client-sdk';

   // After
   import { idportenService } from '@xalatechnologies/platform/sdk';
   ```

3. Update `src/routes/users/index.tsx`:
   ```typescript
   // Before
   import { useUsers } from '@digilist/client-sdk/hooks';

   // After
   import { useUsers } from '@xalatechnologies/platform/hooks';
   ```

### Phase 3: Clean Up Configuration (Low Risk)

1. Remove `@digilist/*` aliases from `vite.config.ts`
2. Update documentation (CLAUDE.md, AGENTS.md)
3. Run verification: `pnpm verify:boundaries`

---

## 6. Risk Assessment

| Change | Risk Level | Justification |
|--------|------------|---------------|
| Create platform SDK exports | **Low** | Additive change, no breaking changes |
| Update auth imports | **Medium** | Auth is sensitive; requires testing |
| Update useUsers import | **Low** | Simple hook migration |
| Remove vite aliases | **Low** | After all imports updated |

### Overall Risk: **LOW-MEDIUM**

The migration is straightforward because:
1. Services already exist in platform-services
2. No domain-specific logic in current usage
3. Changes are import path updates only

### Testing Requirements

After migration:
- [ ] Demo login works in saas-admin
- [ ] ID-porten/BankID login works
- [ ] User management page loads and displays users
- [ ] No console errors about missing modules
- [ ] Build succeeds without @digilist/* imports

---

## 7. Compliance Verification

After completing migration, run:

```bash
# Verify no @digilist/* imports remain
grep -r "@digilist/" apps/saas-admin/src/

# Expected: No matches

# Verify boundaries
pnpm verify:boundaries

# Expected: saas-admin passes platform-only check
```

---

## 8. Conclusion

The saas-admin application has 3 domain imports that violate the platform-only principle. All imports can be migrated to platform packages with low-medium risk. The services being imported (auth, ID-porten, users) are inherently platform-level and should not require domain SDK.

**Recommended Priority:** Medium
**Estimated Effort:** 2-4 hours
**Dependencies:** None (platform services already exist)

---

## Appendix: File Inventory

### Files with @digilist/* imports (3):
1. `/apps/saas-admin/src/hooks/useDemoLogin.tsx`
2. `/apps/saas-admin/src/routes/login.tsx`
3. `/apps/saas-admin/src/routes/users/index.tsx`

### Files with @digilist/* in documentation (2):
1. `/apps/saas-admin/CLAUDE.md`
2. `/apps/saas-admin/AGENTS.md`

### Configuration files with @digilist/* references (1):
1. `/apps/saas-admin/vite.config.ts` (aliases)

---

**Report Author:** Claude Code Audit
**Review Status:** Pending
