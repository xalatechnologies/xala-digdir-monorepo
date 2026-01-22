# Remediation Plan - DigiList Platform Compliance

**Generated:** 2026-01-19  
**Status:** STEP 4 Complete - Phased, non-breaking remediation strategy  
**Total Effort:** 13-20 weeks (phased approach)

---

## Executive Summary

**Objective:** Achieve 100% compliance with DS-First / Thin Apps / Contract-First architecture

**Strategy:** Phased, non-breaking migration prioritizing security and critical gaps first

**Phases:**
- **Phase 0:** CI/CD Gates (1 day) - Prevent new violations
- **Phase 1:** Security & Critical Gaps (10-15 days) - RBAC, AppLayout, core violations
- **Phase 2:** SDK Coverage (1 week) - Add missing services
- **Phase 3:** DS Block Migration (3-4 weeks) - Move app components to DS
- **Phase 4:** Style Cleanup (4-6 weeks) - Remove inline styles
- **Phase 5:** Contract Tests (1 week) - Prevent drift

**Total Duration:** 13-20 weeks (3-5 months) in parallel streams

---

## Phase 0: CI/CD Quality Gates (1 day)

### Objective
**Prevent new violations** from entering codebase while we fix existing ones

### Tasks

#### Task 0.1: Add ESLint Rules
**File:** `.eslintrc.js`

```javascript
module.exports = {
  overrides: [
    {
      files: ['apps/*/src/**/*.{ts,tsx}'],
      rules: {
        // Forbid CSS module imports in apps
        'no-restricted-imports': ['error', {
          patterns: ['*.module.css', '*.css'],
          message: 'Apps must not import CSS files. Use @xala/ds tokens instead.'
        }],
        
        // Forbid direct @digdir imports
        'no-restricted-imports': ['error', {
          paths: [{
            name: '@digdir/designsystemet-react',
            message: 'Import from @xala/ds instead.'
          }]
        }],
        
        // Forbid inline styles
        'react/forbid-dom-props': ['error', {
          forbid: [{
            propName: 'style',
            message: 'Inline styles forbidden. Use @xala/ds tokens.'
          }]
        }],
      }
    }
  ]
};
```

**Acceptance:** Linter fails on violations  
**Effort:** 2 hours

---

#### Task 0.2: Add Pre-Commit Hook
**File:** `.husky/pre-commit`

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Check for CSS modules in apps
if git diff --cached --name-only | grep "^apps/.*\.module\.css$"; then
  echo "❌ ERROR: CSS modules not allowed in apps"
  exit 1
fi

# Check for RBAC logic in apps
if git diff --cached --name-only | xargs grep -l "ROLE_PERMISSIONS" 2>/dev/null | grep "^apps/"; then
  echo "❌ ERROR: RBAC logic not allowed in apps"
  exit 1
fi

# Run linter on staged files
pnpm lint-staged
```

**Acceptance:** Commits blocked on violations  
**Effort:** 1 hour

---

#### Task 0.3: Add GitHub Actions Check
**File:** `.github/workflows/quality-gates.yml`

```yaml
name: Quality Gates

on: [pull_request]

jobs:
  architecture-compliance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Check CSS modules in apps
        run: |
          if find apps/*/src -name "*.module.css" -o -name "*.css" | grep -q .; then
            echo "ERROR: CSS files found in apps"
            find apps/*/src -name "*.module.css" -o -name "*.css"
            exit 1
          fi
      
      - name: Check direct @digdir imports
        run: |
          if grep -r "from '@digdir/designsystemet-react'" apps/*/src; then
            echo "ERROR: Direct @digdir imports found"
            exit 1
          fi
      
      - name: Check RBAC logic in apps
        run: |
          if grep -r "ROLE_PERMISSIONS" apps/*/src; then
            echo "ERROR: RBAC logic found in apps"
            exit 1
          fi
      
      - name: Check SDK coverage
        run: node scripts/verify-sdk-coverage.js
