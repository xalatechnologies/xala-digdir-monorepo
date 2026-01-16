/**
 * Tenant Admin Service
 * Business logic for tenant-scoped administration
 *
 * Tenant admins can manage their own tenant's branding, integrations,
 * and view their capabilities/subscription. They cannot access other tenants.
 */
import { Injectable, Inject } from '../../core/decorators';
import { validate } from '../../core/validation/zod-pipe';
import {
  NotFoundError,
  ForbiddenError,
} from '../../core/errors/problem-details';
import {
  isTenantRole,
  getCapabilityProjection,
  hasPermission,
  TenantRoles,
} from '../auth/rbac';
import type { Tenant } from '../../database/schema';
import { z } from 'zod';

// =============================================================================
// SCHEMAS
// =============================================================================

/**
 * Branding update schema
 */
export const UpdateBrandingSchema = z.object({
  logoUrl: z.string().url().optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  faviconUrl: z.string().url().optional(),
});

export type UpdateBrandingDTO = z.infer<typeof UpdateBrandingSchema>;

/**
 * Integration config schema
 */
export const IntegrationConfigSchema = z.object({
  enabled: z.boolean(),
  apiKey: z.string().min(1).optional(),
  apiSecret: z.string().min(1).optional(),
  webhookUrl: z.string().url().optional(),
  settings: z.record(z.unknown()).optional(),
});

export type IntegrationConfigDTO = z.infer<typeof IntegrationConfigSchema>;

// =============================================================================
// RESPONSE TYPES
// =============================================================================

/**
 * Tenant capability projection
 */
export interface TenantCapabilityProjection {
  role: string;
  level: string;
  tenantId: string;
  permissions: string[];
  allowedActions: {
    canViewSubscription: boolean;
    canManageBranding: boolean;
    canManageIntegrations: boolean;
    canViewFlags: boolean;
    canManageSeeds: boolean;
  };
  featureFlags: Record<string, boolean>;
  seatLimits: {
    maxUsers: number;
    maxOrganizations: number;
    maxListings: number;
    maxBookingsPerMonth: number;
    maxStorageMb: number;
  };
  usage: {
    currentUsers: number;
    currentOrganizations: number;
    currentListings: number;
    bookingsThisMonth: number;
    storageMb: number;
  };
}

/**
 * Tenant subscription response
 */
export interface TenantSubscriptionResponse {
  tenantId: string;
  planId: string | null;
  planName: string | null;
  status: string;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  seatLimits: {
    maxUsers: number;
    maxOrganizations: number;
    maxListings: number;
    maxBookingsPerMonth: number;
    maxStorageMb: number;
  };
  usage: {
    currentUsers: number;
    currentOrganizations: number;
    currentListings: number;
    bookingsThisMonth: number;
    storageMb: number;
  };
}

/**
 * Tenant branding response
 */
export interface TenantBrandingResponse {
  tenantId: string;
  logoUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  name: string;
  description: string | null;
  faviconUrl: string | null;
  version: number;
  updatedAt: Date;
}

/**
 * Tenant feature flags response
 */
export interface TenantFlagsResponse {
  tenantId: string;
  flags: Record<string, boolean>;
  lastUpdated: Date | null;
}

/**
 * Tenant integration response
 */
export interface TenantIntegrationResponse {
  provider: string;
  enabled: boolean;
  configured: boolean;
  lastSync: Date | null;
  maskedApiKey: string | null;
}

/**
 * Tenant integrations list response
 */
export interface TenantIntegrationsResponse {
  data: TenantIntegrationResponse[];
  meta: {
    total: number;
  };
}

/**
 * Audit actions for tenant admin operations
 */
export const TenantAdminAuditActions = {
  BRANDING_UPDATED: 'tenant_admin.branding.updated',
  INTEGRATION_CONFIGURED: 'tenant_admin.integration.configured',
  INTEGRATION_DISABLED: 'tenant_admin.integration.disabled',
  SEEDS_APPLIED: 'tenant_admin.seeds.applied',
} as const;

// =============================================================================
// SERVICE
// =============================================================================

@Injectable()
export class TenantAdminService {
  constructor(
    @Inject('Adapters') private readonly adapters: any
  ) {}

  // ==========================================================================
  // Capability Projection
  // ==========================================================================

