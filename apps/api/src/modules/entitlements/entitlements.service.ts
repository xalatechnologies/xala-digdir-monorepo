/**
 * Entitlements Service
 * Unified evaluation engine that orchestrates feature flags, modules, RBAC, and plan limits
 * 
 * Precedence Rules:
 * 1. Global kill switch (highest priority - emergency disable)
 * 2. Tenant override (tenant-specific customization)
 * 3. Plan entitlements (plan defaults)
 * 4. Module defaults (fallback)
 */

import { container } from '../../core/container';
import { eq, and, inArray, isNull, or } from 'drizzle-orm';
import { FeatureFlagsService } from '../feature-flags/feature-flags.service';
import {
  planEntitlements,
  tenantEntitlementOverrides,
  integrationConfigs,
  routePolicies,
  navPolicies,
  globalKillSwitches,
  entitlementAuditLog,
  modules,
  tenantModules,
  plans,
  subscriptions,
  tenants,
} from '../../database/schema';
import type {
  ModuleKey,
  IntegrationKey,
  FeatureKey,
  RouteKey,
  NavItemKey,
  EffectiveEntitlements,
  EntitlementEvaluationContext,
  NavItem,
  IntegrationStatus,
} from './types';

export class EntitlementsService {
  private db: any;
  private cache: any;
  private featureFlagsService: FeatureFlagsService;

  constructor() {
    this.db = container.resolve<any>('Database');
    try {
      this.cache = container.resolve<any>('Cache');
    } catch {
      this.cache = null;
    }
    this.featureFlagsService = new FeatureFlagsService();
  }

  // ===========================================================================
  // Main Evaluation Method
  // ===========================================================================

  /**
   * Evaluate effective entitlements for a session
   * This is the primary method called by GET /api/me/entitlements
   */
  async evaluateEntitlements(
    context: EntitlementEvaluationContext
  ): Promise<EffectiveEntitlements> {
    const { tenantId, userId, roles, environment } = context;

    // Check cache first
    const cacheKey = `entitlements:${tenantId}:${userId}:${environment || 'all'}`;
    const cached = await this.getFromCache<EffectiveEntitlements>(cacheKey);
    if (cached) return cached;

    // Get tenant's subscription and plan
    const subscription = await this.getTenantSubscription(tenantId);
    const planId = subscription?.planId;

    // Evaluate each entitlement type
    const [
      enabledModules,
      enabledFeatures,
      enabledIntegrations,
      integrationStatuses,
      routes,
      navItems,
    ] = await Promise.all([
      this.evaluateModules(tenantId, planId, environment),
      this.evaluateFeatures(tenantId, context.organizationId, environment),
      this.evaluateIntegrations(tenantId, planId, environment),
      this.getIntegrationStatuses(tenantId),
      this.evaluateRoutes(tenantId, roles, planId),
      this.evaluateNavItems(tenantId, roles, planId),
    ]);

    const result: EffectiveEntitlements = {
      tenantId,
      userId,
      roles,
      subscription: subscription ? {
        planId: subscription.planId,
        planName: subscription.planName,
        status: subscription.status,
        tier: subscription.tier,
      } : null,
      enabledModules,
      enabledFeatures,
      enabledIntegrations,
      integrationStatuses,
      routes,
      navItems,
      evaluatedAt: new Date().toISOString(),
      cacheUntil: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
    };

    // Cache for 5 minutes
    await this.setCache(cacheKey, result, 300);

    return result;
  }

  // ===========================================================================
  // Module Evaluation
  // ===========================================================================

