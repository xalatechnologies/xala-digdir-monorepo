# Inventory: Booking Modes and Rules

**Date:** 2026-01-19  
**Status:** Canonical Reference  
**Version:** 1.0

---

## Overview

This document catalogs all **booking modes** and **booking rules** supported by the Digilist platform, including their implementation status and behavioral specifications.

---

## 1. Booking Modes

### 1.1 Mode Definitions

```typescript
type BookingMode = 
  | 'SINGLE_SLOT'    // One-time slot/period selection
  | 'RECURRING'      // Weekly/monthly recurring pattern
  | 'IN_GAME'        // Short notice / rapid booking
  | 'RANGE'          // Multi-day date range
  | 'ALL_DAY'        // Full day booking
  | 'SEASON_RENTAL'  // Seasonal allocation
  | 'ACTIVITY_REGISTRATION'; // Event registration
```

### 1.2 Mode Summary

| Mode | Calendar Type | Time Selection | Approval Flow | Status |
|------|---------------|----------------|---------------|--------|
| `SINGLE_SLOT` | TIME_SLOTS | Slot clicking | Standard | ✅ Complete |
| `RECURRING` | TIME_SLOTS | Pattern builder | Standard | ✅ Complete |
| `IN_GAME` | TIME_SLOTS | Quick select | Auto-confirm | ⚠️ Partial |
| `RANGE` | MULTI_DAY | Date range picker | Standard | ⚠️ Partial |
| `ALL_DAY` | ALL_DAY | Day clicking | Standard | ⚠️ Partial |
| `SEASON_RENTAL` | MULTI_DAY | Season picker | Extended | ✅ Complete |
| `ACTIVITY_REGISTRATION` | TIME_SLOTS | Fixed slots | None | ❌ Not impl. |

---

## 2. SINGLE_SLOT Mode (Standard)

### 2.1 Description
The default booking mode for time-slotted rentals. User selects a single time slot by clicking on the calendar grid.

### 2.2 User Flow
1. View weekly TIME_SLOTS calendar
2. Click on an available slot
3. Slot is highlighted/selected
4. Click "Book" button
5. Booking dialog opens
6. Enter optional notes
7. Confirm booking
8. If `requiresApproval`, status = `pending`
9. If instant, status = `confirmed`

### 2.3 Implementation

**UI Component:** `BookingWidgetPlacement.tsx`

```typescript
// Calendar slot click handler
const handleSlotClick = (dayIndex: number, time: string) => {
  if (bookingMode === 'SINGLE_SLOT') {
    setSelectedSlot({ dayIndex, time });
    calculateEndTime(time, slotDuration);
    setShowBookingDialog(true);
  }
};
```

**Calendar Component:** `RentalObjectAvailabilityCalendar.tsx` → `TIME_SLOTS` mode

### 2.4 API Endpoints
- `GET /api/availability/:rentalObjectId` - Get slot status
- `POST /api/bookings` - Create booking

### 2.5 Status: ✅ Complete

---

## 3. RECURRING Mode

### 3.1 Description
For weekly or monthly recurring bookings (e.g., weekly team practice). Generates multiple booking instances with conflict detection.

### 3.2 User Flow
1. Select base time slot
2. Open recurring builder
3. Choose frequency (WEEKLY/MONTHLY)
4. Select weekdays (for WEEKLY)
5. Set end condition (occurrences/date)
6. Click "Preview"
7. Review generated occurrences
8. See conflict indicators
9. Choose: Create all / Create available / Modify
10. Confirm creation

### 3.3 Implementation

**UI Components:**
- `RecurringBuilder.tsx` - Pattern configuration
- `RecurringPreview.tsx` - Preview with conflicts
- `RecurringPreviewTable.tsx` - Detailed table view
- `ConflictResolver.tsx` - Alternative time suggestions

**Types:**
```typescript
interface RecurringPattern {
  frequency: 'WEEKLY' | 'MONTHLY';
  weekdays?: number[]; // ISO 1-7 (1=Monday)
  endCondition: {
    type: 'AFTER_OCCURRENCES' | 'UNTIL_DATE';
    occurrences?: number;
    untilDate?: string;
  };
}

interface RecurringOccurrenceDTO {
  index: number;
  startTime: string;
  endTime: string;
  status: 'AVAILABLE' | 'CONFLICT' | 'RESERVED' | 'BLOCKED' | 'BLACKOUT';
  reasonKey?: string;
  conflictId?: string;
}
```

