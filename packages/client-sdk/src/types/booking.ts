/**
 * Booking Types
 * Single Responsibility: All booking-related type definitions
 */

import type { TenantEntity, BookingStatus, PaymentStatus, AllocationStatus, BaseQueryParams } from './enums';

// =============================================================================
// Booking Mode Types
// =============================================================================

/**
 * Booking modes supported by listings.
 * - SINGLE_SLOT: Standard one-time booking selection
 * - IN_GAME: Short notice / live availability / rapid reserve-confirm patterns
 * - RECURRING: Weekly/monthly patterns with conflict detection and preview
 */
export type BookingMode = 'SINGLE_SLOT' | 'IN_GAME' | 'RECURRING';

/**
 * Constraints for recurring booking mode.
 * Defines rules and limits for recurring booking patterns.
 */
export interface RecurringConstraintsDTO {
  /** Whether recurring mode is enabled for this listing */
  enabled: boolean;
  /** Allowed recurrence frequencies */
  allowedFrequencies: Array<'WEEKLY' | 'MONTHLY'>;
  /** Maximum number of occurrences per recurring booking */
  maxOccurrences: number;
  /** Maximum date range in days for recurring bookings */
  maxRangeDays: number;
  /** Minimum advance notice in minutes */
  minNoticeMinutes?: number;
  /** Allowed weekdays for recurring bookings (ISO 1-7, where 1=Monday) */
  allowedWeekdays?: number[];
  /** Rules for handling conflicts and special dates */
  cutoffRules?: {
    /** Whether bookings on holidays are allowed */
    allowHolidays: boolean;
    /** Stop creation on first conflict (when false, continues to next occurrence) */
    stopOnConflict: boolean;
    /** Allow partial creation when some occurrences conflict */
    allowPartial: boolean;
  };
}

/**
 * Constraints for in-game booking mode.
 * Defines rules for short-notice, rapid booking patterns.
 */
export interface InGameConstraintsDTO {
  /** Whether in-game mode is enabled for this listing */
  enabled: boolean;
  /** Minimum booking duration in minutes */
  minDurationMinutes: number;
  /** Maximum booking duration in minutes */
  maxDurationMinutes: number;
  /** Buffer time in minutes before booking can start */
  bufferMinutes?: number;
  /** Time-to-live in seconds for reserved slots before auto-release */
  reservationTtlSeconds?: number;
  /** Maximum advance booking window in hours (e.g., 24 = book up to 24h ahead) */
  maxAdvanceHours?: number;
  /** Minimum advance booking time in minutes (e.g., 15 = must book at least 15min ahead) */
  minAdvanceMinutes?: number;
  /** Whether instant confirmation is enabled (no approval required) */
  instantConfirmation?: boolean;
}

// =============================================================================
// Booking Entity
// =============================================================================

export interface BookingMetadata {
  attendees?: number;
  equipment?: string[];
  recurring?: boolean;
  frequency?: string;
  weekdays?: number[];
}

export interface Booking extends TenantEntity {
  listingId: string;
  userId: string;
  organizationId?: string;
  status: BookingStatus;
  paymentStatus?: PaymentStatus;
  startTime: string;
  endTime: string;
  quantity?: number;
  totalPrice: string;
  currency: string;
  notes?: string;
  metadata?: BookingMetadata;
  payments?: PaymentTransaction[];
  // Display/denormalized fields (populated by backend)
  listingName?: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  organizationName?: string;
}

// =============================================================================
// Booking DTOs
// =============================================================================

export interface CreateBookingDTO {
  listingId: string;
  startTime: string | Date;
  endTime: string | Date;
  userId?: string;
  notes?: string;
  totalPrice?: number;
  metadata?: BookingMetadata;
}

export interface UpdateBookingDTO {
  startTime?: string | Date;
  endTime?: string | Date;
  notes?: string;
  metadata?: BookingMetadata;
}

export interface CancelBookingDTO {
  reason?: string;
}

export interface BookingQueryParams extends BaseQueryParams {
  status?: BookingStatus;
  listingId?: string;
  userId?: string;
  organizationId?: string;
  from?: string;
  to?: string;
}

// =============================================================================
// Booking Related Types
// =============================================================================

export interface BookingPricing {
  listingId: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  basePrice: number;
  discount: number;
  totalPrice: number;
  currency: string;
}

export interface CalendarEvent {
  id: string;
  listingId: string;
  listingName?: string;
  title?: string;
  start: string;
  end: string;
  // Aliases for start/end (some components use these)
  startTime?: string;
  endTime?: string;
  status: string;
  bookingId?: string;
  userName?: string;
  organizationName?: string;
  color?: string;
}