```

**Acceptance:** PR blocked on violations  
**Effort:** 2 hours

---

**Phase 0 Total:** 1 day  
**Acceptance:** ✅ No new violations can enter codebase

---

## Phase 1: Security & Critical Gaps (10-15 days)

### Priority: **P0 - Must fix before launch**

---

### Task 1.1: Remove RBAC Logic from Apps (1 day)

**Issue:** Apps duplicate server RBAC rules (security risk)

#### Step 1.1.1: Delete App-Local RBAC Hooks
**Files to delete:**
- `apps/backoffice/src/hooks/useRBAC.ts` (83 lines)
- `apps/minside/src/hooks/useRBAC.ts` (similar)

**Reason:** Server is source of truth for permissions

#### Step 1.1.2: Update Apps to Use Capabilities API
**Pattern:**
```typescript
// ❌ BEFORE (business logic in app)
import { useRBAC } from '../hooks/useRBAC';

const { hasPermission } = useRBAC();
if (hasPermission('bookings.approve')) {
  // Show approve button
}

// ✅ AFTER (server-driven)
import { useCapabilities } from '@digilist/client-sdk';

const { data: capabilities } = useCapabilities('backoffice');
if (capabilities?.capabilities.includes('CAP_BOOKING_APPROVE')) {
  // Show approve button
}
```

**Files to update:**
- `apps/backoffice/src/routes/bookings/*.tsx` (5 files)
- `apps/backoffice/src/routes/rental-objects/*.tsx` (3 files)
- `apps/minside/src/routes/bookings/*.tsx` (2 files)

#### Step 1.1.3: Integration Tests
```typescript
// tests/integration/rbac.test.ts
describe('RBAC Compliance', () => {
  it('backoffice uses server capabilities only', async () => {
    // Verify no RBAC_PERMISSIONS constant in apps
    const violations = await searchFiles('apps/backoffice', 'ROLE_PERMISSIONS');
    expect(violations).toHaveLength(0);
  });
  
  it('capabilities API drives UI', async () => {
    // Mock capabilities response
    mockCapabilitiesAPI({ capabilities: ['CAP_BOOKING_APPROVE'] });
    
    // Render bookings page
    render(<BookingsPage />);
    
    // Verify approve button shows
    expect(screen.getByRole('button', { name: /approve/i })).toBeInTheDocument();
  });
});
```

**Acceptance Criteria:**
- ✅ Zero RBAC logic in apps
- ✅ All permission checks via capabilities API
- ✅ Integration tests pass
- ✅ CI gate prevents RBAC logic in apps

**Effort:** 1 day (8 hours)  
**Risk:** LOW - Capabilities API already exists

---

### Task 1.2: Consolidate AppLayout (3 days)

**Issue:** 4 apps have custom AppLayout components (blocks consistent layout)

#### Step 1.2.1: Audit AppLayout Usage
**Current:**
- `apps/backoffice/src/components/layout/AppLayout.tsx` (200+ lines)
- `apps/saas-admin/src/components/layout/AppLayout.tsx` (200+ lines)
- `apps/monitoring/src/components/layout/AppLayout.tsx` (200+ lines)
- `apps/minside/src/components/layout/AppLayout.tsx` (200+ lines)

**Pattern:**
```typescript
// ❌ App-local AppLayout
import styles from './AppLayout.module.css';

export function AppLayout({ children }) {
  return (
    <div className={styles.container}>
      <Sidebar />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
```

#### Step 1.2.2: Verify DS AppShell Supports Requirements
**File:** `packages/ds/src/shells/AppShell.tsx`

**Required features:**
- ✅ Sidebar slot
- ✅ Header slot
- ✅ Main content slot
- ✅ Footer slot
- ✅ Mobile nav
- ✅ Responsive breakpoints

**Action:** Verify DS AppShell has all features (read DS docs)

#### Step 1.2.3: Migrate One App (Backoffice)
**Steps:**
1. Replace app-local AppLayout with DS AppShell
2. Delete `apps/backoffice/src/components/layout/AppLayout.tsx`
3. Delete `apps/backoffice/src/components/layout/AppLayout.module.css`
4. Update all pages to import from `@xala/ds`

**Pattern:**
```typescript
// ✅ Use DS AppShell
import { AppShell } from '@xala/ds';

export function App() {
  return (
    <AppShell
      sidebar={<BackofficeSidebar />}
      header={<BackofficeHeader />}
    >
      <Outlet />
    </AppShell>
  );
}
```

#### Step 1.2.4: Visual Regression Tests
```typescript
// tests/visual/app-layout.spec.ts
test('backoffice layout matches baseline', async ({ page }) => {
  await page.goto('/backoffice/bookings');
  await expect(page).toHaveScreenshot('backoffice-layout.png');
});
```

#### Step 1.2.5: Repeat for Other Apps
- Day 1: Backoffice
- Day 2: Saas-admin
- Day 3: Monitoring, Minside

**Acceptance Criteria:**
- ✅ All apps use DS AppShell
- ✅ Zero app-local AppLayout components
- ✅ Visual regression tests pass
- ✅ No layout drift between apps

**Effort:** 3 days (1 app per day)  
**Risk:** MEDIUM - Visual changes require QA

---

### Task 1.3: Remove CSS Modules from Apps (2 weeks)

**Issue:** 19 CSS module files in apps (violates "no custom CSS" rule)

#### Step 1.3.1: Prioritize by App
- **saas-admin:** 9 CSS files (2 days)
- **docs-learning:** 10 CSS files (2 days)

#### Step 1.3.2: Migration Pattern per File
```typescript
// ❌ BEFORE
import styles from './BookingCard.module.css';

<div className={styles.card}>
  <h3 className={styles.title}>{booking.title}</h3>
</div>

// ✅ AFTER (use DS tokens)
import { Card, Heading } from '@xala/ds';

<Card>
  <Heading level={3}>{booking.title}</Heading>
</Card>
```

#### Step 1.3.3: Automated Refactor Script
**File:** `scripts/remove-css-modules.js`

```javascript
// Find all CSS module imports
// Replace with DS components or tokens
// Delete CSS files after migration
```

**Effort:** 1 week to build script, 1 week to apply

**Acceptance Criteria:**
- ✅ Zero CSS files in apps
- ✅ All styling via DS tokens or components
- ✅ Visual regression tests pass
- ✅ CI gate prevents CSS imports

**Effort:** 2 weeks  
**Risk:** MEDIUM - Requires careful visual QA

---

### Task 1.4: Move Season Components to DS (1 week)

**Issue:** 10 season-related components in apps (should be DS blocks)

#### Step 1.4.1: Create DS Blocks
**New files in DS:**
- `packages/ds/src/blocks/SeasonFormBlock.tsx`
- `packages/ds/src/blocks/SeasonVenueBlock.tsx`
- `packages/ds/src/blocks/SeasonApplicationBlock.tsx`
- `packages/ds/src/blocks/SeasonAllocationBlock.tsx`

#### Step 1.4.2: Extract from Backoffice
**Source files:**
- `apps/backoffice/src/components/seasons/SeasonalLeaseForm.tsx` → DS
- `apps/backoffice/src/components/seasons/SeasonVenueManagement.tsx` → DS
- `apps/backoffice/src/components/seasons/SeasonApplicationManagement.tsx` → DS
- `apps/backoffice/src/components/seasons/SeasonAllocationManagement.tsx` → DS

#### Step 1.4.3: Convert to Blocks (Remove SDK Dependencies)
**Pattern:**
```typescript
// ❌ BEFORE (in app, calls SDK directly)
export function SeasonalLeaseForm() {
  const createSeason = useCreateSeason(); // SDK hook
  
  const handleSubmit = (data) => {
    createSeason.mutate(data);
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}

// ✅ AFTER (in DS, pure props)
export interface SeasonFormBlockProps {
  onSubmit: (data: SeasonFormData) => void;
  isLoading?: boolean;
}

export function SeasonFormBlock({ onSubmit, isLoading }: SeasonFormBlockProps) {
  return <form onSubmit={onSubmit}>...</form>;
}
```

#### Step 1.4.4: Update Backoffice to Use Blocks
```typescript
// apps/backoffice/src/routes/seasons/create.tsx
import { SeasonFormBlock } from '@xala/ds';
import { useCreateSeason } from '@digilist/client-sdk';

export function CreateSeasonPage() {
  const createSeason = useCreateSeason();
  
  return (
    <SeasonFormBlock
      onSubmit={(data) => createSeason.mutate(data)}
      isLoading={createSeason.isPending}
    />
  );
}
```

**Acceptance Criteria:**
- ✅ 4 new DS blocks
- ✅ Backoffice uses DS blocks only
- ✅ Storybook entries for each block
- ✅ Zero season components in apps

**Effort:** 1 week (2 days per block)  
**Risk:** LOW - Well-defined extraction

---

### Task 1.5: Move GDPR Components to DS (3 days)

**Issue:** 6 GDPR components duplicated across apps

#### Step 1.5.1: Create DS Blocks
- `packages/ds/src/blocks/GdprConsentBlock.tsx`
- `packages/ds/src/blocks/GdprDataRequestBlock.tsx`
- `packages/ds/src/blocks/CookieBannerBlock.tsx`

#### Step 1.5.2: Extract from Apps
- `apps/backoffice/src/components/gdpr/ConsentManager.tsx` → DS
- `apps/minside/src/components/gdpr/DataRequest.tsx` → DS
- `apps/web/src/components/gdpr/CookieBanner.tsx` → DS

#### Step 1.5.3: Compliance Requirements
**Critical:** GDPR UI must be:
- ✅ Consistent across all apps
- ✅ Auditable (versioned)
- ✅ Localized (nb/en)
- ✅ Accessible (WCAG AA)

**Acceptance Criteria:**
- ✅ 3 new DS blocks
- ✅ All apps use DS blocks
- ✅ GDPR compliance verified
- ✅ Audit trail for changes

**Effort:** 3 days  
**Risk:** HIGH - Legal compliance requirement

---

### Task 1.6: Move Settings Tabs to DS (4 days)

**Issue:** 15 settings tabs across apps (duplicated pattern)

#### Step 1.6.1: Create DS Block
**File:** `packages/ds/src/blocks/SettingsTabBlock.tsx`

**Features:**
- Tab navigation
- Content slots
- Save/cancel actions
- Dirty state tracking
- Keyboard navigation

#### Step 1.6.2: Plugin System for App-Specific Tabs
```typescript
// Pattern: App registers tabs with content
<SettingsTabBlock
  tabs={[
    { id: 'general', label: t('settings.general'), content: <GeneralSettings /> },
    { id: 'notifications', label: t('settings.notifications'), content: <NotificationSettings /> },
  ]}
  onSave={handleSave}
/>
```

**Acceptance Criteria:**
- ✅ 1 DS SettingsTabBlock
- ✅ All apps use SettingsTabBlock
- ✅ Consistent tab behavior
- ✅ Zero app-local settings tabs

**Effort:** 4 days  
**Risk:** MEDIUM - Complex interactions

---

**Phase 1 Total:** 10-15 days  
**Critical Path:** Tasks 1.1 → 1.2 → (1.3-1.6 in parallel)

---

## Phase 2: SDK Coverage (1 week)

### Priority: **P1 - High Priority**

---

### Task 2.1: Add Missing SDK Services (4 days)

**Objective:** Add SDK services for 8 API controllers

#### Services to Add
| Service | Endpoints | Effort |
|---------|-----------|--------|
| `allocations.service.ts` | 5 | 4 hours |
| `amenities.service.ts` | 4 | 3 hours |
| `discount-codes.service.ts` | 6 | 4 hours |
| `settings.service.ts` | 8 | 5 hours |
| `user-groups.service.ts` | 6 | 4 hours |
| `permission-assignment.service.ts` | 5 | 4 hours |
| `case-handler-scope.service.ts` | 5 | 4 hours |
| `seasonal-lease.service.ts` | 4 | 3 hours |

**Total:** 31 hours (4 days)

#### Step 2.1.1: Template per Service
```typescript
// packages/client-sdk/src/services/allocations.service.ts
import { BaseService } from './base.service';
import type { Allocation, CreateAllocationDTO, AllocationQueryParams } from '../types';

export class AllocationsService extends BaseService {
  constructor() {
    super('/api/allocations');
  }

  async getAll(params?: AllocationQueryParams) {
    return this.client.get(this.buildPath(), { params });
  }

  async getById(id: string) {
    return this.client.get(this.buildPath(`/${id}`));
  }

  async create(data: CreateAllocationDTO) {
    return this.client.post(this.buildPath(), data);
  }

  async update(id: string, data: Partial<CreateAllocationDTO>) {
    return this.client.put(this.buildPath(`/${id}`), data);
  }

  async delete(id: string) {
    return this.client.delete(this.buildPath(`/${id}`));
  }
}

export const allocationsService = new AllocationsService();
```

#### Step 2.1.2: React Query Hooks
```typescript
// packages/client-sdk/src/hooks/use-allocations.ts
export function useAllocations(params?: AllocationQueryParams) {
  return useQuery({
    queryKey: queryKeys.allocations.list(params),
    queryFn: () => allocationsService.getAll(params),
  });
}

export function useCreateAllocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAllocationDTO) => allocationsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.allocations.all });
    },
  });
}

// ... other hooks
```

#### Step 2.1.3: Integration Tests
```typescript
// packages/client-sdk/tests/services/allocations.test.ts
describe('AllocationsService', () => {
  it('fetches allocations', async () => {
    mockAPI.onGet('/api/allocations').reply(200, { data: [...] });
    const result = await allocationsService.getAll();
    expect(result.data).toHaveLength(5);
  });
  
  it('creates allocation', async () => {
    mockAPI.onPost('/api/allocations').reply(201, { data: {...} });
    const result = await allocationsService.create(mockAllocation);
    expect(result.data.id).toBeDefined();
  });
});
```

**Acceptance Criteria:**
- ✅ 8 new SDK services
- ✅ 40+ new React Query hooks
- ✅ Integration tests for all services
- ✅ Type-safe DTOs

**Effort:** 4 days (8 services × 4 hours)  
**Risk:** LOW - Well-defined pattern

---

### Task 2.2: Move Offline Logic to SDK (1 day)

**Issue:** `useOfflineBookings` in MinSide app (should be in SDK)

#### Step 2.2.1: Create SDK Offline Module
**File:** `packages/sdk-core/src/offline/bookings-cache.ts`

```typescript
// Move BookingsCache class from app to SDK
export class BookingsCache {
  // IndexedDB logic
}
```

#### Step 2.2.2: Create SDK Hook
**File:** `packages/client-sdk/src/hooks/use-offline-sync.ts`

```typescript
import { BookingsCache } from '@xala/sdk-core';

export function useOfflineBookings(params?: BookingQueryParams) {
  const cache = useMemo(() => new BookingsCache(), []);
  const { data: onlineData, isLoading } = useMyBookings(params);
  
  // Sync logic
  
  return { data: isOnline ? onlineData : cachedData, isLoading };
}
```

#### Step 2.2.3: Update MinSide
```typescript
// apps/minside/src/routes/bookings.tsx
import { useOfflineBookings } from '@digilist/client-sdk';

export function MyBookingsPage() {
  const { data, isLoading } = useOfflineBookings();
  // ...
}
```

#### Step 2.2.4: Delete App Hook
- Delete `apps/minside/src/hooks/useOfflineBookings.ts`

**Acceptance Criteria:**
- ✅ Offline logic in SDK package
- ✅ All apps can use offline sync
- ✅ Unit tests for sync logic
- ✅ Zero offline logic in apps

**Effort:** 1 day  
**Risk:** LOW - Straightforward extraction

---

**Phase 2 Total:** 1 week (5 days)  
**Acceptance:** ✅ SDK covers 100% of API (excluding 6 intentionally excluded)

---

## Phase 3: DS Block Migration (3-4 weeks)

### Priority: **P2 - Medium Priority**

---

### Task 3.1: Create Missing DS Blocks (2 weeks)

**Objective:** Add 10 missing DS blocks to eliminate app-local components

#### Blocks to Create
| Block | Complexity | Effort |
|-------|------------|--------|
| `ListPageBlock` | HIGH | 3 days |
| `DetailPageBlock` | HIGH | 3 days |
| `BookingWizardBlock` | HIGH | 3 days |
| `DashboardGridBlock` | MEDIUM | 2 days |
| (Already created in Phase 1) | - | - |

**Total:** 11 days (2 weeks buffer)

#### Step 3.1.1: ListPageBlock
**Features:**
- Page header
- Toolbar (search, filters, sort)
- Data table
- Pagination
- Empty/loading/error states

**Props:**
```typescript
interface ListPageBlockProps<T> {
  title: string;
  data: T[];
  columns: Column<T>[];
  toolbar?: ToolbarProps;
  isLoading?: boolean;
  onPageChange?: (page: number) => void;
  emptyState?: ReactNode;
}
```

#### Step 3.1.2: DetailPageBlock
**Features:**
- Detail header (title, status, actions)
- Section tabs or accordion
- Related lists
- Audit trail

**Acceptance Criteria:**
- ✅ 10 new DS blocks
- ✅ Storybook entries for all
- ✅ Accessibility audits pass
- ✅ Unit tests for all blocks

**Effort:** 2 weeks  
**Risk:** MEDIUM - Complex blocks

---

### Task 3.2: Migrate App Pages to Use Blocks (1-2 weeks)

**Objective:** Replace app-local components with DS blocks

#### Migration Pattern
```typescript
// ❌ BEFORE (app-local components)
<div className="page">
  <PageHeader title="Bookings" />
  <FilterBar />
  <DataTable data={bookings} />
</div>

// ✅ AFTER (DS blocks)
<ListPageBlock
  title={t('bookings.title')}
  data={bookings}
  columns={columns}
  toolbar={{ search: true, filters: bookingFilters }}
/>
```

#### Apps to Migrate
- **Backoffice:** 20 pages
- **Web:** 10 pages
- **MinSide:** 8 pages
- **Saas-admin:** 12 pages

**Total:** 50 pages × 30 min = 25 hours (3 days)

**Acceptance Criteria:**
- ✅ 50 pages use DS blocks
- ✅ Zero app-local page components
- ✅ Visual regression tests pass

**Effort:** 1-2 weeks  
**Risk:** LOW - Repetitive refactor

---

**Phase 3 Total:** 3-4 weeks  
**Acceptance:** ✅ All page patterns use DS blocks

---

## Phase 4: Style Cleanup (4-6 weeks)

### Priority: **P2 - Medium Priority**

---

### Task 4.1: Remove Inline Styles (automated)

**Issue:** 10,182 inline style matches across 358 files

#### Step 4.1.1: Build Automated Refactor Tool
**File:** `scripts/remove-inline-styles.js`

```javascript
// Find: style={{ padding: '20px' }}
// Replace: className="p-4" (using DS token classes)

// Find: style={{ background: '#f5f5f5' }}
// Replace: style with data-ds-surface="default"
```

#### Step 4.1.2: Apply in Batches
- Week 1: Backoffice (100 files)
- Week 2: Web (80 files)
- Week 3: MinSide (60 files)
- Week 4: Saas-admin (70 files)
- Week 5: Monitoring (48 files)

**Acceptance Criteria:**
- ✅ Zero inline styles in apps
- ✅ All styling via DS tokens
- ✅ Visual regression tests pass
- ✅ CI gate prevents inline styles

**Effort:** 4-6 weeks  
**Risk:** HIGH - Visual changes require extensive QA

---

**Phase 4 Total:** 4-6 weeks (can run in parallel with Phase 3)

---

## Phase 5: Contract Tests (1 week)

### Priority: **P2 - Medium Priority**

---

### Task 5.1: Add Contract Parity Tests

**Objective:** Prevent schema drift between layers

#### Step 5.1.1: Create Test Suite
**File:** `packages/contracts/tests/schema-parity.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { BookingSchema as ApiSchema } from '@api/schemas/booking.schema';
import { BookingSchema as ContractSchema } from '@xala/contracts';

describe('Schema Parity', () => {
  describe('Booking Schema', () => {
    it('API schema matches contracts schema', () => {
      const sample = { /* sample booking */ };
      const apiResult = ApiSchema.safeParse(sample);
      const contractResult = ContractSchema.safeParse(sample);
      
      expect(apiResult.success).toBe(true);
      expect(contractResult.success).toBe(true);
      expect(apiResult.data).toEqual(contractResult.data);
    });
    
    it('has same required fields', () => {
      const apiRequired = ApiSchema._def.shape().filter(f => !f.isOptional());
      const contractRequired = ContractSchema._def.shape().filter(f => !f.isOptional());
      expect(apiRequired).toEqual(contractRequired);
    });
  });
  
  // Repeat for all schemas
});
```

#### Step 5.1.2: Add to CI
```yaml
- name: Contract Parity Tests
  run: pnpm -F @xala/contracts test:parity
