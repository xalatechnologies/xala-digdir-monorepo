# Booking Calendar & Drawer Analysis
**Date:** January 18, 2026  
**Page:** `http://localhost:6001/listing/arrangementssted-71-kragero-70`  
**Focus:** Drawer behavior, calendar implementation, multiple booking types visibility

---

## Executive Summary

The booking system has **comprehensive implementation** for multiple booking modes and calendar types, but some features may not be **visible or properly connected** in the current UI flow. This analysis identifies what's implemented, what's missing, and recommendations for improvement.

---

## 1. Current Implementation Status

### 1.1 Booking Modes Supported

**✅ Implemented in `BookingWidgetPlacement`:**
- `SINGLE_SLOT` - Single time slot booking (fully implemented)
- `RECURRING` - Recurring weekly/monthly patterns (fully implemented with preview)
- `SEASON_RENTAL` - Season allocation (redirects to MinSide)

**✅ Available in `BookingModeSelector`:**
- `SINGLE_SLOT`
- `RECURRING`
- `SEASON_RENTAL`
- `IN_GAME`
- `RANGE`
- `ALL_DAY`
- `ACTIVITY_REGISTRATION`

**⚠️ Issue:** Only `SINGLE_SLOT`, `RECURRING`, and `SEASON_RENTAL` have full UI implementations in `BookingWidgetPlacement`. Other modes (`RANGE`, `ALL_DAY`, `ACTIVITY_REGISTRATION`) are not fully implemented.

### 1.2 Calendar Types Supported

**✅ Implemented in `RentalObjectAvailabilityCalendar`:**
- `TIME_SLOTS` - Week/day timeline view with hourly slots ✅
- `ALL_DAY` - Month view with day selection ✅
- `MULTI_DAY` - Date range picker for multi-day bookings ✅

**✅ Used in `CalendarSection`:**
- Dynamically switches based on `config.granularity`
- Supports all three modes

**⚠️ Issue:** The calendar mode is determined by API config, not by selected booking mode. There's a disconnect between booking mode selection and calendar type display.

### 1.3 Drawer Implementation

**✅ `BookingDialog` Component:**
- Drawer that appears when clicking a slot
- Supports time selection, duration, purpose, attendees
- Has recurring toggle (but limited functionality)
- Payment section included

**⚠️ Issues:**
1. Drawer only appears for `SINGLE_SLOT` mode
2. Recurring toggle in drawer doesn't integrate with recurring booking flow
3. No support for `RANGE` or `ALL_DAY` booking modes in drawer
4. Drawer doesn't show conflict detection or alternatives

---

## 2. Architecture Analysis

### 2.1 Component Hierarchy

```
RentalObjectDetailPage
  └── RentalObjectDetailsLayout
      └── BookingWidgetPlacement (Full booking flow)
          ├── BookingModeSelector (Mode selection)
          ├── Calendar Grid (SINGLE_SLOT mode)
          ├── RecurringBuilder (RECURRING mode)
          ├── RecurringPreview (RECURRING mode)
          ├── ConflictResolver (RECURRING mode)
          └── BookingDialog (Drawer for slot details)
```

**Alternative Path:**
```
RentalObjectDetailPage
  └── RentalObjectDetailsLayout
      └── CalendarSection (Read-only preview)
          └── RentalObjectAvailabilityCalendar
              ├── TIME_SLOTS mode
              ├── ALL_DAY mode
              └── MULTI_DAY mode
```

### 2.2 Data Flow

**Current Flow:**
1. User clicks slot → `handleSlotClick()` → Opens `BookingDialog`
2. User fills form → `handleDialogConfirm()` → Adds to `selectedSlots`
3. User proceeds → `handleCheckAvailabilityAndProceed()` → Checks conflicts
4. User confirms → `handleSubmitBooking()` → Creates booking

**Missing Flow:**
1. User selects booking mode → Should switch calendar type
2. User selects `RANGE` mode → Should show range picker calendar
3. User selects `ALL_DAY` mode → Should show day grid calendar
4. User selects `RECURRING` mode → Should show recurring builder (✅ implemented)

---

## 3. Issues Identified

### 3.1 Booking Mode ↔ Calendar Type Disconnect

**Problem:**
- `BookingModeSelector` allows selecting `RANGE`, `ALL_DAY`, etc.
- But `BookingWidgetPlacement` only renders calendar for `SINGLE_SLOT` mode
- `RentalObjectAvailabilityCalendar` supports `ALL_DAY` and `MULTI_DAY` modes
- But these are not used in the booking flow

