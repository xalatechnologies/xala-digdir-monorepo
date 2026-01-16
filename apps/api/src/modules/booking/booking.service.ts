/**
 * Booking Service
 * Business logic for booking domain
 */
import { Injectable, Inject } from '../../core/decorators';
import { BookingRepository } from './booking.repository';
import { validate } from '../../core/validation/zod-pipe';
import { ForbiddenError } from '../../core/errors/problem-details';
import { getAuditService } from '../../core/audit/audit.service';
import { container } from '../../core/container';
import { eq, and, or, isNull } from 'drizzle-orm';
import { caseHandlerScopes, users, listings } from '../../database/schema/index';
import {
  CreateBookingSchema,
  UpdateBookingSchema,
  BookingQuerySchema,
  CancelBookingSchema,
  ApproveBookingSchema,
  DenyBookingSchema,
  type CreateBookingDTO,
  type UpdateBookingDTO,
  type BookingQueryParams,
  type CancelBookingDTO,
  type ApproveBookingDTO,
  type DenyBookingDTO,
  type Booking,
  type CalendarEvent,
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
   * Approve booking (case handler action)
   *
   * Scope enforcement:
   * - super_admin/admin: Can approve any booking
   * - saksbehandler: Must have case_handler_scopes entry for the booking's rental object
   */
  async approve(id: string, userId: string, data: ApproveBookingDTO = {}): Promise<Booking> {
    const validated = validate(ApproveBookingSchema, data);
    const existing = await this.findByIdOrFail(id);

    // Enforce case handler scope
    const hasScope = await this.hasCaseHandlerScope(userId, existing.listingId, existing.tenantId);
    if (!hasScope) {
      throw new ForbiddenError(
        'You do not have scope to approve bookings for this rental object. ' +
        'Case handlers must be assigned scope for specific rental objects.'
      );
    }

    const updateData: Record<string, unknown> = {
      status: 'approved',
    };

    // Preserve existing notes or append approval notes
    if (validated.notes) {
      updateData.notes = existing.notes
        ? `${existing.notes}\n[Approved] ${validated.notes}`
        : `[Approved] ${validated.notes}`;
    }

    // Store approval metadata
    updateData.metadata = {
      ...(existing.metadata || {}),
      approvedBy: userId,
      approvedAt: new Date().toISOString(),
    };

    const booking = await this.repository.update(id, updateData);
    this.adapters?.log?.info('Booking approved', { id, approvedBy: userId });

    getAuditService().log({
      tenantId: booking.tenantId,
      userId,
      action: 'approve',
      resource: 'booking',
      resourceId: id,
      metadata: {
        previousStatus: existing.status,
        newStatus: 'approved',
        notes: validated.notes,
        scopeVerified: true,
      },
    });

    return booking as unknown as Booking;
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
    const hasScope = await this.hasCaseHandlerScope(userId, existing.listingId, existing.tenantId);
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

