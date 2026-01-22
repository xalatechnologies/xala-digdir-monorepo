# Booking Process Audit Summary

**Date:** 2026-01-19  
**Status:** Comprehensive Audit Complete  
**Author:** AI Agent

---

## Executive Summary

This audit documents the **complete booking system implementation** across all layers of the Digilist platform: database schema, API endpoints, client SDK, and UI applications (Web, Backoffice, MinSide). 

### Overall Assessment: 🟡 **Good with Gaps**

The booking system has **solid foundations** with comprehensive schema definitions and most core functionality implemented. However, there are **contract inconsistencies** between layers and **incomplete UI implementations** for certain booking modes.

---

## 1. Database Layer

### 1.1 Core Tables

| Schema | Table | Purpose | Status |
|--------|-------|---------|--------|
| `domain` | `bookings` | Core booking records | ✅ Complete |
| `domain` | `rental_objects` | Bookable entities (utleieobjekter) | ✅ Complete |
| `domain` | `allocations` | Calendar blocks (confirmed bookings, blocks) | ✅ Complete |
| `domain` | `blocks` | Explicit blackouts/maintenance periods | ✅ Complete |
| `domain` | `seasonal_leases` | Long-term seasonal allocations | ✅ Complete |
| `platform` | `blackouts` | Holiday/blackout periods | ✅ Complete |

### 1.2 Bookings Table Schema

**Location:** `packages/database-schema/src/domain/bookings.ts`

```typescript
bookings = domainSchema.table('bookings', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  rentalObjectId: uuid('rental_object_id').notNull(),
  userId: uuid('user_id').notNull(),
  organizationId: uuid('organization_id').nullable(),
  status: varchar('status', { length: 50 }).default('pending'),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }),
  currency: varchar('currency', { length: 3 }).default('NOK'),
  notes: text('notes'),
  metadata: jsonb('metadata').default({}),
  version: integer('version').default(1),
  submittedAt: timestamp('submitted_at'),
  approvedBy: uuid('approved_by'),
  approvedAt: timestamp('approved_at'),
  rejectionReason: text('rejection_reason'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
```

**Indexes:**
- ✅ `tenant_idx` on `tenantId`
- ✅ `rental_object_idx` on `rentalObjectId`
- ✅ `user_idx` on `userId`
- ✅ `status_idx` on `status`
- ✅ `organization_idx` on `organizationId`
- ✅ `approval_queue_idx` on `tenantId, status, startTime`
- ✅ `time_range_idx` on `rentalObjectId, startTime, endTime`

### 1.3 Rental Objects Table Schema

**Location:** `packages/database-schema/src/domain/rental-objects.ts`

Key fields for booking behavior:
- `categoryKey`: Determines booking rules
- `timeMode`: `PERIOD`, `SLOT`, `ALL_DAY`
- `requiresApproval`: Boolean flag for approval workflow
- `features`: JSONB with booking features configuration
- `ruleSetKey`: Reference to booking rule configuration

---

## 2. API Layer

### 2.1 Booking Endpoints

**Controller:** `apps/api/src/modules/booking/booking.controller.ts`

| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| GET | `/api/bookings` | List bookings with filters | ✅ |
| GET | `/api/bookings/:id` | Get single booking | ✅ |
| POST | `/api/bookings` | Create booking | ✅ |
| PUT | `/api/bookings/:id` | Update booking | ✅ |
| POST | `/api/bookings/:id/confirm` | Confirm booking | ✅ |
| POST | `/api/bookings/:id/cancel` | Cancel booking | ✅ |
| POST | `/api/bookings/:id/complete` | Mark completed | ✅ |
| POST | `/api/bookings/:id/submit` | Submit for approval | ✅ |
| POST | `/api/bookings/:id/approve` | Approve booking | ✅ |
| POST | `/api/bookings/:id/deny` | Deny booking | ✅ |
| GET | `/api/bookings/my` | Current user's bookings | ✅ |
| GET | `/api/bookings/pricing` | Calculate pricing | ✅ |
| GET | `/api/bookings/:id/receipt` | Get booking receipt | ✅ |
| GET | `/api/bookings/recurring` | List recurring bookings | ✅ |
| POST | `/api/bookings/recurring` | Create recurring booking | ✅ |
| POST | `/api/bookings/recurring/preview` | Preview recurring with conflicts | ✅ |

