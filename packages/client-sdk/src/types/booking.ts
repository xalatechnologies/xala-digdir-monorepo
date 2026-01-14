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
