/**
 * Case Handler Scope Controller
 * CRUD endpoints for managing case handler scopes (which rental objects a case handler can manage)
 *
 * Endpoints:
 * - GET    /api/case-handler-scopes          - List all scopes (with filtering)
 * - GET    /api/case-handler-scopes/:id      - Get a single scope
 * - POST   /api/case-handler-scopes          - Create a new scope
 * - PUT    /api/case-handler-scopes/:id      - Update a scope
 * - DELETE /api/case-handler-scopes/:id      - Deactivate a scope
 *
 * Scope Types:
 * - 'all': Handler has access to all rental objects in tenant (commune-wide)
 * - 'specific': Handler has access to specific rental objects only
 */
import { Controller, Get, Post, Put, Delete } from '../../core/decorators';
import { container } from '../../core/container';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { getCaseHandlerScopeService, type CaseHandlerScopeQueryParams, type CreateCaseHandlerScopeInput } from './case-handler-scope.service';
import { ForbiddenError, BadRequestError } from '../../core/errors/problem-details';
import { requireRole, type SystemRole } from '../../core/middleware/rbac.middleware';

/**
 * Extended request type with tenant and user context
 */
interface TenantRequest extends FastifyRequest {
  tenantId?: string | null;
  userId?: string | null;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
    tenantId: string;
    organizationId?: string | null;
  };
}

/**
 * Request body for creating a case handler scope
 */
interface CreateCaseHandlerScopeBody {
  userId: string;
  scopeType: 'all' | 'specific';
  rentalObjectId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Request body for updating a case handler scope
 */
interface UpdateCaseHandlerScopeBody {
  scopeType?: 'all' | 'specific';
  rentalObjectId?: string;
  status?: 'active' | 'inactive';
  metadata?: Record<string, unknown>;
}

@Controller('/api/case-handler-scopes')
export class CaseHandlerScopeController {
  /**
   * GET /api/case-handler-scopes
   * List all case handler scopes with optional filtering
   *
   * Query params:
   * - userId: Filter by user ID
   * - rentalObjectId: Filter by rental object ID
   * - scopeType: Filter by scope type (all, specific)
   * - status: Filter by status (active, inactive)
   * - page: Page number (default: 1)
   * - limit: Items per page (default: 20)
   *
   * Required role: admin or super_admin
   */
  @Get()
  async findAll(request: TenantRequest, reply: FastifyReply) {
    const service = getCaseHandlerScopeService();
    const tenantId = request.tenantId;

    if (!tenantId) {
      throw new ForbiddenError('Tenant context required');
    }

    const { userId, rentalObjectId, scopeType, status, page = 1, limit = 20 } = request.query as {
      userId?: string;
      rentalObjectId?: string;
      scopeType?: string;
      status?: string;
      page?: number;
      limit?: number;
    };

    const params: CaseHandlerScopeQueryParams = {
      tenantId,
      userId,
      rentalObjectId,
      scopeType,
      status,
      page: Number(page),
      limit: Number(limit),
    };

    const result = await service.findAll(params);

    return {
      data: result.data,
      meta: result.meta,
    };
  }

  /**
   * GET /api/case-handler-scopes/:id
   * Get a single case handler scope by ID
   *
   * Required role: admin or super_admin
   */
  @Get('/:id')
  async findById(request: TenantRequest, reply: FastifyReply) {
    const service = getCaseHandlerScopeService();
    const { id } = request.params as { id: string };

    const scope = await service.findById(id);

    if (!scope) {
      reply.code(404);
      return {
        type: '/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: `Case handler scope with ID ${id} not found`,
      };
    }

    return { data: scope };
  }

  /**
   * POST /api/case-handler-scopes
   * Create a new case handler scope
   *
   * Body:
   * - userId: Required - The user to grant scope to
   * - scopeType: Required - 'all' for tenant-wide, 'specific' for specific rental objects
   * - rentalObjectId: Required if scopeType is 'specific'
   * - metadata: Optional additional data
   *
   * Required role: admin or super_admin
   */
  @Post()
  async create(request: TenantRequest, reply: FastifyReply) {
    const service = getCaseHandlerScopeService();
    const tenantId = request.tenantId;
    const assignedBy = request.userId || (request.headers['x-user-id'] as string);

    if (!tenantId) {
      throw new ForbiddenError('Tenant context required');
    }

    const body = request.body as CreateCaseHandlerScopeBody;

    // Validate required fields
    if (!body.userId) {
      throw new BadRequestError('userId is required');
    }
    if (!body.scopeType) {
      throw new BadRequestError('scopeType is required (all or specific)');
    }
    if (body.scopeType !== 'all' && body.scopeType !== 'specific') {
      throw new BadRequestError('scopeType must be "all" or "specific"');
    }
    if (body.scopeType === 'specific' && !body.rentalObjectId) {
      throw new BadRequestError('rentalObjectId is required when scopeType is "specific"');
    }

    const input: CreateCaseHandlerScopeInput = {
      tenantId,
      userId: body.userId,
      scopeType: body.scopeType,
      rentalObjectId: body.scopeType === 'specific' ? body.rentalObjectId : undefined,
      assignedBy: assignedBy || undefined,
      metadata: body.metadata,
    };

    const scope = await service.create(input);

    reply.code(201);
    return { data: scope };
  }

  /**
   * PUT /api/case-handler-scopes/:id
   * Update a case handler scope
   *
   * Required role: admin or super_admin
   */
  @Put('/:id')
  async update(request: TenantRequest, reply: FastifyReply) {
    const service = getCaseHandlerScopeService();
    const { id } = request.params as { id: string };
    const body = request.body as UpdateCaseHandlerScopeBody;
    const updatedBy = request.userId || (request.headers['x-user-id'] as string);

    // Validate scopeType if provided
    if (body.scopeType && body.scopeType !== 'all' && body.scopeType !== 'specific') {
      throw new BadRequestError('scopeType must be "all" or "specific"');
    }
    if (body.scopeType === 'specific' && !body.rentalObjectId) {
      throw new BadRequestError('rentalObjectId is required when scopeType is "specific"');
    }

    const scope = await service.update(id, {
      ...body,
      updatedBy,
    });

    return { data: scope };
  }

  /**
   * DELETE /api/case-handler-scopes/:id
   * Deactivate a case handler scope (soft delete)
   *
   * Required role: admin or super_admin
   */
  @Delete('/:id')
  async deactivate(request: TenantRequest, reply: FastifyReply) {
    const service = getCaseHandlerScopeService();
    const { id } = request.params as { id: string };
    const deactivatedBy = request.userId || (request.headers['x-user-id'] as string);

    const scope = await service.deactivate(id, deactivatedBy || undefined);

    return { data: scope };
  }
}
