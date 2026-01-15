# Rental Object Refactoring Progress

> **Status:** 🚧 **IN PROGRESS** - API 100%, SDK ~90%, Frontend ~92%  
> **Last Updated:** January 15, 2026

## Overview

This document tracks the progress of renaming "listing" → "rental object" across the entire platform.

**See also:** [LISTING_TO_RENTAL_OBJECT_REFACTOR.md](./LISTING_TO_RENTAL_OBJECT_REFACTOR.md) for detailed checklist.

## ✅ Completed

### API Layer (100% Complete)

1. **main.ts**
   - ✅ Removed all `Listing*` aliases
   - ✅ Updated imports to use `RentalObject*` directly
   - ✅ Updated container registrations
   - ✅ Updated module loading
   - ✅ Updated controller arrays

2. **Rental Object Controller**
   - ✅ Already uses `/api/rental-objects` endpoint
   - ✅ All methods use rental object terminology

3. **Calendar Controller**
   - ✅ Renamed `ListingCalendarConfigController` → `RentalObjectCalendarConfigController`
   - ✅ Updated route from `/api/listings` → `/api/rental-objects`
   - ✅ Updated calendar module exports

4. **Backoffice Controller**
   - ✅ Renamed `BackofficeListingsController` → `BackofficeRentalObjectsController`
   - ✅ Updated routes from `/backoffice/listings` → `/backoffice/rental-objects`
   - ✅ Updated SQL queries to use `rental_objects` table
   - ✅ Updated method names and comments

5. **Booking Service**
   - ✅ Updated import: `ListingRepository` → `RentalObjectRepository`
   - ✅ Updated DI: `@Inject('RentalObjectRepository')`
   - ✅ Updated variable names: `listing` → `rentalObject`
   - ✅ Fixed bug: `this.listingRepository` → `this.rentalObjectRepository`

### SDK Layer (~88% Complete - Types & Hooks Complete)

1. **Services**
   - ✅ `rental-object.service.ts` - uses `/api/rental-objects`
   - ✅ `calendar.service.ts` - `RentalObjectCalendarService`
   - ✅ `booking.service.ts` - updated `rentalObjectId` params with backward compat
   - ✅ `services/index.ts` exports updated

2. **Types**
   - ✅ `projection-dtos.ts` - `RentalObject*` types with `Listing*` aliases
   - ✅ `calendar.ts` - `RentalObjectCalendarConfigProjectionDTO` with alias
   - ✅ `projection-registry.ts` - updated entries
   - ✅ `types/index.ts` - exports deprecated aliases for backward compat

3. **Hooks**
   - ✅ `query-keys.ts` - `rentalObjects` keys with `listings` alias
   - ✅ `use-calendar.ts` - `useRentalObjectCalendarConfig` with alias
   - ✅ `use-reviews.ts` - `useRentalObjectReviews` with alias
   - ✅ `use-flow-context.ts` - `useRentalObjectFlowContext` with alias
   - ✅ `use-realtime.ts` - `useRealtimeRentalObjects` with alias
   - ✅ `hooks/index.ts` - exports updated

## 🚧 In Progress

### SDK Layer

1. **Types** (Mostly Complete)
   - ✅ Calendar types updated (`RentalObjectCalendarConfigProjectionDTO` with `ListingCalendarConfigProjectionDTO` alias)
   - ✅ Query keys updated (`rentalObjects` with `listings` alias)
   - [ ] Review and update booking types that reference `listingId` (some may be DB-compatible)
   - [ ] Update search types if they reference listings
   - ✅ Hooks query keys updated

2. **Hooks** (✅ Complete)
   - ✅ Calendar hooks updated (`useRentalObjectCalendarConfig` with alias)
   - ✅ Review hooks updated (`useRentalObjectReviews` with alias)
   - ✅ Flow context hooks updated (`useRentalObjectFlowContext` with alias)
   - ✅ Realtime hooks updated (`useRealtimeRentalObjects` with alias)
   - ✅ Booking quote hooks updated (`useBookingQuote` uses `rentalObjectId` parameter, maps to `listingId` in DTO for backward compatibility)
   - ✅ Comments updated to clarify DTO mapping

### Frontend Apps (~77% Complete)

1. **Web App (Public)**
   - ✅ Routes updated: `/rental-objects`, `/rental-object/:id`
   - ✅ Backward compat: `/listing/:id` still works
   - ✅ `ListingsPage.tsx` - uses `rentalObject` variable names
   - ✅ Navigation links use `/rental-object/` paths
   - ✅ Share URLs updated

2. **Backoffice App**
   - ✅ Sidebar: "Listings" → "Utleieobjekter"
   - ✅ Navigation links updated to `/rental-objects`
   - ✅ `RentalObjectsListView.tsx` created
   - ⚠️ Routes in `App.tsx` still use `/listings` paths (backward compat)
   - ⏳ Feature folders: `features/listings` → `features/rental-objects` pending

