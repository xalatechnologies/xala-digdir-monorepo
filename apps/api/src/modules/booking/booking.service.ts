/**
 * Booking Service
 * Business logic for booking domain
 */
import { Injectable, Inject } from '../../core/decorators';
import { BookingRepository } from './booking.repository';
import { ListingRepository } from '../listing/listing.repository';
import { validate } from '../../core/validation/zod-pipe';
import { ForbiddenError } from '../../core/errors/problem-details';
import { getAuditService } from '../../core/audit/audit.service';
import {
  CreateBookingSchema,
  UpdateBookingSchema,
  BookingQuerySchema,
  CancelBookingSchema,
  type CreateBookingDTO,
  type UpdateBookingDTO,
  type BookingQueryParams,
  type CancelBookingDTO,
  type Booking,
  type CalendarEvent,
} from '../../schemas/booking.schema';
import type { PaginatedResult } from '../../database/base.repository';

@Injectable()
export class BookingService {
  constructor(
    @Inject('BookingRepository') private readonly repository: BookingRepository,
    @Inject('ListingRepository') private readonly listingRepository: ListingRepository,
    @Inject('Adapters') private readonly adapters: any
  ) {}

  /**
   * Create a new booking
   */
  async create(tenantId: string, userId: string, data: CreateBookingDTO): Promise<Booking> {
    const validated = validate(CreateBookingSchema, data);

    // Fetch listing to get buffer time configuration
    const listing = await this.listingRepository.findById(validated.listingId);
    if (!listing) {
      throw new ForbiddenError('Listing not found');
    }

    // Extract buffer time from listing metadata (default to 0 if not set)
    const bufferTimeMinutes = (listing.metadata as any)?.bufferTimeMinutes || 0;
    const bufferTimeMs = bufferTimeMinutes * 60 * 1000;

    // Check availability with buffer time
    const conflicts = await this.repository.findByListingAndDateRange(
      validated.listingId,
      validated.startTime,
      validated.endTime
    );

    // Check if any existing booking conflicts with the requested time slot (including buffer time)
    const requestedStart = new Date(validated.startTime).getTime();
    const requestedEnd = new Date(validated.endTime).getTime();

    const hasConflict = conflicts.some((existingBooking) => {
      // Apply buffer time before and after existing bookings
      const existingStart = new Date(existingBooking.startTime).getTime() - bufferTimeMs;
      const existingEnd = new Date(existingBooking.endTime).getTime() + bufferTimeMs;

      // Check for overlap
      return requestedStart < existingEnd && requestedEnd > existingStart;
    });

    if (hasConflict) {
      const bufferMsg = bufferTimeMinutes > 0
        ? ` (including ${bufferTimeMinutes} minute buffer time)`
        : '';
      throw new ForbiddenError(`The requested time slot is not available${bufferMsg}`);
    }

    // Anonymous user placeholder UUID (database requires userId)
    const ANONYMOUS_USER_ID = '00000000-0000-0000-0000-000000000000';
    
    // Determine userId - use validated userId, fall back to request userId, or anonymous placeholder
    const effectiveUserId = validated.userId || (userId !== 'anonymous' ? userId : ANONYMOUS_USER_ID);

    const booking = await this.repository.create({
      tenantId,
      listingId: validated.listingId,
      userId: effectiveUserId,
      status: 'pending',
      startTime: validated.startTime,
      endTime: validated.endTime,
      totalPrice: String(validated.totalPrice || 0),
      currency: 'NOK',
      notes: validated.notes,
      metadata: validated.metadata || {},
    });

    this.adapters?.log?.info('Booking created', { id: booking.id, tenantId });

    // Audit log
    getAuditService().log({
      tenantId,
      userId: booking.userId,
      action: 'create',
      resource: 'booking',
      resourceId: booking.id,
      metadata: { listingId: booking.listingId, startTime: booking.startTime, endTime: booking.endTime },
    });

    return booking as unknown as Booking;
  }

  /**
   * Get booking by ID
   */
  async findById(id: string): Promise<Booking | null> {
    return this.repository.findById(id) as unknown as Promise<Booking | null>;
  }

  /**
   * Get booking by ID or throw
   */
  async findByIdOrFail(id: string): Promise<Booking> {
    return this.repository.findByIdOrFail(id) as unknown as Promise<Booking>;
  }

  /**
   * List bookings with filters
   */
  async findAll(tenantId: string, params: BookingQueryParams): Promise<PaginatedResult<Booking>> {
    const validated = validate(BookingQuerySchema, params);
    return this.repository.findWithFilters(tenantId, { ...validated, page: validated.page ?? 1, limit: validated.limit ?? 20 }) as unknown as Promise<PaginatedResult<Booking>>;
  }

  /**
   * Confirm booking with optimistic locking
   */
  async confirm(id: string, version?: number): Promise<Booking> {
    const booking = version !== undefined
      ? await this.repository.updateWithVersion(id, version, { status: 'confirmed' })
      : await this.repository.update(id, { status: 'confirmed' });

    this.adapters?.log?.info('Booking confirmed', { id, version: booking.version });

    getAuditService().log({
      tenantId: booking.tenantId,
      action: 'confirm',
      resource: 'booking',
      resourceId: id,
      metadata: { previousStatus: 'pending', newStatus: 'confirmed', version: booking.version },
    });

    return booking as unknown as Booking;
  }