```

**Schemas to Test:**
- Booking
- RentalObject
- Calendar
- Organization
- User
- Notification
- Pricing
- GDPR
- Season
- Audit

**Acceptance Criteria:**
- ✅ Contract tests for 10 schemas
- ✅ CI fails on drift
- ✅ Tests run on every commit

**Effort:** 1 week (10 schemas × 0.5 day)  
**Risk:** LOW - Straightforward testing

---

**Phase 5 Total:** 1 week

---

## Timeline Overview

### Sequential (Worst Case)
```
Phase 0: CI Gates          [1 day]
Phase 1: Critical Gaps     [10-15 days]
Phase 2: SDK Coverage      [1 week]
Phase 3: DS Blocks         [3-4 weeks]
Phase 4: Style Cleanup     [4-6 weeks]
Phase 5: Contract Tests    [1 week]
-----------------------------------------
Total:                     13-20 weeks
```

### Parallel (Optimized)
```
Phase 0: CI Gates          [1 day]                          ████
Phase 1: Critical Gaps     [10-15 days]                     ████████████████
  ├─ RBAC (P0)            [1 day]                           ██
  ├─ AppLayout (P0)       [3 days]                          ██████
  ├─ CSS Modules (P0)     [2 weeks]       ██████████████████████████████
  ├─ Season Blocks (P0)   [1 week]                          ██████████████
  ├─ GDPR Blocks (P0)     [3 days]                          ██████
  └─ Settings Tabs (P0)   [4 days]                          ████████

