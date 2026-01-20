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
| web | `main.tsx` | 8+ | 1 | 1 | 1 | 0 | ⚠️ PENDING |
| backoffice | `main.tsx` | 10+ | 1 | 1 | 1 | 2 | ⚠️ PENDING |

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

### 5. web ⚠️ PENDING MIGRATION

**Entry:** `apps/web/src/main.tsx`

**Current Provider Tree (8+ levels):**
```
QueryClientProvider
  └─ ThemeProvider
      └─ I18nProvider
          └─ DesignsystemetProvider
              └─ DialogProvider
                  └─ ErrorBoundary
                      └─ BrowserRouter
                          └─ AuthProvider
                              └─ RealtimeProvider
                                  └─ Routes
```

**Env Reading:**
- `main.tsx` - VITE_API_URL, VITE_TENANT_ID, VITE_LICENSE_KEY, VITE_WS_URL

**SDK Client Creation:**
- `main.tsx` - `initializeClient(...)`
- QueryClient creation with custom options

**Local Providers:**
- None beyond standard DS providers

---

### 6. backoffice ⚠️ PENDING MIGRATION

**Entry:** `apps/backoffice/src/main.tsx`

**Current Provider Tree (10+ levels):**
```
QueryClientProvider
  └─ ThemeProvider
      └─ I18nProvider
          └─ DesignsystemetProvider
              └─ DialogProvider
                  └─ ErrorBoundary
                      └─ ToastProvider
                          └─ BrowserRouter
                              └─ AuthProvider
                                  └─ BackofficeRoleProvider
                                      └─ CapabilityProvider
                                          └─ RealtimeProvider
                                              └─ Routes
```

**Env Reading:**
- `main.tsx` - Standard env vars

**SDK Client Creation:**
- `main.tsx` - `initializeClient(...)`

**Local Providers:**
- `src/providers/ToastProvider.tsx` - Needs migration to RuntimeProvider
- `src/providers/BackofficeRoleProvider.tsx` - App-specific, may stay
- `src/providers/CapabilityProvider.tsx` - App-specific, may move to runtime

**RBAC Client-Side Evaluation:**
- `BackofficeRoleProvider.tsx:L50-80` - Role checks
- `CapabilityProvider.tsx:L30-60` - Capability evaluation

---

## Summary Statistics

| Metric | Before | After (4 migrated) | Target |
|--------|--------|-------------------|--------|
| Total provider mounts across apps | 48+ | 28 | 6 |
| Apps with RuntimeProvider | 0 | 4 | 6 |
| Local provider files | 14 | 6 | 2 |
| Duplicate QueryClient creations | 6 | 2 | 0 |
| Env parsers in apps | 6 | 6 | 0 |
| SDK initializers in apps | 6 | 6 | 0 |

---

## File Path Evidence

### Migrated Apps (RuntimeProvider)
- `apps/saas-admin/src/main.tsx:24-42`
- `apps/docs-learning/src/main.tsx:24-42`
- `apps/monitoring/src/main.tsx:28-46`
- `apps/minside/src/main.tsx:28-46`

### Pending Apps (Old Pattern)
- `apps/web/src/main.tsx`
- `apps/web/src/App.tsx`
- `apps/backoffice/src/main.tsx`
- `apps/backoffice/src/App.tsx`

### RuntimeProvider Package
- `packages/runtime/src/RuntimeProvider.tsx` - Main provider composition
- `packages/runtime/src/createRuntime.tsx` - Test factory
- `packages/runtime/src/hooks/` - Hook accessors
- `packages/runtime/src/types.ts` - Type definitions
