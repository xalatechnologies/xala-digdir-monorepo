# Legacy Terminology Removal Plan

**Generated:** 2026-01-16
**Task:** 040-prepare-digilist-for-ssa-l-demo-and-compliance-aud
**Subtask:** subtask-8-1 - Document Phase Final Reports

---

## Executive Summary

This document outlines the migration plan for transitioning from legacy "listing" terminology to the preferred "rental object" (leieobjekt) terminology across the Digilist platform. The migration is phased to minimize disruption while ensuring Norwegian municipal compliance and user-facing clarity.

| Migration Scope | Current State | Target State | Priority |
|-----------------|---------------|--------------|----------|
| Database Schema | `listings` table | Keep as-is | N/A (Out of scope) |
| API Contracts | Mixed (listing-focused) | `rental_object` in public APIs | Phase 2 |
| SDK Types/Services | `Listing`, `listing.service.ts` | `RentalObject`, `rental-object.service.ts` | Phase 2 |
| UI Components | Mixed terminology | `rental_object` consistently | Phase 1 |
| URL Routes | `/listings/`, `/listing/:id` | `/rental-objects/`, `/rental-object/:id` | Phase 1 |
| Documentation | "Listing" | "Rental Object" / "Leieobjekt" | Phase 1 |

---

## 1. Background and Rationale

### 1.1 Current Terminology

The codebase currently uses multiple terms for the same concept:

| Term | Usage | Context |
|------|-------|---------|
| `listing` | Database, API, SDK | Original technical term |
| `facility` | Some legacy code | Deprecated |
| `rental_object` | Demo seeds, E2E tests | New standard term |
| `leieobjekt` | Norwegian UI strings | Norwegian translation |

### 1.2 Why Migrate?

1. **Municipal Compliance**: Norwegian municipal contracts use "leieobjekt" (rental object) terminology
2. **SSA-L Tender**: Skien kommune documentation references "utleieobjekter" (rental objects)
3. **User Clarity**: End users understand "book a rental object" vs technical "listing"
4. **Contract Alignment**: API contracts should reflect business domain language

### 1.3 Design Decision

Per CLAUDE.md and spec.md:
> "Changes to legacy 'listing/facility' terminology in database schema (only contracts/SDK/UI use rental_object)"

**Database schema retains `listings` table** to avoid migration complexity. Only contracts, SDK types, and UI layer migrate to `rental_object`.

---

## 2. Current State Analysis

### 2.1 Database Layer (DO NOT MODIFY)

```
Schema: listings table
├── id (uuid, PK)
├── tenant_id (uuid, FK)
├── organization_id (uuid, FK)
├── name (text)
├── slug (text)
├── type (listing_type enum)
├── booking_model (booking_model enum)
├── status (listing_status enum)
├── description (text)
├── images (jsonb)
├── pricing (jsonb)
├── capacity (integer)
├── quantity (integer)
├── location (jsonb)
├── metadata (jsonb)
├── created_at (timestamp)
└── updated_at (timestamp)

Foreign Key References:
├── bookings.listing_id -> listings.id
├── allocations.listing_id -> listings.id
├── seasonal_leases.listing_id -> listings.id
└── reviews.listing_id -> listings.id
```

**Decision**: Database schema is OUT OF SCOPE. No table/column renames.

### 2.2 API Layer

| Module | Current Pattern | Files |
|--------|-----------------|-------|
| Public API | `/api/public/listings` | `public.controller.ts` |
| Admin API | `/api/listings` | `listing.controller.ts` |
| Backoffice API | `/api/backoffice/listings` | `backoffice.controller.ts` |
| Search API | `/api/search?q=...` | `search.controller.ts` |

**Current Endpoint Count**: 22 controllers reference `listing` terminology

### 2.3 SDK Layer

| Component | Current | Location |
|-----------|---------|----------|
| Types | `Listing`, `CreateListingDTO`, `UpdateListingDTO` | `packages/client-sdk/src/types/listing.ts` |
| Service | `listingService` | `packages/client-sdk/src/services/listing.service.ts` |
| Hooks | `useListing`, `useListings`, `useCreateListing`, etc. | `packages/client-sdk/src/hooks/use-listings.ts` |
| Transform | `listingTransform` | `packages/client-sdk/src/transforms/listing.transform.ts` |

**Total SDK References**: 165+ occurrences across 30 files

### 2.4 UI Layer

