# Thin App Compliance Audit

**Date:** 2026-01-20  
**Status:** COMPREHENSIVE SCAN COMPLETE  
**Scope:** All applications under `/apps/*`

---

## Executive Summary

This audit evaluates all 7 applications against the **Thin App Policy** which mandates:
- Apps contain ONLY routes/pages + wrapper components
- ALL reusable UI lives in `@xala/ds`
- ALL business logic lives in shared packages
- ALL data access goes through Client SDK against DK API

| App | Status | Critical Issues | Warnings |
|:----|:------:|:---------------:|:--------:|
| **api** | N/A | Backend - not subject to Thin App policy |
| **backoffice** | FAIL | 14 | 25+ |
| **docs-learning** | FAIL | 8 | 50+ |
| **minside** | FAIL | 6 | 20+ |
| **monitoring** | FAIL | 5 | 15+ |
| **saas-admin** | FAIL | 10 | 30+ |
| **web** | FAIL | 7 | 25+ |

---

## Category A: Forbidden UI Components in Apps

### Summary
Found **29 component directories** across apps that should be in `@xala/ds`.

### Violations by App

#### backoffice (9 component directories)
```
src/components/
├── bookings/         → Move to DS blocks
├── dashboard/        → Move to DS blocks
├── gdpr/            → Already migrated, DELETE
├── integrations/    → Move to DS blocks
├── layout/          → Move to DS shells
├── organizations/   → Move to DS blocks
├── seasons/         → Move to DS blocks
├── shared/          → Move to DS primitives
└── users/           → Move to DS blocks
```

#### docs-learning (7 component directories)
```
src/components/
├── article/         → Move to DS blocks
├── blocks/          → Move to DS blocks
├── layout/          → Move to DS shells
├── navigation/      → Move to DS primitives
├── page/            → Move to DS blocks
├── search/          → Move to DS blocks
└── toc/             → Move to DS blocks
```

#### minside (3 component directories)
```
src/components/
├── gdpr/            → Already migrated, keep wrappers only
├── layout/          → Move to DS shells
└── notifications/   → Move to DS blocks
```

#### monitoring (3 component directories)
```
src/components/
├── gdpr/            → Duplicate of minside, DELETE
├── layout/          → Move to DS shells
└── notifications/   → Move to DS blocks
```

#### saas-admin (1 component directory)
```
src/components/
└── layout/          → Move to DS shells
```

#### web (2 feature directories with components)
```
src/features/rental-object-details/components/
├── Sidebar/         → Move to DS blocks
└── Sidebar/components/ → Move to DS blocks
```

---

## Category B: Forbidden Styling in Apps

### B.1 CSS Files Beyond root.css

| App | File | Status |
|:----|:-----|:-------|
| docs-learning | `src/extensions.css` | VIOLATION - Merge to root.css |

> Note: `root.css` files are allowed (DS imports only). Theme files in `public/themes/` are allowed.

### B.2 Inline Styles (style= props)

| App | Estimated Count | Priority |
|:----|:---------------:|:--------:|
| docs-learning | 7700+ | P1 - CRITICAL |
| backoffice | 983+ | P1 |
| minside | 450+ | P2 |
| saas-admin | 300+ | P2 |
| monitoring | 200+ | P3 |
| web | 200+ | P3 |

**Sample Violations:**
```tsx
// docs-learning/src/routes/DocsReleasesPage.tsx:35
<div style={{ /* container - converted from CSS module */ }}>

// backoffice/src/routes/users-management.tsx:105
<div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>

// minside/src/routes/favorites.tsx:82
<div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
```

**Fix:** Replace with DS layout components (`Stack`, `Flex`, `Grid`) or DS blocks.

### B.3 className Usage Outside DS

| App | Count | Notes |
|:----|:-----:|:------|
| monitoring | 9 | Sidebar nav items, header search |
| docs-learning | 2 | TOC links, sidebar nav |
| web | 37 | ActivityCalendar, RentalObjectsPage |
| minside | 6 | Season detail, AccountSelector |

---

## Category C: Forbidden Business Logic in Apps

### C.1 Role Checks in UI

Found **52+ role checks** in UI code that should be server-driven:

| App | File | Line | Violation |
|:----|:-----|:----:|:----------|
| backoffice | `routes/users/UserDetailPage.tsx` | 276 | `user.role === 'super_admin'` |
| backoffice | `routes/organizations/PermissionAssignmentPage.tsx` | 553 | `member.role === 'admin'` |
| backoffice | `providers/BackofficeRoleProvider.tsx` | 103-109 | Role-to-capability mapping |
| backoffice | `hooks/useDemoLogin.tsx` | 102 | `user.role === 'super_admin'` |
| monitoring | `hooks/useDemoLogin.tsx` | 51-53 | Role-based routing |
| monitoring | `hooks/useRBAC.ts` | 56 | `permissions.includes` |

**Fix:** Move role/permission checks to SDK or receive decisions from DK API.

### C.2 App-Level Hooks Assessment

