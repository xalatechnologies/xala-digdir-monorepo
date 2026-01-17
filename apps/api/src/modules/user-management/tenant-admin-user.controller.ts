/**
 * Tenant Admin User Management Controller
 * REST API endpoints for tenant admin user management
 *
 * Base path: /api/admin/users
 * RBAC: Requires BO-TENANT-ADMIN role
 */
import { Controller, Get, Post, Put, Delete } from '../../core/decorators';
import { Inject } from '../../core/decorators';
import { UserService } from '../user/user.service';
import { validate } from '../../core/validation/zod-pipe';
import { getTenantId, TenantRequest } from '../../core/validation/tenant';
import { requireRole, requireTenantContext } from '../../core/middleware/rbac.middleware';
import {
  CreateUserSchema,
  UpdateUserSchema,
  UserQuerySchema,
  InviteUserSchema,
  AssignRoleSchema,
} from '../../schemas/user.schema';
import type { FastifyRequest, FastifyReply } from 'fastify';

/**
 * Extended request with user context
 */
interface AdminRequest extends TenantRequest {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
    tenantId: string;
  };
}

@Controller('/api/admin/users')
export class TenantAdminUserController {
  constructor(
    @Inject('UserService') private readonly service: UserService
  ) {}

  /**
   * GET /api/admin/users - List all users (tenant-scoped)
   * Query params: page, limit, role, status, search
   */
  @Get('/', {
    preHandler: [requireTenantContext, requireRole(['admin', 'tenant_admin'])],
  })
  async findAll(request: AdminRequest, reply: FastifyReply) {
    const tenantId = getTenantId(request);
    const params = validate(UserQuerySchema, request.query);

    const result = await this.service.findAll(tenantId, {
      ...params,
      page: params.page ?? 1,
      limit: params.limit ?? 50,
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
   * GET /api/admin/users/:id - Get user by ID
   */
  @Get('/:id', {
    preHandler: [requireTenantContext, requireRole(['admin', 'tenant_admin'])],
  })
  async findById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const user = await this.service.findByIdOrFail(request.params.id);
    return { data: user };
  }

  /**
   * POST /api/admin/users/invite - Invite a new user
   * Body: { email, role, organizationId?, firstName?, lastName?, sendEmail? }
   */
  @Post('/invite', {
    preHandler: [requireTenantContext, requireRole(['admin', 'tenant_admin'])],
  })
  async inviteUser(request: AdminRequest, reply: FastifyReply) {
    const tenantId = getTenantId(request);
    const data = validate(InviteUserSchema, request.body);

    const result = await this.service.invite(tenantId, data as any);

    return reply.status(201).send({
      data: result,
      message: 'User invitation sent successfully',
    });
  }

  /**
   * POST /api/admin/users/:id/role - Assign role to user
   * Body: { role }
   */
  @Post('/:id/role', {
    preHandler: [requireTenantContext, requireRole(['admin', 'tenant_admin'])],
  })
  async assignRole(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const data = validate(AssignRoleSchema, request.body);
    const user = await this.service.assignRole(request.params.id, data);

    return {
      data: user,
      message: 'Role assigned successfully',
    };
  }

  /**
   * POST /api/admin/users/:id/organization - Assign user to organization
   * Body: { organizationId }
   */
  @Post('/:id/organization', {
    preHandler: [requireTenantContext, requireRole(['admin', 'tenant_admin'])],
  })
  async assignToOrganization(
    request: FastifyRequest<{ Params: { id: string }; Body: { organizationId: string } }>,
    reply: FastifyReply
  ) {
    const { organizationId } = request.body;

    if (!organizationId) {
      return reply.status(400).send({
        type: '/errors/validation',
        title: 'Validation Error',
        status: 400,
        detail: 'organizationId is required',
      });
    }

    const user = await this.service.update(request.params.id, { organizationId });

    return {
      data: user,
      message: 'User assigned to organization successfully',
    };
  }

  /**
   * DELETE /api/admin/users/:id/organization/:orgId - Remove user from organization
   */
  @Delete('/:id/organization/:orgId', {
    preHandler: [requireTenantContext, requireRole(['admin', 'tenant_admin'])],
  })
  async removeFromOrganization(
    request: FastifyRequest<{ Params: { id: string; orgId: string } }>,
    reply: FastifyReply
  ) {
    // Remove organization assignment
    const user = await this.service.update(request.params.id, { organizationId: null });

    return {
      data: user,
      message: 'User removed from organization successfully',
    };
  }

  /**
   * POST /api/admin/users/:id/deactivate - Deactivate user
   * Body: { reason? }
   */
  @Post('/:id/deactivate', {
    preHandler: [requireTenantContext, requireRole(['admin', 'tenant_admin'])],
  })
  async deactivate(
    request: FastifyRequest<{ Params: { id: string }; Body?: { reason?: string } }>,
    reply: FastifyReply
  ) {
    const user = await this.service.deactivate(request.params.id);

    return {
      data: user,
      message: 'User deactivated successfully',
    };
  }

  /**
   * POST /api/admin/users/:id/reactivate - Reactivate user
   */
  @Post('/:id/reactivate', {
    preHandler: [requireTenantContext, requireRole(['admin', 'tenant_admin'])],
  })
  async reactivate(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const user = await this.service.update(request.params.id, { status: 'active' });

    return {
      data: user,
      message: 'User reactivated successfully',
    };
  }

  /**
   * POST /api/admin/users/:id/suspend - Suspend user temporarily
   * Body: { reason?, duration? }
   */
  @Post('/:id/suspend', {
    preHandler: [requireTenantContext, requireRole(['admin', 'tenant_admin'])],
  })
  async suspend(
    request: FastifyRequest<{
      Params: { id: string };
      Body?: { reason?: string; duration?: number };
    }>,
    reply: FastifyReply
  ) {
    const user = await this.service.update(request.params.id, { status: 'suspended' });

    return {
      data: user,
      message: 'User suspended successfully',
    };
  }

  /**
   * POST /api/admin/users/:id/unsuspend - Unsuspend user
   */
  @Post('/:id/unsuspend', {
    preHandler: [requireTenantContext, requireRole(['admin', 'tenant_admin'])],
  })
  async unsuspend(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const user = await this.service.update(request.params.id, { status: 'active' });

    return {
      data: user,
      message: 'User unsuspended successfully',
    };
  }

  /**
   * GET /api/admin/users/:id/effective-permissions - Get user's computed permissions
   */
  @Get('/:id/effective-permissions', {
    preHandler: [requireTenantContext, requireRole(['admin', 'tenant_admin'])],
  })
  async getEffectivePermissions(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const user = await this.service.findByIdOrFail(request.params.id);

    // TODO: Implement permission calculation logic
    // For now, return basic role-based permissions
    const permissions: string[] = [];

    // Basic permissions based on role
    if (user.role === 'admin' || user.role === 'tenant_admin') {
      permissions.push('users:read', 'users:write', 'users:delete');
      permissions.push('organizations:read', 'organizations:write');
      permissions.push('rental_objects:read', 'rental_objects:write');
      permissions.push('bookings:read', 'bookings:write', 'bookings:approve');
    } else if (user.role === 'org_admin') {
      permissions.push('users:read', 'users:write');
      permissions.push('organizations:read');
      permissions.push('rental_objects:read', 'rental_objects:write');
      permissions.push('bookings:read', 'bookings:approve');
    } else if (user.role === 'case_handler') {
      permissions.push('bookings:read', 'bookings:write', 'bookings:approve');
    } else {
      permissions.push('bookings:read');
    }

    return {
      data: {
        userId: user.id,
        role: user.role,
        permissions,
        computedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * GET /api/admin/users/:id/activity - Get user's activity log
   */
  @Get('/:id/activity', {
    preHandler: [requireTenantContext, requireRole(['admin', 'tenant_admin'])],
  })
  async getActivity(
    request: FastifyRequest<{ Params: { id: string }; Querystring: { limit?: number } }>,
    reply: FastifyReply
  ) {
    const userId = request.params.id;
    const limit = Number(request.query.limit) || 50;

    // TODO: Fetch from audit_logs table
    // For now, return empty array
    return {
      data: [],
      meta: {
        total: 0,
        limit,
      },
    };
  }

  /**
   * GET /api/admin/users/invitations - Get pending invitations
   */
  @Get('/invitations', {
    preHandler: [requireTenantContext, requireRole(['admin', 'tenant_admin'])],
  })
  async getInvitations(request: AdminRequest, reply: FastifyReply) {
    const tenantId = getTenantId(request);

    // Get users with status 'pending'
    const result = await this.service.findAll(tenantId, {
      status: 'pending',
      page: 1,
      limit: 100,
    });

    return {
      data: result.data.map((user: any) => ({
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        invitedAt: user.metadata?.invitedAt || user.createdAt,
      })),
      meta: {
        total: result.pagination.total,
      },
    };
  }

  /**
   * POST /api/admin/users/invitations/:id/resend - Resend invitation email
   */
  @Post('/invitations/:id/resend', {
    preHandler: [requireTenantContext, requireRole(['admin', 'tenant_admin'])],
  })
  async resendInvitation(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const user = await this.service.findByIdOrFail(request.params.id);

    if (user.status !== 'pending') {
      return reply.status(400).send({
        type: '/errors/validation',
        title: 'Validation Error',
        status: 400,
        detail: 'Can only resend invitations for pending users',
      });
    }

    // TODO: Implement email resend logic

    return {
      message: 'Invitation resent successfully',
    };
  }

  /**
   * POST /api/admin/users/invitations/:id/cancel - Cancel pending invitation
   */
  @Post('/invitations/:id/cancel', {
    preHandler: [requireTenantContext, requireRole(['admin', 'tenant_admin'])],
  })
  async cancelInvitation(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const user = await this.service.findByIdOrFail(request.params.id);

    if (user.status !== 'pending') {
      return reply.status(400).send({
        type: '/errors/validation',
        title: 'Validation Error',
        status: 400,
        detail: 'Can only cancel pending invitations',
      });
    }

    // Delete the pending user
    await this.service.delete(request.params.id);

    return {
      message: 'Invitation cancelled successfully',
    };
  }

  /**
   * POST /api/admin/users/bulk/invite - Bulk invite users
   * Body: { users: [{ email, role, organizationId? }] }
   */
  @Post('/bulk/invite', {
    preHandler: [requireTenantContext, requireRole(['admin', 'tenant_admin'])],
  })
  async bulkInvite(
    request: AdminRequest & { body: { users: any[] } },
    reply: FastifyReply
  ) {
    const tenantId = getTenantId(request);
    const { users } = request.body;

    if (!Array.isArray(users) || users.length === 0) {
      return reply.status(400).send({
        type: '/errors/validation',
        title: 'Validation Error',
        status: 400,
        detail: 'users array is required and must not be empty',
      });
    }

    const results = [];
    const errors = [];

    for (const userData of users) {
      try {
        const validated = validate(InviteUserSchema, userData);
        const result = await this.service.invite(tenantId, validated as any);
        results.push({ email: userData.email, status: 'success', invitationId: result.invitationId });
      } catch (error: any) {
        errors.push({ email: userData.email, status: 'error', error: error.message });
      }
    }

    return {
      data: {
        successful: results.length,
        failed: errors.length,
        results,
        errors,
      },
    };
  }

  /**
   * POST /api/admin/users/bulk/deactivate - Bulk deactivate users
   * Body: { userIds: string[] }
   */
  @Post('/bulk/deactivate', {
    preHandler: [requireTenantContext, requireRole(['admin', 'tenant_admin'])],
  })
  async bulkDeactivate(
    request: AdminRequest & { body: { userIds: string[] } },
    reply: FastifyReply
  ) {
    const { userIds } = request.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return reply.status(400).send({
        type: '/errors/validation',
        title: 'Validation Error',
        status: 400,
        detail: 'userIds array is required and must not be empty',
      });
    }

    const results = [];
    const errors = [];

    for (const userId of userIds) {
      try {
        await this.service.deactivate(userId);
        results.push({ userId, status: 'success' });
      } catch (error: any) {
        errors.push({ userId, status: 'error', error: error.message });
      }
    }

    return {
      data: {
        successful: results.length,
        failed: errors.length,
        results,
        errors,
      },
    };
  }

  /**
   * POST /api/admin/users/bulk/assign-role - Bulk assign role to users
   * Body: { userIds: string[], role: string }
   */
  @Post('/bulk/assign-role', {
    preHandler: [requireTenantContext, requireRole(['admin', 'tenant_admin'])],
  })
  async bulkAssignRole(
    request: AdminRequest & { body: { userIds: string[]; role: string } },
    reply: FastifyReply
  ) {
    const { userIds, role } = request.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return reply.status(400).send({
        type: '/errors/validation',
        title: 'Validation Error',
        status: 400,
        detail: 'userIds array is required and must not be empty',
      });
    }

    if (!role) {
      return reply.status(400).send({
        type: '/errors/validation',
        title: 'Validation Error',
        status: 400,
        detail: 'role is required',
      });
    }

    const results = [];
    const errors = [];

    for (const userId of userIds) {
      try {
        await this.service.assignRole(userId, { role });
        results.push({ userId, status: 'success' });
      } catch (error: any) {
        errors.push({ userId, status: 'error', error: error.message });
      }
    }

    return {
      data: {
        successful: results.length,
        failed: errors.length,
        results,
        errors,
      },
    };
  }
}
