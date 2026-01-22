# DS Adoption & Thin-App Compliance Report

**Generated:** 2026-01-19  
**Status:** AUDIT COMPLETE - MIGRATION REQUIRED  
**Severity:** HIGH - Multiple architecture violations detected

---

## Executive Summary

The audit reveals significant violations of the DS-first + thin-apps architecture policy:

| Metric | Count | Severity |
|--------|-------|----------|
| CSS files in apps | 19 | HIGH |
| Direct @digdir imports | 9 | MEDIUM |
| Duplicate layout components | 4 apps | HIGH |
| Duplicate feature components | 40+ files | HIGH |
| Inline styles | 10,182 matches | MEDIUM |
| App-local hooks with business logic | 30+ files | MEDIUM |

---

## 1. Current DS Package Inventory

### 1.1 DS Structure (COMPLIANT)

```
packages/ds/src/
├── tokens/           # Design tokens (extended.ts)
├── primitives/       # 16 components (Container, Grid, Stack, Badge, etc.)
├── composed/         # 80+ components (PageHeader, DataTable, Drawer, etc.)
├── blocks/           # 45+ business blocks (RentalObjectCard, StatusBadges, etc.)
├── shells/           # 4 shells (AppShell, AppLayout, DashboardSidebar, etc.)
├── types/            # Type definitions
├── hooks/            # Shared hooks
└── utils/            # Utilities
```

### 1.2 DS Exports Summary

| Category | Count | Examples |
|----------|-------|----------|
| **Primitives** | 16 | Container, Grid, Stack, Badge, Card, Text, FormField |
| **Composed** | 80+ | PageHeader, DataTable, Drawer, Modal, ListToolbar, FilterPanel |
| **Blocks** | 45+ | RentalObjectCard, StatusBadges, BookingFormModal, StatCard |
| **Shells** | 4 | AppShell, AppLayout, DashboardSidebar, DashboardContent |
| **Icons** | 60+ | Full Lucide-based icon registry |

### 1.3 Existing Page Structure Blocks

| Block | Status | Location |
|-------|--------|----------|
| `PageHeader` | AVAILABLE | composed/page-header.tsx |
| `ListPageShell` | AVAILABLE | composed/PageShell.tsx |
| `DetailPageShell` | AVAILABLE | composed/PageShell.tsx |
| `FormPageShell` | AVAILABLE | composed/PageShell.tsx |
| `DataPageHeader` | AVAILABLE | composed/data-page/ |
| `DataPageToolbar` | AVAILABLE | composed/data-page/ |
| `EmptyState` | AVAILABLE | composed/data-page/ |
| `LoadingState` | AVAILABLE | composed/PageStates.tsx |
| `ErrorState` | AVAILABLE | composed/PageStates.tsx |
| `AppShell` | AVAILABLE | shells/app-shell.tsx |

---

## 2. Violations by Category

### 2.1 CSS Files in Apps (CRITICAL)

**Total: 19 .module.css files that should not exist**

#### saas-admin (9 files)
```
apps/saas-admin/src/
├── components/
│   ├── layout/AppLayout.module.css       ❌ DELETE
│   ├── layout/Header.module.css          ❌ DELETE
│   ├── layout/Sidebar.module.css         ❌ DELETE
│   └── ProtectedRoute.module.css         ❌ DELETE
├── providers/ToastProvider.module.css    ❌ DELETE
└── routes/
    ├── ai-seed-generator/AISeedGenerator.module.css  ❌ DELETE
    ├── plans/PlansListPage.module.css    ❌ DELETE
    └── tenants/
        ├── TenantsListPage.module.css    ❌ DELETE
        └── TenantDetailPage.module.css   ❌ DELETE
```

#### docs-learning (10 files) 
*Note: docs-learning may have special requirements, evaluate case-by-case*
```
apps/docs-learning/src/
├── components/
│   ├── layout/DocsHeader.module.css
│   ├── layout/DocsLayout.module.css
│   ├── layout/DocsSidebar.module.css
│   └── toc/DocsRightTOC.module.css
└── routes/
    ├── DocsArticlePage.module.css
    ├── DocsHomePage.module.css
    ├── DocsReleasesPage.module.css
    ├── DocsSearchPage.module.css
    ├── DocsSectionPage.module.css
    └── RoleGuidePage.module.css
```

