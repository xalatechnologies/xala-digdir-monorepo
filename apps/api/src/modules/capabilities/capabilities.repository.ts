/**
 * Capabilities Repository
 * Data access layer for tenant feature flags and integrations
 * Enforces tenant isolation in all queries
 */
import { eq, and, sql } from 'drizzle-orm';
import { Injectable } from '../../core/decorators';
import { BaseRepository, type PaginatedResult, type FilterCondition } from '../../database/base.repository';
import {
  tenantFeatureFlags,
  tenantIntegrations,
  tenantLicenses,
  licensePlans,
  licenseEntitlements,
  type TenantFeatureFlag,
  type NewTenantFeatureFlag,
  type TenantIntegration,
  type NewTenantIntegration,
  type TenantLicense,
  type LicensePlan,
  type LicenseEntitlement,
} from '../../database/schema';

/**
 * Feature Flag Query Params
 */
export interface FeatureFlagQueryParams {
  tenantId: string;
  featureKey?: string;
  enabled?: boolean;
  page?: number;
  limit?: number;
}

/**
 * Integration Query Params
 */
export interface IntegrationQueryParams {
  tenantId: string;
  providerType?: string;
  providerName?: string;
  enabled?: boolean;
  page?: number;
  limit?: number;
}

/**
 * Tenant License with Plan Details
 */
export interface TenantLicenseWithPlan extends TenantLicense {
  plan: LicensePlan;
  entitlements: LicenseEntitlement[];
}

@Injectable()
export class CapabilitiesRepository extends BaseRepository<
  typeof tenantFeatureFlags,
  TenantFeatureFlag,
  NewTenantFeatureFlag,
  Partial<NewTenantFeatureFlag>,
  string
