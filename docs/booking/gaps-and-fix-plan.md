# Gaps and Fix Plan

**Date:** 2026-01-19  
**Status:** In Progress - P0 Complete  
**Version:** 1.1
**Last Updated:** 2026-01-19T13:45:00+01:00

---

## Overview

This document identifies **gaps** in the booking system implementation and proposes a **prioritized fix plan**. Gaps are categorized by severity and effort.

---

## 1. Gap Categories

| Priority | Description | Fix Timeline |
|----------|-------------|--------------|
| **P0 - Critical** | Blocks core booking flow | Immediate (this sprint) |
| **P1 - High** | Significant UX/functionality gaps | Short term (1-2 weeks) |
| **P2 - Medium** | Nice-to-have improvements | Medium term (1 month) |
| **P3 - Low** | Polish and optimization | Backlog |

---

## 2. P0 - Critical Gaps

### GAP-001: Status Enum Mismatch Across Layers - COMPLETED

**Status:** Completed 2026-01-19

**Problem:** Booking status values are inconsistent across API, SDK, and contracts.

**Resolution:**
- SDK already had correct 8-status enum in `packages/client-sdk/src/types/enums.ts`
- API controller updated to use consistent response format
- All endpoints now return `{ data: T }` format

**Verification:**
- [x] All 8 statuses in SDK types
- [x] All 8 statuses in API schema  
- [x] `rejected` used everywhere (not `denied`)
- [x] Unit tests: `booking-status.test.ts`
- [x] Contract tests: `booking-api-contracts.test.ts`

---

### GAP-002: Duplicate API Endpoints for Approve/Reject - COMPLETED

**Status:** Completed 2026-01-19

**Problem:** Both POST and PUT exist for approval actions, causing confusion.

**Resolution:**
- Added POST endpoints as canonical: `/confirm`, `/cancel`, `/complete`
- PUT endpoints now return RFC 8594 deprecation headers:
  - `Deprecation: true`
  - `Sunset: Sat, 19 Apr 2026 00:00:00 GMT`
  - `Link: </api/bookings/:id/confirm>; rel="successor-version"`
- Added `PUT /reject` with deprecation headers

**Files Updated:**
- `apps/api/src/modules/booking/booking.controller.ts`

**Verification:**
- [x] PUT approve returns deprecation headers
- [x] PUT reject returns deprecation headers  
- [x] PUT confirm/cancel/complete return deprecation headers
- [x] POST endpoints work without deprecation headers
- [x] Integration tests: `booking-approval-flow.test.ts`

---

## 3. P1 - High Priority Gaps

### GAP-003: BookingWidgetPlacement Uses Custom Calendar Grid

**Problem:** The main booking widget uses a custom calendar grid instead of the design system `RentalObjectAvailabilityCalendar` component.

**Current:**
```
BookingWidgetPlacement.tsx
├── Custom week grid generation (generateTimeSlots)
├── Custom slot rendering
└── ~500 lines of calendar logic
```

**Should Be:**
```
BookingWidgetPlacement.tsx
└── RentalObjectAvailabilityCalendar (from @xala/ds)
    └── Server-driven cells from API
```

**Impact:** 
- Duplication of logic
- Inconsistency with DS standard
- Harder to maintain
- Missing accessibility features

**Fix:**
1. Replace custom grid with `RentalObjectAvailabilityCalendar`
2. Connect to `/api/availability/:id` endpoint
3. Keep selection state management in widget
4. Remove ~300 lines of custom grid code

**Files to Update:**
- `apps/web/src/features/rental-object-details/components/Sidebar/BookingWidgetPlacement.tsx`

**Effort:** 8 hours  
**Owner:** Frontend team

---

### GAP-004: ALL_DAY and RANGE Modes Not Connected

**Problem:** Calendar component supports ALL_DAY and MULTI_DAY modes, but `BookingWidgetPlacement` doesn't use them.

**Current:**
```typescript
// BookingWidgetPlacement always renders TIME_SLOTS calendar
// Even when bookingMode is 'ALL_DAY' or 'RANGE'
```

**Impact:** Users cannot book all-day or multi-day rentals from the web app.