### 3.4 API Endpoints
- `POST /api/bookings/recurring/preview` - Generate preview with conflicts
- `POST /api/bookings/recurring` - Create recurring booking

### 3.5 Constraints

**Source:** `RecurringConstraintsDTO`

```typescript
interface RecurringConstraintsDTO {
  enabled: boolean;
  allowedFrequencies: ('WEEKLY' | 'MONTHLY')[];
  maxOccurrences: number;      // e.g., 52
  maxRangeDays: number;        // e.g., 365
  minNoticeMinutes?: number;
  allowedWeekdays?: number[];
  cutoffRules?: {
    allowHolidays: boolean;
    stopOnConflict: boolean;
    allowPartial: boolean;
  };
}
```

### 3.6 Status: ✅ Complete

---

## 4. IN_GAME Mode

### 4.1 Description
Short-notice bookings with rapid reserve-confirm patterns. Designed for same-day, last-minute availability (e.g., "I want to play now").

### 4.2 User Flow
1. See real-time availability
2. Quick slot selection (larger touch targets)
3. Immediate confirmation
4. Auto-release if not confirmed within TTL

### 4.3 Implementation Status: ⚠️ Partial

**Implemented:**
- Mode selector option exists
- Constraints type defined
- Calendar supports mode

**Missing:**
- Dedicated quick-select UI
- Real-time availability updates
- Auto-release mechanism
- TTL countdown display

### 4.4 Constraints

**Source:** `InGameConstraintsDTO`

```typescript
interface InGameConstraintsDTO {
  enabled: boolean;
  minDurationMinutes: number;       // e.g., 30
  maxDurationMinutes: number;       // e.g., 120
  bufferMinutes?: number;           // e.g., 15
  reservationTtlSeconds?: number;   // e.g., 300 (5 min)
  maxAdvanceHours?: number;         // e.g., 24
  minAdvanceMinutes?: number;       // e.g., 15
  instantConfirmation?: boolean;
}
```

### 4.5 Status: ⚠️ Partial Implementation

---

## 5. RANGE Mode

### 5.1 Description
Multi-day date range booking for extended rentals (e.g., equipment rental from Monday to Friday).

### 5.2 User Flow
1. View MULTI_DAY calendar
2. Click start date
3. Click end date (or drag)
4. Date range highlighted
5. See pricing for range
6. Confirm booking

### 5.3 Implementation Status: ⚠️ Partial

**Implemented:**
- `RentalObjectAvailabilityCalendar` MULTI_DAY mode
- Calendar cell selection for ranges
- Pricing calculation supports ranges

**Missing:**
- Mode selector in `BookingWidgetPlacement`
- Range validation logic
- Multi-day booking dialog

### 5.4 Status: ⚠️ Partial Implementation

---

## 6. ALL_DAY Mode

### 6.1 Description
Full-day booking without specific time slots. Calendar shows day-level availability.

### 6.2 User Flow
1. View ALL_DAY calendar (month view)
2. Click on available day
3. Day is selected
4. See day price
5. Confirm booking

### 6.3 Implementation Status: ⚠️ Partial

**Implemented:**
- `RentalObjectAvailabilityCalendar` ALL_DAY mode
- Day cell rendering with status colors
- Day selection

**Missing:**
- Connection to `BookingWidgetPlacement`
- ALL_DAY specific booking dialog
- Multi-day ALL_DAY selection

### 6.4 Status: ⚠️ Partial Implementation

---

## 7. SEASON_RENTAL Mode

### 7.1 Description
Long-term seasonal allocation for sports seasons, school semesters, etc.

### 7.2 User Flow
1. Select rental object with season option
2. Redirect to MinSide application
3. Complete season application form
4. Submit for approval
5. Wait for case handler review

### 7.3 Implementation

**Location:** `apps/minside/src/routes/seasonal-leases/`

**API Endpoints:**
- `GET /api/seasons` - Available seasons
- `GET /api/seasonal-leases` - User's applications
- `POST /api/seasonal-leases` - Submit application
- `POST /api/seasonal-leases/:id/submit`
- `POST /api/seasonal-leases/:id/approve`
- `POST /api/seasonal-leases/:id/reject`

