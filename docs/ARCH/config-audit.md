# Configuration Audit Report

**Date:** 2026-01-20  
**Status:** Phase 1 Complete  
**Scope:** All apps under `/apps/*`

---

## Executive Summary

| App | Entry File | Provider Mounts | Env Parsers | SDK Builders | Query Clients | Flag Evals | Status |
|-----|-----------|-----------------|-------------|--------------|---------------|------------|--------|
| saas-admin | `main.tsx` | 1 (RuntimeProvider) | 1 | 1 | 0 (in Runtime) | 0 | ✅ MIGRATED |
| docs-learning | `main.tsx` | 1 (RuntimeProvider) | 1 | 1 | 0 (in Runtime) | 0 | ✅ MIGRATED |
| monitoring | `main.tsx` | 1 (RuntimeProvider) | 1 | 1 | 0 (in Runtime) | 0 | ✅ MIGRATED |
| minside | `main.tsx` | 1 (RuntimeProvider) | 1 | 1 | 0 (in Runtime) | 0 | ✅ MIGRATED |
| web | `main.tsx` | 1 (RuntimeProvider) | 1 | 1 | 0 (in Runtime) | 0 | ✅ MIGRATED |
| backoffice | `main.tsx` | 1 (RuntimeProvider) | 1 | 1 | 0 (in Runtime) | 0 | ✅ MIGRATED |

**✅ ALL 6 APPS NOW MIGRATED TO RuntimeProvider** (Updated 2026-01-20)

---

## Per-App Analysis

### 1. saas-admin ✅ MIGRATED

**Entry:** `apps/saas-admin/src/main.tsx`

```typescript
<RuntimeProvider config={{ appType: 'saas-admin', apiUrl: ... }}>
  <App />
</RuntimeProvider>
```

**Provider Tree:** Single RuntimeProvider composes all
- QueryClientProvider (internal)
- ThemeProvider (internal)
- I18nProvider (internal)
- DialogProvider (internal)
- ErrorBoundary (internal)
- AuthProvider (internal)
- FeatureFlagsProvider (internal)
- TenantProvider (internal)
- NotificationCenterProvider (internal)

**Env Reading:**
- `main.tsx:28-35` - VITE_API_URL, VITE_WS_URL, VITE_TENANT_ID, VITE_LICENSE_KEY

**SDK Client Creation:**
- `main.tsx:17-21` - `initializeClient({ baseUrl, tenantId, licenseKey })`

**Query Client:** None (managed by RuntimeProvider)

**Localization:** Via RuntimeProvider `locale: 'nb'`

**Flags/RBAC:** Via RuntimeProvider hooks

**Local Providers Deleted:**
- `src/providers/ToastProvider.tsx` ❌ DELETED
- `src/providers/ThemeProvider.tsx` ❌ DELETED  
- `src/providers/AuthProvider.tsx.backup` ❌ DELETED

---

### 2. docs-learning ✅ MIGRATED

**Entry:** `apps/docs-learning/src/main.tsx`

```typescript
<RuntimeProvider config={{ appType: 'docs-learning', apiUrl: ... }}>
  <App />
</RuntimeProvider>
```

**Provider Tree:** Single RuntimeProvider

**Env Reading:**
- `main.tsx:28-35` - Same env vars as saas-admin

**SDK Client Creation:**
- `main.tsx:17-21` - `initializeClient(...)`

**Local Providers Deleted:**
- `src/providers/ToastProvider.tsx` ❌ DELETED

---

### 3. monitoring ✅ MIGRATED

**Entry:** `apps/monitoring/src/main.tsx`

```typescript
<RuntimeProvider config={{ appType: 'monitoring', apiUrl: ... }}>
  <App />
</RuntimeProvider>
```

**Provider Tree:** RuntimeProvider + AccountContextProvider (app-specific)

**App-Specific Context:**
- `src/providers/AccountContextProvider.tsx` - KEPT (business logic for account switching)

