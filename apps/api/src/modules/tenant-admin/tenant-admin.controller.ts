/**
 * Tenant Admin Controller
 * REST API endpoints for tenant-scoped administration
 *
 * All endpoints require Tenant-level roles (TENANT_ADMIN, TENANT_BILLING_ADMIN, TENANT_TECH_ADMIN)
 * and are scoped to the authenticated user's tenant.
 */
import { Controller, Get, Put } from '../../core/decorators';
import { Inject } from '../../core/decorators';
import {
  TenantAdminService,
  UpdateBrandingSchema,
  IntegrationConfigSchema,
} from './tenant-admin.service';
import { validate } from '../../core/validation/zod-pipe';
import {
  ForbiddenError,
  BadRequestError,
  UnauthorizedError,
} from '../../core/errors/problem-details';
import { isTenantRole, hasPermission } from '../auth/rbac';
import type { FastifyRequest, FastifyReply } from 'fastify';

/**
 * User context attached to authenticated requests
 */
interface UserContext {
  id: string;
  role: string;
  tenantId?: string;
}

/**
 * Extract user from request with proper type narrowing
 * Returns 401 Unauthorized if no user is present (authentication required)
 */
function getAuthenticatedUser(request: FastifyRequest): UserContext {
  const user = (request as FastifyRequest & { user?: UserContext }).user;
  if (!user) {
    throw new UnauthorizedError('Authentication required');
  }
  return user;
}

/**
 * Verify that the request user has a Tenant-level role
 */
function verifyTenantAccess(request: FastifyRequest): UserContext {
  const user = getAuthenticatedUser(request);
  if (!isTenantRole(user.role)) {
    throw new ForbiddenError('This endpoint is only available to Tenant administrators');
  }
  if (!user.tenantId) {
    throw new ForbiddenError('Tenant context is required');
  }
  return user;
}

/**
 * Verify that the request user has a specific permission
 */
function verifyPermission(request: FastifyRequest, permission: string): UserContext {
  const user = verifyTenantAccess(request);
  if (!hasPermission(user.role, permission as `${string}:${string}`)) {
    throw new ForbiddenError(`Missing required permission: ${permission}`);
  }
  return user;
}

@Controller('/api/tenant')
export class TenantAdminController {
  constructor(
    @Inject('TenantAdminService') private readonly service: TenantAdminService
  ) {}

  // ==========================================================================
  // Capability Endpoints
  // ==========================================================================

  /**
   * GET /api/tenant/me/capabilities - Get current tenant admin capabilities
   */
  @Get('/me/capabilities')
  async getCapabilities(request: FastifyRequest, reply: FastifyReply) {
    const user = verifyTenantAccess(request);
    const capabilities = await this.service.getCapabilities(
      user.id,
      user.role,
      user.tenantId!
    );
    return { capabilities };
  }

  // ==========================================================================
  // Subscription Endpoints
  // ==========================================================================

  /**
   * GET /api/tenant/me/subscription - Get current tenant subscription
   */
  @Get('/me/subscription')
  async getSubscription(request: FastifyRequest, reply: FastifyReply) {
    const user = verifyPermission(request, 'tenant:subscription:read');
    const subscription = await this.service.getSubscription(user.tenantId!);
    return { subscription };
  }

  // ==========================================================================
  // Feature Flags Endpoints
  // ==========================================================================

  /**
   * GET /api/tenant/me/flags - Get current tenant feature flags (read-only)
   */
  @Get('/me/flags')
  async getFlags(request: FastifyRequest, reply: FastifyReply) {
    const user = verifyPermission(request, 'tenant:flags:read');
    const flags = await this.service.getFlags(user.tenantId!);
    return flags;
  }

  // ==========================================================================
  // Branding Endpoints
  // ==========================================================================

  /**
   * GET /api/tenant/me/branding - Get current tenant branding
   */
  @Get('/me/branding')
  async getBranding(request: FastifyRequest, reply: FastifyReply) {
    const user = verifyPermission(request, 'tenant:branding:read');
    const branding = await this.service.getBranding(user.tenantId!);
    return { branding };
  }

  /**
   * PUT /api/tenant/me/branding - Update current tenant branding
   */
  @Put('/me/branding')
  async updateBranding(request: FastifyRequest, reply: FastifyReply) {
    const user = verifyPermission(request, 'tenant:branding:update');

    const data = validate(UpdateBrandingSchema, request.body);
    const branding = await this.service.updateBranding(
      user.tenantId!,
      data,
      user.id
    );

    return { branding };
  }

  // ==========================================================================
  // Integration Endpoints
  // ==========================================================================

  /**
   * GET /api/tenant/me/integrations - List all integrations (masked secrets)
   */
  @Get('/me/integrations')
  async getIntegrations(request: FastifyRequest, reply: FastifyReply) {
    const user = verifyPermission(request, 'tenant:integrations:read');
    const integrations = await this.service.getIntegrations(user.tenantId!);
    return integrations;
  }

  /**
   * PUT /api/tenant/me/integrations/:provider - Configure integration
   */
  @Put('/me/integrations/:provider')
  async updateIntegration(
    request: FastifyRequest<{ Params: { provider: string } }>,
    reply: FastifyReply
  ) {
    const user = verifyPermission(request, 'tenant:integrations:update');

    const provider = request.params.provider;
    if (!provider) {
      throw new BadRequestError('Integration provider is required');
    }

    const data = validate(IntegrationConfigSchema, request.body);
    const integration = await this.service.updateIntegration(
      user.tenantId!,
      provider,
      data,
      user.id
    );

    return { integration };
  }
}
