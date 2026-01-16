/**
 * Capability Projection Service
 * Aggregates all entitlements, permissions, and capabilities for a user context
 *
 * Returns comprehensive projections including:
 * - User info (roles, tenant_id, org memberships)
 * - Resolved feature flags
 * - Seat limits (current usage vs max limits)
 * - Allowed categories
 * - Allowed integrations
 * - RBAC permissions
 */
import { container } from '../../core/container';
import { NotFoundError, ForbiddenError } from '../../core/errors/problem-details';
import { getAuditService } from '../../core/audit/audit.service';
import {
  getFeatureFlagsService,
  type FeatureFlagsProjection,
  type FlagEvaluationContext,
} from '../feature-flags/feature-flags.service';
import {
  getPermissionsForRole,
  getCapabilityProjection as getRoleCapabilities,
  isSaasRole,
  isTenantRole,
  isCommuneRole,
  isOrgRole,
  getRoleLevel,
  getRoleDisplayName,
  type Role,
} from '../auth/rbac';
import {
  tenants,
  organizations,
  users,
  plans,
  subscriptions,
  categoryEntitlements,
  listings,
  bookings,
  type Tenant,
  type Organization,
  type User,
  type Plan,
  type Subscription,
  type CategoryEntitlement,
} from '../../database/schema/index';
import { eq, and, count, sql } from 'drizzle-orm';

// =============================================================================
// Types
// =============================================================================

/**
 * Seat limits configuration
 */
export interface SeatLimits {
  maxUsers: number;
  maxOrganizations: number;
  maxListings: number;
  maxBookingsPerMonth: number;
  maxStorageMb: number;
}

/**
 * Current usage stats
 */
export interface UsageStats {
  currentUsers: number;
  currentOrganizations: number;
  currentListings: number;
  currentMonthBookings: number;
  currentStorageMb: number;
}

/**
 * Limit status for a single limit
 */
export interface LimitStatus {
  current: number;
  max: number;
  percentage: number;
  isNearLimit: boolean; // >= 80%
  isAtLimit: boolean; // >= 100%
}

/**
 * All seat limits with status
 */
export interface SeatLimitsStatus {
  users: LimitStatus;
  organizations: LimitStatus;
  listings: LimitStatus;
  bookingsPerMonth: LimitStatus;
  storageMb: LimitStatus;
}

/**
 * Organization membership info
 */
export interface OrgMembership {
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  role: string;
  permissions: string[];
}

/**
 * Allowed category entitlement
 */
export interface CategoryCapability {
  category: string;
  enabled: boolean;
  restrictions?: Record<string, unknown>;
  source: 'tenant' | 'organization' | 'plan';
}

/**
 * Integration capability status
 */
export interface IntegrationCapability {
  provider: string;
  enabled: boolean;
  configured: boolean;
  reason?: string;
}

/**
 * Full capability projection for a user
 */
export interface CapabilityProjection {
  // User identity
  userId: string;
  email: string;
  name: string;
  role: string;
  roleDisplayName: string;
  roleLevel: string;

  // Tenant context
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  tenantStatus: string;

  // Organization memberships
  organizations: OrgMembership[];
  currentOrganizationId?: string;

  // Subscription info
  subscription: {
    planId?: string;
    planName: string;
    planSlug: string;
    status: string;
    trialEndsAt?: string;
    currentPeriodEnd?: string;
  };

  // Seat limits
  seatLimits: SeatLimitsStatus;

  // RBAC permissions
  permissions: string[];

  // Feature flags (resolved)
  featureFlags: FeatureFlagsProjection;

  // Category entitlements
  allowedCategories: CategoryCapability[];

  // Integration capabilities
  integrations: IntegrationCapability[];

  // Computed capabilities
  canManageUsers: boolean;
  canManageOrganizations: boolean;
  canManageListings: boolean;
  canManageBookings: boolean;
  canAccessBilling: boolean;
  canConfigureIntegrations: boolean;
  canConfigureBranding: boolean;

  // Metadata
  generatedAt: string;
}

/**
 * SaaS admin capability projection (platform-wide view)
 */
export interface SaasCapabilityProjection {
  userId: string;
  email: string;
  name: string;
  role: string;
  roleDisplayName: string;
  permissions: string[];

  // Platform stats
  platformStats: {
    totalTenants: number;
    activeTenants: number;
    suspendedTenants: number;
    totalUsers: number;
    totalOrganizations: number;
  };

