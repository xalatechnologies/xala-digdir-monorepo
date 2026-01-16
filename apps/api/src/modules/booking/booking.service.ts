/**
 * Booking Service
 * Business logic for booking domain
 */
import { Injectable, Inject } from '../../core/decorators';
import { BookingRepository } from './booking.repository';
import { RentalObjectRepository } from '../rental-objects/rental-object.repository';
import { validate } from '../../core/validation/zod-pipe';
import { ForbiddenError } from '../../core/errors/problem-details';
import { getAuditService, broadcastBookingEvent } from '../../core/audit/audit.service';
import { container } from '../../core/container';
import { eq, and, or } from 'drizzle-orm';
import { caseHandlerScopes, users } from '../../database/schema/index';
import {
  CreateBookingSchema,
  UpdateBookingSchema,
  BookingQuerySchema,
  CancelBookingSchema,
  ApproveBookingSchema,
  DenyBookingSchema,
  RecurringPreviewRequestSchema,
  RecurringCreateSchema,
  type CreateBookingDTO,
  type UpdateBookingDTO,
  type BookingQueryParams,
  type CancelBookingDTO,
  type ApproveBookingDTO,
  type DenyBookingDTO,
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
  type BookingQuoteProjection,
} from '../../schemas/booking.schema';
import type { PaginatedResult } from '../../database/base.repository';

@Injectable()
export class BookingService {
  constructor(
    @Inject('BookingRepository') private readonly repository: BookingRepository,
    @Inject('RentalObjectRepository') private readonly rentalObjectRepository: RentalObjectRepository,
    @Inject('Adapters') private readonly adapters: any
  ) {}

  /**
   * Create a new booking
   */
  async create(tenantId: string, userId: string, data: CreateBookingDTO): Promise<Booking> {
    const validated = validate(CreateBookingSchema, data);

    // Fetch rental object to get buffer time configuration
    const rentalObject = await this.rentalObjectRepository.findById(validated.rentalObjectId);
    if (!rentalObject) {
      throw new ForbiddenError('Rental object not found');
    }

    // Extract buffer time from rental object metadata (default to 0 if not set)
    const bufferTimeMinutes = (rentalObject.metadata as any)?.bufferTimeMinutes || 0;
    const bufferTimeMs = bufferTimeMinutes * 60 * 1000;

    // Check availability with buffer time
    const conflicts = await this.repository.findByListingAndDateRange(
      validated.rentalObjectId,
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
      rentalObjectId: validated.rentalObjectId,
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
      metadata: { rentalObjectId: booking.rentalObjectId, startTime: booking.startTime, endTime: booking.endTime },
    });