| App | Current Routes | Target Routes |
|-----|----------------|---------------|
| Web | `/listings`, `/listing/:id` | `/rental-objects`, `/rental-object/:id` |
| Backoffice | `/listings`, `/listings/:id/edit` | `/rental-objects`, `/rental-objects/:id/edit` |
| MinSide | `/my-bookings` (refs listings) | `/my-bookings` (refs rental-objects) |

### 2.5 E2E Tests and Demo Data

E2E tests already use `rental_object` terminology:
- `citizen-journey.spec.ts` - 8 references
- `caseworker-journey.spec.ts` - 8 references
- `admin-journey.spec.ts` - 84 references
- `rbac-negative.spec.ts` - 20 references

Demo seeds use `rental_object`:
- `demo-rental-objects.seed.ts` - 45 rental objects defined
- `demo-bookings.seed.ts` - References rental object IDs

---

## 3. Migration Phases

### Phase 0: Preparation (Pre-Demo - COMPLETED)

| Task | Status | Notes |
|------|--------|-------|
| E2E tests use rental_object | ✅ Done | All 4 journey specs |
| Demo seeds use rental_object | ✅ Done | 45+ rental objects seeded |
| Documentation uses rental object | ✅ Done | Reports reference correctly |

### Phase 1: UI & Documentation (Post-Demo Sprint 1)

**Duration**: 3-5 days
**Risk Level**: Low
**Breaking Changes**: None (URL redirects provided)

| Task | Effort | Owner | Dependencies |
|------|--------|-------|--------------|
| Update Web app routes | 2h | Frontend | None |
| Update Backoffice routes | 2h | Frontend | None |
| Add URL redirects (301) | 1h | Frontend | Routes updated |
| Update i18n strings | 4h | Frontend | None |
| Update component names | 4h | Frontend | Routes + i18n |
| Update user documentation | 4h | Docs | UI changes complete |

**Deliverables**:
- `/rental-objects` route works
- `/listings` redirects to `/rental-objects`
- Norwegian strings show "leieobjekt"
- Component names reflect rental_object

### Phase 2: SDK & API Contracts (Post-Demo Sprint 2)

**Duration**: 5-8 days
**Risk Level**: Medium
**Breaking Changes**: SDK types/methods renamed (major version bump)

| Task | Effort | Owner | Dependencies |
|------|--------|-------|--------------|
| Create `RentalObject` type alias | 2h | SDK | None |
| Add deprecation notices to `Listing` | 1h | SDK | Type alias |
| Create `useRentalObject` hooks | 4h | SDK | Type alias |
| Deprecate `useListing` hooks | 1h | SDK | New hooks |
| Update API route aliases | 4h | API | SDK types |
| Add `/api/rental-objects` routes | 4h | API | Route aliases |
| Deprecate `/api/listings` | 2h | API | New routes |
| Update SDK service methods | 4h | SDK | API routes |
| Integration tests for new contracts | 8h | QA | All above |

**Migration Path for SDK Consumers**:

```typescript
// Phase 2a: Both work (deprecation period)
import { Listing, RentalObject } from '@digilist/client-sdk/types';
import { useListing, useRentalObject } from '@digilist/client-sdk/hooks';

// Phase 2b: Old types emit deprecation warnings
// @deprecated Use RentalObject instead
export type Listing = RentalObject;

// Phase 2c: Old types removed in next major version
```

### Phase 3: Cleanup (Post-Demo Sprint 3+)

**Duration**: 2-3 days
**Risk Level**: Low (after deprecation period)
**Breaking Changes**: Removal of deprecated APIs

| Task | Effort | Owner | Dependencies |
|------|--------|-------|--------------|
| Remove `Listing` type export | 1h | SDK | Major version bump |
| Remove `useListing` hooks | 1h | SDK | Deprecation period |
| Remove `/api/listings` routes | 2h | API | API versioning |
| Remove URL redirects | 1h | Frontend | Traffic analysis |
| Update all internal references | 4h | All | Cleanup complete |

---

## 4. File-by-File Migration Inventory

### 4.1 SDK Types (packages/client-sdk/src/types/)

| File | Action | Effort |
|------|--------|--------|
| `listing.ts` | Rename to `rental-object.ts`, add `Listing` as deprecated alias | 2h |
| `enums.ts` | Keep `ListingType`, `ListingStatus` (internal DB representation) | 0h |
| `index.ts` | Export both `Listing` (deprecated) and `RentalObject` | 0.5h |