  // Admin capabilities
  canManageTenants: boolean;
  canManagePlans: boolean;
  canManageFeatureFlags: boolean;
  canViewBilling: boolean;
  canRotateLicenses: boolean;
  canManageSecrets: boolean;
  canViewAuditLogs: boolean;

  generatedAt: string;
}

/**
 * Context for capability projection
 */
export interface CapabilityContext {
  userId: string;
  tenantId: string;
  organizationId?: string;
  role: string;
  ipAddress?: string;
  userAgent?: string;
}

// =============================================================================
// Service
// =============================================================================

export class CapabilityProjectionService {
  private db: any;
  private cache: any;
  private auditService = getAuditService();
  private featureFlagsService = getFeatureFlagsService();

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
  // Main Projection Methods
  // ===========================================================================

  /**
   * Get full capability projection for a user
   */
  async getCapabilityProjection(context: CapabilityContext): Promise<CapabilityProjection> {
    const cacheKey = `capabilities:${context.tenantId}:${context.userId}:${context.organizationId || 'none'}`;
    const cached = await this.getFromCache<CapabilityProjection>(cacheKey);
    if (cached) return cached;

    // Fetch all required data in parallel
    const [user, tenant, subscription, organizations, categoryEntitlementsList, usageStats] =
      await Promise.all([
        this.getUser(context.userId),
        this.getTenant(context.tenantId),
        this.getSubscription(context.tenantId),
        this.getUserOrganizations(context.userId, context.tenantId),
        this.getCategoryEntitlements(context.tenantId, context.organizationId),
        this.getUsageStats(context.tenantId),
      ]);

    if (!user) {
      throw new NotFoundError('User', context.userId);
    }

    if (!tenant) {
      throw new NotFoundError('Tenant', context.tenantId);
    }

    // Verify tenant is active
    if (tenant.status === 'suspended') {
      throw new ForbiddenError('Tenant account is suspended. Contact support for assistance.');
    }

    // Get the plan from subscription
    const plan = await this.getPlan(subscription?.planId);

    // Get seat limits (tenant override or plan default)
    const seatLimits = this.resolveSeatLimits(tenant, plan);
    const seatLimitsStatus = this.calculateLimitsStatus(seatLimits, usageStats);

    // Get RBAC permissions
    const permissions = getPermissionsForRole(context.role);
    const roleCapabilities = getRoleCapabilities(context.role);

    // Get feature flags projection
    const flagContext: FlagEvaluationContext = {
      tenantId: context.tenantId,
      organizationId: context.organizationId,
      userId: context.userId,
    };
    const featureFlags = await this.featureFlagsService.getCapabilityProjection(flagContext);

    // Build integrations list from feature flags and plan entitlements
    const integrations = this.buildIntegrationsCapabilities(featureFlags, plan);

    // Build allowed categories list
    const allowedCategories = this.buildCategoryCapabilities(categoryEntitlementsList, plan);

    // Build the projection
    const projection: CapabilityProjection = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: context.role,
      roleDisplayName: getRoleDisplayName(context.role),
      roleLevel: roleCapabilities.level,

      tenantId: tenant.id,
      tenantName: tenant.name,
      tenantSlug: tenant.slug,
      tenantStatus: tenant.status,

      organizations: organizations.map((org) => ({
        organizationId: org.id,
        organizationName: org.name,
        organizationSlug: org.slug,
        role: org.userRole || 'member',
        permissions: getPermissionsForRole(org.userRole || 'member'),
      })),
      currentOrganizationId: context.organizationId,

      subscription: {
        planId: plan?.id,
        planName: plan?.name || 'Free',
        planSlug: plan?.slug || 'free',
        status: subscription?.status || 'active',
        trialEndsAt: subscription?.trialEndsAt?.toISOString(),
        currentPeriodEnd: subscription?.currentPeriodEnd?.toISOString(),
      },

      seatLimits: seatLimitsStatus,
      permissions,
      featureFlags,
      allowedCategories,
      integrations,

      // Computed capabilities
      canManageUsers: permissions.some((p) => p.startsWith('users:')),
      canManageOrganizations: permissions.some((p) => p.startsWith('organizations:')),
      canManageListings: permissions.some((p) => p.startsWith('listings:')),
      canManageBookings: permissions.some((p) => p.startsWith('bookings:')),
      canAccessBilling:
        permissions.some((p) => p.includes('billing')) ||
        permissions.some((p) => p.includes('subscription')),
      canConfigureIntegrations: permissions.some((p) => p.includes('integrations:')),
      canConfigureBranding: permissions.some((p) => p.includes('branding:')),

      generatedAt: new Date().toISOString(),
    };

