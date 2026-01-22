# DS-First Migration Checklist

**Version:** 1.0  
**Generated:** 2026-01-19  
**Status:** ACTION REQUIRED

---

## Phase 1: Quick Wins (1-2 Days)

### 1.1 Fix Direct @digdir Imports (9 files)

Replace `import {...} from '@digdir/designsystemet-react'` with `import {...} from '@xala/ds'`

| File | Status |
|------|--------|
| `apps/web/src/features/rental-object-details/components/Sidebar/components/BookingStepperHeader.tsx` | [ ] |
| `apps/web/src/features/rental-object-details/components/Sidebar/components/BookingPricingStep.tsx` | [ ] |
| `apps/web/src/features/rental-object-details/components/Sidebar/components/BookingConfirmationStep.tsx` | [ ] |
| `apps/web/src/features/rental-object-details/components/Sidebar/components/BookingSelectedSlotsSidebar.tsx` | [ ] |
| `apps/web/src/features/rental-object-details/components/PaymentSection.tsx` | [ ] |
| `apps/monitoring/src/features/testing/TestResultsWidget.tsx` | [ ] |
| `apps/backoffice/src/providers/ToastProvider.tsx` | [ ] |

### 1.2 Delete Duplicate ProtectedRoute (5 files)

All apps should use `ProtectedRoute` from `@xala/ds`

| File | Action |
|------|--------|
| `apps/web/src/components/ProtectedRoute.tsx` | [ ] Delete, update imports |
| `apps/backoffice/src/components/ProtectedRoute.tsx` | [ ] Delete, update imports |
| `apps/minside/src/components/ProtectedRoute.tsx` | [ ] Delete, update imports |
| `apps/monitoring/src/components/ProtectedRoute.tsx` | [ ] Delete, update imports |
| `apps/saas-admin/src/components/ProtectedRoute.tsx` | [ ] Delete, update imports |
| `apps/saas-admin/src/components/ProtectedRoute.module.css` | [ ] Delete |

### 1.3 Delete Duplicate CalendarSection (4 files)

| File | Action |
|------|--------|
| `apps/web/src/features/rental-object-details/components/CalendarSection.tsx` | [ ] Evaluate, likely delete |
| `apps/backoffice/src/components/CalendarSection.tsx` | [ ] Delete, use DS |
| `apps/minside/src/components/CalendarSection.tsx` | [ ] Delete, use DS |
| `apps/monitoring/src/components/CalendarSection.tsx` | [ ] Delete, use DS |

---

## Phase 2: Layout Consolidation (3-5 Days)

### 2.1 saas-admin Layout Migration

**Delete all CSS module files:**

| File | Status |
|------|--------|
| `apps/saas-admin/src/components/layout/AppLayout.module.css` | [ ] Delete |
| `apps/saas-admin/src/components/layout/Header.module.css` | [ ] Delete |
| `apps/saas-admin/src/components/layout/Sidebar.module.css` | [ ] Delete |
| `apps/saas-admin/src/providers/ToastProvider.module.css` | [ ] Delete |
| `apps/saas-admin/src/routes/ai-seed-generator/AISeedGenerator.module.css` | [ ] Delete |
| `apps/saas-admin/src/routes/plans/PlansListPage.module.css` | [ ] Delete |
| `apps/saas-admin/src/routes/tenants/TenantsListPage.module.css` | [ ] Delete |
| `apps/saas-admin/src/routes/tenants/TenantDetailPage.module.css` | [ ] Delete |

**Migrate layout components:**

| File | Action |
|------|--------|
| `apps/saas-admin/src/components/layout/AppLayout.tsx` | [ ] Use DS AppShell |
| `apps/saas-admin/src/components/layout/Header.tsx` | [ ] Use DS DashboardHeader |
| `apps/saas-admin/src/components/layout/Sidebar.tsx` | [ ] Use DS DashboardSidebar |

### 2.2 backoffice Layout Migration

| File | Action |
|------|--------|
| `apps/backoffice/src/components/layout/AppLayout.tsx` | [ ] Use DS AppShell |
| `apps/backoffice/src/components/layout/Header.tsx` | [ ] Use DS DashboardHeader |
| `apps/backoffice/src/components/layout/Sidebar.tsx` | [ ] Use DS DashboardSidebar |
| `apps/backoffice/src/components/layout/BackofficeSidebar.tsx` | [ ] Merge with above |

### 2.3 minside Layout Migration

| File | Action |
|------|--------|
| `apps/minside/src/components/layout/AppLayout.tsx` | [ ] Use DS AppShell |
| `apps/minside/src/components/layout/Header.tsx` | [ ] Use DS DashboardHeader |
| `apps/minside/src/components/layout/Sidebar.tsx` | [ ] Use DS DashboardSidebar |

