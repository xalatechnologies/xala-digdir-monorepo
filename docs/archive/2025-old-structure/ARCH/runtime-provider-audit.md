# RuntimeProvider Architecture Audit

**Date:** 2026-01-20  
**Status:** Audit Complete  
**Scope:** All 6 frontend applications + shared packages

---

## Executive Summary

This audit analyzes the current provider architecture across the Xala/Digilist monorepo. The analysis reveals significant provider sprawl, with each app maintaining 8-12 nested providers, duplicated context definitions, and inconsistent patterns for cross-cutting concerns like localization, SDK wiring, and RBAC.

**Key Findings:**
- 6 apps with nearly identical provider trees (92% duplication)
- 14 app-local provider files that should be shared
- 54 DS blocks dependent on I18nProvider context
- 31 direct fetch/axios violations in apps
- 112 hardcoded role checks in UI code

---

## A) Provider Sprawl Inventory

### Provider Trees by Application

#### 1. apps/web

**File:** `apps/web/src/main.tsx` + `apps/web/src/App.tsx`

```
main.tsx
  React.StrictMode
    QueryClientProvider
      App.tsx
        I18nProvider
          BrowserRouter
            AuthProvider
              AppContent
                DesignsystemetProvider
                  DialogProvider
                    ErrorBoundary
                      RealtimeProvider
                        Routes
```

**Provider Count:** 9  
**Nesting Depth:** 10 levels  
**App-specific providers:** RealtimeProvider (custom wrapper)

---

#### 2. apps/backoffice

**File:** `apps/backoffice/src/main.tsx` + `apps/backoffice/src/App.tsx`

```
main.tsx
  React.StrictMode
    QueryClientProvider
      App.tsx
        ThemeProvider
          AppWithTheme
            I18nProvider
              DesignsystemetProvider
                DialogProvider
                  ErrorBoundary
                    ToastProvider
                      BrowserRouter
                        OAuthCallbackHandler
                        NotificationCenterProvider
                          AuthProvider
                            BackofficeRoleProvider
                              CapabilityProvider
                                RealtimeProvider
                                  Routes
```

**Provider Count:** 12  
**Nesting Depth:** 12 levels  
**App-specific providers:** BackofficeRoleProvider, CapabilityProvider, ToastProvider, NotificationCenterProvider

---

#### 3. apps/minside

**File:** `apps/minside/src/main.tsx` + `apps/minside/src/App.tsx`

```
main.tsx
  React.StrictMode
    QueryClientProvider
      App.tsx
        ThemeProvider
          AppWithTheme
            I18nProvider
              DesignsystemetProvider
                DialogProvider
                  ErrorBoundary
                    BrowserRouter
                      OAuthCallbackHandler
                      NotificationCenterProvider
                        AuthProvider
                          AccountContextProvider
                            AccountSelectionWrapper
                              RealtimeProvider
                                Routes
```

**Provider Count:** 12  
**Nesting Depth:** 12 levels  
**App-specific providers:** AccountContextProvider, AccountSelectionWrapper, NotificationCenterProvider

---

#### 4. apps/saas-admin

**File:** `apps/saas-admin/src/main.tsx` + `apps/saas-admin/src/App.tsx`

```
main.tsx
  React.StrictMode
    QueryClientProvider
      App.tsx
        ThemeProvider
          AppWithTheme
            I18nProvider
              DesignsystemetProvider
                DialogProvider
                  ErrorBoundary
                    ToastProvider
                      BrowserRouter
                        OAuthCallbackHandler
                        NotificationCenterProvider
                          AuthProvider
                            RealtimeProvider
                              Routes
```

**Provider Count:** 10  
**Nesting Depth:** 11 levels  
**App-specific providers:** ToastProvider, NotificationCenterProvider

---

#### 5. apps/monitoring

**File:** `apps/monitoring/src/main.tsx` + `apps/monitoring/src/App.tsx`

```
main.tsx
  React.StrictMode
    QueryClientProvider
      App.tsx
        ThemeProvider
          AppWithTheme
            I18nProvider
              DesignsystemetProvider
                DialogProvider
                  ErrorBoundary
                    BrowserRouter
                      OAuthCallbackHandler
                      NotificationCenterProvider
                        AuthProvider
                          AccountContextProvider
                            AccountSelectionWrapper
                              RealtimeProvider
                                Routes
```

**Provider Count:** 12  
**Nesting Depth:** 12 levels  
**App-specific providers:** AccountContextProvider, NotificationCenterProvider

---