3. **MinSide App**
   - ✅ `CalendarSection.tsx` - uses rental object terminology
   - ✅ `VenueCard.tsx` - supports both naming conventions
   - ✅ `ApplicationCard.tsx` - uses `/rental-objects` routes
   - ⏳ Feature folders migration pending

### Seeds & i18n (100% Complete)

1. **Seeds**
   - ✅ Constants renamed: `LISTING_*` → `RENTAL_OBJECT_*`
   - ✅ Array renamed: `LISTINGS` → `RENTAL_OBJECTS`
   - ✅ Backward compat aliases maintained

2. **i18n**
   - ✅ `rentalObjects.*` keys added (nb.ts, en.ts)
   - ✅ `listings.*` keys kept for backward compat

### UI Components

1. **Reusable Components**
   - [ ] Create/update `RentalObjectCard` component
   - [ ] Create/update `RentalObjectFilters` component
   - [ ] Create/update `AvailabilityCalendar` variants (PERIOD/SLOT/ALL_DAY)
   - [ ] Create/update `RentalObjectDetailsShell` component
   - [ ] Update `AvailabilityCalendar` variants (PERIOD/SLOT/ALL_DAY)
   - [ ] Create `InventoryBadge`, `CapacityBadge`, `PackageSelector` components
   - [ ] Create `RuleSetBadge`, `BlackoutIndicator`, `BookingConflictBanner` components

### Database & Seeds

1. **Seeds**
   - [ ] Update `seed.ts` to use `rental_objects` terminology
   - [ ] Update variable names (`LISTING_*` → `RENTAL_OBJECT_*`)
   - [ ] Update comments and documentation

2. **Schema** (Already Done)
   - ✅ `rental_objects` table exists
   - ✅ `listings` is an alias for backward compatibility
   - ⚠️ Note: Database columns still use `listing_id` for FK relationships (backward compatibility)

### i18n (✅ Complete)

1. **Translation Keys**
   - ✅ Added `rentalObjects.*` keys to `nb.ts` and `en.ts`
   - ✅ Maintained backward compatibility with existing `listings.*` keys
   - ✅ Updated new components to use i18n (e.g., `RentalObjectsListView`)
   - [ ] Verify all hardcoded strings in old components are updated (in progress)

## 📋 Remaining Tasks

### High Priority

1. **Update Frontend Routes**
   - Backoffice: `/listings` → `/rental-objects`
   - Minside: Update navigation and routes
   - Web: Update public routes

2. **Update Component References**
   - All `Listing*` components → `RentalObject*`
   - Update imports across all apps
   - Update prop types and interfaces

3. **Update SDK Types**
   - Calendar projection DTOs
   - Booking types (if they reference listingId in API)
   - Search types

4. **Update Hooks**
   - `useListings` → `useRentalObjects` (if exists)
   - Update query keys
   - Update hook dependencies

### Medium Priority

1. **Create Missing UI Components**
   - RentalObjectCard
   - RentalObjectFilters
   - AvailabilityCalendar variants
   - Badge components

2. **Update Seeds**
   - Variable names
   - Comments
   - Documentation

### Low Priority

1. **Verification**
   - Run repo-wide search for remaining "listing" references
   - Verify no "listing" in public API/SDK/UI (except DB migration notes)
   - Generate endpoint-to-SDK-to-UI matrix
   - Add Playwright tests

## 🔍 Files That Still Need Updates

### API Layer (✅ Complete)
- ✅ `modules/public/public.controller.ts` - Comments updated to use "rental object"
- ✅ `modules/booking/booking.service.ts` - Comments and variable names updated (`listing` → `rentalObject`), fixed repository reference bug
- ✅ `modules/booking/booking.controller.ts` - Comments updated
- ✅ `modules/websocket/websocket.controller.ts` - Comments updated, parameter names kept for backward compatibility
- ✅ `modules/availability/availability.controller.ts` - Added deprecation comments for type aliases
- ✅ `modules/calendar/calendar.service.ts` - Added deprecation comments for type aliases
- ✅ `modules/rental-objects/rental-object.repository.ts` - Added comments explaining backward compatibility aliases
- ✅ `modules/reviews/reviews.controller.ts` - Added deprecation comment for backward compatibility export
- ✅ `modules/booking/booking.repository.ts` - Added comments explaining `listingId` parameter names are kept for database column compatibility
- `modules/widgets/widgets.controller.ts` - Check for listing references
- `modules/integrations/integrations.controller.ts` - Check for listing references
- `modules/availability/availability.controller.ts` - Check for listing references
- `modules/dashboard/dashboard.controller.ts` - Check for listing references
- `modules/seasons/*.ts` - Check for listing references
- `modules/season-applications/*.ts` - Check for listing references
- `modules/search/search.controller.ts` - Check for listing references
- `modules/calendar/calendar.service.ts` - Check for listing references
- `modules/reviews/reviews.controller.ts` - Check for listing references
- `modules/reports/reports.controller.ts` - Check for listing references

