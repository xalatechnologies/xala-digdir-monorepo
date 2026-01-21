/**
 * Seat Limits Service
 * Enforces user/org/rental_object/booking limits for multi-tenant SaaS
 *
 * Returns RFC 7807 compliant errors when limits are exceeded
 */
import { container } from '../../core/container';
import { ForbiddenError, NotFoundError } from '../../core/errors/problem-details';
import { getAuditService } from '../../core/audit/audit.service';
import {
  tenants,
  users,
  organizations,
  listings,
  bookings,
  plans,
  subscriptions,
  type Tenant,
  type Plan,
  type Subscription,
} from '../../database/schema/index';
import { eq, and, count, sql } from 'drizzle-orm';

// =============================================================================
// Types
// =============================================================================

/**
 * Seat limits configuration - matches schema definition
 */
export interface SeatLimits {
  maxUsers: number;
  maxOrganizations: number;
  maxListings: number;
  maxBookingsPerMonth: number;
  maxStorageMb: number;
}

/**
 * Current usage statistics
 */
export interface UsageStats {
  currentUsers: number;
  currentOrganizations: number;
  currentListings: number;
  currentMonthBookings: number;
  currentStorageMb: number;
}

/**
 * Limit check result
 */
export interface LimitCheckResult {
  allowed: boolean;
  current: number;
  limit: number;
  remaining: number;
  reason?: string;
}

/**
 * Limit types supported
 */
export type LimitType = 'user' | 'organization' | 'listing' | 'booking' | 'storage';

/**
 * Context for limit operations
 */
export interface LimitContext {
  tenantId: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Update seat limits request
 */
export interface UpdateSeatLimitsRequest {
  maxUsers?: number;
  maxOrganizations?: number;
  maxListings?: number;
  maxBookingsPerMonth?: number;
  maxStorageMb?: number;
}

// =============================================================================
// Default Limits
// =============================================================================

const DEFAULT_SEAT_LIMITS: SeatLimits = {
  maxUsers: 5,
  maxOrganizations: 1,
  maxListings: 10,
  maxBookingsPerMonth: 100,
  maxStorageMb: 500,
};

// =============================================================================
// Service
// =============================================================================

export class SeatLimitsService {
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
  // Limit Check Methods
  // ===========================================================================

  /**
   * Check if a new user can be created (seat limit check)
   */
  async checkUserLimit(tenantId: string): Promise<LimitCheckResult> {
    const [limits, usage] = await Promise.all([
      this.getSeatLimits(tenantId),
      this.getUsageStats(tenantId),
    ]);

    const remaining = limits.maxUsers - usage.currentUsers;
    const allowed = usage.currentUsers < limits.maxUsers;

    return {
      allowed,
      current: usage.currentUsers,
      limit: limits.maxUsers,
      remaining: Math.max(0, remaining),
      reason: allowed
        ? undefined
        : `User limit reached (${usage.currentUsers}/${limits.maxUsers}). Upgrade your plan to add more users.`,
    };
  }

  /**
   * Check if a new organization can be created (seat limit check)
   */
  async checkOrgLimit(tenantId: string): Promise<LimitCheckResult> {
    const [limits, usage] = await Promise.all([
      this.getSeatLimits(tenantId),
      this.getUsageStats(tenantId),
    ]);

    const remaining = limits.maxOrganizations - usage.currentOrganizations;
    const allowed = usage.currentOrganizations < limits.maxOrganizations;

    return {
      allowed,
      current: usage.currentOrganizations,
      limit: limits.maxOrganizations,
      remaining: Math.max(0, remaining),
      reason: allowed
        ? undefined
        : `Organization limit reached (${usage.currentOrganizations}/${limits.maxOrganizations}). Upgrade your plan to add more organizations.`,
    };
  }

  /**
   * Check if a new listing/rental_object can be created (seat limit check)
   */
  async checkRentalObjectLimit(tenantId: string): Promise<LimitCheckResult> {
    const [limits, usage] = await Promise.all([
      this.getSeatLimits(tenantId),
      this.getUsageStats(tenantId),
    ]);

    const remaining = limits.maxListings - usage.currentListings;
    const allowed = usage.currentListings < limits.maxListings;

    return {
      allowed,
      current: usage.currentListings,
      limit: limits.maxListings,
      remaining: Math.max(0, remaining),
      reason: allowed
        ? undefined
        : `Rental object limit reached (${usage.currentListings}/${limits.maxListings}). Upgrade your plan to add more rental objects.`,
    };
  }

