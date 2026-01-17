/**
 * Booking Controller
 * REST API endpoints for booking management
 */
import { Controller, Get, Post, Put, Delete } from '../../core/decorators';
import { Inject } from '../../core/decorators';
import { BookingService } from './booking.service';
import { validate } from '../../core/validation/zod-pipe';
import { getTenantId, getOptionalUserId, TenantRequest } from '../../core/validation/tenant';
import {
  CreateBookingSchema,
  BookingQuerySchema,
  CancelBookingSchema,
  ApproveBookingSchema,
  DenyBookingSchema,
} from '../../schemas/booking.schema';
import { requirePermission, type SystemRole } from '../../core/middleware/rbac.middleware';
import { ForbiddenError } from '../../core/errors/problem-details';
import type { FastifyRequest, FastifyReply } from 'fastify';

@Controller('/api/bookings')
export class BookingController {
  constructor(
    @Inject('BookingService') private readonly service: BookingService
  ) {}

  /**
   * GET /api/bookings - List all bookings
   *
   * Query params:
   * - listingId: Filter by listing
   * - userId: Filter by user
   * - orgId: Filter by organization (for org-scoped RBAC access)
   * - status: Filter by booking status
   * - from: Filter bookings starting from this date
   * - to: Filter bookings ending before this date
   * - page: Page number (default: 1)
   * - limit: Results per page (default: 20, max: 100)
   *
   * Scope enforcement:
   * - admin/COMMUNE_ADMIN: Can view all bookings in tenant
   * - ORG_ADMIN/ORG_CASE_HANDLER: Should pass orgId to filter to org's bookings
   */
  @Get()
  async findAll(request: TenantRequest, reply: FastifyReply) {
    const tenantId = getTenantId(request);
    const params = validate(BookingQuerySchema, request.query);

    // Extract orgId for org-scoped access (filters via listings.organizationId)
    const { orgId, ...otherParams } = params;

    const result = await this.service.findAll(tenantId, {
      ...otherParams,
      orgId, // Pass orgId for org-scoped filtering
      page: params.page ?? 1,
      limit: params.limit ?? 20
    });
    return result;
  }

