# Coupling Points Audit Report

**Date:** 2026-01-16
**Project:** Xala/Digilist Platform - Anti Schema-Coupling Analysis
**Severity:** HIGH - Significant coupling between database schema and all application layers

---

## Executive Summary

The Xala platform exhibits **HIGH to CRITICAL coupling** between database schema naming and the application layers (API, SDK, UI). Key findings:

- **4 API controllers** directly import database schema definitions
- **100+ hard-coded field references** across UI components
- **3 parallel type systems** creating maintenance complexity
- **25+ UI components** would break on schema field renames
- **Hardcoded enums** in SDK tightly couple to database seed tables

**Impact:** Any database schema change (column rename, structure change) requires coordinated updates across API, SDK, and all three frontend applications.

---

## 1. API Layer Coupling

### CRITICAL - Direct Schema Imports in Controllers

| Module | File | Lines | Schema Imports | Severity |
|--------|------|-------|----------------|----------|
| Organizations | `apps/api/src/modules/organizations/organizations.controller.ts` | 9 | `organizations, users` | CRITICAL |
| Messages | `apps/api/src/modules/messages/messages.controller.ts` | 9 | `conversations, messages, users` | CRITICAL |
| Calendar | `apps/api/src/modules/calendar/calendar.controller.ts` | 15 | `allocations, listings, users, bookings` | CRITICAL |
| Seasonal Lease | `apps/api/src/modules/seasonal-lease/seasonal-lease.controller.ts` | 9 | `seasonalLeases, listings, organizations` | CRITICAL |

**Issue:** Controllers perform manual field selection and return raw database projections without DTO abstraction.

**Example (Organizations Controller, line 21-76):**
```typescript
import { organizations, users } from '../../database/schema/index';  // ❌ Schema import

const result = await db
  .select({
    id: organizations.id,
    tenantId: organizations.tenantId,
    name: organizations.name,
    slug: organizations.slug,
    type: organizations.type,
    status: organizations.status,
    settings: organizations.settings,
  })
  .from(organizations)

return { data: orgsWithMembers };  // ❌ Raw projection
```

**Risk:** If database column names change, controllers break immediately.

---

### MEDIUM - Inconsistent Projection Usage

| Module | File | Projection DTOs Defined | Consistently Used | Severity |
|--------|------|-------------------------|-------------------|----------|
| Rental Objects | `apps/api/src/modules/rental-objects/rental-object.projections.ts` | ✅ Yes (491 lines) | ⚠️ Partial | MEDIUM |
| Configuration | `apps/api/src/modules/configuration/configuration.service.ts` | ✅ Yes | ✅ Yes | LOW |
| Notification System | `apps/api/src/modules/notification-system/notification.types.ts` | ✅ Yes | ✅ Yes | LOW |
| Booking | N/A | ❌ No | ❌ No | HIGH |

**Issue:** Rental Objects module has comprehensive projection DTOs but controllers sometimes bypass them and return raw service results.

**Example (Rental Object Controller, line 40-48):**
```typescript
const result = await this.service.findAll(tenantId, params);

return {
  data: result.data,  // ⚠️ May return raw database entities
  meta: { total, page, limit, totalPages }
};
```

**Risk:** API contract inconsistency - sometimes returns projections, sometimes raw entities.

---

### Database Schema Naming

**Current State:**

| DB Column Name | DB Type | API Field Name | Status |
|----------------|---------|----------------|--------|
| `category_key` | varchar | `categoryKey` | ✅ Camel case conversion |
| `time_mode` | varchar | `timeMode` | ✅ Camel case conversion |
| `rental_object_id` | uuid | `rentalObjectId` | ✅ Camel case conversion |
| `start_time` | timestamp | `startTime` | ✅ Camel case conversion |
| `total_price` | decimal | `totalPrice` | ✅ Camel case conversion |

**Naming is consistent (snake_case → camelCase), but field names themselves are tightly coupled.**

---

### Legacy Naming Issues

**Terminology drift:**
- Old: "listing" → New: "rental object" / "utleieobjekt"
- Database uses `rentalObjects` table (new)
- Some code still references `listings` table (old)

