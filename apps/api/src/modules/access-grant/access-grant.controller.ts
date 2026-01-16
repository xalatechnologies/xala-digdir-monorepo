/**
 * Access Grant Controller
 * CRUD endpoints for commune admins to grant/revoke organization access to rental objects
 *
 * Endpoints:
 * - GET    /api/access-grants          - List all access grants (with filtering)
 * - GET    /api/access-grants/:id      - Get a single access grant
 * - POST   /api/access-grants          - Create a new access grant
 * - DELETE /api/access-grants/:id      - Revoke an access grant
 */
import { Controller, Get, Post, Delete } from '../../core/decorators';
import { container } from '../../core/container';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { getAccessGrantService, type AccessGrantQueryParams, type CreateAccessGrantInput } from './access-grant.service';
import { ForbiddenError, BadRequestError } from '../../core/errors/problem-details';
import { requireRole, requirePermission, type SystemRole } from '../../core/middleware/rbac.middleware';

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
 * Request body for creating an access grant
 * Supports both SDK naming (organizationId, expiresAt) and legacy naming (orgId, validUntil)
 */
interface CreateAccessGrantBody {
  // Organization ID - accepts both SDK and legacy naming
  organizationId?: string;
  orgId?: string;
  rentalObjectId: string;
  // Dates - accepts both SDK (expiresAt) and legacy naming (validFrom/validUntil)
  validFrom?: string;
  validUntil?: string;
  expiresAt?: string;
  // Additional data
  notes?: string;
  metadata?: Record<string, unknown>;
}

@Controller('/api/access-grants')
export class AccessGrantController {
  /**
   * GET /api/access-grants
   * List all access grants with optional filtering
   *
   * Query params:
   * - orgId: Filter by organization ID
   * - rentalObjectId: Filter by rental object ID
   * - status: Filter by status (active, revoked)
   * - page: Page number (default: 1)
   * - limit: Items per page (default: 20)
   *
   * Required permission: access-grants:read
   */
  @Get()
  async findAll(request: TenantRequest, reply: FastifyReply) {
    const service = getAccessGrantService();
    const tenantId = request.tenantId;

    if (!tenantId) {
      throw new ForbiddenError('Tenant context required');
    }

    const { orgId, rentalObjectId, status, page = 1, limit = 20 } = request.query as {
      orgId?: string;
      rentalObjectId?: string;
      status?: string;
      page?: number;
      limit?: number;
    };

    const params: AccessGrantQueryParams = {
      tenantId,
      orgId,
      rentalObjectId,
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
   * GET /api/access-grants/:id
   * Get a single access grant by ID
   *
   * Required permission: access-grants:read
   */
  @Get('/:id')
  async findOne(request: TenantRequest, reply: FastifyReply) {
    const service = getAccessGrantService();
    const { id } = request.params as { id: string };

    const grant = await service.findById(id);

    // Ensure tenant isolation
    if (request.tenantId && grant.tenantId !== request.tenantId) {
      throw new ForbiddenError('Access denied to this resource');
    }

    return { data: grant };
  }

  /**
   * POST /api/access-grants
   * Create a new access grant (commune admin grants org access to rental object)
   *
   * Request body:
   * - orgId: Organization ID (required)
   * - rentalObjectId: Rental object ID (required)
   * - validFrom: Start date of validity (optional)
   * - validUntil: End date of validity (optional)
   * - metadata: Additional metadata (optional)
   *
   * Required role: admin
   */
  @Post()
  async create(request: TenantRequest, reply: FastifyReply) {
    const service = getAccessGrantService();
    const tenantId = request.tenantId;
    const userId = request.userId || request.user?.id;

    if (!tenantId) {
      throw new ForbiddenError('Tenant context required');
    }

    if (!userId) {
      throw new ForbiddenError('User context required');
    }

    const body = request.body as CreateAccessGrantBody;

    // Support both SDK naming (organizationId) and legacy naming (orgId)
    const organizationId = body.organizationId || body.orgId;

    // Validate required fields
    if (!organizationId) {
      throw new BadRequestError('organizationId or orgId is required');
    }

    if (!body.rentalObjectId) {
      throw new BadRequestError('rentalObjectId is required');
    }

    // Support both SDK naming (expiresAt) and legacy naming (validUntil)
    const expiresAt = body.expiresAt || body.validUntil;

    // Build metadata with notes if provided
    const metadata = body.metadata || {};
    if (body.notes) {
      metadata.notes = body.notes;
    }

    const input: CreateAccessGrantInput = {
      tenantId,
      orgId: organizationId,
      rentalObjectId: body.rentalObjectId,
      grantedBy: userId,
      validFrom: body.validFrom ? new Date(body.validFrom) : undefined,
      validUntil: expiresAt ? new Date(expiresAt) : undefined,
      metadata,
    };

    const grant = await service.create(input);

    reply.code(201);
    return { data: grant };
  }

  /**
   * DELETE /api/access-grants/:id
   * Revoke an access grant (soft delete - sets status to 'revoked')
   *
   * Required role: admin
   */
  @Delete('/:id')
  async revoke(request: TenantRequest, reply: FastifyReply) {
    const service = getAccessGrantService();
    const { id } = request.params as { id: string };
    const userId = request.userId || request.user?.id;

    if (!userId) {
      throw new ForbiddenError('User context required');
    }

    // Verify tenant isolation before revocation
    const existing = await service.findById(id);
    if (request.tenantId && existing.tenantId !== request.tenantId) {
      throw new ForbiddenError('Access denied to this resource');
    }

    const revokedGrant = await service.revoke(id, userId);

    return { data: revokedGrant };
  }
}

/**
 * Export RBAC preHandlers for route protection
 * These can be used in the Fastify route registration
 */
export const accessGrantPreHandlers = {
  read: requirePermission('access-grants', 'read'),
  create: requireRole(['admin', 'super_admin'] as SystemRole[]),
  delete: requireRole(['admin', 'super_admin'] as SystemRole[]),
};