**Deprecated/Duplicate Endpoints:**
- ⚠️ `PUT /api/bookings/:id/approve` (use POST instead)
- ⚠️ `PUT /api/bookings/:id/reject` (use POST `/deny` instead)

### 2.2 Calendar Endpoints

**Controllers:** `apps/api/src/modules/calendar/calendar.controller.ts`, `availability.controller.ts`

| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| GET | `/api/rental-objects/:id/calendar-config` | Calendar configuration | ✅ |
| GET | `/api/availability/:rentalObjectId` | Availability matrix | ✅ |
| GET | `/api/calendar` | Calendar events | ✅ |
| GET | `/api/calendar/events` | Calendar events (alias) | ✅ |
| GET | `/api/calendar/availability` | Legacy availability | ✅ |
| POST | `/api/calendar` | Create allocation | ✅ |

### 2.3 Rental Object Endpoints

**Controller:** `apps/api/src/modules/rental-objects/rental-object.controller.ts`

| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| GET | `/api/rental-objects/:id` | Get rental object details | ✅ |
| GET | `/api/rental-objects/:id/availability` | Get availability | ✅ |
| GET | `/api/rental-objects/:id/calendar-config` | Calendar config | ✅ |
| GET | `/api/rental-objects/:id/booking-policy` | Booking rules | ✅ |
| GET | `/api/rental-objects/:id/tabs` | Tab configuration | ✅ |

---

## 3. Client SDK

### 3.1 Services

**Location:** `packages/client-sdk/src/services/`

| Service | Methods | Status |
|---------|---------|--------|
| `booking.service.ts` | CRUD, approve, reject, cancel, recurring | ✅ |
| `calendar.service.ts` | getConfig, getAvailabilityMatrix | ✅ |
| `rental-object.service.ts` | CRUD, availability, stats | ✅ |
| `allocation.service.ts` | Calendar block management | ✅ |
| `blocks.service.ts` | Blackout management | ✅ |

### 3.2 Types

**Location:** `packages/client-sdk/src/types/`

| Type File | Key Types | Status |
|-----------|-----------|--------|
| `booking.ts` | `Booking`, `BookingMode`, `RecurringPreviewProjectionDTO`, `BookingQuoteProjectionDTO` | ✅ |
| `calendar.ts` | `SlotStatus`, `AvailabilityCellDTO`, `RentalObjectCalendarConfigProjectionDTO` | ✅ |
| `rental-object.ts` | `RentalObject`, `RentalObjectCategory`, `BookingTimeMode` | ✅ |

### 3.3 Hooks

**Location:** `packages/client-sdk/src/hooks/`

| Hook | Purpose | Status |
|------|---------|--------|
| `use-bookings.ts` | Booking CRUD operations | ✅ |
| `use-booking-contracts.ts` | Contract-based booking operations | ✅ |
| `use-calendar.ts` | Calendar events | ✅ |
| `use-calendar-contracts.ts` | Contract-based calendar | ✅ |
| `use-rental-object-calendar.ts` | Rental object calendar config | ✅ |
| `use-rental-objects.ts` | Rental object operations | ✅ |

---

## 4. UI Applications

### 4.1 Public Web (apps/web)

**Detail Page:** `apps/web/src/pages/RentalObjectDetailPage.tsx`

| Component | Purpose | Status |
|-----------|---------|--------|
| `RentalObjectDetailsLayout.tsx` | Tab-based layout | ✅ |
| `BookingWidgetPlacement.tsx` | Full booking flow widget | ✅ |
| `BookingModeSelector.tsx` | Mode selection UI | ✅ |
| `BookingDialog.tsx` | Slot confirmation drawer | ✅ |
| `RecurringBuilder.tsx` | Recurring pattern builder | ✅ |
| `RecurringPreview.tsx` | Preview with conflicts | ✅ |
| `CalendarSection.tsx` | Read-only calendar preview | ✅ |
| `RentalObjectAvailabilityCalendar.tsx` | Interactive calendar | ✅ |

**Booking Flow Status:**
- ✅ SINGLE_SLOT mode: Fully implemented
- ✅ RECURRING mode: Fully implemented with conflict detection
- ⚠️ RANGE mode: Calendar exists but widget not connected
- ⚠️ ALL_DAY mode: Calendar exists but widget not connected
- ⚠️ IN_GAME mode: Partially implemented
- ✅ SEASON_RENTAL: Redirects to MinSide