**Example (Calendar Controller, line 15):**
```typescript
import { allocations, listings, users, bookings } from '../../database/schema/index';
```

**Example (Seasonal Lease Controller, line 34):**
```typescript
listingName: listings.name,  // ⚠️ Old table name
```

**Risk:** Mixed terminology creates confusion and technical debt.

---

## 2. SDK Type Coupling

### CRITICAL - Hardcoded Enum Types

**File:** `packages/client-sdk/src/types/rental-object.ts`

| Type | Definition | Coupling | Risk |
|------|------------|----------|------|
| `RentalObjectCategory` | `'LOKALER_OG_BANER' \| 'UTSTYR_OG_INVENTAR' \| ...` | HIGH | New category breaks SDK |
| `BookingTimeMode` | `'PERIOD' \| 'SLOT' \| 'ALL_DAY'` | HIGH | New mode breaks SDK |
| `RentalObjectStatus` | `'DRAFT' \| 'PUBLISHED' \| 'ARCHIVED'` | MEDIUM | New status breaks SDK |
| `PricingUnit` | `'HOUR' \| 'DAY' \| 'WEEK' \| 'MONTH'` | MEDIUM | New unit breaks SDK |

**Example (rental-object.ts, lines 14-18):**
```typescript
export type RentalObjectCategory =
  | 'LOKALER_OG_BANER'
  | 'UTSTYR_OG_INVENTAR'
  | 'KJORETOY_OG_TRANSPORT'
  | 'OPPLEVELSER_OG_ARRANGEMENT';
```

**Breaking Change Scenario:**
1. Backend adds new category to seed table: `SPORTSUTSTYR`
2. API returns `{ categoryKey: 'SPORTSUTSTYR' }`
3. SDK type validation fails - not in union
4. Frontend TypeScript errors or runtime crashes

**Affected Service Methods:**
```typescript
// packages/client-sdk/src/services/rental-object.service.ts:80-85
async getByCategory(
  category: RentalObjectCategory,  // ← Forces hardcoded enum
  params?: Omit<RentalObjectQueryParams, 'category'>
): Promise<RentalObjectsResponse>
```

---

### MEDIUM - Entity Types Mirror Database

**File:** `packages/client-sdk/src/types/rental-object.ts`

```typescript
export interface RentalObject {
  id: string;
  tenantId: string;
  organizationId: string | null;
  categoryKey: string;  // ← DB field name
  timeMode: string;     // ← DB field name
  name: string;         // ← DB field name
  slug: string;         // ← DB field name
  status: string;       // ← DB field name
  capacity: number;     // ← DB field name
  // ... 20+ more fields matching DB schema
}
```

**Risk:** SDK entity types are direct mirrors of database schema. Any schema refactor requires SDK type updates.

---

### LOW - Projection DTOs (Clean Design)

**File:** `packages/client-sdk/src/types/projection-dtos.ts`

```typescript
export interface RentalObjectCardProjectionDTO {
  id: string;
  name: string;
  typeLabel: string;         // ← Pre-computed display string
  locationFormatted: string; // ← Pre-formatted
  primaryImageUrl: string;   // ← Display-ready
  priceDisplay: string;      // ← Pre-formatted
  capacityLabel: string;     // ← Pre-computed
  // ... screen-ready fields
}
```

**✅ Strength:** Projection DTOs are display-ready and decoupled from database schema.
**⚠️ Issue:** Underutilized - apps define their own custom types instead of using these.

---

## 3. UI Data Shape Coupling

### CRITICAL - Custom UI Types Duplicate SDK Types

**apps/web - Custom Type Definition:**

**File:** `apps/web/src/features/rental-object-details/types.ts` (lines 235-280)

```typescript
export interface RentalObject {  // ❌ VIOLATION: Custom type instead of SDK type
  id: string;
  tenantId: string;
  type: RentalObjectType;
  name: string;
  metadata: RentalObjectMetadata;
  keyFacts: KeyFacts;
  address?: Address;
  contact?: ContactInfo;
  openingHours?: OpeningHours;
  bookingConfig?: BookingConfig;
  pricing?: { basePrice?, currency?, unit? };
}
```

