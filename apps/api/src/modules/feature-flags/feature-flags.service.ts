/**
 * Feature Flags Service
 * Business logic for feature flag evaluation with tenant + org override resolution
 *
 * Resolution hierarchy (most specific wins):
 * 1. Organization-level override (if org context provided)
 * 2. Tenant-level override
 * 3. Catalog default value
 *
 * Org-level flags can only RESTRICT (disable), never EXPAND (enable) beyond tenant-level
 */
import { container } from '../../core/container';
import { NotFoundError, ForbiddenError } from '../../core/errors/problem-details';
import { getAuditService, type AuditEntry } from '../../core/audit/audit.service';
import {
  featureFlagsCatalog,
  tenantFeatureFlags,
  orgFeatureFlags,
  type FeatureFlagCatalog,
  type TenantFeatureFlag,
  type OrgFeatureFlag,
} from '../../database/schema/index';
import { eq, and, inArray } from 'drizzle-orm';

// =============================================================================
// Types
// =============================================================================

export interface ResolvedFlag {
  key: string;
  value: unknown;
  enabled: boolean;
  source: 'catalog' | 'tenant' | 'organization';
  category: string;
  metadata?: Record<string, unknown>;
}

export interface FlagEvaluationContext {
  tenantId: string;
  organizationId?: string;
  userId?: string;
}

export interface FlagUpdateInput {
  value: unknown;
  enabled: boolean;
  reason?: string;
}

export interface BulkFlagUpdate {
  [flagKey: string]: FlagUpdateInput;
}

export interface FeatureFlagsProjection {
  flags: Record<string, ResolvedFlag>;
  categories: Record<string, ResolvedFlag[]>;
  enabledFlags: string[];
  disabledFlags: string[];
}

// =============================================================================
// Service
// =============================================================================

export class FeatureFlagsService {
  private db: any;
  private cache: any;
  private auditService = getAuditService();

  constructor() {
    this.db = container.resolve<any>('Database');
    // Cache is optional - may not be available in all environments
    try {
      this.cache = container.resolve<any>('Cache');
    } catch {
      this.cache = null;
    }
  }

  // ===========================================================================
  // Flag Catalog Management (SaaS Admin operations)
  // ===========================================================================

  /**
   * Get all flags from the catalog
   */
  async getCatalog(): Promise<FeatureFlagCatalog[]> {
    const cached = await this.getFromCache<FeatureFlagCatalog[]>('feature-flags:catalog');
    if (cached) return cached;

    const flags = await this.db
      .select()
      .from(featureFlagsCatalog)
      .where(eq(featureFlagsCatalog.status, 'active'));

    await this.setCache('feature-flags:catalog', flags, 3600); // 1 hour cache
    return flags;
  }

  /**
   * Get a single flag from the catalog by key
   */
  async getCatalogFlag(key: string): Promise<FeatureFlagCatalog | null> {
    const [flag] = await this.db
      .select()
      .from(featureFlagsCatalog)
      .where(eq(featureFlagsCatalog.key, key))
      .limit(1);

    return flag || null;
  }

  /**
   * Get catalog flag or throw NotFoundError
   */
  async getCatalogFlagOrFail(key: string): Promise<FeatureFlagCatalog> {
    const flag = await this.getCatalogFlag(key);
    if (!flag) {
      throw new NotFoundError('Feature flag', key);
    }
    return flag;
  }

  // ===========================================================================
  // Tenant Flag Management
  // ===========================================================================

  /**
   * Get all tenant-level flag overrides
   */
  async getTenantFlags(tenantId: string): Promise<TenantFeatureFlag[]> {
    const cacheKey = `feature-flags:tenant:${tenantId}`;
    const cached = await this.getFromCache<TenantFeatureFlag[]>(cacheKey);
    if (cached) return cached;

    const flags = await this.db
      .select()
      .from(tenantFeatureFlags)
      .where(eq(tenantFeatureFlags.tenantId, tenantId));

    await this.setCache(cacheKey, flags, 300); // 5 minute cache
    return flags;
  }