**Action:** Delete all CSS module files, migrate to DS components with tokens.

---

### 2.2 Duplicate Layout Components (CRITICAL)

Each app has its own implementation of the same patterns:

| Component | backoffice | minside | monitoring | saas-admin | web |
|-----------|------------|---------|------------|------------|-----|
| `AppLayout` | ✗ | ✗ | ✗ | ✗ | - |
| `Header` | ✗ | ✗ | ✗ | ✗ | - |
| `Sidebar` | ✗ | ✗ | ✗ | ✗ | - |
| `ProtectedRoute` | ✗ | ✗ | ✗ | ✗ | ✗ |

**DS Already Has:**
- `AppShell` - Full application shell
- `DashboardSidebar` - Sidebar with navigation
- `DashboardContent` - Main content area
- `ProtectedRoute` - Route protection (in composed/)

**Action:** All apps should use DS shells, not custom implementations.

---

### 2.3 Duplicate Feature Components (HIGH)

#### GDPR Components (minside + monitoring - IDENTICAL)
```
apps/{minside,monitoring}/src/components/gdpr/
├── ConsentManager.tsx         → Move to DS: GdprConsentBlock
├── DataExportCard.tsx         → Move to DS: GdprExportBlock
├── DeleteAccountCard.tsx      → Move to DS: GdprDeleteBlock
└── RequestStatusBadge.tsx     → Already in DS: GdprRequestStatusBadge ✓
```

#### Season Components (minside + monitoring - IDENTICAL)
```
apps/{minside,monitoring}/src/features/seasons/components/
├── ApplicationCard.tsx        → Move to DS: SeasonApplicationCard
├── SeasonApplicationDrawer.tsx → Move to DS: SeasonApplicationDrawer
├── SeasonCard.tsx             → Move to DS: SeasonCard
├── SeasonStatusBadge.tsx      → Move to DS: SeasonStatusBadge
└── VenueCard.tsx              → Move to DS: VenueCard
```

#### Settings Tabs (backoffice + minside + monitoring)
```
apps/*/src/features/settings/components/
├── AddressesTab.tsx           → Move to DS: SettingsAddressesBlock
├── NotificationsTab.tsx       → Move to DS: SettingsNotificationsBlock
├── PreferencesTab.tsx         → Move to DS: SettingsPreferencesBlock
├── PrivacyTab.tsx             → Move to DS: SettingsPrivacyBlock
└── ProfileTab.tsx             → Move to DS: SettingsProfileBlock
```

#### Calendar Components (backoffice + minside + monitoring)
```
apps/*/src/components/CalendarSection.tsx  → Already in DS ✓
```

---

### 2.4 Direct @digdir Imports (MEDIUM)

**9 files bypass @xala/ds:**

```
apps/web/src/features/rental-object-details/components/Sidebar/components/
├── BookingStepperHeader.tsx
├── BookingPricingStep.tsx
├── BookingConfirmationStep.tsx
└── BookingSelectedSlotsSidebar.tsx

apps/monitoring/src/features/testing/TestResultsWidget.tsx
apps/backoffice/src/providers/ToastProvider.tsx
apps/web/src/features/rental-object-details/components/PaymentSection.tsx
```

**Action:** Replace `import {...} from '@digdir/designsystemet-react'` with `import {...} from '@xala/ds'`

---

### 2.5 Business Logic in Apps (MEDIUM)

Hooks that contain business logic should be in SDK or domain packages:

#### Calendar Hooks (backoffice)
```
apps/backoffice/src/features/calendar/hooks/
├── useCalendarPermissions.ts  → Move to SDK
├── useCalendarState.ts        → Move to SDK
├── useConflictDetection.ts    → Move to SDK
├── useDragAndDrop.ts          → Keep (UI-only)
└── useRealtimeCalendar.ts     → Move to SDK
```

#### Rental Object Hooks (backoffice)
```
apps/backoffice/src/features/rental-objects/hooks/
├── useRentalObjectFilters.ts     → Move to SDK
├── useRentalObjectPermissions.ts → Move to SDK
└── useRentalObjectWizard.ts      → Keep (UI wizard state)
```