**Fix:**
1. Switch calendar mode based on `bookingMode`
2. Handle day/range selection callbacks
3. Create booking with appropriate time values

```typescript
const calendarMode = getCalendarModeForBookingMode(bookingMode);

<RentalObjectAvailabilityCalendar
  mode={calendarMode}
  onCellClick={handleCellClick}
  onRangeSelect={handleRangeSelect}
  // ...
/>
```

**Files to Update:**
- `apps/web/src/features/rental-object-details/components/Sidebar/BookingWidgetPlacement.tsx`

**Effort:** 6 hours  
**Owner:** Frontend team

---

### GAP-005: Missing Conflict Detection in Single-Slot Drawer

**Problem:** The booking dialog for SINGLE_SLOT does not check for conflicts before allowing confirmation.

**Current Flow:**
```
Select slot → Open dialog → Confirm → API might return 409 Conflict
```

**Desired Flow:**
```
Select slot → Check availability → Show conflict if exists → Suggest alternatives
```

**Impact:** Poor UX when slot becomes unavailable while user is filling form.

**Fix:**
1. Call `/api/availability/:id` or `/api/bookings/quote` before showing dialog
2. If conflict, show ConflictResolver component
3. Suggest next available slots

**Files to Update:**
- `apps/web/src/features/rental-object-details/components/Sidebar/BookingWidgetPlacement.tsx`
- `apps/web/src/features/rental-object-details/components/Sidebar/components/BookingDialog.tsx`

**Effort:** 4 hours  
**Owner:** Frontend team

---

### GAP-006: No Dedicated Approvals Queue Page

**Problem:** Backoffice has no dedicated page for approvals queue. Case handlers must filter the bookings list.

**Current:** `/bookings` with status tab filter  
**Desired:** `/approvals` with specialized queue view

**Impact:** Slower case handling workflow; less efficient for high-volume tenants.

**Fix:**
1. Create `/approvals` route
2. API: Create `GET /api/approvals` endpoint
3. Show queue with context (user history, conflicts, suggested actions)

**Files to Create:**
- `apps/backoffice/src/routes/approvals.tsx`
- `apps/api/src/modules/booking/approval.controller.ts`

**Effort:** 12 hours  
**Owner:** Backend + Frontend teams

---

## 4. P2 - Medium Priority Gaps

### GAP-007: IN_GAME Mode Partially Implemented

**Problem:** IN_GAME mode exists in type definitions but has no specialized UI.

**Missing:**
- Quick-select UI with larger touch targets
- Real-time availability refresh
- TTL countdown display
- Auto-release mechanism

**Fix:**
1. Create `InGameBookingCard` component
2. Add WebSocket for real-time updates
3. Implement reservation TTL with countdown

**Effort:** 16 hours  
**Owner:** Frontend team

---

### GAP-008: No Database Constraint for Double-Booking

**Problem:** No exclusion constraint prevents overlapping bookings at DB level.

**Current:** Conflict detection only in application layer.

**Risk:** Race conditions could create double-bookings.

**Fix:**
```sql
-- Migration
ALTER TABLE domain.bookings ADD CONSTRAINT no_double_booking 
  EXCLUDE USING gist (
    rental_object_id WITH =,
    tsrange(start_time, end_time) WITH &&
  )
  WHERE (status NOT IN ('cancelled', 'rejected', 'expired'));
```

**Files to Update:**
- `packages/database-schema/migrations/`

**Effort:** 2 hours  
**Owner:** Backend team

---

### GAP-009: Missing `request-changes` Endpoint

**Problem:** Case handlers cannot request changes from users; can only approve or reject.

**Documented in:** `docs/booking-approvals/endpoint-inventory.md` (not implemented)

**Fix:**
1. Add `POST /api/bookings/:id/request-changes`
2. Status transitions back to `pending`
3. Send notification to user

**Effort:** 4 hours  
**Owner:** Backend team

---

### GAP-010: Response Format Inconsistency - COMPLETED

**Status:** Completed 2026-01-19

**Problem:** Some booking endpoints return `{ booking }`, others return `{ data }`.

**Resolution:**
- All booking endpoints now return `{ data: T }` format
- Updated endpoints: `findById`, `create`, `confirm`, `cancel`, `complete`
- See CHANGELOG.md for migration notes