**apps/backoffice - Second Custom Type:**

**File:** `apps/backoffice/src/features/rental-objects/types.ts` (lines 123-159)

```typescript
export interface BackofficeListing {  // ❌ DUPLICATION
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  type: BackofficeListingType;
  status: ListingStatus;
  location?: ListingLocation;
  openingHours?: ListingOpeningHours;
  bookingConfig?: ListingBookingConfig;
  pricing?: { basePrice, currency, unit };
}
```

**Issue:** Three parallel type systems for same entity:
1. SDK entity types (`RentalObject`)
2. SDK projection DTOs (`RentalObjectCardProjectionDTO`)
3. Custom app types (`RentalObject` in web, `BackofficeListing` in backoffice)

**Maintenance Burden:** Field changes require updates in 3+ locations.

---

### HIGH - Hard-Coded Field References

**Total count: 100+ hard-coded field accesses across UI components**

#### apps/web - RentalObjectDetailsLayout.tsx

```typescript
// Line 126-127: Direct field access
const shareData = React.useMemo((): ShareData => ({
  title: listing.name,  // ← Hard-coded field
  description: listing.metadata.shortDescription || listing.metadata.description?.slice(0, 150),
}));

// Line 132: Direct field access
await logAuditEvent('RENTAL_OBJECT_SHARED', listing.tenantId, listing.id, userId);

// Line 273-275: Conditional rendering
{presenter.showOpeningHours && listing.openingHours && (
  <OpeningHoursWidget openingHours={listing.openingHours} />
)}
```

**Field accesses:** `name`, `metadata.shortDescription`, `metadata.description`, `tenantId`, `id`, `openingHours`, `type`, `address`, `contact`, `keyFacts`, `bookingConfig`, `pricing`, `activityData`

---

#### apps/web - RentalObjectsPage.tsx

```typescript
// Lines 161-185: Client-side filtering on projection DTO fields
const filteredListings = React.useMemo(() => {
  return listings.filter(l => {
    if (listingType !== 'ALL' && l.type !== listingType) return false;

    if (selectedArea !== 'all') {
      const cityLower = l.city.toLowerCase().replace(/\s+/g, '-');
    }

    if (l.capacity < capacityOption.min || l.capacity > capacityOption.max) return false;

    const listingAmenities = l.amenities || [];
  });
}, [listings, ...]);
```

**Field accesses:** `type`, `city`, `capacity`, `amenities`, `name`, `locationFormatted`, `slug`, `latitude`, `longitude`, `primaryImageUrl`, `priceAmount`, `priceUnit`

**Issue:** Client-side filtering duplicates server-side logic and tightly couples to field names.

---

#### apps/backoffice - RentalObjectsGrid.tsx

```typescript
// Lines 139-165: Hard-coded property access
<RentalObjectCard
  id={listing.id}
  name={listing.name}
  type={listing.type}
  listingType={listing.listingType}
  location={listing.location || '-'}
  capacity={listing.capacity}
  price={listing.price}
  status={listing.status}
/>
```

**Field accesses:** 12+ fields with specific types expected

---

### Breaking Change Impact Matrix

| Schema Change | UI Breakage | Affected Components |
|---------------|-------------|---------------------|
| `name` → `title` | HIGH | 15+ components across all 3 apps |
| `capacity` → `max_capacity` | HIGH | 8+ components (filtering, display) |
| `metadata.shortDescription` structure change | HIGH | RentalObjectDetailsLayout, all cards |
| `pricing.basePrice` → `pricing.amount` | MEDIUM | 6+ pricing display components |
| `type` enum values change | HIGH | Presenters, filters, labels |
| Add nested `location.formatted_address` | MEDIUM | CalendarSection, MapWidget |

**Impact Radius:** 1 field change → 5-15 component updates required

---

### VIOLATION - Zero Transformers Rule (CLAUDE.md #7)

**File:** `apps/web/src/features/rental-object-details/presenters/rentalObjectTypePresenter.ts`

```typescript
// Presenter transforms data before rendering
function getKeyFacts(keyFacts: KeyFacts): VisibleFact[] {
  // ❌ This is a disguised transformer
}
```

