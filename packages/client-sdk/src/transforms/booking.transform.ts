/**
 * Booking Transformers
 *
 * Reusable transformation utilities for booking data.
 * Used by web, backoffice, and minside apps.
 */

import type { Booking, BookingStatus, PaymentStatus, CalendarEvent, Allocation } from '../types';

// =============================================================================
// UI Types for Transformed Bookings
// =============================================================================

export interface TransformedTimeSlot {
  startTime: string;
  endTime: string;
  startDate: Date;
  endDate: Date;
  duration: string;
  durationMinutes: number;
  displayTime: string;
  displayDate: string;
  displayDateTime: string;
}

export interface TransformedUser {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
}

export interface TransformedOrganization {
  id: string;
  name?: string;
}

export interface TransformedListing {
  id: string;
  name?: string;
}

export interface TransformedPricing {
  amount: number;
  currency: string;
  formatted: string;
}

export interface TransformedBooking {
  // Core
  id: string;
  tenantId: string;
  status: BookingStatus;
  statusLabel: string;
  statusColor: string;
  paymentStatus?: PaymentStatus;
  paymentStatusLabel?: string;

  // Time
  timeSlot: TransformedTimeSlot;

  // Relations
  listing: TransformedListing;
  user: TransformedUser;
  organization?: TransformedOrganization;

  // Pricing
  pricing: TransformedPricing;

  // Additional
  notes?: string;
  quantity?: number;

  // Metadata
  metadata?: {
    attendees?: number;
    equipment?: string[];
    recurring?: boolean;
  };

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface TransformedCalendarEvent {
  id: string;
  bookingId?: string;
  title: string;
  start: Date;
  end: Date;
  startTime: string;
  endTime: string;
  status: string;
  statusColor: string;
  listingId: string;
  listingName?: string;
  userName?: string;
  organizationName?: string;
}

export interface TransformedAllocation {
  id: string;
  listingId: string;
  bookingId?: string;
  type: string;
  typeLabel: string;
  status: string;
  title?: string;
  notes?: string;
  timeSlot: TransformedTimeSlot;
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// Status Labels and Colors
// =============================================================================

const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Venter',
  confirmed: 'Bekreftet',
  cancelled: 'Kansellert',
  completed: 'Fullført',
  rejected: 'Avvist',
};

const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  pending: '#F59E0B', // amber
  confirmed: '#10B981', // green
  cancelled: '#EF4444', // red
  completed: '#6B7280', // gray
  rejected: '#EF4444', // red
};

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: 'Venter',
  paid: 'Betalt',
  refunded: 'Refundert',
  failed: 'Feilet',
};

const ALLOCATION_TYPE_LABELS: Record<string, string> = {
  BOOKING: 'Booking',
  BLOCK: 'Blokkert',
  MAINTENANCE: 'Vedlikehold',
  SEASONAL: 'Sesongleie',
};

// =============================================================================
// Transform Utilities
// =============================================================================

/**
 * Get display label for booking status
 */
export function getBookingStatusLabel(status: BookingStatus): string {
  return BOOKING_STATUS_LABELS[status] || status;
}

/**
 * Get color for booking status
 */
export function getBookingStatusColor(status: BookingStatus): string {
  return BOOKING_STATUS_COLORS[status] || '#6B7280';
}

/**
 * Get display label for payment status
 */
export function getPaymentStatusLabel(status: PaymentStatus): string {
  return PAYMENT_STATUS_LABELS[status] || status;
}

/**
 * Format duration in minutes to human-readable string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return hours === 1 ? '1 time' : `${hours} timer`;
  }
  return `${hours}t ${mins}min`;
}

/**
 * Format date to Norwegian locale
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('nb-NO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Format time to HH:MM
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('nb-NO', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format date and time
 */
export function formatDateTime(date: Date): string {
  return `${formatDate(date)} kl. ${formatTime(date)}`;
}

/**
 * Transform time slot from booking
 */
