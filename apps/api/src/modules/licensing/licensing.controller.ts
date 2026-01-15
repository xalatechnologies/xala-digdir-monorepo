/**
 * Licensing Controller
 * REST API endpoints for license management, code lifecycle, and activation
 *
 * Routes:
 * - GET /api/licensing/plans - List available license plans
 * - GET /api/licensing/plans/:id - Get a specific license plan
 * - GET /api/licensing/current - Get current tenant license
 * - POST /api/licensing/activate - Activate a license code
 * - POST /api/licensing/codes/issue - Issue new license code
 * - POST /api/licensing/codes/rotate - Rotate existing license code
 * - POST /api/licensing/codes/revoke - Revoke license code
 * - GET /api/licensing/codes - List license codes for tenant
 * - GET /api/licensing/activations - List activations for tenant
 */
import { Controller, Get, Post } from '../../core/decorators';
import { Inject } from '../../core/decorators';
import { LicensingService } from './licensing.service';
import { ATCService } from './atc.service';
import { validate } from '../../core/validation/zod-pipe';
import { z } from 'zod';
import type { FastifyRequest, FastifyReply } from 'fastify';

// ============================================================================
// Request Type Extensions
// ============================================================================

/**
 * Extended request with tenant context
 */
interface LicensingRequest extends FastifyRequest {
  tenantId?: string | null;
  userId?: string | null;
}

// ============================================================================
// Validation Schemas
// ============================================================================

/**
 * License plans query parameters
 */
