/**
 * RentalObjectCalendar Types
 * All types derived from rental_objects projection DTOs
 */

/**
 * Slot status from rental_objects availability projection
 */
export type SlotStatus = 'AVAILABLE' | 'RESERVED' | 'BOOKED' | 'BLOCKED' | 'BLACKOUT';

/**
 * Calendar display mode - derived from rental_objects.timeMode
 */
export type CalendarMode = 'TIME' | 'ALL_DAY' | 'RECURRING';

/**
 * Available actions from projection
 */
export type CalendarAction = 'BOOK' | 'REQUEST' | 'WAITLIST' | 'MODIFY';

/**
 * Calendar slot - rendered from availability projection
 */
export interface CalendarSlot {
  /** Slot ID */
  id: string;
  /** Start time (ISO 8601) */
  startTime: string;
  /** End time (ISO 8601) */
  endTime: string;
  /** Slot status from projection */
  status: SlotStatus;
  /** Localization key for policy reason (if blocked) */
  policyReasonKey?: string;
  /** Price for this slot (if available) */
  price?: number;
  /** Currency code */
  currency?: string;
  /** Available actions for this slot */
  availableActions: CalendarAction[];
}

/**
 * Calendar configuration from rental_objects projection
 */
export interface CalendarConfig {
  /** Calendar display mode */
  mode: CalendarMode;
  /** Minimum booking duration in minutes */
  minDurationMinutes: number;
  /** Maximum booking duration in minutes */
  maxDurationMinutes: number;
  /** Slot duration in minutes (for TIME mode) */
  slotDurationMinutes: number;
  /** Buffer time between bookings in minutes */
  bufferTimeMinutes: number;
  /** Available booking modes */
  availableModes: CalendarMode[];
  /** Operating hours */
  operatingHours?: {
    start: string;
    end: string;
  };
}

/**
 * Selection state managed by component
 */
export interface CalendarSelection {
  /** Selected start time */
  startTime: string | null;
  /** Selected end time */
  endTime: string | null;
  /** Current mode */
  mode: CalendarMode;
}

/**
 * RentalObjectCalendar Props
 */
export interface RentalObjectCalendarProps {
  /** Rental object ID */
  rentalObjectId: string;
  /** Rental object name (for display) */
  rentalObjectName: string;
  /** Calendar configuration from projection */
  config: CalendarConfig;
  /** Available slots from projection */
  slots: CalendarSlot[];
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: string;
  /** Current selection */
  selection?: CalendarSelection;
  /** Callback when selection changes */
  onSelectionChange?: (selection: CalendarSelection) => void;
  /** Callback when user requests booking */
  onBook?: (selection: CalendarSelection) => void;
  /** Callback when user requests to join waitlist */
  onWaitlist?: (selection: CalendarSelection) => void;
  /** Callback when user requests to modify */
  onModify?: (selection: CalendarSelection) => void;
  /** Translation function for localization keys */
  t?: (key: string) => string;
  /** Locale for date formatting */
  locale?: string;
  /** CSS class name */
  className?: string;
}