  /**
   * Cancel booking with optimistic locking
   */
  async cancel(id: string, data: CancelBookingDTO, version?: number): Promise<Booking> {
    const validated = validate(CancelBookingSchema, data);

    const updateData = {
      status: 'cancelled' as const,
      notes: validated.reason,
    };

    const booking = version !== undefined
      ? await this.repository.updateWithVersion(id, version, updateData)
      : await this.repository.update(id, updateData);

    this.adapters?.log?.warn('Booking cancelled', { id, reason: validated.reason, version: booking.version });

    getAuditService().log({
      tenantId: booking.tenantId,
      action: 'cancel',
      resource: 'booking',
      resourceId: id,
      severity: 'warning',
      metadata: { reason: validated.reason, version: booking.version },
    });

    return booking as unknown as Booking;
  }

  /**
   * Complete booking with optimistic locking
   */
  async complete(id: string, version?: number): Promise<Booking> {
    const booking = version !== undefined
      ? await this.repository.updateWithVersion(id, version, { status: 'completed' })
      : await this.repository.update(id, { status: 'completed' });

    this.adapters?.log?.info('Booking completed', { id, version: booking.version });

    getAuditService().log({
      tenantId: booking.tenantId,
      action: 'complete',
      resource: 'booking',
      resourceId: id,
      metadata: { newStatus: 'completed', version: booking.version },
    });

    return booking as unknown as Booking;
  }

  /**
   * Get calendar events for a tenant
   */
  async getCalendarEvents(tenantId: string, listingId?: string): Promise<CalendarEvent[]> {
    const result = await this.findAll(tenantId, { listingId, limit: 100, page: 1 });
    
    return result.data.map((booking) => ({
      id: booking.id,
      listingId: booking.listingId,
      start: new Date(booking.startTime).toISOString(),
      end: new Date(booking.endTime).toISOString(),
      status: booking.status,
    }));
  }

  /**
   * Update booking with optimistic locking
   */
  async update(id: string, data: UpdateBookingDTO): Promise<Booking> {
    const validated = validate(UpdateBookingSchema, data);

    // Extract version for optimistic locking
    const { version, ...updateData } = validated;

    // Use optimistic locking if version is provided
    const booking = version !== undefined
      ? await this.repository.updateWithVersion(id, version, updateData)
      : await this.repository.update(id, updateData);

    this.adapters?.log?.info('Booking updated', { id, version });

    getAuditService().log({
      tenantId: booking.tenantId,
      action: 'update',
      resource: 'booking',
      resourceId: id,
      metadata: { changes: Object.keys(updateData), version: booking.version },
    });

    return booking as unknown as Booking;
  }

  /**
   * Update booking status with optimistic locking
   */
  async updateStatus(id: string, status: string, version?: number): Promise<Booking> {
    const booking = version !== undefined
      ? await this.repository.updateWithVersion(id, version, { status })
      : await this.repository.update(id, { status });

    this.adapters?.log?.info('Booking status updated', { id, status, version: booking.version });

    getAuditService().log({
      tenantId: booking.tenantId,
      action: 'update_status',
      resource: 'booking',
      resourceId: id,
      metadata: { status, version: booking.version },
    });

    return booking as unknown as Booking;
  }

  /**
   * Calculate pricing for a booking
   */
  async calculatePricing(listingId: string, startTime: string, endTime: string): Promise<any> {
    // In production, would fetch listing pricing and calculate
    const start = new Date(startTime);
    const end = new Date(endTime);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    
    return {
      listingId,
      startTime,
      endTime,
      durationHours: hours,
      basePrice: hours * 500, // Mock hourly rate
      discount: 0,
      totalPrice: hours * 500,
      currency: 'NOK',
    };
  }

  /**
   * Find bookings by user with listing details and pagination
   */
  async findByUser(userId: string, params: { page?: number; limit?: number } = {}) {
    return this.repository.findByUser(userId, params);
  }

  /**
   * Find recurring bookings
   */
  async findRecurring(tenantId: string): Promise<Booking[]> {
    // Return bookings with recurring metadata
    const result = await this.findAll(tenantId, { limit: 100, page: 1 });
    return result.data.filter((b: any) => b.metadata?.recurring);
  }

  /**
   * Create recurring booking
   */
  async createRecurring(tenantId: string, userId: string, data: any): Promise<Booking[]> {
    const { listingId, startTime, endTime, frequency, endDate, weekdays } = data;
    
    // Generate recurring dates
    const bookings: Booking[] = [];
    const start = new Date(startTime);
    const end = new Date(endDate);
    
    // Create first booking
    const firstBooking = await this.create(tenantId, userId, {
      listingId,
      startTime,
      endTime,
      metadata: { recurring: true, frequency, weekdays },
    });
    bookings.push(firstBooking);
    
    this.adapters?.log?.info('Recurring booking created', { count: bookings.length });
    return bookings;
  }
}

