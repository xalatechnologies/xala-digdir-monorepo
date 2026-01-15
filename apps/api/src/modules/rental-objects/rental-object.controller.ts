/**
 * Rental Object Controller
 * REST API endpoints for rental objects (utleieobjekter) management
 * 
 * This is the primary controller for rental object operations.
 * The legacy /api/listings endpoint is deprecated and will be removed in a future version.
 */
import { Controller, Get, Post, Put, Delete } from '../../core/decorators';
import { Inject } from '../../core/decorators';
import { ListingService } from '../listing/listing.service';
import { toDetailsProjection } from '../listing/listing.projections';
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
    @Inject('ListingService') private readonly service: ListingService
  ) {}

  /**
   * GET /api/rental-objects - List all rental objects
   * Returns { data, meta } format for SDK compatibility
   */
  @Get()
  async findAll(request: TenantRequest, reply: FastifyReply) {
    const tenantId = getOptionalTenantId(request);
    const params = validate(RentalObjectQuerySchema, request.query);
    const result = await this.service.findAll(tenantId, { 
      ...params, 
      page: params.page ?? 1, 
      limit: params.limit ?? 20,
      sortBy: params.sortBy ?? 'createdAt',
      sortOrder: params.sortOrder ?? 'desc',
    });
    
    return {
      data: result.data,
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
  async findById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
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
  async update(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const data = validate(UpdateRentalObjectSchema, request.body);
    const rentalObject = await this.service.update(request.params.id, data as Parameters<typeof this.service.update>[1]);
    return { data: rentalObject };
  }

  /**
   * PUT /api/rental-objects/:id/publish - Publish rental object
   */
  @Put('/:id/publish')
  async publish(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const rentalObject = await this.service.publish(request.params.id);
    return { data: rentalObject };
  }

  /**
   * PUT /api/rental-objects/:id/unpublish - Unpublish rental object (set to draft)
   */
  @Put('/:id/unpublish')
  async unpublish(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
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
  async archive(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const rentalObject = await this.service.archive(request.params.id);
    return { data: rentalObject };
  }

  /**
   * PUT /api/rental-objects/:id/restore - Restore archived rental object
   */
  @Put('/:id/restore')
  async restore(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const rentalObject = await this.service.restore(request.params.id);
    return { data: rentalObject };
  }

  /**
   * DELETE /api/rental-objects/:id - Delete rental object
   */
  @Delete('/:id')
  async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
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
   * GET /api/rental-objects/:id/calendar-config - Get calendar configuration
   */
  @Get('/:id/calendar-config')
  async getCalendarConfig(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const config = await this.service.getCalendarConfig(request.params.id);
    return { data: config };
  }

  /**
   * POST /api/rental-objects/:id/media - Upload media
   */
  @Post('/:id/media')
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
  async deleteMedia(request: FastifyRequest<{ Params: { id: string; mediaId: string } }>, reply: FastifyReply) {
    await this.service.removeMedia(request.params.id, request.params.mediaId);
    return { success: true };
  }

  /**
   * GET /api/rental-objects/:id/stats - Get rental object statistics
   */
  @Get('/:id/stats')
  async getStats(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const stats = await this.service.getStats(request.params.id);
    return { data: stats };
  }
}
