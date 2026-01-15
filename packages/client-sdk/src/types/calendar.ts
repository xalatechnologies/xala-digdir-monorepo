/**
 * Calendar Types
 * Single Responsibility: All calendar-related type definitions for projection DTOs
 */

import type { ActionDTO, PolicyDecisionDTO } from './actions';
import type { BaseQueryParams } from './enums';

// =============================================================================
// Calendar Enums
// =============================================================================

/**
 * Calendar granularity mode - determines how the calendar displays and selects time
 */
export type CalendarGranularity = 'TIME_SLOTS' | 'ALL_DAY' | 'MULTI_DAY';

/**
 * Slot availability status - all possible states for a calendar slot
 */
export type SlotStatus = 'AVAILABLE' | 'RESERVED' | 'BOOKED' | 'BLOCKED' | 'BLACKOUT' | 'CLOSED';

/**
 * Selectable unit type - determines what user can select in the calendar
 */
export type SelectableUnit = 'slot' | 'day' | 'range';

/**
 * Calendar view type - available view modes for the calendar UI
 */
export type CalendarView = 'month' | 'week' | 'day';

// =============================================================================
// Opening Hours Types
// =============================================================================

/**
 * Single day opening hours with open and close times
 */
export interface DayOpeningHours {
  open: string;  // HH:mm format, e.g., "08:00"
  close: string; // HH:mm format, e.g., "17:00"
  closed?: boolean;
}

/**
 * Holiday or special date exception to regular opening hours
 */
export interface OpeningHoursException {
  date: string;  // ISO date format, e.g., "2025-12-25"
  open?: string;
  close?: string;
  closed: boolean;
  reasonKey?: string; // i18n key for the reason, e.g., "holiday.christmas"
}

/**
 * Complete opening hours configuration
 */
export interface OpeningHoursDTO {
  /** Regular weekly schedule - keys are day numbers (0-6, Sunday-Saturday) or day names */
  weekly: Record<string, DayOpeningHours>;
  /** Holiday and special date exceptions that override weekly schedule */
  exceptions?: OpeningHoursException[];
}

// =============================================================================
// Booking Type Configuration
// =============================================================================

/**
 * Booking type configuration - defines allowed booking types for a rental object
 */
export interface BookingTypeDTO {
  /** Unique code for this booking type, e.g., "HOURLY", "ALL_DAY", "MULTI_DAY" */
  code: string;
  /** i18n key for display label */
  labelKey: string;
  /** Whether this is the default booking type for the rental object */
  default: boolean;
  /** Additional rules specific to this booking type */
  rules: Record<string, unknown>;
}

// =============================================================================
// Calendar UI Configuration
// =============================================================================

/**
 * UI configuration hints for calendar rendering
 */
export interface CalendarUIConfigDTO {
  /** Show week view option */
  showWeekView: boolean;
  /** Show month view option */
  showMonthView: boolean;
  /** Show day view option */
  showDayView: boolean;
  /** Default view to display */
  defaultView: CalendarView;
  /** Allow selecting multiple slots/days */
  allowMultiSelect: boolean;
}

// =============================================================================
// Calendar Permissions
// =============================================================================

/**
 * RBAC permissions for calendar interactions
 */
export interface CalendarPermissionsDTO {
  /** Can the user view the calendar */
  canViewCalendar: boolean;
  /** Can the user select slots (for booking intent) */
  canSelectSlot: boolean;
  /** Can the user request a booking */
  canRequestBooking: boolean;
}

// =============================================================================
// Rental Object Calendar Config Projection DTO
// =============================================================================

/**
 * Calendar configuration projection - complete configuration for calendar behavior
 * Returned by GET /api/rental-objects/:id/calendar-config
 */
export interface RentalObjectCalendarConfigProjectionDTO {
  /** Rental object identifier */
  rentalObjectId: string;

  /** Calendar mode determining UI rendering and selection behavior */
  granularity: CalendarGranularity;

  /** Timezone for all datetime calculations, e.g., "Europe/Oslo" */
  timezone: string;

  // Slot behavior
  /** Slot size in minutes: 15, 30, 60, or 1440 for ALL_DAY */
  slotSizeMinutes: number;
  /** Unit type the user can select */
  selectableUnit: SelectableUnit;
  /** Minimum booking duration in minutes */
  minDurationMinutes: number;
  /** Maximum booking duration in minutes (null = no limit) */
  maxDurationMinutes?: number | null;
  /** Step increment for duration selection in minutes */
  stepMinutes: number;
  /** Buffer time required before booking in minutes */
  bufferBeforeMinutes?: number;
  /** Buffer time required after booking in minutes */
  bufferAfterMinutes?: number;

  // Booking window rules
  /** Minimum notice required before booking start (in minutes) */
  minNoticeMinutes?: number;
  /** How many days ahead bookings are allowed */
  bookingHorizonDays?: number;
  /** Whether same-day bookings are permitted */
  allowSameDayBooking: boolean;

  /** Opening hours configuration */
  openingHours: OpeningHoursDTO;

  /** Available booking types for this rental object */
  bookingTypes: BookingTypeDTO[];