  /**
   * Set a tenant-level flag override
   */
  async setTenantFlag(
    tenantId: string,
    flagKey: string,
    input: FlagUpdateInput,
    context: { userId?: string; ipAddress?: string; userAgent?: string }
  ): Promise<TenantFeatureFlag> {
    // Verify flag exists in catalog
    const catalogFlag = await this.getCatalogFlagOrFail(flagKey);

    // Check if override already exists
    const [existing] = await this.db
      .select()
      .from(tenantFeatureFlags)
      .where(
        and(
          eq(tenantFeatureFlags.tenantId, tenantId),
          eq(tenantFeatureFlags.featureFlagId, catalogFlag.id)
        )
      )
      .limit(1);

    let result: TenantFeatureFlag;
    const auditMetadata: Record<string, unknown> = {
      flagKey,
      previousValue: existing?.value,
      previousEnabled: existing?.enabled,
      newValue: input.value,
      newEnabled: input.enabled,
      reason: input.reason,
    };

    if (existing) {
      // Update existing override
      [result] = await this.db
        .update(tenantFeatureFlags)
        .set({
          value: input.value,
          enabled: input.enabled,
          reason: input.reason,
          updatedAt: new Date(),
        })
        .where(eq(tenantFeatureFlags.id, existing.id))
        .returning();

      await this.auditService.log({
        tenantId,
        userId: context.userId,
        action: 'update',
        resource: 'feature_flag',
        resourceId: flagKey,
        metadata: auditMetadata,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });
    } else {
      // Create new override
      [result] = await this.db
        .insert(tenantFeatureFlags)
        .values({
          tenantId,
          featureFlagId: catalogFlag.id,
          value: input.value,
          enabled: input.enabled,
          reason: input.reason,
          createdBy: context.userId,
        })
        .returning();

      await this.auditService.log({
        tenantId,
        userId: context.userId,
        action: 'create',
        resource: 'feature_flag',
        resourceId: flagKey,
        metadata: auditMetadata,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });
    }

    // Invalidate cache
    await this.invalidateTenantFlagsCache(tenantId);

    return result;
  }

  /**
   * Bulk update tenant flags
   */
  async setTenantFlagsBulk(
    tenantId: string,
    updates: BulkFlagUpdate,
    context: { userId?: string; ipAddress?: string; userAgent?: string }
  ): Promise<TenantFeatureFlag[]> {
    const results: TenantFeatureFlag[] = [];

    for (const [flagKey, input] of Object.entries(updates)) {
      const result = await this.setTenantFlag(tenantId, flagKey, input, context);
      results.push(result);
    }

    return results;
  }

  /**
   * Remove a tenant-level flag override (revert to catalog default)
   */
  async removeTenantFlag(
    tenantId: string,
    flagKey: string,
    context: { userId?: string; ipAddress?: string; userAgent?: string }
  ): Promise<void> {
    const catalogFlag = await this.getCatalogFlagOrFail(flagKey);

    const [deleted] = await this.db
      .delete(tenantFeatureFlags)
      .where(
        and(
          eq(tenantFeatureFlags.tenantId, tenantId),
          eq(tenantFeatureFlags.featureFlagId, catalogFlag.id)
        )
      )
      .returning();

    if (deleted) {
      await this.auditService.log({
        tenantId,
        userId: context.userId,
        action: 'delete',
        resource: 'feature_flag',
        resourceId: flagKey,
        severity: 'warning',
        metadata: { flagKey, removedValue: deleted.value, removedEnabled: deleted.enabled },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });

      await this.invalidateTenantFlagsCache(tenantId);
    }
  }

  // ===========================================================================
  // Organization Flag Management
  // ===========================================================================

  /**
   * Get all organization-level flag overrides
   */
  async getOrgFlags(organizationId: string): Promise<OrgFeatureFlag[]> {
    const cacheKey = `feature-flags:org:${organizationId}`;
    const cached = await this.getFromCache<OrgFeatureFlag[]>(cacheKey);
    if (cached) return cached;

    const flags = await this.db
      .select()
      .from(orgFeatureFlags)
      .where(eq(orgFeatureFlags.organizationId, organizationId));

    await this.setCache(cacheKey, flags, 300); // 5 minute cache
    return flags;
  }

