/**
 * Tenant Controller
 * REST API endpoints for tenant management
 */
import { Controller, Get, Post, Put, Delete } from '../../core/decorators';
import { Inject } from '../../core/decorators';
import { TenantService } from './tenant.service';
import { validate } from '../../core/validation/zod-pipe';
import {
  CreateTenantSchema,
  UpdateTenantSchema,
  TenantQuerySchema,
} from '../../schemas/tenant.schema';
import type { FastifyRequest, FastifyReply } from 'fastify';

@Controller('/api/tenants')
export class TenantController {
  constructor(
    @Inject('TenantService') private readonly service: TenantService
  ) {}

  /**
   * GET /api/tenants - List all tenants
   */
  @Get()
  async findAll(request: FastifyRequest, reply: FastifyReply) {
    const params = validate(TenantQuerySchema, request.query);
    const result = await this.service.findAll({ ...params, page: params.page ?? 1, limit: params.limit ?? 20 });
    return result;
  }

  /**
   * GET /api/tenants/:id - Get tenant by ID
   */
  @Get('/:id')
  async findById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const tenant = await this.service.findByIdOrFail(request.params.id);
    return { tenant };
  }

  /**
   * GET /api/tenants/slug/:slug - Get tenant by slug
   */
  @Get('/slug/:slug')
  async findBySlug(request: FastifyRequest<{ Params: { slug: string } }>, reply: FastifyReply) {
    const tenant = await this.service.findBySlug(request.params.slug);
    if (!tenant) {
      return reply.status(404).send({ error: 'Tenant not found' });
    }
    return { tenant };
  }

  /**
   * POST /api/tenants - Create new tenant
   */
  @Post()
  async create(request: FastifyRequest, reply: FastifyReply) {
    const data = validate(CreateTenantSchema, request.body);
    const result = await this.service.create({ ...data, plan: data.plan ?? 'free' } as any);
    return reply.status(201).send(result);
  }

  /**
   * PUT /api/tenants/:id - Update tenant
   */
  @Put('/:id')
  async update(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const data = validate(UpdateTenantSchema, request.body);
    const tenant = await this.service.update(request.params.id, data as any);
    return { tenant };
  }

  /**
   * DELETE /api/tenants/:id - Delete tenant
   */
  @Delete('/:id')
  async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    await this.service.delete(request.params.id);
    return { success: true };
  }
}
