# Configuration Duplication Map

**Date:** 2026-01-20  
**Scope:** Cross-app analysis of duplicate configs

---

## Summary

| Duplication Type | Instances | Impact |
|------------------|-----------|--------|
| QueryClient creation | 6 apps | HIGH - Inconsistent cache settings |
| SDK initialization | 6 apps | HIGH - Repeated boilerplate |
| Provider stacks | 6 apps | HIGH - 92% code duplication |
| Env parsing | 6 apps | MEDIUM - Same vars read differently |
| Locale initialization | 6 apps | LOW - All use 'nb' default |

---

## Identical Configs Repeated Across Apps

### 1. QueryClient Creation (6 duplicates)

**Pattern (identical in all non-migrated apps):**
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});
```

**Files:**
- `apps/web/src/main.tsx:17-24`
- `apps/backoffice/src/main.tsx:17-24`
- ~~`apps/saas-admin/src/main.tsx`~~ ➜ Migrated to RuntimeProvider
- ~~`apps/docs-learning/src/main.tsx`~~ ➜ Migrated to RuntimeProvider
- ~~`apps/monitoring/src/main.tsx`~~ ➜ Migrated to RuntimeProvider
- ~~`apps/minside/src/main.tsx`~~ ➜ Migrated to RuntimeProvider

**Recommendation:** Centralize in `packages/runtime/src/RuntimeProvider.tsx:43-53`

---

### 2. SDK Initialization (6 duplicates)

**Pattern:**
```typescript
initializeClient({
  baseUrl: import.meta.env.VITE_API_URL || 'https://api.digilist.no',
  tenantId: import.meta.env.VITE_TENANT_ID || 'default',
  licenseKey: import.meta.env.VITE_LICENSE_KEY || 'dev-key',
});
```

**Files:**
- `apps/web/src/main.tsx:10-14`
- `apps/backoffice/src/main.tsx:10-14`
- `apps/saas-admin/src/main.tsx:17-21`
- `apps/docs-learning/src/main.tsx:17-21`
- `apps/monitoring/src/main.tsx:14-22`
- `apps/minside/src/main.tsx:14-22`

**Recommendation:** Move to `packages/config` and call from RuntimeProvider

---

### 3. Provider Stack Composition (6 duplicates, 92% similar)

**Pattern (pre-RuntimeProvider):**
```
QueryClientProvider
  ThemeProvider
    I18nProvider
      DesignsystemetProvider
        DialogProvider
          ErrorBoundary
            AuthProvider
              [App-specific providers]
                Routes
```

**Duplication Evidence:**
| Provider | apps/web | apps/backoffice | apps/saas-admin | apps/minside | apps/monitoring |
|----------|----------|-----------------|-----------------|--------------|-----------------|
| QueryClientProvider | ✓ | ✓ | RuntimeProvider | RuntimeProvider | RuntimeProvider |
| ThemeProvider | ✓ | ✓ | RuntimeProvider | RuntimeProvider | RuntimeProvider |
| I18nProvider | ✓ | ✓ | RuntimeProvider | RuntimeProvider | RuntimeProvider |
| DesignsystemetProvider | ✓ | ✓ | RuntimeProvider | RuntimeProvider | RuntimeProvider |
| DialogProvider | ✓ | ✓ | RuntimeProvider | RuntimeProvider | RuntimeProvider |
| ErrorBoundary | ✓ | ✓ | RuntimeProvider | RuntimeProvider | RuntimeProvider |
| AuthProvider | ✓ | ✓ | RuntimeProvider | RuntimeProvider | RuntimeProvider |
| NotificationCenterProvider | ✓ | ✓ | RuntimeProvider | RuntimeProvider | RuntimeProvider |

**Lines Duplicated:** ~80 lines per app × 6 apps = **480 lines** of duplicate provider wiring

---

## Mismatched Env Keys and Defaults

### Env Variable Usage

| Variable | web | backoffice | saas-admin | minside | monitoring | docs-learning |
|----------|-----|------------|------------|---------|------------|---------------|
| VITE_API_URL | ✓ default: api.digilist.no | ✓ same | ✓ same | ✓ same | ✓ same | ✓ same |
| VITE_WS_URL | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| VITE_TENANT_ID | ✓ default: 'default' | ✓ same | ✓ same | ✓ same | ✓ same | ✓ same |
| VITE_LICENSE_KEY | ✓ default: 'dev-key' | ✓ same | ✓ same | ✓ same | ✓ same | ✓ same |
| X-User-Id header | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ |

**Divergence:** minside and monitoring add `X-User-Id` header for dev testing

---

## Divergent Provider Stacks

### BackofficeRoleProvider (backoffice only)

**File:** `apps/backoffice/src/providers/BackofficeRoleProvider.tsx`

Purpose: Manages dual-role context (tenant admin + org roles)

**Should Move To:** `packages/runtime/src/providers/RoleProvider.tsx` (configurable)

---

### CapabilityProvider (backoffice only)

**File:** `apps/backoffice/src/providers/CapabilityProvider.tsx`

Purpose: Capability-based access control

**Should Move To:** `packages/runtime/src/providers/CapabilityProvider.tsx`

---

### AccountContextProvider (minside + monitoring)

**Files:**
- `apps/minside/src/providers/AccountContextProvider.tsx`
- `apps/monitoring/src/providers/AccountContextProvider.tsx`

**Duplication:** 100% identical (334 lines each)

**Should Move To:** `packages/runtime/src/providers/AccountContextProvider.tsx`

---

## Changes That Don't Propagate

| Change | Requires Update In |
|--------|-------------------|
| QueryClient staleTime | 6 app main.tsx files (now 2) |
| Default locale change | 6 app provider trees (now 2) |
| Theme change | 6 app provider trees (now 2) |
| Auth config change | 6 app AuthProvider usages (now 2) |
| New provider added | 6 app provider trees (now 2) |

**After RuntimeProvider Migration:**
- Changes to RuntimeProvider propagate to all apps automatically
- Only 1 place to update for cross-cutting concerns

---

## Quantified Duplication

| Metric | Before RuntimeProvider | After (4 migrated) | After (all migrated) |
|--------|----------------------|-------------------|---------------------|
| Provider files to maintain | 14 | 6 | 2 |
| Lines of provider code in apps | ~600 | ~200 | ~50 |
| SDK init code duplicates | 6 | 6 | 1 |
| QueryClient duplicates | 6 | 2 | 0 |
| Places to update for new feature | 6 | 2 | 1 |