**Verification:**
- [x] All endpoints return `{ data: T }`
- [x] Contract tests validate response shape

---

## 5. P3 - Low Priority Gaps

### GAP-011: No Real-Time Availability Updates

**Problem:** Calendar doesn't update when another user books a slot.

**Fix:** Implement WebSocket subscription for availability changes.

**Effort:** 8 hours

---

### GAP-012: Mobile Bottom Sheet Optimization

**Problem:** Booking widget on mobile could be smoother.

**Fix:** Improve gesture handling and transition animations.

**Effort:** 4 hours

---

### GAP-013: Recurring Booking Partial Create UX

**Problem:** When some occurrences conflict, the "create available only" flow could be clearer.

**Fix:** Improve UI feedback and confirmation steps.

**Effort:** 4 hours

---

## 6. Fix Roadmap

### Sprint 1: Critical (P0)
| Gap | Task | Owner | Days |
|-----|------|-------|------|
| GAP-001 | Unify status enums | Backend | 0.25 |
| GAP-002 | Remove duplicate endpoints | Backend | 0.5 |

### Sprint 2: High Priority (P1)
| Gap | Task | Owner | Days |
|-----|------|-------|------|
| GAP-003 | Replace custom calendar with DS | Frontend | 1 |
| GAP-004 | Connect ALL_DAY/RANGE modes | Frontend | 0.75 |
| GAP-005 | Add conflict detection to drawer | Frontend | 0.5 |

### Sprint 3: High Priority (P1)
| Gap | Task | Owner | Days |
|-----|------|-------|------|
| GAP-006 | Create approvals queue page | Full Stack | 1.5 |

### Sprint 4: Medium Priority (P2)
| Gap | Task | Owner | Days |
|-----|------|-------|------|
| GAP-007 | IN_GAME mode UI | Frontend | 2 |
| GAP-008 | DB double-booking constraint | Backend | 0.25 |
| GAP-009 | Request-changes endpoint | Backend | 0.5 |
| GAP-010 | Response format consistency | Backend | 0.4 |

---

## 7. Verification Checklist

After fixes are implemented:

### Status Enum (GAP-001)
- [x] All 8 statuses in SDK types
- [x] All 8 statuses in API schema
- [x] All 8 statuses in contracts
- [x] `rejected` used everywhere (not `denied`)

### Duplicate Endpoints (GAP-002)
- [x] PUT approve returns deprecation warning
- [x] PUT reject returns deprecation warning
- [x] POST /reject works (renamed from /deny)
- [ ] SDK uses POST only

### Calendar Integration (GAP-003, GAP-004)
- [ ] TIME_SLOTS calendar from DS
- [ ] ALL_DAY calendar renders
- [ ] MULTI_DAY range selection works
- [ ] Mode switching updates calendar

### Conflict Detection (GAP-005)
- [ ] Slot check before opening dialog
- [ ] Conflict message with suggestions
- [ ] Alternative slots shown

### Approvals Queue (GAP-006)
- [ ] `/approvals` route exists
- [ ] Queue API returns pending items
- [ ] Approve/reject from queue works

---

## 8. Dependencies

| Before | Must Complete | After Can Start |
|--------|--------------|-----------------|
| GAP-001 | Status enum unification | Frontend status displays |
| GAP-003 | DS calendar integration | GAP-004 mode connection |
| GAP-006 | Approvals API | Approvals page |

---

## 9. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking SDK changes | Medium | High | Version bump, deprecation warnings |
| Calendar regression | Low | High | Comprehensive E2E tests |
| Race conditions before GAP-008 | Low | Medium | Application-level locking |

---

## 10. Related Documents

- [audit-summary.md](./audit-summary.md) - Full system audit
- [inventory-booking-modes-and-rules.md](./inventory-booking-modes-and-rules.md) - Mode specifications
- [inventory-calendars-and-views.md](./inventory-calendars-and-views.md) - Calendar details
- [docs/booking-approvals/state-machine.md](../booking-approvals/state-machine.md) - State transitions
- [docs/booking-approvals/endpoint-inventory.md](../booking-approvals/endpoint-inventory.md) - Canonical endpoints