  /**
   * GET /api/bookings/:id - Get booking by ID
   */
  @Get('/:id')
  async findById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const booking = await this.service.findByIdOrFail(request.params.id);
    return { booking };
  }

  /**
   * POST /api/bookings - Create new booking
   */
  @Post()
  async create(request: TenantRequest, reply: FastifyReply) {
    const tenantId = getTenantId(request);
    const userId = getOptionalUserId(request);
    const data = validate(CreateBookingSchema, request.body);
    const booking = await this.service.create(tenantId, userId, data);
    return reply.status(201).send({ booking });
  }

  /**
   * PUT /api/bookings/:id/confirm - Confirm booking
   */
  @Put('/:id/confirm')
  async confirm(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const booking = await this.service.confirm(request.params.id);
    return { booking };
  }

  /**
   * PUT /api/bookings/:id/cancel - Cancel booking
   */
  @Put('/:id/cancel')
  async cancel(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const data = validate(CancelBookingSchema, request.body || {});
    const booking = await this.service.cancel(request.params.id, data);
    return { booking };
  }

  /**
   * PUT /api/bookings/:id/complete - Complete booking
   */
  @Put('/:id/complete')
  async complete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const booking = await this.service.complete(request.params.id);
    return { booking };
  }

  /**
   * POST /api/bookings/:id/approve - Approve booking (case handler action)
   * Requires bookings:approve permission
   *
   * Request body:
   * - notes: Optional approval notes
   *
   * Scope enforcement:
   * - admin/COMMUNE_ADMIN: Can approve any booking in tenant
   * - saksbehandler: Can approve bookings within assigned scope
   * - ORG_ADMIN/ORG_CASE_HANDLER: Can approve bookings for org's rental objects
   */
  @Post('/:id/approve')
  async approve(request: TenantRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const userId = request.userId || (request.headers['x-user-id'] as string);

    if (!userId) {
      throw new ForbiddenError('User authentication required');
    }

    const data = validate(ApproveBookingSchema, request.body || {});
    const booking = await this.service.approve(id, userId, data);
    return { data: booking };
  }

  /**
   * POST /api/bookings/:id/deny - Deny booking (case handler action)
   * Requires bookings:deny permission
   *
   * Request body:
   * - reason: Optional denial reason
   *
   * Scope enforcement:
   * - admin/COMMUNE_ADMIN: Can deny any booking in tenant
   * - saksbehandler: Can deny bookings within assigned scope (if permitted)
   * - ORG_ADMIN: Can deny bookings for org's rental objects
   * - ORG_CASE_HANDLER: Cannot deny (approve only per PERMISSION_MATRIX)
   */
  @Post('/:id/deny')
  async deny(request: TenantRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const userId = request.userId || (request.headers['x-user-id'] as string);

    if (!userId) {
      throw new ForbiddenError('User authentication required');
    }

    const data = validate(DenyBookingSchema, request.body || {});
    const booking = await this.service.deny(id, userId, data);
    return { data: booking };
  }

  /**
   * GET /api/calendar - Get calendar events
   */
  @Get('/calendar')
  async getCalendar(request: TenantRequest, reply: FastifyReply) {
    const tenantId = getTenantId(request);
    const { rentalObjectId } = request.query as any;
    const events = await this.service.getCalendarEvents(tenantId, rentalObjectId);
    return { events };
  }

  /**
   * PUT /api/bookings/:id - Update booking
   */
  @Put('/:id')
  async update(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const body = request.body as any;
    const booking = await this.service.update(request.params.id, body);
    return { data: booking };
  }

  /**
   * PUT /api/bookings/:id/status - Change status
   */
  @Put('/:id/status')
  async updateStatus(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { status } = request.body as any;
    const booking = await this.service.updateStatus(request.params.id, status);
    return { data: booking };
  }

  /**
   * GET /api/bookings/pricing - Calculate price
   */
  @Get('/pricing')
  async calculatePricing(request: TenantRequest, reply: FastifyReply) {
    const { rentalObjectId, startTime, endTime } = request.query as any;
    if (!rentalObjectId || !startTime || !endTime) {
      reply.code(400);
      return { error: { code: 'VALIDATION_ERROR', message: 'rentalObjectId, startTime, endTime required' } };
    }
    const pricing = await this.service.calculatePricing(rentalObjectId, startTime, endTime);
    return { data: pricing };
  }

  /**
   * GET /api/bookings/my - Get user's bookings with listing details
   */
  @Get('/my')
  async getMyBookings(request: TenantRequest, reply: FastifyReply) {
    const userId = request.userId;
    if (!userId) {
      reply.code(401);
      return { error: { code: 'UNAUTHORIZED', message: 'User not authenticated' } };
    }
    const { page, limit } = request.query as { page?: string; limit?: string };
    const result = await this.service.findByUser(userId, {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
    return { data: result.data, meta: result.pagination };
  }

  /**
   * GET /api/bookings/recurring - List recurring bookings
   */
  @Get('/recurring')
  async getRecurring(request: TenantRequest, reply: FastifyReply) {
    const tenantId = getTenantId(request);
    const bookings = await this.service.findRecurring(tenantId);
    return { data: bookings };
  }

  /**
   * POST /api/bookings/recurring - Create recurring booking
   */
  @Post('/recurring')
  async createRecurring(request: TenantRequest, reply: FastifyReply) {
    const tenantId = getTenantId(request);
    const userId = getOptionalUserId(request);
    const body = request.body as any;
    const bookings = await this.service.createRecurring(tenantId, userId, body);
    reply.code(201);
    return { data: bookings };
  }

  /**
   * POST /api/bookings/recurring/preview - Preview recurring booking with conflicts
   * Returns list of occurrences with conflict status and alternative suggestions
   * PRD: W-5 Recurring conflicts + alternatives
   */
  @Post('/recurring/preview')
  async previewRecurring(request: TenantRequest, reply: FastifyReply) {
    const tenantId = getTenantId(request);
    const selection = request.body as any;

    if (!selection.rentalObjectId || !selection.startTime) {
      reply.code(400);
      return {
        type: 'https://api.digilist.no/errors/validation-error',
        title: 'Validation Error',
        status: 400,
        detail: 'rentalObjectId and startTime are required',
      };
    }

    // Delegate to existing service method with full conflict detection
    const preview = await this.service.previewRecurring(tenantId, selection);
    
    return { data: preview };
  }

  /**
   * GET /api/bookings/:id/receipt - Get booking receipt/bilag
   * KRAV-ADM-07: Salgsbilag iht bokføringskrav
   */
  @Get('/:id/receipt')
  async getReceipt(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const booking = await this.service.findByIdOrFail(request.params.id);
    
    // Generate receipt data (hvem/hva/hvor/når)
    const receipt = {
      receiptNumber: `REC-${booking.id.slice(0,8).toUpperCase()}`,
      bookingId: booking.id,
      generatedAt: new Date().toISOString(),
      
      // WHO (Hvem)
      customer: {
        userId: booking.userId,
        tenantId: booking.tenantId,
      },
      
      // WHAT (Hva)
      service: {
        rentalObjectId: booking.rentalObjectId,
        description: booking.notes || 'Leie av lokale',
        duration: `${new Date(booking.startTime).toISOString()} - ${new Date(booking.endTime).toISOString()}`,
      },
      
      // WHERE (Hvor)
      location: {
        tenantId: booking.tenantId,
        rentalObjectId: booking.rentalObjectId,
      },
      
      // WHEN (Når)
      timing: {
        bookingDate: booking.createdAt,
        serviceDate: booking.startTime,
        receiptDate: new Date().toISOString(),
      },
      
      // AMOUNT
      payment: {
        amount: booking.totalPrice,
        currency: booking.currency,
        status: booking.status,
      },
    };
    
    return { data: receipt };
  }

  /**
   * PUT /api/bookings/:id/approve - Approve booking (caseworker/admin only)
   */
  @Put('/:id/approve')
  async approveWithPut(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { reason } = request.body as { reason?: string };
    const user = request.user as any;
    
    if (!user || !user.userId) {
      return reply.status(401).send({
        type: 'https://api.digilist.no/errors/unauthorized',
        title: 'Unauthorized',
        status: 401,
        detail: 'Authentication required',
      });
    }
    
    // Check role (caseworker or admin)
    if (user.role !== 'CASEWORKER' && user.role !== 'ADMIN' && user.role !== 'SAAS_ADMIN') {
      return reply.status(403).send({
        type: 'https://api.digilist.no/errors/forbidden',
        title: 'Forbidden',
        status: 403,
        detail: 'This action requires CASEWORKER or ADMIN role',
      });
    }
    
    const booking = await this.service.approve(request.params.id, user.userId, reason);
    return { data: booking };
  }

  /**
   * PATCH /api/bookings/:id/reject - Reject booking (caseworker/admin only)
   */
  @Put('/:id/reject')
  async reject(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { reason } = request.body as { reason: string };
    const user = request.user as any;
    
    if (!user || !user.userId) {
      return reply.status(401).send({
        type: 'https://api.digilist.no/errors/unauthorized',
        title: 'Unauthorized',
        status: 401,
        detail: 'Authentication required',
      });
    }
    
    // Check role (caseworker or admin)
    if (user.role !== 'CASEWORKER' && user.role !== 'ADMIN' && user.role !== 'SAAS_ADMIN') {
      return reply.status(403).send({
        type: 'https://api.digilist.no/errors/forbidden',
        title: 'Forbidden',
        status: 403,
        detail: 'This action requires CASEWORKER or ADMIN role',
      });
    }
    
    if (!reason || reason.trim().length === 0) {
      return reply.status(400).send({
        type: 'https://api.digilist.no/errors/validation-error',
        title: 'Validation Error',
        status: 400,
        detail: 'Rejection reason is required',
      });
    }
    
    const booking = await this.service.reject(request.params.id, user.userId, reason);
    return { data: booking };
  }
}

/**
 * Export RBAC preHandlers for route protection
 * These can be used in the Fastify route registration for scope enforcement
 *
 * Permission matrix (from rbac.middleware.ts):
 * - admin/COMMUNE_ADMIN: bookings:approve, bookings:deny
 * - saksbehandler: bookings:approve, bookings:deny (within scope)
 * - ORG_ADMIN: bookings:approve, bookings:deny (org scope)
 * - ORG_CASE_HANDLER: bookings:approve (no deny per spec)
 * - user/ORG_MEMBER: neither approve nor deny
 */
export const bookingPreHandlers = {
  read: requirePermission('bookings', 'read'),
  create: requirePermission('bookings', 'create'),
  update: requirePermission('bookings', 'update'),
  confirm: requirePermission('bookings', 'confirm'),
  cancel: requirePermission('bookings', 'cancel'),
  approve: requirePermission('bookings', 'approve'),
  deny: requirePermission('bookings', 'deny'),
};