### 4.2 SDK Services (packages/client-sdk/src/services/)

| File | Action | Effort |
|------|--------|--------|
| `listing.service.ts` | Rename to `rental-object.service.ts` | 1h |
| `index.ts` | Export both `listingService` (deprecated) and `rentalObjectService` | 0.5h |

### 4.3 SDK Hooks (packages/client-sdk/src/hooks/)

| File | Action | Effort |
|------|--------|--------|
| `use-listings.ts` | Rename to `use-rental-objects.ts` | 1h |
| `use-listing-*.ts` | Add `useRentalObject*` aliases | 2h |
| `index.ts` | Export both old (deprecated) and new hooks | 0.5h |

### 4.4 API Controllers (apps/api/src/modules/)

| Controller | Routes to Add | Deprecate |
|------------|---------------|-----------|
| `public.controller.ts` | `/api/public/rental-objects` | `/api/public/listings` |
| `listing.controller.ts` | Rename to `rental-object.controller.ts` | Module rename |
| `backoffice.controller.ts` | `/api/backoffice/rental-objects` | `/api/backoffice/listings` |
| `search.controller.ts` | No change (generic search) | N/A |

### 4.5 UI Components (apps/web, apps/backoffice)

| Component | Current | Target |
|-----------|---------|--------|
| `ListingsPage.tsx` | `listings` route | `rental-objects` route |
| `ListingDetailPage.tsx` | `/listing/:id` | `/rental-object/:id` |
| `ListingCard.tsx` | Component name | `RentalObjectCard.tsx` |
| `ListingWizard.tsx` | Component name | `RentalObjectWizard.tsx` |
| Router config | `/listings/*` | `/rental-objects/*` + redirects |

---

## 5. Database Mapping Strategy

Since database schema is NOT modified, we need mapping at the service layer:

```typescript
// apps/api/src/modules/rental-object/rental-object.mapper.ts

/**
 * Maps database 'listing' entity to API 'RentalObject' DTO
 * This is the ONLY place where listing->rental_object translation occurs
 */
export function toRentalObjectDTO(listing: Listing): RentalObjectDTO {
  return {
    id: listing.id,
    tenantId: listing.tenantId,
    name: listing.name,
    slug: listing.slug,
    type: listing.type as RentalObjectType, // Same enum values
    // ... rest of fields map 1:1
  };
}

export function fromRentalObjectDTO(dto: CreateRentalObjectDTO): NewListing {
  return {
    name: dto.name,
    slug: dto.slug,
    type: dto.type as ListingType,
    // ... rest of fields
  };
}
```

**Query Layer**: Services continue to use `listings` table internally:

```typescript
// Internal: Uses database table name
const listings = await db.select().from(schema.listings).where(...)

// External: Returns RentalObject DTOs
return listings.map(toRentalObjectDTO);
```

---

## 6. Norwegian Localization

### 6.1 i18n Keys

| Key | English | Norwegian (Bokmal) |
|-----|---------|-------------------|
| `rental_object.singular` | Rental Object | Leieobjekt |
| `rental_object.plural` | Rental Objects | Leieobjekter |
| `rental_object.browse` | Browse Rental Objects | Utforsk leieobjekter |
| `rental_object.book` | Book This | Bestill dette |
| `rental_object.details` | Rental Object Details | Leieobjektdetaljer |
| `rental_object.create` | Create Rental Object | Opprett leieobjekt |
| `rental_object.edit` | Edit Rental Object | Rediger leieobjekt |

### 6.2 URL Slugs

| Environment | URL Pattern |
|-------------|-------------|
| Production (Norwegian) | `/leieobjekter`, `/leieobjekt/:id` |
| Development (English) | `/rental-objects`, `/rental-object/:id` |
| API (Technical) | `/api/rental-objects`, `/api/listings` (deprecated) |

---

## 7. Testing Requirements

### 7.1 Unit Tests to Update

| Test File | Changes Needed |
|-----------|----------------|
| `listing.service.spec.ts` | Rename + add RentalObject tests |
| `listing.controller.spec.ts` | Test both routes work |
| SDK type tests | Verify type compatibility |

### 7.2 Integration Tests

| Test Scenario | Verification |
|---------------|--------------|
| Create via new route | `POST /api/rental-objects` returns 201 |
| Create via old route | `POST /api/listings` returns 201 + deprecation header |
| SDK new method | `rentalObjectService.create()` works |
| SDK old method | `listingService.create()` emits warning |

### 7.3 E2E Tests

