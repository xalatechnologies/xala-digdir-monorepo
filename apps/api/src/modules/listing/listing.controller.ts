/**
 * Listing Controller
 * REST API endpoints for rental object (utleieobjekter) management
 */
import { Controller, Get, Post, Put, Delete } from '../../core/decorators';
import { Inject } from '../../core/decorators';
import { ListingService } from './listing.service';
import { toDetailsProjection } from './listing.projections';
import { validate } from '../../core/validation/zod-pipe';
import { getOptionalTenantId, getTenantId, TenantRequest } from '../../core/validation/tenant';
import {
  CreateRentalObjectSchema,
  UpdateRentalObjectSchema,
  RentalObjectQuerySchema,
} from '../../schemas/rental-object.schema';
import type { FastifyRequest, FastifyReply } from 'fastify';

@Controller('/api/listings')
export class ListingController {
  constructor(
    @Inject('ListingService') private readonly service: ListingService
  ) {}

  /**
   * GET /api/listings - List all rental objects
   * Returns { data, meta } format for SDK compatibility
   */
  @Get()
  async findAll(request: TenantRequest, reply: FastifyReply) {
    // Allow null tenantId for public access to all published listings
    const tenantId = getOptionalTenantId(request);
    const params = validate(RentalObjectQuerySchema, request.query);
    const result = await this.service.findAll(tenantId, { 
      ...params, 
      page: params.page ?? 1, 
      limit: params.limit ?? 20,
      sortBy: params.sortBy ?? 'createdAt',
      sortOrder: params.sortOrder ?? 'desc',
    });
    
    // Transform response to SDK expected format (pagination -> meta)
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
   * GET /api/listings/:id - Get listing by ID
   */
  @Get('/:id')
  async findById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const listing = await this.service.findByIdOrFail(request.params.id);
    return { listing };
  }

  /**
   * POST /api/listings - Create new rental object
   */
  @Post()
  async create(request: TenantRequest, reply: FastifyReply) {
    const tenantId = getTenantId(request);
    const data = validate(CreateRentalObjectSchema, request.body);
    const listing = await this.service.create(tenantId, data as any);
    return reply.status(201).send({ listing });
  }

  /**
   * PUT /api/listings/:id - Update rental object
   */
  @Put('/:id')
  async update(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const data = validate(UpdateRentalObjectSchema, request.body);
    const listing = await this.service.update(request.params.id, data);
    return { listing };
  }

  /**
   * PUT /api/listings/:id/publish - Publish listing
   */
  @Put('/:id/publish')
  async publish(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const listing = await this.service.publish(request.params.id);
    return { listing };
  }

  /**
   * POST /api/listings/:id/duplicate - Duplicate listing
   */
  @Post('/:id/duplicate')
  async duplicate(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const listing = await this.service.duplicate(request.params.id);
    reply.code(201);
    return { listing };
  }

  /**
   * PUT /api/listings/:id/archive - Archive listing
   */
  @Put('/:id/archive')
  async archive(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const listing = await this.service.archive(request.params.id);
    return { listing };
  }

  /**
   * DELETE /api/listings/:id - Delete listing
   */
  @Delete('/:id')
  async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    await this.service.delete(request.params.id);
    return { success: true };
  }

  /**
   * GET /api/listings/slug/:slug - Get listing by slug
   * Returns projected DTO with formatted address, contact, and display-ready fields
   */
  @Get('/slug/:slug')
  async findBySlug(request: FastifyRequest<{ Params: { slug: string } }>, reply: FastifyReply) {
    const listing = await this.service.findBySlug(request.params.slug);
    if (!listing) {
      reply.code(404);
      return { error: { code: 'NOT_FOUND', message: 'Listing not found' } };
    }
    // Apply projection to format address, contact, and all display-ready fields
    const projected = toDetailsProjection(listing as any);
    return { data: projected };
  }

  /**
   * GET /api/listings/:id/availability - Get listing availability
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
   * POST /api/listings/:id/media - Upload media
   */
  @Post('/:id/media')
  async uploadMedia(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const body = request.body as any;
    const listing = await this.service.addMedia(request.params.id, body.url, body.type || 'image');
    reply.code(201);
    return { data: listing };
  }

  /**
   * DELETE /api/listings/:id/media/:mediaId - Delete media
   */
  @Delete('/:id/media/:mediaId')
  async deleteMedia(request: FastifyRequest<{ Params: { id: string; mediaId: string } }>, reply: FastifyReply) {
    await this.service.removeMedia(request.params.id, request.params.mediaId);
    return { success: true };
  }

  /**
   * GET /api/listings/:id/stats - Get listing statistics
   */
  @Get('/:id/stats')
  async getStats(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const stats = await this.service.getStats(request.params.id);
    return { data: stats };
  }
}

// Note: CategoriesController has been moved to the configuration module
// Import from '@/modules/configuration' for category management
// All categories, time modes, and pricing units are now database-driven