  /**
   * Get tenant admin capabilities for the current user
   */
  async getCapabilities(
    userId: string,
    role: string,
    tenantId: string
  ): Promise<TenantCapabilityProjection> {
    if (!isTenantRole(role)) {
      throw new ForbiddenError('This endpoint is only available to Tenant administrators');
    }

    const projection = getCapabilityProjection(role);

    // Get tenant details (would use repository in real implementation)
    const tenant = await this.findTenantById(tenantId);
    if (!tenant) {
      throw new NotFoundError('Tenant', tenantId);
    }

    // Get feature flags for this tenant (would use repository)
    const featureFlags = await this.getTenantFeatureFlags(tenantId);

    // Get current usage (would use repository)
    const usage = await this.getTenantUsage(tenantId);

    const seatLimits = (tenant.seatLimits as {
      maxUsers?: number;
      maxOrganizations?: number;
      maxListings?: number;
      maxBookingsPerMonth?: number;
      maxStorageMb?: number;
    }) || {};

    return {
      role: projection.role,
      level: 'tenant',
      tenantId,
      permissions: projection.permissions,
      allowedActions: {
        canViewSubscription: hasPermission(role, 'tenant:subscription:read'),
        canManageBranding: hasPermission(role, 'tenant:branding:update'),
        canManageIntegrations: hasPermission(role, 'tenant:integrations:update'),
        canViewFlags: hasPermission(role, 'tenant:flags:read'),
        canManageSeeds: hasPermission(role, 'tenant:seeds:create'),
      },
      featureFlags,
      seatLimits: {
        maxUsers: seatLimits.maxUsers ?? 5,
        maxOrganizations: seatLimits.maxOrganizations ?? 1,
        maxListings: seatLimits.maxListings ?? 10,
        maxBookingsPerMonth: seatLimits.maxBookingsPerMonth ?? 100,
        maxStorageMb: seatLimits.maxStorageMb ?? 500,
      },
      usage,
    };
  }

  // ==========================================================================
  // Subscription
  // ==========================================================================

  /**
   * Get tenant subscription details
   */
  async getSubscription(tenantId: string): Promise<TenantSubscriptionResponse> {
    const tenant = await this.findTenantById(tenantId);
    if (!tenant) {
      throw new NotFoundError('Tenant', tenantId);
    }

    const usage = await this.getTenantUsage(tenantId);
    const seatLimits = (tenant.seatLimits as {
      maxUsers?: number;
      maxOrganizations?: number;
      maxListings?: number;
      maxBookingsPerMonth?: number;
      maxStorageMb?: number;
    }) || {};

    this.adapters?.log?.info('TenantAdmin: Retrieved subscription', { tenantId });

    return {
      tenantId,
      planId: tenant.subscriptionPlanId || null,
      planName: null, // Would be populated from plan lookup
      status: tenant.status,
      currentPeriodStart: null, // Would come from subscription record
      currentPeriodEnd: null,
      seatLimits: {
        maxUsers: seatLimits.maxUsers ?? 5,
        maxOrganizations: seatLimits.maxOrganizations ?? 1,
        maxListings: seatLimits.maxListings ?? 10,
        maxBookingsPerMonth: seatLimits.maxBookingsPerMonth ?? 100,
        maxStorageMb: seatLimits.maxStorageMb ?? 500,
      },
      usage,
    };
  }

  // ==========================================================================
  // Feature Flags
  // ==========================================================================

  /**
   * Get tenant feature flags (read-only for tenant admins)
   */
  async getFlags(tenantId: string): Promise<TenantFlagsResponse> {
    const tenant = await this.findTenantById(tenantId);
    if (!tenant) {
      throw new NotFoundError('Tenant', tenantId);
    }

    const flags = await this.getTenantFeatureFlags(tenantId);

    this.adapters?.log?.info('TenantAdmin: Retrieved feature flags', { tenantId });

    return {
      tenantId,
      flags,
      lastUpdated: null, // Would come from tenant_feature_flags table
    };
  }

  // ==========================================================================
  // Branding
  // ==========================================================================

  /**
   * Get tenant branding configuration
   */
  async getBranding(tenantId: string): Promise<TenantBrandingResponse> {
    const tenant = await this.findTenantById(tenantId);
    if (!tenant) {
      throw new NotFoundError('Tenant', tenantId);
    }

    this.adapters?.log?.info('TenantAdmin: Retrieved branding', { tenantId });

    // Would fetch from branding_tokens table
    return {
      tenantId,
      logoUrl: null,
      primaryColor: null,
      secondaryColor: null,
      name: tenant.name,
      description: null,
      faviconUrl: null,
      version: 1,
      updatedAt: tenant.updatedAt,
    };
  }

  /**
   * Update tenant branding configuration
   */
  async updateBranding(
    tenantId: string,
    data: UpdateBrandingDTO,
    actorId: string
  ): Promise<TenantBrandingResponse> {
    const validated = validate(UpdateBrandingSchema, data);

    const tenant = await this.findTenantById(tenantId);
    if (!tenant) {
      throw new NotFoundError('Tenant', tenantId);
    }

    // Would update branding_tokens table
    await this.logAuditEvent(
      TenantAdminAuditActions.BRANDING_UPDATED,
      'branding',
      tenantId,
      actorId,
      { changes: Object.keys(validated) }
    );

    this.adapters?.log?.info('TenantAdmin: Branding updated', {
      tenantId,
      changes: Object.keys(validated),
      actorId,
    });

    return {
      tenantId,
      logoUrl: validated.logoUrl || null,
      primaryColor: validated.primaryColor || null,
      secondaryColor: validated.secondaryColor || null,
      name: validated.name || tenant.name,
      description: validated.description || null,
      faviconUrl: validated.faviconUrl || null,
      version: 2, // Would increment version
      updatedAt: new Date(),
    };
  }