  private async evaluateModules(
    tenantId: string,
    planId: string | null,
    environment?: string
  ): Promise<ModuleKey[]> {
    // 1. Get all modules
    const allModules = await this.db
      .select()
      .from(modules);

    // 2. Get global kill switches
    const killSwitches = await this.db
      .select()
      .from(globalKillSwitches)
      .where(
        and(
          eq(globalKillSwitches.keyType, 'module'),
          or(
            isNull(globalKillSwitches.environment),
            eq(globalKillSwitches.environment, environment || 'production')
          )
        )
      );

    const killedModules = new Set(
      killSwitches
        .filter(ks => !ks.enabled) // enabled=false means killed
        .map(ks => ks.key)
    );

    // 3. Get tenant overrides
    const overrides = await this.db
      .select()
      .from(tenantEntitlementOverrides)
      .where(
        and(
          eq(tenantEntitlementOverrides.tenantId, tenantId),
          eq(tenantEntitlementOverrides.keyType, 'module')
        )
      );

    const overrideMap = new Map(
      overrides.map(o => [o.key, o.enabled])
    );

    // 4. Get plan defaults
    let planDefaults = new Map<string, boolean>();
    if (planId) {
      const planEnts = await this.db
        .select()
        .from(planEntitlements)
        .where(
          and(
            eq(planEntitlements.planId, planId),
            eq(planEntitlements.keyType, 'module')
          )
        );
      planDefaults = new Map(
        planEnts.map(pe => [pe.key, pe.defaultEnabled])
      );
    }

    // 5. Get tenant-specific module settings
    const tenantMods = await this.db
      .select()
      .from(tenantModules)
      .where(eq(tenantModules.tenantId, tenantId));

    const tenantModMap = new Map(
      tenantMods.map(tm => [tm.moduleKey, tm.isEnabled])
    );

    // 6. Apply precedence rules
    const enabled: ModuleKey[] = [];

    for (const module of allModules) {
      const key = module.key as ModuleKey;

      // Rule 1: Kill switch (highest priority)
      if (killedModules.has(key)) continue;

      // Rule 2: Tenant override
      if (overrideMap.has(key)) {
        if (overrideMap.get(key)) enabled.push(key);
        continue;
      }

      // Rule 3: Tenant module setting
      if (tenantModMap.has(key)) {
        if (tenantModMap.get(key)) enabled.push(key);
        continue;
      }

      // Rule 4: Plan default
      if (planDefaults.has(key)) {
        if (planDefaults.get(key)) enabled.push(key);
        continue;
      }

      // Rule 5: Module default
      if (module.defaultEnabled) {
        enabled.push(key);
      }
    }

    return enabled;
  }

  // ===========================================================================
  // Feature Evaluation (delegates to existing FeatureFlagsService)
  // ===========================================================================

  private async evaluateFeatures(
    tenantId: string,
    organizationId: string | undefined,
    environment?: string
  ): Promise<FeatureKey[]> {
    // Get kill switches for features
    const killSwitches = await this.db
      .select()
      .from(globalKillSwitches)
      .where(
        and(
          eq(globalKillSwitches.keyType, 'feature'),
          or(
            isNull(globalKillSwitches.environment),
            eq(globalKillSwitches.environment, environment || 'production')
          )
        )
      );

    const killedFeatures = new Set(
      killSwitches
        .filter(ks => !ks.enabled)
        .map(ks => ks.key)
    );

    // Use existing feature flags service
    const flagsProjection = await this.featureFlagsService.evaluateForContext({
      tenantId,
      organizationId,
    });

    // Filter out killed features
    return flagsProjection.enabledFlags.filter(
      flag => !killedFeatures.has(flag)
    ) as FeatureKey[];
  }

  // ===========================================================================
  // Integration Evaluation
  // ===========================================================================

