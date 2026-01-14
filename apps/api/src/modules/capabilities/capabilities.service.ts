/**
 * Capabilities Service
 * Business logic for tenant capabilities projection DTO generation
 * Aggregates feature flags, license status, and entitlements into screen-ready data
 */
import { Injectable, Inject } from '../../core/decorators';
import { CapabilitiesRepository, type TenantLicenseWithPlan } from './capabilities.repository';
import { NotFoundError, ForbiddenError } from '../../core/errors/problem-details';
import type {
  TenantFeatureFlag,
  TenantIntegration,
  LicenseEntitlement,
} from '../../database/schema';

// ============================================================================
// Projection DTO Types (screen-ready, no transformers needed)
// ============================================================================

/**
 * Feature state for a specific feature
 */
export interface FeatureStateDTO {
  key: string;
  enabled: boolean;
  config: Record<string, unknown>;
}

/**
 * Integration provider state
 */
export interface IntegrationStateDTO {
  providerType: string;
  providerName: string;
  enabled: boolean;
  configured: boolean;
}

/**
 * Tenant features collection
 */
export interface TenantFeaturesDTO {
  flags: Record<string, FeatureStateDTO>;
  integrations: Record<string, IntegrationStateDTO[]>;
}

/**
 * License entitlement with quota tracking
 */
export interface EntitlementDTO {
  key: string;
  enabled: boolean;
  quotaLimit: number | null;
  quotaUsed?: number;
  unlimited: boolean;
}

/**
 * License status enum
 */
export type LicenseStatus = 'active' | 'trial' | 'suspended' | 'expired' | 'none';

/**
 * Tenant license info
 */
export interface TenantLicenseDTO {
  status: LicenseStatus;
  planCode: string;
  planName: string;
  validFrom: string | null;
  validUntil: string | null;
  trialEndsAt: string | null;
  isTrialActive: boolean;
  isExpired: boolean;
  isSuspended: boolean;
  daysRemaining: number | null;
  entitlements: Record<string, EntitlementDTO>;
}

/**
 * Computed permissions based on license and features
 */
export interface TenantPermissionsDTO {
  canAccessModule: Record<string, boolean>;
  canUseFeature: Record<string, boolean>;
  canUseIntegration: Record<string, boolean>;
}

/**
 * Available action for the tenant
 */
export interface ActionDTO {
  action: string;
  label: string;
  href?: string;
  enabled: boolean;
  reason?: string;
}

/**
 * Policy decision record
 */
export interface PolicyDecisionDTO {
  policy: string;
  decision: 'allow' | 'deny';
  reason: string;
}

/**
 * TenantCapabilitiesProjectionDTO
 * Screen-ready, no transformers needed in frontend
 */
export interface TenantCapabilitiesProjectionDTO {
  tenantId: string;
  features: TenantFeaturesDTO;
  license: TenantLicenseDTO;
  permissions: TenantPermissionsDTO;
  availableActions: ActionDTO[];
  policyDecisions?: PolicyDecisionDTO[];
}

/**
 * Update feature flag input
 */
export interface UpdateFeatureFlagInput {
  enabled: boolean;
  config?: Record<string, unknown>;
}

// ============================================================================
// Default Plans (when no license exists)
// ============================================================================

const DEFAULT_PLAN: Omit<TenantLicenseDTO, 'entitlements'> = {
  status: 'none',
  planCode: 'free',
  planName: 'Free Plan',
  validFrom: null,
  validUntil: null,
  trialEndsAt: null,
  isTrialActive: false,
  isExpired: false,
  isSuspended: false,
  daysRemaining: null,
};

// Default free plan entitlements (limited capabilities)
const DEFAULT_ENTITLEMENTS: Record<string, EntitlementDTO> = {
  'modules.listings': {
    key: 'modules.listings',
    enabled: true,
    quotaLimit: 5,
    unlimited: false,
  },
  'modules.bookings': {
    key: 'modules.bookings',
    enabled: true,
    quotaLimit: 10,
    unlimited: false,
  },
  'modules.users': {
    key: 'modules.users',
    enabled: true,
    quotaLimit: 3,
    unlimited: false,
  },
};

// ============================================================================
// Service Implementation
// ============================================================================

