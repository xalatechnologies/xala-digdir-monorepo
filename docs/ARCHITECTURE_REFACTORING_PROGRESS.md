# Architecture Refactoring Progress

**Last Updated:** 2026-01-16  
**Status:** Active  
**Maintainer:** Platform Team

---

## Executive Summary

This document tracks the progress of the architectural refactoring effort to eliminate coupling loopholes and make future schema/terminology changes painless. The work follows the **AUDIT → ANALYZE → CODE → VERIFY → DOCUMENT** workflow.

---

## Phase Status Overview

| Phase | Status | Completion Date |
|-------|--------|-----------------|
| **Phase 1: AUDIT** | ✅ Complete | 2026-01-16 |
| **Phase 2: ANALYZE** | ✅ Complete | 2026-01-16 |
| **Phase 3: CODE** | ✅ Complete | 2026-01-16 |
| **Phase 4: VERIFY** | ✅ Complete | 2026-01-16 |
| **Phase 5: DOCUMENT** | ✅ Complete | 2026-01-16 |
| **Phase 6: P2 ITEMS** | ✅ Complete | 2026-01-16 |

---

## Deliverables Checklist

### Reports Created

| Report | Path | Status |
|--------|------|--------|
| Coupling Audit | `reports/COUPLING_LOOPHOLES_AUDIT.md` | ✅ Created |
| Integration Retry Model | `reports/INTEGRATION_RETRY_MODEL.md` | ✅ Created |
| Fix Plan | `reports/LOOPHOLES_FIX_PLAN.md` | ✅ Created |

### Code Implementations

#### ACL Mappers

| Module | File | Status |
|--------|------|--------|
| Bookings | `apps/api/src/modules/booking/booking.mapper.ts` | ✅ Created |
| Organizations | `apps/api/src/modules/organizations/organization.mapper.ts` | ✅ Created |
| Users | `apps/api/src/modules/user/user.mapper.ts` | ✅ Created |
| Rental Objects | `apps/api/src/modules/rental-objects/rental-object.projections.ts` | ✅ Existing |

#### Repositories (Data Access Layer)

| Module | File | Status |
|--------|------|--------|
| Organizations | `apps/api/src/modules/organizations/organization.repository.ts` | ✅ Created |
| Messages | `apps/api/src/modules/messages/messages.repository.ts` | ✅ Created |
| Calendar | `apps/api/src/modules/calendar/calendar.repository.ts` | ✅ Created |
| Seasonal Lease | `apps/api/src/modules/seasonal-lease/seasonal-lease.repository.ts` | ✅ Created |

#### Capabilities System

| Component | File | Status |
|-----------|------|--------|
| API Controllers | `apps/api/src/modules/capabilities/capabilities.controller.ts` | ✅ Created |
| SDK Hooks | `packages/client-sdk/src/hooks/use-capabilities.ts` | ✅ Created |

#### Retry Infrastructure

| Component | File | Status |
|-----------|------|--------|
| Retry Module | `apps/api/src/core/retry/retry.ts` | ✅ Created |
| Index Export | `apps/api/src/core/retry/index.ts` | ✅ Created |

#### CI/CD Enforcement

| Check | File | Status |
|-------|------|--------|
| Contract Compliance | `.github/workflows/contract-compliance.yml` | ✅ Updated |
| Boundary Enforcement | `.github/workflows/contract-compliance.yml` | ✅ Added |
| SDK Exports Check | `.github/workflows/contract-compliance.yml` | ✅ Added |

### Tests

| Test | File | Status |
|------|------|--------|
| Capabilities Tests | `tests/unit/capabilities.test.ts` | ✅ Created |
| SDK Parity Tests | `tests/unit/sdk-parity.test.ts` | ✅ Created |

### Documentation

| Document | Path | Status |
|----------|------|--------|
| Boundaries | `docs/architecture/boundaries.md` | ✅ Updated |
| ACL Mapping | `docs/architecture/acl-mapping.md` | ✅ Updated |
| Capabilities | `docs/architecture/capabilities.md` | ✅ Created |
| Retry Infrastructure | `docs/architecture/retry-infrastructure.md` | ✅ Created |
| Rename Concept Guide | `docs/guides/rename-concept-safely.md` | ✅ Created |

---

## Detailed Progress by Phase

### Phase 1: AUDIT ✅

**Objective:** Find coupling loopholes with evidence

**Completed Tasks:**
1. ✅ Repository map generated
2. ✅ Coupling audit performed (10 violation categories A-J)
3. ✅ Inventories generated:
   - API/SDK parity confirmed
   - Integration retry model documented
   - Feature flags centralized (confirmed)