  /** UI rendering hints */
  ui: CalendarUIConfigDTO;

  // RBAC payload
  /** User permissions for calendar actions */
  permissions: CalendarPermissionsDTO;

  /** Available actions based on current context */
  availableActions: ActionDTO[];

  /** Policy decisions for transparency/debugging (optional) */
  policyDecisions?: PolicyDecisionDTO[];
}

// Backward compatibility alias (deprecated)
/** @deprecated Use RentalObjectCalendarConfigProjectionDTO instead */
export type ListingCalendarConfigProjectionDTO = RentalObjectCalendarConfigProjectionDTO & {
  /** @deprecated Use rentalObjectId instead */
  listingId?: string;
};

// =============================================================================
// Availability Cell DTO
// =============================================================================

/**
 * Single cell in the availability matrix - represents one time slot
 */
export interface AvailabilityCellDTO {
  /** Start of the slot in ISO datetime format */
  start: string;
  /** End of the slot in ISO datetime format */
  end: string;
  /** Current availability status of the slot */
  status: SlotStatus;
  /** i18n key explaining why the slot is unavailable (null if available) */
  reasonKey?: string | null;
  /** Booking ID if status is BOOKED or RESERVED */
  bookingId?: string | null;
  /** Block ID if status is BLOCKED or BLACKOUT */
  blockId?: string | null;
  /** ISO datetime until which a reservation lock is held */
  lockedUntil?: string | null;
}

// =============================================================================
// Slot Status Legend
// =============================================================================

/**
 * Legend entry for slot status display
 */
export interface SlotStatusLegendDTO {
  /** Status code */
  status: SlotStatus;
  /** i18n key for status label */
  labelKey: string;
}

// =============================================================================
// Rental Object Availability Matrix Projection DTO
// =============================================================================

/**
 * Availability matrix projection - cell-by-cell availability for a date range
 * Returned by GET /api/availability/:rentalObjectId
 */
export interface RentalObjectAvailabilityMatrixProjectionDTO {
  /** Rental object identifier */
  rentalObjectId: string;

  /** Start of the queried date range in ISO date format */
  from: string;

  /** End of the queried date range in ISO date format */
  to: string;

  /** Granularity used for generating cells (should match config) */
  granularity: CalendarGranularity;

  /** Array of availability cells covering the date range */
  cells: AvailabilityCellDTO[];

  /** Legend mapping status codes to display labels */
  legend: SlotStatusLegendDTO[];
}

// Backward compatibility alias (deprecated)
/** @deprecated Use RentalObjectAvailabilityMatrixProjectionDTO instead */
export type ListingAvailabilityMatrixProjectionDTO = RentalObjectAvailabilityMatrixProjectionDTO & {
  /** @deprecated Use rentalObjectId instead */
  listingId?: string;
};

// =============================================================================
// Query Parameters
// =============================================================================

/**
 * Query parameters for availability matrix endpoint
 */
export interface AvailabilityMatrixQueryParams extends BaseQueryParams {
  /** Start date in ISO format (required) */
  from: string;
  /** End date in ISO format (required) */
  to: string;
  /** Booking type filter (optional) */
  bookingType?: string;
}

// =============================================================================
// Slot Status Constants
// =============================================================================

/**
 * SlotStatus to Norwegian display labels
 */
export const SLOT_STATUS_LABELS: Record<SlotStatus, string> = {
  AVAILABLE: 'Ledig',
  RESERVED: 'Reservert',
  BOOKED: 'Booket',
  BLOCKED: 'Blokkert',
  BLACKOUT: 'Utilgjengelig',
  CLOSED: 'Stengt',
};

/**
 * SlotStatus to i18n key mapping
 */
export const SLOT_STATUS_LABEL_KEYS: Record<SlotStatus, string> = {
  AVAILABLE: 'calendar.slot.available',
  RESERVED: 'calendar.slot.reserved',
  BOOKED: 'calendar.slot.booked',
  BLOCKED: 'calendar.slot.blocked',
  BLACKOUT: 'calendar.slot.blackout',
  CLOSED: 'calendar.slot.closed',
};

/**
 * CalendarGranularity to Norwegian display labels
 */
export const CALENDAR_GRANULARITY_LABELS: Record<CalendarGranularity, string> = {
  TIME_SLOTS: 'Tidsluke',
  ALL_DAY: 'Heldag',
  MULTI_DAY: 'Flere dager',
};

/**
 * Default slot status legend for UI rendering
 */
export const DEFAULT_SLOT_STATUS_LEGEND: SlotStatusLegendDTO[] = [
  { status: 'AVAILABLE', labelKey: 'calendar.slot.available' },
  { status: 'RESERVED', labelKey: 'calendar.slot.reserved' },
  { status: 'BOOKED', labelKey: 'calendar.slot.booked' },
  { status: 'BLOCKED', labelKey: 'calendar.slot.blocked' },
  { status: 'BLACKOUT', labelKey: 'calendar.slot.blackout' },
  { status: 'CLOSED', labelKey: 'calendar.slot.closed' },
];