#### Settings Hooks (all apps)
```
apps/*/src/features/settings/hooks/
├── use*Settings.ts  → Move to SDK (data fetching)
```

---

### 2.6 Inline Styles (MEDIUM)

**10,182 matches across 358 files**

Most common patterns:
- `style={{ display: 'flex', ... }}`
- `style={{ padding: '...', margin: '...' }}`

**Action:** Replace with DS components or tokens:
```tsx
// BEFORE (violation)
<div style={{ display: 'flex', gap: '16px', padding: '16px' }}>

// AFTER (compliant)
<Stack direction="row" gap={4} padding={4}>
```

---

## 3. Missing DS Blocks (To Be Created)

Based on audit, these blocks should be added to DS:

### 3.1 Page Layout Blocks
| Block | Priority | Description |
|-------|----------|-------------|
| `AppShellBlock` | P0 | Unified shell for all apps (extends existing) |
| `SidebarNavBlock` | P0 | Category-based navigation from DTO |
| `TopBarBlock` | P0 | Header with context switch, profile, notifications |

### 3.2 List Page Blocks
| Block | Priority | Description |
|-------|----------|-------------|
| `ListPageBlock` | P1 | Composes header + toolbar + table + states |
| `ListToolbarBlock` | P1 | Search + filters + sort + view toggle (exists as ListToolbar) |

### 3.3 Detail Page Blocks
| Block | Priority | Description |
|-------|----------|-------------|
| `DetailPageBlock` | P1 | Composes header + sections + related lists |
| `DetailHeaderBlock` | P1 | Identity + status + actions |
| `DetailSectionsBlock` | P1 | Key-value, timeline, attachments |

### 3.4 Dashboard Blocks
| Block | Priority | Description |
|-------|----------|-------------|
| `DashboardSummaryBlock` | P1 | Unified stats display |
| `SummaryItem` | P1 | Dashboard item (card/row variants) |

### 3.5 Domain-Specific Blocks
| Block | Priority | Description |
|-------|----------|-------------|
| `SeasonApplicationCard` | P2 | Season application display |
| `SeasonCard` | P2 | Season info card |
| `VenueCard` | P2 | Venue display card |
| `GdprConsentBlock` | P2 | Consent management UI |
| `GdprExportBlock` | P2 | Data export UI |
| `SettingsProfileBlock` | P2 | Profile settings form |
| `SettingsNotificationsBlock` | P2 | Notification preferences |

---

## 4. Migration Order (Risk-First)

### Phase 1: Quick Wins (1-2 days)
1. Replace direct @digdir imports with @xala/ds (9 files)
2. Delete ProtectedRoute from all apps, use DS version
3. Remove duplicate CalendarSection, use DS version

### Phase 2: Layout Consolidation (3-5 days)
1. Create unified AppShellBlock with sidebar DTO support
2. Migrate all AppLayout implementations to DS
3. Delete app-local Header/Sidebar components
4. Delete all .module.css files in saas-admin

### Phase 3: Block Migration (1-2 weeks)
1. Move GDPR components to DS blocks
2. Move Season components to DS blocks
3. Move Settings tabs to DS blocks
4. Create missing page blocks

### Phase 4: Hook Migration (1 week)
1. Move business logic hooks to SDK
2. Keep UI-only hooks in apps (wizard state, drag-drop)

### Phase 5: Style Cleanup (Ongoing)
1. Replace inline styles with DS components/tokens
2. Add lint rules to prevent future violations

---

## 5. Enforcement Rules (CI/Lint)

### 5.1 Proposed ESLint Rules
```js
// .eslintrc.js additions
{
  rules: {
    'no-restricted-imports': ['error', {
      patterns: [
        {
          group: ['@digdir/designsystemet-react'],
          message: 'Import from @xala/ds instead'
        }
      ]
    }],
    'no-restricted-syntax': ['error', {
      selector: 'JSXAttribute[name.name="style"]',
      message: 'Inline styles are forbidden. Use DS components or tokens.'
    }]
  }
}
```