  /**
   * Check if a new booking can be created (monthly limit check)
   */
  async checkBookingLimit(tenantId: string): Promise<LimitCheckResult> {
    const [limits, usage] = await Promise.all([
      this.getSeatLimits(tenantId),
      this.getUsageStats(tenantId),
    ]);

    const remaining = limits.maxBookingsPerMonth - usage.currentMonthBookings;
    const allowed = usage.currentMonthBookings < limits.maxBookingsPerMonth;

    return {
      allowed,
      current: usage.currentMonthBookings,
      limit: limits.maxBookingsPerMonth,
      remaining: Math.max(0, remaining),
      reason: allowed
        ? undefined
        : `Monthly booking limit reached (${usage.currentMonthBookings}/${limits.maxBookingsPerMonth}). Upgrade your plan for more bookings.`,
    };
  }

  /**
   * Check if storage limit allows more uploads
   */
  async checkStorageLimit(tenantId: string, additionalMb: number = 0): Promise<LimitCheckResult> {
    const [limits, usage] = await Promise.all([
      this.getSeatLimits(tenantId),
      this.getUsageStats(tenantId),
    ]);

    const remaining = limits.maxStorageMb - usage.currentStorageMb;
    const allowed = usage.currentStorageMb + additionalMb <= limits.maxStorageMb;

    return {
      allowed,
      current: usage.currentStorageMb,
      limit: limits.maxStorageMb,
      remaining: Math.max(0, remaining),
      reason: allowed
        ? undefined
        : `Storage limit reached (${usage.currentStorageMb}/${limits.maxStorageMb} MB). Upgrade your plan for more storage.`,
    };
  }

  /**
   * Generic limit check method
   */
  async checkLimit(type: LimitType, tenantId: string): Promise<LimitCheckResult> {
    const checks = {
      user: () => this.checkUserLimit(tenantId),
      organization: () => this.checkOrgLimit(tenantId),
      listing: () => this.checkRentalObjectLimit(tenantId),
      booking: () => this.checkBookingLimit(tenantId),
      storage: () => this.checkStorageLimit(tenantId),
    };

    return checks[type]();
  }

  // ===========================================================================
  // Enforcement Methods (Throw RFC 7807 Errors)
  // ===========================================================================

  /**
   * Require user limit check, throw ForbiddenError if limit exceeded
   */
  async requireUserLimit(context: LimitContext): Promise<void> {
    const result = await this.checkUserLimit(context.tenantId);
    if (!result.allowed) {
      await this.auditLimitExceeded('user', context, result);
      throw new ForbiddenError(result.reason);
    }
  }

  /**
   * Require organization limit check, throw ForbiddenError if limit exceeded
   */
  async requireOrgLimit(context: LimitContext): Promise<void> {
    const result = await this.checkOrgLimit(context.tenantId);
    if (!result.allowed) {
      await this.auditLimitExceeded('organization', context, result);
      throw new ForbiddenError(result.reason);
    }
  }

  /**
   * Require rental object limit check, throw ForbiddenError if limit exceeded
   */
  async requireRentalObjectLimit(context: LimitContext): Promise<void> {
    const result = await this.checkRentalObjectLimit(context.tenantId);
    if (!result.allowed) {
      await this.auditLimitExceeded('listing', context, result);
      throw new ForbiddenError(result.reason);
    }
  }

  /**
   * Require booking limit check, throw ForbiddenError if limit exceeded
   */
  async requireBookingLimit(context: LimitContext): Promise<void> {
    const result = await this.checkBookingLimit(context.tenantId);
    if (!result.allowed) {
      await this.auditLimitExceeded('booking', context, result);
      throw new ForbiddenError(result.reason);
    }
  }

  /**
   * Require storage limit check, throw ForbiddenError if limit exceeded
   */
  async requireStorageLimit(context: LimitContext, additionalMb: number = 0): Promise<void> {
    const result = await this.checkStorageLimit(context.tenantId, additionalMb);
    if (!result.allowed) {
      await this.auditLimitExceeded('storage', context, result);
      throw new ForbiddenError(result.reason);
    }
  }