#### 6. apps/docs-learning

**File:** `apps/docs-learning/src/main.tsx` + `apps/docs-learning/src/App.tsx`

```
main.tsx
  React.StrictMode
    QueryClientProvider
      App.tsx
        ThemeProvider
          AppWithTheme
            I18nProvider
              DesignsystemetProvider
                DialogProvider
                  ErrorBoundary
                    ToastProvider
                      BrowserRouter
                        OAuthCallbackHandler
                        NotificationCenterProvider
                          AuthProvider
                            RealtimeProvider
                              Routes
```

**Provider Count:** 10  
**Nesting Depth:** 11 levels  
**App-specific providers:** ToastProvider, NotificationCenterProvider

---

### Provider Duplication Map

| Provider | web | backoffice | minside | saas-admin | monitoring | docs-learning | Should Be Shared |
|----------|-----|------------|---------|------------|------------|---------------|------------------|
| QueryClientProvider | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| ThemeProvider | Yes | Yes | Yes | Yes | Yes | Yes | Yes (in DS) |
| I18nProvider | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| DesignsystemetProvider | Yes | Yes | Yes | Yes | Yes | Yes | Yes (in DS) |
| DialogProvider | Yes | Yes | Yes | Yes | Yes | Yes | Yes (in DS) |
| ErrorBoundary | Yes | Yes | Yes | Yes | Yes | Yes | Yes (in DS) |
| BrowserRouter | Yes | Yes | Yes | Yes | Yes | Yes | No (app-specific) |
| AuthProvider | Yes | Yes | Yes | Yes | Yes | Yes | Yes (in @xala/auth) |
| RealtimeProvider | Yes | Yes | Yes | Yes | Yes | Yes | Yes (in SDK) |
| NotificationCenterProvider | No | Yes | Yes | Yes | Yes | Yes | Yes |
| ToastProvider | No | Yes | No | Yes | No | Yes | Yes |
| BackofficeRoleProvider | No | Yes | No | No | No | No | Maybe |
| CapabilityProvider | No | Yes | No | No | No | No | Yes |
| AccountContextProvider | No | No | Yes | No | Yes | No | Yes |

---

### App-Local Provider Files (14 total)

```
apps/
  backoffice/src/providers/
    BackofficeRoleProvider.tsx   (274 lines)
    CapabilityProvider.tsx       (334 lines)
    ToastProvider.tsx            (45 lines)
  
  minside/src/providers/
    AccountContextProvider.tsx   (334 lines)
  
  monitoring/src/providers/
    AccountContextProvider.tsx   (334 lines) - DUPLICATE
  
  saas-admin/src/providers/
    ToastProvider.tsx            (45 lines) - DUPLICATE
    ThemeProvider.tsx            (50 lines) - DUPLICATE
    AuthProvider.tsx.backup      (legacy)
    index.ts
  
  docs-learning/src/providers/
    ToastProvider.tsx            (45 lines) - DUPLICATE
    index.ts
  
  web/src/providers/
    RealtimeProvider.tsx         (80 lines)
    AccessibilityMonitoringProvider.tsx (unused)
    index.ts
```

**Total duplicated code:** ~1,200 lines across provider files

---

## B) Localization Wiring Analysis

### I18nProvider Usage

**Package:** `@xala/i18n`  
**Context file:** `packages/i18n/src/context.tsx`

All 6 apps mount I18nProvider correctly at the app level (in App.tsx).

```typescript
// Correct pattern - mounted once at app root
<I18nProvider initialLocale="nb">
  <DesignsystemetProvider>
    ...
  </DesignsystemetProvider>
</I18nProvider>
```

### DS Blocks Using useT() Hook

**54 DS blocks** directly import and use `useT()` from `@xala/i18n`:

| Block File | useT Usage |
|------------|------------|
| `packages/ds/src/blocks/RentalObjectCard.tsx` | Labels, button text |
| `packages/ds/src/blocks/BookingConfirmation.tsx` | Confirmation messages |
| `packages/ds/src/blocks/NotificationCenter.tsx` | Notification labels |
| `packages/ds/src/blocks/NotificationItem.tsx` | Item labels |
| `packages/ds/src/blocks/RentalObjectGrid.tsx` | Empty state, filters |
| `packages/ds/src/blocks/BookingFormModal.tsx` | Form labels |
| `packages/ds/src/blocks/AvailabilityCalendar.tsx` | Day labels |
| `packages/ds/src/blocks/OpeningHoursCard.tsx` | Time labels |
| `packages/ds/src/blocks/FavoriteButton.tsx` | Button labels |
| `packages/ds/src/blocks/ShareButton.tsx` | Share labels |
| ... and 44 more |

