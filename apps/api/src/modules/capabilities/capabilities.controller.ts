/**
 * Capabilities Controller
 * REST API endpoints for tenant capabilities management
 *
 * Routes:
 * - GET /api/capabilities/current - Get current tenant capabilities projection DTO
 * - GET /api/capabilities/features - List all feature flags for tenant
 * - PUT /api/capabilities/features/:key - Update a specific feature flag
 */
import { Controller, Get, Put } from '../../core/decorators';
import { Inject } from '../../core/decorators';
import { CapabilitiesService, type UpdateFeatureFlagInput } from './capabilities.service';
import { validate } from '../../core/validation/zod-pipe';
import { z } from 'zod';
import type { FastifyRequest, FastifyReply } from 'fastify';

// ============================================================================
// Request Type Extensions
// ============================================================================

/**
 * Extended request with tenant context
 */
interface CapabilitiesRequest extends FastifyRequest {
  tenantId?: string | null;
  userId?: string | null;
}

// ============================================================================
// Validation Schemas
// ============================================================================

/**
 * Update feature flag request body schema
 */
const UpdateFeatureFlagSchema = z.object({
  enabled: z.boolean(),
  config: z.record(z.unknown()).optional(),
});

/**
 * Feature key parameter validation
 */
const FeatureKeyParamSchema = z.object({
  key: z.string().min(1).max(100).regex(
    /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)*$/,
    'Feature key must be lowercase with dots as separators (e.g., "ratings", "payments.vipps")'
  ),
});

// ============================================================================
// Controller Implementation
// ============================================================================

@Controller('/api/capabilities')
export class CapabilitiesController {
  constructor(
    @Inject('CapabilitiesService') private readonly service: CapabilitiesService
  ) {}

  /**
   * GET /api/capabilities/current - Get current tenant capabilities
   *
   * Returns the full TenantCapabilitiesProjectionDTO with:
   * - features (flags and integrations)
   * - license (status, plan, entitlements)
   * - permissions (computed access rights)
   * - availableActions (context-aware actions)
   */
  @Get('/current')
  async getCurrentCapabilities(request: CapabilitiesRequest, reply: FastifyReply) {
    const tenantId = this.getTenantId(request);

    if (!tenantId) {
      return this.sendTenantRequiredError(reply);
    }

    const capabilities = await this.service.getCachedCapabilities(tenantId);

    return {
      data: capabilities,
    };
  }

  /**
   * GET /api/capabilities/features - List all feature flags
   *
   * Returns an array of feature flag states for the tenant
   */
  @Get('/features')
  async getFeatures(request: CapabilitiesRequest, reply: FastifyReply) {
    const tenantId = this.getTenantId(request);

    if (!tenantId) {
      return this.sendTenantRequiredError(reply);
    }

    const features = await this.service.getFeatureFlags(tenantId);

    return {
      data: features,
    };
  }

  /**
   * GET /api/capabilities/features/:key - Get a specific feature flag
   *
   * Returns a single feature flag state
   */
  @Get('/features/:key')
  async getFeature(
    request: CapabilitiesRequest & { Params: { key: string } },
    reply: FastifyReply
  ) {
    const tenantId = this.getTenantId(request);

    if (!tenantId) {
      return this.sendTenantRequiredError(reply);
    }

    const params = validate(FeatureKeyParamSchema, request.params);
    const feature = await this.service.getFeatureFlag(tenantId, params.key);

    if (!feature) {
      return reply.status(404).send({
        error: {
          type: 'https://api.digilist.no/errors/not-found',
          title: 'Feature Not Found',
          status: 404,
          detail: `Feature flag '${params.key}' does not exist for this tenant`,
          errorCode: 'FEATURE_NOT_FOUND',
        },
      });
    }

    return {
      data: feature,
    };
  }

  /**
   * PUT /api/capabilities/features/:key - Update a feature flag
   *
   * Updates the enabled state and optional config for a feature flag.
   * Creates the flag if it doesn't exist.
   *
   * Request body:
   * - enabled: boolean (required)
   * - config: object (optional)
   */
  @Put('/features/:key')
  async updateFeature(
    request: CapabilitiesRequest & { Params: { key: string } },
    reply: FastifyReply
  ) {
    const tenantId = this.getTenantId(request);

    if (!tenantId) {
      return this.sendTenantRequiredError(reply);
    }

    // Validate params and body
    const params = validate(FeatureKeyParamSchema, request.params);
    const body = validate(UpdateFeatureFlagSchema, request.body);

    const input: UpdateFeatureFlagInput = {
      enabled: body.enabled,
      config: body.config,
    };

    const feature = await this.service.updateFeatureFlag(
      tenantId,
      params.key,
      input,
      request.userId || undefined
    );

    return {
      data: feature,
      message: `Feature flag '${params.key}' updated successfully`,
    };
  }

  // ==========================================================================
  // Private Helper Methods
  // ==========================================================================

  /**
   * Extract tenant ID from request
   * Checks request.tenantId first, then falls back to x-tenant-id header
   */
  private getTenantId(request: CapabilitiesRequest): string | null {
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