**Env Reading:**
- `main.tsx` - Standard env vars + X-User-Id header

---

### 4. minside ✅ MIGRATED

**Entry:** `apps/minside/src/main.tsx`

```typescript
<RuntimeProvider config={{ appType: 'minside', apiUrl: ... }}>
  <App />
</RuntimeProvider>
```

**Provider Tree:** RuntimeProvider + AccountContextProvider (app-specific)

**App-Specific Context:**
- `src/providers/AccountContextProvider.tsx` - KEPT (business logic for account switching)

---

### 5. web ✅ MIGRATED

**Entry:** `apps/web/src/main.tsx`

```typescript
<RuntimeProvider config={{ appType: 'web', apiUrl: ... }}>
  <App />
</RuntimeProvider>
```

**Provider Tree:** Single RuntimeProvider composes all

**Env Reading:**
- `main.tsx:17-20` - VITE_API_URL, VITE_TENANT_ID, VITE_LICENSE_KEY

**SDK Client Creation:**
- `main.tsx:16-20` - `initializeClient({ baseUrl, tenantId, licenseKey })`

**Query Client:** None (managed by RuntimeProvider)

**Local Providers:** None (app-specific providers cleaned up)

---

### 6. backoffice ✅ MIGRATED

**Entry:** `apps/backoffice/src/main.tsx`

```typescript
<RuntimeProvider config={{ appType: 'backoffice', apiUrl: ... }}>
  <App />
</RuntimeProvider>
```

**Provider Tree:** Single RuntimeProvider composes all

**Env Reading:**
- `main.tsx:17-20` - VITE_API_URL, VITE_TENANT_ID, VITE_LICENSE_KEY

**SDK Client Creation:**
- `main.tsx:16-20` - `initializeClient({ baseUrl, tenantId, licenseKey })`

**Query Client:** None (managed by RuntimeProvider)

**Local Providers (App-Specific - KEPT):**
- `src/providers/BackofficeRoleProvider.tsx` - App-specific role context (kept)
- `src/providers/CapabilityProvider.tsx` - App-specific capability checks (kept)

---

## Summary Statistics

| Metric | Before | After (ALL 6 migrated) | Target |
|--------|--------|------------------------|--------|
| Total provider mounts across apps | 48+ | 6 | 6 ✅ |
| Apps with RuntimeProvider | 0 | 6 | 6 ✅ |
| Local provider files | 14 | 4 | 2 |
| Duplicate QueryClient creations | 6 | 0 | 0 ✅ |
| Env parsers in apps | 6 | 6 | 0 |
| SDK initializers in apps | 6 | 6 | 0 |

**Remaining Work:**
- Centralize SDK initialization (move to packages/config)
- Centralize env parsing (move to packages/config)
- Move remaining local providers to packages/runtime (4 remain: 2 AccountContext, 2 backoffice-specific)

---

## File Path Evidence

### All Apps (RuntimeProvider) ✅
- `apps/saas-admin/src/main.tsx:24-42`
- `apps/docs-learning/src/main.tsx:24-42`
- `apps/monitoring/src/main.tsx:28-46`
- `apps/minside/src/main.tsx:28-46`
- `apps/web/src/main.tsx:24-42`
- `apps/backoffice/src/main.tsx:24-42`

### RuntimeProvider Package
- `packages/runtime/src/RuntimeProvider.tsx` - Main provider composition
- `packages/runtime/src/createRuntime.tsx` - Test factory
- `packages/runtime/src/hooks/` - Hook accessors
- `packages/runtime/src/types.ts` - Type definitions

### App-Specific Providers (KEPT - Business Logic)
- `apps/minside/src/providers/AccountContextProvider.tsx` - Account switching
- `apps/monitoring/src/providers/AccountContextProvider.tsx` - Account switching (duplicate)
- `apps/backoffice/src/providers/BackofficeRoleProvider.tsx` - Role context
- `apps/backoffice/src/providers/CapabilityProvider.tsx` - Capability checks