export interface CalendarQueryParams {
  listingId?: string;
  startDate?: string;
  endDate?: string;
}

// =============================================================================
// Allocation Types
// =============================================================================

export interface Allocation extends TenantEntity {
  listingId: string;
  bookingId?: string;
  startTime: string;
  endTime: string;
  quantity?: number;
  allocationType?: 'BOOKING' | 'BLOCK' | 'MAINTENANCE' | 'SEASONAL';
  status: AllocationStatus;
  title?: string;
  notes?: string;
}

export interface CreateAllocationDTO {
  listingId: string;
  startTime: string | Date;
  endTime: string | Date;
  title?: string;
  status?: AllocationStatus;
  notes?: string;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    endDate: string;
    weekdays?: number[];
  };
}

// =============================================================================
// Payment Transaction Types
// =============================================================================

export interface PaymentTransaction {
  transactionId: string;
  bookingId: string;
  provider: 'vipps' | 'stripe' | 'invoice';
  transactionType: 'payment' | 'refund' | 'capture' | 'reserve';
  amount: number;
  currency: string;
  status: 'initiated' | 'pending' | 'completed' | 'failed' | 'cancelled';
  orderId?: string;
  createdAt: string;
  completedAt?: string;
  failureReason?: string;
  metadata?: Record<string, unknown>;
}

// =============================================================================
// Receipt Types (KRAV-ADM-07)
// =============================================================================

export interface BookingReceipt {
  receiptNumber: string;
  bookingId: string;
  generatedAt: string;
  customer: {
    userId: string;
    tenantId: string;
  };
  service: {
    listingId: string;
    description: string;
    duration: string;
  };
  location: {
    tenantId: string;
    listingId: string;
  };
  timing: {
    bookingDate: string;
    serviceDate: string;
    receiptDate: string;
  };
  payment: {
    amount: string;
    currency: string;
    status: string;
  };
}

// =============================================================================
// Booking Document Types (for getDocuments endpoint)
// =============================================================================

export interface BookingDocument {
  id: string;
  bookingId: string;
  type: 'confirmation' | 'receipt' | 'decision' | 'terms' | 'contract' | 'cancellation';
  name: string;
  description?: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: string;
}

// =============================================================================
// Recurring Booking Types
// =============================================================================

/**
 * Recurrence frequency for recurring bookings.
 */
export type RecurringFrequency = 'WEEKLY' | 'MONTHLY';

/**
 * Status of an individual occurrence in a recurring booking preview.
 * - AVAILABLE: Slot is available for booking
 * - CONFLICT: Slot overlaps with existing booking
 * - RESERVED: Slot is temporarily reserved by another user
 * - BLOCKED: Slot is blocked by admin/maintenance
 * - BLACKOUT: Slot falls on holiday/blackout period
 * - CLOSED: Listing is closed during this time
 */
export type OccurrenceStatus = 'AVAILABLE' | 'CONFLICT' | 'RESERVED' | 'BLOCKED' | 'BLACKOUT' | 'CLOSED';

/**
 * End condition type for recurring bookings.
 * - AFTER_OCCURRENCES: End after N occurrences
 * - UNTIL_DATE: End on or before a specific date
 */
export type RecurringEndConditionType = 'AFTER_OCCURRENCES' | 'UNTIL_DATE';

/**
 * End condition for recurring bookings.
 */
export interface RecurringEndCondition {
  /** Type of end condition */
  type: RecurringEndConditionType;
  /** Number of occurrences (when type is AFTER_OCCURRENCES) */
  occurrences?: number;
  /** End date in ISO 8601 format (when type is UNTIL_DATE) */
  untilDate?: string;
}

/**
 * Individual occurrence in a recurring booking preview.
 * Represents a single booking instance with its availability status.
 */
export interface RecurringOccurrenceDTO {
  /** Unique identifier for this occurrence (0-indexed sequence) */
  index: number;
  /** Start time of the occurrence in ISO 8601 format */
  startTime: string;
  /** End time of the occurrence in ISO 8601 format */
  endTime: string;
  /** Availability status of this occurrence */
  status: OccurrenceStatus;
  /** Localization key for conflict/block reason (e.g., "booking.conflict.existingBooking") */
  reasonKey?: string;
  /** ID of conflicting booking/allocation if applicable */
  conflictId?: string;
  /** Whether this occurrence is selected for creation (used in partial create scenarios) */
  selected?: boolean;
}

/**
 * Unified booking selection model across all booking modes.
 * Supports SINGLE_SLOT, IN_GAME, and RECURRING booking patterns.
 */
