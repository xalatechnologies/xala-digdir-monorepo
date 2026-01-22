# App-Shared Components Audit

> Last Updated: 2026-01-19

This document identifies duplicated components across apps and recommends consolidation into the design system.

---

## Summary

| Pattern | Apps with Duplicates | Design System Has It? | Action |
|---------|---------------------|----------------------|--------|
| ProtectedRoute | 5 (all apps) | ✅ Yes | Replace with DS version |
| CalendarSection | 2 (backoffice, minside) | ⚠️ Partial | Consolidate to DS |
| LoadingFallback | 2 (backoffice, DS) | ✅ Yes | Replace app copy |
| FormSection | 2 (backoffice shared, DS) | ✅ Yes | Replace app copy |
| FormActions | 2 (backoffice shared, DS) | ✅ Yes | Replace app copy |
| InfoBox | 2 (backoffice shared, DS) | ✅ Yes | Replace app copy |
| SentryTestComponent | 2 (minside, web) | ❌ No | Keep app-local (dev only) |
| SkipLinks | 2 (web, DS) | ✅ Yes | Replace app copy |

---

## Detailed Duplicate Analysis

### 1. ProtectedRoute (CRITICAL - 5 duplicates)

**Files:**
- `packages/ds/src/composed/ProtectedRoute.tsx` (10,679 bytes) ← **Canonical**
- `apps/backoffice/src/components/ProtectedRoute.tsx` (8,533 bytes)
- `apps/minside/src/components/ProtectedRoute.tsx` (6,685 bytes)
- `apps/web/src/components/ProtectedRoute.tsx` (5,342 bytes)
- `apps/monitoring/src/components/ProtectedRoute.tsx`
- `apps/saas-admin/src/components/ProtectedRoute.tsx` (2,146 bytes)

**Analysis:**
Each app has its own ProtectedRoute with slight variations for auth handling. The DS version is the most complete.

**Recommendation:** P0 - Replace all app-local versions with design system import.

```tsx
// Change from:
import { ProtectedRoute } from '../components/ProtectedRoute';

// To:
import { ProtectedRoute } from '@xala/ds';
```

---

### 2. CalendarSection (2 duplicates)

**Files:**
- `apps/backoffice/src/components/CalendarSection.tsx` (10,344 bytes)
- `apps/minside/src/components/CalendarSection.tsx` (11,517 bytes)

**Analysis:**
Both implement the same calendar view with minor variations. DS has `RentalObjectCalendar` which is the base, but these are higher-level wrappers.

**Recommendation:** P1 - Create shared `CalendarSection` in DS that composes `RentalObjectCalendar`.

---

### 3. LoadingFallback (2 copies)

**Files:**
- `packages/ds/src/composed/LoadingFallback.tsx` (1,215 bytes) ← **Canonical**
- `apps/backoffice/src/components/LoadingFallback.tsx` (578 bytes)

**Analysis:**
Backoffice has a simpler version. DS version is more complete.

**Recommendation:** P1 - Replace backoffice copy with DS import.

---

### 4. FormSection / FormActions / InfoBox (Backoffice Shared)

**Files:**
- `apps/backoffice/src/components/shared/FormSection.tsx` (1,182 bytes)
- `apps/backoffice/src/components/shared/FormActions.tsx` (1,270 bytes)
- `apps/backoffice/src/components/shared/InfoBox.tsx` (2,301 bytes)

**DS Equivalents:**
- `packages/ds/src/composed/FormSection.tsx` (1,660 bytes)
- `packages/ds/src/composed/FormActions.tsx` (1,861 bytes)
- `packages/ds/src/composed/InfoBox.tsx` (2,691 bytes)

**Analysis:**
DS has these same components. Backoffice has local copies that are slightly smaller but functionally equivalent.

**Recommendation:** P1 - Delete backoffice copies, update imports to use DS.

---

### 5. SkipLinks (2 copies)

**Files:**
- `packages/ds/src/composed/SkipLinks.tsx` (3,462 bytes) ← **Canonical**
- `apps/web/src/components/SkipLinks.tsx` (2,613 bytes)

**Analysis:**
DS version is more complete. Web app has its own copy.

**Recommendation:** P1 - Replace web copy with DS import.

---

### 6. SentryTestComponent (Development Only)

