/**
 * Tenant Service
 * Tenant management, subscriptions, and licenses (TenantAdmin only)
 */
import { getClient } from '../core/client-factory';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  settings: Record<string, unknown>;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  tenantId: string;
  plan: 'free' | 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export interface License {
  id: string;
  tenantId: string;
  type: string;
  features: string[];
  maxUsers: number;
  maxListings: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

export interface TenantStats {
  usersCount: number;
  listingsCount: number;
  bookingsCount: number;
  monthlyRevenue: number;
  storageUsed: number;
}

export interface UpdateTenantDTO {
  name?: string;
  domain?: string;
  settings?: Record<string, unknown>;
}

class TenantService {
  private basePath = '/api/tenants';

  /**
   * Get current tenant details
   */
  async getCurrent(): Promise<{ data: Tenant }> {
    return getClient().get<{ data: Tenant }>(`${this.basePath}/current`);
  }

  /**
   * Update tenant details
   */
  async update(data: UpdateTenantDTO): Promise<{ data: Tenant }> {
    return getClient().put<{ data: Tenant }>(`${this.basePath}/current`, data);
  }

  /**
   * Get subscription details
   */
  async getSubscription(): Promise<{ data: Subscription }> {
    return getClient().get<{ data: Subscription }>(`${this.basePath}/subscription`);
  }

  /**
   * Get license details
   */
  async getLicense(): Promise<{ data: License }> {
    return getClient().get<{ data: License }>(`${this.basePath}/license`);
  }

  /**
   * Get tenant statistics
   */
  async getStats(): Promise<{ data: TenantStats }> {
    return getClient().get<{ data: TenantStats }>(`${this.basePath}/stats`);
  }

  /**
   * Upgrade subscription plan
   */
  async upgradePlan(plan: string): Promise<{ data: Subscription; checkoutUrl?: string }> {
    return getClient().post<{ data: Subscription; checkoutUrl?: string }>(`${this.basePath}/subscription/upgrade`, { plan });
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(): Promise<{ data: Subscription }> {
    return getClient().post<{ data: Subscription }>(`${this.basePath}/subscription/cancel`);
  }

  /**
   * Get billing portal URL
   */
  async getBillingPortalUrl(): Promise<{ url: string }> {
    return getClient().get<{ url: string }>(`${this.basePath}/billing-portal`);
  }
}

export const tenantService = new TenantService();