### 2.4 monitoring Layout Migration

| File | Action |
|------|--------|
| `apps/monitoring/src/components/layout/AppLayout.tsx` | [ ] Use DS AppShell |
| `apps/monitoring/src/components/layout/Header.tsx` | [ ] Use DS DashboardHeader |
| `apps/monitoring/src/components/layout/Sidebar.tsx` | [ ] Use DS DashboardSidebar |

---

## Phase 3: Block Migration (1-2 Weeks)

### 3.1 GDPR Components → DS Blocks

**Source:** `apps/minside/src/components/gdpr/` (identical in monitoring)

| Component | Target Block | Status |
|-----------|--------------|--------|
| `ConsentManager.tsx` | `packages/ds/src/blocks/gdpr/ConsentManager.tsx` | [ ] |
| `DataExportCard.tsx` | `packages/ds/src/blocks/gdpr/DataExportCard.tsx` | [ ] |
| `DeleteAccountCard.tsx` | `packages/ds/src/blocks/gdpr/DeleteAccountCard.tsx` | [ ] |

**After migration, delete from:**
- [ ] `apps/minside/src/components/gdpr/`
- [ ] `apps/monitoring/src/components/gdpr/`

### 3.2 Season Components → DS Blocks

**Source:** `apps/minside/src/features/seasons/components/` (identical in monitoring)

| Component | Target Block | Status |
|-----------|--------------|--------|
| `ApplicationCard.tsx` | `packages/ds/src/blocks/seasons/ApplicationCard.tsx` | [ ] |
| `SeasonApplicationDrawer.tsx` | `packages/ds/src/blocks/seasons/ApplicationDrawer.tsx` | [ ] |
| `SeasonCard.tsx` | `packages/ds/src/blocks/seasons/SeasonCard.tsx` | [ ] |
| `SeasonStatusBadge.tsx` | Already in DS StatusBadges | [ ] Verify |
| `VenueCard.tsx` | `packages/ds/src/blocks/seasons/VenueCard.tsx` | [ ] |

**After migration, delete from:**
- [ ] `apps/minside/src/features/seasons/`
- [ ] `apps/monitoring/src/features/seasons/`

### 3.3 Settings Tabs → DS Blocks

**Source:** `apps/backoffice/src/features/settings/components/`

| Component | Target Block | Status |
|-----------|--------------|--------|
| `ProfileTab.tsx` | `packages/ds/src/blocks/settings/ProfileTab.tsx` | [ ] |
| `AddressesTab.tsx` | `packages/ds/src/blocks/settings/AddressesTab.tsx` | [ ] |
| `NotificationsTab.tsx` | `packages/ds/src/blocks/settings/NotificationsTab.tsx` | [ ] |
| `PreferencesTab.tsx` | `packages/ds/src/blocks/settings/PreferencesTab.tsx` | [ ] |
| `PrivacyTab.tsx` | `packages/ds/src/blocks/settings/PrivacyTab.tsx` | [ ] |

**After migration, delete from:**
- [ ] `apps/backoffice/src/features/settings/components/`
- [ ] `apps/minside/src/features/settings/components/`
- [ ] `apps/monitoring/src/features/settings/components/`

### 3.4 Account Components → DS Blocks

**Source:** `apps/minside/src/components/` (identical in monitoring)

| Component | Target Block | Status |
|-----------|--------------|--------|
| `AccountSelectionModal.tsx` | `packages/ds/src/blocks/account/SelectionModal.tsx` | [ ] |
| `AccountSelector.tsx` | `packages/ds/src/blocks/account/Selector.tsx` | [ ] |
| `AccountSwitcher.tsx` | `packages/ds/src/blocks/account/Switcher.tsx` | [ ] |

**After migration, delete from:**
- [ ] `apps/minside/src/components/`
- [ ] `apps/monitoring/src/components/`

### 3.5 Notification Components → DS Blocks

| Component | Target Block | Status |
|-----------|--------------|--------|
| `NotificationPreferencesMatrix.tsx` | `packages/ds/src/blocks/notifications/PreferencesMatrix.tsx` | [ ] |

---

## Phase 4: Hook Migration to SDK (1 Week)

### 4.1 Calendar Hooks

**Source:** `apps/backoffice/src/features/calendar/hooks/`

| Hook | Target | Status |
|------|--------|--------|
| `useCalendarPermissions.ts` | `packages/client-sdk/src/hooks/calendar/` | [ ] |
| `useCalendarState.ts` | `packages/client-sdk/src/hooks/calendar/` | [ ] |
| `useConflictDetection.ts` | `packages/client-sdk/src/hooks/calendar/` | [ ] |
| `useRealtimeCalendar.ts` | `packages/client-sdk/src/hooks/calendar/` | [ ] |
| `useDragAndDrop.ts` | Keep in app (UI only) | N/A |

