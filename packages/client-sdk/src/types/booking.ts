/**
 * Booking Types
 * Single Responsibility: All booking-related type definitions
 */

import type { TenantEntity, BookingStatus, PaymentStatus, AllocationStatus, BaseQueryParams } from './enums';

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
  // Joined/computed fields from API
  userName?: string;
  listingName?: string;
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
  // Alias properties for compatibility
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

export interface UpdateAllocationDTO {
  startTime?: string | Date;
  endTime?: string | Date;
  title?: string;
  status?: AllocationStatus;
  notes?: string;
}

// =============================================================================
// Block Types (Calendar Blocking)
// =============================================================================

export type BlockType = 'maintenance' | 'closed' | 'hold' | 'emergency' | 'internal';
export type BlockStatus = 'active' | 'cancelled';

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number;
  weekdays?: number[];        // 0=Sun, 1=Mon, 2=Tue, etc.
  endDate?: string;
  exceptions?: string[];      // Dates to skip (ISO format)
}

export interface Block extends TenantEntity {
  listingId: string;
  title: string;
  startTime: string;
  endTime: string;
  blockType: BlockType;
  status: BlockStatus;
  notes?: string;
  recurrenceRule?: RecurrenceRule;
  createdBy: string;
  // Joined fields from API
  listingName?: string;
  createdByName?: string;
}

export interface CreateBlockDTO {
  listingId: string;
  title: string;
  startTime: string | Date;
  endTime: string | Date;
  blockType: BlockType;
  notes?: string;
  recurrence?: RecurrenceRule;
  allDay?: boolean;
  notifyAffectedUsers?: boolean;
}

export interface UpdateBlockDTO {
  title?: string;
  startTime?: string | Date;
  endTime?: string | Date;
  blockType?: BlockType;
  notes?: string;
  recurrence?: RecurrenceRule;
  allDay?: boolean;
}

export interface BlockQueryParams extends BaseQueryParams {
  listingId?: string;
  blockType?: BlockType;
  status?: BlockStatus;
  from?: string;
  to?: string;
}

// =============================================================================
// Conflict Detection Types
// =============================================================================

export type ConflictType = 'booking' | 'block' | 'allocation' | 'seasonal';

export interface Conflict {
  type: ConflictType;
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  resolvable: boolean;
  details?: {
    userName?: string;
    organizationName?: string;
    status?: string;
  };
}

export interface ConflictCheckParams {
  listingId: string;
  startTime: string;
  endTime: string;
  excludeId?: string;         // Exclude this block ID from check (for updates)
  recurring?: RecurrenceRule;
}

export interface ConflictCheckResult {
  hasConflicts: boolean;
  conflicts: Conflict[];
  canOverride: boolean;       // True if admin can force-create despite conflicts
}
