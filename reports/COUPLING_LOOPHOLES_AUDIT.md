# Coupling Loopholes Audit Report

**Date:** 2026-01-16
**Project:** Xala/Digilist Platform - Architecture Loophole Analysis
**Methodology:** AUDIT → ANALYZE → CODE → VERIFY → DOCUMENT

---

## Executive Summary

Comprehensive audit of architectural loopholes that make schema/terminology changes painful. Analysis follows the Master Prompt framework to identify coupling violations, missing CI gates, and architectural gaps.

**Overall Status:** ⚠️ PARTIAL COVERAGE - Significant work completed, key gaps remain

### What's Been Implemented ✅
- ACL layer for rental-objects with full mapper pipeline
- Domain model with validation rules
- Projection DTOs in SDK
- Expand/Contract playbook documented
- ESLint rules for design tokens, no-raw-fetch, no-direct-schema-import
- Contract compliance CI workflow
- Capabilities system in backoffice (client-side)
- Feature flags centralized system
- Vipps integration with idempotency keys

### Critical Gaps ❌
- No server-side `/me/capabilities` endpoints per app
- OpenAPI breaking change detection not in CI
- Persistence imports not fully blocked
- Integration retry lacks DLQ/backoff strategy
- Secrets exposure not systematically tested

---

## 1. AUDIT FINDINGS - Violation Details

### A) DTOs Mirror DB Rows / SELECT * Shapes

**Status:** ⚠️ PARTIALLY FIXED

**Fixed (ACL in place):**
- `apps/api/src/acl/rental-objects/rental-object.mapper.ts` - 773 lines of proper mapping
- `apps/api/src/domain/rental-objects/rental-object.ts` - Clean domain model

**Still Violating:**

| Controller | File | Issue |
|------------|------|-------|
| OrganizationsController | `apps/api/src/modules/organizations/organizations.controller.ts:9` | Direct schema import |
| MessagesController | `apps/api/src/modules/messages/messages.controller.ts:9` | Direct schema import |
| CalendarController | `apps/api/src/modules/calendar/calendar.controller.ts:15` | Direct schema import |
| SeasonalLeaseController | `apps/api/src/modules/seasonal-lease/seasonal-lease.controller.ts:9` | Direct schema import |

**Evidence:**
```typescript
// apps/api/src/modules/organizations/organizations.controller.ts:9
import { organizations, users } from '../../database/schema/index';
```

---

### B) @types Shared Package Contains ORM/Persistence Models

**Status:** ✅ CLEAN

The SDK types (`packages/client-sdk/src/types/`) do not import ORM/persistence types.
Types are properly structured:
- `projection-dtos.ts` - Display-ready projections
- `rental-object.ts` - SDK entity types (not ORM entities)
- `auth.ts`, `booking.ts`, etc. - Domain-specific types

---

### C) UI Computes "Small Logic" (Eligibility/Pricing/Payment Decisions)

**Status:** ⚠️ PARTIAL VIOLATION

**Violations Found:**

| App | File | Lines | Logic Type |
|-----|------|-------|------------|
| web | `apps/web/src/features/rental-object-details/presenters/rentalObjectTypePresenter.ts` | 200+ | KeyFacts computation |
| web | `apps/web/src/pages/RentalObjectsPage.tsx` | 161-185 | Client-side filtering |
| backoffice | `apps/backoffice/src/lib/capabilities.ts` | 46-91 | Role-to-capability mapping |

**Critical Issue:** Capabilities mapping is CLIENT-SIDE, not from API.

```typescript
// apps/backoffice/src/lib/capabilities.ts:46
export const ROLE_CAPABILITIES: Record<EffectiveBackofficeRole, Capability[]> = {
  super_admin: ['CAP_BOOKING_READ', 'CAP_BOOKING_APPROVE', ...],
  admin: [...],
  case_handler: [...],
};
```

This should come from `/api/backoffice/me/capabilities` endpoint.

---

### D) PUT Endpoints Require Full-Resource Updates

**Status:** ⚠️ NOT FULLY AUDITED

