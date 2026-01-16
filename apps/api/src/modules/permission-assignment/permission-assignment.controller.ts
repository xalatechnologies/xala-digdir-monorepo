/**
 * Permission Assignment Controller
 * CRUD endpoints for org admins to manage per-rental-object permissions for members
 *
 * Endpoints:
 * - GET    /api/permission-assignments                                    - List all permission assignments (with filtering)
 * - GET    /api/permission-assignments/:id                                - Get a single permission assignment
 * - POST   /api/permission-assignments                                    - Create a new permission assignment
 * - PUT    /api/permission-assignments/:id                                - Update a permission assignment
 * - PUT    /api/organizations/:orgId/rental-objects/:roId/permissions/:userId - Upsert permissions by org/user/ro
 * - DELETE /api/permission-assignments/:id                                - Revoke a permission assignment
 */
import { Controller, Get, Post, Put, Delete } from '../../core/decorators';
import { container } from '../../core/container';
import type { FastifyRequest, FastifyReply } from 'fastify';
import {
  getPermissionAssignmentService,
  type PermissionAssignmentQueryParams,
  type CreatePermissionAssignmentInput,
  type UpdatePermissionAssignmentInput,
  type RentalObjectPermission,
  RENTAL_OBJECT_PERMISSIONS,
} from './permission-assignment.service';
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
 * Request body for creating a permission assignment
 */
interface CreatePermissionAssignmentBody {
  orgId: string;
  userId: string;
  rentalObjectId: string;
  permissions: RentalObjectPermission[];
  metadata?: Record<string, unknown>;
}

/**
 * Request body for updating a permission assignment
 */
interface UpdatePermissionAssignmentBody {
  permissions: RentalObjectPermission[];
  metadata?: Record<string, unknown>;
}

