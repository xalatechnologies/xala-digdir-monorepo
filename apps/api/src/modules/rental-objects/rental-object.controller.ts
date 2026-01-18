/**
 * Rental Object Controller
 * REST API endpoints for rental objects (utleieobjekter) management
 */
import { Controller, Get, Post, Put, Delete } from '../../core/decorators';
import { Inject } from '../../core/decorators';
import { RequireCustody } from '../../core/decorators/require-custody';
import { CustodyScope } from '../custody/types';
import { RentalObjectService } from './rental-object.service';
import { toDetailsProjection, toCardProjection } from './rental-object.projections';
import { validate } from '../../core/validation/zod-pipe';
import { getOptionalTenantId, getTenantId, TenantRequest } from '../../core/validation/tenant';
import {
  CreateRentalObjectSchema,
  UpdateRentalObjectSchema,
  RentalObjectQuerySchema,
} from '../../schemas/rental-object.schema';
import type { FastifyRequest, FastifyReply } from 'fastify';

@Controller('/api/rental-objects')
export class RentalObjectController {
  constructor(
    @Inject('RentalObjectService') private readonly service: RentalObjectService
  ) {}

  /**
   * GET /api/rental-objects - List all rental objects
   * Returns { data, meta } format for SDK compatibility
   */
  @Get()
  async findAll(request: TenantRequest, _reply: FastifyReply) {
    const tenantId = getOptionalTenantId(request);
    const params = validate(RentalObjectQuerySchema, request.query);
    const result = await this.service.findAll(tenantId, { 
      ...params, 
      page: params.page ?? 1, 
      limit: params.limit ?? 20,
      sortBy: params.sortBy ?? 'createdAt',
      sortOrder: params.sortOrder ?? 'desc',
    });
    
    // Transform raw database records to card projections with primaryImageUrl
    const projectedData = result.data.map(obj => toCardProjection(obj as any));
    
    return {
      data: projectedData,
      meta: {
        total: result.pagination.total,
        page: result.pagination.page,
        limit: result.pagination.limit,
        totalPages: result.pagination.totalPages,
      },
    };
  }

  /**
   * GET /api/rental-objects/:id - Get rental object by ID
   */
  @Get('/:id')
  async findById(request: FastifyRequest<{ Params: { id: string } }>, _reply: FastifyReply) {
    const rentalObject = await this.service.findByIdOrFail(request.params.id);
    return { data: rentalObject };
  }

  /**
   * POST /api/rental-objects - Create new rental object
   */
  @Post()
  async create(request: TenantRequest, reply: FastifyReply) {
    const tenantId = getTenantId(request);
    const data = validate(CreateRentalObjectSchema, request.body);
    const rentalObject = await this.service.create(tenantId, data as any);
    return reply.status(201).send({ data: rentalObject });
  }

  /**
   * PUT /api/rental-objects/:id - Update rental object
   */
  @Put('/:id')
  @RequireCustody(CustodyScope.RO_EDIT)
  async update(request: FastifyRequest<{ Params: { id: string } }>, _reply: FastifyReply) {
    const data = validate(UpdateRentalObjectSchema, request.body);
    const rentalObject = await this.service.update(request.params.id, data as Parameters<typeof this.service.update>[1]);
    return { data: rentalObject };
  }

  /**
   * PUT /api/rental-objects/:id/publish - Publish rental object
   */
  @Put('/:id/publish')
  @RequireCustody(CustodyScope.RO_EDIT)
  async publish(request: FastifyRequest<{ Params: { id: string } }>, _reply: FastifyReply) {
    const rentalObject = await this.service.publish(request.params.id);
    return { data: rentalObject };
  }

  /**
   * PUT /api/rental-objects/:id/unpublish - Unpublish rental object (set to draft)
   */
  @Put('/:id/unpublish')
  @RequireCustody(CustodyScope.RO_EDIT)
  async unpublish(request: FastifyRequest<{ Params: { id: string } }>, _reply: FastifyReply) {
    const rentalObject = await this.service.unpublish(request.params.id);
    return { data: rentalObject };
  }

  /**
   * POST /api/rental-objects/:id/duplicate - Duplicate rental object
   */
  @Post('/:id/duplicate')
  async duplicate(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const rentalObject = await this.service.duplicate(request.params.id);
    reply.code(201);
    return { data: rentalObject };
  }

  /**
   * PUT /api/rental-objects/:id/archive - Archive rental object
   */
  @Put('/:id/archive')
  @RequireCustody(CustodyScope.RO_EDIT)
  async archive(request: FastifyRequest<{ Params: { id: string } }>, _reply: FastifyReply) {
    const rentalObject = await this.service.archive(request.params.id);
    return { data: rentalObject };
  }