**Impact:**
- Users can select `ALL_DAY` or `RANGE` booking mode
- But they still see the time slot calendar
- Confusing UX

**Solution:**
- Map booking modes to calendar types:
  - `SINGLE_SLOT` → `TIME_SLOTS` calendar
  - `RANGE` → `MULTI_DAY` calendar
  - `ALL_DAY` → `ALL_DAY` calendar
  - `RECURRING` → `TIME_SLOTS` calendar (for base slot selection)

### 3.2 Drawer Only for Single Slots

**Problem:**
- `BookingDialog` only appears when clicking individual slots
- No drawer/UI for `RANGE` or `ALL_DAY` mode selections
- No conflict resolution UI in drawer

**Impact:**
- `RANGE` and `ALL_DAY` modes have no UI
- Users can't complete bookings in these modes

**Solution:**
- Create mode-specific selection UIs:
  - `RANGE`: Show range picker, then drawer with start/end time selection
  - `ALL_DAY`: Show day grid, then drawer with date range selection
  - `RECURRING`: Already has builder, but could integrate drawer for base slot

### 3.3 Missing Conflict Detection in Drawer

**Problem:**
- `BookingDialog` doesn't check for conflicts before showing
- No alternative suggestions in drawer
- No preview of conflicts

**Impact:**
- Users can select conflicting slots
- No guidance on alternatives
- Poor UX for recurring bookings

**Solution:**
- Add conflict detection to drawer
- Show alternatives when conflicts exist
- Integrate with `ConflictResolver` component

### 3.4 Recurring Toggle in Drawer Not Connected

**Problem:**
- `BookingDialog` has recurring toggle
- But it doesn't integrate with recurring booking flow
- Toggle just shows/hides recurring fields, doesn't switch to recurring mode

**Impact:**
- Confusing UX - two ways to do recurring bookings
- Inconsistent behavior

**Solution:**
- Remove recurring toggle from drawer
- Use `BookingModeSelector` for mode selection only
- Keep drawer simple for single slot details

---

## 4. Recommendations

### 4.1 Immediate Fixes

#### Fix 1: Map Booking Modes to Calendar Types

```typescript
// In BookingWidgetPlacement.tsx
const getCalendarModeForBookingMode = (bookingMode: BookingMode): CalendarMode => {
  switch (bookingMode) {
    case 'SINGLE_SLOT':
    case 'RECURRING':
      return 'TIME_SLOTS';
    case 'RANGE':
      return 'MULTI_DAY';
    case 'ALL_DAY':
      return 'ALL_DAY';
    default:
      return 'TIME_SLOTS';
  }
};
```

#### Fix 2: Use RentalObjectAvailabilityCalendar for All Modes

Replace the custom calendar grid in `BookingWidgetPlacement` with `RentalObjectAvailabilityCalendar`:

```typescript
{bookingMode === 'SINGLE_SLOT' && (
  <CalendarSection
    rentalObjectId={rentalObjectId}
    bookingType={bookingMode}
    onSelectionChange={handleCalendarSelection}
    readOnly={false}
  />
)}

{bookingMode === 'RANGE' && (
  <CalendarSection
    rentalObjectId={rentalObjectId}
    bookingType="RANGE"
    onSelectionChange={handleRangeSelection}
    readOnly={false}
  />
)}

{bookingMode === 'ALL_DAY' && (
  <CalendarSection
    rentalObjectId={rentalObjectId}
    bookingType="ALL_DAY"
    onSelectionChange={handleAllDaySelection}
    readOnly={false}
  />
)}
```

#### Fix 3: Create Mode-Specific Selection UIs

**For RANGE mode:**
- Show `MULTI_DAY` calendar
- On range selection, show drawer with:
  - Start date/time
  - End date/time
  - Duration validation
  - Conflict detection

**For ALL_DAY mode:**
- Show `ALL_DAY` calendar
- On day selection, show drawer with:
  - Selected dates
  - Min/max period validation
  - Conflict detection

#### Fix 4: Integrate Conflict Detection

Add conflict detection to drawer:

```typescript
// In BookingDialog.tsx
const { data: availabilityCheck } = useAvailabilityCheck({
  rentalObjectId,
  startTime: formData.startTime,
  endTime: formData.endTime,
  date: formData.date,
});

// Show conflicts and alternatives
{availabilityCheck?.conflicts && (
  <ConflictAlert
    conflicts={availabilityCheck.conflicts}
    alternatives={availabilityCheck.alternatives}
    onSelectAlternative={handleSelectAlternative}
  />
)}
```

### 4.2 Architecture Improvements