@Controller('/api/permission-assignments')
export class PermissionAssignmentController {
  /**
   * GET /api/permission-assignments
   * List all permission assignments with optional filtering
   *
   * Query params:
   * - orgId: Filter by organization ID
   * - userId: Filter by user ID
   * - rentalObjectId: Filter by rental object ID
   * - status: Filter by status (active, revoked)
   * - page: Page number (default: 1)
   * - limit: Items per page (default: 20)
   *
   * Required permission: permission-assignments:read
   */
  @Get()
  async findAll(request: TenantRequest, reply: FastifyReply) {
    const service = getPermissionAssignmentService();

    const { orgId, userId, rentalObjectId, status, page = 1, limit = 20 } = request.query as {
      orgId?: string;
      userId?: string;
      rentalObjectId?: string;
      status?: string;
      page?: number;
      limit?: number;
    };

    const params: PermissionAssignmentQueryParams = {
      orgId,
      userId,
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
   * GET /api/permission-assignments/:id
   * Get a single permission assignment by ID
   *
   * Required permission: permission-assignments:read
   */
  @Get('/:id')
  async findOne(request: TenantRequest, reply: FastifyReply) {
    const service = getPermissionAssignmentService();
    const { id } = request.params as { id: string };

    const assignment = await service.findById(id);

    return { data: assignment };
  }

  /**
   * POST /api/permission-assignments
   * Create a new permission assignment (org admin assigns permissions to member for rental object)
   *
   * Request body:
   * - orgId: Organization ID (required)
   * - userId: User ID to assign permissions to (required)
   * - rentalObjectId: Rental object ID (required)
   * - permissions: Array of permissions to assign (required)
   * - metadata: Additional metadata (optional)
   *
   * Required role: admin or org admin
   */
  @Post()
  async create(request: TenantRequest, reply: FastifyReply) {
    const service = getPermissionAssignmentService();
    const assignedBy = request.userId || request.user?.id;

    if (!assignedBy) {
      throw new ForbiddenError('User context required');
    }

    const body = request.body as CreatePermissionAssignmentBody;

    // Validate required fields
    if (!body.orgId) {
      throw new BadRequestError('orgId is required');
    }

    if (!body.userId) {
      throw new BadRequestError('userId is required');
    }

    if (!body.rentalObjectId) {
      throw new BadRequestError('rentalObjectId is required');
    }

    if (!body.permissions || !Array.isArray(body.permissions) || body.permissions.length === 0) {
      throw new BadRequestError('permissions array is required and must not be empty');
    }

    const input: CreatePermissionAssignmentInput = {
      orgId: body.orgId,
      userId: body.userId,
      rentalObjectId: body.rentalObjectId,
      permissions: body.permissions,
      assignedBy,
      metadata: body.metadata,
    };

    const assignment = await service.create(input);

    reply.code(201);
    return { data: assignment };
  }

  /**
   * PUT /api/permission-assignments/:id
   * Update an existing permission assignment
   *
   * Request body:
   * - permissions: Array of permissions to assign (required)
   * - metadata: Additional metadata (optional)
   *
   * Required role: admin or org admin
   */
  @Put('/:id')
  async update(request: TenantRequest, reply: FastifyReply) {
    const service = getPermissionAssignmentService();
    const { id } = request.params as { id: string };
    const updatedBy = request.userId || request.user?.id;

    if (!updatedBy) {
      throw new ForbiddenError('User context required');
    }

    const body = request.body as UpdatePermissionAssignmentBody;

    if (!body.permissions || !Array.isArray(body.permissions)) {
      throw new BadRequestError('permissions array is required');
    }

    const input: UpdatePermissionAssignmentInput = {
      permissions: body.permissions,
      updatedBy,
      metadata: body.metadata,
    };

    const assignment = await service.update(id, input);

    return { data: assignment };
  }

  /**
   * DELETE /api/permission-assignments/:id
   * Revoke a permission assignment (soft delete - sets status to 'revoked')
   *
   * Required role: admin or org admin
   */
  @Delete('/:id')
  async revoke(request: TenantRequest, reply: FastifyReply) {
    const service = getPermissionAssignmentService();
    const { id } = request.params as { id: string };
    const revokedBy = request.userId || request.user?.id;

    if (!revokedBy) {
      throw new ForbiddenError('User context required');
    }

    const revokedAssignment = await service.revoke(id, revokedBy);

    return { data: revokedAssignment };
  }
}

/**
 * Organization Permissions Controller
 * Alternative endpoints scoped to organization context
 *
 * Endpoints:
 * - GET  /api/organizations/:orgId/permissions                           - List org's permission assignments
 * - GET  /api/organizations/:orgId/rental-objects/:roId/permissions      - List permissions for rental object
 * - PUT  /api/organizations/:orgId/rental-objects/:roId/permissions/:userId - Upsert user permissions
 * - DELETE /api/organizations/:orgId/rental-objects/:roId/permissions/:userId - Revoke user permissions
 */
@Controller('/api/organizations/:orgId/rental-objects/:roId/permissions')
export class OrganizationPermissionsController {
  /**
   * GET /api/organizations/:orgId/rental-objects/:roId/permissions
   * List all permission assignments for a specific rental object within an organization
   */
  @Get()
  async findByRentalObject(request: TenantRequest, reply: FastifyReply) {
    const service = getPermissionAssignmentService();
    const { orgId, roId } = request.params as { orgId: string; roId: string };
    const { status, page = 1, limit = 20 } = request.query as {
      status?: string;
      page?: number;
      limit?: number;
    };

    const params: PermissionAssignmentQueryParams = {
      orgId,
      rentalObjectId: roId,
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
   * GET /api/organizations/:orgId/rental-objects/:roId/permissions/:userId
   * Get a specific user's permissions for a rental object
   */
  @Get('/:userId')
  async findByUser(request: TenantRequest, reply: FastifyReply) {
    const service = getPermissionAssignmentService();
    const { orgId, roId, userId } = request.params as { orgId: string; roId: string; userId: string };

    const assignment = await service.findByOrgUserRentalObject(orgId, userId, roId);

    if (!assignment) {
      return { data: null, permissions: [] };
    }

    return { data: assignment };
  }

  /**
   * PUT /api/organizations/:orgId/rental-objects/:roId/permissions/:userId
   * Upsert (create or update) a user's permissions for a rental object
   *
   * Request body:
   * - permissions: Array of permissions to assign (required)
   * - metadata: Additional metadata (optional)
   */
  @Put('/:userId')
  async upsert(request: TenantRequest, reply: FastifyReply) {
    const service = getPermissionAssignmentService();
    const { orgId, roId, userId } = request.params as { orgId: string; roId: string; userId: string };
    const assignedBy = request.userId || request.user?.id;

    if (!assignedBy) {
      throw new ForbiddenError('User context required');
    }

    const body = request.body as UpdatePermissionAssignmentBody;

    if (!body.permissions || !Array.isArray(body.permissions)) {
      throw new BadRequestError('permissions array is required');
    }

    const input: CreatePermissionAssignmentInput = {
      orgId,
      userId,
      rentalObjectId: roId,
      permissions: body.permissions,
      assignedBy,
      metadata: body.metadata,
    };

    const assignment = await service.upsert(input);

    return { data: assignment };
  }

  /**
   * DELETE /api/organizations/:orgId/rental-objects/:roId/permissions/:userId
   * Revoke a user's permissions for a rental object
   */
  @Delete('/:userId')
  async revokeByUser(request: TenantRequest, reply: FastifyReply) {
    const service = getPermissionAssignmentService();
    const { orgId, roId, userId } = request.params as { orgId: string; roId: string; userId: string };
    const revokedBy = request.userId || request.user?.id;

    if (!revokedBy) {
      throw new ForbiddenError('User context required');
    }

    const existing = await service.findByOrgUserRentalObject(orgId, userId, roId);

    if (!existing) {
      reply.code(404);
      return { error: 'Permission assignment not found' };
    }

    const revokedAssignment = await service.revoke(existing.id, revokedBy);

    return { data: revokedAssignment };
  }
}

/**
 * Available permissions endpoint for discovery
 */
@Controller('/api/permission-assignments/available-permissions')
export class AvailablePermissionsController {
  /**
   * GET /api/permission-assignments/available-permissions
   * Get list of available permissions that can be assigned
   */
  @Get()
  async getAvailablePermissions(request: TenantRequest, reply: FastifyReply) {
    return {
      data: {
        permissions: RENTAL_OBJECT_PERMISSIONS,
        descriptions: {
          RO_VIEW: 'View rental object details and availability',
          RO_BOOK: 'Create bookings on this rental object',
          RO_BOOK_EDIT: 'Edit existing bookings on this rental object',
          RO_BOOK_CANCEL: 'Cancel bookings on this rental object',
          RO_ASSIGN_CASE_HANDLERS: 'Assign case handlers to this rental object (org admin only)',
          RO_ASSIGN_PERMISSIONS: 'Assign permissions to members for this rental object (org admin only)',
          RO_MANAGE_MEMBERS: 'Manage organization members (org admin only)',
        },
      },
    };
  }
}

/**
 * Export RBAC preHandlers for route protection
 * These can be used in the Fastify route registration
 */
export const permissionAssignmentPreHandlers = {
  read: requirePermission('permission-assignments', 'read'),
  create: requireRole(['admin', 'super_admin'] as SystemRole[]),
  update: requireRole(['admin', 'super_admin'] as SystemRole[]),
  delete: requireRole(['admin', 'super_admin'] as SystemRole[]),
};
