# Architectural Transformation Status

**Started:** 2026-01-21
**Status:** IN PROGRESS
**Branch:** demo-v5

## Executive Summary

This document tracks the progress of the Master Architectural Transformation to create:
- Two-tier Monitoring (Global Control Plane + Per-SaaS Domain Apps)
- Two-tier Learning (Global Control Plane + Per-SaaS Domain Apps)
- API Split (Platform API vs Domain API)
- UI Platform-only Architecture
- Package Consolidation and Platform Monorepo Extraction

---

## Phase A: API Module Organization

### PR A.1: Module Registry and Classification ✅ COMPLETED

**Created:**
- `apps/api/src/module-registry.ts` - Centralized module categorization
- `apps/api/src/modules/README.md` - Module documentation
- `scripts/verify-modules.mjs` - Module verification script

**Statistics:**
- 67 modules classified
- Platform ownership: ~35 modules
- Domain ownership: ~25 modules
- Shared: ~7 modules

### PR A.2: Route Prefixes ✅ COMPLETED

**Created:**
- `apps/api/src/routes/route-prefixes.ts` - New route structure
- `apps/api/src/routes/legacy-redirects.ts` - Backward compatibility
- `apps/api/src/routes/index.ts` - Central exports

**New Route Structure:**
```
/api/platform/* - Platform modules
/api/domain/*   - Domain modules
/api/shared/*   - Shared modules
```

### PR A.3: SDK Service Layer Split ✅ COMPLETED

**Created:**
- `packages/client-sdk/src/platform-services/index.ts` (7.3KB)
- `packages/client-sdk/src/domain-services/index.ts` (5.9KB)

**Service Classification:**
- Platform services: ~30 services (auth, tenant, user, audit, etc.)
- Domain services: ~35 services (booking, rental-object, season, etc.)

---

## Phase B: Two-Tier Monitoring

### PR B.1: Global Monitoring App ✅ COMPLETED

**Created:**
- `apps/monitoring-global/` - Platform-only monitoring app
- Port: 5178
- Routes created:
  - `/` - index.tsx (9.8KB)
  - `/infrastructure` - infrastructure.tsx (15KB)
  - `/tenants` - tenants.tsx (13KB)