@Injectable()
export class CapabilitiesService {
  constructor(
    @Inject('CapabilitiesRepository') private readonly repository: CapabilitiesRepository,
    @Inject('Adapters') private readonly adapters: any
  ) {}

  /**
   * Get full tenant capabilities projection DTO
   * This is the main method for building screen-ready capability data
   */
  async getTenantCapabilities(tenantId: string): Promise<TenantCapabilitiesProjectionDTO> {
    // Fetch all data in parallel
    const [featureFlags, integrations, licenseWithPlan] = await Promise.all([
      this.repository.findFeatureFlagsByTenant(tenantId),
      this.repository.findIntegrationsByTenant(tenantId),
      this.repository.findTenantLicenseWithPlan(tenantId),
    ]);

    // Build the projection DTO
    const features = this.buildFeaturesDTO(featureFlags, integrations);
    const license = this.buildLicenseDTO(licenseWithPlan);
    const permissions = this.buildPermissionsDTO(features, license);
    const availableActions = this.buildAvailableActions(license, permissions);

    const dto: TenantCapabilitiesProjectionDTO = {
      tenantId,
      features,
      license,
      permissions,
      availableActions,
    };

    // Cache the result
    await this.adapters?.cache?.set(`capabilities:${tenantId}`, dto, 300); // 5 minutes

    this.adapters?.log?.debug('Capabilities projection built', { tenantId });

    return dto;
  }

  /**
   * Get cached capabilities or fetch fresh
   */
  async getCachedCapabilities(tenantId: string): Promise<TenantCapabilitiesProjectionDTO> {
    // Try cache first
    const cached = await this.adapters?.cache?.get(`capabilities:${tenantId}`) as TenantCapabilitiesProjectionDTO | null;
    if (cached) {
      this.adapters?.log?.debug('Capabilities served from cache', { tenantId });
      return cached;
    }

    return this.getTenantCapabilities(tenantId);
  }

  /**
   * Get all feature flags for a tenant
   */
  async getFeatureFlags(tenantId: string): Promise<FeatureStateDTO[]> {
    const flags = await this.repository.findFeatureFlagsByTenant(tenantId);
    return flags.map((flag) => ({
      key: flag.featureKey,
      enabled: flag.enabled,
      config: (flag.config as Record<string, unknown>) || {},
    }));
  }

  /**
   * Get a single feature flag
   */
  async getFeatureFlag(tenantId: string, featureKey: string): Promise<FeatureStateDTO | null> {
    const flag = await this.repository.findFeatureFlagByKey(tenantId, featureKey);
    if (!flag) {
      return null;
    }

    return {
      key: flag.featureKey,
      enabled: flag.enabled,
      config: (flag.config as Record<string, unknown>) || {},
    };
  }

  /**
   * Check if a specific feature is enabled
   */
  async isFeatureEnabled(tenantId: string, featureKey: string): Promise<boolean> {
    return this.repository.isFeatureEnabled(tenantId, featureKey);
  }

  /**
   * Update a feature flag
   * Requires audit logging
   */
  async updateFeatureFlag(
    tenantId: string,
    featureKey: string,
    input: UpdateFeatureFlagInput,
    userId?: string
  ): Promise<FeatureStateDTO> {
    const flag = await this.repository.upsertFeatureFlag(tenantId, featureKey, {
      enabled: input.enabled,
      config: input.config,
    });

    // Invalidate cache
    await this.adapters?.cache?.delete(`capabilities:${tenantId}`);

    // Audit log the change
    await this.logAudit(tenantId, 'feature_flag_updated', 'tenant_feature_flags', flag.id, {
      featureKey,
      enabled: input.enabled,
      userId,
    });

    this.adapters?.log?.info('Feature flag updated', {
      tenantId,
      featureKey,
      enabled: input.enabled,
    });

    return {
      key: flag.featureKey,
      enabled: flag.enabled,
      config: (flag.config as Record<string, unknown>) || {},
    };
  }

