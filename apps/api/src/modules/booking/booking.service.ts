/**
 * Booking Service
 * Business logic for booking domain
 */
import { Injectable, Inject } from '../../core/decorators';
import { BookingRepository } from './booking.repository';
import { validate } from '../../core/validation/zod-pipe';
import { ForbiddenError } from '../../core/errors/problem-details';
import { getAuditService } from '../../core/audit/audit.service';
import {
  CreateBookingSchema,
  UpdateBookingSchema,
  BookingQuerySchema,
  CancelBookingSchema,
  RecurringPreviewRequestSchema,
  RecurringCreateSchema,
  type CreateBookingDTO,
  type UpdateBookingDTO,
  type BookingQueryParams,
  type CancelBookingDTO,
  type Booking,
  type CalendarEvent,
  type BookingSelection,
  type RecurringPreviewProjection,
  type RecurringOccurrence,
  type RecurringSummary,
  type OccurrenceStatus,
  type RecurringCreateRequest,
  type RecurringBookingResultProjection,
  type FailedOccurrence,
} from '../../schemas/booking.schema';
import type { PaginatedResult } from '../../database/base.repository';

@Injectable()
export class BookingService {
  constructor(
    @Inject('BookingRepository') private readonly repository: BookingRepository,
    @Inject('Adapters') private readonly adapters: any
  ) {}

