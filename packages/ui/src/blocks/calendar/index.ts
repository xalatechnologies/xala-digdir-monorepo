/**
 * @digilist/ui - Calendar Blocks
 *
 * Shared calendar utilities, types, and helper functions.
 * These are used by CalendarSection controllers in apps.
 *
 * ## Architecture
 *
 * The calendar architecture follows a controller-presenter pattern:
 *
 * ```
 * APP LAYER (CalendarSection Controller)
 * ├── Uses SDK hooks (useCalendarConfig, useAvailabilityMatrix)
 * ├── Manages state (currentDate, selection)
 * └── Passes data to...
 *
 * UI LAYER (RentalObjectAvailabilityCalendar Presenter)
 * ├── Receives data as props
 * ├── Renders calendar UI
 * └── Emits callbacks (onDateChange, onCellClick, onSelectionChange)
 * ```
 *
 * ## Usage
 *
 * ```tsx
 * import {
 *   // Utility functions
 *   formatDateToISO,
 *   getWeekStart,
 *   getWeekEnd,
 *   getMonthStart,
 *   getMonthEnd,
 *   mapToCalendarCell,
 *
 *   // Default configuration
 *   DEFAULT_CALENDAR_LEGEND,
 *
 *   // Re-exported types
 *   type CalendarMode,
 *   type CalendarSlotStatus,
 *   type CalendarCell,
 *   type CalendarSelection,
 * } from '@digilist/ui/blocks/calendar';
 *
 * // Use with RentalObjectAvailabilityCalendar
 * import { RentalObjectAvailabilityCalendar } from '@digilist/ui';
 * ```
 */

// =============================================================================
// Re-export Calendar Types from types module
// =============================================================================

import type { CalendarSelection as CalendarSelectionType_ } from '../../types/rental-object-detail';

export type {
  CalendarMode,
  CalendarSlotStatus,
  CalendarSelectionType,
  CalendarViewMode,
  CalendarCell,
  CalendarSelectionRange,
  CalendarSelection,
  CalendarLegendItem,
} from '../../types/rental-object-detail';

// Local alias for use in this module
type CalendarSelection = CalendarSelectionType_;

export {
  CALENDAR_SLOT_STATUS_LABELS,
  CALENDAR_SLOT_STATUS_KEYS,
  CALENDAR_MODE_LABELS,
  DEFAULT_CALENDAR_LEGEND,
  isCalendarSlotSelectable,
  getCalendarSlotLabel,
  getCalendarSlotKey,
} from '../../types/rental-object-detail';

// =============================================================================
// Re-export Calendar Components
// =============================================================================

export {
  RentalObjectAvailabilityCalendar,
  type RentalObjectAvailabilityCalendarProps,
} from '../rental-objects/RentalObjectAvailabilityCalendar';

export {
  AvailabilityCalendar,
  type AvailabilityCalendarProps,
} from '../rental-objects/AvailabilityCalendar';

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Format date to ISO date string (YYYY-MM-DD).
 */
export function formatDateToISO(date: Date): string {
  return date.toISOString().split('T')[0]!;
}

/**
 * Get week start date (Monday).
 */
export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get week end date (Sunday).
 */