  /**
   * Set an organization-level flag override
   * Note: Org-level can only RESTRICT (disable), never EXPAND beyond tenant-level
   */
  async setOrgFlag(
    tenantId: string,
    organizationId: string,
    flagKey: string,
    input: FlagUpdateInput,
    context: { userId?: string; ipAddress?: string; userAgent?: string }
  ): Promise<OrgFeatureFlag> {
    const catalogFlag = await this.getCatalogFlagOrFail(flagKey);

    // Verify org can only restrict, not expand
    const resolvedTenantFlag = await this.evaluateFlag(flagKey, { tenantId });
    if (input.enabled && !resolvedTenantFlag.enabled) {
      throw new ForbiddenError(
        'Organization-level flags can only restrict access, not expand beyond tenant-level permissions'
      );
    }

    // Check if override already exists
    const [existing] = await this.db
      .select()
      .from(orgFeatureFlags)
      .where(
        and(
          eq(orgFeatureFlags.organizationId, organizationId),
          eq(orgFeatureFlags.featureFlagId, catalogFlag.id)
        )
      )
      .limit(1);

    let result: OrgFeatureFlag;
    const auditMetadata: Record<string, unknown> = {
      flagKey,
      organizationId,
      previousValue: existing?.value,
      previousEnabled: existing?.enabled,
      newValue: input.value,
      newEnabled: input.enabled,
      reason: input.reason,
    };

    if (existing) {
      [result] = await this.db
        .update(orgFeatureFlags)
        .set({
          value: input.value,
          enabled: input.enabled,
          reason: input.reason,
          updatedAt: new Date(),
        })
        .where(eq(orgFeatureFlags.id, existing.id))
        .returning();

      await this.auditService.log({
        tenantId,
        userId: context.userId,
        action: 'update',
        resource: 'org_feature_flag',
        resourceId: flagKey,
        metadata: auditMetadata,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });
    } else {
      [result] = await this.db
        .insert(orgFeatureFlags)
        .values({
          organizationId,
          featureFlagId: catalogFlag.id,
          value: input.value,
          enabled: input.enabled,
          reason: input.reason,
          createdBy: context.userId,
        })
        .returning();

      await this.auditService.log({
        tenantId,
        userId: context.userId,
        action: 'create',
        resource: 'org_feature_flag',
        resourceId: flagKey,
        metadata: auditMetadata,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });
    }

    await this.invalidateOrgFlagsCache(organizationId);

    return result;
  }

  /**
   * Remove an organization-level flag override
   */
  async removeOrgFlag(
    tenantId: string,
    organizationId: string,
    flagKey: string,
    context: { userId?: string; ipAddress?: string; userAgent?: string }
  ): Promise<void> {
    const catalogFlag = await this.getCatalogFlagOrFail(flagKey);

    const [deleted] = await this.db
      .delete(orgFeatureFlags)
      .where(
        and(
          eq(orgFeatureFlags.organizationId, organizationId),
          eq(orgFeatureFlags.featureFlagId, catalogFlag.id)
        )
      )
      .returning();

    if (deleted) {
      await this.auditService.log({
        tenantId,
        userId: context.userId,
        action: 'delete',
        resource: 'org_feature_flag',
        resourceId: flagKey,
        severity: 'warning',
        metadata: {
          flagKey,
          organizationId,
          removedValue: deleted.value,
          removedEnabled: deleted.enabled,
        },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });

      await this.invalidateOrgFlagsCache(organizationId);
    }
  }

  // ===========================================================================
  // Flag Evaluation (Core Resolution Logic)
  // ===========================================================================

  /**
   * Evaluate a single flag with full override resolution
   *
   * Resolution order:
   * 1. If org context provided, check org-level override
   * 2. Check tenant-level override
   * 3. Fall back to catalog default
   */
  async evaluateFlag(flagKey: string, context: FlagEvaluationContext): Promise<ResolvedFlag> {
    const catalogFlag = await this.getCatalogFlagOrFail(flagKey);

    // Start with catalog default
    let resolved: ResolvedFlag = {
      key: flagKey,
      value: catalogFlag.defaultValue,
      enabled: catalogFlag.defaultValue === true || (typeof catalogFlag.defaultValue === 'object' && catalogFlag.defaultValue !== null),
      source: 'catalog',
      category: catalogFlag.category,
      metadata: catalogFlag.metadata as Record<string, unknown> | undefined,
    };

    // Apply tenant-level override if exists
    const tenantFlags = await this.getTenantFlags(context.tenantId);
    const tenantOverride = tenantFlags.find((tf) => tf.featureFlagId === catalogFlag.id);

    if (tenantOverride) {
      resolved = {
        ...resolved,
        value: tenantOverride.value,
        enabled: tenantOverride.enabled,
        source: 'tenant',
      };
    }

    // Apply org-level override if exists (can only restrict)
    if (context.organizationId) {
      const orgFlags = await this.getOrgFlags(context.organizationId);
      const orgOverride = orgFlags.find((of) => of.featureFlagId === catalogFlag.id);

      if (orgOverride) {
        // Org can only disable, not enable beyond tenant level
        const orgEnabled = orgOverride.enabled && resolved.enabled;
        resolved = {
          ...resolved,
          value: orgOverride.value,
          enabled: orgEnabled,
          source: 'organization',
        };
      }
    }

    return resolved;
  }