**CLAUDE.md Rule #7 States:**
> ❌ FORBIDDEN in apps/:
> - toXxx(), fromXxx(), mapXxx(), adaptXxx() functions
> - *VM, *ViewModel, *UiModel types
> - Reshaping API DTOs before rendering
> - Computing permissions/actions in frontend

**Issue:** Presenters compute/filter data from projections instead of receiving UI-ready data from API.

**Should Be:** Server-side projection DTO returns pre-computed display values.

---

## 4. Coupling Severity Summary

### By Layer

| Layer | Coupling Severity | Key Issue | Files Affected |
|-------|-------------------|-----------|----------------|
| API Controllers | CRITICAL | Direct schema imports | 4 controllers |
| API Services | MEDIUM | Inconsistent projection usage | 6 modules |
| SDK Types | HIGH | Hardcoded enums | 5 type files |
| SDK Services | MEDIUM | Enum parameters | 10+ service methods |
| UI Types | HIGH | Custom type duplication | 3 apps |
| UI Components | HIGH | Hard-coded field references | 25+ components |

### By Impact

| Impact Category | Count | Severity |
|-----------------|-------|----------|
| Controllers importing schema | 4 | CRITICAL |
| Hardcoded enum types | 5 | HIGH |
| Custom UI types | 2 | HIGH |
| Hard-coded field references | 100+ | HIGH |
| Components requiring updates per field change | 5-15 | HIGH |

---

## 5. File Reference Index

### API Layer
- `apps/api/src/modules/organizations/organizations.controller.ts` (line 9: schema import)
- `apps/api/src/modules/messages/messages.controller.ts` (line 9: schema import)
- `apps/api/src/modules/calendar/calendar.controller.ts` (line 15: schema import)
- `apps/api/src/modules/seasonal-lease/seasonal-lease.controller.ts` (line 9: schema import)
- `apps/api/src/modules/rental-objects/rental-object.controller.ts` (service-based, better)
- `apps/api/src/modules/rental-objects/rental-object.projections.ts` (491 lines of projections)
- `apps/api/src/database/schema/index.ts` (schema definitions)

### SDK Layer
- `packages/client-sdk/src/types/rental-object.ts` (entity types, hardcoded enums)
- `packages/client-sdk/src/types/projection-dtos.ts` (clean projections)
- `packages/client-sdk/src/services/rental-object.service.ts` (service methods)
- `packages/client-sdk/src/hooks/use-rental-objects.ts` (React Query hooks)

### UI Layer
- `apps/web/src/features/rental-object-details/types.ts` (custom types)
- `apps/web/src/features/rental-object-details/components/RentalObjectDetailsLayout.tsx`
- `apps/web/src/pages/RentalObjectsPage.tsx` (filtering logic)
- `apps/backoffice/src/features/rental-objects/types.ts` (custom types)
- `apps/backoffice/src/features/rental-objects/components/list/RentalObjectsGrid.tsx`
- `apps/minside/src/features/rental-objects/components/list/RentalObjectsGrid.tsx`

---

## 6. Recommended Actions

### IMMEDIATE (Prevent Further Coupling)
1. **Freeze schema imports in controllers** - No new controllers should import `database/schema`
2. **Document projection DTOs as contracts** - Mark projection DTOs as stable API contracts
3. **Audit all custom types** - Identify and mark for removal

### SHORT-TERM (Strengthen Boundaries)
1. **Add ESLint rule** - Prevent `import ... from '../../database/schema'` in controllers
2. **Create Anti-Corruption Layer (ACL)** - Mappers between persistence and domain
3. **Standardize response format** - Enforce `{ data: T, meta?: Pagination }` pattern
4. **Move to server-side filtering** - Remove client-side field-based filtering

### MEDIUM-TERM (Refactor)
1. **Replace hardcoded enums with dynamic registry** - `GET /api/metadata/categories`
2. **Enforce projection DTO usage** - All endpoints return projection DTOs
3. **Remove custom UI types** - Use SDK projection DTOs directly
4. **Implement Expand/Contract pattern** - For safe field renames

---

**Next Steps:** Proceed to PHASE 2 - ANALYZE to design the decoupled architecture.