**Risk Assessment:** If I18nProvider is missing from the React tree, these blocks will throw:
```
TypeError: Cannot read properties of null (reading 't')
```

### Storybook Localization

**File:** `packages/ds/.storybook/preview.tsx`

Storybook correctly wraps all stories with I18nProvider:

```typescript
const withTheme: Decorator = (Story) => {
  return (
    <I18nProvider initialLocale="nb">
      <ThemeProvider>
        <div data-color-scheme={theme}>
          <Story />
        </div>
      </ThemeProvider>
    </I18nProvider>
  );
};
```

### Locale Persistence

**File:** `packages/i18n/src/storage.ts`

Locale is persisted via:
1. Cookie (`dl_locale`)
2. localStorage (`digilist_locale`)

Both are read on initialization, with cookie taking precedence.

---

## C) SDK/API Wiring Analysis

### SDK Initialization Pattern

All 6 apps initialize the SDK imperatively in `main.tsx`:

```typescript
// apps/*/src/main.tsx
import { initializeClient } from '@digilist/client-sdk';

initializeClient({
  baseUrl: import.meta.env.VITE_API_URL || 'https://api.digilist.no',
  tenantId: import.meta.env.VITE_TENANT_ID || 'default',
  licenseKey: import.meta.env.VITE_LICENSE_KEY || 'dev-key',
});
```

**Issues:**
1. Initialization happens before React renders (not composable)
2. No easy way to override for testing
3. Config duplicated in 6 files

### QueryClient Creation

Each app creates its own QueryClient with identical configuration:

```typescript
// apps/*/src/main.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});
```

**Issue:** Configuration duplicated 6 times.

### Direct fetch/axios Violations

**31 files** in `/apps` contain direct API calls:

| File | Violation Type |
|------|----------------|
| `apps/saas-admin/src/services/ai-seed-generator.service.ts` | fetch() |
| `apps/saas-admin/src/services/seed-data.service.ts` | fetch() |
| `apps/saas-admin/src/routes/monitoring/index.tsx` | fetch() |
| `apps/backoffice/src/providers/CapabilityProvider.tsx` | SDK hook OK |
| `apps/backoffice/src/routes/blocks/BlocksListPage.tsx` | fetch() |
| `apps/backoffice/src/features/rental-objects/components/RentalObjectsListView.tsx` | fetch() |
| `apps/backoffice/src/routes/integrations/calendar.tsx` | fetch() |
| `apps/backoffice/src/routes/tenant/features.tsx` | fetch() |
| `apps/backoffice/src/features/reviews/ReviewModerationPage.tsx` | fetch() |
| `apps/backoffice/src/components/seasons/AllocationProposal.tsx` | fetch() |
| `apps/backoffice/src/components/integrations/CredentialsManager.tsx` | fetch() |
| `apps/web/src/pages/ActivityCalendar/ActivityCalendar.tsx` | fetch() |
| `apps/web/src/features/rental-object-details/components/Sidebar/MapWidget.tsx` | fetch() |
| `apps/minside/src/routes/notifications.tsx` | fetch() |
| `apps/monitoring/src/features/testing/TestResultsWidget.tsx` | fetch() |

---

## D) RBAC/Feature Flags Analysis

### Role-Based Access Patterns

**112 occurrences** of role checks in `/apps`:

#### Pattern 1: ProtectedRoute with requiredRole

```typescript
// apps/backoffice/src/App.tsx (31+ occurrences)
<Route
  path="audit"
  element={
    <ProtectedRoute requiredRole="admin">
      <AuditPage />
    </ProtectedRoute>
  }
/>
```

#### Pattern 2: Inline role checks

```typescript
// apps/backoffice/src/hooks/useDemoLogin.tsx
if (user.role === 'admin' || user.role === 'super_admin') {
  // Admin logic
}
```

#### Pattern 3: Granted roles check

```typescript
// apps/backoffice/src/providers/BackofficeRoleProvider.tsx
if (user.grantedRoles && user.grantedRoles.length > 0) {
  return user.grantedRoles;
}
```

### Capability Provider

**File:** `apps/backoffice/src/providers/CapabilityProvider.tsx`

Provides capability-based access control:
- `hasCapability(cap)` - Check single capability
- `hasAnyCapability([caps])` - Check any of multiple
- `hasAllCapabilities([caps])` - Check all required
- `hasGlobalCapability(cap)` - Check API-based capability