  /**
   * Evaluate multiple flags at once
   */
  async evaluateFlags(flagKeys: string[], context: FlagEvaluationContext): Promise<ResolvedFlag[]> {
    return Promise.all(flagKeys.map((key) => this.evaluateFlag(key, context)));
  }

  /**
   * Evaluate all flags for a given context and return a projection
   */
  async getCapabilityProjection(context: FlagEvaluationContext): Promise<FeatureFlagsProjection> {
    const catalog = await this.getCatalog();
    const resolvedFlags: Record<string, ResolvedFlag> = {};
    const categories: Record<string, ResolvedFlag[]> = {};
    const enabledFlags: string[] = [];
    const disabledFlags: string[] = [];

    // Resolve all flags
    for (const catalogFlag of catalog) {
      const resolved = await this.evaluateFlag(catalogFlag.key, context);
      resolvedFlags[catalogFlag.key] = resolved;

      // Group by category
      if (!categories[resolved.category]) {
        categories[resolved.category] = [];
      }
      categories[resolved.category].push(resolved);

      // Track enabled/disabled
      if (resolved.enabled) {
        enabledFlags.push(catalogFlag.key);
      } else {
        disabledFlags.push(catalogFlag.key);
      }
    }

    return {
      flags: resolvedFlags,
      categories,
      enabledFlags,
      disabledFlags,
    };
  }

  /**
   * Quick check if a specific flag is enabled
   * Convenience method for policy enforcement
   */
  async isFlagEnabled(flagKey: string, context: FlagEvaluationContext): Promise<boolean> {
    const resolved = await this.evaluateFlag(flagKey, context);
    return resolved.enabled;
  }

  /**
   * Check multiple flags at once
   */
  async areFlagsEnabled(
    flagKeys: string[],
    context: FlagEvaluationContext
  ): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    for (const key of flagKeys) {
      results[key] = await this.isFlagEnabled(key, context);
    }
    return results;
  }

  /**
   * Require a flag to be enabled, throw ForbiddenError if not
   * Use in controllers/middleware for policy enforcement
   */
  async requireFlag(flagKey: string, context: FlagEvaluationContext): Promise<void> {
    const enabled = await this.isFlagEnabled(flagKey, context);
    if (!enabled) {
      throw new ForbiddenError(`Feature '${flagKey}' is not enabled for this tenant`);
    }
  }

  // ===========================================================================
  // Cache Management
  // ===========================================================================

  private async getFromCache<T>(key: string): Promise<T | null> {
    if (!this.cache) return null;
    try {
      return await this.cache.get(key);
    } catch {
      return null;
    }
  }

  private async setCache(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    if (!this.cache) return;
    try {
      await this.cache.set(key, value, ttlSeconds);
    } catch {
      // Silently fail cache writes
    }
  }

  private async deleteCache(key: string): Promise<void> {
    if (!this.cache) return;
    try {
      await this.cache.delete(key);
    } catch {
      // Silently fail cache deletes
    }
  }

  private async invalidateTenantFlagsCache(tenantId: string): Promise<void> {
    await this.deleteCache(`feature-flags:tenant:${tenantId}`);
  }

  private async invalidateOrgFlagsCache(organizationId: string): Promise<void> {
    await this.deleteCache(`feature-flags:org:${organizationId}`);
  }

  /**
   * Invalidate all caches (use after catalog updates)
   */
  async invalidateAllCaches(): Promise<void> {
    await this.deleteCache('feature-flags:catalog');
    // Note: Tenant and org caches will expire naturally or need tenant/org IDs
  }
}

// =============================================================================
// Singleton Instance
// =============================================================================

let featureFlagsServiceInstance: FeatureFlagsService | null = null;

export function getFeatureFlagsService(): FeatureFlagsService {
  if (!featureFlagsServiceInstance) {
    featureFlagsServiceInstance = new FeatureFlagsService();
  }
  return featureFlagsServiceInstance;
}

/**
 * Reset singleton for testing
 */
export function resetFeatureFlagsService(): void {
  featureFlagsServiceInstance = null;
}