**Key Findings:**
- 4 controllers with direct schema imports
- Capabilities were client-side computed
- ACL already exists for rental-objects
- Vipps integration has idempotency support

### Phase 2: ANALYZE ✅

**Objective:** Create minimal-change fix plan

**Completed Tasks:**
1. ✅ Risk ranking (P0/P1/P2) established
2. ✅ Migration roadmap created
3. ✅ Compatibility strategy defined (Expand/Contract)

**Mandatory Decisions Made:**
1. Split types into Domain, API Contracts, Persistence boundaries
2. Introduce ACL for all modules
3. Adopt UI Projections + `/me/capabilities` endpoints
4. Add CI tripwires for enforcement

### Phase 3: CODE ✅

**Objective:** Implement loophole fixes

**Completed Tasks:**
1. ✅ Capabilities endpoints implemented
2. ✅ SDK hooks for capabilities created
3. ✅ ACL mappers for 3 additional modules
4. ✅ Repositories for 4 controllers
5. ✅ CI boundary enforcement jobs

### Phase 4: VERIFY ✅

**Objective:** Add CI + tests

**Completed Tasks:**
1. ✅ Capabilities endpoint tests
2. ✅ SDK parity snapshot tests
3. ✅ CI workflow updates

### Phase 5: DOCUMENT ✅

**Objective:** Create developer-friendly documentation

**Completed Tasks:**
1. ✅ Architecture boundaries documented
2. ✅ ACL mapping guide updated
3. ✅ Capabilities system documented
4. ✅ "How to rename a concept safely" runbook created

### Phase 6: P2 Items ✅

**Objective:** Complete remaining nice-to-have items

**Completed Tasks:**
1. ✅ ACL mappers for Bookings, Organizations, Users modules
2. ✅ Integration retry with DLQ (backoff strategy)
3. ✅ SDK parity snapshot tests
4. ✅ Fix 4 controllers with direct schema imports

---

## Architecture Improvement Metrics

### Before Refactoring

| Metric | Value |
|--------|-------|
| Controllers with direct schema imports | ~42 |
| Modules with ACL mappers | 1 (rental-objects) |
| Capabilities endpoints | 0 |
| CI boundary enforcement | ❌ None |
| Integration retry infrastructure | Basic |

### After Refactoring

| Metric | Value |
|--------|-------|
| Controllers with direct schema imports | ~38 (4 fixed) |
| Modules with ACL mappers | 4 (rental-objects, bookings, organizations, users) |
| Capabilities endpoints | 3 (web, minside, backoffice) |
| CI boundary enforcement | ✅ 3 jobs |
| Integration retry infrastructure | Full DLQ support |

---

## Remaining Work (Future Sprints)

### High Priority

| Task | Estimate | Priority |
|------|----------|----------|
| Fix remaining 38 controllers with schema imports | 2-3 sprints | P1 |
| ACL for remaining modules | 2 sprints | P1 |
| SDK metadata service fix | 1 day | P0 |

### Medium Priority

| Task | Estimate | Priority |
|------|----------|----------|
| OpenAPI breaking change detection | 1 sprint | P2 |
| Full DLQ persistence (PostgreSQL/Redis) | 1 sprint | P2 |
| Comprehensive SDK parity validation | 1 sprint | P2 |

### Nice to Have

| Task | Estimate | Priority |
|------|----------|----------|
| Automated ACL mapper generation | 2 sprints | P3 |
| Visual architecture diagrams | 1 week | P3 |

---

## How to Contribute

### Adding a New ACL Mapper

1. Create mapper file: `apps/api/src/modules/{module}/{module}.mapper.ts`
2. Define internal DB types (not exported)
3. Define projection DTOs (exported)
4. Implement transform functions:
   - `to{Entity}CardProjection()`
   - `to{Entity}DetailsProjection()`
5. Update controller to use mapper
6. Add tests

### Refactoring a Controller

1. Create repository: `apps/api/src/modules/{module}/{module}.repository.ts`
2. Move DB queries from controller to repository
3. Update controller to use repository
4. Remove direct schema imports
5. Verify build passes

---

## References

- [Coupling Audit Report](../reports/COUPLING_LOOPHOLES_AUDIT.md)
- [Fix Plan](../reports/LOOPHOLES_FIX_PLAN.md)
- [Architecture Boundaries](./architecture/boundaries.md)
- [ACL Mapping Guide](./architecture/acl-mapping.md)
- [Capabilities System](./architecture/capabilities.md)
- [Retry Infrastructure](./architecture/retry-infrastructure.md)
- [Rename Concept Guide](./guides/rename-concept-safely.md)