  /**
   * Create a new booking
   */
  async create(tenantId: string, userId: string, data: CreateBookingDTO): Promise<Booking> {
    const validated = validate(CreateBookingSchema, data);

    // Check availability (simplified - should check against existing bookings)
    const conflicts = await this.repository.findByListingAndDateRange(
      validated.listingId,
      validated.startTime,
      validated.endTime
    );

    if (conflicts.length > 0) {
      throw new ForbiddenError('The requested time slot is not available');
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
   * Confirm booking
   */
  async confirm(id: string): Promise<Booking> {
    const booking = await this.repository.update(id, { status: 'confirmed' });
    this.adapters?.log?.info('Booking confirmed', { id });
    
    getAuditService().log({
      tenantId: booking.tenantId,
      action: 'confirm',
      resource: 'booking',
      resourceId: id,
      metadata: { previousStatus: 'pending', newStatus: 'confirmed' },
    });
    
    return booking as unknown as Booking;
  }

  /**
   * Cancel booking
   */
  async cancel(id: string, data: CancelBookingDTO): Promise<Booking> {
    const validated = validate(CancelBookingSchema, data);
    const booking = await this.repository.update(id, {
      status: 'cancelled',
      notes: validated.reason,
    });
    this.adapters?.log?.warn('Booking cancelled', { id, reason: validated.reason });
    
    getAuditService().log({
      tenantId: booking.tenantId,
      action: 'cancel',
      resource: 'booking',
      resourceId: id,
      severity: 'warning',
      metadata: { reason: validated.reason },
    });
    
    return booking as unknown as Booking;
  }

  /**
   * Complete booking
   */
  async complete(id: string): Promise<Booking> {
    const booking = await this.repository.update(id, { status: 'completed' });
    this.adapters?.log?.info('Booking completed', { id });
    
    getAuditService().log({
      tenantId: booking.tenantId,
      action: 'complete',
      resource: 'booking',
      resourceId: id,
      metadata: { newStatus: 'completed' },
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
   * Update booking
   */
  async update(id: string, data: UpdateBookingDTO): Promise<Booking> {
    const validated = validate(UpdateBookingSchema, data);
    const booking = await this.repository.update(id, validated);
    this.adapters?.log?.info('Booking updated', { id });
    
    getAuditService().log({
      tenantId: booking.tenantId,
      action: 'update',
      resource: 'booking',
      resourceId: id,
      metadata: { changes: Object.keys(validated) },
    });
    
    return booking as unknown as Booking;
  }

  /**
   * Update booking status
   */
  async updateStatus(id: string, status: string): Promise<Booking> {
    const booking = await this.repository.update(id, { status });
    this.adapters?.log?.info('Booking status updated', { id, status });
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
   * Create recurring booking (legacy method for backward compatibility)
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

  /**
   * Create recurring booking with conflict policy support
   * Implements stopOnConflict and allowPartial policies
   * Returns a projection with created bookings and failed occurrences
   */
  async createRecurringWithPolicy(
    tenantId: string,
    userId: string,
    data: RecurringCreateRequest
  ): Promise<RecurringBookingResultProjection> {
    const validated = validate(RecurringCreateSchema, data);

    // Apply defaults for conflict policies (Zod defaults are applied but TypeScript needs explicit values)
    const stopOnConflict = validated.stopOnConflict ?? false;
    const allowPartial = validated.allowPartial ?? true;

    // Build a booking selection for occurrence generation
    const selection: BookingSelection = {
      listingId: validated.listingId,
      mode: 'RECURRING',
      startTime: validated.startTime,
      endTime: validated.endTime,
      userId: validated.userId,
      organizationId: validated.organizationId,
      notes: validated.notes,
      metadata: validated.metadata,
      frequency: validated.frequency,
      weekdays: validated.weekdays,
      endCondition: validated.endCondition,
    };

    // Generate occurrences based on recurrence pattern
    const occurrences = this.generateOccurrences(selection);

    // Filter to selected occurrences if specified
    let targetOccurrences = occurrences;
    if (validated.selectedOccurrences && validated.selectedOccurrences.length > 0) {
      targetOccurrences = occurrences.filter((_, index) =>
        validated.selectedOccurrences!.includes(index)
      );
    }

    // Check for conflicts
    const occurrencesWithStatus = await this.checkOccurrenceConflicts(
      validated.listingId,
      targetOccurrences
    );

    const conflictOccurrences = occurrencesWithStatus.filter(o => o.status !== 'AVAILABLE');
    const availableOccurrences = occurrencesWithStatus.filter(o => o.status === 'AVAILABLE');

    // Apply conflict policy
    if (stopOnConflict && conflictOccurrences.length > 0) {
      // Return error result with no created bookings
      const result: RecurringBookingResultProjection = {
        created: [],
        failed: conflictOccurrences.map(o => ({
          index: o.index,
          startTime: o.startTime,
          endTime: o.endTime,
          status: o.status,
          reasonKey: o.reasonKey || 'booking.conflict.stopOnConflict',
          conflictId: o.conflictId,
        })),
        summary: {
          totalRequested: targetOccurrences.length,
          createdCount: 0,
          failedCount: conflictOccurrences.length,
          totalPrice: 0,
          currency: 'NOK',
        },
        seriesMetadata: {
          frequency: validated.frequency,
          weekdays: validated.weekdays,
          firstOccurrence: targetOccurrences[0]?.startTime || validated.startTime,
          lastOccurrence: targetOccurrences[targetOccurrences.length - 1]?.endTime,
        },
        createdAt: new Date().toISOString(),
      };

      this.adapters?.log?.warn('Recurring booking creation stopped due to conflicts', {
        listingId: validated.listingId,
        conflictCount: conflictOccurrences.length,
      });

      return result;
    }

    // Create bookings for available occurrences
    const createdBookings: Booking[] = [];
    const failed: FailedOccurrence[] = [];

    // Add conflict occurrences to failed list
    for (const occurrence of conflictOccurrences) {
      failed.push({
        index: occurrence.index,
        startTime: occurrence.startTime,
        endTime: occurrence.endTime,
        status: occurrence.status,
        reasonKey: occurrence.reasonKey || 'booking.conflict.existingBooking',
        conflictId: occurrence.conflictId,
      });
    }

    // Create bookings for available slots
    const seriesId = crypto.randomUUID();
    const ANONYMOUS_USER_ID = '00000000-0000-0000-0000-000000000000';
    const effectiveUserId = validated.userId || (userId !== 'anonymous' ? userId : ANONYMOUS_USER_ID);

    for (const occurrence of availableOccurrences) {
      try {
        const booking = await this.repository.create({
          tenantId,
          listingId: validated.listingId,
          userId: effectiveUserId,
          status: 'pending',
          startTime: new Date(occurrence.startTime),
          endTime: new Date(occurrence.endTime),
          totalPrice: String(500), // Mock pricing - in production would calculate
          currency: 'NOK',
          notes: validated.notes,
          metadata: {
            ...validated.metadata,
            recurring: true,
            frequency: validated.frequency,
            weekdays: validated.weekdays,
            seriesId,
            occurrenceIndex: occurrence.index,
          },
        });

        createdBookings.push(booking as unknown as Booking);

        // Audit log for each created booking
        getAuditService().log({
          tenantId,
          userId: effectiveUserId,
          action: 'create',
          resource: 'booking',
          resourceId: booking.id,
          metadata: {
            type: 'recurring',
            seriesId,
            occurrenceIndex: occurrence.index,
            listingId: validated.listingId,
          },
        });
      } catch (error: any) {
        // If creation fails, add to failed list
        failed.push({
          index: occurrence.index,
          startTime: occurrence.startTime,
          endTime: occurrence.endTime,
          status: 'CONFLICT',
          reasonKey: 'booking.error.creationFailed',
        });

        this.adapters?.log?.error('Failed to create recurring occurrence', {
          index: occurrence.index,
          error: error.message,
        });
      }
    }

    // Calculate total price
    const pricePerOccurrence = 500; // Mock pricing
    const totalPrice = createdBookings.length * pricePerOccurrence;

    // Build result projection
    const result: RecurringBookingResultProjection = {
      created: createdBookings,
      failed,
      summary: {
        totalRequested: targetOccurrences.length,
        createdCount: createdBookings.length,
        failedCount: failed.length,
        totalPrice,
        currency: 'NOK',
      },
      seriesMetadata: {
        frequency: validated.frequency,
        weekdays: validated.weekdays,
        firstOccurrence: createdBookings[0]?.startTime?.toString() || targetOccurrences[0]?.startTime || validated.startTime,
        lastOccurrence: createdBookings[createdBookings.length - 1]?.endTime?.toString() || targetOccurrences[targetOccurrences.length - 1]?.endTime,
        seriesId,
      },
      createdAt: new Date().toISOString(),
    };

    this.adapters?.log?.info('Recurring booking series created', {
      seriesId,
      listingId: validated.listingId,
      createdCount: createdBookings.length,
      failedCount: failed.length,
    });

    // Audit log for the series creation
    getAuditService().log({
      tenantId,
      userId: effectiveUserId,
      action: 'create',
      resource: 'booking_series',
      resourceId: seriesId,
      metadata: {
        frequency: validated.frequency,
        totalRequested: targetOccurrences.length,
        createdCount: createdBookings.length,
        failedCount: failed.length,
        stopOnConflict,
        allowPartial,
      },
    });

    return result;
  }

  /**
   * Preview recurring booking with conflict detection
   * Generates all occurrences based on recurrence pattern and checks availability
   */
  async previewRecurring(tenantId: string, selection: BookingSelection): Promise<RecurringPreviewProjection> {
    const validated = validate(RecurringPreviewRequestSchema, selection);

    // Generate occurrences based on frequency and end condition
    const occurrences = this.generateOccurrences(validated);

    // Check for conflicts with existing bookings
    const occurrencesWithStatus = await this.checkOccurrenceConflicts(validated.listingId, occurrences);

    // Calculate summary statistics
    const summary = this.calculateRecurringSummary(occurrencesWithStatus);

    // Determine available actions based on conflicts
    const availableActions = this.determineAvailableActions(summary);

    // Build proposed selection for partial creation if there are conflicts
    const proposedSelection = summary.conflictCount > 0 && summary.availableCount > 0
      ? { ...validated }
      : undefined;

    const preview: RecurringPreviewProjection = {
      listingId: validated.listingId,
      selection: validated,
      occurrences: occurrencesWithStatus,
      summary,
      proposedSelection,
      generatedAt: new Date().toISOString(),
      validFor: 'PT5M', // 5 minutes validity
      availableActions,
      permissions: {
        canCreateAll: summary.conflictCount === 0,
        canCreatePartial: summary.availableCount > 0,
        canModify: true,
      },
    };

    this.adapters?.log?.info('Recurring preview generated', {
      listingId: validated.listingId,
      totalOccurrences: summary.totalOccurrences,
      availableCount: summary.availableCount,
      conflictCount: summary.conflictCount,
    });

    return preview;
  }

  /**
   * Generate occurrences based on recurrence pattern
   */
  private generateOccurrences(selection: BookingSelection): RecurringOccurrence[] {
    const occurrences: RecurringOccurrence[] = [];
    const startDate = new Date(selection.startTime);
    const endDate = new Date(selection.endTime);
    const duration = endDate.getTime() - startDate.getTime();

    const endCondition = selection.endCondition!;
    const frequency = selection.frequency!;
    const weekdays = selection.weekdays || [startDate.getDay() === 0 ? 7 : startDate.getDay()]; // ISO weekday

    let currentDate = new Date(startDate);
    let index = 0;
    const maxOccurrences = endCondition.type === 'AFTER_OCCURRENCES'
      ? endCondition.occurrences!
      : 52; // Safety limit
    const untilDate = endCondition.type === 'UNTIL_DATE'
      ? new Date(endCondition.untilDate!)
      : null;

    while (index < maxOccurrences) {
      // Check if we've passed the until date
      if (untilDate && currentDate > untilDate) {
        break;
      }

      // Check if current day matches selected weekdays (for weekly frequency)
      const currentWeekday = currentDate.getDay() === 0 ? 7 : currentDate.getDay(); // Convert to ISO weekday
      const matchesWeekday = frequency === 'WEEKLY'
        ? weekdays.includes(currentWeekday)
        : true;

      if (matchesWeekday) {
        const occurrenceStart = new Date(currentDate);
        const occurrenceEnd = new Date(currentDate.getTime() + duration);

        occurrences.push({
          index,
          startTime: occurrenceStart.toISOString(),
          endTime: occurrenceEnd.toISOString(),
          status: 'AVAILABLE', // Will be updated by conflict check
          selected: true,
        });

        index++;
      }

      // Advance to next occurrence
      if (frequency === 'WEEKLY') {
        currentDate.setDate(currentDate.getDate() + 1);
        // If we've gone through all weekdays, jump to next week's first selected weekday
        if (currentDate.getDay() === 0 ? 7 : currentDate.getDay() > Math.max(...weekdays)) {
          const daysUntilNextWeek = 7 - (currentDate.getDay() === 0 ? 7 : currentDate.getDay()) + Math.min(...weekdays);
          currentDate.setDate(currentDate.getDate() + daysUntilNextWeek);
        }
      } else if (frequency === 'MONTHLY') {
        // Monthly: same day of month
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    }

    return occurrences;
  }

  /**
   * Check occurrences for conflicts with existing bookings
   */
  private async checkOccurrenceConflicts(
    listingId: string,
    occurrences: RecurringOccurrence[]
  ): Promise<RecurringOccurrence[]> {
    const checkedOccurrences: RecurringOccurrence[] = [];

    for (const occurrence of occurrences) {
      const startTime = new Date(occurrence.startTime);
      const endTime = new Date(occurrence.endTime);

      // Check for existing bookings in this time slot
      const conflicts = await this.repository.findByListingAndDateRange(
        listingId,
        startTime,
        endTime
      );

      if (conflicts.length > 0) {
        checkedOccurrences.push({
          ...occurrence,
          status: 'CONFLICT' as OccurrenceStatus,
          reasonKey: 'booking.conflict.existingBooking',
          conflictId: conflicts[0].id,
          selected: false,
        });
      } else {
        checkedOccurrences.push({
          ...occurrence,
          status: 'AVAILABLE' as OccurrenceStatus,
          selected: true,
        });
      }
    }

    return checkedOccurrences;
  }

  /**
   * Calculate summary statistics for recurring preview
   */
  private calculateRecurringSummary(occurrences: RecurringOccurrence[]): RecurringSummary {
    const availableCount = occurrences.filter(o => o.status === 'AVAILABLE').length;
    const conflictCount = occurrences.filter(o => o.status === 'CONFLICT').length;
    const blockedCount = occurrences.filter(o => o.status === 'BLOCKED').length;
    const blackoutCount = occurrences.filter(o => o.status === 'BLACKOUT').length;

    // Mock pricing - in production would calculate based on listing rates
    const pricePerOccurrence = 500; // NOK
    const totalPrice = availableCount * pricePerOccurrence;

    return {
      totalOccurrences: occurrences.length,
      availableCount,
      conflictCount,
      blockedCount,
      blackoutCount,
      totalPrice,
      currency: 'NOK',
    };
  }

  /**
   * Determine available actions based on conflict summary
   */
  private determineAvailableActions(summary: RecurringSummary): Array<'CREATE_ALL' | 'CREATE_AVAILABLE' | 'MODIFY_SELECTION'> {
    const actions: Array<'CREATE_ALL' | 'CREATE_AVAILABLE' | 'MODIFY_SELECTION'> = [];

    if (summary.conflictCount === 0 && summary.availableCount > 0) {
      actions.push('CREATE_ALL');
    }

    if (summary.availableCount > 0) {
      actions.push('CREATE_AVAILABLE');
    }

    actions.push('MODIFY_SELECTION');

    return actions;
  }
}