Some endpoints use PUT for partial updates (correct), but others may require full payloads.
Recommendation: Standardize on PATCH for partial updates.

---

### E) UI Bypasses SDK with Raw Fetch

**Status:** ⚠️ SINGLE VIOLATION

**Violation Found:**
```typescript
// apps/web/src/features/rental-object-details/components/Sidebar/MapWidget.tsx:75-77
const response = await fetch(
  `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${mapboxToken}&country=NO&limit=1`
);
```

**Assessment:** This is an EXTERNAL API call (Mapbox), not internal. Acceptable but should use adapter pattern.

**No internal API bypasses found.** ✅

---

### F) Missing OpenAPI/Contract Compatibility Checks in CI

**Status:** ❌ NOT IMPLEMENTED

**Current CI Workflow:** `.github/workflows/contract-compliance.yml`
- ✅ Contract parity test
- ✅ RFC7807 compliance test
- ✅ No raw fetch lint
- ❌ **Missing:** OpenAPI breaking change detection (`openapi-diff`)

**Required Addition:**
```yaml
- name: Detect OpenAPI breaking changes
  run: |
    npx openapi-diff \
      /tmp/openapi-base.json \
      /tmp/openapi-current.json \
      --fail-on-incompatible
```

---

### G) Missing SDK Parity Snapshot Tests

**Status:** ⚠️ PARTIAL

**Exists:**
- `packages/client-sdk/src/__tests__/contract-parity.test.ts`

**Missing:**
- Snapshot-based comparison of API responses against DTO shapes
- Automated detection of extra/missing fields

---

### H) Feature Flags Scattered Without Single Source of Truth

**Status:** ✅ RESOLVED

Feature flags are centralized:
- `apps/api/src/services/feature-flags.service.ts`
- `packages/client-sdk/src/hooks/use-features.ts`
- `apps/api/src/middleware/feature-guard.ts`
- `apps/api/drizzle/0007_tenant_feature_flags.sql`

Documentation:
- `docs/FEATURE_FLAGS_COMPLETE.md`
- `docs/FEATURE_FLAGS_IMPLEMENTATION.md`
- `docs/FEATURE_FLAGS_QUICK_START.md`

---

### I) Integration Retries Without Idempotency/Backoff/DLQ Semantics

**Status:** ⚠️ PARTIAL IMPLEMENTATION

**Vipps Integration (`apps/api/src/integrations/vipps/`):**
- ✅ Idempotency keys in checkout (`idempotencyKey: reference`)
- ✅ Token caching with expiry buffer
- ✅ RFC7807 error mapping
- ❌ **Missing:** Exponential backoff with jitter
- ❌ **Missing:** DLQ/failed state table
- ❌ **Missing:** Max retry attempts

**Notification System (`apps/api/src/modules/notification-system/`):**
- ✅ Retry count tracking
- ✅ Failed state handling
- ⚠️ Backoff strategy unclear

---

### J) Secrets Exposure Risk via API Payloads/Logging

**Status:** ⚠️ NOT SYSTEMATICALLY VERIFIED

**Potential Issues:**
- `apps/api/src/integrations/vipps/vipps-login.service.ts` - `client_secret` in request
- Token caching stores secrets in memory

**Required:**
- Secrets redaction in logging
- No secrets in API responses
- Secrets encrypted at rest verification

---

## 2. INVENTORY FILES

### Existing Reports (Already Generated)

| Report | Location | Status |
|--------|----------|--------|
| API_SDK_PARITY_INVENTORY.md | `reports/API_SDK_PARITY_INVENTORY.md` | ✅ 100% Complete |
| COUPLING_POINTS.md | `reports/COUPLING_POINTS.md` | ✅ Complete |
| DECOUPLED_ARCHITECTURE_PLAN.md | `reports/DECOUPLED_ARCHITECTURE_PLAN.md` | ✅ Complete |
| EXPAND_CONTRACT_PLAYBOOK.md | `reports/EXPAND_CONTRACT_PLAYBOOK.md` | ✅ Complete |
| ACL_TESTING_STRATEGY.md | `reports/ACL_TESTING_STRATEGY.md` | ✅ Complete |