  // ==========================================================================
  // Integrations
  // ==========================================================================

  /**
   * List tenant integrations (with masked secrets)
   */
  async getIntegrations(tenantId: string): Promise<TenantIntegrationsResponse> {
    const tenant = await this.findTenantById(tenantId);
    if (!tenant) {
      throw new NotFoundError('Tenant', tenantId);
    }

    // Would fetch from encrypted_secrets table and mask values
    const availableProviders = ['visma', 'rco', 'acos', 'outlook', 'vipps'];

    const data: TenantIntegrationResponse[] = availableProviders.map(provider => ({
      provider,
      enabled: false,
      configured: false,
      lastSync: null,
      maskedApiKey: null,
    }));

    this.adapters?.log?.info('TenantAdmin: Retrieved integrations', { tenantId });

    return {
      data,
      meta: {
        total: data.length,
      },
    };
  }

  /**
   * Configure a tenant integration
   */
  async updateIntegration(
    tenantId: string,
    provider: string,
    data: IntegrationConfigDTO,
    actorId: string
  ): Promise<TenantIntegrationResponse> {
    const validated = validate(IntegrationConfigSchema, data);

    const tenant = await this.findTenantById(tenantId);
    if (!tenant) {
      throw new NotFoundError('Tenant', tenantId);
    }

    const validProviders = ['visma', 'rco', 'acos', 'outlook', 'vipps'];
    if (!validProviders.includes(provider)) {
      throw new NotFoundError('Integration provider', provider);
    }

    const auditAction = validated.enabled
      ? TenantAdminAuditActions.INTEGRATION_CONFIGURED
      : TenantAdminAuditActions.INTEGRATION_DISABLED;

    // Would encrypt and store in encrypted_secrets table
    await this.logAuditEvent(
      auditAction,
      'integration',
      tenantId,
      actorId,
      { provider, enabled: validated.enabled }
    );

    this.adapters?.log?.info('TenantAdmin: Integration configured', {
      tenantId,
      provider,
      enabled: validated.enabled,
      actorId,
    });

    // Track analytics
    await this.adapters?.analytics?.track('tenant_integration_configured', {
      tenantId,
      provider,
      enabled: validated.enabled,
    });

    return {
      provider,
      enabled: validated.enabled,
      configured: !!validated.apiKey,
      lastSync: null,
      maskedApiKey: validated.apiKey ? this.maskSecret(validated.apiKey) : null,
    };
  }

  // ==========================================================================
  // Private Helpers
  // ==========================================================================

  /**
   * Find tenant by ID (placeholder for repository)
   */
  private async findTenantById(tenantId: string): Promise<Tenant | null> {
    // This would use a repository in a real implementation
    // For now, return a mock tenant to allow the structure to work
    return {
      id: tenantId,
      name: 'Mock Tenant',
      slug: 'mock-tenant',
      domain: null,
      settings: {},
      status: 'active',
      subscriptionPlanId: null,
      licenseKeyHash: null,
      licenseKeyRotatedAt: null,
      seatLimits: {
        maxUsers: 5,
        maxOrganizations: 1,
        maxListings: 10,
        maxBookingsPerMonth: 100,
        maxStorageMb: 500,
      },
      brandingVersionId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Tenant;
  }

  /**
   * Get feature flags for a tenant
   */
  private async getTenantFeatureFlags(tenantId: string): Promise<Record<string, boolean>> {
    // This would use a repository in a real implementation
    return {
      'module.rating': false,
      'module.recommendations': false,
      'module.feedback': true,
      'module.favorites': true,
      'module.share': true,
      'module.recurring_bookings': false,
      'integration.visma': false,
      'integration.rco': false,
      'integration.acos': false,
      'integration.outlook': false,
      'integration.vipps': false,
      'policy.require_approval': true,
      'policy.org_delegation': false,
    };
  }

  /**
   * Get current usage for a tenant
   */
  private async getTenantUsage(tenantId: string): Promise<{
    currentUsers: number;
    currentOrganizations: number;
    currentListings: number;
    bookingsThisMonth: number;
    storageMb: number;
  }> {
    // This would use a repository in a real implementation
    return {
      currentUsers: 0,
      currentOrganizations: 0,
      currentListings: 0,
      bookingsThisMonth: 0,
      storageMb: 0,
    };
  }

  /**
   * Mask a secret value for display
   */
  private maskSecret(value: string): string {
    if (value.length <= 8) {
      return '*'.repeat(value.length);
    }
    return `${value.substring(0, 4)}${'*'.repeat(value.length - 8)}${value.substring(value.length - 4)}`;
  }

  /**
   * Log an audit event
   */
  private async logAuditEvent(
    action: string,
    resource: string,
    resourceId: string,
    actorId: string,
    metadata: Record<string, unknown> = {}
  ): Promise<void> {
    // This would use an audit service/repository in a real implementation
    this.adapters?.audit?.log({
      action,
      resource,
      resourceId,
      userId: actorId,
      metadata,
      timestamp: new Date(),
    });
  }
}
