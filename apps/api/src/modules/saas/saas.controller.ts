/**
 * SaaS Admin Controller
 * REST API endpoints for SaaS platform administration
 *
 * All endpoints require SaaS-level roles (SAAS_SUPER_ADMIN, SAAS_BILLING_ADMIN, SAAS_SUPPORT_AGENT)
 */
import { Controller, Get, Post, Put, Patch } from '../../core/decorators';
import { Inject } from '../../core/decorators';
import { SaasService } from './saas.service';
import { validate } from '../../core/validation/zod-pipe';
import {
  ForbiddenError,
  BadRequestError,
} from '../../core/errors/problem-details';
import {
  SaasTenantQuerySchema,
  CreateSaasTenantSchema,
  UpdateSaasTenantSchema,
  UpdateSeatLimitsSchema,
  UpdateFeatureFlagsSchema,
} from './saas.types';
import { isSaasRole, hasPermission } from '../auth/rbac';
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
 */
function getAuthenticatedUser(request: FastifyRequest): UserContext {
  const user = (request as FastifyRequest & { user?: UserContext }).user;
  if (!user) {
    throw new ForbiddenError('Authentication required');
  }
  return user;
}

/**
 * Verify that the request user has a SaaS-level role
 */
function verifySaasAccess(request: FastifyRequest): UserContext {
  const user = getAuthenticatedUser(request);
  if (!isSaasRole(user.role)) {
    throw new ForbiddenError('This endpoint is only available to SaaS administrators');
  }
  return user;
}

/**
 * Verify that the request user has a specific permission
 */
function verifyPermission(request: FastifyRequest, permission: string): UserContext {
  const user = verifySaasAccess(request);
  if (!hasPermission(user.role, permission as `${string}:${string}`)) {
    throw new ForbiddenError(`Missing required permission: ${permission}`);
  }
  return user;
}

@Controller('/api/saas')
export class SaasController {
  constructor(
    @Inject('SaasService') private readonly service: SaasService
  ) {}

  // ==========================================================================
  // Capability Endpoints
  // ==========================================================================

  /**
   * GET /api/saas/me - Get current SaaS admin capabilities
   */
  @Get('/me')
  async getCapabilities(request: FastifyRequest, reply: FastifyReply) {
    const user = verifySaasAccess(request);
    const capabilities = await this.service.getCapabilities(user.id, user.role);
    return { capabilities };
  }

  // ==========================================================================
  // Tenant Management Endpoints
  // ==========================================================================

  /**
   * GET /api/saas/tenants - List all tenants with pagination
   */
  @Get('/tenants')
  async listTenants(request: FastifyRequest, reply: FastifyReply) {
    verifyPermission(request, 'saas:tenants:read');

    const params = validate(SaasTenantQuerySchema, request.query);
    const result = await this.service.listTenants({
      ...params,
      page: params.page ?? 1,
      limit: params.limit ?? 20,
      sortBy: params.sortBy ?? 'createdAt',
      sortOrder: params.sortOrder ?? 'desc',
    });
    return result;
  }

  /**
   * GET /api/saas/tenants/:id - Get tenant details
   */
  @Get('/tenants/:id')
  async getTenant(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    verifyPermission(request, 'saas:tenants:read');

    const tenantId = request.params.id;
    if (!tenantId) {
      throw new BadRequestError('Tenant ID is required');
    }

    const result = await this.service.getTenantById(tenantId);
    return result;
  }

  /**
   * POST /api/saas/tenants - Create a new tenant
   */
  @Post('/tenants')
  async createTenant(request: FastifyRequest, reply: FastifyReply) {
    const user = verifyPermission(request, 'saas:tenants:create');

    const data = validate(CreateSaasTenantSchema, request.body);
    const result = await this.service.createTenant(data, user.id);

    return reply.status(201).send(result);
  }

  /**
   * PATCH /api/saas/tenants/:id - Update tenant details
   */
  @Patch('/tenants/:id')
  async updateTenant(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const user = verifyPermission(request, 'saas:tenants:update');

    const tenantId = request.params.id;
    if (!tenantId) {
      throw new BadRequestError('Tenant ID is required');
    }

    const data = validate(UpdateSaasTenantSchema, request.body);
    const result = await this.service.updateTenant(tenantId, data, user.id);

    return result;
  }