  private async evaluateIntegrations(
    tenantId: string,
    planId: string | null,
    environment?: string
  ): Promise<IntegrationKey[]> {
    // Similar logic to modules
    const killSwitches = await this.db
      .select()
      .from(globalKillSwitches)
      .where(
        and(
          eq(globalKillSwitches.keyType, 'integration'),
          or(
            isNull(globalKillSwitches.environment),
            eq(globalKillSwitches.environment, environment || 'production')
          )
        )
      );

    const killedIntegrations = new Set(
      killSwitches
        .filter(ks => !ks.enabled)
        .map(ks => ks.key)
    );

    const overrides = await this.db
      .select()
      .from(tenantEntitlementOverrides)
      .where(
        and(
          eq(tenantEntitlementOverrides.tenantId, tenantId),
          eq(tenantEntitlementOverrides.keyType, 'integration')
        )
      );

    const overrideMap = new Map(
      overrides.map(o => [o.key, o.enabled])
    );

    let planDefaults = new Map<string, boolean>();
    if (planId) {
      const planEnts = await this.db
        .select()
        .from(planEntitlements)
        .where(
          and(
            eq(planEntitlements.planId, planId),
            eq(planEntitlements.keyType, 'integration')
          )
        );
      planDefaults = new Map(
        planEnts.map(pe => [pe.key, pe.defaultEnabled])
      );
    }

    const enabled: IntegrationKey[] = [];
    const allIntegrationKeys = Object.values({
      RCO_LOCKS: 'RCO_LOCKS',
      ACOS_ARCHIVE: 'ACOS_ARCHIVE',
      STRIPE_PAYMENTS: 'STRIPE_PAYMENTS',
      VIPPS_PAYMENTS: 'VIPPS_PAYMENTS',
      IDPORTEN_AUTH: 'IDPORTEN_AUTH',
      ALTINN_NOTIFICATIONS: 'ALTINN_NOTIFICATIONS',
    });

    for (const key of allIntegrationKeys) {
      if (killedIntegrations.has(key)) continue;
      if (overrideMap.has(key)) {
        if (overrideMap.get(key)) enabled.push(key as IntegrationKey);
        continue;
      }
      if (planDefaults.has(key) && planDefaults.get(key)) {
        enabled.push(key as IntegrationKey);
      }
    }

    return enabled;
  }

  private async getIntegrationStatuses(
    tenantId: string
  ): Promise<Record<IntegrationKey, IntegrationStatus>> {
    const configs = await this.db
      .select()
      .from(integrationConfigs)
      .where(eq(integrationConfigs.tenantId, tenantId));

    const statuses: Record<string, IntegrationStatus> = {};

    for (const config of configs) {
      statuses[config.integrationKey] = {
        status: config.status,
        lastValidatedAt: config.lastValidatedAt?.toISOString(),
        validationError: config.validationError,
      };
    }

    return statuses as Record<IntegrationKey, IntegrationStatus>;
  }

  // ===========================================================================
  // Route Evaluation
  // ===========================================================================

  private async evaluateRoutes(
    tenantId: string,
    roles: string[],
    planId: string | null
  ): Promise<Record<RouteKey, boolean>> {
    const policies = await this.db
      .select()
      .from(routePolicies);

    const enabledModules = await this.evaluateModules(tenantId, planId);
    const enabledFeatures = await this.evaluateFeatures(tenantId, undefined);

    const routes: Record<string, boolean> = {};

    for (const policy of policies) {
      const key = policy.routeKey;

      // Public routes are always accessible
      if (policy.isPublic) {
        routes[key] = true;
        continue;
      }

      // Check role requirements
      const requiredRoles = policy.requiredRoles as string[];
      if (requiredRoles.length > 0) {
        const hasRole = requiredRoles.some(r => roles.includes(r));
        if (!hasRole) {
          routes[key] = false;
          continue;
        }
      }

      // Check module requirements
      const requiredModules = policy.requiredModules as ModuleKey[];
      if (requiredModules.length > 0) {
        const hasModules = requiredModules.every(m => enabledModules.includes(m));
        if (!hasModules) {
          routes[key] = false;
          continue;
        }
      }

      // Check feature requirements
      const requiredFeatures = policy.requiredFeatures as FeatureKey[];
      if (requiredFeatures.length > 0) {
        const hasFeatures = requiredFeatures.every(f => enabledFeatures.includes(f));
        if (!hasFeatures) {
          routes[key] = false;
          continue;
        }
      }

      routes[key] = true;
    }

    return routes as Record<RouteKey, boolean>;
  }

