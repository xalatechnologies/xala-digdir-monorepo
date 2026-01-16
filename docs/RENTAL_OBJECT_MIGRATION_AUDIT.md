# Rental Object Migration Audit Report
**Date:** 2026-01-16
**Author:** Claude Code Audit System
**Status:** 🔴 CRITICAL - Migration Incomplete

---

## Executive Summary

The migration from `listing` to `rental_object` terminology was **ATTEMPTED but NOT COMPLETED**. The codebase currently exists in an **inconsistent hybrid state** with:

- ❌ Database table still named `listings` (not `rental_objects`)
- ❌ Foreign key columns still use `listingId` (not `rentalObjectId`)
- ✅ Client SDK has parallel `RentalObject` implementation
- ⚠️ API layer has mixed terminology with "backward compatibility" comments
- ❌ Migration script exists but was never executed

**Risk Level:** CRITICAL - Data model inconsistency across entire stack

---

## Detailed Findings

### 1. Database Layer (apps/api)

#### 1.1 Schema Definition (`src/database/schema/index.ts`)

**STATUS:** ❌ FAILED - Still uses `listings` table

```typescript
// Line 95-115: Table is still named "listings"
export const listings = pgTable('listings', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  organizationId: uuid('organization_id'),
  name: varchar('name', { length: 255 }).notNull(),
  // ... rest of schema
});
```

**Foreign Key References:**
- `bookings.listingId` (line 124) → Should be `rentalObjectId`
- `allocations.listingId` (line 256) → Should be `rentalObjectId`
- `seasonalLeases.listingId` (line 281) → Should be `rentalObjectId`

**Type Exports:**
- `export type Listing` (line 346) → Should be `RentalObject`
- `export type NewListing` (line 347) → Should be `NewRentalObject`

#### 1.2 Migration Status

**Migration File:** `src/database/migrations/20260115_rename_listings_to_rental_objects.sql`

**STATUS:** ❌ EXISTS BUT NEVER EXECUTED

The migration file was created but:
1. Located in `src/database/migrations/` (custom location)
2. NOT integrated into Drizzle's migration system (`drizzle/` directory)
3. Never executed - table is still named `listings` in production

**Drizzle Migrations:**
- `0000_*` through `0005_*` exist in `drizzle/` directory
- `0003_rental_objects_category.sql` STILL operates on `listings` table (line 5, 8, 14, 18, 22-24)
- No migration in Drizzle's system renames the table

#### 1.3 Seed Data (`scripts/seed.ts`)

**STATUS:** ⚠️ MIXED TERMINOLOGY

```typescript
// Line 56-66: Uses RENTAL_OBJECT_* constants (GOOD)
const RENTAL_OBJECT_HALL_A = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
const RENTAL_OBJECT_HALL_B = 'dddddddd-dddd-dddd-dddd-dddddddddddd';

// Line 69-79: Backward compatibility aliases (BAD - deprecated)
/** @deprecated Use RENTAL_OBJECT_* constants instead */
const LISTING_HALL_A = RENTAL_OBJECT_HALL_A;
const LISTING_HALL_B = RENTAL_OBJECT_HALL_B;

// Line 289: Array still named LISTINGS (BAD)
const LISTINGS = [ /* ... */ ];

// Line 1141, 1178: References schema.listings with comment
await db.insert(schema.listings).values(RENTAL_OBJECTS);
// Comment: "Uses backward-compatible alias for rental_objects table"
```

**Issues:**
- Constants use correct `RENTAL_OBJECT_*` naming
- But array is still named `LISTINGS`
- Seed code inserts into `schema.listings` (not `rentalObjects`)
- "Backward compatibility" comments indicate awareness but incomplete migration

#### 1.4 Repository Layer

**File:** `src/modules/rental-objects/rental-object.repository.ts`

**STATUS:** ⚠️ IMPLEMENTS NEW INTERFACE BUT USES OLD TABLE

```typescript
// Line 8: Imports old schema names with "backward-compatible" comment
import { listings, type Listing, type NewListing } from '../../database/schema';
// Note: Listing and NewListing types are backward-compatible aliases for RentalObject types

// Line 14-21: Repository uses old table reference
export class RentalObjectRepository extends BaseRepository<
  typeof listings,  // ← Still references 'listings' table
  Listing,          // ← Still uses Listing type
  NewListing,
  // ...
> {
  constructor(db: any) {
    super(db, listings, listings.id);  // ← Operates on 'listings' table
  }
}
```

---

### 2. API Layer (apps/api)

#### 2.1 Validation Schemas

**File:** `src/schemas/booking.schema.ts`

**STATUS:** ❌ ALL SCHEMAS USE `listingId`

```typescript
// Line 19: BookingSchema
listingId: z.string().uuid(),

// Line 42: CreateBookingSchema
listingId: z.string().uuid(),

// Line 82: BookingQuerySchema
listingId: z.string().uuid().optional(),

// Line 98: CalendarEventSchema
listingId: z.string().uuid(),

// Line 187, 278, 308: BookingSelectionSchema and others
listingId: z.string().uuid(),
```