    // Cache for 5 minutes
    await this.setCache(cacheKey, projection, 300);

    return projection;
  }

  /**
   * Get capability projection for SaaS admin (platform-wide view)
   */
  async getSaasCapabilityProjection(context: {
    userId: string;
    role: string;
  }): Promise<SaasCapabilityProjection> {
    // Verify role is SaaS-level
    if (!isSaasRole(context.role)) {
      throw new ForbiddenError('SaaS admin capabilities require a SaaS-level role');
    }

    const cacheKey = `capabilities:saas:${context.userId}`;
    const cached = await this.getFromCache<SaasCapabilityProjection>(cacheKey);
    if (cached) return cached;

    // Fetch user info
    const [user] = await this.db.select().from(users).where(eq(users.id, context.userId)).limit(1);

    if (!user) {
      throw new NotFoundError('User', context.userId);
    }

    // Get platform stats
    const platformStats = await this.getPlatformStats();

    // Get permissions
    const permissions = getPermissionsForRole(context.role);

    const projection: SaasCapabilityProjection = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: context.role,
      roleDisplayName: getRoleDisplayName(context.role),
      permissions,

      platformStats,

      canManageTenants: permissions.some((p) => p.includes('saas:tenants:')),
      canManagePlans: permissions.some((p) => p.includes('saas:plans:')),
      canManageFeatureFlags: permissions.some((p) => p.includes('saas:feature-flags:')),
      canViewBilling: permissions.some((p) => p.includes('saas:billing:')),
      canRotateLicenses:
        permissions.some((p) => p.includes('saas:tenants:*')) ||
        permissions.some((p) => p.includes('saas:tenants:update')),
      canManageSecrets: permissions.some((p) => p.includes('saas:secrets:')),
      canViewAuditLogs: permissions.some((p) => p.includes('saas:audit:')),

      generatedAt: new Date().toISOString(),
    };

    // Cache for 5 minutes
    await this.setCache(cacheKey, projection, 300);

    return projection;
  }

  // ===========================================================================
  // Policy Enforcement Methods
  // ===========================================================================

  /**
   * Check if a user can create more users (seat limit check)
   */
  async canCreateUser(tenantId: string): Promise<{ allowed: boolean; reason?: string }> {
    const stats = await this.getUsageStats(tenantId);
    const tenant = await this.getTenant(tenantId);
    const subscription = await this.getSubscription(tenantId);
    const plan = await this.getPlan(subscription?.planId);
    const limits = this.resolveSeatLimits(tenant, plan);

    if (stats.currentUsers >= limits.maxUsers) {
      return {
        allowed: false,
        reason: `User limit reached (${stats.currentUsers}/${limits.maxUsers}). Upgrade your plan to add more users.`,
      };
    }

    return { allowed: true };
  }

  /**
   * Check if a user can create more organizations (seat limit check)
   */
  async canCreateOrganization(tenantId: string): Promise<{ allowed: boolean; reason?: string }> {
    const stats = await this.getUsageStats(tenantId);
    const tenant = await this.getTenant(tenantId);
    const subscription = await this.getSubscription(tenantId);
    const plan = await this.getPlan(subscription?.planId);
    const limits = this.resolveSeatLimits(tenant, plan);

    if (stats.currentOrganizations >= limits.maxOrganizations) {
      return {
        allowed: false,
        reason: `Organization limit reached (${stats.currentOrganizations}/${limits.maxOrganizations}). Upgrade your plan to add more organizations.`,
      };
    }

    return { allowed: true };
  }

  /**
   * Check if a user can create more listings (seat limit check)
   */
  async canCreateListing(tenantId: string): Promise<{ allowed: boolean; reason?: string }> {
    const stats = await this.getUsageStats(tenantId);
    const tenant = await this.getTenant(tenantId);
    const subscription = await this.getSubscription(tenantId);
    const plan = await this.getPlan(subscription?.planId);
    const limits = this.resolveSeatLimits(tenant, plan);

    if (stats.currentListings >= limits.maxListings) {
      return {
        allowed: false,
        reason: `Listing limit reached (${stats.currentListings}/${limits.maxListings}). Upgrade your plan to add more listings.`,
      };
    }

    return { allowed: true };
  }

  /**
   * Check if a booking can be created (monthly limit check)
   */
  async canCreateBooking(tenantId: string): Promise<{ allowed: boolean; reason?: string }> {
    const stats = await this.getUsageStats(tenantId);
    const tenant = await this.getTenant(tenantId);
    const subscription = await this.getSubscription(tenantId);
    const plan = await this.getPlan(subscription?.planId);
    const limits = this.resolveSeatLimits(tenant, plan);

    if (stats.currentMonthBookings >= limits.maxBookingsPerMonth) {
      return {
        allowed: false,
        reason: `Monthly booking limit reached (${stats.currentMonthBookings}/${limits.maxBookingsPerMonth}). Upgrade your plan for more bookings.`,
      };
    }

    return { allowed: true };
  }

  /**
   * Require a seat limit check, throw ForbiddenError if not allowed
   */
  async requireSeatLimit(
    type: 'user' | 'organization' | 'listing' | 'booking',
    tenantId: string
  ): Promise<void> {
    const checks = {
      user: () => this.canCreateUser(tenantId),
      organization: () => this.canCreateOrganization(tenantId),
      listing: () => this.canCreateListing(tenantId),
      booking: () => this.canCreateBooking(tenantId),
    };

    const result = await checks[type]();
    if (!result.allowed) {
      throw new ForbiddenError(result.reason);
    }
  }

  /**
   * Check if a category is allowed for the tenant/org
   */
  async isCategoryAllowed(
    category: string,
    tenantId: string,
    organizationId?: string
  ): Promise<boolean> {
    const entitlements = await this.getCategoryEntitlements(tenantId, organizationId);
    const categoryEntitlement = entitlements.find((e) => e.category === category);

    // If no explicit entitlement, check if it's in the plan defaults
    if (!categoryEntitlement) {
      // By default, allow unless explicitly restricted
      return true;
    }

    return categoryEntitlement.enabled;
  }

  /**
   * Require category access, throw ForbiddenError if not allowed
   */
  async requireCategoryAccess(
    category: string,
    tenantId: string,
    organizationId?: string
  ): Promise<void> {
    const allowed = await this.isCategoryAllowed(category, tenantId, organizationId);
    if (!allowed) {
      throw new ForbiddenError(`Access to category '${category}' is not enabled for this account`);
    }
  }

  // ===========================================================================
  // Data Fetching Methods
  // ===========================================================================

  private async getUser(userId: string): Promise<User | null> {
    const [user] = await this.db.select().from(users).where(eq(users.id, userId)).limit(1);

    return user || null;
  }

  private async getTenant(tenantId: string): Promise<Tenant | null> {
    const [tenant] = await this.db.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1);

    return tenant || null;
  }

  private async getSubscription(tenantId: string): Promise<Subscription | null> {
    const [subscription] = await this.db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.tenantId, tenantId))
      .limit(1);

    return subscription || null;
  }

  private async getPlan(planId?: string | null): Promise<Plan | null> {
    if (!planId) return null;

    const [plan] = await this.db.select().from(plans).where(eq(plans.id, planId)).limit(1);

    return plan || null;
  }

  private async getUserOrganizations(
    userId: string,
    tenantId: string
  ): Promise<(Organization & { userRole?: string })[]> {
    // Get organizations where the user is a member
    // For simplicity, we get all orgs in the tenant
    // In a real implementation, you'd have a user_organizations junction table
    const orgs = await this.db
      .select()
      .from(organizations)
      .where(eq(organizations.tenantId, tenantId));

    // Get user's role in each org (from users table organizationId)
    const [user] = await this.db.select().from(users).where(eq(users.id, userId)).limit(1);

    return orgs.map((org: Organization) => ({
      ...org,
      userRole: user?.organizationId === org.id ? user.role : 'member',
    }));
  }

  private async getCategoryEntitlements(
    tenantId: string,
    organizationId?: string
  ): Promise<CategoryEntitlement[]> {
    const conditions = [eq(categoryEntitlements.tenantId, tenantId)];

    if (organizationId) {
      // Also get org-level entitlements
      const [tenantEntitlements, orgEntitlements] = await Promise.all([
        this.db.select().from(categoryEntitlements).where(eq(categoryEntitlements.tenantId, tenantId)),
        this.db
          .select()
          .from(categoryEntitlements)
          .where(eq(categoryEntitlements.organizationId, organizationId)),
      ]);

      // Merge: org-level can only restrict, not expand
      const merged: CategoryEntitlement[] = [...tenantEntitlements];
      for (const orgEnt of orgEntitlements) {
        const existing = merged.find((e) => e.category === orgEnt.category);
        if (existing) {
          // Org can only disable, not enable
          if (!orgEnt.enabled) {
            existing.enabled = false;
          }
        } else {
          merged.push(orgEnt);
        }
      }
      return merged;
    }

    return this.db.select().from(categoryEntitlements).where(conditions[0]);
  }

  private async getUsageStats(tenantId: string): Promise<UsageStats> {
    const cacheKey = `usage:${tenantId}`;
    const cached = await this.getFromCache<UsageStats>(cacheKey);
    if (cached) return cached;

    // Get current month start
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Count users, orgs, listings, and this month's bookings in parallel
    const [usersCount, orgsCount, listingsCount, bookingsCount] = await Promise.all([
      this.db
        .select({ count: count() })
        .from(users)
        .where(eq(users.tenantId, tenantId)),
      this.db
        .select({ count: count() })
        .from(organizations)
        .where(eq(organizations.tenantId, tenantId)),
      this.db
        .select({ count: count() })
        .from(listings)
        .where(eq(listings.tenantId, tenantId)),
      this.db
        .select({ count: count() })
        .from(bookings)
        .where(
          and(
            eq(bookings.tenantId, tenantId),
            sql`${bookings.createdAt} >= ${monthStart}`
          )
        ),
    ]);

    const stats: UsageStats = {
      currentUsers: usersCount[0]?.count || 0,
      currentOrganizations: orgsCount[0]?.count || 0,
      currentListings: listingsCount[0]?.count || 0,
      currentMonthBookings: bookingsCount[0]?.count || 0,
      currentStorageMb: 0, // TODO: Implement storage tracking
    };

    // Cache for 1 minute
    await this.setCache(cacheKey, stats, 60);

    return stats;
  }

  private async getPlatformStats(): Promise<SaasCapabilityProjection['platformStats']> {
    const cacheKey = 'capabilities:platform-stats';
    const cached = await this.getFromCache<SaasCapabilityProjection['platformStats']>(cacheKey);
    if (cached) return cached;

    const [tenantsStats, usersCount, orgsCount] = await Promise.all([
      this.db
        .select({
          total: count(),
          active: sql<number>`COUNT(*) FILTER (WHERE status = 'active')`,
          suspended: sql<number>`COUNT(*) FILTER (WHERE status = 'suspended')`,
        })
        .from(tenants),
      this.db.select({ count: count() }).from(users),
      this.db.select({ count: count() }).from(organizations),
    ]);

    const stats = {
      totalTenants: tenantsStats[0]?.total || 0,
      activeTenants: tenantsStats[0]?.active || 0,
      suspendedTenants: tenantsStats[0]?.suspended || 0,
      totalUsers: usersCount[0]?.count || 0,
      totalOrganizations: orgsCount[0]?.count || 0,
    };

    // Cache for 5 minutes
    await this.setCache(cacheKey, stats, 300);

    return stats;
  }

  // ===========================================================================
  // Helper Methods
  // ===========================================================================

  private resolveSeatLimits(tenant: Tenant | null, plan: Plan | null): SeatLimits {
    // Default limits
    const defaults: SeatLimits = {
      maxUsers: 5,
      maxOrganizations: 1,
      maxListings: 10,
      maxBookingsPerMonth: 100,
      maxStorageMb: 500,
    };

    // Plan limits (if available)
    const planLimits = (plan?.seatLimits as SeatLimits) || defaults;

    // Tenant override (if set) - use Partial since properties may not be defined
    const tenantLimits = (tenant?.seatLimits as Partial<SeatLimits>) || {};

    // Tenant limits override plan limits
    return {
      maxUsers: tenantLimits.maxUsers ?? planLimits.maxUsers ?? defaults.maxUsers,
      maxOrganizations:
        tenantLimits.maxOrganizations ?? planLimits.maxOrganizations ?? defaults.maxOrganizations,
      maxListings: tenantLimits.maxListings ?? planLimits.maxListings ?? defaults.maxListings,
      maxBookingsPerMonth:
        tenantLimits.maxBookingsPerMonth ??
        planLimits.maxBookingsPerMonth ??
        defaults.maxBookingsPerMonth,
      maxStorageMb: tenantLimits.maxStorageMb ?? planLimits.maxStorageMb ?? defaults.maxStorageMb,
    };
  }

  private calculateLimitsStatus(limits: SeatLimits, usage: UsageStats): SeatLimitsStatus {
    const calculateStatus = (current: number, max: number): LimitStatus => {
      const percentage = max > 0 ? Math.round((current / max) * 100) : 0;
      return {
        current,
        max,
        percentage,
        isNearLimit: percentage >= 80,
        isAtLimit: percentage >= 100,
      };
    };

    return {
      users: calculateStatus(usage.currentUsers, limits.maxUsers),
      organizations: calculateStatus(usage.currentOrganizations, limits.maxOrganizations),
      listings: calculateStatus(usage.currentListings, limits.maxListings),
      bookingsPerMonth: calculateStatus(usage.currentMonthBookings, limits.maxBookingsPerMonth),
      storageMb: calculateStatus(usage.currentStorageMb, limits.maxStorageMb),
    };
  }

  private buildIntegrationsCapabilities(
    featureFlags: FeatureFlagsProjection,
    plan: Plan | null
  ): IntegrationCapability[] {
    const integrationProviders = ['visma', 'rco', 'acos', 'outlook', 'vipps'];
    const planEntitlements = (plan?.entitlements as Record<string, any>) || {};
    const planIntegrations = planEntitlements.integrations || {};

    return integrationProviders.map((provider) => {
      const flagKey = `integration.${provider}`;
      const flag = featureFlags.flags[flagKey];
      const enabledByPlan = planIntegrations[provider] === true;
      const enabledByFlag = flag?.enabled === true;

      return {
        provider,
        enabled: enabledByPlan && enabledByFlag,
        configured: false, // Would check encrypted_secrets for actual configuration
        reason: !enabledByPlan
          ? 'Not included in plan'
          : !enabledByFlag
            ? 'Disabled by feature flag'
            : undefined,
      };
    });
  }

  private buildCategoryCapabilities(
    entitlements: CategoryEntitlement[],
    plan: Plan | null
  ): CategoryCapability[] {
    // Start with explicit entitlements
    const capabilities: CategoryCapability[] = entitlements.map((e) => ({
      category: e.category,
      enabled: e.enabled,
      restrictions: e.restrictions as Record<string, unknown> | undefined,
      source: e.organizationId ? 'organization' : 'tenant',
    }));

    // Add default categories if not explicitly configured
    const defaultCategories = ['SPACE', 'EQUIPMENT', 'SERVICE', 'VEHICLE'];
    for (const category of defaultCategories) {
      if (!capabilities.find((c) => c.category === category)) {
        capabilities.push({
          category,
          enabled: true, // Enabled by default unless explicitly restricted
          source: 'plan',
        });
      }
    }

    return capabilities;
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

  /**
   * Invalidate capabilities cache for a user
   */
  async invalidateUserCapabilities(userId: string, tenantId: string): Promise<void> {
    // Delete the main cache entry
    await this.deleteCache(`capabilities:${tenantId}:${userId}:none`);
    // Also invalidate usage stats as they may have changed
    await this.deleteCache(`usage:${tenantId}`);
  }

  /**
   * Invalidate all capabilities for a tenant
   */
  async invalidateTenantCapabilities(tenantId: string): Promise<void> {
    // Would need to iterate over all user cache keys
    // For now, just invalidate usage stats
    await this.deleteCache(`usage:${tenantId}`);
  }

  /**
   * Invalidate SaaS admin capabilities
   */
  async invalidateSaasCapabilities(userId: string): Promise<void> {
    await this.deleteCache(`capabilities:saas:${userId}`);
    await this.deleteCache('capabilities:platform-stats');
  }
}

// =============================================================================
// Singleton Instance
// =============================================================================

let capabilityServiceInstance: CapabilityProjectionService | null = null;

export function getCapabilityService(): CapabilityProjectionService {
  if (!capabilityServiceInstance) {
    capabilityServiceInstance = new CapabilityProjectionService();
  }
  return capabilityServiceInstance;
}

/**
 * Reset singleton for testing
 */
export function resetCapabilityService(): void {
  capabilityServiceInstance = null;
}