### 4.2 Backoffice (apps/backoffice)

**Bookings Management:** `apps/backoffice/src/routes/bookings.tsx`

| Feature | Status |
|---------|--------|
| Booking list with filters | ✅ |
| Status tabs (all, pending, confirmed, etc.) | ✅ |
| Approve/Reject actions | ✅ |
| Cancel action | ✅ |
| Bulk operations | ✅ |
| Search and sort | ✅ |
| Export functionality | ✅ |

**Rental Object Management:**
- `RentalObjectWizard.tsx` - creation wizard
- `BookingSettingsStep.tsx` - booking configuration (requiresApproval, time modes)
- `AvailabilityStep.tsx` - availability configuration
- `RentalObjectBookingsTab.tsx` - booking history per object
- `RentalObjectAvailabilityTab.tsx` - calendar management

### 4.3 MinSide (apps/minside)

**User Bookings:** `apps/minside/src/routes/bookings.tsx`

| Feature | Status |
|---------|--------|
| My bookings list | ✅ |
| Status filtering | ✅ |
| Cancel action | ✅ |
| Offline support (IndexedDB) | ✅ |
| Mobile-responsive layout | ✅ |

**Organization Bookings:** `apps/minside/src/routes/org/bookings.tsx`
- Organization context bookings | ✅

---

## 5. Status Enum Analysis

### 5.1 Canonical Status Values (from state-machine.md)

```typescript
type BookingStatus =
  | 'pending'           // Initial draft/hold
  | 'pending_approval'  // Submitted, awaiting decision
  | 'approved'          // Approved by caseworker
  | 'confirmed'         // Confirmed booking
  | 'rejected'          // Rejected with reason
  | 'cancelled'         // Cancelled by user/admin
  | 'completed'         // Booking fulfilled
  | 'expired';          // Reservation expired
```

### 5.2 Layer Comparison

| Status | DB | API Schema | SDK Types | Contracts | Notes |
|--------|-----|------------|-----------|-----------|-------|
| `pending` | ✅ | ✅ | ✅ | ✅ | |
| `pending_approval` | ✅ | ✅ | ⚠️ Added in schema | ⚠️ | |
| `approved` | ✅ | ✅ | ⚠️ Missing | ❌ | SDK gap |
| `confirmed` | ✅ | ✅ | ✅ | ✅ | |
| `rejected` | ✅ | ⚠️ Uses `denied` | ❌ | ✅ | Terminology mismatch |
| `cancelled` | ✅ | ✅ | ✅ | ✅ | |
| `completed` | ✅ | ✅ | ✅ | ✅ | |
| `expired` | ✅ | ✅ | ❌ | ❌ | Missing |

---

## 6. What Exists ✅

### Database
- [x] Booking table with all approval fields (approvedBy, approvedAt, rejectionReason)
- [x] Rental objects with booking configuration (timeMode, requiresApproval, features)
- [x] Allocations table for calendar blocks
- [x] Blocks table for explicit blackouts
- [x] Proper indexes for performance

### API
- [x] Full CRUD for bookings
- [x] State transitions (submit, approve, reject, confirm, cancel, complete)
- [x] Recurring booking preview and creation
- [x] Calendar configuration endpoint
- [x] Availability matrix endpoint
- [x] Booking quote/pricing endpoint

### Client SDK
- [x] All booking service methods
- [x] React Query hooks for all operations
- [x] Calendar and availability types
- [x] Recurring booking types

### Web UI
- [x] Rental object detail page with tabs
- [x] BookingWidgetPlacement with full flow
- [x] Time slot calendar (weekly view)
- [x] Recurring booking builder with conflict detection
- [x] Booking dialog/drawer

### Backoffice
- [x] Bookings list page with filters
- [x] Approve/reject functionality
- [x] Rental object wizard with booking settings
- [x] Calendar management

### MinSide
- [x] My bookings page
- [x] Organization bookings page
- [x] Cancel functionality
- [x] Offline support

---

## 7. Partially Implemented ⚠️

### Booking Modes
- **IN_GAME mode**: Mode selector exists but no dedicated UI flow
- **RANGE mode**: Calendar supports MULTI_DAY but booking widget not connected
- **ALL_DAY mode**: Calendar supports it but booking widget not connected