Phase 2: SDK Coverage      [1 week]                                 ██████████████
  ├─ SDK Services         [4 days]                                  ████████
  └─ Offline Logic        [1 day]                                   ██

Phase 3: DS Blocks         [3-4 weeks]                                      ██████████████████████████████
  ├─ Create Blocks        [2 weeks]                                         ████████████████
  └─ Migrate Pages        [1-2 weeks]                                       ████████████████

Phase 4: Style Cleanup     [4-6 weeks]  (parallel with Phase 3)             ████████████████████████████████████████████
Phase 5: Contract Tests    [1 week]                                                                               ██████████████
-----------------------------------------
Total (parallel):          10-12 weeks
```

---

## Risk Mitigation

### High-Risk Tasks
| Task | Risk | Mitigation |
|------|------|------------|
| **CSS Cleanup** | Visual regressions | Extensive visual regression tests, QA review |
| **GDPR Migration** | Legal compliance | Legal review, audit trail, versioning |
| **AppLayout Migration** | UI drift | Visual regression tests, gradual rollout |

### Rollback Strategy
- Feature flags for new DS blocks
- Git branches per phase
- Database migrations reversible
- Keep old components temporarily

---

## Acceptance Criteria (Overall)

### DS-First
- [ ] Zero CSS files in apps
- [ ] Zero inline styles in apps
- [ ] Zero direct @digdir imports
- [ ] All reusable UI in `@xala/ds`
- [ ] CI gates enforce rules

### Thin Apps
- [ ] Zero business logic in apps
- [ ] Zero RBAC logic in apps
- [ ] All pages < 150 lines
- [ ] All wrappers only map data

### SDK Coverage
- [ ] SDK service for 66 of 72 controllers
- [ ] React Query hooks for all services
- [ ] Integration tests pass

### Contract Alignment
- [ ] Contract tests for 10 schemas
- [ ] Zero drift detected
- [ ] CI enforces parity

### Tests
- [ ] Unit tests: 80%+
- [ ] Integration tests: Key flows
- [ ] E2E tests: Critical journeys
- [ ] Visual regression: All pages

---

## Next Actions

1. **Review this plan** with team
2. **Get stakeholder approval** for timeline
3. **Kick off Phase 0** (CI gates) immediately
4. **Start Phase 1** (critical gaps) next sprint
5. **Track progress** weekly

---

*This remediation plan provides a phased, non-breaking path to 100% architectural compliance.*