**Comments mentioning rental_objects:**
- Line 408, 416, 438, 450: Comments reference "rental_objects" config
- Indicates awareness of correct terminology but schemas not updated

#### 2.2 Controllers & Services

**STATUS:** ⚠️ NOT FULLY AUDITED (79 files found with "listing" references)

Files with "listing" mentions:
- `booking.service.ts`
- `booking.controller.ts`
- `calendar.service.ts`
- `availability.controller.ts`
- `public.controller.ts`
- `dashboard.controller.ts`
- And 73 more files...

---

### 3. Client SDK (packages/client-sdk)

#### 3.1 Service Layer

**STATUS:** ✅ NEW SERVICE EXISTS

**File:** `src/services/rental-object.service.ts`

```typescript
// Line 64: Correct endpoint
super('/api/rental-objects');

// Methods use correct terminology:
- getAll(params?: RentalObjectQueryParams)
- getByCategory(category: RentalObjectCategory)
- getById(id: string)
- getBySlug(slug: string)
```

**BUT:** 30+ files still reference "listing" terminology

#### 3.2 Hooks

**STATUS:** ✅ NEW HOOKS EXIST + ⚠️ DEPRECATED ALIASES KEPT

**Confirmed RentalObject hooks:**
- `useRentalObjects`
- `useRentalObject`
- `useCreateRentalObject`
- `useUpdateRentalObject`
- `useDeleteRentalObject`
- `usePublishRentalObject`
- `useArchiveRentalObject`
- `useRentalObjectCalendarConfig`

**Deprecated Listing hooks (still exported):**
- `useListings`
- `useListing`
- `useCreateListing`
- `useUpdateListing`
- `useDeleteListing`

#### 3.3 Terminology Compliance Tests

**File:** `src/__tests__/terminology-compliance.test.ts`

**STATUS:** ✅ COMPREHENSIVE TESTS EXIST

Tests verify:
- Primary exports use `RentalObject` terminology
- No "facility" terminology
- Deprecated aliases exist alongside new names
- Query keys use `rental-objects`
- All CRUD, lifecycle, and query hooks have RentalObject versions

**HOWEVER:** Tests **expect both terminologies to coexist**:
```typescript
// Line 90-91: Test expects Listing hooks to exist
// "Listing hooks should exist (for backward compatibility)"
expect(listingHooks.length).toBeGreaterThan(0);
```

**This contradicts the PR requirement** which states:
> "rental_object is the **single source of truth** across the entire stack.
> PR must not merge if any `listing` legacy remains."

---

### 4. Frontend Apps

**STATUS:** ⚠️ NOT AUDITED YET

Based on CLAUDE.md:
- `apps/web` (public web app)
- `apps/backoffice` (admin portal)
- `apps/minside` (user portal)

**Expected issues:**
- Components likely import from SDK (which has both terminologies)
- May use deprecated `useListing*` hooks
- May reference `listingId` in local state

---

### 5. Documentation

**File:** Root `CLAUDE.md`

**STATUS:** ❌ USES "LISTINGS" TERMINOLOGY

```markdown
## Architecture Layers
├─────────────────────────────────────────────┤
│  API (Fastify)                              │
│  - Business logic                           │
│  - Persistence (Drizzle/Postgres)           │
```

**Issues:**
- Module structure examples reference "listings" features
- No mention of "rental_object" as primary terminology
- Authentication flow examples don't specify domain objects

**Apps API CLAUDE.md:**
- References listings in directory structure
- Database schema section shows `listings` table
- Module structure has `modules/listings/` directory

---

## Migration Blockers

### Critical Blockers (Must fix before PR approval)

1. **Database Schema Mismatch**
   - Table is `listings` but code expects `rental_objects`
   - Foreign keys use `listingId` not `rentalObjectId`
   - Drizzle schema exports `listings` not `rentalObjects`

2. **Migration Never Executed**
   - SQL migration file exists but not in Drizzle's system
   - No rollback script
   - No verification that migration can run without data loss

3. **Type System Inconsistency**
   - `Listing` types exported from schema
   - Should be `RentalObject` types
   - Affects all dependent code

4. **API Contracts Broken**
   - Schemas validate `listingId`
   - SDK sends `rentalObjectId` (if following new standard)
   - Mismatch will cause 400 errors

### High Priority (Must fix for production readiness)

1. **Backward Compatibility Strategy Unclear**
   - SDK has deprecated aliases but they'll break when API changes
   - No deprecation warnings in code
   - No timeline for removal

2. **Frontend Apps Not Audited**
   - Unknown how many components use old terminology
   - Unknown how many API calls use `listingId`

3. **Test Coverage**
   - Terminology tests expect both to exist
   - No tests verify migration path
   - No tests verify data integrity after migration

---

## Recommendation

### Option A: Complete the Migration (RECOMMENDED)

**Execute the full migration with these steps:**

1. **Update Database Schema**
   - Integrate migration into Drizzle (`drizzle/0006_rename_to_rental_objects.sql`)
   - Rename table: `listings` → `rental_objects`
   - Rename columns: `listing_id` → `rental_object_id` in all tables
   - Update indexes
   - Update foreign keys