### Calendar Views
- **Month overview**: Exists in `RentalObjectAvailabilityCalendar` but not used in booking flow
- **Recurring calendar**: Uses same calendar, could benefit from specialized view

### Status Handling
- SDK types missing `approved`, `pending_approval`, `expired` statuses
- Inconsistent terminology: `denied` vs `rejected`

### Conflict Detection
- Exists for recurring bookings
- Not integrated into single-slot drawer

---

## 8. Missing ❌

### API Level
- [ ] `/api/approvals` endpoint (approval queue view)
- [ ] `POST /api/bookings/:id/request-changes` endpoint
- [ ] Batch approval endpoint

### Database Level
- [ ] Exclusion constraint for double-booking prevention (time range overlap)

### Client SDK
- [ ] `pending_approval` status in SDK enum types
- [ ] `approved` status in SDK enum types
- [ ] `expired` status in SDK enum types

### Web UI
- [ ] RANGE mode booking flow in widget
- [ ] ALL_DAY mode booking flow in widget  
- [ ] Conflict detection in single-slot drawer
- [ ] Alternative suggestions UI

### Backoffice
- [ ] Dedicated approvals queue page at `/bookings/pending`
- [ ] Request changes action with message

---

## 9. File Locations Summary

### Database Schema
- `packages/database-schema/src/domain/bookings.ts`
- `packages/database-schema/src/domain/rental-objects.ts`
- `packages/database-schema/src/domain/allocations.ts`

### API
- `apps/api/src/modules/booking/booking.controller.ts`
- `apps/api/src/modules/booking/booking.service.ts`
- `apps/api/src/modules/calendar/calendar.controller.ts`
- `apps/api/src/modules/calendar/calendar.service.ts`
- `apps/api/src/modules/availability/availability.controller.ts`
- `apps/api/src/modules/rental-objects/rental-object.controller.ts`
- `apps/api/src/schemas/booking.schema.ts`
- `apps/api/src/schemas/calendar.schema.ts`
- `apps/api/src/schemas/rental-object.schema.ts`

### Client SDK
- `packages/client-sdk/src/services/booking.service.ts`
- `packages/client-sdk/src/services/calendar.service.ts`
- `packages/client-sdk/src/services/rental-object.service.ts`
- `packages/client-sdk/src/types/booking.ts`
- `packages/client-sdk/src/types/calendar.ts`
- `packages/client-sdk/src/types/rental-object.ts`
- `packages/client-sdk/src/hooks/use-bookings.ts`
- `packages/client-sdk/src/hooks/use-calendar.ts`

### Web UI
- `apps/web/src/pages/RentalObjectDetailPage.tsx`
- `apps/web/src/features/rental-object-details/components/RentalObjectDetailsLayout.tsx`
- `apps/web/src/features/rental-object-details/components/Sidebar/BookingWidgetPlacement.tsx`
- `apps/web/src/features/rental-object-details/components/CalendarSection.tsx`
- `packages/ds/src/blocks/RentalObjectAvailabilityCalendar.tsx`

### Backoffice
- `apps/backoffice/src/routes/bookings.tsx`
- `apps/backoffice/src/features/rental-objects/components/wizard/steps/BookingSettingsStep.tsx`
- `apps/backoffice/src/features/rental-objects/components/detail/RentalObjectBookingsTab.tsx`

### MinSide
- `apps/minside/src/routes/bookings.tsx`
- `apps/minside/src/routes/org/bookings.tsx`

### Existing Documentation
- `docs/booking-approvals/audit.md`
- `docs/booking-approvals/endpoint-inventory.md`
- `docs/booking-approvals/state-machine.md`
- `docs/operations/BOOKING_CALENDAR_ANALYSIS_2026-01-18.md`

---

## 10. Next Steps

See individual inventory documents for detailed specifications:
- [inventory-rental-object-types.md](./inventory-rental-object-types.md)
- [inventory-booking-modes-and-rules.md](./inventory-booking-modes-and-rules.md)
- [inventory-calendars-and-views.md](./inventory-calendars-and-views.md)
- [flow-public-web-to-checkout.md](./flow-public-web-to-checkout.md)
- [flow-details-and-tabs-matrix.md](./flow-details-and-tabs-matrix.md)
- [gaps-and-fix-plan.md](./gaps-and-fix-plan.md)