export function getWeekEnd(date: Date): Date {
  const weekStart = getWeekStart(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  return weekEnd;
}

/**
 * Get month start date.
 */
export function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Get month end date.
 */
export function getMonthEnd(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/**
 * Calculate date range based on calendar mode.
 */
export function getDateRangeForMode(
  mode: 'TIME_SLOTS' | 'ALL_DAY' | 'MULTI_DAY',
  currentDate: Date
): { from: string; to: string } {
  if (mode === 'TIME_SLOTS') {
    // Week view - Monday to Sunday
    const from = getWeekStart(currentDate);
    const to = getWeekEnd(currentDate);
    return { from: formatDateToISO(from), to: formatDateToISO(to) };
  } else {
    // Month view for ALL_DAY and MULTI_DAY
    const from = getMonthStart(currentDate);
    const to = getMonthEnd(currentDate);
    return { from: formatDateToISO(from), to: formatDateToISO(to) };
  }
}

/**
 * Map SDK AvailabilityCellDTO to CalendarCell.
 *
 * @example
 * ```tsx
 * const cells = matrixResponse.data.cells.map(mapToCalendarCell);
 * ```
 */
export function mapToCalendarCell(cell: {
  start: string;
  end: string;
  status: string;
  reasonKey?: string | null;
  bookingId?: string | null;
  blockId?: string | null;
  lockedUntil?: string | null;
}): {
  id: string;
  start: string;
  end: string;
  status: string;
  reasonKey?: string;
  bookingId?: string;
  blockId?: string;
  lockedUntil?: string;
} {
  return {
    id: `${cell.start}-${cell.end}`,
    start: cell.start,
    end: cell.end,
    status: cell.status,
    reasonKey: cell.reasonKey ?? undefined,
    bookingId: cell.bookingId ?? undefined,
    blockId: cell.blockId ?? undefined,
    lockedUntil: cell.lockedUntil ?? undefined,
  };
}

/**
 * Build calendar legend from API response or use defaults.
 */
export function buildCalendarLegend(
  apiLegend?: Array<{ status: string; labelKey: string }>,
  t?: (key: string) => string
): Array<{ status: string; label: string }> {
  if (apiLegend) {
    return apiLegend.map((item) => ({
      status: item.status,
      label: item.labelKey.includes('.')
        ? item.labelKey.split('.').pop()!
        : item.labelKey,
    }));
  }

  // Default legend with translations or fallback labels
  const fallbackLegend = [
    { status: 'AVAILABLE', label: t?.('components.calendar.statusAvailable') ?? 'Ledig' },
    { status: 'RESERVED', label: t?.('components.calendar.statusReserved') ?? 'Reservert' },
    { status: 'BOOKED', label: t?.('components.calendar.statusBooked') ?? 'Booket' },
    { status: 'BLOCKED', label: t?.('components.calendar.statusBlocked') ?? 'Blokkert' },
    { status: 'BLACKOUT', label: t?.('components.calendar.statusBlackout') ?? 'Utilgjengelig' },
    { status: 'CLOSED', label: t?.('components.calendar.statusClosed') ?? 'Stengt' },
  ];

  return fallbackLegend;
}

/**
 * Get subtitle text based on calendar mode.
 */
export function getCalendarSubtitle(
  mode: 'TIME_SLOTS' | 'ALL_DAY' | 'MULTI_DAY',
  t?: (key: string) => string
): string {
  const subtitles: Record<string, string> = {
    TIME_SLOTS: t?.('components.calendar.selectTimeSlots') ?? 'Velg tidspunkt',
    ALL_DAY: t?.('components.calendar.selectDays') ?? 'Velg dag(er)',
    MULTI_DAY: t?.('components.calendar.selectPeriod') ?? 'Velg periode',
  };
  return subtitles[mode] ?? subtitles.TIME_SLOTS;
}

// =============================================================================
// CalendarSection Props Type (for app controllers)
// =============================================================================

/**
 * Standard props for CalendarSection controller components.
 * Apps should implement this interface for consistent behavior.
 */
export interface CalendarSectionControllerProps {
  /** Rental object ID to fetch calendar data for */
  rentalObjectId: string;
  /** @deprecated Use rentalObjectId instead */
  listingId?: string;
  /** Optional booking type filter */
  bookingType?: string;
  /** Calendar interaction mode */
  mode?: 'view' | 'interactive';
  /** Callback when selection changes (interactive mode only) */
  onSelectionChange?: (selection: CalendarSelection) => void;
  /** Whether the calendar is read-only */
  readOnly?: boolean;
  /** Custom title */
  title?: string;
  /** Custom subtitle */
  subtitle?: string;
  /** Force a specific calendar mode (TIME_SLOTS, ALL_DAY, MULTI_DAY) */
  forceMode?: 'TIME_SLOTS' | 'ALL_DAY' | 'MULTI_DAY';
  /** Custom class name */
  className?: string;
}