| App | Hook | Status | Action |
|:----|:-----|:------:|:-------|
| backoffice | `useBackofficeRole.ts` | OK | Context re-export, allowed |
| backoffice | `useCapabilities.ts` | WARN | Review for SDK migration |
| backoffice | `useDebounce.ts` | OK | UI utility, allowed |
| backoffice | `useDemoLogin.tsx` | OK | Dev-only, allowed |
| backoffice | `useGooglePlaces.ts` | OK | External API, allowed |
| minside | `useDemoLogin.tsx` | OK | Dev-only, allowed |
| minside | `useNavigation.ts` | OK | UI state, allowed |
| minside | `useOfflineBookings.ts` | OK | Caching layer around SDK, allowed |

---

## Category D: Forbidden Data Access in Apps

### D.1 Direct fetch() Calls

| App | File | Issue |
|:----|:-----|:------|
| backoffice | `pages/PermissionManagement/PermissionManagement.tsx:81,90,107` | Direct `/api/admin/permissions` calls |
| web | `pages/ActivityCalendar/ActivityCalendar.tsx:48` | Direct `/api/activities` call |
| web | `features/.../MapWidget.tsx:75` | Geocoding fetch |
| saas-admin | `services/seed-data.service.ts:207-282` | Direct admin API calls |
| saas-admin | `routes/monitoring/index.tsx:96` | Direct scanner API call |
| saas-admin | `services/ai-seed-generator.service.ts:49,158` | Direct schema/AI calls |
| saas-admin | `routes/ai-seed-generator/AISeedGeneratorPage.tsx:102` | Direct API call |

**Fix:** Create SDK hooks for these endpoints or use existing SDK methods.

### D.2 GraphQL/Axios

- **graphql-request:** None found ✅
- **axios:** None found ✅

---

## Category E: Wrapper Correctness

### Violations: Wrappers Containing Markup

Most routes in all apps contain extensive `<div>` markup instead of using DS blocks:

| App | Route Files with HTML | Priority |
|:----|:---------------------:|:--------:|
| backoffice | 45+ | P1 |
| minside | 25+ | P2 |
| saas-admin | 20+ | P2 |
| docs-learning | 10+ | P3 |
| monitoring | 15+ | P3 |
| web | 5+ | P3 |

**Example Violation:**
```tsx
// backoffice/src/routes/security.tsx
<div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
    <div>...</div>
  </div>
</div>
```

**Correct Pattern:**
```tsx
import { Stack, PageHeader, DataCard } from '@xala/ds';

return (
  <Stack gap="6">
    <PageHeader title={t('security.title')} />
    <DataCard data={securityData} />
  </Stack>
);
```

---

## Category F: DS Usage Compliance

### F.1 Emoji Usage (Should Be DS Icons)

Found **50+ emoji instances** that violate the "SVG icons only via DS icon registry" rule:

| App | Count | Sample Files |
|:----|:-----:|:-------------|
| docs-learning | 15 | `DocsHomePage.tsx`, `DocsArticlePage.tsx` |
| web | 10 | `ActivityCalendar.tsx`, `BookingConfirmationStep.tsx` |
| backoffice | 8 | `guides.tsx`, `gdpr-requests.tsx`, `SearchResults.tsx` |
| minside | 8 | `help.tsx`, `DeleteAccountCard.tsx`, `SentryTestComponent.tsx` |
| monitoring | 6 | `help.tsx`, `bookings.tsx`, `DeleteAccountCard.tsx` |
| saas-admin | 3 | `SeedDataManagementPage.tsx` |

**Sample Violations:**
```tsx
// docs-learning/src/routes/DocsHomePage.tsx
booking: { icon: '📅', color: 'accent' }  // Should use DS icon
rbac: { icon: '🔐', color: 'info' }       // Should use DS icon

// saas-admin/src/routes/seed-data/SeedDataManagementPage.tsx
{result.success ? '✅ Import Complete!' : '⚠️ Import Completed with Errors'}
```

**Fix:** Replace with `<Icon name="calendar" />` from DS icon registry.

### F.2 Missing data-testid

This is a DS gap issue. Apps should not add testids directly - DS components should expose them.

---

## Recommended Actions

### Immediate (P0)
1. **Stop creating new components in apps** - CI gate required
2. **Migrate direct fetch calls to SDK** - 12 files affected

### Phase 1 (P1) - Week 1-2
1. Remove emoji usage - replace with DS icons
2. Migrate `saas-admin` layout to DS shells
3. Create SDK hooks for PermissionManagement, ActivityCalendar

### Phase 2 (P2) - Week 3-4
1. Migrate inline styles to DS layout components
2. Consolidate `backoffice/components/` to DS blocks
3. Migrate `docs-learning/components/` to DS blocks

### Phase 3 (P3) - Week 5-6
1. Migrate remaining app components to DS
2. Remove duplicate gdpr/layout components
3. Full wrapper correctness audit

---

*Generated: 2026-01-20 09:25 by Thin App Compliance Auditor*
