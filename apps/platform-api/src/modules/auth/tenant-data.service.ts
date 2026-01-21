/**
 * Tenant Data Service
 * Fetches tenant subscription and feature flag data for JWT generation
 */
import { container } from '../../core/container';
import { tenants } from '../../database/schema';
import { eq } from 'drizzle-orm';
import type { TenantSubscriptionInfo } from '../../core/auth/jwt.service';

export interface TenantData {
  slug: string;
  subscription: TenantSubscriptionInfo;
  featureFlags: Record<string, unknown>;
}

export class TenantDataService {
  /**
   * Fetch tenant subscription and feature flag data
   * @param tenantId - Tenant UUID
   * @returns Tenant data for JWT payload
   */
  async getTenantData(tenantId: string): Promise<TenantData | null> {
    const db = container.resolve<any>('Database');

    const result = await db
      .select({
        slug: tenants.slug,
        status: tenants.status,
        subscriptionPlanId: tenants.subscriptionPlanId,
        seatLimits: tenants.seatLimits,
        featureFlags: tenants.featureFlags,
        enabledRentalObjectCategories: tenants.enabledRentalObjectCategories,
      })
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

    if (!result.length) {
      return null;
    }

    const tenant = result[0];

    // Build subscription info
    const subscription: TenantSubscriptionInfo = {
      planId: tenant.subscriptionPlanId || null,
      status: tenant.status,
      seatLimits: tenant.seatLimits as {
        maxUsers: number;
        maxOrganizations: number;
        maxListings: number;
        maxBookingsPerMonth: number;
        maxStorageMb: number;
      },
      enabledCategories: tenant.enabledRentalObjectCategories || [],
    };

    return {
      slug: tenant.slug,
      subscription,
      featureFlags: (tenant.featureFlags as Record<string, unknown>) || {},
    };
  }

  /**
   * Validate tenant is active and has valid subscription
   * @param tenantId - Tenant UUID
   * @returns true if tenant is valid, false otherwise
   */
  async validateTenant(tenantId: string): Promise<boolean> {
    const tenantData = await this.getTenantData(tenantId);
    
    if (!tenantData) {
      return false;
    }

    // Check if tenant is active
    if (tenantData.subscription.status !== 'active') {
      return false;
    }

    return true;
  }
}

// Singleton instance
export const tenantDataService = new TenantDataService();