**Constraint:** NO @digilist/* imports

### PR B.2: Tenant Monitoring in Backoffice ✅ COMPLETED

**Created:**
- `apps/backoffice/src/routes/monitoring/index.tsx` (8.4KB)
- `apps/backoffice/src/routes/monitoring/tenant-health.tsx` (15KB)
- `apps/backoffice/src/routes/monitoring/booking-metrics.tsx` (17KB)
- `apps/backoffice/src/routes/monitoring/alerts.tsx` (21KB)

### PR B.3: Archive Original Monitoring ✅ COMPLETED

**Created:**
- `apps/_archive/README.md`
- `apps/_archive/monitoring-v1-placeholder.md`

**Note:** Original `apps/monitoring` is a misnamed Minside portal, will be kept as-is

---

## Phase C: Two-Tier Learning

### PR C.1: Global Docs App ✅ COMPLETED

**Created:**
- `apps/docs-global/` - Platform-only docs app
- Port: 5179
- Routes created:
  - `/` - index.tsx (5.5KB)
  - `/api-reference` - api-reference.tsx (6.6KB)
  - `/sdk-guide` - sdk-guide.tsx (8.3KB)
  - `/architecture` - architecture.tsx (10KB)
  - `/components` - components.tsx (9.7KB)

**Constraint:** NO @digilist/* imports

### PR C.2: Tenant Training Modules 🔄 IN PROGRESS

**Created (Backoffice):**
- `apps/backoffice/src/routes/training/index.tsx` (15.5KB)

**Pending (Minside):**
- `apps/minside/src/routes/help/` directory created, files pending

### PR C.3: Archive Original Docs-Learning ✅ COMPLETED

**Created:**
- `apps/_archive/docs-learning-v1-placeholder.md`

---

## Phase D: UI Platform-Only

### PR D.1: Remove Domain Components from @xala/ds 🔄 IN PROGRESS

**Analysis In Progress:**
- Identifying domain-specific components in packages/platform/src/ui/blocks/
- Creating migration plan: DS_DOMAIN_COMPONENT_MIGRATION.md
- Creating re-export stubs in @digilist/ui

**Domain Components Identified:**
- booking-engine/, BookingConfirmation.tsx, BookingFormModal.tsx, BookingSection.tsx, BookingSuccess.tsx
- RentalObject*.tsx (9 components)
- seasons/
- FacilityChips.tsx (also uses banned term "Facility")

### PR D.2: Convert saas-admin to Platform-Only 🔄 IN PROGRESS

**Audit In Progress:**
- Searching for @digilist/* imports in apps/saas-admin
- Creating audit report: SAAS_ADMIN_PLATFORM_AUDIT.md

### PR D.3: Verify All Platform Apps 🔄 IN PROGRESS

**Verification In Progress:**
- Running verify-boundaries.sh
- Running verify-terms.sh
- Running verify-platform-only-apps.sh
- Running verify-modules.mjs
- Creating report: VERIFICATION_REPORT.md

---

## Phase E: Package Consolidation

### PR E.1: Consolidate @xala/* → @xalatechnologies/platform 🔄 IN PROGRESS

**Documentation In Progress:**
- Creating PACKAGE_CONSOLIDATION_PLAN.md
- Verifying exports in packages/platform/package.json

**Target Mapping:**
- @xala/ds → @xalatechnologies/platform/ui
- @xala/auth → @xalatechnologies/platform/auth
- @xala/config → @xalatechnologies/platform/config
- @xala/runtime → @xalatechnologies/platform/runtime
- @xala/contracts → @xalatechnologies/platform/contracts
- @xala/sdk-core → @xalatechnologies/platform/sdk
- @xala/i18n → @xalatechnologies/platform/i18n
- @xala/observability → @xalatechnologies/platform/observability

### PR E.2: Consolidate @digilist/* Packages ⏳ PENDING

**Target Structure:**
- @digilist/domain - Types, schemas, validators
- @digilist/sdk - Services, hooks, realtime
- @digilist/ui - Feature kits
- @digilist/runtime - App providers

### PR E.3: Remove Compat Packages ⏳ PENDING

**To Delete (after migration):**
- packages/xala-compat-*

---

## Phase F: Platform Extraction

### PR F.1: Platform Extraction Config ✅ COMPLETED

**Created:**
- `packages/platform/package.json` (4.7KB)
- `packages/platform/tsconfig.json` (1.6KB)
- `packages/platform/tsup.config.ts` (1.2KB)
- `packages/platform/src/` with all subpackages:
  - `auth/`, `config/`, `contracts/`, `i18n/`
  - `observability/`, `runtime/`, `sdk/`, `ui/`
- Built and ready: `packages/platform/dist/`

### PR F.2: Verify Extraction Independence ⏳ PENDING

**To Do:**
- Build platform package independently (without workspace)
- Verify no workspace:* dependencies in published package
- Verify no @digilist/* imports

### PR F.3: Domain Template Repository ✅ COMPLETED

**Created:**
- `docs/architecture/DOMAIN_TEMPLATE.md`

---

## Verification Scripts ✅ COMPLETED

**Created:**
- `scripts/verify-modules.mjs` - Module classification
- `scripts/verify-boundaries.sh` (3.5KB) - Import boundaries
- `scripts/verify-terms.sh` (4.6KB) - Banned terms in platform
- `scripts/verify-platform-only-apps.sh` (4.7KB) - Platform app verification
- `scripts/verify-packages.sh` (3.2KB) - Package structure

**Package.json Scripts:**
- `pnpm verify:modules` - Verify all API modules are classified
- `pnpm verify:boundaries` - Verify platform ↛ domain imports
- `pnpm verify:terms` - Verify no banned terms in platform
- `pnpm verify:platform-only-apps` - Verify platform apps are clean
- `pnpm verify:all` - Run all verification scripts

---

## Files Created/Modified

### New Files

| File | Purpose | Status |
|------|---------|--------|
| `apps/api/src/module-registry.ts` | Module classification | ✅ |
| `apps/api/src/modules/README.md` | Module documentation | ✅ |
| `apps/api/src/routes/route-prefixes.ts` | Route structure | ✅ |
| `apps/api/src/routes/legacy-redirects.ts` | Backward compat | ✅ |
| `apps/api/src/routes/index.ts` | Route exports | ✅ |
| `scripts/verify-modules.mjs` | Module verification | ✅ |
| `docs/architecture/DOMAIN_TEMPLATE.md` | Domain template guide | ✅ |
| `docs/architecture/ARCHITECTURAL_TRANSFORMATION_STATUS.md` | This file | ✅ |
| `apps/monitoring-global/*` | Global monitoring app | 🔄 |
| `apps/docs-global/*` | Global docs app | 🔄 |
| `apps/backoffice/src/routes/monitoring/*` | Tenant monitoring | 🔄 |
| `apps/backoffice/src/routes/training/*` | Tenant training | 🔄 |
| `apps/minside/src/routes/help/*` | User help | 🔄 |
| `packages/client-sdk/src/platform-services/*` | Platform SDK | 🔄 |
| `packages/client-sdk/src/domain-services/*` | Domain SDK | 🔄 |
| `packages/platform/*` | Platform extraction | 🔄 |
| `apps/_archive/*` | Archived apps | 🔄 |

### Modified Files

| File | Change | Status |
|------|--------|--------|
| `package.json` | Added verify:modules script | ✅ |

---

## Success Criteria

- [ ] All platform apps have ZERO @digilist/* imports
- [ ] All domain apps use @digilist/sdk exclusively
- [ ] Global monitoring shows cross-tenant metrics
- [ ] Tenant monitoring shows tenant-scoped metrics
- [ ] Global docs serves platform documentation
- [ ] Tenant training serves domain guides
- [ ] Package count reduced from 28+ to 15
- [ ] Platform package builds independently
- [ ] All tests pass
- [ ] All apps deploy successfully

---

## Risk Mitigation

| Phase | Risk | Mitigation | Status |
|-------|------|------------|--------|
| A | API route changes break clients | Legacy redirects | ✅ Implemented |
| B | Monitoring gaps during transition | Run both apps in parallel | 🔄 |
| C | Docs content lost | Archive original, migrate | 🔄 |
| D | UI regressions | Visual tests | ⏳ |
| E | Import errors | Compat re-exports | ⏳ |
| F | Extraction breaks builds | Independent verification | ⏳ |

---

**Last Updated:** 2026-01-21
