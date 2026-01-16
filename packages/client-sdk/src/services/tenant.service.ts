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
   * @returns Current tenant information
   */
  async getCurrent(): Promise<{ data: Tenant }> {
    return getClient().get<{ data: Tenant }>(`${this.basePath}/current`);
  }

  /**
   * Update tenant details
   * @param data - Tenant update data (name, domain, settings)
   * @returns Updated tenant information
   */
  async update(data: UpdateTenantDTO): Promise<{ data: Tenant }> {
    return getClient().put<{ data: Tenant }>(`${this.basePath}/current`, data);
  }

  /**
   * Get subscription details
   * @returns Current subscription information including plan and status
   */
  async getSubscription(): Promise<{ data: Subscription }> {
    return getClient().get<{ data: Subscription }>(`${this.basePath}/subscription`);
  }

  /**
   * Get license details
   * @returns Current license information including features and limits
   */
  async getLicense(): Promise<{ data: License }> {
    return getClient().get<{ data: License }>(`${this.basePath}/license`);
  }

  /**
   * Get tenant statistics
   * @returns Tenant usage statistics (users, listings, bookings, revenue, storage)
   * @example
   * ```typescript
   * // Display tenant usage statistics in admin dashboard
   * const stats = await tenantService.getStats();
   * console.log(`Active users: ${stats.data.usersCount}`);
   * console.log(`Total listings: ${stats.data.listingsCount}`);
   * console.log(`Monthly revenue: ${stats.data.monthlyRevenue} NOK`);
   * console.log(`Storage used: ${stats.data.storageUsed} MB`);
   * ```
   */
  async getStats(): Promise<{ data: TenantStats }> {
    return getClient().get<{ data: TenantStats }>(`${this.basePath}/stats`);
  }

  /**
   * Upgrade subscription plan
   * @param plan - Target subscription plan (free, starter, professional, enterprise)
   * @returns Updated subscription and optional checkout URL for payment
   * @example
   * ```typescript
   * // Upgrade to professional plan
   * const result = await tenantService.upgradePlan('professional');
   * if (result.checkoutUrl) {
   *   // Redirect to Stripe checkout for payment
   *   window.location.href = result.checkoutUrl;
   * } else {
   *   console.log(`Upgraded to ${result.data.plan} plan`);
   * }
   * ```
   */
  async upgradePlan(plan: string): Promise<{ data: Subscription; checkoutUrl?: string }> {
    return getClient().post<{ data: Subscription; checkoutUrl?: string }>(`${this.basePath}/subscription/upgrade`, { plan });
  }

  /**
   * Cancel subscription
   * @returns Updated subscription with cancellation details
   */
  async cancelSubscription(): Promise<{ data: Subscription }> {
    return getClient().post<{ data: Subscription }>(`${this.basePath}/subscription/cancel`);
  }

  /**
   * Get billing portal URL
   * @returns URL to Stripe billing portal for managing subscription
   * @example
   * ```typescript
   * // Redirect user to Stripe billing portal
   * const result = await tenantService.getBillingPortalUrl();
   * window.location.href = result.url; // Opens Stripe billing portal
   * // User can view invoices, update payment method, or cancel subscription
   * ```
   */
  async getBillingPortalUrl(): Promise<{ url: string }> {
    return getClient().get<{ url: string }>(`${this.basePath}/billing-portal`);
  }
}

export const tenantService = new TenantService();