  /**
   * PUT /api/rental-objects/:id/restore - Restore archived rental object
   */
  @Put('/:id/restore')
  async restore(request: FastifyRequest<{ Params: { id: string } }>, _reply: FastifyReply) {
    const rentalObject = await this.service.restore(request.params.id);
    return { data: rentalObject };
  }

  /**
   * DELETE /api/rental-objects/:id - Delete rental object
   */
  @Delete('/:id')
  @RequireCustody(CustodyScope.RO_EDIT)
  async delete(request: FastifyRequest<{ Params: { id: string } }>, _reply: FastifyReply) {
    await this.service.delete(request.params.id);
    return { success: true };
  }

  /**
   * GET /api/rental-objects/slug/:slug - Get rental object by slug
   */
  @Get('/slug/:slug')
  async findBySlug(request: FastifyRequest<{ Params: { slug: string } }>, reply: FastifyReply) {
    const rentalObject = await this.service.findBySlug(request.params.slug);
    if (!rentalObject) {
      reply.code(404);
      return { error: { code: 'NOT_FOUND', message: 'Rental object not found' } };
    }
    const projected = toDetailsProjection(rentalObject as any);
    return { data: projected };
  }

  /**
   * GET /api/rental-objects/:id/availability - Get rental object availability
   */
  @Get('/:id/availability')
  async getAvailability(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { startDate, endDate } = request.query as any;
    if (!startDate || !endDate) {
      reply.code(400);
      return { error: { code: 'VALIDATION_ERROR', message: 'startDate and endDate required' } };
    }
    const availability = await this.service.getAvailability(request.params.id, startDate, endDate);
    return { data: availability };
  }

  /**
   * POST /api/rental-objects/:id/media - Upload media
   */
  @Post('/:id/media')
  @RequireCustody(CustodyScope.RO_MEDIA)
  async uploadMedia(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const body = request.body as any;
    const rentalObject = await this.service.addMedia(request.params.id, body.url, body.type || 'image');
    reply.code(201);
    return { data: rentalObject };
  }

  /**
   * DELETE /api/rental-objects/:id/media/:mediaId - Delete media
   */
  @Delete('/:id/media/:mediaId')
  @RequireCustody(CustodyScope.RO_MEDIA)
  async deleteMedia(request: FastifyRequest<{ Params: { id: string; mediaId: string } }>, _reply: FastifyReply) {
    await this.service.removeMedia(request.params.id, request.params.mediaId);
    return { success: true };
  }

  /**
   * GET /api/rental-objects/:id/stats - Get rental object statistics
   */
  @Get('/:id/stats')
  @RequireCustody(CustodyScope.RO_REPORTING)
  async getStats(request: FastifyRequest<{ Params: { id: string } }>, _reply: FastifyReply) {
    const stats = await this.service.getStats(request.params.id);
    return { data: stats };
  }

  /**
   * GET /api/rental-objects/:id/calendar-config - Get calendar configuration
   * Returns booking modes, constraints, and calendar display settings.
   */
  @Get('/:id/calendar-config')
  async getCalendarConfig(request: FastifyRequest<{ Params: { id: string } }>, _reply: FastifyReply) {
    const config = await this.service.getCalendarConfig(request.params.id);
    return { data: config };
  }

  /**
   * GET /api/rental-objects/:id/booking-policy - Get booking policy (Contract-First)
   * Returns all booking rules and constraints that drive the booking UI
   * Reference: packages/client-sdk/src/types/booking-contracts.ts
   */
  @Get('/:id/booking-policy')
  async getBookingPolicy(request: FastifyRequest<{ Params: { id: string } }>, _reply: FastifyReply) {
    const policy = await this.service.getBookingPolicy(request.params.id);
    return { data: policy };
  }

  /**
   * GET /api/rental-objects/:id/payment-policy - Get payment policy (Contract-First)
   * Returns payment requirements, deposit rules, and cancellation policy
   * Reference: packages/client-sdk/src/types/booking-contracts.ts
   */
  @Get('/:id/payment-policy')
  async getPaymentPolicy(request: FastifyRequest<{ Params: { id: string } }>, _reply: FastifyReply) {
    const policy = await this.service.getPaymentPolicy(request.params.id);
    return { data: policy };
  }

  /**
   * GET /api/rental-objects/:id/tabs - Get dynamic tab configuration (Contract-First)
   * Returns which tabs to show on rental object details page
   * Reference: packages/client-sdk/src/types/booking-contracts.ts
   */
  @Get('/:id/tabs')
  async getTabs(request: FastifyRequest<{ Params: { id: string } }>, _reply: FastifyReply) {
    const tabs = await this.service.getTabs(request.params.id);
    return { data: tabs };
  }
}