### 7.4 Status: ✅ Complete (in MinSide)

---

## 8. Approval Workflow

### 8.1 Approval States

```typescript
// State machine from docs/booking-approvals/state-machine.md
type BookingStatus =
  | 'pending'           // Created, not submitted
  | 'pending_approval'  // Submitted, awaiting decision
  | 'approved'          // Approved by caseworker
  | 'confirmed'         // Confirmed (auto or manual)
  | 'rejected'          // Rejected with reason
  | 'cancelled'         // Cancelled by user
  | 'completed'         // Fulfilled
  | 'expired';          // Timed out
```

### 8.2 Approval Flow

```
User creates booking
         │
         ▼
    ┌─────────┐
    │ pending │
    └────┬────┘
         │ submit()
         ▼
┌─────────────────────┐
│  pending_approval   │
└────────┬────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌─────────┐
│approved│ │rejected │
└───┬────┘ └─────────┘
    │
    │ confirm()
    ▼
┌──────────┐
│confirmed │
└────┬─────┘
     │
     │ complete()
     ▼
┌──────────┐
│completed │
└──────────┘
```

### 8.3 Auto-Confirm Rules

When `requiresApproval = false`:
```
pending → confirmed (skip approval workflow)
```

### 8.4 Approval Permissions

| Role | Can Approve | Can Reject | Scope |
|------|-------------|------------|-------|
| `admin` | ✅ | ✅ | All |
| `saksbehandler` | ✅ | ✅ | Assigned scopes |
| `ORG_ADMIN` | ✅ | ✅ | Organization listings |
| `ORG_CASE_HANDLER` | ✅ | ❌ | Organization listings |

---

## 9. Booking Rules

### 9.1 Time Constraints

```typescript
interface TimeConstraints {
  // Slot configuration
  slotDurationMinutes: number;  // 15, 30, 60, etc.
  stepMinutes: number;          // Increment for duration selection
  
  // Duration limits
  minDurationMinutes: number;
  maxDurationMinutes?: number;
  
  // Buffer times
  bufferBeforeMinutes?: number;
  bufferAfterMinutes?: number;
  
  // Advance booking
  minAdvanceMinutes?: number;   // Must book X min ahead
  maxAdvanceDays?: number;      // Can't book more than X days ahead
  allowSameDayBooking: boolean;
}
```

### 9.2 Capacity Rules

```typescript
interface CapacityRules {
  // Simple capacity
  maxCapacity?: number;
  
  // Inventory mode (multiple units)
  inventory?: {
    enabled: boolean;
    total: number;
    policy: 'FIFO' | 'CONCURRENT';
  };
  
  // Shared capacity (seats)
  sharedCapacity?: {
    enabled: boolean;
    total: number;
    policy: 'PER_SLOT' | 'PER_DAY';
  };
}
```

### 9.3 Cancellation Rules

```typescript
interface CancellationRules {
  // When can user cancel
  deadlineHours: number;     // Hours before start
  
  // Refund policy
  refundPolicy: 'FULL' | 'PARTIAL' | 'NONE';
  refundPercent?: number;    // For PARTIAL
  
  // Late cancellation
  lateCancellationFee?: number;
  
  // Admin override
  adminCanAlwaysCancel: boolean;
}
```

### 9.4 Payment Rules

```typescript
interface PaymentRules {
  // When to pay
  paymentTiming: 'IMMEDIATE' | 'ON_APPROVAL' | 'ON_CONFIRMATION';
  
  // Deposit
  deposit?: {
    required: boolean;
    amount: number;
    dueHoursBefore: number;
  };
  
  // Payment methods
  acceptedMethods: ('vipps' | 'stripe' | 'invoice')[];
  
  // Free booking threshold
  freeBookingThreshold?: number;
}
```

---

## 10. Conflict Rules

### 10.1 Conflict Types

| Type | Description | Slot Status |
|------|-------------|-------------|
| `BOOKING` | Existing confirmed/approved booking | `BOOKED` |
| `RESERVATION` | Pending reservation (TTL lock) | `RESERVED` |
| `ADMIN_BLOCK` | Admin-created block | `BLOCKED` |
| `BLACKOUT` | Holiday/system blackout | `BLACKOUT` |
| `CLOSED` | Outside opening hours | `CLOSED` |