export interface BookingSelectionDTO {
  /** ID of the listing being booked */
  listingId: string;
  /** Booking mode for this selection */
  mode: BookingMode;
  /** Start time for SINGLE_SLOT/IN_GAME, or pattern start for RECURRING */
  startTime: string;
  /** End time for SINGLE_SLOT/IN_GAME, or pattern end time-of-day for RECURRING */
  endTime: string;
  /** User ID (optional, defaults to authenticated user) */
  userId?: string;
  /** Organization ID (for organizational bookings) */
  organizationId?: string;
  /** Notes for the booking */
  notes?: string;
  /** Additional booking metadata */
  metadata?: BookingMetadata;

  // Recurring-specific fields
  /** Recurrence frequency (WEEKLY or MONTHLY) */
  frequency?: RecurringFrequency;
  /** Selected weekdays for recurring (ISO 1-7, where 1=Monday) */
  weekdays?: number[];
  /** End condition for recurring bookings */
  endCondition?: RecurringEndCondition;

  // In-game specific fields
  /** Duration in minutes for IN_GAME mode */
  durationMinutes?: number;
}

/**
 * Summary statistics for recurring booking preview/result.
 */
export interface RecurringSummary {
  /** Total number of occurrences in the series */
  totalOccurrences: number;
  /** Number of occurrences that are available */
  availableCount: number;
  /** Number of occurrences with conflicts */
  conflictCount: number;
  /** Number of occurrences blocked by admin */
  blockedCount: number;
  /** Number of occurrences on blackout dates */
  blackoutCount: number;
  /** Total estimated price for all available occurrences */
  totalPrice: number;
  /** Currency code */
  currency: string;
}

/**
 * Server-computed recurring booking preview projection.
 * Contains all occurrences with their status and availability information.
 */
export interface RecurringPreviewProjectionDTO {
  /** ID of the listing */
  listingId: string;
  /** Original selection used to generate this preview */
  selection: BookingSelectionDTO;
  /** All generated occurrences with status */
  occurrences: RecurringOccurrenceDTO[];
  /** Summary statistics */
  summary: RecurringSummary;
  /** Proposed selection with only available occurrences (for partial create) */
  proposedSelection?: BookingSelectionDTO;
  /** Preview generation timestamp */
  generatedAt: string;
  /** Preview validity period (ISO 8601 duration, e.g., "PT5M" for 5 minutes) */
  validFor?: string;
  /** Available actions based on preview state */
  availableActions: Array<'CREATE_ALL' | 'CREATE_AVAILABLE' | 'MODIFY_SELECTION'>;
  /** Permissions for this preview */
  permissions: {
    canCreateAll: boolean;
    canCreatePartial: boolean;
    canModify: boolean;
  };
}

/**
 * Create recurring booking request DTO.
 * Extends BookingSelectionDTO with conflict handling policy.
 */
export interface CreateRecurringBookingDTO extends BookingSelectionDTO {
  /** Conflict handling policy */
  policy: {
    /** Stop on first conflict (true) or continue creating available (false) */
    stopOnConflict: boolean;
    /** Allow partial creation when some occurrences conflict */
    allowPartial: boolean;
  };
  /** Optional: specific occurrence indices to create (for selective creation) */
  selectedOccurrences?: number[];
}

/**
 * Individual occurrence result after recurring booking creation.
 */
export interface RecurringOccurrenceResultDTO {
  /** Occurrence index in the series */
  index: number;
  /** Start time of the occurrence */
  startTime: string;
  /** End time of the occurrence */
  endTime: string;
  /** Whether this occurrence was successfully created */
  success: boolean;
  /** Created booking ID (if successful) */
  bookingId?: string;
  /** Failure reason key (if failed) */
  reasonKey?: string;
  /** ID of conflicting entity (if applicable) */
  conflictId?: string;
}

/**
 * Result projection for recurring booking creation.
 * Contains both successfully created and failed occurrences.
 */
export interface RecurringBookingResultProjectionDTO {
  /** ID of the listing */
  listingId: string;
  /** Successfully created occurrences */
  created: RecurringOccurrenceResultDTO[];
  /** Failed occurrences with reasons */
  failed: RecurringOccurrenceResultDTO[];
  /** Summary of creation result */
  summary: {
    /** Total occurrences attempted */
    totalAttempted: number;
    /** Successfully created count */
    createdCount: number;
    /** Failed count */
    failedCount: number;
    /** Total price of created bookings */
    totalPrice: number;
    /** Currency code */
    currency: string;
  };
  /** Created at timestamp */
  createdAt: string;
  /** Permissions for post-creation actions */
  permissions: {
    canViewBookings: boolean;
    canCancelAll: boolean;
    canModify: boolean;
  };
}
