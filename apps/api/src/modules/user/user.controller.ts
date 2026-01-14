/**
 * User Controller
 * REST API endpoints for user management
 */
import { Controller, Get, Post, Put, Delete } from '../../core/decorators';
import { Inject } from '../../core/decorators';
import { UserService } from './user.service';
import { validate } from '../../core/validation/zod-pipe';
import { getTenantId, TenantRequest } from '../../core/validation/tenant';
import {
  CreateUserSchema,
  UpdateUserSchema,
  UserQuerySchema,
  InviteUserSchema,
  AssignRoleSchema,
} from '../../schemas/user.schema';
import type { FastifyRequest, FastifyReply } from 'fastify';

@Controller('/api/users')
export class UserController {
  constructor(
    @Inject('UserService') private readonly service: UserService
  ) {}

  /**
   * GET /api/users - List all users
   */
  @Get()
  async findAll(request: TenantRequest, reply: FastifyReply) {
    const tenantId = getTenantId(request);
    const params = validate(UserQuerySchema, request.query);
    const result = await this.service.findAll(tenantId, { ...params, page: params.page ?? 1, limit: params.limit ?? 20 });
    // Transform to meta format
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
   * GET /api/users/me - Get current user
   */
  @Get('/me')
  async getCurrentUser(request: TenantRequest, reply: FastifyReply) {
    const userId = (request as any).userId || request.headers['x-user-id'];
    if (!userId) {
      reply.code(401);
      return { error: 'Not authenticated' };
    }
    const user = await this.service.findByIdOrFail(userId as string);
    return { data: user };
  }

  /**
   * GET /api/users/me/consents - Get current user's consents
   */
  @Get('/me/consents')
  async getConsents(request: TenantRequest, reply: FastifyReply) {
    // Mock consents data - in production would fetch from consent management system
    return {
      data: {
        marketing: false,
        analytics: true,
        necessary: true,
        preferences: {
          emailNotifications: true,
          smsNotifications: false,
          pushNotifications: true,
        },
        updatedAt: new Date().toISOString(),
        version: '1.0',
      },
    };
  }

  /**
   * GET /api/users/:id - Get user by ID
   */
  @Get('/:id')
  async findById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const user = await this.service.findByIdOrFail(request.params.id);
    return { data: user };
  }

  /**
   * POST /api/users - Create new user
   */
  @Post()
  async create(request: TenantRequest, reply: FastifyReply) {
    const tenantId = getTenantId(request);
    const data = validate(CreateUserSchema, request.body);
    const user = await this.service.create(tenantId, data as any);
    return reply.status(201).send({ user });
  }

  /**
   * POST /api/users/invite - Invite user via email
   */
  @Post('/invite')
  async invite(request: TenantRequest, reply: FastifyReply) {
    const tenantId = getTenantId(request);
    const data = validate(InviteUserSchema, request.body);
    const result = await this.service.invite(tenantId, data as any);
    return reply.status(201).send(result);
  }

  /**
   * PUT /api/users/:id - Update user
   */
  @Put('/:id')
  async update(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const data = validate(UpdateUserSchema, request.body);
    const user = await this.service.update(request.params.id, data as any);
    return { user };
  }

  /**
   * PUT /api/users/:id/role - Assign role to user
   */
  @Put('/:id/role')
  async assignRole(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const data = validate(AssignRoleSchema, request.body);
    const user = await this.service.assignRole(request.params.id, data);
    return { user };
  }

  /**
   * PUT /api/users/:id/deactivate - Deactivate user
   */
  @Put('/:id/deactivate')
  async deactivate(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const user = await this.service.deactivate(request.params.id);
    return { data: user };
  }

  /**
   * PUT /api/users/:id/reactivate - Reactivate user
   */
  @Put('/:id/reactivate')
  async reactivate(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const user = await this.service.update(request.params.id, { status: 'active' });
    return { data: user };
  }

  /**
   * DELETE /api/users/:id - Delete user
   */
  @Delete('/:id')
  async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    await this.service.delete(request.params.id);
    return { success: true };
  }
}
