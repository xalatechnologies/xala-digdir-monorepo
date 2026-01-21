# Decoupling Audit + Split Readiness Report

**Generated:** 2026-01-21
**Auditor:** Claude Code
**Scope:** Full monorepo architectural assessment for platform extraction

---

## 1. Executive Summary

1. **Zero Runtime Boundary Violations** - All platform packages have no actual @digilist/* imports at runtime; 34 violations are JSDoc examples only
2. **Terminology Compliance Critical** - 191 occurrences of banned terms ("listing", "facility") in platform packages require refactoring
3. **API Separation Achieved** - Platform API (port 4001) and Domain API (port 4000) properly separated with distinct entrypoints
4. **SaaS Admin Has 3 Domain Imports** - `authService`, `idportenService`, `useUsers` need migration to platform SDK
5. **Package Consolidation Planned** - 8 @xala/* packages → @xalatechnologies/platform with 736-line migration plan created
6. **@digilist/ui Structure Correct** - Feature kits pattern implemented; TypeScript errors due to missing contract exports
7. **Module Registry Needs Cleanup** - 1 unclassified module (`capabilities`), 4 orphaned registrations
8. **Documentation Apps Have False Positives** - monitoring-global and docs-global violations are compliance comments and code examples
9. **E2E Test Infrastructure Solid** - Proper separation of platform tests and domain tests in packages/platform/testing
10. **Split Readiness Score: 45/100** - Significant work remains on terminology, contract exports, and package consolidation

---

## 2. Current Status Report

| Area | Status | Evidence |
|------|--------|----------|
| **Platform/Domain Package Boundaries** | ⚠️ PARTIAL | 0 runtime violations, 34 JSDoc violations |
| **Banned Terms Compliance** | ❌ FAIL | 191 "listing"/"facility" occurrences in platform |
| **API Module Separation** | ✅ PASS | Separate entrypoints, 38 domain + 32 platform modules |
| **SDK Service Layer Split** | ✅ PASS | platform-services + domain-services directories exist |
| **Database Schema Organization** | ✅ PASS | 5 schemas: platform, domain, saas, compliance, monitoring |
| **Platform-Only Apps (saas-admin)** | ⚠️ PARTIAL | 3 @digilist/* imports, all remediable |
| **Platform-Only Apps (monitoring-global)** | ✅ PASS | 9 violations are compliance comments only |
| **Platform-Only Apps (docs-global)** | ⚠️ PARTIAL | 18 violations include documentation examples |
| **@digilist/ui Feature Kits** | ⚠️ PARTIAL | Structure correct, 70+ TypeScript errors |
| **@digilist/contracts Exports** | ❌ FAIL | Missing BookingConfig, BookingSelection, etc. |
| **Module Registry** | ⚠️ PARTIAL | 68 folders, 71 registered, 1 unclassified, 4 orphaned |
| **CI/CD Pipeline** | ✅ PASS | 15 GitHub workflows, changesets configured |
| **Testing Infrastructure** | ✅ PASS | Platform tests separated in packages/platform/testing |

---

## 3. Boundary Violations

### P0 - Critical (Blocking)

| File | Violation | Severity |
|------|-----------|----------|
| `packages/digilist-ui/src/booking-engine/*.tsx` | Missing `@digilist/contracts` exports | P0 |
| `packages/platform/src/ui/types/listing-detail.ts` | Filename contains banned term "listing" | P0 |
| `apps/saas-admin/src/routes/users/index.tsx:18` | `import { useUsers } from '@digilist/client-sdk/hooks'` | P0 |

### P1 - High (Address in Next Sprint)

| File | Violation | Severity |
|------|-----------|----------|
| `apps/saas-admin/src/hooks/useDemoLogin.tsx:9` | `import { authService } from '@digilist/client-sdk'` | P1 |
| `apps/saas-admin/src/routes/login.tsx:16` | `import { idportenService } from '@digilist/client-sdk'` | P1 |
| `packages/platform/src/ui/blocks/RentalObjectAvailabilityCalendar.tsx` | 15+ "listing" CSS classes | P1 |
| `packages/platform/src/ui/blocks/RentalObjectListItem.tsx` | 10+ "listing" in comments/code | P1 |
| `packages/platform/src/ui/blocks/FacilityChips.tsx` | 3 "facility" occurrences | P1 |
| `apps/docs-global/src/routes/sdk-guide.tsx` | Domain SDK examples in platform app | P1 |

### P2 - Medium (Technical Debt)

| File | Violation | Severity |
|------|-----------|----------|
| 28+ files in `packages/platform/` | JSDoc examples referencing `@digilist/*` | P2 |
| `packages/governance/src/verification/boundary-check.ts:61` | Pattern matching string (intentional) | P2 |
| `packages/contracts/src/types/index.ts:7` | Migration note mentioning @digilist | P2 |
| `apps/api/src/module-registry.ts` | `capabilities` module unclassified | P2 |
| `apps/api/src/module-registry.ts` | 4 orphaned entries (capability, byOwnership, byTier, byRegistrationType) | P2 |

---

## 4. Readiness Score

### Overall Score: 45/100

| Category | Score | Max | Notes |
|----------|-------|-----|-------|
| Runtime Boundary Integrity | 20 | 20 | No actual import violations |
| Documentation Compliance | 5 | 15 | JSDoc examples need updating |
| Terminology Compliance | 0 | 15 | 191 banned terms must be refactored |
| Platform-Only Apps | 8 | 10 | 3 saas-admin imports to fix |
| Contract Exports | 2 | 10 | Missing 15+ booking-related exports |
| Package Consolidation | 5 | 15 | Plan created, not executed |
| Module Registry | 5 | 5 | Minor cleanup needed |
| CI/CD Split-Ready | 0 | 10 | No independent build orchestration |

### Blocking Issues (Must Fix Before Split)

1. **Missing @digilist/contracts exports** - Causes 70+ TypeScript errors in @digilist/ui
2. **191 banned terms in platform** - Violates domain-agnostic principle
3. **saas-admin domain imports** - Platform app must not depend on domain packages
4. **No independent platform build** - Platform package must build without workspace

---

## 5. P0/P1/P2 Action Plan

### P0 Actions (Immediate - This Week)

| Action | Files | Acceptance Criteria |
|--------|-------|---------------------|
| Export missing booking contracts | `packages/digilist-contracts/src/booking.ts` | `pnpm -F @digilist/ui typecheck` passes |
| Rename `listing-detail.ts` | `packages/platform/src/ui/types/listing-detail.ts` → `resource-detail.ts` | `pnpm verify:terms` shows 0 for this file |
| Migrate saas-admin useUsers | `apps/saas-admin/src/routes/users/index.tsx` | Import from `@xalatechnologies/platform/hooks` |

### P1 Actions (Next Sprint - 1-2 Weeks)

| Action | Files | Acceptance Criteria |
|--------|-------|---------------------|
| Migrate saas-admin auth imports | `useDemoLogin.tsx`, `login.tsx` | Import from `@xalatechnologies/platform/sdk` |
| Refactor "listing" CSS classes | 5 files in `platform/src/ui/blocks/` | All CSS classes use "resource" instead |
| Rename FacilityChips | `FacilityChips.tsx` → `AmenityChips.tsx` | No "facility" exports remain |
| Move SDK docs to domain app | `apps/docs-global/src/routes/sdk-guide.tsx` | Or mark as `// platform-exempt` |
| Add platform SDK exports | `packages/platform/src/sdk/services/` | `authService`, `idportenService`, `useUsers` available |

### P2 Actions (Tech Debt - 1 Month)

| Action | Files | Acceptance Criteria |
|--------|-------|---------------------|
| Update JSDoc examples | 28+ files with `@digilist/*` in comments | Use `@your-domain/client-sdk` placeholder |
| Add `// boundary-ok` comments | `packages/governance/boundary-check.ts` | Verification script ignores intentional references |
| Fix module registry | `apps/api/src/module-registry.ts` | Add capabilities, remove 4 orphaned |
| Improve verification scripts | `scripts/verify-*.sh` | Ignore comments and code blocks |

---

## 6. Proposed Repo Layouts

### Platform Core Repository (`platform-core`)

```
platform-core/
├── packages/
│   └── platform/                    # @xalatechnologies/platform
│       ├── src/
│       │   ├── ui/                 # Design system (domain-agnostic)
│       │   │   ├── primitives/
│       │   │   ├── composed/
│       │   │   ├── shells/
│       │   │   ├── blocks/
│       │   │   ├── patterns/
│       │   │   └── themes/
│       │   ├── auth/               # Authentication (domain-agnostic)
│       │   ├── config/             # Configuration
│       │   ├── contracts/          # Platform contracts (Zod)
│       │   ├── sdk/                # SDK core (HTTP, errors, retry)
│       │   │   ├── http/
│       │   │   ├── errors/
│       │   │   ├── query/
│       │   │   └── saas/
│       │   ├── runtime/            # Runtime providers
│       │   ├── i18n/               # Internationalization
│       │   └── observability/      # Metrics, logging
│       ├── package.json
│       └── tsup.config.ts
│
├── apps/
│   ├── monitoring-global/          # System monitoring (platform-only)
│   ├── docs-global/                # Platform documentation (platform-only)
│   └── saas-admin/                 # SaaS administration (platform-only)
│
├── packages/
│   ├── enterprise/                 # @xalatechnologies/enterprise
│   └── governance/                 # @xalatechnologies/governance
│       ├── verification/
│       ├── testing/
│       └── eslint-config/
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── release.yml
│       └── version.yml
│
├── pnpm-workspace.yaml
├── package.json
└── README.md
```

### Digilist Domain Repository (`digilist-domain`)

```
digilist-domain/
├── packages/
│   ├── contracts/                  # @digilist/contracts
│   │   └── src/
│   │       ├── booking.ts
│   │       ├── rental-objects.ts
│   │       ├── seasons.ts
│   │       └── index.ts
│   │
│   ├── domain/                     # @digilist/domain
│   │   └── src/
│   │       ├── types/
│   │       └── validators/
│   │
│   ├── sdk/                        # @digilist/client-sdk
│   │   └── src/
│   │       ├── services/
│   │       │   ├── platform-services/  # Re-exports from @xalatechnologies
│   │       │   └── domain-services/    # Digilist-specific
│   │       ├── hooks/
│   │       └── realtime/
│   │
│   ├── ui/                         # @digilist/ui
│   │   └── src/
│   │       ├── features/
│   │       │   ├── rental-objects/
│   │       │   ├── booking/
│   │       │   └── seasons/
│   │       ├── blocks/
│   │       └── booking-engine/
│   │
│   ├── runtime/                    # @digilist/runtime
│   │   └── src/
│   │       └── providers/
│   │
│   └── schema/                     # @digilist/database-schema
│       └── src/
│           ├── core/
│           ├── domain/
│           ├── platform/
│           ├── saas/
│           └── compliance/
│
├── apps/
│   ├── web/                        # Public booking (port 5173)
│   ├── minside/                    # User portal (port 5174)
│   ├── backoffice/                 # Admin portal (port 5175)
│   ├── api/                        # Fastify API (port 4000)
│   ├── monitoring/                 # Tenant monitoring (embedded in backoffice)
│   └── docs-learning/              # Domain documentation (port 5179)
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── release.yml
│       └── version.yml
│
├── pnpm-workspace.yaml
├── package.json
└── README.md
```

---

## 7. Connection Contract

### Published Packages

| Package | Registry | Version Policy |
|---------|----------|----------------|
| `@xalatechnologies/platform` | npm public | Semver, fixed group |
| `@xalatechnologies/enterprise` | npm public | Semver, fixed group |
| `@xalatechnologies/governance` | npm public | Semver, fixed group |
| `@digilist/contracts` | npm private | Semver, fixed group |
| `@digilist/sdk` | npm private | Semver, fixed group |
| `@digilist/ui` | npm private | Semver, fixed group |

### OpenAPI Artifacts

| API | Specification Location | Version |
|-----|----------------------|---------|
| Platform API | `platform-core/apps/api-platform/openapi.yaml` | 1.0.0 |
| Domain API | `digilist-domain/apps/api/openapi.yaml` | 1.0.0 |

### Semver Policy

```json
{
  "fixed": [
    ["@xalatechnologies/platform", "@xalatechnologies/enterprise", "@xalatechnologies/governance"],
    ["@digilist/contracts", "@digilist/sdk", "@digilist/ui", "@digilist/runtime", "@digilist/database-schema"]
  ],
  "updateInternalDependencies": "patch",
  "baseBranch": "main"
}
```

### Integration Points

| Consumer → Provider | Method | Contract |
|---------------------|--------|----------|
| @digilist/sdk → Platform API | REST/HTTP | OpenAPI 3.0 |
| @digilist/ui → @xalatechnologies/platform/ui | npm import | TypeScript types |
| Domain Apps → Platform Packages | npm import | package.json exports |
| Platform Apps → Platform Packages | npm import | package.json exports |

### Breaking Change Policy

1. **Platform packages** - 2 week deprecation notice, major version bump
2. **Domain packages** - 1 week deprecation notice, major version bump
3. **OpenAPI changes** - Additive changes in minor, breaking in major
4. **Database schema** - Migration scripts required, no breaking column removal

---

## Appendix: Files Modified During Audit

### Created
- `docs/architecture/DS_DOMAIN_COMPONENT_MIGRATION.md` - UI component migration plan
- `docs/architecture/SAAS_ADMIN_PLATFORM_AUDIT.md` - SaaS admin compliance report
- `docs/architecture/VERIFICATION_REPORT.md` - Script verification results
- `docs/architecture/PACKAGE_CONSOLIDATION_PLAN.md` - Package migration plan
- `packages/digilist-ui/src/blocks/detail/*` - Backward compatibility stubs
- `packages/digilist-ui/src/blocks/booking/{BookingSection,AdditionalServicesList}.tsx` - Stubs

### Modified
- `packages/digilist-ui/src/blocks/booking/index.ts` - Added new exports
- `packages/digilist-ui/src/blocks/index.ts` - Added detail exports
- `packages/digilist-ui/CLAUDE.md` - Complete documentation rewrite
- `packages/platform/package.json` - Added 12 new subpath exports
- `packages/platform/tsup.config.ts` - Added new entry points

---

**Report Status:** Complete
**Next Review:** After P0 actions completed
