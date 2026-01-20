# Thin App Violations Report

**Date:** 2026-01-20  
**Scope:** Violations of thin-app architecture across all apps

---

## Summary

| Violation Type | Count | Severity |
|----------------|-------|----------|
| Direct fetch/axios usage | 31 | HIGH |
| Provider imports in pages | 12 | HIGH |
| App-local styling | 7,538 inline styles | MEDIUM |
| t() passed via props | 54 DS blocks | MEDIUM |
| Business logic in wrappers | 8 | HIGH |
| Duplicate UI patterns outside DS | 56 components | HIGH |

---

## 1. Direct fetch/axios Usage in Apps

**Rule:** Apps must use SDK hooks only, never direct HTTP calls

### Evidence

| File | Line | Pattern |
|------|------|---------|
| `apps/saas-admin/src/services/seed-data.service.ts` | 45-80 | `fetch('/api/admin/...')` |
| `apps/saas-admin/src/services/seed-data.service.ts` | 120-150 | `fetch('/api/admin/...')` |
| `apps/saas-admin/src/services/seed-data.service.ts` | 200-250 | `fetch('/api/admin/...')` |
| `apps/saas-admin/src/services/seed-data.service.ts` | 280-320 | `fetch('/api/admin/...')` |
| `apps/backoffice/src/services/*.ts` | various | `fetch()` calls |
| `apps/web/src/services/*.ts` | various | `fetch()` calls |

**Total:** 31 direct fetch calls across apps

**Recommendation:** Create SDK admin services for batch operations

---

## 2. Provider Imports Inside Routes/Pages ✅ RESOLVED

**Rule:** Only app root may import providers

### Evidence

| File | Import |
|------|--------|
| `apps/backoffice/src/App.tsx` | ✅ FIXED - Routes only |
| `apps/web/src/App.tsx` | ✅ FIXED - Routes only |
| `apps/saas-admin/src/App.tsx` | ✅ FIXED - Routes only |
| `apps/minside/src/App.tsx` | ✅ FIXED - Routes only |
| `apps/monitoring/src/App.tsx` | ✅ FIXED - Routes only |
| `apps/docs-learning/src/App.tsx` | ✅ FIXED - Routes only |

**Status:** ✅ ALL 6/6 apps fixed

---

## 3. App-Local Styling or Tokens

**Rule:** No custom CSS/inline styles in apps

### Evidence

| Type | Count | Files |
|------|-------|-------|
| Inline `style={{}}` | 7,538 | Various across all apps |
| App-local CSS files | 6 | `apps/*/src/root.css` |
| Custom CSS classes | ~200 | Various |

**Sample Violations:**
```tsx
// apps/backoffice/src/components/organizations/OrganizationForm.tsx
<div style={{ marginTop: '1rem', padding: '0.5rem' }}>
```

**Recommendation:** 
1. Create design system spacing utilities
2. Run codemod to replace inline styles with DS tokens

---

## 4. Passing Localization via Props (Anti-pattern)

**Rule:** Blocks should use `useT()` internally, not receive `t` as props

### Evidence

**54 DS blocks accept localization props:**

| Block | Props Pattern |
|-------|--------------|
| `AccountSelectionModal` | `labels={{ title: t('...'), ... }}` |
| `BookingConfirmation` | `translations={{ ... }}` |
| `BookingWidget` | `labels={{ ... }}` |
| `ConflictResolver` | `messages={{ ... }}` |
| `DashboardHeader` | `labels={{ ... }}` |

**Files with t() prop passing:**
- `apps/minside/src/App.tsx:L85-140` - AccountSelectionWrapper
- `apps/monitoring/src/App.tsx:L84-138` - AccountSelectionWrapper
- `apps/backoffice/src/routes/*.tsx` - Various pages

**Recommendation:**
1. RuntimeProvider guarantees I18nProvider
2. Blocks should call `useT()` directly
3. Remove `labels`/`translations` props pattern

---

## 5. Business Logic in Wrappers/Pages

**Rule:** Wrappers wire SDK hooks to DS blocks only, no domain logic

### Evidence

| File | Logic Type |
|------|------------|
| `apps/backoffice/src/providers/BackofficeRoleProvider.tsx` | Role resolution |
| `apps/backoffice/src/providers/CapabilityProvider.tsx` | Permission checking |
| `apps/minside/src/providers/AccountContextProvider.tsx` | Account state machine |
| `apps/monitoring/src/providers/AccountContextProvider.tsx` | Account state machine (duplicate) |
| `apps/backoffice/src/routes/bookings/BookingDetailPage.tsx` | Booking validation |
| `apps/web/src/features/rental-object-details/...` | Price calculation |

**Recommendation:**
1. Move RoleProvider/CapabilityProvider to `packages/runtime`
2. Move AccountContextProvider to `packages/runtime`
3. Move domain logic to SDK or domain package

---

## 6. Duplicate UI Patterns Outside DS

**Rule:** All reusable UI must be in `@xala/ds`

### Evidence

| Pattern | Locations | Should Be |
|---------|-----------|-----------|
| Local `LoadingSpinner` | 3 apps | ✅ Already in DS |
| Local `FormSection` | backoffice | ✅ Fixed - now imports DS |
| Local `FormActions` | backoffice | ✅ Fixed - now imports DS |
| Local `InfoBox` | backoffice | ✅ Fixed - now imports DS |
| Local `AccountSwitcher` | 2 apps | ✅ Fixed - thin wrappers |
| Local `SentryTestComponent` | 3 apps | ❌ Deleted (orphan) |

### Remaining Local Components

| App | Component Count | Priority Files |
|-----|-----------------|----------------|
| backoffice | 85 | `src/components/seasons/*.tsx` (29 files) |
| web | 42 | `src/features/rental-object-details/*.tsx` |
| minside | 16 | `src/components/dashboard/*.tsx` |
| monitoring | 16 | `src/components/dashboard/*.tsx` |
| saas-admin | 4 | Minimal |
| docs-learning | 5 | Minimal |

**Total:** 168 local component files (down from 221)

---

## Violation Remediation Status

| Violation | Status | Migrated | Remaining |
|-----------|--------|----------|-----------|
| Provider sprawl | ✅ COMPLETE | 6 apps | 0 apps |
| Direct fetch | NOT STARTED | 0 | 31 calls |
| Inline styles | NOT STARTED | 0 | 7,538 |
| t() props | IDENTIFIED | 0 | 54 blocks |
| Duplicate components | IN PROGRESS | 64 removed | 168 remain |
| Business logic in apps | IDENTIFIED | 0 | 8 files |

---

## Priority Actions (Updated 2026-01-20)

1. ~~**HIGH:** Migrate web and backoffice to RuntimeProvider~~ ✅ COMPLETE
2. **HIGH:** Remove 31 direct fetch calls (SDK admin hooks)
3. **HIGH:** Consolidate 85 backoffice components to DS blocks
4. **MEDIUM:** Refactor 54 DS blocks to use internal `useT()`
5. **MEDIUM:** Codemod 7,538 inline styles to DS tokens
6. **LOW:** Move remaining business logic to packages

### PHASE 2 Focus (Next Steps)

1. Create `packages/config` with:
   - AppProfile schema with Zod validation
   - Centralized env parsing
   - `getAppConfig(appId)` function

2. Enhance `packages/runtime` with:
   - Centralized SDK initialization
   - AccountContextProvider consolidation
   - CI gates for import boundaries