### 5.2 Proposed CI Gates
- Fail if `apps/**/*/components/**/*.tsx` exists (except index.ts for re-exports)
- Fail if `apps/**/*.module.css` exists
- Fail if `apps/**/*.css` exists (except root.css, extensions.css)
- Fail if inline `style={}` exceeds threshold

---

## 6. Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| CSS files in apps | 19 | 0 (+ allowed root.css) |
| Direct @digdir imports | 9 | 0 |
| Duplicate components | 40+ | 0 |
| App-local reusable components | 100+ | 0 |
| Inline styles | 10,182 | <500 (edge cases) |
| DS block coverage | 70% | 100% |

---

## 7. File-by-File Migration Checklist

### saas-admin (Priority: HIGH)
- [ ] Delete `components/layout/AppLayout.module.css`
- [ ] Delete `components/layout/Header.module.css`
- [ ] Delete `components/layout/Sidebar.module.css`
- [ ] Delete `components/ProtectedRoute.module.css`
- [ ] Delete `providers/ToastProvider.module.css`
- [ ] Delete `routes/ai-seed-generator/AISeedGenerator.module.css`
- [ ] Delete `routes/plans/PlansListPage.module.css`
- [ ] Delete `routes/tenants/TenantsListPage.module.css`
- [ ] Delete `routes/tenants/TenantDetailPage.module.css`
- [ ] Migrate `components/layout/AppLayout.tsx` → DS AppShell
- [ ] Migrate `components/layout/Header.tsx` → DS TopBarBlock
- [ ] Migrate `components/layout/Sidebar.tsx` → DS SidebarNavBlock
- [ ] Delete `components/ProtectedRoute.tsx` → Use DS ProtectedRoute

### backoffice (Priority: HIGH)
- [ ] Migrate `components/layout/AppLayout.tsx` → DS AppShell
- [ ] Migrate `components/layout/Header.tsx` → DS TopBarBlock
- [ ] Migrate `components/layout/Sidebar.tsx` → DS SidebarNavBlock
- [ ] Delete `components/ProtectedRoute.tsx` → Use DS ProtectedRoute
- [ ] Move `features/calendar/hooks/useCalendar*.ts` → SDK
- [ ] Move `features/rental-objects/hooks/*` → SDK (business logic only)
- [ ] Move `features/settings/components/*Tab.tsx` → DS blocks

### minside (Priority: MEDIUM)
- [ ] Migrate `components/layout/AppLayout.tsx` → DS AppShell
- [ ] Migrate `components/layout/Header.tsx` → DS TopBarBlock
- [ ] Migrate `components/layout/Sidebar.tsx` → DS SidebarNavBlock
- [ ] Delete `components/ProtectedRoute.tsx` → Use DS ProtectedRoute
- [ ] Move `components/gdpr/*` → DS blocks
- [ ] Move `features/seasons/components/*` → DS blocks
- [ ] Move `features/settings/components/*` → DS blocks

### monitoring (Priority: MEDIUM)
- [ ] Migrate `components/layout/AppLayout.tsx` → DS AppShell
- [ ] Migrate `components/layout/Header.tsx` → DS TopBarBlock
- [ ] Migrate `components/layout/Sidebar.tsx` → DS SidebarNavBlock
- [ ] Delete `components/ProtectedRoute.tsx` → Use DS ProtectedRoute
- [ ] Move `components/gdpr/*` → DS blocks (same as minside)
- [ ] Move `features/seasons/components/*` → DS blocks (same as minside)
- [ ] Move `features/settings/components/*` → DS blocks

### web (Priority: MEDIUM)
- [ ] Fix 7 files with direct @digdir imports
- [ ] Delete `components/ProtectedRoute.tsx` → Use DS ProtectedRoute
- [ ] Move `features/rental-object-details/components/Sidebar/*` → Evaluate for DS

---

## Next Steps

1. **Immediate:** Review and approve this report
2. **Week 1:** Execute Phase 1 (Quick Wins)
3. **Week 2:** Execute Phase 2 (Layout Consolidation)
4. **Week 3-4:** Execute Phase 3 (Block Migration)
5. **Ongoing:** Phase 4-5 (Hooks + Styles)

---

*Report generated by DS Governor + Architecture Refactor Lead*
