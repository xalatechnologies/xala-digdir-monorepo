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
  PaymentTransaction,
  BookingQuoteSelectionDTO,
  BookingQuoteProjectionDTO,
  BookingSelectionDTO,
  RecurringPreviewLookupDTO,
  RecurringPreviewProjectionDTO,
} from '@/types/booking';
import type { PaginatedResponse, SingleResponse, SuccessResponse } from '@/types/enums';

export class BookingService extends BaseService {
  constructor() {
    super('/api/bookings');
  }

  /**
   * Get paginated bookings
   * Retrieves all bookings with optional filtering and pagination
   *
   * @param params - Optional query parameters for filtering and pagination
   * @returns Promise with paginated list of bookings
   *
   * @example
   * ```typescript
   * // Get first page of bookings
   * const bookings = await bookingService.getAll({ page: 1, limit: 20 });
   *
   * // Filter by status
   * const activeBookings = await bookingService.getAll({
   *   status: 'confirmed',
   *   page: 1,
   *   limit: 10
   * });
   * ```
   */
  async getAll(params?: BookingQueryParams): Promise<PaginatedResponse<Booking>> {
    return this.client.get(this.buildPath(), { params: params as Record<string, string | number | boolean> });
  }

  /**
   * Get single booking by ID
   * Retrieves detailed information for a specific booking
   *
   * @param id - Unique booking identifier
   * @returns Promise with booking details
   *
   * @example
   * ```typescript
   * const booking = await bookingService.getById('booking-123');
   * console.log('Booking status:', booking.data.status);
   * console.log('Start time:', booking.data.startTime);
   * ```
   */
  async getById(id: string): Promise<SingleResponse<Booking>> {
    return this.client.get(this.buildPath(`/${id}`));
  }

  /**
   * Create new booking
   * Creates a new booking for a listing with specified time range
   *
   * @param data - Booking creation data including listing ID, time range, and user details
   * @returns Promise with created booking
   *
   * @example
   * ```typescript
   * const booking = await bookingService.create({
   *   listingId: 'listing-456',
   *   startTime: '2024-03-15T10:00:00Z',
   *   endTime: '2024-03-15T12:00:00Z',
   *   userId: 'user-789',
   *   notes: 'Birthday party'
   * });
   * console.log('Booking created:', booking.data.id);
   * ```
   */
  async create(data: CreateBookingDTO): Promise<SingleResponse<Booking>> {
    return this.client.post(this.buildPath(), data);
  }

  /**
   * Update existing booking
   * Updates booking details such as notes, participants, or other metadata
   *
   * @param id - Booking identifier
   * @param data - Partial booking data to update
   * @returns Promise with updated booking
   *
   * @example
   * ```typescript
   * const updated = await bookingService.update('booking-123', {
   *   notes: 'Updated: Moved to larger room'
   * });
   * ```
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
   * Cancels an existing booking with optional reason and cancellation policy enforcement
   *
   * @param id - Booking identifier
   * @param data - Optional cancellation data including reason and notes
   * @returns Promise with cancelled booking
   *
   * @example
   * ```typescript
   * const cancelled = await bookingService.cancel('booking-123', {
   *   reason: 'Change of plans',
   *   notes: 'Will reschedule for next week'
   * });
   * console.log('Cancellation status:', cancelled.data.status);
   * ```
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
  async deleteById(id: string): Promise<SuccessResponse> {
    return this.client.delete(this.buildPath(`/${id}`));
  }

  /**
   * Calculate booking pricing
   * Calculates total cost including base price, duration, and applicable discounts
   *
   * @param rentalObjectId - Rental object identifier
   * @param startTime - Booking start time (ISO 8601)
   * @param endTime - Booking end time (ISO 8601)
   * @returns Promise with pricing breakdown including base price, discounts, and total
   *
   * @example
   * ```typescript
   * const pricing = await bookingService.calculatePricing(
   *   'rental-object-456',
   *   '2024-03-15T10:00:00Z',
   *   '2024-03-15T12:00:00Z'
   * );
   * console.log('Total cost:', pricing.data.total);
   * console.log('Currency:', pricing.data.currency);
   * ```
   */
  async calculatePricing(rentalObjectId: string, startTime: string, endTime: string): Promise<SingleResponse<BookingPricing>> {
    return this.client.get(this.buildPath('/pricing'), {
      params: { rentalObjectId, startTime, endTime }
    });
  }