### 10.2 Overlap Detection

```typescript
// Calendar service determines slot status
function getSlotStatus(
  slot: TimeSlot,
  bookings: Booking[],
  allocations: Allocation[],
  openingHours: OpeningHours
): SlotStatus {
  // Check opening hours first
  if (!isWithinOpeningHours(slot, openingHours)) {
    return 'CLOSED';
  }
  
  // Check blackouts
  if (hasBlackout(slot, allocations)) {
    return 'BLACKOUT';
  }
  
  // Check admin blocks
  if (hasBlock(slot, allocations)) {
    return 'BLOCKED';
  }
  
  // Check confirmed bookings
  if (hasBooking(slot, bookings, ['confirmed', 'approved'])) {
    return 'BOOKED';
  }
  
  // Check pending reservations
  if (hasPendingReservation(slot, bookings)) {
    return 'RESERVED';
  }
  
  return 'AVAILABLE';
}
```

---

## 11. Opening Hours

### 11.1 Schema

```typescript
interface OpeningHoursDTO {
  // Weekly schedule (0-6 or 'monday'-'sunday')
  weekly: Record<string, {
    open: string;   // "08:00"
    close: string;  // "22:00"
    closed?: boolean;
  }>;
  
  // Exceptions (holidays, special days)
  exceptions?: {
    date: string;      // "2026-12-25"
    open?: string;
    close?: string;
    closed: boolean;
    reasonKey?: string; // i18n key
  }[];
}
```

### 11.2 Example

```json
{
  "weekly": {
    "monday": { "open": "08:00", "close": "21:00" },
    "tuesday": { "open": "08:00", "close": "21:00" },
    "wednesday": { "open": "08:00", "close": "21:00" },
    "thursday": { "open": "08:00", "close": "21:00" },
    "friday": { "open": "08:00", "close": "21:00" },
    "saturday": { "open": "10:00", "close": "18:00" },
    "sunday": { "open": "10:00", "close": "18:00", "closed": true }
  },
  "exceptions": [
    { "date": "2026-12-24", "closed": true, "reasonKey": "holiday.christmas" },
    { "date": "2026-12-25", "closed": true, "reasonKey": "holiday.christmas" },
    { "date": "2026-12-31", "close": "15:00", "reasonKey": "holiday.newYear" }
  ]
}
```

---

## 12. Validation Rules

### 12.1 Booking Creation Validation

```typescript
const CreateBookingSchema = z.object({
  rentalObjectId: z.string().uuid(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  
  // Optional fields
  notes: z.string().max(1000).optional(),
  organizationId: z.string().uuid().optional(),
  metadata: z.record(z.unknown()).optional(),
}).refine(
  (data) => new Date(data.startTime) < new Date(data.endTime),
  { message: 'Start time must be before end time' }
).refine(
  (data) => new Date(data.startTime) > new Date(),
  { message: 'Cannot book in the past' }
);
```

### 12.2 Business Rule Validation

Performed in `booking.service.ts`:
1. ✅ Rental object exists and is published
2. ✅ Time is within opening hours
3. ✅ No conflicting bookings
4. ✅ Duration within limits
5. ✅ Advance booking window
6. ✅ User has permission
7. ✅ Capacity available

---

## 13. Implementation Locations

### API
- `apps/api/src/modules/booking/booking.controller.ts`
- `apps/api/src/modules/booking/booking.service.ts`
- `apps/api/src/schemas/booking.schema.ts`

### Client SDK
- `packages/client-sdk/src/types/booking.ts`
- `packages/client-sdk/src/services/booking.service.ts`
- `packages/client-sdk/src/hooks/use-bookings.ts`

### Web UI
- `apps/web/src/features/rental-object-details/components/Sidebar/BookingWidgetPlacement.tsx`
- `apps/web/src/features/rental-object-details/components/Sidebar/components/BookingModeSelector.tsx`
- `apps/web/src/features/rental-object-details/components/Sidebar/components/RecurringBuilder.tsx`
- `apps/web/src/features/rental-object-details/components/Sidebar/components/RecurringPreview.tsx`