  /**
   * Bulk update feature flags
   */
  async bulkUpdateFeatureFlags(
    tenantId: string,
    flags: Array<{ featureKey: string; enabled: boolean; config?: Record<string, unknown> }>,
    userId?: string
  ): Promise<FeatureStateDTO[]> {
    const results = await this.repository.bulkUpsertFeatureFlags(tenantId, flags);

    // Invalidate cache
    await this.adapters?.cache?.delete(`capabilities:${tenantId}`);

    // Audit log the change
    await this.logAudit(tenantId, 'feature_flags_bulk_updated', 'tenant_feature_flags', null, {
      count: flags.length,
      features: flags.map((f) => f.featureKey),
      userId,
    });

    this.adapters?.log?.info('Feature flags bulk updated', {
      tenantId,
      count: flags.length,
    });

    return results.map((flag) => ({
      key: flag.featureKey,
      enabled: flag.enabled,
      config: (flag.config as Record<string, unknown>) || {},
    }));
  }

  /**
   * Check if tenant has a specific entitlement
   */
  async hasEntitlement(tenantId: string, entitlementKey: string): Promise<boolean> {
    return this.repository.hasTenantEntitlement(tenantId, entitlementKey);
  }

  /**
   * Verify license is active (not expired or suspended)
   */
  async verifyLicenseActive(tenantId: string): Promise<{ valid: boolean; reason?: string }> {
    const license = await this.repository.findTenantLicenseWithPlan(tenantId);

    if (!license) {
      return { valid: true, reason: 'Using free plan' };
    }

    const status = this.computeLicenseStatus(license);

    if (status === 'suspended') {
      return { valid: false, reason: 'License is suspended' };
    }

    if (status === 'expired') {
      return { valid: false, reason: 'License has expired' };
    }

    return { valid: true };
  }

  // ==========================================================================
  // Private: DTO Builder Methods
  // ==========================================================================

  /**
   * Build features DTO from raw data
   */
  private buildFeaturesDTO(
    flags: TenantFeatureFlag[],
    integrations: TenantIntegration[]
  ): TenantFeaturesDTO {
    // Build flags record
    const flagsRecord: Record<string, FeatureStateDTO> = {};
    for (const flag of flags) {
      flagsRecord[flag.featureKey] = {
        key: flag.featureKey,
        enabled: flag.enabled,
        config: (flag.config as Record<string, unknown>) || {},
      };
    }

    // Build integrations grouped by provider type
    const integrationsRecord: Record<string, IntegrationStateDTO[]> = {};
    for (const integration of integrations) {
      if (!integrationsRecord[integration.providerType]) {
        integrationsRecord[integration.providerType] = [];
      }
      integrationsRecord[integration.providerType].push({
        providerType: integration.providerType,
        providerName: integration.providerName,
        enabled: integration.enabled,
        configured: !!integration.credentialRef,
      });
    }

    return {
      flags: flagsRecord,
      integrations: integrationsRecord,
    };
  }