  /**
   * Get current user's bookings
   * Retrieves all bookings for the authenticated user with optional filtering
   *
   * @param params - Optional query parameters for filtering
   * @returns Promise with paginated list of user's bookings
   *
   * @example
   * ```typescript
   * // Get all my bookings
   * const myBookings = await bookingService.getMyBookings();
   *
   * // Get upcoming bookings only
   * const upcoming = await bookingService.getMyBookings({
   *   status: 'confirmed',
   *   startDate: new Date().toISOString()
   * });
   * ```
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
   * Creates multiple bookings based on a recurring schedule
   *
   * @param data - Booking data with recurrence pattern (frequency, end date, weekdays)
   * @returns Promise with array of created recurring bookings
   *
   * @example
   * ```typescript
   * // Create weekly booking every Monday and Wednesday for 3 months
   * const recurring = await bookingService.createRecurring({
   *   listingId: 'listing-456',
   *   startTime: '2024-03-15T10:00:00Z',
   *   endTime: '2024-03-15T12:00:00Z',
   *   frequency: 'weekly',
   *   endDate: '2024-06-15T00:00:00Z',
   *   weekdays: [1, 3] // Monday, Wednesday
   * });
   * console.log(`Created ${recurring.data.length} bookings`);
   * ```
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
   * Retrieves all payment transactions associated with a booking
   *
   * @param bookingId - Booking identifier
   * @returns Promise with array of payment transactions
   *
   * @example
   * ```typescript
   * const payments = await bookingService.getPaymentHistory('booking-123');
   * payments.data.forEach(payment => {
   *   console.log(`${payment.amount} ${payment.currency} - ${payment.status}`);
   * });
   * ```
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

  /**
   * Get booking quote for a selection
   * Returns pricing and availability information
   */
  async quote(selection: BookingQuoteSelectionDTO): Promise<SingleResponse<BookingQuoteProjectionDTO>> {
    return this.client.post(this.buildPath('/quote'), selection);
  }

  /**
   * Get recurring booking preview
   * Returns server-computed occurrence preview with conflict detection.
   * Can pass either a full selection (to generate preview) or a hash (to lookup cached preview).
   */
  async getRecurringPreview(
    selection: BookingSelectionDTO | RecurringPreviewLookupDTO
  ): Promise<SingleResponse<RecurringPreviewProjectionDTO>> {
    return this.client.post(this.buildPath('/recurring/preview'), selection);
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
   * Retrieves calendar events for visualization and scheduling
   *
   * @param params - Optional query parameters for date range and filters
   * @returns Promise with array of calendar events
   *
   * @example
   * ```typescript
   * const events = await calendarService.getEvents({
   *   startDate: '2024-03-01',
   *   endDate: '2024-03-31',
   *   listingId: 'listing-456'
   * });
   * ```
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
  async getAll(params?: { rentalObjectId?: string; startDate?: string; endDate?: string }): Promise<PaginatedResponse<Allocation>> {
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
  async deleteById(id: string): Promise<SuccessResponse> {
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
   * Retrieves available booking slots for a rental object on a specific date
   *
   * @param params - Query parameters including rental object ID, date, and optional duration
   * @returns Promise with array of time slots indicating availability and pricing
   *
   * @example
   * ```typescript
   * const slots = await availabilityService.getSlots({
   *   rentalObjectId: 'rental-object-456',
   *   date: '2024-03-15',
   *   duration: 120 // minutes
   * });
   * const available = slots.data.filter(slot => slot.available);
   * console.log(`${available.length} slots available`);
   * ```
   */
  async getSlots(params: { rentalObjectId: string; date: string; duration?: number }): Promise<SingleResponse<Array<{
    startTime: string;
    endTime: string;
    available: boolean;
    price?: number;
  }>>> {
    return this.client.get(this.buildPath('/slots'), { params });
  }

  /**
   * Check if time range is available
   * Validates if a specific time range is available for booking
   *
   * @param params - Query parameters with rental object ID and time range
   * @returns Promise with availability status and any conflicting bookings
   *
   * @example
   * ```typescript
   * const availability = await availabilityService.check({
   *   rentalObjectId: 'rental-object-456',
   *   startTime: '2024-03-15T10:00:00Z',
   *   endTime: '2024-03-15T12:00:00Z'
   * });
   * if (availability.data.available) {
   *   console.log('Time slot is available');
   * } else {
   *   console.log('Conflicts:', availability.data.conflicts);
   * }
   * ```
   */
  async check(params: { rentalObjectId: string; startTime: string; endTime: string }): Promise<SingleResponse<{
    available: boolean;
    conflicts?: Array<{ startTime: string; endTime: string }>;
  }>> {
    return this.client.get(this.buildPath('/check'), { params });
  }
}

/**
 * Extended BookingService with caseworker/admin methods
 */
class ExtendedBookingService extends BookingService {
  /**
   * Submit booking for approval
   * Transitions from pending → pending_approval
   */
  async submit(id: string, notes?: string): Promise<SingleResponse<Booking>> {
    return this.client.post(this.buildPath(`/${id}/submit`), { notes });
  }

  /**
   * Approve booking (caseworker/admin only)
   * Transitions from pending_approval → approved
   */
  async approve(id: string, notes?: string): Promise<SingleResponse<Booking>> {
    return this.client.post(this.buildPath(`/${id}/approve`), { notes });
  }

  /**
   * Reject booking (caseworker/admin only)
   * Transitions from pending_approval → rejected
   */
  async reject(id: string, reason: string): Promise<SingleResponse<Booking>> {
    return this.client.post(this.buildPath(`/${id}/reject`), { reason });
  }
}



// Singleton instances
export const bookingService = new ExtendedBookingService();
export const calendarService = new CalendarService();
export const allocationService = new AllocationService();
export const availabilityService = new AvailabilityService();

