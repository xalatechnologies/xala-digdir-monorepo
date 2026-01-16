# Rental Object Migration - Progress Report
**Date:** 2026-01-16 **Status:** 🟡 IN PROGRESS (Database & API Complete)

---

## ✅ COMPLETED WORK

### 1. Database Layer (100% Complete)

#### Schema Definition Updated
**File:** `apps/api/src/database/schema/index.ts`

✅ **Changes:**
- Renamed `export const listings` → `export const rentalObjects`
- Updated table name: `pgTable('listings')` → `pgTable('rental_objects')`
- Updated type exports: `Listing` → `RentalObject`, `NewListing` → `NewRentalObject`
- Updated all indexes: `listings_*_idx` → `rental_objects_*_idx`

#### Foreign Key Updates
✅ **All dependent tables updated:**
- `bookings.listingId` → `bookings.rentalObjectId`
- `allocations.listingId` → `allocations.rentalObjectId`
- `seasonalLeases.listingId` → `seasonalLeases.rentalObjectId`

✅ **All indexes updated:**
- `bookings_listing_idx` → `bookings_rental_object_idx`
- `allocations_listing_idx` → `allocations_rental_object_idx`
- `seasonal_leases_listing_idx` → `seasonal_leases_rental_object_idx`

#### Migration File Created
**File:** `apps/api/drizzle/0006_rename_listings_to_rental_objects.sql`

✅ **Comprehensive migration script:**
- Renames table `listings` → `rental_objects`
- Renames all indexes
- Renames all foreign key columns
- Updates foreign key constraints
- Adds documentation comment

**Status:** Ready to execute with `pnpm db:migrate`

### 2. Repository Layer (100% Complete)

**File:** `apps/api/src/modules/rental-objects/rental-object.repository.ts`

✅ **Changes:**
- Import updated: `rentalObjects` from schema
- Type updated: `RentalObject`, `NewRentalObject`
- Constructor uses `rentalObjects` table
- All method return types updated to `RentalObject`
- Removed "backward compatibility" comments

### 3. API Validation Schemas (100% Complete)

#### Booking Schema
**File:** `apps/api/src/schemas/booking.schema.ts`

✅ **All schemas updated:**
- `BookingSchema.rentalObjectId` (line 19)
- `CreateBookingSchema.rentalObjectId` (line 42)
- `BookingQuerySchema.rentalObjectId` (line 82)
- `CalendarEventSchema.rentalObjectId` (line 98)
- `BookingSelectionSchema.rentalObjectId` (line 187+)
- `RecurringPreviewRequestSchema` references updated
- `BookingQuoteProjectionSchema.rentalObjectId` (line 420)

**Total:** 15+ schema updates

#### Calendar Schema
**File:** `apps/api/src/schemas/calendar.schema.ts`

✅ All `listingId` references replaced with `rentalObjectId`

### 4. Seed Data (100% Complete)

**File:** `apps/api/scripts/seed.ts`

✅ **Changes:**
- Array renamed: `LISTINGS` → `RENTAL_OBJECTS`
- Removed deprecated `LISTING_IDS` constant
- Updated booking generation: `listingId:` → `rentalObjectId:`
- Updated allocations generation: `booking.listingId` → `booking.rentalObjectId`
- Updated schema references: `schema.listings` → `schema.rentalObjects`
- **Result:** 100% of seed data now uses `rental_object` terminology

### 5. API Services & Controllers (100% Complete - 32 files)

✅ **Modules updated:**
- ✅ `booking/` - booking.repository.ts, booking.service.ts, booking.controller.ts
- ✅ `calendar/` - calendar.service.ts, calendar.controller.ts
- ✅ `availability/` - availability.controller.ts
- ✅ `allocations/` - allocations.controller.ts
- ✅ `seasonal-lease/` - seasonal-lease.controller.ts
- ✅ `seasons/` - All files
- ✅ `season-applications/` - All files
- ✅ `public/` - public.controller.ts
- ✅ `search/` - search.controller.ts
- ✅ `dashboard/` - dashboard.controller.ts
- ✅ `backoffice/` - backoffice.controller.ts
- ✅ `pricing/` - pricing.service.ts, pricing.controller.ts
- ✅ `reviews/` - reviews.controller.ts
- ✅ `widgets/` - widgets.controller.ts
- ✅ `notifications/` - All files
- ✅ `notification-system/` - All files
- ✅ `authz/` - authz.controller.ts
- ✅ `integrations/` - integrations.controller.ts
- ✅ `help/` - help.controller.ts
- ✅ `reports/` - reports.controller.ts
- ✅ `share/` - share.controller.ts
- ✅ `blocks/` - blocks.controller.ts
- ✅ `discount-codes/` - discount-codes.controller.ts
- ✅ `websocket/` - websocket.controller.ts

