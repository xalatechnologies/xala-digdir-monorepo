# Inventory: Calendars and Views

**Date:** 2026-01-19  
**Status:** Canonical Reference  
**Version:** 1.0

---

## Overview

This document catalogs all **calendar components** and **view types** in the Digilist platform, including their configurations and how they render availability data.

---

## 1. Calendar Modes

### 1.1 Three Calendar Granularities

```typescript
type CalendarGranularity = 'TIME_SLOTS' | 'ALL_DAY' | 'MULTI_DAY';
```

| Mode | Display | Selection Unit | Use Case |
|------|---------|----------------|----------|
| `TIME_SLOTS` | Weekly grid with hours | Time slot | Hourly bookings |
| `ALL_DAY` | Monthly grid with days | Single day | Daily rentals |
| `MULTI_DAY` | Monthly grid with range | Date range | Extended rentals |

---

## 2. Main Calendar Component

### 2.1 RentalObjectAvailabilityCalendar

**Location:** `packages/ds/src/blocks/RentalObjectAvailabilityCalendar.tsx`

This is the **primary calendar component** used across the platform. It's a **design system block** (thin UI) that renders availability data from the API.

### 2.2 Props

```typescript
interface RentalObjectAvailabilityCalendarProps {
  // Mode configuration
  mode: CalendarGranularity;
  
  // Data
  cells: AvailabilityCellDTO[];
  selection?: CalendarSelection;
  legend?: SlotStatusLegendDTO[];
  
  // Navigation
  currentDate: Date;
  onDateChange?: (date: Date) => void;
  
  // Interaction
  onCellClick?: (cell: AvailabilityCellDTO) => void;
  onSelectionChange?: (selection: CalendarSelection) => void;
  
  // Display options
  showLegend?: boolean;
  showTips?: boolean;
  title?: string;
  subtitle?: string;
  viewMode?: CalendarViewMode;
  allowViewSwitch?: boolean;
  
  // State
  isLoading?: boolean;
  errorMessage?: string;
  warningMessage?: string;
  readOnly?: boolean;
  
  className?: string;
}
```

### 2.3 Data Flow

```
API: GET /api/availability/:rentalObjectId?from=...&to=...
                          ↓
              RentalObjectAvailabilityMatrixProjectionDTO
                          ↓
              { cells: AvailabilityCellDTO[] }
                          ↓
              RentalObjectAvailabilityCalendar
                          ↓
              Visual grid with status colors
```

### 2.4 Slot Status Colors

```typescript
const SLOT_STATUS_CONFIG: Record<CalendarSlotStatus, SlotStatusConfig> = {
  AVAILABLE: { color: 'success', label: 'Ledig' },
  RESERVED: { color: 'warning', label: 'Reservert' },
  BOOKED: { color: 'danger', label: 'Opptatt' },
  BLOCKED: { color: 'neutral', label: 'Blokkert' },
  BLACKOUT: { color: 'neutral', label: 'Utilgjengelig' },
  CLOSED: { color: 'neutral', label: 'Stengt' },
};
```

---

## 3. TIME_SLOTS Mode

### 3.1 Layout
- **Rows:** Hours of the day (08:00-21:00 typical)
- **Columns:** Days of the week (Mon-Sun)
- **Cells:** Individual time slots

### 3.2 Slot Duration
Configurable per rental object:
- 15 minutes
- 30 minutes
- 60 minutes (most common)

### 3.3 Weekly Navigation
```
← Prev Week | 13. jan - 19. jan 2026 | Next Week →
```

### 3.4 Rendering Logic

```typescript
// For each hour in opening hours
for (let hour = openHour; hour < closeHour; hour++) {
  // For each day in the week
  for (let day = 0; day < 7; day++) {
    const slotStart = getSlotDateTime(weekStart, day, hour);
    const cell = findCell(cells, slotStart);
    renderCell(cell);
  }
}
```

### 3.5 Interaction
- Click to select slot
- Shift+click for range (when enabled)
- Hover for tooltip with status details

---

## 4. ALL_DAY Mode

### 4.1 Layout
- **Grid:** 7x6 monthly calendar grid (42 days)
- **Cells:** Full days
- **Padding:** Previous/next month days shown

### 4.2 Monthly Navigation
```
← Prev Month | Januar 2026 | Next Month →
```

### 4.3 Day Cell States

| State | Visual | Border |
|-------|--------|--------|
| Available | Light green | None |
| Booked | Light red | None |
| Selected | Blue | 2px solid |
| Today | Bold | Subtle highlight |
| Other month | Faded | None |

### 4.4 Interaction
- Click to select day
- Single selection only

---

## 5. MULTI_DAY Mode

### 5.1 Layout
Same as ALL_DAY but with range selection:
- Start date (filled)
- End date (filled)
- In-between dates (highlighted)