  /**
   * POST /api/saas/tenants/:id/suspend - Suspend a tenant
   */
  @Post('/tenants/:id/suspend')
  async suspendTenant(
    request: FastifyRequest<{ Params: { id: string }; Body: { reason?: string } }>,
    reply: FastifyReply
  ) {
    const user = verifyPermission(request, 'saas:tenants:update');

    const tenantId = request.params.id;
    const body = request.body as { reason?: string } | undefined;
    const reason = body?.reason || 'No reason provided';

    const result = await this.service.suspendTenant(tenantId, reason, user.id);
    return result;
  }

  /**
   * POST /api/saas/tenants/:id/activate - Activate a suspended tenant
   */
  @Post('/tenants/:id/activate')
  async activateTenant(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const user = verifyPermission(request, 'saas:tenants:update');

    const tenantId = request.params.id;

    const result = await this.service.activateTenant(tenantId, user.id);
    return result;
  }

  // ==========================================================================
  // Seat Limits Endpoints
  // ==========================================================================

  /**
   * PUT /api/saas/tenants/:id/seat-limits - Update tenant seat limits
   */
  @Put('/tenants/:id/seat-limits')
  async updateSeatLimits(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const user = verifyPermission(request, 'saas:tenants:update');

    const tenantId = request.params.id;
    if (!tenantId) {
      throw new BadRequestError('Tenant ID is required');
    }

    const data = validate(UpdateSeatLimitsSchema, request.body);
    const result = await this.service.updateSeatLimits(tenantId, data, user.id);

    return result;
  }

  // ==========================================================================
  // Feature Flags Endpoints
  // ==========================================================================

  /**
   * GET /api/saas/feature-flags - Get feature flags catalog
   */
  @Get('/feature-flags')
  async getFeatureFlagsCatalog(request: FastifyRequest, reply: FastifyReply) {
    verifyPermission(request, 'saas:feature-flags:read');

    const result = await this.service.getFeatureFlagsCatalog();
    return result;
  }

  /**
   * PUT /api/saas/tenants/:id/flags - Update tenant feature flags
   */
  @Put('/tenants/:id/flags')
  async updateTenantFlags(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const user = verifyPermission(request, 'saas:feature-flags:update');

    const tenantId = request.params.id;
    if (!tenantId) {
      throw new BadRequestError('Tenant ID is required');
    }

    const data = validate(UpdateFeatureFlagsSchema, request.body);
    const result = await this.service.updateTenantFeatureFlags(tenantId, data, user.id);

    return result;
  }

  // ==========================================================================
  // License Key Endpoints
  // ==========================================================================

  /**
   * POST /api/saas/tenants/:id/rotate-license - Rotate tenant license key
   */
  @Post('/tenants/:id/rotate-license')
  async rotateLicenseKey(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const user = verifyPermission(request, 'saas:tenants:update');

    const tenantId = request.params.id;
    if (!tenantId) {
      throw new BadRequestError('Tenant ID is required');
    }

    const result = await this.service.rotateLicenseKey(tenantId, user.id);
    return result;
  }

  // ==========================================================================
  // Plan Management Endpoints
  // ==========================================================================

  /**
   * GET /api/saas/plans - List all subscription plans
   */
  @Get('/plans')
  async listPlans(request: FastifyRequest, reply: FastifyReply) {
    verifyPermission(request, 'saas:plans:read');

    const result = await this.service.listPlans();
    return result;
  }

  /**
   * PUT /api/saas/tenants/:id/plan - Assign plan to tenant
   */
  @Put('/tenants/:id/plan')
  async assignPlan(
    request: FastifyRequest<{ Params: { id: string }; Body: { planId: string } }>,
    reply: FastifyReply
  ) {
    const user = verifyPermission(request, 'saas:plans:update');

    const tenantId = request.params.id;
    const body = request.body as { planId?: string } | undefined;
    const planId = body?.planId;

    if (!tenantId) {
      throw new BadRequestError('Tenant ID is required');
    }
    if (!planId) {
      throw new BadRequestError('Plan ID is required');
    }

    const result = await this.service.assignPlan(tenantId, planId, user.id);
    return result;
  }
}