**Pattern replaced across all files:**
- `listingId:` → `rentalObjectId:`
- `listingId,` → `rentalObjectId,`
- `listingId\b` → `rentalObjectId`
- `listing_id` → `rental_object_id`

---

## 🟡 REMAINING WORK

### 6. Client SDK (packages/client-sdk)

**Status:** NOT STARTED
**Estimated files:** 30+ files

**Required changes:**
1. Remove ALL deprecated `useListing*` hooks
2. Remove `ListingService` class
3. Update query keys: `listing-*` → `rental-object-*`
4. Update type exports
5. Update realtime event handlers
6. Update flow context utilities

**Critical files:**
- `src/hooks/index.ts` - Remove deprecated hook exports
- `src/services/index.ts` - Remove deprecated service exports
- `src/types/index.ts` - Update type exports
- `src/hooks/query-keys.ts` - Update query key factories
- `src/realtime/index.ts` - Update event types

### 7. Frontend Apps

**Status:** NOT AUDITED/NOT STARTED

#### apps/web (Public Web App)
**Estimated impact:** HIGH
- Components likely use SDK hooks
- May have `useListing*` imports
- May have local state with `listing` variables

#### apps/backoffice (Admin Portal)
**Estimated impact:** VERY HIGH
- Heavy use of rental object management
- Likely many components with `listing` references
- Forms, tables, filters all need updates

#### apps/minside (User Portal)
**Estimated impact:** MEDIUM
- Booking views reference rental objects
- Probably fewer direct manipulations than backoffice

**Strategy:**
1. Search for all `useListing` imports
2. Replace with `useRentalObject` equivalents
3. Update component props: `listing` → `rentalObject`
4. Update local state variables
5. Update TypeScript types

### 8. Tests

**Status:** NOT STARTED
**Estimated files:** Unknown

**Required updates:**
- Unit tests: Update mock data, assertions
- E2E tests: Update selectors, expected values
- Integration tests: Update API contracts
- Terminology compliance tests: **REJECT** `listing` terminology

**Critical:**
- Update `packages/client-sdk/src/__tests__/terminology-compliance.test.ts`
- Change expectation from "both coexist" to "only rental_object allowed"

### 9. Documentation

**Status:** NOT STARTED

**Files to update:**
- `CLAUDE.md` (root)
- `apps/api/CLAUDE.md`
- `packages/client-sdk/CLAUDE.md`
- `docs/PROJECT_STRUCTURE.md`
- `docs/architecture/*.md`
- All README files

**Search pattern:** Any reference to "listing" should be replaced with "rental object"

---

## 📊 Migration Statistics

### Completed
- ✅ Database schema: 1 table renamed
- ✅ Foreign keys: 3 columns renamed
- ✅ Indexes: 10+ indexes renamed
- ✅ Type exports: 2 types renamed
- ✅ Repository: 1 file updated
- ✅ API schemas: 2 files updated
- ✅ Seed data: 1 file updated
- ✅ API modules: 32 files updated
- ✅ Migration SQL: 1 file created

**Total API layer changes: 40+ files**

### Remaining
- 🟡 SDK: ~30 files
- 🟡 Frontend apps: Unknown (needs audit)
- 🟡 Tests: Unknown
- 🟡 Documentation: ~10+ files

**Estimated remaining: 50-100 files**

---

## 🚨 Breaking Changes

### Database Migration
**Impact:** CRITICAL - Requires database downtime

**Steps to deploy:**
1. Backup production database
2. Run migration: `pnpm db:migrate`
3. Verify tables renamed
4. Verify foreign keys updated
5. Run seed (if dev/staging): `pnpm db:seed`