  /**
   * Generic require limit method
   */
  async requireLimit(type: LimitType, context: LimitContext): Promise<void> {
    const enforcers = {
      user: () => this.requireUserLimit(context),
      organization: () => this.requireOrgLimit(context),
      listing: () => this.requireRentalObjectLimit(context),
      booking: () => this.requireBookingLimit(context),
      storage: () => this.requireStorageLimit(context),
    };

    return enforcers[type]();
  }

  // ===========================================================================
  // Limit Management Methods
  // ===========================================================================

  /**
   * Get seat limits for a tenant (resolved from tenant override or plan defaults)
   */
  async getSeatLimits(tenantId: string): Promise<SeatLimits> {
    const cacheKey = `seat-limits:${tenantId}`;
    const cached = await this.getFromCache<SeatLimits>(cacheKey);
    if (cached) return cached;

    // Fetch tenant with subscription and plan in parallel
    const [tenant, subscription] = await Promise.all([
      this.getTenant(tenantId),
      this.getSubscription(tenantId),
    ]);

    if (!tenant) {
      throw new NotFoundError('Tenant', tenantId);
    }

    // Get plan if subscription exists
    const plan = subscription?.planId ? await this.getPlan(subscription.planId) : null;

    // Resolve limits: tenant override > plan > defaults
    const limits = this.resolveSeatLimits(tenant, plan);

    // Cache for 5 minutes
    await this.setCache(cacheKey, limits, 300);

    return limits;
  }