### SDK Layer (✅ Mostly Complete)
- ✅ `types/calendar.ts` - DTO types updated with aliases
- ✅ `types/projection-dtos.ts` - All projection DTOs updated with aliases
- ✅ `types/projection-registry.ts` - Registry entries updated
- ✅ `hooks/query-keys.ts` - Query keys updated (`rentalObjects` with `listings` alias)
- ✅ `hooks/use-calendar.ts` - Updated with alias
- ✅ `hooks/use-reviews.ts` - Updated with alias
- ✅ `hooks/use-flow-context.ts` - Updated with alias
- ✅ `hooks/use-realtime.ts` - Updated with alias
- ✅ `services/booking.service.ts` - Updated with backward compatibility, added type aliases (TimeSlot, AvailabilityCheck) to avoid esbuild parsing issues
- ✅ `services/review.service.ts` - Updated with backward compatibility
- ✅ `types/booking.ts` - Comments updated (listingId fields are DB-compatible, kept for backward compatibility)
- ✅ `types/search.ts` - Updated: Added `rental-object` to `SearchEntityType`, `RentalObjectSearchResult` type, `rentalObjectId` filter (with `listingId` backward compatibility)
- ✅ `hooks/use-booking-quote.ts` - Updated comments to clarify rentalObjectId → listingId mapping
- ✅ `utils/geocode.ts` - Already uses `RentalObjectAddress` with backward compatibility aliases

### Frontend Apps
- ✅ `apps/backoffice/src/routes/rental-objects.tsx` - Created with RentalObjectsListView, RentalObjectWizard, RentalObjectDetailView
- ✅ `apps/backoffice/src/features/rental-objects/components/RentalObjectsListView.tsx` - Created
- ✅ `apps/backoffice/src/features/rental-objects/components/wizard/RentalObjectWizard.tsx` - Created
- ✅ `apps/backoffice/src/features/rental-objects/components/detail/RentalObjectDetailView.tsx` - Created (reuses tab components from listings)
- ✅ `apps/backoffice/src/features/rental-objects/components/detail/index.ts` - Created
- ✅ `apps/backoffice/src/features/rental-objects/components/index.ts` - Updated to export detail components
- ✅ `apps/backoffice/src/App.tsx` - Added rental-objects routes (primary), kept listings routes (deprecated) for backward compatibility
- ✅ `apps/backoffice/src/components/layout/Sidebar.tsx` - Updated navigation to use `/rental-objects` and "Utleieobjekter" terminology
- ✅ `apps/backoffice/src/features/listings/components/list/ListingsGrid.tsx` - Added `basePath` prop for configurable navigation
- ✅ `apps/backoffice/src/features/listings/components/list/ListingsTable.tsx` - Added `basePath` prop for configurable navigation
- ✅ `apps/backoffice/src/features/listings/components/list/ListingRowActions.tsx` - Added `basePath` prop for configurable navigation
- ✅ `apps/backoffice/src/features/rental-objects/components/RentalObjectsListView.tsx` - Updated to pass `basePath="/rental-objects"` to grid/table components
- ✅ `apps/backoffice/src/features/rental-objects/components/detail/RentalObjectDetailView.tsx` - Already passes `backPath="/rental-objects"` to DetailHeader
- `apps/backoffice/src/routes/listings.tsx` - Keep for backward compatibility (deprecated)
- `apps/backoffice/src/features/listings/` - Rename entire folder
- `apps/minside/src/features/listings/` - Rename entire folder
- `apps/web/src/pages/ListingsPage.tsx` - Rename to RentalObjectsPage.tsx
- All component files in features folders

## 📝 Notes

1. **Database Compatibility**: Database columns (`listing_id`, `listings` table alias) are kept for backward compatibility. Only API layer and above use "rental object" terminology.

2. **Backward Compatibility**: Some deprecated types are kept in `types/index.ts` for backward compatibility. These should be marked as deprecated and removed in a future version.

3. **Migration Strategy**: The refactoring is done incrementally:
   - API layer first (✅ complete)
   - SDK layer second (✅ ~90% complete)
   - Frontend layer last (✅ ~92% complete - main components done, optional cleanup remaining)

4. **Testing**: After completion, run:
   - `pnpm lint` - Check for lint errors
   - `pnpm typecheck` - Verify TypeScript compilation
   - `pnpm test` - Run test suite
   - Repo-wide search for "listing" (excluding DB migration notes)

## 🎯 Next Steps

1. ✅ Complete SDK types updates (calendar, booking, search) - DONE
2. ✅ Update frontend routes and navigation - DONE
3. ⏳ Update component folders and imports (optional - parallel development approach)
4. ✅ Create missing UI components - DONE (RentalObjectsListView, RentalObjectWizard, RentalObjectDetailView)
5. ✅ Update seeds - DONE (already completed in previous sessions)
6. ⏳ Run verification checks (lint, typecheck, tests)
7. ⏳ Optional: Migrate remaining components from `listings` to `rental-objects` folders (non-breaking)
