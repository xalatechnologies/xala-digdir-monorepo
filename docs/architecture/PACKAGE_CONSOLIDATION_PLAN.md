# Package Consolidation Plan: @xala/* to @xalatechnologies/platform

> **Status:** Planning
> **Created:** 2026-01-21
> **Target Completion:** Phase 1 by 2026-02-01, Full migration by 2026-03-01

## Executive Summary

This document outlines the migration strategy for consolidating the fragmented `@xala/*` namespace packages into a unified `@xalatechnologies/platform` package. The goal is to simplify imports, reduce maintenance overhead, and establish clear boundaries between platform (domain-agnostic) and domain-specific (`@digilist/*`) code.

---

## 1. Current State Analysis

### 1.1 Existing @xala/* Packages

| Package | Status | Exports | Size | Dependencies |
|---------|--------|---------|------|--------------|
| `@xala/ds` | **DELETED** (git status shows deletion) | Design system facade | - | Was @digdir/designsystemet-react |
| `@xala/i18n` | Active | I18n provider, hooks, formatters | 1,387 translation keys | js-cookie, react |
| `@xala/auth` | Active (LOCKED) | AuthProvider, hooks, OAuth support | ~100 exports | react, react-router-dom |
| `@xala/config` | Active | Env validation, app profiles | ~25 exports | zod |
| `@xala/runtime` | Active | RuntimeProvider, hooks, factories | ~50 exports | @digdir/designsystemet-react, @tanstack/react-query |
| `@xala/sdk-core` | Active | HTTP client, errors, retry, query keys | ~50 exports | - (peer: @tanstack/react-query) |
| `@xala/contracts` | Active | Zod schemas, platform types | ~30 exports | zod |
| `@xala/observability` | Active | Metrics, logging, exporters | ~30 exports | prom-client |

### 1.2 Target @xalatechnologies/platform Package

The `@xalatechnologies/platform` package already exists with the following subpath exports configured:

| Subpath | Current Status | Target Source |
|---------|---------------|---------------|
| `./ui` | Implemented | Migrated from @xala/ds |
| `./ui/primitives` | Implemented | @digdir/designsystemet-react + custom |
| `./ui/composed` | Implemented | Custom composed components |
| `./ui/shells` | Implemented | App shell layouts |
| `./ui/blocks` | Implemented | Business logic components |
| `./ui/themes` | Implemented | Theme utilities |
| `./ui/patterns` | Implemented | Platform UI patterns |
| `./runtime` | Partial (stubs) | @xala/runtime |
| `./auth` | Partial (stubs) | @xala/auth |
| `./config` | Partial | @xala/config + domain registry |
| `./contracts` | Partial (basic schemas) | @xala/contracts |
| `./sdk` | Implemented | @xala/sdk-core |
| `./sdk/saas` | Implemented | SaaS admin SDK |
| `./i18n` | Implemented | @xala/i18n |
| `./observability` | Implemented | @xala/observability |

---

## 2. Migration Strategy

### 2.1 Guiding Principles