### New Report Needed

**INTEGRATION_RETRY_MODEL.md** - Document retry strategy for all integrations

---

## 3. ARCHITECTURE STATUS MATRIX

| Component | Layer Exists | ACL Exists | CI Gate | Tests |
|-----------|--------------|------------|---------|-------|
| Rental Objects | ✅ | ✅ | ✅ | ✅ |
| Bookings | ✅ | ❌ | ✅ | ⚠️ |
| Organizations | ✅ | ❌ | ⚠️ | ⚠️ |
| Users | ✅ | ❌ | ⚠️ | ⚠️ |
| Auth | ✅ | ❌ | ✅ | ✅ |
| Notifications | ✅ | ⚠️ | ⚠️ | ⚠️ |
| Calendar | ✅ | ❌ | ⚠️ | ⚠️ |

---

## 4. CI TRIPWIRES STATUS

| Tripwire | Implemented | Location |
|----------|-------------|----------|
| Contract Parity Test | ✅ | `.github/workflows/contract-compliance.yml` |
| RFC7807 Compliance | ✅ | `.github/workflows/contract-compliance.yml` |
| No Raw Fetch Lint | ✅ | `packages/eslint-config/rules/no-raw-fetch.js` |
| No Direct Schema Import | ✅ | `packages/eslint-config/rules/no-direct-schema-import.js` |
| Design Token Rules | ✅ | `packages/eslint-config/rules/no-hardcoded-*.js` |
| OpenAPI Breaking Detection | ❌ | **MISSING** |
| SDK Parity Snapshot | ❌ | **MISSING** |
| Persistence Import Block | ⚠️ | Rule exists, not fully enabled |
| Terminology Compliance | ✅ | `.github/workflows/contract-compliance.yml` |

---

## 5. CAPABILITIES ENDPOINTS STATUS

| App | Endpoint | Implemented | Location |
|-----|----------|-------------|----------|
| backoffice | `/api/backoffice/me/capabilities` | ❌ | - |
| minside | `/api/minside/me/capabilities` | ❌ | - |
| web | `/api/web/me/capabilities` | ❌ | - |
| generic | `/api/authz/permissions` | ✅ | `apps/api/src/modules/authz/authz.controller.ts` |

**Issue:** Capabilities are defined CLIENT-SIDE in `apps/backoffice/src/lib/capabilities.ts`

---

## 6. RECOMMENDED ACTIONS SUMMARY

### P0 - Demo Blockers (Immediate)
1. None identified - demo functionality is intact

### P1 - Critical Coupling (Week 1-2)
1. Implement `/api/{app}/me/capabilities` endpoints
2. Move capability mapping from client to server
3. Add OpenAPI breaking change detection to CI
4. Remove direct schema imports from 4 controllers

### P2 - Nice-to-Have (Week 3-4)
1. Add ACL for Organizations, Calendar, Messages modules
2. Implement integration retry with DLQ
3. Add SDK parity snapshot tests
4. Secrets exposure audit

---

## 7. FILE INDEX

### Audit Evidence Files
- `apps/api/src/modules/organizations/organizations.controller.ts:9`
- `apps/api/src/modules/messages/messages.controller.ts:9`
- `apps/api/src/modules/calendar/calendar.controller.ts:15`
- `apps/api/src/modules/seasonal-lease/seasonal-lease.controller.ts:9`
- `apps/backoffice/src/lib/capabilities.ts:46-91`
- `apps/web/src/features/rental-object-details/components/Sidebar/MapWidget.tsx:75-77`

### Working Architecture Files
- `apps/api/src/acl/rental-objects/rental-object.mapper.ts`
- `apps/api/src/domain/rental-objects/rental-object.ts`
- `packages/client-sdk/src/types/projection-dtos.ts`
- `packages/eslint-config/rules/no-direct-schema-import.js`
- `.github/workflows/contract-compliance.yml`

---

**Next Step:** Proceed to PHASE 2 - ANALYZE with LOOPHOLES_FIX_PLAN.md