#### Improvement 1: Unified Calendar Component

Create a unified calendar wrapper that:
- Accepts booking mode as prop
- Automatically selects correct calendar type
- Handles selection differently per mode
- Provides consistent API

#### Improvement 2: Mode-Specific Drawers

Create separate drawer components:
- `SingleSlotDrawer` - For SINGLE_SLOT mode
- `RangeDrawer` - For RANGE mode
- `AllDayDrawer` - For ALL_DAY mode
- `RecurringDrawer` - For RECURRING mode (base slot selection)

#### Improvement 3: Conflict-Aware Selection

Integrate conflict detection at selection time:
- Check availability before showing drawer
- Show alternatives immediately
- Prevent selection of conflicting slots

---

## 5. Implementation Plan

### Phase 1: Fix Mode-to-Calendar Mapping (High Priority)

1. ✅ Map booking modes to calendar types
2. ✅ Replace custom calendar with `RentalObjectAvailabilityCalendar`
3. ✅ Test all three calendar types work

**Estimated Time:** 2-3 hours

### Phase 2: Implement Missing Modes (High Priority)

1. ✅ Implement `RANGE` mode UI
2. ✅ Implement `ALL_DAY` mode UI
3. ✅ Create mode-specific drawers

**Estimated Time:** 4-6 hours

### Phase 3: Integrate Conflict Detection (Medium Priority)

1. ✅ Add conflict detection to drawer
2. ✅ Show alternatives in drawer
3. ✅ Integrate with `ConflictResolver` component

**Estimated Time:** 3-4 hours

### Phase 4: Cleanup and Polish (Low Priority)

1. ✅ Remove recurring toggle from drawer
2. ✅ Unify calendar component usage
3. ✅ Add tests for all modes

**Estimated Time:** 2-3 hours

---

## 6. Code Locations

### Key Files

**Booking Flow:**
- `apps/web/src/features/rental-object-details/components/Sidebar/BookingWidgetPlacement.tsx` - Main booking component
- `apps/web/src/features/rental-object-details/components/BookingDialog.tsx` - Drawer component
- `apps/web/src/features/rental-object-details/components/Sidebar/components/BookingModeSelector.tsx` - Mode selector

**Calendar Components:**
- `packages/ds/src/blocks/RentalObjectAvailabilityCalendar.tsx` - Calendar component (supports 3 modes)
- `apps/web/src/features/rental-object-details/components/CalendarSection.tsx` - Calendar wrapper

**Recurring Booking:**
- `apps/web/src/features/rental-object-details/components/Sidebar/components/RecurringBuilder.tsx` - Pattern builder
- `apps/web/src/features/rental-object-details/components/Sidebar/components/RecurringPreview.tsx` - Preview component
- `apps/web/src/features/rental-object-details/components/Sidebar/components/ConflictResolver.tsx` - Conflict resolution

---

## 7. Testing Checklist

### Single Slot Mode
- [ ] Calendar shows time slots
- [ ] Clicking slot opens drawer
- [ ] Drawer shows correct time
- [ ] Can adjust duration
- [ ] Can submit booking

### Range Mode
- [ ] Calendar shows day grid
- [ ] Can select date range
- [ ] Drawer shows start/end times
- [ ] Validation works
- [ ] Can submit booking

### All Day Mode
- [ ] Calendar shows day grid
- [ ] Can select multiple days
- [ ] Drawer shows selected dates
- [ ] Min/max period validation
- [ ] Can submit booking

### Recurring Mode
- [ ] Shows recurring builder
- [ ] Can select base slot
- [ ] Preview shows occurrences
- [ ] Conflicts are detected
- [ ] Alternatives are shown
- [ ] Can resolve conflicts
- [ ] Can submit booking

---

## 8. Conclusion

The booking system has **solid foundations** with:
- ✅ Multiple booking modes supported
- ✅ Multiple calendar types implemented
- ✅ Recurring booking with conflict detection
- ✅ Comprehensive drawer component

**Main Issues:**
- ⚠️ Booking mode selection doesn't switch calendar type
- ⚠️ Some booking modes lack UI implementation
- ⚠️ Drawer doesn't integrate with conflict detection
- ⚠️ Recurring toggle in drawer is disconnected

**Priority Actions:**
1. **High:** Fix mode-to-calendar mapping
2. **High:** Implement missing mode UIs
3. **Medium:** Integrate conflict detection
4. **Low:** Cleanup and polish

---

**Next Steps:**
1. Review this analysis
2. Prioritize fixes
3. Implement changes incrementally
4. Test each mode thoroughly