  // ===========================================================================
  // Navigation Evaluation
  // ===========================================================================

  private async evaluateNavItems(
    tenantId: string,
    roles: string[],
    planId: string | null
  ): Promise<Record<string, NavItem[]>> {
    const policies = await this.db
      .select()
      .from(navPolicies)
      .orderBy(navPolicies.app, navPolicies.order);

    const enabledModules = await this.evaluateModules(tenantId, planId);
    const enabledFeatures = await this.evaluateFeatures(tenantId, undefined);

    const navByApp: Record<string, NavItem[]> = {};

    for (const policy of policies) {
      // Check role requirements
      const requiredRoles = policy.requiredRoles as string[];
      if (requiredRoles.length > 0) {
        const hasRole = requiredRoles.some(r => roles.includes(r));
        if (!hasRole) continue;
      }

      // Check module requirements
      const requiredModules = policy.requiredModules as ModuleKey[];
      if (requiredModules.length > 0) {
        const hasModules = requiredModules.every(m => enabledModules.includes(m));
        if (!hasModules) continue;
      }

      // Check feature requirements
      const requiredFeatures = policy.requiredFeatures as FeatureKey[];
      if (requiredFeatures.length > 0) {
        const hasFeatures = requiredFeatures.every(f => enabledFeatures.includes(f));
        if (!hasFeatures) continue;
      }

      const navItem: NavItem = {
        key: policy.navItemKey as NavItemKey,
        labelKey: policy.labelKey,
        routeKey: policy.routeKey as RouteKey | undefined,
        iconKey: policy.iconKey || undefined,
        parentKey: policy.parentKey as NavItemKey | undefined,
        section: (policy as any).section || undefined,
        contexts: ((policy as any).contexts as string[]) || [],
        order: policy.order,
      };

      if (!navByApp[policy.app]) {
        navByApp[policy.app] = [];
      }
      navByApp[policy.app].push(navItem);
    }

    return navByApp;
  }

  // ===========================================================================
  // Helper Methods
  // ===========================================================================

  private async getTenantSubscription(tenantId: string) {
    const result = await this.db
      .select({
        planId: subscriptions.planId,
        planName: plans.name,
        status: subscriptions.status,
        tier: plans.tier,
      })
      .from(subscriptions)
      .innerJoin(plans, eq(subscriptions.planId, plans.id))
      .where(eq(subscriptions.tenantId, tenantId))
      .limit(1);

    return result[0] || null;
  }

  private async getFromCache<T>(key: string): Promise<T | null> {
    if (!this.cache) return null;
    try {
      return await this.cache.get(key);
    } catch {
      return null;
    }
  }

  private async setCache(key: string, value: any, ttl: number): Promise<void> {
    if (!this.cache) return;
    try {
      await this.cache.set(key, value, ttl);
    } catch {
      // Silent fail
    }
  }

  // ===========================================================================
  // Audit Logging
  // ===========================================================================

  async logEntitlementChange(
    tenantId: string,
    action: string,
    keyType: 'module' | 'feature' | 'integration',
    key: string,
    before: any,
    after: any,
    actorId: string,
    actorType: 'user' | 'system' | 'api' = 'user'
  ): Promise<void> {
    await this.db.insert(entitlementAuditLog).values({
      tenantId,
      action,
      keyType,
      key,
      before,
      after,
      actorId,
      actorType,
      correlationId: crypto.randomUUID(),
      metadata: {},
    });

    // Invalidate cache
    await this.invalidateCache(tenantId);
  }

  private async invalidateCache(tenantId: string): Promise<void> {
    if (!this.cache) return;
    try {
      const pattern = `entitlements:${tenantId}:*`;
      await this.cache.del(pattern);
    } catch {
      // Silent fail
    }
  }
}