    // Broadcast booking event for real-time updates
    broadcastBookingEvent({
      type: 'created',
      bookingId: booking.id,
      rentalObjectId: booking.rentalObjectId,
      tenantId: booking.tenantId,
      startTime: booking.startTime,
      endTime: booking.endTime,
      userId: booking.userId,
      version: booking.version,
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

    // Broadcast booking event for real-time updates
    broadcastBookingEvent({
      type: 'confirmed',
      bookingId: booking.id,
      rentalObjectId: booking.rentalObjectId,
      tenantId: booking.tenantId,
      startTime: booking.startTime,
      endTime: booking.endTime,
      userId: booking.userId,
      version: booking.version,
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

    // Broadcast booking event for real-time updates
    broadcastBookingEvent({
      type: 'cancelled',
      bookingId: booking.id,
      rentalObjectId: booking.rentalObjectId,
      tenantId: booking.tenantId,
      startTime: booking.startTime,
      endTime: booking.endTime,
      userId: booking.userId,
      version: booking.version,
      metadata: { reason: validated.reason },
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

    // Broadcast booking event for real-time updates
    broadcastBookingEvent({
      type: 'completed',
      bookingId: booking.id,
      rentalObjectId: booking.rentalObjectId,
      tenantId: booking.tenantId,
      startTime: booking.startTime,
      endTime: booking.endTime,
      userId: booking.userId,
      version: booking.version,
    });

    return booking as unknown as Booking;
  }

  /**
   * Check if a case handler has scope for the given rental object
   * Case handlers (saksbehandler role) must have an active case_handler_scopes entry
   * to approve/deny bookings for a specific rental object.
   *
   * Scope types:
   * - 'all': Handler has access to all rental objects in tenant (commune-wide)
   * - 'specific': Handler has access to specific rental objects
   */
  async hasCaseHandlerScope(userId: string, rentalObjectId: string, tenantId: string): Promise<boolean> {
    try {
      const db = container.resolve<any>('Database');

      // First check user's role - admins bypass scope checks
      const userResult = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (userResult.length === 0) {
        return false;
      }

      const user = userResult[0];

      // Admins and super_admins bypass scope checks
      if (user.role === 'super_admin' || user.role === 'admin') {
        return true;
      }

      // For case handlers (saksbehandler), check case_handler_scopes
      if (user.role === 'saksbehandler') {
        const scopes = await db
          .select()
          .from(caseHandlerScopes)
          .where(
            and(
              eq(caseHandlerScopes.userId, userId),
              eq(caseHandlerScopes.tenantId, tenantId),
              eq(caseHandlerScopes.status, 'active'),
              or(
                // Either scope type is 'all' (tenant-wide access)
                eq(caseHandlerScopes.scopeType, 'all'),
                // Or specific rental object match
                and(
                  eq(caseHandlerScopes.scopeType, 'specific'),
                  eq(caseHandlerScopes.rentalObjectId, rentalObjectId)
                )
              )
            )
          )
          .limit(1);

        return scopes.length > 0;
      }

      // For regular users without case handler role, deny
      return false;
    } catch (error) {
      this.adapters?.log?.error('Error checking case handler scope', { error, userId, rentalObjectId });
      return false;
    }
  }

  /**
   * Deny booking (case handler action)
   *
   * Scope enforcement:
   * - super_admin/admin: Can deny any booking
   * - saksbehandler: Must have case_handler_scopes entry for the booking's rental object
   *
   * Note: Per PERMISSION_MATRIX, ORG_CASE_HANDLER role cannot deny (approve only)
   */
  async deny(id: string, userId: string, data: DenyBookingDTO = {}): Promise<Booking> {
    const validated = validate(DenyBookingSchema, data);
    const existing = await this.findByIdOrFail(id);

    // Enforce case handler scope
    const hasScope = await this.hasCaseHandlerScope(userId, existing.rentalObjectId, existing.tenantId);
    if (!hasScope) {
      throw new ForbiddenError(
        'You do not have scope to deny bookings for this rental object. ' +
        'Case handlers must be assigned scope for specific rental objects.'
      );
    }

    const updateData: Record<string, unknown> = {
      status: 'denied',
    };

    // Preserve existing notes or append denial reason
    if (validated.reason) {
      updateData.notes = existing.notes
        ? `${existing.notes}\n[Denied] ${validated.reason}`
        : `[Denied] ${validated.reason}`;
    }

    // Store denial metadata
    updateData.metadata = {
      ...(existing.metadata || {}),
      deniedBy: userId,
      deniedAt: new Date().toISOString(),
      denialReason: validated.reason,
    };

    const booking = await this.repository.update(id, updateData);
    this.adapters?.log?.warn('Booking denied', { id, deniedBy: userId, reason: validated.reason });

    getAuditService().log({
      tenantId: booking.tenantId,
      userId,
      action: 'deny',
      resource: 'booking',
      resourceId: id,
      severity: 'warning',
      metadata: {
        previousStatus: existing.status,
        newStatus: 'denied',
        reason: validated.reason,
        scopeVerified: true,
      },
    });

    // Broadcast booking event for real-time updates
    broadcastBookingEvent({
      type: 'denied',
      bookingId: booking.id,
      rentalObjectId: booking.rentalObjectId,
      tenantId: booking.tenantId,
      startTime: booking.startTime,
      endTime: booking.endTime,
      userId: booking.userId,
      version: booking.version,
      metadata: { deniedBy: userId, reason: validated.reason },
    });

    return booking as unknown as Booking;
  }

  /**
   * Get calendar events for a tenant
   */
  async getCalendarEvents(tenantId: string, rentalObjectId?: string): Promise<CalendarEvent[]> {
    const result = await this.findAll(tenantId, { rentalObjectId, limit: 100, page: 1 });
    
    return result.data.map((booking) => ({
      id: booking.id,
      rentalObjectId: booking.rentalObjectId,
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

    // Broadcast booking event for real-time updates
    broadcastBookingEvent({
      type: 'updated',
      bookingId: booking.id,
      rentalObjectId: booking.rentalObjectId,
      tenantId: booking.tenantId,
      startTime: booking.startTime,
      endTime: booking.endTime,
      userId: booking.userId,
      version: booking.version,
      metadata: { changes: Object.keys(updateData) },
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

    // Broadcast booking event for real-time updates
    broadcastBookingEvent({
      type: 'updated',
      bookingId: booking.id,
      rentalObjectId: booking.rentalObjectId,
      tenantId: booking.tenantId,
      startTime: booking.startTime,
      endTime: booking.endTime,
      userId: booking.userId,
      version: booking.version,
      metadata: { status },
    });

    return booking as unknown as Booking;
  }

  /**
   * Calculate pricing for a booking
   */
  async calculatePricing(rentalObjectId: string, startTime: string, endTime: string): Promise<any> {
    // In production, would fetch rental object pricing and calculate
    const start = new Date(startTime);
    const end = new Date(endTime);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    
    return {
      rentalObjectId,
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
    const { rentalObjectId, startTime, endTime, frequency, endDate, weekdays } = data;

    // Generate recurring dates
    const bookings: Booking[] = [];
    const start = new Date(startTime);
    const end = new Date(endDate);

    // Create first booking
    const firstBooking = await this.create(tenantId, userId, {
      rentalObjectId,
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
      rentalObjectId: validated.rentalObjectId,
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
      validated.rentalObjectId,
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
        rentalObjectId: validated.rentalObjectId,
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
          rentalObjectId: validated.rentalObjectId,
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
            rentalObjectId: validated.rentalObjectId,
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
      rentalObjectId: validated.rentalObjectId,
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
    const occurrencesWithStatus = await this.checkOccurrenceConflicts(validated.rentalObjectId, occurrences);

    // Calculate summary statistics
    const summary = this.calculateRecurringSummary(occurrencesWithStatus);

    // Determine available actions based on conflicts
    const availableActions = this.determineAvailableActions(summary);

    // Build proposed selection for partial creation if there are conflicts
    const proposedSelection = summary.conflictCount > 0 && summary.availableCount > 0
      ? { ...validated }
      : undefined;

    const preview: RecurringPreviewProjection = {
      rentalObjectId: validated.rentalObjectId,
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
      rentalObjectId: validated.rentalObjectId,
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
    rentalObjectId: string,
    occurrences: RecurringOccurrence[]
  ): Promise<RecurringOccurrence[]> {
    const checkedOccurrences: RecurringOccurrence[] = [];

    for (const occurrence of occurrences) {
      const startTime = new Date(occurrence.startTime);
      const endTime = new Date(occurrence.endTime);

      // Check for existing bookings in this time slot
      const conflicts = await this.repository.findByListingAndDateRange(
        rentalObjectId,
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

    // Mock pricing - in production would calculate based on rental object rates
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

  /**
   * Get booking quote projection
   * Returns rental-object-driven quote with pricing, availability, and available actions
   * All booking rules enforced from rental_objects configuration
   */
  async getQuote(
    tenantId: string,
    userId: string | undefined,
    selection: BookingSelection
  ): Promise<BookingQuoteProjection> {
    // Fetch the rental object to get configuration
    const rentalObject = await this.rentalObjectRepository.findById(selection.rentalObjectId);
    if (!rentalObject) {
      throw new ForbiddenError('Rental object not found');
    }

    const metadata = (rentalObject.metadata || {}) as Record<string, unknown>;
    const pricing = (rentalObject.pricing || { basePrice: 0, currency: 'NOK', unit: 'hour' }) as {
      basePrice: number;
      currency: string;
      unit: string;
    };

    // Calculate duration
    const startTime = new Date(selection.startTime);
    const endTime = new Date(selection.endTime);
    const durationMs = endTime.getTime() - startTime.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);
    const durationMinutes = durationMs / (1000 * 60);

    // Check availability
    const conflicts = await this.repository.findByListingAndDateRange(
      selection.rentalObjectId,
      startTime,
      endTime
    );

    const bufferTimeMinutes = (metadata.bufferTimeMinutes as number) || 0;
    const bufferTimeMs = bufferTimeMinutes * 60 * 1000;
    const requestedStart = startTime.getTime();
    const requestedEnd = endTime.getTime();

    const hasConflict = conflicts.some((existingBooking) => {
      const existingStart = new Date(existingBooking.startTime).getTime() - bufferTimeMs;
      const existingEnd = new Date(existingBooking.endTime).getTime() + bufferTimeMs;
      return requestedStart < existingEnd && requestedEnd > existingStart;
    });

    // Calculate pricing based on rental object configuration
    let basePrice = 0;
    let totalPrice = 0;

    switch (pricing.unit) {
      case 'hour':
        basePrice = pricing.basePrice * durationHours;
        break;
      case 'half_day':
        basePrice = pricing.basePrice * Math.ceil(durationHours / 4);
        break;
      case 'day':
        basePrice = pricing.basePrice * Math.ceil(durationHours / 24);
        break;
      case 'fixed':
        basePrice = pricing.basePrice;
        break;
      default:
        basePrice = pricing.basePrice * durationHours;
    }

    totalPrice = basePrice;

    // Determine slot status
    let slotStatus: 'AVAILABLE' | 'RESERVED' | 'BOOKED' | 'BLOCKED' | 'BLACKOUT' = 'AVAILABLE';
    let policyReasonKey: string | undefined;

    if (hasConflict) {
      slotStatus = 'BOOKED';
      policyReasonKey = 'booking.slot.alreadyBooked';
    }

    // Check booking constraints from rental object
    const minBookingMinutes = (metadata.minBookingMinutes as number) || 30;
    const maxBookingMinutes = (metadata.maxBookingMinutes as number) || 480;
    const advanceBookingDays = (metadata.advanceBookingDays as number) || 90;

    if (durationMinutes < minBookingMinutes) {
      slotStatus = 'BLOCKED';
      policyReasonKey = 'booking.constraint.minDuration';
    }

    if (durationMinutes > maxBookingMinutes) {
      slotStatus = 'BLOCKED';
      policyReasonKey = 'booking.constraint.maxDuration';
    }

    const now = new Date();
    const daysInAdvance = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (daysInAdvance > advanceBookingDays) {
      slotStatus = 'BLOCKED';
      policyReasonKey = 'booking.constraint.advanceBookingLimit';
    }

    if (startTime < now) {
      slotStatus = 'BLOCKED';
      policyReasonKey = 'booking.constraint.pastDate';
    }

    // Determine available actions based on status
    const availableActions: Array<'BOOK' | 'REQUEST' | 'WAITLIST' | 'MODIFY'> = [];
    if (slotStatus === 'AVAILABLE') {
      availableActions.push('BOOK');
      availableActions.push('MODIFY');
    } else if (slotStatus === 'BOOKED' && metadata.allowWaitlist) {
      availableActions.push('WAITLIST');
      availableActions.push('MODIFY');
    } else {
      availableActions.push('MODIFY');
    }

    // Build the quote projection
    const quote: BookingQuoteProjection = {
      rentalObjectId: selection.rentalObjectId,
      rentalObjectName: rentalObject.name,
      selection: {
        startTime: selection.startTime,
        endTime: selection.endTime,
        mode: selection.mode || 'SINGLE',
      },
      slot: {
        status: slotStatus,
        policyReasonKey,
      },
      pricing: {
        basePrice: Math.round(basePrice * 100) / 100,
        discount: 0,
        totalPrice: Math.round(totalPrice * 100) / 100,
        currency: pricing.currency || 'NOK',
        breakdown: [
          {
            label: `${pricing.unit === 'hour' ? durationHours.toFixed(1) + ' timer' : '1 ' + pricing.unit}`,
            amount: Math.round(basePrice * 100) / 100,
          },
        ],
      },
      constraints: {
        minDurationMinutes: minBookingMinutes,
        maxDurationMinutes: maxBookingMinutes,
        bufferTimeMinutes,
        advanceBookingDays,
        cancellationDeadlineHours: (metadata.cancellationDeadlineHours as number) || 24,
      },
      availableActions,
      createdAt: new Date().toISOString(),
    };

    return quote;
  }

  /**
   * Approve booking (caseworker/admin only)
   * Updates status to 'approved' and logs approval metadata
   */
  async approve(id: string, userId: string, reason?: string): Promise<Booking> {
    const booking = await this.repository.findByIdOrFail(id);
    
    // Update status to approved
    const updated = await this.repository.update(id, {
      status: 'approved',
      metadata: {
        ...(booking.metadata as any),
        approvedBy: userId,
        approvedAt: new Date().toISOString(),
        approvalReason: reason,
      },
    });

    this.adapters?.log?.info('Booking approved', { id, userId, reason });

    // Audit log
    getAuditService().log({
      tenantId: booking.tenantId,
      userId,
      action: 'approve',
      resource: 'booking',
      resourceId: id,
      metadata: { reason, previousStatus: booking.status },
    });

    // Broadcast event
    broadcastBookingEvent({
      type: 'approved',
      bookingId: id,
      rentalObjectId: booking.rentalObjectId,
      tenantId: booking.tenantId,
      startTime: booking.startTime,
      endTime: booking.endTime,
      userId,
      version: updated.version,
      metadata: { approvedBy: userId, reason },
    });

    return updated as unknown as Booking;
  }

  /**
   * Reject booking (caseworker/admin only)
   * Updates status to 'rejected' and requires rejection reason
   */
  async reject(id: string, userId: string, reason: string): Promise<Booking> {
    const booking = await this.repository.findByIdOrFail(id);
    
    if (!reason || reason.trim().length === 0) {
      throw new ForbiddenError('Rejection reason is required');
    }
    
    // Update status to rejected
    const updated = await this.repository.update(id, {
      status: 'rejected',
      metadata: {
        ...(booking.metadata as any),
        rejectedBy: userId,
        rejectedAt: new Date().toISOString(),
        rejectionReason: reason,
      },
    });

    this.adapters?.log?.warn('Booking rejected', { id, userId, reason });

    // Audit log
    getAuditService().log({
      tenantId: booking.tenantId,
      userId,
      action: 'reject',
      resource: 'booking',
      resourceId: id,
      severity: 'warning',
      metadata: { reason, previousStatus: booking.status },
    });

    // Broadcast event
    broadcastBookingEvent({
      type: 'rejected',
      bookingId: id,
      rentalObjectId: booking.rentalObjectId,
      tenantId: booking.tenantId,
      startTime: booking.startTime,
      endTime: booking.endTime,
      userId,
      version: updated.version,
      metadata: { rejectedBy: userId, reason },
    });

    return updated as unknown as Booking;
  }
}