**Files:**
- `apps/minside/src/components/SentryTestComponent.tsx` (5,965 bytes)
- `apps/web/src/components/SentryTestComponent.tsx` (5,461 bytes)

**Analysis:**
These are development/testing components for Sentry error tracking. They are not user-facing.

**Recommendation:** P3 - Keep app-local. Not worth centralizing dev-only components.

---

## Other App-Specific Components (Not Duplicates)

### Backoffice-Specific

| Component | Path | Notes |
|-----------|------|-------|
| SavedFilters | `components/SavedFilters.tsx` | Complex filter persistence |
| SearchResults | `components/SearchResults.tsx` | Global search results |
| PaymentDetailsDrawer | `components/PaymentDetailsDrawer.tsx` | Payment details |
| RefundDialog | `components/RefundDialog.tsx` | Refund flow |
| RoleSelector | `components/RoleSelector.tsx` | Role selection UI |
| RoleSwitcher | `components/RoleSwitcher.tsx` | Role switching |
| IntegrationConfigModal | `components/IntegrationConfigModal.tsx` | Integration config |

### MinSide-Specific

| Component | Path | Notes |
|-----------|------|-------|
| AccountSelector | `components/AccountSelector.tsx` | Account selection |
| AccountSwitcher | `components/AccountSwitcher.tsx` | Account switching |
| AccountSelectionModal | `components/AccountSelectionModal.tsx` | Account modal |

### Web-Specific

| Component | Path | Notes |
|-----------|------|-------|
| LazyRentalObjectMap | `components/LazyRentalObjectMap.tsx` | Lazy-loaded map |
| PaymentStatusBadge | `components/PaymentStatusBadge.tsx` | ⚠️ Duplicate of DS |
| RealtimeToast | `components/RealtimeToast.tsx` | Realtime notifications |
| UserMenu | `components/UserMenu.tsx` | User dropdown |

### SaaS Admin-Specific

| Component | Path | Notes |
|-----------|------|-------|
| CategoryEntitlementsTab | `components/CategoryEntitlementsTab.tsx` | Entitlements UI |

---

## Features Directory Analysis (Backoffice)

The backoffice has a `features/` directory with feature-specific components:

### Rental Objects Feature (`features/rental-objects/`)
Contains extensive rental object management components. Many could be candidates for DS but are currently backoffice-specific.

Key components that could be shared:
- Table views
- Form components
- Detail views

### Calendar Feature (`features/calendar/`)
Specialized calendar management components.

### Settings Feature (`features/settings/`)
Organization and tenant settings forms.

---

## Consolidation Priority

### P0 - Immediate (High Impact, Low Risk)
1. ✅ Replace all `ProtectedRoute` copies with DS import
2. ✅ Replace `LoadingFallback` in backoffice
3. ✅ Replace `SkipLinks` in web

### P1 - Short Term
1. Replace `FormSection`, `FormActions`, `InfoBox` in backoffice
2. Create shared `CalendarSection` in DS

### P2 - Medium Term
1. Audit web `PaymentStatusBadge` vs DS version
2. Evaluate backoffice features for DS candidates

### P3 - Low Priority (Keep App-Local)
1. SentryTestComponent - dev only
2. App-specific account/role selectors

---

## Migration Commands

### Replace ProtectedRoute

```bash
# In each app, update imports:
# FROM: import { ProtectedRoute } from '../components/ProtectedRoute';
# TO:   import { ProtectedRoute } from '@xala/ds';

# Then delete local copies:
rm apps/backoffice/src/components/ProtectedRoute.tsx
rm apps/minside/src/components/ProtectedRoute.tsx
rm apps/web/src/components/ProtectedRoute.tsx
rm apps/saas-admin/src/components/ProtectedRoute.tsx
rm apps/monitoring/src/components/ProtectedRoute.tsx
```

### Replace Backoffice Shared Components

```bash
# Update imports in backoffice:
# FROM: import { FormSection } from '@/components/shared';
# TO:   import { FormSection } from '@xala/ds';

# Delete local copies:
rm -rf apps/backoffice/src/components/shared/
```

---

## Verification Checklist

After migration, verify:

- [ ] All apps build successfully
- [ ] Auth flows work in each app
- [ ] Protected routes redirect correctly
- [ ] Forms display correctly
- [ ] No console errors about missing components
- [ ] E2E tests pass