**Rollback strategy:**
- Reverse migration script needed
- Rename `rental_objects` back to `listings`
- Rename columns back

### API Changes
**Impact:** ALL API responses change

**Breaking for:**
- Any external API consumers
- Frontend apps using old SDK
- Third-party integrations

**Mitigation:**
- Deploy API + Frontend simultaneously
- Update SDK before deploying frontend
- Notify any external API consumers

### SDK Changes
**Impact:** Breaking change for all SDK consumers

**Breaking exports:**
- ❌ Removed: `useListing`, `useListings`, `useCreateListing`, etc.
- ✅ Use instead: `useRentalObject`, `useRentalObjects`, `useCreateRentalObject`

**Migration path for consumers:**
```tsx
// Before
import { useListing } from '@digilist/client-sdk/hooks';
const { data } = useListing(id);

// After
import { useRentalObject } from '@digilist/client-sdk/hooks';
const { data } = useRentalObject(id);
```

---

## ✅ Verification Checklist

### Before Deployment
- [x] Database schema updated in code
- [x] Migration SQL script created
- [ ] Migration tested on dev database
- [ ] Migration tested on staging database
- [x] All API schemas updated
- [x] All API services updated
- [x] Seed data updated
- [ ] SDK updated
- [ ] Frontend apps updated
- [ ] Tests updated
- [ ] Tests passing
- [ ] Documentation updated

### Deployment Steps
1. [ ] Backup production database
2. [ ] Deploy API with migration
3. [ ] Run migration on production
4. [ ] Verify migration success
5. [ ] Deploy updated SDK (publish new version)
6. [ ] Deploy frontend apps
7. [ ] Smoke test production
8. [ ] Monitor error logs

---

## 📝 Next Steps

### Immediate (Continue Migration)
1. **SDK Layer**: Remove all deprecated `useListing*` hooks and services
2. **Frontend Audit**: Search all apps for `listing` references
3. **Frontend Updates**: Systematic replacement in each app
4. **Test Updates**: Update all test files
5. **Documentation**: Update all markdown files

### Before Deployment
1. **Test Migration**: Run on dev database and verify
2. **Run Tests**: Ensure all tests pass with new terminology
3. **Code Review**: Review all changes
4. **Staging Deploy**: Test full deployment flow

### Post-Deployment
1. **Monitor**: Watch error logs for any missed references
2. **Performance**: Verify no performance degradation
3. **Data Integrity**: Spot check rental object data
4. **User Acceptance**: Test booking flows end-to-end

---

## 🎯 Completion Estimate

### Current Progress: ~40%

**Time Invested:** 2-3 hours
**Time Remaining:** 3-5 hours

**Breakdown:**
- ✅ Database & API: 2-3 hours (DONE)
- 🟡 SDK: 1-2 hours (TODO)
- 🟡 Frontend: 2-3 hours (TODO)
- 🟡 Tests & Docs: 1-2 hours (TODO)

**Total Estimate:** 6-10 hours (matching original estimate)

---

## ⚠️ Risks & Mitigations

### Risk 1: Missed References
**Impact:** Runtime errors in production
**Mitigation:**
- Run comprehensive grep searches
- Update terminology compliance tests to REJECT `listing`
- Thorough QA testing

### Risk 2: Data Migration Failure
**Impact:** Database corruption
**Mitigation:**
- Test migration on copy of production data
- Have verified rollback script
- Database backup before migration

### Risk 3: Frontend Breaking
**Impact:** Users cannot access app
**Mitigation:**
- Deploy API + Frontend together
- Staging environment testing first
- Feature flag for gradual rollout (if needed)

### Risk 4: Third-party Integration Breaks
**Impact:** External systems fail
**Mitigation:**
- Audit all integration points
- Notify partners of breaking change
- Provide migration guide

---

## 📞 Support

**Migration executed by:** Claude Code Audit System
**Date started:** 2026-01-16
**Status:** Database & API layer complete, SDK/Frontend pending

**For questions:**
- Review this document
- Check `docs/RENTAL_OBJECT_MIGRATION_AUDIT.md` for original findings
- Run `grep -r "listing" .` to find remaining references