  /**
   * Update seat limits for a tenant (SaaS admin operation)
   */
  async updateSeatLimits(
    tenantId: string,
    updates: UpdateSeatLimitsRequest,
    context: LimitContext
  ): Promise<SeatLimits> {
    const tenant = await this.getTenant(tenantId);
    if (!tenant) {
      throw new NotFoundError('Tenant', tenantId);
    }

    // Merge with existing limits
    const currentLimits = (tenant.seatLimits as SeatLimits) || DEFAULT_SEAT_LIMITS;
    const newLimits: SeatLimits = {
      maxUsers: updates.maxUsers ?? currentLimits.maxUsers,
      maxOrganizations: updates.maxOrganizations ?? currentLimits.maxOrganizations,
      maxListings: updates.maxListings ?? currentLimits.maxListings,
      maxBookingsPerMonth: updates.maxBookingsPerMonth ?? currentLimits.maxBookingsPerMonth,
      maxStorageMb: updates.maxStorageMb ?? currentLimits.maxStorageMb,
    };

    // Validate limits (must be positive)
    this.validateLimits(newLimits);

    // Update tenant
    await this.db
      .update(tenants)
      .set({
        seatLimits: newLimits,
        updatedAt: new Date(),
      })
      .where(eq(tenants.id, tenantId));

    // Invalidate cache
    await this.deleteCache(`seat-limits:${tenantId}`);
    await this.deleteCache(`usage:${tenantId}`);

    // Audit log
    await this.auditService.log({
      action: 'saas.seat_limits.update',
      resource: 'tenant',
      resourceId: tenantId,
      tenantId,
      userId: context.userId,
      severity: 'warning',
      metadata: {
        previousLimits: currentLimits,
        newLimits,
        changes: updates,
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return newLimits;
  }

  /**
   * Get current usage statistics for a tenant
   */
  async getUsageStats(tenantId: string): Promise<UsageStats> {
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
      currentStorageMb: 0, // TODO: Implement storage tracking when file storage is added
    };

    // Cache for 1 minute (short TTL since counts change frequently)
    await this.setCache(cacheKey, stats, 60);

    return stats;
  }

  /**
   * Get limits and usage combined for display
   */
  async getLimitsWithUsage(tenantId: string): Promise<{
    limits: SeatLimits;
    usage: UsageStats;
    status: {
      users: LimitCheckResult;
      organizations: LimitCheckResult;
      listings: LimitCheckResult;
      bookingsPerMonth: LimitCheckResult;
      storageMb: LimitCheckResult;
    };
  }> {
    const [limits, usage] = await Promise.all([
      this.getSeatLimits(tenantId),
      this.getUsageStats(tenantId),
    ]);

    const calculateStatus = (
      current: number,
      limit: number,
      type: string
    ): LimitCheckResult => {
      const remaining = limit - current;
      const allowed = current < limit;
      return {
        allowed,
        current,
        limit,
        remaining: Math.max(0, remaining),
        reason: allowed ? undefined : `${type} limit reached (${current}/${limit})`,
      };
    };

    return {
      limits,
      usage,
      status: {
        users: calculateStatus(usage.currentUsers, limits.maxUsers, 'User'),
        organizations: calculateStatus(
          usage.currentOrganizations,
          limits.maxOrganizations,
          'Organization'
        ),
        listings: calculateStatus(usage.currentListings, limits.maxListings, 'Rental object'),
        bookingsPerMonth: calculateStatus(
          usage.currentMonthBookings,
          limits.maxBookingsPerMonth,
          'Monthly booking'
        ),
        storageMb: calculateStatus(usage.currentStorageMb, limits.maxStorageMb, 'Storage'),
      },
    };
  }

  // ===========================================================================
  // Private Helper Methods
  // ===========================================================================

  private async getTenant(tenantId: string): Promise<Tenant | null> {
    const [tenant] = await this.db
      .select()
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

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

  private async getPlan(planId: string): Promise<Plan | null> {
    const [plan] = await this.db
      .select()
      .from(plans)
      .where(eq(plans.id, planId))
      .limit(1);

    return plan || null;
  }

  private resolveSeatLimits(tenant: Tenant, plan: Plan | null): SeatLimits {
    // Plan limits (if available)
    const planLimits = (plan?.seatLimits as SeatLimits) || DEFAULT_SEAT_LIMITS;

    // Tenant override (if set) - use Partial since properties may not be defined
    const tenantLimits = (tenant.seatLimits as Partial<SeatLimits>) || {};

    // Tenant limits override plan limits
    return {
      maxUsers: tenantLimits.maxUsers ?? planLimits.maxUsers ?? DEFAULT_SEAT_LIMITS.maxUsers,
      maxOrganizations:
        tenantLimits.maxOrganizations ??
        planLimits.maxOrganizations ??
        DEFAULT_SEAT_LIMITS.maxOrganizations,
      maxListings:
        tenantLimits.maxListings ?? planLimits.maxListings ?? DEFAULT_SEAT_LIMITS.maxListings,
      maxBookingsPerMonth:
        tenantLimits.maxBookingsPerMonth ??
        planLimits.maxBookingsPerMonth ??
        DEFAULT_SEAT_LIMITS.maxBookingsPerMonth,
      maxStorageMb:
        tenantLimits.maxStorageMb ?? planLimits.maxStorageMb ?? DEFAULT_SEAT_LIMITS.maxStorageMb,
    };
  }

  private validateLimits(limits: SeatLimits): void {
    const errors: string[] = [];

    if (limits.maxUsers < 1) {
      errors.push('maxUsers must be at least 1');
    }
    if (limits.maxOrganizations < 1) {
      errors.push('maxOrganizations must be at least 1');
    }
    if (limits.maxListings < 0) {
      errors.push('maxListings cannot be negative');
    }
    if (limits.maxBookingsPerMonth < 0) {
      errors.push('maxBookingsPerMonth cannot be negative');
    }
    if (limits.maxStorageMb < 0) {
      errors.push('maxStorageMb cannot be negative');
    }

    if (errors.length > 0) {
      throw new ForbiddenError(`Invalid seat limits: ${errors.join(', ')}`);
    }
  }

  private async auditLimitExceeded(
    type: LimitType,
    context: LimitContext,
    result: LimitCheckResult
  ): Promise<void> {
    await this.auditService.log({
      action: `seat_limits.${type}.exceeded`,
      resource: 'tenant',
      resourceId: context.tenantId,
      tenantId: context.tenantId,
      userId: context.userId,
      severity: 'warning',
      metadata: {
        limitType: type,
        current: result.current,
        limit: result.limit,
        reason: result.reason,
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });
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
   * Invalidate all cached data for a tenant
   */
  async invalidateTenantCache(tenantId: string): Promise<void> {
    await Promise.all([
      this.deleteCache(`seat-limits:${tenantId}`),
      this.deleteCache(`usage:${tenantId}`),
    ]);
  }
}

// =============================================================================
// Singleton Instance
// =============================================================================

let seatLimitsServiceInstance: SeatLimitsService | null = null;

export function getSeatLimitsService(): SeatLimitsService {
  if (!seatLimitsServiceInstance) {
    seatLimitsServiceInstance = new SeatLimitsService();
  }
  return seatLimitsServiceInstance;
}

/**
 * Reset singleton for testing
 */
export function resetSeatLimitsService(): void {
  seatLimitsServiceInstance = null;
}
