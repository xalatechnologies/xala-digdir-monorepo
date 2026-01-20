# Import Alias Migration Report

**Generated:** 2026-01-20
**Status:** Pre-Migration Audit

## Executive Summary

This report documents the migration from relative imports to TypeScript path aliases across the Xala/Digilist monorepo.

## Pre-Migration Import Pattern Analysis

### Import Pattern Distribution

| Pattern | Matches | Files | Priority |
|---------|---------|-------|----------|
| Deep relatives (`../../../+`) | 145 | 72 | **HIGH** - Migrate first |
| Medium relatives (`../../`) | 719 | 332 | **MEDIUM** |
| Single parent (`../`) | 1,417 | 703 | **MEDIUM** |
| Same-directory (`./`) | 1,806 | 532 | **LOW** - Keep as-is |
| `@xala/*` package aliases | 1,681 | 839 | Already correct |
| `@digilist/*` package aliases | 414 | 352 | Already correct |
| Local `@/` alias | 9 | 5 | Rarely used |

### Deep Relative Import Locations (Priority Fix)

#### 1. Cross-Package Imports (HIGHEST PRIORITY)

**`packages/testing/suites/contracts/schema-parity.test.ts`** - Imports from apps/api:
```typescript
import { BookingSchema as ApiBookingSchema } from '../../../../apps/api/src/schemas/booking.schema';
import { RentalObjectSchema as ApiRentalObjectSchema } from '../../../../apps/api/src/schemas/rental-object.schema';
import { UserSchema as ApiUserSchema } from '../../../../apps/api/src/schemas/user.schema';
import { OrganizationSchema as ApiOrganizationSchema } from '../../../../apps/api/src/schemas/organization.schema';
```

#### 2. Testing E2E Package (60+ files)

Files in `packages/testing-e2e/suites/backoffice/` importing from:
- `../../../mocks/api-server.mock`
- `../../../src/fixtures/index`
- `../../../../src/fixtures/index`

**Affected directories:**
- `blur-eye/` (16 files)
- `crud/` (7 files)
- `compliance/` (5 files)
- `workflows/` (6 files)
- `rbac/` (4 files)
- `sidebar-crawl/` (2 files)
- `smoke/` (1 file)

#### 3. Design System Package

Files in `packages/ds/src/blocks/booking-engine/`:
- `steps/BookingFormStep.tsx` - 4 deep imports
- `steps/BookingConfirmStep.tsx` - 5 deep imports
- `components/PriceSummary.tsx` - 3 deep imports
- `modes/DateRangeModeView.tsx` - 4 deep imports
- `modes/EventModeView.tsx` - 2 deep imports
- `modes/DailyModeView.tsx` - 3 deep imports
- `modes/RecurringModeView.tsx` - 3 deep imports
- `modes/InstantModeView.tsx` - 2 deep imports

#### 4. App-Internal Deep Imports

**`apps/backoffice/src/features/rental-objects/components/wizard/steps/`** (17 files):
All importing `UseRentalObjectWizardReturn` from `../../../hooks/useRentalObjectWizard`

**`apps/web/src/features/rental-object-details/components/Sidebar/components/`**:
- `BookingAvailabilityConflictDialog.tsx` - 2 imports from adapters

**`apps/minside/src/features/seasons/components/`**:
- `SeasonApplicationDrawer.tsx` - imports from providers

**`apps/monitoring/src/features/seasons/components/`**:
- `SeasonApplicationDrawer.tsx` - imports from providers

## Existing Alias Configuration

### Root tsconfig.json (11 aliases defined)

```json
{
  "paths": {
    "@digilist/auth/*": ["./packages/auth/*"],
    "@digilist/client-sdk/*": ["./packages/client-sdk/*"],
    "@digilist/contracts/*": ["./packages/contracts/*"],
    "@digilist/database-schema/*": ["./packages/database-schema/*"],
    "@digilist/docs-content/*": ["./packages/docs-content/*"],
    "@digilist/eslint-config/*": ["./packages/eslint-config/*"],
    "@digilist/observability/*": ["./packages/observability/*"],
    "@digilist/testing/*": ["./packages/testing/*"],
    "@xala/ds/*": ["./packages/ds/*"],
    "@xala/ds-registry/*": ["./packages/ds-registry/*"],
    "@xala/ds-themes/*": ["./packages/ds-themes/*"],
    "@xala/i18n/*": ["./packages/i18n/*"],
    "@xala/shared-types/*": ["./packages/shared-types/*"],
    "@xala/ui-components/*": ["./packages/ui-components/*"]
  }
}
```

### Missing Aliases (To Add)

- `@xala/runtime/*` → `./packages/runtime/src/*`
- `@xala/sdk-core/*` → `./packages/sdk-core/src/*`
- `@digilist/testing-e2e/*` → `./packages/testing-e2e/src/*`

### Vite Config Duplication

Each app manually defines aliases in vite.config.ts:

| App | Manual Aliases |
|-----|----------------|
| web | @xala/ds, @digilist/client-sdk (3 variants), @xala/ds-themes |
| backoffice | @, @xala/ds, @digilist/client-sdk (3 variants) |
| minside | @xala/ds, @digilist/client-sdk (4 variants) |
| monitoring | Same as minside |
| saas-admin | Same as backoffice |
| docs-learning | Minimal aliases |

## Migration Plan

### Phase 1: Configuration (Steps 1-5)
1. Add missing aliases to root tsconfig.json
2. Install vite-tsconfig-paths plugin
3. Standardize app tsconfigs with `@/*` alias
4. Update Storybook configuration
5. Update Vitest configuration

### Phase 2: Codemod (Step 6)
1. Convert 72 files with `../../../+` patterns
2. Convert cross-package relative imports
3. Convert app-internal deep relatives

### Phase 3: Prevention (Steps 7-9)
1. Add ESLint rule for no-deep-relatives
2. Run full verification suite
3. Document alias scheme

## Success Criteria

- [ ] Zero deep relative imports (`../../../+`)
- [ ] All builds pass (tsc, vite, storybook)
- [ ] All tests pass (unit, e2e)
- [ ] ESLint rule prevents new deep relatives
- [ ] Documentation complete

## Post-Migration Metrics (To Fill)

| Metric | Before | After |
|--------|--------|-------|
| Deep relatives (`../../../+`) | 145 | TBD |
| Medium relatives (`../../`) | 719 | TBD |
| Package aliases used | 2,095 | TBD |
| Vite config lines (aliases) | ~150 | TBD |