2. **Update Schema Definitions**
   - Change `export const listings` → `export const rentalObjects`
   - Change `type Listing` → `type RentalObject`
   - Remove backward compatibility comments

3. **Update API Layer**
   - Change all schemas to use `rentalObjectId`
   - Update controllers to use `RentalObject` types
   - Update services to use `rentalObjectId`

4. **Remove Deprecated SDK Code**
   - Delete all `useListing*` hooks
   - Delete `ListingService`
   - Update terminology tests to **reject** listing terminology
   - Add deprecation warnings for 1 release cycle, then remove

5. **Update Frontend Apps**
   - Replace all `useListing*` → `useRentalObject*`
   - Update component props to use `rentalObject`
   - Update local state variables

6. **Update Documentation**
   - Replace all "listing" references with "rental object"
   - Update CLAUDE.md files
   - Update API documentation

### Option B: Maintain Backward Compatibility (NOT RECOMMENDED)

Keep both terminologies but:
- Document which is primary
- Add deprecation warnings
- Set removal date
- Risk: Technical debt and confusion

---

## Verification Checklist

Before marking migration as complete:

### Database
- [ ] Table renamed to `rental_objects`
- [ ] All `listing_id` columns renamed to `rental_object_id`
- [ ] Schema exports `rentalObjects` table
- [ ] Types exported as `RentalObject`, `NewRentalObject`
- [ ] Migration tested on staging
- [ ] Rollback script tested

### API
- [ ] All schemas use `rentalObjectId`
- [ ] All endpoints reference `/api/rental-objects`
- [ ] All services use `RentalObject` types
- [ ] All controllers use `RentalObject` types
- [ ] Audit logging uses "rental_object" resource type

### SDK
- [ ] All `Listing*` services removed
- [ ] All `useListing*` hooks removed
- [ ] Terminology tests **reject** listing terminology
- [ ] Query keys use `rental-objects`
- [ ] Types exported as `RentalObject`

### Frontend
- [ ] All components use `useRentalObject*` hooks
- [ ] All props use `rentalObject` naming
- [ ] All state variables use `rentalObject` naming
- [ ] No imports from deprecated SDK exports

### Documentation
- [ ] CLAUDE.md files updated
- [ ] API documentation updated
- [ ] README files updated
- [ ] Migration guide written

### Tests
- [ ] Unit tests use `rentalObject` terminology
- [ ] E2E tests use `rentalObject` terminology
- [ ] Integration tests pass
- [ ] No tests reference `listing` terminology

---

## Impact Analysis

### Breaking Changes

**Database:**
- Table name change
- Column name changes
- All queries must be updated

**API:**
- Request/response DTOs change
- Old clients will break

**SDK:**
- Hook names change
- Service names change
- Breaking change for all consumers

**Estimated Effort:**
- Database: 2-4 hours
- API: 4-8 hours
- SDK: 2-4 hours
- Frontend: 8-16 hours
- Documentation: 2-4 hours
- Testing: 4-8 hours

**Total: 22-44 hours (3-6 developer days)**

---

## Appendix: Files Requiring Updates

### Database Layer (apps/api)
```
src/database/schema/index.ts
src/database/migrations/20260115_rename_listings_to_rental_objects.sql
drizzle/0003_rental_objects_category.sql
drizzle/meta/*.json
scripts/seed.ts
src/modules/rental-objects/rental-object.repository.ts
```

### API Layer (apps/api)
79 files found with "listing" references - Priority files:
```
src/schemas/booking.schema.ts
src/schemas/calendar.schema.ts
src/schemas/index.ts
src/modules/booking/booking.service.ts
src/modules/booking/booking.controller.ts
src/modules/calendar/calendar.service.ts
src/modules/availability/availability.controller.ts
src/modules/public/public.controller.ts
... (73 more files)
```

### Client SDK (packages/client-sdk)
30+ files found with "listing" references - Priority files:
```
src/hooks/query-keys.ts
src/types/index.ts
src/hooks/use-bookings.ts
src/hooks/use-realtime.ts
src/hooks/use-flow-context.ts
src/types/search.ts
src/types/booking.ts
src/services/auth.service.ts
src/realtime/index.ts
... (21 more files)
```

### Frontend Apps
- [ ] apps/web/**
- [ ] apps/backoffice/**
- [ ] apps/minside/**

### Documentation
```
CLAUDE.md
apps/api/CLAUDE.md
packages/client-sdk/CLAUDE.md
docs/PROJECT_STRUCTURE.md
docs/architecture/*
```

---

## Conclusion

**The migration is INCOMPLETE and BLOCKED.** The codebase exists in an inconsistent hybrid state where:

1. The database still uses `listings` table
2. The SDK has parallel implementations (both `Listing` and `RentalObject`)
3. The API layer is mixed with "backward compatibility" workarounds
4. The terminology compliance tests **expect both to coexist**

**The PR comment requires:**
> "rental_object is the **single source of truth**. PR must not merge if any `listing` legacy remains."

**Current state:** ❌ DOES NOT MEET PR REQUIREMENTS

**Recommended action:** Execute complete migration per Option A above.