| Journey | Status | Notes |
|---------|--------|-------|
| Citizen Journey | ✅ Uses rental_object | No changes needed |
| Caseworker Journey | ✅ Uses rental_object | No changes needed |
| Admin Journey | ✅ Uses rental_object | No changes needed |
| RBAC Negative | ✅ Uses rental_object | No changes needed |

---

## 8. Rollback Plan

### Phase 1 Rollback (UI)
- Revert route changes
- Remove redirects
- Restore i18n strings
- **Effort**: 1 hour

### Phase 2 Rollback (SDK/API)
- Remove new type exports (keep deprecated aliases)
- Remove new routes
- Restore original service exports
- **Effort**: 4 hours

### Rollback Triggers
- Production errors spike >5% above baseline
- Critical feature broken in production
- Integration partner reports incompatibility

---

## 9. Communication Plan

### 9.1 Internal

| Audience | Channel | When |
|----------|---------|------|
| Dev Team | Slack #engineering | Phase start |
| QA Team | Jira epic | Before each phase |
| Product | Sprint review | Phase completion |

### 9.2 External (SDK Consumers)

| Milestone | Communication |
|-----------|---------------|
| Phase 2 start | Changelog: "New RentalObject types available" |
| Deprecation active | SDK console warnings |
| 6 months notice | "Listing types will be removed in v3.0" |
| Phase 3 | Major version release notes |

---

## 10. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Route adoption | >90% traffic to `/rental-objects` within 30 days | Analytics |
| SDK adoption | >80% projects use `RentalObject` types within 90 days | npm stats |
| Error rate | No increase from baseline | APM monitoring |
| User complaints | Zero related to terminology | Support tickets |

---

## 11. Timeline Summary

```
Pre-Demo (NOW)
├── ✅ E2E tests use rental_object
├── ✅ Demo seeds use rental_object
└── ✅ Documentation uses rental object

Post-Demo Sprint 1 (Week 1-2)
├── UI route changes
├── i18n updates
├── Component renames
└── URL redirects

Post-Demo Sprint 2 (Week 3-4)
├── SDK type aliases
├── New hooks created
├── API route aliases
├── Deprecation warnings active
└── Integration tests pass

Post-Demo Sprint 3+ (Week 5+)
├── Monitor adoption metrics
├── Address edge cases
├── Remove deprecated code (after deprecation period)
└── Major version release
```

---

## 12. Appendix: Code Examples

### A. Type Migration Example

```typescript
// packages/client-sdk/src/types/rental-object.ts

/** Primary type - use this */
export interface RentalObject {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  type: RentalObjectType;
  status: RentalObjectStatus;
  // ... full definition
}

/** @deprecated Use RentalObject instead */
export type Listing = RentalObject;

/** @deprecated Use RentalObjectType instead */
export type ListingType = RentalObjectType;
```

### B. Hook Migration Example

```typescript
// packages/client-sdk/src/hooks/use-rental-objects.ts

/** Primary hook - use this */
export function useRentalObject(id: string) {
  return useQuery({
    queryKey: rentalObjectKeys.detail(id),
    queryFn: () => rentalObjectService.getById(id),
  });
}

/** @deprecated Use useRentalObject instead */
export function useListing(id: string) {
  console.warn('useListing is deprecated. Use useRentalObject instead.');
  return useRentalObject(id);
}
```

### C. Route Migration Example

```typescript
// apps/web/src/routes/index.tsx

const routes = [
  // New routes (primary)
  { path: '/rental-objects', element: <RentalObjectsPage /> },
  { path: '/rental-object/:id', element: <RentalObjectDetailPage /> },

  // Legacy redirects
  { path: '/listings', element: <Navigate to="/rental-objects" replace /> },
  { path: '/listing/:id', element: <LegacyRedirect to="/rental-object/:id" /> },
];
```

---

## 13. Conclusion

The legacy terminology removal is a phased, low-risk migration that:

1. **Preserves database stability** - No schema changes
2. **Supports backward compatibility** - Deprecation period with aliases
3. **Aligns with Norwegian municipal terminology** - "leieobjekt" standard
4. **Maintains demo readiness** - E2E tests and seeds already compliant

**Recommendation**: Begin Phase 1 (UI) immediately after SSA-L demo completion. Phase 2 (SDK/API) can be scheduled for the following sprint with proper deprecation notices.

---

*Report generated as part of SSA-L Demo and Compliance Audit preparation*