// =============================================================================
// CATEGORIES CONTROLLER
// =============================================================================

@Controller('/api/categories')
export class CategoriesController {
  /**
   * GET /api/categories - Get all rental object categories
   */
  @Get()
  async getCategories(_request: FastifyRequest, _reply: FastifyReply) {
    const categories = [
      {
        id: 'LOKALER_OG_BANER',
        key: 'LOKALER_OG_BANER',
        name: 'Lokaler og baner',
        nameEn: 'Venues and courts',
        description: 'Møterom, saler, idrettshaller, baner',
        icon: 'building',
        defaultTimeMode: 'PERIOD',
        allowedTimeModes: ['PERIOD', 'SLOT', 'ALL_DAY'],
        allowedFeatures: ['SHARED_CAPACITY'],
        examples: ['Kulturhus', 'Idrettshall', 'Møterom', 'Padelbane'],
      },
      {
        id: 'UTSTYR_OG_INVENTAR',
        key: 'UTSTYR_OG_INVENTAR',
        name: 'Utstyr og inventar',
        nameEn: 'Equipment and inventory',
        description: 'Utstyr som kan lånes med beholdningskontroll',
        icon: 'tool',
        defaultTimeMode: 'ALL_DAY',
        allowedTimeModes: ['ALL_DAY', 'PERIOD'],
        allowedFeatures: ['INVENTORY'],
        examples: ['Partytelt', 'Projektor', 'Lydanlegg', 'Stoler'],
      },
      {
        id: 'KJORETOY_OG_TRANSPORT',
        key: 'KJORETOY_OG_TRANSPORT',
        name: 'Kjøretøy og transport',
        nameEn: 'Vehicles and transport',
        description: 'Biler, sykler, tilhengere',
        icon: 'car',
        defaultTimeMode: 'ALL_DAY',
        allowedTimeModes: ['ALL_DAY', 'PERIOD'],
        allowedFeatures: ['INVENTORY'],
        examples: ['Kommunebil', 'El-sykkel', 'Tilhenger'],
      },
      {
        id: 'OPPLEVELSER_OG_ARRANGEMENT',
        key: 'OPPLEVELSER_OG_ARRANGEMENT',
        name: 'Opplevelser og arrangement',
        nameEn: 'Experiences and events',
        description: 'Kurs, konferanser, workshops med kapasitet',
        icon: 'calendar',
        defaultTimeMode: 'SLOT',
        allowedTimeModes: ['SLOT', 'PERIOD'],
        allowedFeatures: ['SHARED_CAPACITY', 'PACKAGES'],
        examples: ['Konferanse', 'Workshop', 'Kurs', 'Konsert'],
      },
    ];
    return { data: categories };
  }

  /**
   * GET /api/categories/time-modes - Get all booking time modes
   */
  @Get('/time-modes')
  async getTimeModes(_request: FastifyRequest, _reply: FastifyReply) {
    const timeModes = [
      {
        id: 'PERIOD',
        key: 'PERIOD',
        name: 'Tidsperiode',
        nameEn: 'Time period',
        description: 'Velg start- og sluttid fritt',
        calendarBehavior: 'Timeline drag-select',
        calendarUiVariant: 'timeline',
      },
      {
        id: 'SLOT',
        key: 'SLOT',
        name: 'Tidsluke',
        nameEn: 'Time slot',
        description: 'Velg faste tidsluk er',
        calendarBehavior: 'Slot grid selection',
        calendarUiVariant: 'slot-grid',
      },
      {
        id: 'ALL_DAY',
        key: 'ALL_DAY',
        name: 'Heldags',
        nameEn: 'Full day',
        description: 'Book hele dager',
        calendarBehavior: 'Day cards with multi-day picker',
        calendarUiVariant: 'day-cards',
      },
    ];
    return { data: timeModes };
  }

  /**
   * GET /api/categories/features - Get all booking features
   */
  @Get('/features')
  async getFeatures(_request: FastifyRequest, _reply: FastifyReply) {
    const features = [
      {
        id: 'INVENTORY',
        key: 'INVENTORY',
        name: 'Beholdning',
        nameEn: 'Inventory',
        description: 'Spor antall tilgjengelig (x igjen)',
      },
      {
        id: 'SHARED_CAPACITY',
        key: 'SHARED_CAPACITY',
        name: 'Delt kapasitet',
        nameEn: 'Shared capacity',
        description: 'Spor plasser tilgjengelig (plasser igjen)',
      },
      {
        id: 'PACKAGES',
        key: 'PACKAGES',
        name: 'Pakker',
        nameEn: 'Packages',
        description: 'Sett sammen tilleggstjenester ved checkout',
      },
    ];
    return { data: features };
  }
}