### 5.2 Selection Flow
1. Click first date → "Start: 15. jan"
2. Click second date → "15. jan - 20. jan (6 dager)"
3. Range highlighted in blue gradient

### 5.3 Interaction
- First click: Set start date
- Second click: Set end date
- Third click: Reset selection

---

## 6. Calendar Configuration

### 6.1 API Endpoint

```
GET /api/rental-objects/:id/calendar-config
```

### 6.2 Response Schema

```typescript
interface RentalObjectCalendarConfigProjectionDTO {
  rentalObjectId: string;
  
  // Display mode
  granularity: CalendarGranularity;
  timezone: string;
  
  // Slot configuration
  slotSizeMinutes: number;
  selectableUnit: 'slot' | 'day' | 'range';
  minDurationMinutes: number;
  maxDurationMinutes?: number;
  stepMinutes: number;
  bufferBeforeMinutes?: number;
  bufferAfterMinutes?: number;
  
  // Booking window
  minNoticeMinutes?: number;
  bookingHorizonDays?: number;
  allowSameDayBooking: boolean;
  
  // Opening hours
  openingHours: OpeningHoursDTO;
  
  // Booking types
  bookingTypes: BookingTypeDTO[];
  
  // UI hints
  ui: {
    showWeekView: boolean;
    showMonthView: boolean;
    showDayView: boolean;
    defaultView: 'month' | 'week' | 'day';
    allowMultiSelect: boolean;
  };
  
  // Permissions
  permissions: {
    canViewCalendar: boolean;
    canSelectSlot: boolean;
    canRequestBooking: boolean;
  };
  
  // Available actions
  availableActions: ActionDTO[];
}
```

---

## 7. Availability Matrix

### 7.1 API Endpoint

```
GET /api/availability/:rentalObjectId?from=2026-01-13&to=2026-01-19
```

### 7.2 Response Schema

```typescript
interface RentalObjectAvailabilityMatrixProjectionDTO {
  rentalObjectId: string;
  from: string;     // ISO date
  to: string;       // ISO date
  granularity: CalendarGranularity;
  cells: AvailabilityCellDTO[];
  legend: SlotStatusLegendDTO[];
}
```

### 7.3 Cell Schema

```typescript
interface AvailabilityCellDTO {
  start: string;          // ISO datetime
  end: string;            // ISO datetime
  status: SlotStatus;     // AVAILABLE | RESERVED | BOOKED | BLOCKED | BLACKOUT | CLOSED
  reasonKey?: string;     // i18n key for tooltip
  bookingId?: string;     // If BOOKED/RESERVED
  blockId?: string;       // If BLOCKED/BLACKOUT
  lockedUntil?: string;   // Reservation lock expiry
}
```

---

## 8. Calendar Views

### 8.1 Week View (TIME_SLOTS)
- Default for hourly bookings
- Shows 7 days at a time
- Hours as rows, days as columns
- Best for seeing available time slots

### 8.2 Month View (ALL_DAY / MULTI_DAY)
- Default for daily bookings
- Shows 1 month at a time
- Days as grid cells
- Best for seeing overall availability

### 8.3 Day View (optional)
- Single day focus
- More detail per hour
- Useful for backoffice
- Not commonly used in public booking

---

## 9. Legend Component

### 9.1 Default Legend

```typescript
const DEFAULT_SLOT_STATUS_LEGEND: SlotStatusLegendDTO[] = [
  { status: 'AVAILABLE', labelKey: 'calendar.slot.available' },
  { status: 'RESERVED', labelKey: 'calendar.slot.reserved' },
  { status: 'BOOKED', labelKey: 'calendar.slot.booked' },
  { status: 'BLOCKED', labelKey: 'calendar.slot.blocked' },
  { status: 'BLACKOUT', labelKey: 'calendar.slot.blackout' },
  { status: 'CLOSED', labelKey: 'calendar.slot.closed' },
];
```

### 9.2 Norwegian Labels

```typescript
const SLOT_STATUS_LABELS: Record<SlotStatus, string> = {
  AVAILABLE: 'Ledig',
  RESERVED: 'Reservert',
  BOOKED: 'Opptatt',
  BLOCKED: 'Blokkert',
  BLACKOUT: 'Utilgjengelig',
  CLOSED: 'Stengt',
};
```

---

## 10. Calendar in BookingWidgetPlacement

### 10.1 Component Structure

```
BookingWidgetPlacement
├── BookingModeSelector (if multiple modes)
├── Calendar Section
│   ├── Week/Month Navigation
│   └── RentalObjectAvailabilityCalendar (or fallback grid)
├── Selection Summary
└── Action Buttons
```

### 10.2 Mode-to-Calendar Mapping