1. **Backward Compatibility First** - Old @xala/* imports continue to work via re-exports
2. **Incremental Migration** - Migrate one package at a time, verify, then proceed
3. **Zero Downtime** - Production systems never break during migration
4. **Domain Separation** - Platform packages NEVER import from @digilist/*
5. **Single Source of Truth** - Each export exists in exactly one location

### 2.2 Migration Phases

```
Phase 1: Foundation (Week 1)
├── Verify @xalatechnologies/platform structure
├── Complete stub implementations
└── Set up re-export compatibility layer

Phase 2: Core Migration (Weeks 2-3)
├── @xala/sdk-core → @xalatechnologies/platform/sdk
├── @xala/contracts → @xalatechnologies/platform/contracts
├── @xala/i18n → @xalatechnologies/platform/i18n
└── @xala/observability → @xalatechnologies/platform/observability

Phase 3: Provider Migration (Week 4)
├── @xala/config → @xalatechnologies/platform/config
├── @xala/runtime → @xalatechnologies/platform/runtime
└── @xala/auth → @xalatechnologies/platform/auth

Phase 4: App Updates (Weeks 5-6)
├── Update all apps to use new imports
├── Add deprecation warnings to old packages
└── Update documentation

Phase 5: Cleanup (Week 7+)
├── Remove deprecated packages (after grace period)
├── Final documentation updates
└── Archive old package code
```

---

## 3. Package-by-Package Migration

### 3.1 @xala/sdk-core → @xalatechnologies/platform/sdk

**Status:** Already implemented in platform package

**Current @xala/sdk-core exports:**
```typescript
// HTTP Client
FetchHttpClient, initializeClient, getClient, getClientConfig,
isClientInitialized, updateClientConfig, setAuthToken, clearAuthToken,
setTenantId, clearTenantId, resetClient, createClient

// Errors
ApiError, isProblemDetails, parseProblemDetails, ProblemDetailsFactory

// Query Keys
createQueryKeyFactory, mergeQueryKeyFactories, createScopedQueryKey,
matchQueryKey, serializeQueryParams, hashQueryKey

// Retry
withRetry, DEFAULT_RETRY_POLICY, CRITICAL_RETRY_POLICY, LIGHT_RETRY_POLICY,
isRetryableError, getDLQEntries, getDLQEntry, removeDLQEntry,
retryDLQEntry, getDLQStats, clearDLQ
```

**Target @xalatechnologies/platform/sdk exports:**
- All of the above (verified present in `packages/platform/src/sdk/index.ts`)
- Additional: SaaS SDK (`./sdk/saas` subpath)

**Migration Steps:**
1. [x] Code already migrated to platform package
2. [ ] Create backward-compatible re-export in @xala/sdk-core
3. [ ] Add deprecation console.warn on import
4. [ ] Update consuming apps to new import path

**Backward Compatibility Layer (for @xala/sdk-core):**
```typescript
// packages/sdk-core/src/index.ts
console.warn(
  '[@xala/sdk-core] This package is deprecated. ' +
  'Please migrate to @xalatechnologies/platform/sdk'
);
export * from '@xalatechnologies/platform/sdk';
```

---

### 3.2 @xala/contracts → @xalatechnologies/platform/contracts

**Status:** Partial implementation (basic schemas only)

**Current @xala/contracts exports:**
```typescript
// Schemas
PaginationSchema, ProblemDetailsSchema, SortOrderSchema,
UUIDSchema, SlugSchema, EmailSchema, DateSchema,
TimestampsSchema, MetadataSchema, CurrencyCodeSchema, MoneySchema,
FieldErrorSchema, createPaginatedResponseSchema, createDataResponseSchema

// Types
Pagination, PaginatedResponseMeta, SortOrder, Timestamps,
Metadata, CurrencyCode, Money, FieldError, ProblemDetails

// Modules (feature flags)
ModuleKey, DomainGroup, MODULE_REGISTRY, getModulesByCategory,
computeCapabilities, getAllCapabilities

// Monitoring DTOs
SystemHealthDTO, ServiceStatusDTO, IncidentDTO, LogEntryDTO, AuditLogDTO
```

**Migration Steps:**
1. [ ] Copy full schemas from @xala/contracts to platform/contracts
2. [ ] Copy modules system to platform/contracts
3. [ ] Copy monitoring DTOs to platform/contracts
4. [ ] Create backward-compatible re-export in @xala/contracts
5. [ ] Add deprecation warning

**Gap Analysis:**
- Platform package has basic schemas (UUID, Pagination, ProblemDetails)
- Missing: Modules system, Monitoring DTOs, full types exports
- Action: Copy remaining code from `packages/contracts/src/` to `packages/platform/src/contracts/`

---

### 3.3 @xala/i18n → @xalatechnologies/platform/i18n

**Status:** Fully implemented in platform package

**Current @xala/i18n exports:**
```typescript
// Provider
I18nProvider, I18nContext, LazyI18nProvider

// Hooks
useI18n, useT, useLocale, useLazyT, useLazyLocale,
useFormatRelativeTime, useFormatDuration

// Formatters
formatDate, formatTime, formatDateTime, formatNumber,
formatCurrency, formatPercent, formatRelativeTime, formatDuration

// Utilities
loadLocale, preloadLocale, isLocaleLoaded, getLoadedLocales,
getCachedTranslations, clearLocaleCache, CORE_TRANSLATIONS

// Key Registry
isValidKey, getKeysForNamespace, getAllNamespaces, getTranslationStats,
ALL_TRANSLATION_KEYS, TRANSLATION_KEY_SET

// Reason Keys (RFC 7807)
resolveReasonKey, hasReasonKeyTranslation, getMissingReasonKeys, CANONICAL_REASON_KEYS

// Storage
getPersistedLocale, persistLocale, clearPersistedLocale,
getCookieLocale, setCookieLocale, getLocalStorageLocale, setLocalStorageLocale

// Translations
translations, nb, en
```

**Target @xalatechnologies/platform/i18n exports:**
- All of the above (verified present in `packages/platform/src/i18n/index.ts`)

**Migration Steps:**
1. [x] Code already migrated to platform package
2. [ ] Create backward-compatible re-export in @xala/i18n
3. [ ] Add deprecation warning
4. [ ] Verify translation keys are complete

---

### 3.4 @xala/observability → @xalatechnologies/platform/observability

**Status:** Fully implemented in platform package

**Current @xala/observability exports:**
```typescript
// Metrics
recordHttpRequest, createApiMetricsMiddleware,
recordDatabaseQuery, withDatabaseMetrics, updateConnectionPoolMetrics,
recordBookingCreated, recordBookingConflict, withBookingMetrics

// Exporter
prometheusExporter

// Types
MetricType, MetricDefinition, ALL_METRICS
```

**Target @xalatechnologies/platform/observability exports:**
- All of the above
- Additional: Logger utilities, captureException, performance marks

**Migration Steps:**
1. [x] Code already migrated to platform package
2. [ ] Create backward-compatible re-export in @xala/observability
3. [ ] Add deprecation warning

---

### 3.5 @xala/config → @xalatechnologies/platform/config

**Status:** Partial implementation (app profiles + domain registry)

**Current @xala/config exports:**
```typescript
// Types
AppType, SupportedLocale, ColorScheme, ThemeId,
EnvConfig, AppProfile, RuntimeConfig, AuthConfig, SDKConfig

// Environment Validation
envSchema, validateEnv, safeValidateEnv, assertEnv,
getDevEnvConfig, mergeWithDefaults

// App Profile Registry
registerAppProfile, registerAppProfiles, clearAppProfiles, hasAppProfile,
getAppProfile, getAllAppProfiles, getAppTypes,
createRuntimeConfig, createSDKConfig, createAppConfig
```

**Target @xalatechnologies/platform/config exports:**
- App profiles (different implementation - static vs registry)
- Domain registry (new feature, already implemented)
- TODO: Port environment validation from @xala/config

**Gap Analysis:**
- Platform package has static app profiles + domain registry
- Missing: Dynamic profile registration, env validation with Zod
- Action: Merge implementations or deprecate @xala/config registration API

**Migration Decision Required:**
The @xala/config package uses a dynamic registration pattern for app profiles, while platform/config has static profiles. Options:
1. **Option A:** Port dynamic registration to platform (more flexible)
2. **Option B:** Use static profiles only, domain packages don't register (simpler)
3. **Option C:** Support both patterns with adapter (complex)

**Recommendation:** Option A - Port dynamic registration to maintain backward compatibility with @digilist/runtime which uses `registerAppProfiles()`.

---

### 3.6 @xala/runtime → @xalatechnologies/platform/runtime

**Status:** Stub implementation only

**Current @xala/runtime exports:**
```typescript
// Main Provider
RuntimeProvider, useRuntimeConfig, useFeatureFlags,
useTenantContext, useNotificationCenter

// Factory
createRuntime, defaultTestRuntime, adminTestRuntime, createTestWrapper

// Hooks
useLocalization, useSDK, useRBAC

// App-specific Providers
RuntimeServiceProvider, useRuntimeServices, useRuntimeServicesOptional,
useInjectedOrganizations, createOrganizationsHook,
MultiAccountProvider, useMultiAccount,
AccountContextProvider, useAccountContext

// Types (extensive)
RuntimeConfig, RuntimeProviderProps, CreateRuntimeOptions,
RuntimeInstance, MockUser, MockSession, MockOrganization,
LocalizationContext, SDKContext, RBACContext, FeatureFlagsContext,
TenantContext, NotificationCenterContext, ToastContext,
OrganizationDTO, PaginatedResponse, OrganizationsFilter,
OrganizationsServiceContract, RuntimeServiceContract,
QueryHookResult, UseOrganizationsHook, RuntimeServiceConfig,
BaseAccount, AccountMode, MultiAccountContextState,
MultiAccountContextValue, MultiAccountProviderProps,
ActiveAccountInfo, AccountType, DashboardContext,
AccountContextState, AccountContextValue, AccountContextProviderProps, ActiveAccount
```

**Target @xalatechnologies/platform/runtime exports:**
- Currently only has stubs: RuntimeConfig type, getEnvironment(), isDevelopment(), isProduction(), isStaging()

**Gap Analysis:**
- Platform package has minimal runtime implementation
- Missing: All providers, factories, hooks, dependency injection system
- This is the LARGEST migration effort

**Migration Steps:**
1. [ ] Copy RuntimeProvider from @xala/runtime to platform/runtime
2. [ ] Copy createRuntime factory and test utilities
3. [ ] Copy all hooks (useLocalization, useSDK, useRBAC)
4. [ ] Copy app-specific providers (RuntimeServiceProvider, MultiAccountProvider, AccountContextProvider)
5. [ ] Copy all types and contracts
6. [ ] Update imports to use platform subpaths
7. [ ] Create backward-compatible re-export in @xala/runtime
8. [ ] Add deprecation warning

**Dependencies to Resolve:**
- @xala/runtime depends on @xala/auth, @xala/i18n, @xalatechnologies/platform
- Need to ensure platform/runtime uses platform/auth and platform/i18n internally

---

### 3.7 @xala/auth → @xalatechnologies/platform/auth

**Status:** Stub implementation only (LOCKED package)

**IMPORTANT:** The @xala/auth package is marked as LOCKED in CLAUDE.md due to a 4+ hour debugging session on 2026-01-17. Changes require explicit approval.

**Current @xala/auth exports:**
```typescript
// Providers
AuthProvider, AuthServiceProvider, useAuthService, useAuthServiceOptional,
defaultFlowContextUtils, defaultTokenUtils

// Hooks
useAuth, useOAuthCallback

// Components
ProtectedRoute

// Types
User, UserRole, AppType, AuthConfig, AuthContextType,
RestoreFlowContextResult, FlowContext, EffectiveBackofficeRole,
AuthServiceContract, AuthServiceResponse, SessionData,
OAuthInitResponse, OAuthCallbackResponse, TokenRefreshResponse,
FlowResumeResult, FlowContextUtilities, TokenUtilities, InjectedAuthService,
AuthServiceContextValue, AuthServiceProviderProps,
AuthProvider (config), AuthProviderId, AppAuthConfig, ProviderAvailability

// Config
idportenProvider, vippsProvider, microsoftProvider, demoProvider,
getProvider, getEnabledProviders,
webAuthConfig, minsideAuthConfig, backofficeAuthConfig, saasAdminAuthConfig,
getAppAuthConfig
```

**Target @xalatechnologies/platform/auth exports:**
- Currently only has stubs: User, AuthState, AuthContextValue, Session types

**Gap Analysis:**
- Platform package has minimal auth types
- Missing: All providers, hooks, components, OAuth config
- Requires careful migration due to LOCKED status

**Migration Steps (REQUIRES APPROVAL):**
1. [ ] Get approval for auth package migration
2. [ ] Copy AuthProvider and AuthServiceProvider to platform/auth
3. [ ] Copy hooks (useAuth, useOAuthCallback)
4. [ ] Copy ProtectedRoute component
5. [ ] Copy all types and config
6. [ ] Ensure BankID/ID-porten integration remains intact
7. [ ] Extensive testing before deploying
8. [ ] Create backward-compatible re-export in @xala/auth
9. [ ] Add deprecation warning

---

### 3.8 @xala/ds → @xalatechnologies/platform/ui

**Status:** DELETED from git (package files show as deleted in git status)

The @xala/ds package has been replaced by @xalatechnologies/platform/ui. The UI module in the platform package is fully implemented with:

- Re-exports from @digdir/designsystemet-react
- Custom primitives (icons, container, grid, etc.)
- Composed components (ContentLayout, FormSection, DataTable, etc.)
- Blocks (account, activity, admin, booking-engine, gdpr, help, notifications, profile, seasons, settings)
- Shells (AppShell, DashboardContent, DashboardSidebar)
- Pages (LoginPage)
- Patterns (ResourceCard, ResourceGrid, SlotCalendar, etc.)
- Themes (theme utilities and switching)

**Migration Status:** COMPLETE (no action needed)

For backward compatibility, if any code still imports from @xala/ds, it should be updated to use @xalatechnologies/platform/ui.

---

## 4. Backward Compatibility Strategy

### 4.1 Re-export Pattern

Each deprecated @xala/* package will be converted to a thin re-export layer:

```typescript
// packages/{package-name}/src/index.ts

// Deprecation warning (runs once on first import)
const warned = new Set<string>();
function warnOnce(pkg: string, target: string) {
  if (!warned.has(pkg)) {
    warned.add(pkg);
    console.warn(
      `[${pkg}] This package is deprecated and will be removed in a future version. ` +
      `Please migrate to ${target}. ` +
      `See docs/architecture/PACKAGE_CONSOLIDATION_PLAN.md for migration guide.`
    );
  }
}

warnOnce('@xala/sdk-core', '@xalatechnologies/platform/sdk');

// Re-export everything from the new location
export * from '@xalatechnologies/platform/sdk';
```

### 4.2 Deprecation Timeline

| Phase | Date | Action |
|-------|------|--------|
| Soft Deprecation | 2026-02-01 | Console warnings on import |
| Hard Deprecation | 2026-03-01 | TypeScript @deprecated JSDoc tags |
| Removal Warning | 2026-04-01 | Error-level warnings in CI |
| Package Removal | 2026-05-01 | Remove deprecated packages |

### 4.3 Codemod Script

Create a codemod to automatically update imports:

```bash
# scripts/migrate-to-platform.ts
# Usage: npx ts-node scripts/migrate-to-platform.ts apps/backoffice
```

Transformations:
- `@xala/ds` → `@xalatechnologies/platform/ui`
- `@xala/i18n` → `@xalatechnologies/platform/i18n`
- `@xala/auth` → `@xalatechnologies/platform/auth`
- `@xala/config` → `@xalatechnologies/platform/config`
- `@xala/runtime` → `@xalatechnologies/platform/runtime`
- `@xala/sdk-core` → `@xalatechnologies/platform/sdk`
- `@xala/contracts` → `@xalatechnologies/platform/contracts`
- `@xala/observability` → `@xalatechnologies/platform/observability`

---

## 5. Package.json Exports Configuration

### 5.1 Current Platform Package Exports

The platform package already has the following exports configured:

```json
{
  "exports": {
    ".": { "types": "./dist/index.d.ts", "import": "./dist/index.mjs", "require": "./dist/index.js" },
    "./ui": { ... },
    "./ui/primitives": { ... },
    "./ui/composed": { ... },
    "./ui/shells": { ... },
    "./ui/blocks": { ... },
    "./ui/themes": { ... },
    "./ui/patterns": { ... },
    "./runtime": { ... },
    "./auth": { ... },
    "./config": { ... },
    "./contracts": { ... },
    "./sdk": { ... },
    "./sdk/saas": { ... },
    "./i18n": { ... },
    "./observability": { ... }
  }
}
```

### 5.2 Additional Exports Needed

The following subpath exports should be added for feature parity:

```json
{
  "exports": {
    // Auth subpaths (for granular imports)
    "./auth/providers": { ... },
    "./auth/hooks": { ... },
    "./auth/components": { ... },
    "./auth/config": { ... },

    // Contracts subpaths
    "./contracts/schemas": { ... },
    "./contracts/types": { ... },
    "./contracts/modules": { ... },
    "./contracts/monitoring": { ... },

    // SDK subpaths
    "./sdk/http": { ... },
    "./sdk/errors": { ... },
    "./sdk/query": { ... },
    "./sdk/retry": { ... },

    // Observability subpaths
    "./observability/metrics": { ... },
    "./observability/exporters": { ... },
    "./observability/types": { ... }
  }
}
```

---

## 6. Testing Strategy

### 6.1 Unit Tests

Each migrated module must pass its original test suite:

```bash
# Run original package tests against platform exports
pnpm --filter @xalatechnologies/platform test

# Verify backward compatibility
pnpm --filter @xala/sdk-core test  # Should use re-exports
pnpm --filter @xala/i18n test
pnpm --filter @xala/auth test
# etc.
```

### 6.2 Integration Tests

```bash
# Build all packages
pnpm build

# Run app tests with new imports
pnpm --filter backoffice test:e2e
pnpm --filter minside test:e2e
pnpm --filter web test:e2e
```

### 6.3 Type Checking

```bash
# Verify all apps compile with new types
pnpm typecheck
```

---

## 7. Documentation Updates

### 7.1 Files to Update

- [ ] `CLAUDE.md` - Update import rules section
- [ ] `docs/packages/*.md` - Update all package documentation
- [ ] `docs/guides/*.md` - Update any import examples
- [ ] Individual package `CLAUDE.md` files
- [ ] Individual package `README.md` files

### 7.2 New Documentation

- [x] `docs/architecture/PACKAGE_CONSOLIDATION_PLAN.md` (this document)
- [ ] `docs/guides/PLATFORM_MIGRATION_GUIDE.md` - Step-by-step for developers
- [ ] `docs/architecture/PLATFORM_NAMESPACE_GUIDE.md` - Updated namespace guide

---

## 8. Risk Assessment

### 8.1 High Risk Items

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking @xala/auth changes | Production auth failures | LOCKED status, extensive testing |
| Missing runtime features | Provider composition fails | Port all RuntimeProvider code |
| Type mismatches | Compilation errors | Verify TypeScript compatibility |
| Bundle size increase | Slower load times | Tree-shaking, lazy loading |

### 8.2 Medium Risk Items

| Risk | Impact | Mitigation |
|------|--------|------------|
| Translation key mismatches | UI shows wrong text | Verify all 1,387 keys |
| Metric name changes | Dashboard breakage | Keep metric names identical |
| Config schema drift | Invalid env vars | Port Zod schemas exactly |

### 8.3 Low Risk Items

| Risk | Impact | Mitigation |
|------|--------|------------|
| Import path confusion | Developer inconvenience | Clear documentation, codemod |
| Storybook issues | Dev tooling | Update Storybook config |

---

## 9. Success Criteria

### 9.1 Phase 1 Complete When:

- [ ] All @xalatechnologies/platform subpaths have full implementations
- [ ] All apps compile with new imports
- [ ] E2E tests pass

### 9.2 Phase 2 Complete When:

- [ ] @xala/* packages are thin re-export wrappers
- [ ] Deprecation warnings active
- [ ] Migration guide published

### 9.3 Full Migration Complete When:

- [ ] No direct @xala/* imports in app code
- [ ] All @xala/* packages removed from monorepo
- [ ] Documentation updated

---

## 10. Open Questions

1. **Config registration:** Should we keep dynamic profile registration or switch to static profiles?
   - Recommendation: Keep dynamic for backward compatibility

2. **Auth migration timing:** When can we safely migrate @xala/auth given LOCKED status?
   - Need approval from team lead

3. **Translation sync:** How do we keep translations in sync between @xala/i18n and platform/i18n during migration?
   - Single source of truth in platform, re-export from @xala/i18n

4. **Version strategy:** Should platform package version track old package versions?
   - Recommendation: New versioning scheme (1.0.0 as fresh start)

---

## Appendix A: Import Mapping Table

| Old Import | New Import |
|------------|------------|
| `@xala/ds` | `@xalatechnologies/platform/ui` |
| `@xala/ds/primitives` | `@xalatechnologies/platform/ui/primitives` |
| `@xala/ds/composed` | `@xalatechnologies/platform/ui/composed` |
| `@xala/ds/shells` | `@xalatechnologies/platform/ui/shells` |
| `@xala/ds/blocks` | `@xalatechnologies/platform/ui/blocks` |
| `@xala/i18n` | `@xalatechnologies/platform/i18n` |
| `@xala/auth` | `@xalatechnologies/platform/auth` |
| `@xala/auth/providers` | `@xalatechnologies/platform/auth/providers` |
| `@xala/auth/hooks` | `@xalatechnologies/platform/auth/hooks` |
| `@xala/config` | `@xalatechnologies/platform/config` |
| `@xala/runtime` | `@xalatechnologies/platform/runtime` |
| `@xala/sdk-core` | `@xalatechnologies/platform/sdk` |
| `@xala/sdk-core/http` | `@xalatechnologies/platform/sdk/http` |
| `@xala/sdk-core/errors` | `@xalatechnologies/platform/sdk/errors` |
| `@xala/sdk-core/query` | `@xalatechnologies/platform/sdk/query` |
| `@xala/sdk-core/retry` | `@xalatechnologies/platform/sdk/retry` |
| `@xala/contracts` | `@xalatechnologies/platform/contracts` |
| `@xala/contracts/schemas` | `@xalatechnologies/platform/contracts/schemas` |
| `@xala/contracts/types` | `@xalatechnologies/platform/contracts/types` |
| `@xala/observability` | `@xalatechnologies/platform/observability` |
| `@xala/observability/metrics` | `@xalatechnologies/platform/observability/metrics` |

---

## Appendix B: Verification Commands

```bash
# Verify platform package builds
pnpm --filter @xalatechnologies/platform build

# Verify all subpath exports work
node -e "require('@xalatechnologies/platform')"
node -e "require('@xalatechnologies/platform/ui')"
node -e "require('@xalatechnologies/platform/sdk')"
node -e "require('@xalatechnologies/platform/i18n')"
node -e "require('@xalatechnologies/platform/auth')"
node -e "require('@xalatechnologies/platform/config')"
node -e "require('@xalatechnologies/platform/runtime')"
node -e "require('@xalatechnologies/platform/contracts')"
node -e "require('@xalatechnologies/platform/observability')"

# Verify no banned terms in platform
pnpm verify:terms

# Verify platform does not import from domain
pnpm verify:boundaries

# Run all tests
pnpm test
```

---

**Document Version:** 1.0
**Last Updated:** 2026-01-21
**Author:** Claude Code
**Reviewers:** [Pending]
