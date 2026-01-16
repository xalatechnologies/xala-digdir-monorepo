/**
 * Calendar Controllers
 * REST API endpoints for calendar configuration, availability, events, and allocations
 * 
 * Uses repository pattern for clean separation:
 * - Repository handles data access (no direct schema imports)
 */
import { Controller, Get, Post, Put, Delete, Inject } from '../../core/decorators';
import { validate } from '../../core/validation/zod-pipe';
import {
  CalendarConfigQuerySchema,
  AvailabilityMatrixQuerySchema,
} from '../../schemas/calendar.schema';
import { CalendarService } from './calendar.service';
import { getCalendarRepository } from './calendar.repository';
import type { FastifyRequest, FastifyReply } from 'fastify';

interface TenantRequest extends FastifyRequest {
  tenantId?: string | null;
  userId?: string | null;
}

// =============================================================================
// Rental Object Calendar Config Controller
// =============================================================================

/**
 * Rental Object Calendar Config Controller
 * Handles GET /api/rental-objects/:id/calendar-config endpoint
 */
@Controller('/api/rental-objects')
export class RentalObjectCalendarConfigController {
  constructor(
    @Inject('CalendarService') private readonly calendarService: CalendarService
  ) {}

  /**
   * GET /api/rental-objects/:id/calendar-config - Get calendar configuration
   * Returns complete calendar behavior configuration for a rental object
   * including granularity, slot rules, permissions, and UI hints
   */
  @Get('/:id/calendar-config')
  async getCalendarConfig(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const params = validate(CalendarConfigQuerySchema, request.query);
    const config = await this.calendarService.getCalendarConfig(
      request.params.id,
      params
    );
    return { data: config };
  }
}

// =============================================================================
// Availability Matrix Controller
// =============================================================================

/**
 * Availability Matrix Controller
 * Handles GET /api/availability/:rentalObjectId endpoint
 */
@Controller('/api/availability')
export class AvailabilityMatrixController {
  constructor(
    @Inject('CalendarService') private readonly calendarService: CalendarService
  ) {}

  /**
   * GET /api/availability/:rentalObjectId - Get availability matrix
   * Returns cell-by-cell availability state for a date range
   * Each cell contains status (AVAILABLE, RESERVED, BOOKED, BLOCKED, BLACKOUT, CLOSED)
   * and optional reason key for localized tooltips
   */
  @Get('/:rentalObjectId')
  async getAvailabilityMatrix(
    request: FastifyRequest<{ Params: { rentalObjectId: string } }>,
    reply: FastifyReply
  ) {
    const params = validate(AvailabilityMatrixQuerySchema, request.query);
    const matrix = await this.calendarService.getAvailabilityMatrix(
      request.params.rentalObjectId,
      params
    );
    return { data: matrix };
  }
}

// =============================================================================
// Legacy Calendar Controller (existing functionality)
// =============================================================================

@Controller('/api/calendar')
export class CalendarController {
  private readonly repository = getCalendarRepository();

  @Get()
  async getEvents(request: TenantRequest, reply: FastifyReply) {
    const { rentalObjectId, startDate, endDate, status } = request.query as any;

    const events = await this.repository.findEvents({
      rentalObjectId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      status,
    });

    return { data: events };
  }

  @Get('/events')
  async getCalendarEvents(request: TenantRequest, reply: FastifyReply) {
    // Alias for getEvents - same logic
    return this.getEvents(request, reply);
  }

  @Post()
  async createAllocation(request: TenantRequest, reply: FastifyReply) {
    const tenantId = request.tenantId || 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
    const body = request.body as any;

    const allocation = await this.repository.create({
      tenantId,
      rentalObjectId: body.rentalObjectId,
      title: body.title,
      startTime: new Date(body.startTime),
      endTime: new Date(body.endTime),
      status: body.status,
      notes: body.notes,
      metadata: body.metadata,
    });

    reply.code(201);
    return { data: allocation };
  }

  @Get('/availability')
  async getAvailability(request: TenantRequest, reply: FastifyReply) {
    const { rentalObjectId, startDate, endDate } = request.query as any;

    if (!rentalObjectId || !startDate || !endDate) {
      reply.code(400);
      return {
        type: 'https://api.digilist.no/errors/validation-error',
        title: 'Validation Error',
        status: 400,
        detail: 'rentalObjectId, startDate, and endDate are required',
      };
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const blockedSlots = await this.repository.getAvailability(rentalObjectId, start, end);

    return {
      rentalObjectId,
      startDate,
      endDate,
      blockedSlots,
    };
  }
}