  /**
   * Build license DTO from raw data
   */
  private buildLicenseDTO(licenseWithPlan: TenantLicenseWithPlan | null): TenantLicenseDTO {
    if (!licenseWithPlan) {
      // Return default free plan
      return {
        ...DEFAULT_PLAN,
        entitlements: { ...DEFAULT_ENTITLEMENTS },
      };
    }

    const { plan, entitlements } = licenseWithPlan;
    const status = this.computeLicenseStatus(licenseWithPlan);

    // Build entitlements record
    const entitlementsRecord: Record<string, EntitlementDTO> = {};
    for (const entitlement of entitlements) {
      entitlementsRecord[entitlement.entitlementKey] = {
        key: entitlement.entitlementKey,
        enabled: entitlement.enabled,
        quotaLimit: entitlement.quotaLimit,
        unlimited: entitlement.quotaLimit === null,
      };
    }

    // Calculate days remaining
    let daysRemaining: number | null = null;
    const endDate = licenseWithPlan.validUntil || licenseWithPlan.trialEndsAt;
    if (endDate) {
      const now = new Date();
      const end = new Date(endDate);
      const diffTime = end.getTime() - now.getTime();
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    return {
      status,
      planCode: plan.code,
      planName: plan.name,
      validFrom: licenseWithPlan.validFrom?.toISOString() || null,
      validUntil: licenseWithPlan.validUntil?.toISOString() || null,
      trialEndsAt: licenseWithPlan.trialEndsAt?.toISOString() || null,
      isTrialActive: status === 'trial',
      isExpired: status === 'expired',
      isSuspended: status === 'suspended',
      daysRemaining,
      entitlements: entitlementsRecord,
    };
  }

  /**
   * Compute license status from raw license data
   */
  private computeLicenseStatus(license: TenantLicenseWithPlan): LicenseStatus {
    const now = new Date();

    // Check explicit status first
    if (license.status === 'suspended') {
      return 'suspended';
    }

    // Check if expired
    if (license.validUntil && new Date(license.validUntil) < now) {
      return 'expired';
    }

    // Check if in trial
    if (license.trialEndsAt) {
      if (new Date(license.trialEndsAt) >= now) {
        return 'trial';
      }
      // Trial ended, check if paid plan exists
      if (!license.validUntil) {
        return 'expired';
      }
    }

    // Check explicit status
    if (license.status === 'trial') {
      return 'trial';
    }

    if (license.status === 'expired') {
      return 'expired';
    }

    return 'active';
  }

  /**
   * Build permissions DTO based on features and license
   */
  private buildPermissionsDTO(
    features: TenantFeaturesDTO,
    license: TenantLicenseDTO
  ): TenantPermissionsDTO {
    const canAccessModule: Record<string, boolean> = {};
    const canUseFeature: Record<string, boolean> = {};
    const canUseIntegration: Record<string, boolean> = {};

    // License must be valid to access any modules
    const licenseValid = !license.isExpired && !license.isSuspended;

    // Build module access from entitlements
    for (const [key, entitlement] of Object.entries(license.entitlements)) {
      if (key.startsWith('modules.')) {
        const moduleName = key.replace('modules.', '');
        canAccessModule[moduleName] = licenseValid && entitlement.enabled;
      }
    }

    // Build feature access from flags + license validity
    for (const [key, flag] of Object.entries(features.flags)) {
      canUseFeature[key] = licenseValid && flag.enabled;
    }

    // Build integration access from integrations + license validity
    for (const [providerType, providers] of Object.entries(features.integrations)) {
      for (const provider of providers) {
        const key = `${providerType}.${provider.providerName}`;
        canUseIntegration[key] = licenseValid && provider.enabled && provider.configured;
      }
    }

    return {
      canAccessModule,
      canUseFeature,
      canUseIntegration,
    };
  }

  /**
   * Build available actions based on license and permissions
   */
  private buildAvailableActions(
    license: TenantLicenseDTO,
    permissions: TenantPermissionsDTO
  ): ActionDTO[] {
    const actions: ActionDTO[] = [];

    // Upgrade action if on free or trial
    if (license.planCode === 'free' || license.isTrialActive) {
      actions.push({
        action: 'upgrade_plan',
        label: 'Upgrade Plan',
        href: '/settings/billing/plans',
        enabled: true,
      });
    }

    // Renew action if expired
    if (license.isExpired) {
      actions.push({
        action: 'renew_license',
        label: 'Renew License',
        href: '/settings/billing/renew',
        enabled: true,
      });
    }

    // Contact support if suspended
    if (license.isSuspended) {
      actions.push({
        action: 'contact_support',
        label: 'Contact Support',
        href: '/support',
        enabled: true,
        reason: 'License is suspended',
      });
    }

    // Manage features action (if has admin access)
    actions.push({
      action: 'manage_features',
      label: 'Manage Features',
      href: '/settings/features',
      enabled: !license.isExpired && !license.isSuspended,
      reason: license.isExpired ? 'License expired' : license.isSuspended ? 'License suspended' : undefined,
    });

    // View usage action
    actions.push({
      action: 'view_usage',
      label: 'View Usage',
      href: '/settings/usage',
      enabled: true,
    });

    return actions;
  }

  /**
   * Log audit event
   */
  private async logAudit(
    tenantId: string,
    action: string,
    resource: string,
    resourceId: string | null,
    metadata: Record<string, unknown>
  ): Promise<void> {
    try {
      // Use the adapters audit logger if available
      if (this.adapters?.audit) {
        await this.adapters.audit.log({
          tenantId,
          action,
          resource,
          resourceId,
          metadata,
          timestamp: new Date(),
        });
      }
    } catch (error) {
      // Log but don't throw - audit failure shouldn't break the operation
      this.adapters?.log?.error('Failed to log audit event', {
        tenantId,
        action,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
