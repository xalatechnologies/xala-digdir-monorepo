/**
 * Tenant Admin Service
 * Tenant-scoped administration for branding, integrations, and capability management
 * Required roles: TENANT_ADMIN, TENANT_BILLING_ADMIN, TENANT_TECH_ADMIN
 */
import { getClient } from '@/core/client-factory';
import type {
  TenantAdminFlags as TenantFlags,
  TenantAdminIntegrationsResponse as TenantIntegrationsResponse,
  UpdateTenantBrandingRequest as UpdateBrandingRequest,
  UpdateTenantIntegrationRequest as UpdateIntegrationRequest,
  TenantAdminCapabilitiesResponse as CapabilitiesResponse,
  TenantAdminSubscriptionResponse as SubscriptionResponse,
  TenantAdminBrandingResponse as BrandingResponse,
  TenantAdminIntegrationResponse as IntegrationResponse,
} from '@/types/tenant-admin';

// ============================================================================
// Service Implementation
// ============================================================================

class TenantAdminService {
  private basePath = '/api/tenant';

  // -------------------------------------------------------------------------
  // Capabilities
  // -------------------------------------------------------------------------

  /**
   * Get current tenant admin capabilities
   * Returns role, permissions, allowed actions, feature flags, seat limits, and usage
   */
  async getCapabilities(): Promise<CapabilitiesResponse> {
    return getClient().get<CapabilitiesResponse>(`${this.basePath}/me/capabilities`);
  }

  // -------------------------------------------------------------------------
  // Subscription
  // -------------------------------------------------------------------------

  /**
   * Get current tenant subscription details (read-only)
   * Returns plan info, seat limits, and current usage
   */
  async getSubscription(): Promise<SubscriptionResponse> {
    return getClient().get<SubscriptionResponse>(`${this.basePath}/me/subscription`);
  }

  // -------------------------------------------------------------------------
  // Feature Flags
  // -------------------------------------------------------------------------

  /**
   * Get current tenant feature flags (read-only)
   * Tenant admins can view but not modify feature flags
   */
  async getFlags(): Promise<TenantFlags> {
    return getClient().get<TenantFlags>(`${this.basePath}/me/flags`);
  }

  // -------------------------------------------------------------------------
  // Branding
  // -------------------------------------------------------------------------

  /**
   * Get current tenant branding configuration
   */
  async getBranding(): Promise<BrandingResponse> {
    return getClient().get<BrandingResponse>(`${this.basePath}/me/branding`);
  }

  /**
   * Update tenant branding configuration
   * @param data - Branding updates (logo, colors, name, etc.)
   */
  async updateBranding(data: UpdateBrandingRequest): Promise<BrandingResponse> {
    return getClient().put<BrandingResponse>(`${this.basePath}/me/branding`, data);
  }

  // -------------------------------------------------------------------------
  // Integrations
  // -------------------------------------------------------------------------

  /**
   * Get list of all integrations with their status
   * API keys are masked for security
   */
  async getIntegrations(): Promise<TenantIntegrationsResponse> {
    return getClient().get<TenantIntegrationsResponse>(`${this.basePath}/me/integrations`);
  }

  /**
   * Configure an integration
   * @param provider - Integration provider (visma, rco, acos, outlook, vipps)
   * @param data - Integration configuration
   */
  async updateIntegration(provider: string, data: UpdateIntegrationRequest): Promise<IntegrationResponse> {
    return getClient().put<IntegrationResponse>(`${this.basePath}/me/integrations/${provider}`, data);
  }
}

// Singleton instance
export const tenantAdminService = new TenantAdminService();