### 4.2 Rental Object Hooks

**Source:** `apps/backoffice/src/features/rental-objects/hooks/`

| Hook | Target | Status |
|------|--------|--------|
| `useRentalObjectFilters.ts` | `packages/client-sdk/src/hooks/rental-objects/` | [ ] |
| `useRentalObjectPermissions.ts` | `packages/client-sdk/src/hooks/rental-objects/` | [ ] |
| `useRentalObjectWizard.ts` | Keep in app (UI wizard state) | N/A |

### 4.3 Settings Hooks

**Source:** `apps/*/src/features/settings/hooks/`

| Hook | Target | Status |
|------|--------|--------|
| `useAddressSettings.ts` | `packages/client-sdk/src/hooks/settings/` | [ ] |
| `useNotificationSettings.ts` | `packages/client-sdk/src/hooks/settings/` | [ ] |
| `usePreferenceSettings.ts` | `packages/client-sdk/src/hooks/settings/` | [ ] |
| `usePrivacySettings.ts` | `packages/client-sdk/src/hooks/settings/` | [ ] |
| `useProfileSettings.ts` | `packages/client-sdk/src/hooks/settings/` | [ ] |

---

## Phase 5: Inline Style Cleanup (Ongoing)

### Priority Files (Most Violations)

Based on grep results, focus on these files first:

| File | Violations | Status |
|------|------------|--------|
| `apps/backoffice/src/routes/messages.tsx` | 143 | [ ] |
| `apps/monitoring/src/routes/messages.tsx` | 147 | [ ] |
| `apps/backoffice/src/routes/reports.tsx` | 142 | [ ] |
| `apps/monitoring/src/routes/dashboard.tsx` | 121 | [ ] |
| `apps/backoffice/src/routes/settings.tsx` | 115 | [ ] |
| `apps/backoffice/src/routes/bookings.tsx` | 101 | [ ] |

### Replacement Patterns

```tsx
// BEFORE
style={{ display: 'flex', gap: '16px' }}
// AFTER
<Stack direction="row" gap={4}>

// BEFORE
style={{ padding: '24px', marginBottom: '16px' }}
// AFTER
<Box padding={6} marginBottom={4}>

// BEFORE
style={{ backgroundColor: 'var(--ds-color-neutral-surface-default)' }}
// AFTER
<Surface variant="default">
```

---

## Verification Checklist

After each phase, verify:

### Phase 1 Verification
- [ ] No imports from `@digdir/designsystemet-react` in apps
- [ ] No `ProtectedRoute.tsx` files in apps
- [ ] No duplicate `CalendarSection.tsx` files

### Phase 2 Verification
- [ ] No `.module.css` files in saas-admin
- [ ] All apps use DS AppShell or equivalent
- [ ] No custom Header/Sidebar components

### Phase 3 Verification
- [ ] GDPR blocks in DS, deleted from apps
- [ ] Season blocks in DS, deleted from apps
- [ ] Settings blocks in DS, deleted from apps

### Phase 4 Verification
- [ ] Business logic hooks in SDK
- [ ] Only UI state hooks remain in apps

### Phase 5 Verification
- [ ] Inline style count < 500
- [ ] No `style={{...}}` in new code

---

## CI/Lint Enforcement

After migration, add these checks:

```yaml
# .github/workflows/thin-app-check.yml
name: Thin App Compliance

on: [pull_request]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Check for @digdir imports
        run: |
          if grep -r "from '@digdir/designsystemet-react'" apps/; then
            echo "::error::Direct @digdir imports found. Use @xala/ds"
            exit 1
          fi
          
      - name: Check for CSS modules in apps
        run: |
          if find apps -name "*.module.css" | grep -v node_modules; then
            echo "::error::CSS modules not allowed in apps"
            exit 1
          fi
          
      - name: Check for components in apps
        run: |
          # Allow index.ts for re-exports
          COMPONENTS=$(find apps -path "*/components/*.tsx" ! -name "index.tsx" | head -20)
          if [ -n "$COMPONENTS" ]; then
            echo "::error::Components found in apps. Move to @xala/ds"
            echo "$COMPONENTS"
            exit 1
          fi
```

---

## Timeline Summary

| Phase | Duration | Files | Priority |
|-------|----------|-------|----------|
| Phase 1: Quick Wins | 1-2 days | ~20 files | HIGH |
| Phase 2: Layout | 3-5 days | ~15 files | HIGH |
| Phase 3: Blocks | 1-2 weeks | ~30 files | MEDIUM |
| Phase 4: Hooks | 1 week | ~15 files | MEDIUM |
| Phase 5: Styles | Ongoing | ~350 files | LOW |

**Total Estimated Effort:** 3-4 weeks

---

*Track progress by checking boxes. Update this document as work completes.*