export function transformTimeSlot(startTime: string, endTime: string): TransformedTimeSlot {
  const startDate = new Date(startTime);
  const endDate = new Date(endTime);
  const durationMinutes = Math.round((endDate.getTime() - startDate.getTime()) / 60000);

  return {
    startTime,
    endTime,
    startDate,
    endDate,
    duration: formatDuration(durationMinutes),
    durationMinutes,
    displayTime: `${formatTime(startDate)} - ${formatTime(endDate)}`,
    displayDate: formatDate(startDate),
    displayDateTime: `${formatDate(startDate)}, ${formatTime(startDate)} - ${formatTime(endDate)}`,
  };
}

/**
 * Format price with currency
 */
export function formatPrice(amount: number | string, currency: string = 'NOK'): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `${numAmount.toLocaleString('nb-NO')} ${currency}`;
}

// =============================================================================
// Main Transform Functions
// =============================================================================

/**
 * Transform a raw API booking to a UI-friendly format
 */
export function transformBooking(booking: Booking): TransformedBooking {
  const amount = typeof booking.totalPrice === 'string'
    ? parseFloat(booking.totalPrice)
    : booking.totalPrice;

  return {
    // Core
    id: booking.id,
    tenantId: booking.tenantId,
    status: booking.status,
    statusLabel: getBookingStatusLabel(booking.status),
    statusColor: getBookingStatusColor(booking.status),
    paymentStatus: booking.paymentStatus,
    paymentStatusLabel: booking.paymentStatus ? getPaymentStatusLabel(booking.paymentStatus) : undefined,

    // Time
    timeSlot: transformTimeSlot(booking.startTime, booking.endTime),

    // Relations
    listing: {
      id: booking.listingId,
      name: booking.listingName,
    },
    user: {
      id: booking.userId,
      name: booking.userName,
      email: booking.userEmail,
      phone: booking.userPhone,
    },
    organization: booking.organizationId ? {
      id: booking.organizationId,
      name: booking.organizationName,
    } : undefined,

    // Pricing
    pricing: {
      amount,
      currency: booking.currency,
      formatted: formatPrice(amount, booking.currency),
    },

    // Additional
    notes: booking.notes,
    quantity: booking.quantity,

    // Metadata
    metadata: booking.metadata ? {
      attendees: booking.metadata.attendees,
      equipment: booking.metadata.equipment,
      recurring: booking.metadata.recurring,
    } : undefined,

    // Timestamps
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
  };
}

/**
 * Transform multiple bookings
 */
export function transformBookings(bookings: Booking[]): TransformedBooking[] {
  return bookings.map(transformBooking);
}

/**
 * Transform a calendar event
 */
export function transformCalendarEvent(event: CalendarEvent): TransformedCalendarEvent {
  const start = new Date(event.start);
  const end = new Date(event.end);

  return {
    id: event.id,
    bookingId: event.bookingId,
    title: event.title || event.listingName || 'Booking',
    start,
    end,
    startTime: event.startTime || event.start,
    endTime: event.endTime || event.end,
    status: event.status,
    statusColor: event.color || getBookingStatusColor(event.status as BookingStatus),
    listingId: event.listingId,
    listingName: event.listingName,
    userName: event.userName,
    organizationName: event.organizationName,
  };
}

/**
 * Transform multiple calendar events
 */
export function transformCalendarEvents(events: CalendarEvent[]): TransformedCalendarEvent[] {
  return events.map(transformCalendarEvent);
}

/**
 * Transform an allocation
 */
export function transformAllocation(allocation: Allocation): TransformedAllocation {
  return {
    id: allocation.id,
    listingId: allocation.listingId,
    bookingId: allocation.bookingId,
    type: allocation.allocationType || 'BOOKING',
    typeLabel: ALLOCATION_TYPE_LABELS[allocation.allocationType || 'BOOKING'] || allocation.allocationType || 'Booking',
    status: allocation.status,
    title: allocation.title,
    notes: allocation.notes,
    timeSlot: transformTimeSlot(allocation.startTime, allocation.endTime),
    createdAt: allocation.createdAt,
    updatedAt: allocation.updatedAt,
  };
}

/**
 * Transform multiple allocations
 */
export function transformAllocations(allocations: Allocation[]): TransformedAllocation[] {
  return allocations.map(transformAllocation);
}
