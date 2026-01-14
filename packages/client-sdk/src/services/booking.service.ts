/**
 * Booking Service
 * Single Responsibility: Handle all booking-related API operations
 */

import { BaseService } from './base.service';
import type {
  Booking,
  BookingQueryParams,
  CreateBookingDTO,
  UpdateBookingDTO,
  CancelBookingDTO,
  BookingPricing,
  BookingReceipt,
  BookingDocument,
  CalendarEvent,
  CalendarQueryParams,
  Allocation,
  CreateAllocationDTO,
  PaymentTransaction
} from '../types/booking';
import type { PaginatedResponse, SingleResponse, SuccessResponse } from '../types/enums';

export class BookingService extends BaseService {
  constructor() {
    super('/api/bookings');
  }

  /**
   * Get paginated bookings
   */
  async getAll(params?: BookingQueryParams): Promise<PaginatedResponse<Booking>> {
    return this.client.get(this.buildPath(), { params: params as Record<string, string | number | boolean> });
  }

  /**
   * Get single booking by ID
   */
  async getById(id: string): Promise<SingleResponse<Booking>> {
    return this.client.get(this.buildPath(`/${id}`));
  }

  /**
   * Create new booking
   */
  async create(data: CreateBookingDTO): Promise<SingleResponse<Booking>> {
    return this.client.post(this.buildPath(), data);
  }

  /**
   * Update existing booking
   */
  async update(id: string, data: UpdateBookingDTO): Promise<SingleResponse<Booking>> {
    return this.client.put(this.buildPath(`/${id}`), data);
  }

  /**
   * Update booking status
   */
  async updateStatus(id: string, status: string): Promise<SingleResponse<Booking>> {
    return this.client.put(this.buildPath(`/${id}/status`), { status });
  }

  /**
   * Confirm pending booking
   */
  async confirm(id: string): Promise<SingleResponse<Booking>> {
    return this.client.put(this.buildPath(`/${id}/confirm`));
  }

  /**
   * Cancel booking
   */
  async cancel(id: string, data?: CancelBookingDTO): Promise<SingleResponse<Booking>> {
    return this.client.put(this.buildPath(`/${id}/cancel`), data);
  }

  /**
   * Complete booking
   */
  async complete(id: string): Promise<SingleResponse<Booking>> {
    return this.client.put(this.buildPath(`/${id}/complete`));
  }

  /**
   * Delete booking
   */
  async delete(id: string): Promise<SuccessResponse> {
    return this.client.delete(this.buildPath(`/${id}`));
  }

  /**
   * Calculate booking pricing
   */
  async calculatePricing(listingId: string, startTime: string, endTime: string): Promise<SingleResponse<BookingPricing>> {
    return this.client.get(this.buildPath('/pricing'), { 
      params: { listingId, startTime, endTime } 
    });
  }

  /**
   * Get current user's bookings
   */
  async getMyBookings(params?: BookingQueryParams): Promise<PaginatedResponse<Booking>> {
    return this.client.get(this.buildPath('/my'), { params: params as Record<string, string | number | boolean> });
  }

  /**
   * Get recurring bookings
   */
  async getRecurring(): Promise<PaginatedResponse<Booking>> {
    return this.client.get(this.buildPath('/recurring'));
  }

  /**
   * Create recurring booking
   */
  async createRecurring(data: CreateBookingDTO & {
    frequency: string;
    endDate: string;
    weekdays?: number[];
  }): Promise<SingleResponse<Booking[]>> {
    return this.client.post(this.buildPath('/recurring'), data);
  }

  /**
   * Get booking receipt/bilag (KRAV-ADM-07)
   * Returns receipt with hvem/hva/hvor/når for bokføringskrav
   */
  async getReceipt(id: string): Promise<SingleResponse<BookingReceipt>> {
    return this.client.get(this.buildPath(`/${id}/receipt`));
  }