const LicensePlansQuerySchema = z.object({
  isActive: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

/**
 * Activate license code request body
 */
const ActivateLicenseCodeSchema = z.object({
  code: z.string().min(1).max(50).regex(
    /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/,
    'License code must be in format XXXX-XXXX-XXXX-XXXX'
  ),
  environment: z.string().min(1).max(50).default('production') as z.ZodDefault<z.ZodString>,
  appId: z.string().min(1).max(100).default('web') as z.ZodDefault<z.ZodString>,
  moduleId: z.string().min(1).max(100).optional(),
});

/**
 * Issue license code request body
 */
const IssueLicenseCodeSchema = z.object({
  expiresAt: z.coerce.date().optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Rotate license code request body
 */
const RotateLicenseCodeSchema = z.object({
  currentCode: z.string().min(1).max(50).regex(
    /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/,
    'License code must be in format XXXX-XXXX-XXXX-XXXX'
  ),
  expiresAt: z.coerce.date().optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Revoke license code request body
 */
const RevokeLicenseCodeSchema = z.object({
  code: z.string().min(1).max(50).regex(
    /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/,
    'License code must be in format XXXX-XXXX-XXXX-XXXX'
  ),
  reason: z.string().max(500).optional(),
});

/**
 * Plan ID parameter schema
 */
const PlanIdParamSchema = z.object({
  id: z.string().uuid('Invalid plan ID format'),
});

// ============================================================================
// Controller Implementation
// ============================================================================

@Controller('/api/licensing')
export class LicensingController {
  constructor(
    @Inject('LicensingService') private readonly licensingService: LicensingService,
    @Inject('ATCService') private readonly atcService: ATCService
  ) {}

  // ==========================================================================
  // License Plan Routes
  // ==========================================================================

  /**
   * GET /api/licensing/plans - List available license plans
   *
   * Returns paginated list of license plans with entitlements.
   * Query params:
   * - isActive: boolean (optional) - Filter by active status
   * - page: number (optional) - Page number (default: 1)
   * - limit: number (optional) - Items per page (default: 20, max: 100)
   */
  @Get('/plans')
  async getPlans(request: LicensingRequest, reply: FastifyReply) {
    const query = validate(LicensePlansQuerySchema, request.query);

    const result = await this.licensingService.findAllPlans({
      isActive: query.isActive,
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    });

    return {
      data: result.data,
      pagination: result.pagination,
    };
  }

  /**
   * GET /api/licensing/plans/:id - Get a specific license plan
   *
   * Returns a single license plan with its entitlements
   */
  @Get('/plans/:id')
  async getPlan(
    request: LicensingRequest & { Params: { id: string } },
    reply: FastifyReply
  ) {
    const params = validate(PlanIdParamSchema, request.params);

    const plan = await this.licensingService.findPlanById(params.id);

    if (!plan) {
      return reply.status(404).send({
        error: {
          type: 'https://api.digilist.no/errors/not-found',
          title: 'License Plan Not Found',
          status: 404,
          detail: `License plan with ID '${params.id}' does not exist`,
          errorCode: 'LICENSE_PLAN_NOT_FOUND',
        },
      });
    }

    return {
      data: plan,
    };
  }

  // ==========================================================================
  // Tenant License Routes
  // ==========================================================================

  /**
   * GET /api/licensing/current - Get current tenant license
   *
   * Returns the tenant's current license status, plan, and entitlements.
   * If no license is assigned, returns the default free plan.
   */
  @Get('/current')
  async getCurrentLicense(request: LicensingRequest, reply: FastifyReply) {
    const tenantId = this.getTenantId(request);

    if (!tenantId) {
      return this.sendTenantRequiredError(reply);
    }

    const license = await this.licensingService.getTenantLicenseProjection(tenantId);

    return {
      data: license,
    };
  }

  /**
   * POST /api/licensing/activate - Activate a license code
   *
   * Validates the license code and creates an activation record.
   * This binds the tenant to the license code for the specified
   * environment and application.
   *
   * Request body:
   * - code: string (required) - License code in XXXX-XXXX-XXXX-XXXX format
   * - environment: string (optional, default: 'production')
   * - appId: string (optional, default: 'web')
   * - moduleId: string (optional)
   */
  @Post('/activate')
  async activateLicense(request: LicensingRequest, reply: FastifyReply) {
    const tenantId = this.getTenantId(request);

    if (!tenantId) {
      return this.sendTenantRequiredError(reply);
    }

    const body = validate(ActivateLicenseCodeSchema, request.body);

    // Validate the code first
    const validation = await this.atcService.validateCode({ code: body.code });

    if (!validation.valid) {
      return reply.status(401).send({
        error: {
          type: 'https://api.digilist.no/errors/unauthorized',
          title: 'Invalid License Code',
          status: 401,
          detail: validation.reason || 'The provided license code is not valid',
          errorCode: 'INVALID_LICENSE_CODE',
          policyReasonKey: 'license.code.invalid',
        },
      });
    }

    // Verify the code belongs to this tenant
    if (validation.tenantId !== tenantId) {
      return reply.status(403).send({
        error: {
          type: 'https://api.digilist.no/errors/forbidden',
          title: 'License Code Mismatch',
          status: 403,
          detail: 'This license code does not belong to your tenant',
          errorCode: 'LICENSE_CODE_TENANT_MISMATCH',
          policyReasonKey: 'license.code.tenant_mismatch',
        },
      });
    }

    // Create the activation
    const activation = await this.atcService.createActivation(
      {
        tenantId,
        licenseCodeId: validation.codeId,
        environment: body.environment ?? 'production',
        appId: body.appId ?? 'web',
        moduleId: body.moduleId,
      },
      request.userId || undefined
    );

    // Get updated license projection
    const license = await this.licensingService.getTenantLicenseProjection(tenantId);

    return reply.status(201).send({
      data: {
        activation,
        license,
      },
      message: 'License activated successfully',
    });
  }

  // ==========================================================================
  // License Code Routes
  // ==========================================================================

  /**
   * GET /api/licensing/codes - List license codes for tenant
   *
   * Returns all license codes (active, rotated, revoked) for the tenant.
   */
  @Get('/codes')
  async getLicenseCodes(request: LicensingRequest, reply: FastifyReply) {
    const tenantId = this.getTenantId(request);

    if (!tenantId) {
      return this.sendTenantRequiredError(reply);
    }

    const codes = await this.atcService.findByTenant(tenantId);

    return {
      data: codes,
    };
  }

  /**
   * POST /api/licensing/codes/issue - Issue new license code
   *
   * Creates a new license code for the tenant. The tenant must have
   * an assigned license before a code can be issued.
   *
   * Request body:
   * - expiresAt: string (optional) - ISO date when the code expires
   * - metadata: object (optional) - Additional metadata
   */
  @Post('/codes/issue')
  async issueLicenseCode(request: LicensingRequest, reply: FastifyReply) {
    const tenantId = this.getTenantId(request);

    if (!tenantId) {
      return this.sendTenantRequiredError(reply);
    }

    const body = validate(IssueLicenseCodeSchema, request.body);

    const code = await this.atcService.issueLicenseCode(
      {
        tenantId,
        expiresAt: body.expiresAt,
        metadata: body.metadata,
      },
      request.userId || undefined
    );

    return reply.status(201).send({
      data: code,
      message: 'License code issued successfully',
    });
  }

  /**
   * POST /api/licensing/codes/rotate - Rotate existing license code
   *
   * Rotates an existing license code by marking the old code as 'rotated'
   * and issuing a new code. This is useful for security purposes.
   *
   * Request body:
   * - currentCode: string (required) - The code to rotate
   * - expiresAt: string (optional) - ISO date when the new code expires
   * - metadata: object (optional) - Additional metadata
   */
  @Post('/codes/rotate')
  async rotateLicenseCode(request: LicensingRequest, reply: FastifyReply) {
    const tenantId = this.getTenantId(request);

    if (!tenantId) {
      return this.sendTenantRequiredError(reply);
    }

    const body = validate(RotateLicenseCodeSchema, request.body);

    const code = await this.atcService.rotateCode(
      {
        tenantId,
        currentCode: body.currentCode,
        expiresAt: body.expiresAt,
        metadata: body.metadata,
      },
      request.userId || undefined
    );

    return {
      data: code,
      message: 'License code rotated successfully',
    };
  }

  /**
   * POST /api/licensing/codes/revoke - Revoke license code
   *
   * Revokes a license code, immediately invalidating it. All activations
   * associated with this code will also be deactivated.
   *
   * Request body:
   * - code: string (required) - The code to revoke
   * - reason: string (optional) - Reason for revocation
   */
  @Post('/codes/revoke')
  async revokeLicenseCode(request: LicensingRequest, reply: FastifyReply) {
    const tenantId = this.getTenantId(request);

    if (!tenantId) {
      return this.sendTenantRequiredError(reply);
    }

    const body = validate(RevokeLicenseCodeSchema, request.body);

    await this.atcService.revokeCode(
      {
        tenantId,
        code: body.code,
        reason: body.reason,
      },
      request.userId || undefined
    );

    return {
      success: true,
      message: 'License code revoked successfully',
    };
  }

  // ==========================================================================
  // Activation Routes
  // ==========================================================================

  /**
   * GET /api/licensing/activations - List activations for tenant
   *
   * Returns all activation records for the tenant across all
   * environments, applications, and modules.
   */
  @Get('/activations')
  async getActivations(request: LicensingRequest, reply: FastifyReply) {
    const tenantId = this.getTenantId(request);

    if (!tenantId) {
      return this.sendTenantRequiredError(reply);
    }

    const activations = await this.atcService.findActivationsByTenant(tenantId);

    return {
      data: activations,
    };
  }

  // ==========================================================================
  // Private Helper Methods
  // ==========================================================================

  /**
   * Extract tenant ID from request
   * Checks request.tenantId first, then falls back to x-tenant-id header
   */
  private getTenantId(request: LicensingRequest): string | null {
    return request.tenantId || (request.headers['x-tenant-id'] as string) || null;
  }

  /**
   * Send standardized tenant required error (RFC 7807 compliant)
   */
  private sendTenantRequiredError(reply: FastifyReply) {
    return reply.status(400).send({
      error: {
        type: 'https://api.digilist.no/errors/validation-error',
        title: 'Tenant ID Required',
        status: 400,
        detail: 'A tenant ID must be provided via request context or x-tenant-id header',
        errorCode: 'TENANT_ID_REQUIRED',
        policyReasonKey: 'tenant.required',
      },
    });
  }
}
