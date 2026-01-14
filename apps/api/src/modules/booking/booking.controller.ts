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
} from '../../schemas/booking.schema';
import type { FastifyRequest, FastifyReply } from 'fastify';

@Controller('/api/bookings')
export class BookingController {
  constructor(
    @Inject('BookingService') private readonly service: BookingService
  ) {}

  /**
   * GET /api/bookings - List all bookings
   */
  @Get()
  async findAll(request: TenantRequest, reply: FastifyReply) {
    const tenantId = getTenantId(request);
    const params = validate(BookingQuerySchema, request.query);
    const result = await this.service.findAll(tenantId, { ...params, page: params.page ?? 1, limit: params.limit ?? 20 });
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
   * GET /api/calendar - Get calendar events
   */
  @Get('/calendar')
  async getCalendar(request: TenantRequest, reply: FastifyReply) {
    const tenantId = getTenantId(request);
    const { listingId } = request.query as any;
    const events = await this.service.getCalendarEvents(tenantId, listingId);
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
    const { listingId, startTime, endTime } = request.query as any;
    if (!listingId || !startTime || !endTime) {
      reply.code(400);
      return { error: { code: 'VALIDATION_ERROR', message: 'listingId, startTime, endTime required' } };
    }
    const pricing = await this.service.calculatePricing(listingId, startTime, endTime);
    return { data: pricing };
  }

  /**
   * GET /api/bookings/my - Get user's bookings with listing details
   */
  @Get('/my')
  async getMyBookings(request: TenantRequest, reply: FastifyReply) {
    const userId = request.userId || (request.headers['x-user-id'] as string);
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
        listingId: booking.listingId,
        description: booking.notes || 'Leie av lokale',
        duration: `${new Date(booking.startTime).toISOString()} - ${new Date(booking.endTime).toISOString()}`,
      },
      
      // WHERE (Hvor)
      location: {
        tenantId: booking.tenantId,
        listingId: booking.listingId,
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
}