  /**
   * Get payment transaction history for a booking
   */
  async getPaymentHistory(bookingId: string): Promise<SingleResponse<PaymentTransaction[]>> {
    return this.client.get(this.buildPath(`/${bookingId}/payments`));
  }

  /**
   * Get payment reconciliation report
   * Returns aggregated payment data for administrative reconciliation
   */
  async getPaymentReconciliation(params?: {
    startDate?: string;
    endDate?: string;
    status?: string;
    provider?: string;
  }): Promise<PaginatedResponse<{
    bookingId: string;
    totalAmount: number;
    paidAmount: number;
    refundedAmount: number;
    currency: string;
    status: string;
    transactions: PaymentTransaction[];
  }>> {
    return this.client.get(this.buildPath('/reconciliation'), {
      params: params as Record<string, string | number | boolean>
    });
  }

  /**
   * Change booking time (user-initiated reschedule)
   * Server enforces cancellation deadlines and availability
   */
  async changeTime(id: string, newTimeRange: { startTime: string; endTime: string }): Promise<SingleResponse<Booking>> {
    return this.client.patch(this.buildPath(`/${id}/time`), newTimeRange);
  }

  /**
   * Request a change to a booking (when direct changes are locked)
   * Used for bookings that require approval for modifications
   */
  async requestChange(id: string, data: { 
    requestedStartTime?: string; 
    requestedEndTime?: string; 
    reason?: string;
    notes?: string;
  }): Promise<SingleResponse<{ requestId: string; status: string }>> {
    return this.client.post(this.buildPath(`/${id}/change-request`), data);
  }

  /**
   * Get booking documents (confirmations, receipts, decisions, terms)
   */
  async getDocuments(id: string): Promise<SingleResponse<BookingDocument[]>> {
    return this.client.get(this.buildPath(`/${id}/documents`));
  }
}

/**
 * Calendar Service
 * Single Responsibility: Handle calendar and availability operations
 */
export class CalendarService extends BaseService {
  constructor() {
    super('/api/calendar');
  }

  /**
   * Get calendar events
   */
  async getEvents(params?: CalendarQueryParams): Promise<SingleResponse<CalendarEvent[]>> {
    return this.client.get(this.buildPath('/events'), { 
      params: params as Record<string, string | number | boolean> 
    });
  }
}

/**
 * Allocation Service
 * Single Responsibility: Handle time slot allocations
 */
export class AllocationService extends BaseService {
  constructor() {
    super('/api/allocations');
  }

  /**
   * Get allocations
   */
  async getAll(params?: { listingId?: string; startDate?: string; endDate?: string }): Promise<PaginatedResponse<Allocation>> {
    return this.client.get(this.buildPath(), { params });
  }

  /**
   * Create allocation (block time)
   */
  async create(data: CreateAllocationDTO): Promise<SingleResponse<Allocation>> {
    return this.client.post(this.buildPath(), data);
  }

  /**
   * Delete allocation
   */
  async delete(id: string): Promise<SuccessResponse> {
    return this.client.delete(this.buildPath(`/${id}`));
  }
}

/**
 * Availability Service
 * Single Responsibility: Check availability slots
 */
export class AvailabilityService extends BaseService {
  constructor() {
    super('/api/availability');
  }

  /**
   * Get available time slots
   */
  async getSlots(params: { listingId: string; date: string; duration?: number }): Promise<SingleResponse<Array<{
    startTime: string;
    endTime: string;
    available: boolean;
    price?: number;
  }>>> {
    return this.client.get(this.buildPath('/slots'), { params });
  }

  /**
   * Check if time range is available
   */
  async check(params: { listingId: string; startTime: string; endTime: string }): Promise<SingleResponse<{
    available: boolean;
    conflicts?: Array<{ startTime: string; endTime: string }>;
  }>> {
    return this.client.get(this.buildPath('/check'), { params });
  }
}

// Singleton instances
export const bookingService = new BookingService();
export const calendarService = new CalendarService();
export const allocationService = new AllocationService();
export const availabilityService = new AvailabilityService();