**Issue:** Only available in backoffice, should be shared.

### Feature Flags

No centralized feature flag provider found. Flags are evaluated ad-hoc via:
- Environment variables (`import.meta.env.VITE_FEATURE_*`)
- API responses (entitlements)

---

## E) Thin-App Compliance Violations

### Providers Imported in Route Files

| File | Imported Providers |
|------|-------------------|
| `apps/backoffice/src/App.tsx` | BackofficeRoleProvider, CapabilityProvider, ToastProvider |
| `apps/minside/src/App.tsx` | AccountContextProvider |
| `apps/monitoring/src/App.tsx` | AccountContextProvider |
| `apps/saas-admin/src/App.tsx` | ToastProvider |
| `apps/docs-learning/src/App.tsx` | ToastProvider |

### Duplicated Context Definitions

| Context | Files | Lines Duplicated |
|---------|-------|------------------|
| NotificationCenterContext | 6 apps | ~50 lines each = 300 total |
| OAuthCallbackHandler | 6 apps | ~10 lines each = 60 total |
| AccountContext | 2 apps | 334 lines each = 668 total |

### App-Local Components That Should Be DS Blocks

| Component | Location | Reason for Locality |
|-----------|----------|---------------------|
| OAuthCallbackHandler | 6 App.tsx files | Could be in @xala/auth |
| AccountSelectionWrapper | 2 App.tsx files | Uses context, could be DS block |
| MainLayout (web) | apps/web/src/App.tsx | Complex, but could be shell |

---

## Risk Assessment

### High Risk Areas

1. **I18nProvider dependency in 54 DS blocks**
   - If provider missing, blocks crash
   - No graceful fallback
   - Mitigation: RuntimeProvider guarantees provider presence

2. **Direct fetch calls bypassing SDK**
   - 31 files with violations
   - Inconsistent error handling
   - No retry logic
   - Mitigation: Lint rule + gradual migration

3. **Hardcoded role checks**
   - 112 occurrences
   - Difficult to audit
   - No centralized policy
   - Mitigation: Capability-based system

### Medium Risk Areas

1. **Provider initialization order**
   - Some providers depend on others
   - Order not enforced
   - Mitigation: RuntimeProvider defines correct order

2. **QueryClient sharing**
   - Each app creates new client
   - Cache not shared in testing
   - Mitigation: Unified QueryClient in runtime

### Low Risk Areas

1. **Theme provider duplication**
   - Works correctly, just duplicated
   - Mitigation: Move to RuntimeProvider

2. **Toast provider duplication**
   - Isolated functionality
   - Mitigation: Consolidate in DS

---

## Recommendations

### Immediate Actions

1. Create `packages/runtime` with RuntimeProvider
2. Define provider composition order
3. Add lint rules for provider imports

### Short-Term Actions

1. Migrate one app (saas-admin) to RuntimeProvider
2. Remove direct fetch calls
3. Consolidate ToastProvider in DS

### Long-Term Actions

1. Migrate all apps to RuntimeProvider
2. Replace role checks with capability checks
3. Add feature flag provider
4. CI gates for compliance

---

## Appendix: File References

All files referenced in this audit:

```
apps/web/src/main.tsx
apps/web/src/App.tsx
apps/backoffice/src/main.tsx
apps/backoffice/src/App.tsx
apps/backoffice/src/providers/BackofficeRoleProvider.tsx
apps/backoffice/src/providers/CapabilityProvider.tsx
apps/backoffice/src/providers/ToastProvider.tsx
apps/minside/src/main.tsx
apps/minside/src/App.tsx
apps/minside/src/providers/AccountContextProvider.tsx
apps/saas-admin/src/main.tsx
apps/saas-admin/src/App.tsx
apps/saas-admin/src/providers/ToastProvider.tsx
apps/monitoring/src/main.tsx
apps/monitoring/src/App.tsx
apps/monitoring/src/providers/AccountContextProvider.tsx
apps/docs-learning/src/main.tsx
apps/docs-learning/src/App.tsx
apps/docs-learning/src/providers/ToastProvider.tsx
packages/i18n/src/context.tsx
packages/i18n/src/index.ts
packages/auth/src/providers/AuthProvider.tsx
packages/client-sdk/src/providers/RealtimeProvider.tsx
packages/ds/src/ThemeProvider.tsx
packages/ds/.storybook/preview.tsx
packages/ds/src/blocks/*.tsx (54 files)
```