```typescript
function getCalendarModeForBookingMode(
  bookingMode: BookingMode
): 'TIME_SLOTS' | 'ALL_DAY' | 'MULTI_DAY' {
  switch (bookingMode) {
    case 'SINGLE_SLOT':
    case 'IN_GAME':
    case 'RECURRING':
      return 'TIME_SLOTS';
    case 'ALL_DAY':
      return 'ALL_DAY';
    case 'RANGE':
    case 'SEASON_RENTAL':
      return 'MULTI_DAY';
    default:
      return 'TIME_SLOTS';
  }
}
```

### 10.3 Current Implementation Status

| Mode | Uses Calendar | Calendar Type | Status |
|------|---------------|---------------|--------|
| SINGLE_SLOT | Custom grid | TIME_SLOTS | ⚠️ Uses custom, should use DS |
| RECURRING | Custom grid | TIME_SLOTS | ⚠️ Uses custom, should use DS |
| ALL_DAY | DS calendar | ALL_DAY | ✅ Ready but not connected |
| MULTI_DAY | DS calendar | MULTI_DAY | ✅ Ready but not connected |

---

## 11. Backoffice Calendar

### 11.1 CalendarSection Component

**Location:** `apps/backoffice/src/components/CalendarSection.tsx`

Used in:
- Rental object availability tab
- Booking overview
- Block management

### 11.2 Features
- Full CRUD for blocks/allocations
- Admin-only status colors
- Drag-to-create blocks
- Conflict indicators

---

## 12. MinSide Calendar

### 12.1 CalendarSection Component

**Location:** `apps/minside/src/components/CalendarSection.tsx`

Used in:
- My bookings view
- Organization bookings

### 12.2 Features
- Read-only for most users
- Personal booking highlights
- Offline support

---

## 13. API Integration Pattern

### 13.1 React Query Hook

```typescript
// packages/client-sdk/src/hooks/use-rental-object-calendar.ts
export function useRentalObjectCalendarConfig(rentalObjectId: string) {
  return useQuery({
    queryKey: ['rental-object-calendar-config', rentalObjectId],
    queryFn: () => calendarService.getConfig(rentalObjectId),
    enabled: !!rentalObjectId,
  });
}

export function useRentalObjectAvailability(
  rentalObjectId: string,
  from: string,
  to: string
) {
  return useQuery({
    queryKey: ['rental-object-availability', rentalObjectId, from, to],
    queryFn: () => calendarService.getAvailabilityMatrix(rentalObjectId, from, to),
    enabled: !!rentalObjectId && !!from && !!to,
  });
}
```

### 13.2 Example Usage

```tsx
function BookingCalendar({ rentalObjectId }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const { from, to } = getWeekRange(currentDate);
  
  const { data: config } = useRentalObjectCalendarConfig(rentalObjectId);
  const { data: availability, isLoading } = useRentalObjectAvailability(
    rentalObjectId,
    from,
    to
  );
  
  return (
    <RentalObjectAvailabilityCalendar
      mode={config?.granularity || 'TIME_SLOTS'}
      cells={availability?.cells || []}
      legend={availability?.legend}
      currentDate={currentDate}
      onDateChange={setCurrentDate}
      onCellClick={handleCellClick}
      isLoading={isLoading}
    />
  );
}
```

---

## 14. Styling

### 14.1 Design Tokens

All calendar styling uses Norwegian Designsystemet tokens:

```css
/* Cell backgrounds */
--ds-color-success-surface-default     /* AVAILABLE */
--ds-color-warning-surface-default     /* RESERVED */
--ds-color-danger-surface-default      /* BOOKED */
--ds-color-neutral-surface-default     /* BLOCKED, CLOSED */

/* Selected state */
--ds-color-brand-1-surface-default     /* Selected cell */
--ds-color-brand-1-border-strong       /* Selection border */

/* Text */
--ds-font-size-sm                      /* Cell text */
--ds-font-weight-medium                /* Today highlight */
```

### 14.2 Responsive Behavior

- **Desktop:** Full week view with hours
- **Tablet:** Week view, smaller cells
- **Mobile:** Day view or scrollable week

---

## 15. File Locations

### Design System
- `packages/ds/src/blocks/RentalObjectAvailabilityCalendar.tsx`

### Client SDK Types
- `packages/client-sdk/src/types/calendar.ts`

### Client SDK Hooks
- `packages/client-sdk/src/hooks/use-calendar.ts`
- `packages/client-sdk/src/hooks/use-rental-object-calendar.ts`

### API
- `apps/api/src/modules/calendar/calendar.controller.ts`
- `apps/api/src/modules/calendar/calendar.service.ts`
- `apps/api/src/modules/availability/availability.controller.ts`
- `apps/api/src/schemas/calendar.schema.ts`

### Applications
- `apps/web/src/features/rental-object-details/components/CalendarSection.tsx`
- `apps/backoffice/src/components/CalendarSection.tsx`
- `apps/minside/src/components/CalendarSection.tsx`