> {
  constructor(db: any) {
    super(db, tenantFeatureFlags, tenantFeatureFlags.id);
  }

  // ==========================================================================
  // Feature Flag Methods
  // ==========================================================================

  /**
   * Find all feature flags for a tenant
   */
  async findFeatureFlagsByTenant(tenantId: string): Promise<TenantFeatureFlag[]> {
    return this.db
      .select()
      .from(tenantFeatureFlags)
      .where(eq(tenantFeatureFlags.tenantId, tenantId));
  }

  /**
   * Find feature flag by tenant and key
   */
  async findFeatureFlagByKey(tenantId: string, featureKey: string): Promise<TenantFeatureFlag | null> {
    const results = await this.db
      .select()
      .from(tenantFeatureFlags)
      .where(
        and(
          eq(tenantFeatureFlags.tenantId, tenantId),
          eq(tenantFeatureFlags.featureKey, featureKey)
        )
      )
      .limit(1);

    return results[0] || null;
  }

  /**
   * Find feature flags with query params (with pagination)
   */
  async findFeatureFlagsWithFilters(params: FeatureFlagQueryParams): Promise<PaginatedResult<TenantFeatureFlag>> {
    const conditions: FilterCondition[] = [
      { field: 'tenantId', operator: 'eq', value: params.tenantId },
    ];

    if (params.featureKey) {
      conditions.push({ field: 'featureKey', operator: 'like', value: `%${params.featureKey}%` });
    }

    if (params.enabled !== undefined) {
      conditions.push({ field: 'enabled', operator: 'eq', value: params.enabled });
    }

    return this.findMany(conditions, {
      page: params.page,
      limit: params.limit,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  }

  /**
   * Check if feature is enabled for tenant
   */
  async isFeatureEnabled(tenantId: string, featureKey: string): Promise<boolean> {
    const flag = await this.findFeatureFlagByKey(tenantId, featureKey);
    return flag?.enabled ?? false;
  }

  /**
   * Upsert feature flag (create or update)
   */
  async upsertFeatureFlag(
    tenantId: string,
    featureKey: string,
    data: { enabled: boolean; config?: Record<string, unknown> }
  ): Promise<TenantFeatureFlag> {
    const existing = await this.findFeatureFlagByKey(tenantId, featureKey);

    if (existing) {
      return this.update(existing.id, {
        enabled: data.enabled,
        config: data.config ?? existing.config,
      });
    }

    return this.create({
      tenantId,
      featureKey,
      enabled: data.enabled,
      config: data.config ?? {},
    });
  }

  /**
   * Bulk upsert feature flags for tenant
   */
  async bulkUpsertFeatureFlags(
    tenantId: string,
    flags: Array<{ featureKey: string; enabled: boolean; config?: Record<string, unknown> }>
  ): Promise<TenantFeatureFlag[]> {
    const results: TenantFeatureFlag[] = [];

    for (const flag of flags) {
      const result = await this.upsertFeatureFlag(tenantId, flag.featureKey, {
        enabled: flag.enabled,
        config: flag.config,
      });
      results.push(result);
    }

    return results;
  }

  // ==========================================================================
  // Integration Methods
  // ==========================================================================

  /**
   * Find all integrations for a tenant
   */
  async findIntegrationsByTenant(tenantId: string): Promise<TenantIntegration[]> {
    return this.db
      .select()
      .from(tenantIntegrations)
      .where(eq(tenantIntegrations.tenantId, tenantId));
  }

  /**
   * Find integration by tenant and provider
   */
  async findIntegrationByProvider(
    tenantId: string,
    providerType: string,
    providerName: string
  ): Promise<TenantIntegration | null> {
    const results = await this.db
      .select()
      .from(tenantIntegrations)
      .where(
        and(
          eq(tenantIntegrations.tenantId, tenantId),
          eq(tenantIntegrations.providerType, providerType),
          eq(tenantIntegrations.providerName, providerName)
        )
      )
      .limit(1);

    return results[0] || null;
  }

  /**
   * Find integrations by type for tenant
   */
  async findIntegrationsByType(tenantId: string, providerType: string): Promise<TenantIntegration[]> {
    return this.db
      .select()
      .from(tenantIntegrations)
      .where(
        and(
          eq(tenantIntegrations.tenantId, tenantId),
          eq(tenantIntegrations.providerType, providerType)
        )
      );
  }

  /**
   * Find integrations with query params (with pagination)
   */
  async findIntegrationsWithFilters(params: IntegrationQueryParams): Promise<PaginatedResult<TenantIntegration>> {
    const { page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    // Build conditions
    const conditions = [eq(tenantIntegrations.tenantId, params.tenantId)];

    if (params.providerType) {
      conditions.push(eq(tenantIntegrations.providerType, params.providerType));
    }

    if (params.providerName) {
      conditions.push(eq(tenantIntegrations.providerName, params.providerName));
    }

    if (params.enabled !== undefined) {
      conditions.push(eq(tenantIntegrations.enabled, params.enabled));
    }

    const whereClause = and(...conditions);

    // Get count
    const countResult = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(tenantIntegrations)
      .where(whereClause);
    const total = Number(countResult[0]?.count || 0);

    // Get data
    const data = await this.db
      .select()
      .from(tenantIntegrations)
      .where(whereClause)
      .limit(limit)
      .offset(skip);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Create integration
   */
  async createIntegration(data: NewTenantIntegration): Promise<TenantIntegration> {
    const result = await this.db
      .insert(tenantIntegrations)
      .values(data)
      .returning();

    return result[0];
  }

  /**
   * Update integration
   */
  async updateIntegration(
    id: string,
    data: Partial<Omit<TenantIntegration, 'id' | 'tenantId' | 'createdAt'>>
  ): Promise<TenantIntegration> {
    const result = await this.db
      .update(tenantIntegrations)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(tenantIntegrations.id, id))
      .returning();

    return result[0];
  }

  // ==========================================================================
  // License Methods
  // ==========================================================================

  /**
   * Find tenant license with plan and entitlements
   */
  async findTenantLicenseWithPlan(tenantId: string): Promise<TenantLicenseWithPlan | null> {
    // First get the tenant license
    const licenseResults = await this.db
      .select()
      .from(tenantLicenses)
      .where(eq(tenantLicenses.tenantId, tenantId))
      .limit(1);

    const license = licenseResults[0];
    if (!license) {
      return null;
    }

    // Get the plan
    const planResults = await this.db
      .select()
      .from(licensePlans)
      .where(eq(licensePlans.id, license.planId))
      .limit(1);

    const plan = planResults[0];
    if (!plan) {
      return null;
    }

    // Get entitlements for the plan
    const entitlements = await this.db
      .select()
      .from(licenseEntitlements)
      .where(eq(licenseEntitlements.planId, plan.id));

    return {
      ...license,
      plan,
      entitlements,
    };
  }

  /**
   * Find license plan by code
   */
  async findLicensePlanByCode(code: string): Promise<LicensePlan | null> {
    const results = await this.db
      .select()
      .from(licensePlans)
      .where(eq(licensePlans.code, code))
      .limit(1);

    return results[0] || null;
  }

  /**
   * Find all active license plans
   */
  async findActiveLicensePlans(): Promise<LicensePlan[]> {
    return this.db
      .select()
      .from(licensePlans)
      .where(eq(licensePlans.isActive, true));
  }

  /**
   * Find entitlements for a plan
   */
  async findEntitlementsByPlan(planId: string): Promise<LicenseEntitlement[]> {
    return this.db
      .select()
      .from(licenseEntitlements)
      .where(eq(licenseEntitlements.planId, planId));
  }

  /**
   * Check if tenant has entitlement
   */
  async hasTenantEntitlement(tenantId: string, entitlementKey: string): Promise<boolean> {
    const license = await this.findTenantLicenseWithPlan(tenantId);
    if (!license) {
      return false;
    }

    const entitlement = license.entitlements.find((e) => e.entitlementKey === entitlementKey);
    return entitlement?.enabled ?? false;
  }

  protected getEntityName(): string {
    return 'TenantFeatureFlag';
  }
}
