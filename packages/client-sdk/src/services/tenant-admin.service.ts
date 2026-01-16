/**
 * Tenant Admin Service
 * Tenant-scoped administration for branding, integrations, and capability management
 * Required roles: TENANT_ADMIN, TENANT_BILLING_ADMIN, TENANT_TECH_ADMIN
 */
import { getClient } from '../core/client-factory';

// ============================================================================
// Types
// ============================================================================

/** Seat limits configuration */
export interface TenantAdminSeatLimits {
  maxUsers: number;
  maxOrganizations: number;
  maxListings: number;
  maxBookingsPerMonth: number;
  maxStorageMb: number;
}

/** Usage statistics */
export interface TenantUsageStats {
  currentUsers: number;
  currentOrganizations: number;
  currentListings: number;
  bookingsThisMonth: number;
  storageMb: number;
}

/** Allowed actions for tenant admin */
export interface TenantAdminAllowedActions {
  canViewSubscription: boolean;
  canManageBranding: boolean;
  canManageIntegrations: boolean;
  canViewFlags: boolean;
  canManageSeeds: boolean;
}

/** Tenant admin capabilities projection */
export interface TenantAdminCapabilities {
  role: string;
  level: string;
  tenantId: string;
  permissions: string[];
  allowedActions: TenantAdminAllowedActions;
  featureFlags: Record<string, boolean>;
  seatLimits: TenantAdminSeatLimits;
  usage: TenantUsageStats;
}

/** Tenant subscription details */
export interface TenantSubscription {
  tenantId: string;
  planId: string | null;
  planName: string | null;
  status: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  seatLimits: TenantAdminSeatLimits;
  usage: TenantUsageStats;
}

/** Tenant feature flags (read-only) */
export interface TenantFlags {
  tenantId: string;
  flags: Record<string, boolean>;
  lastUpdated: string | null;
}

/** Tenant branding configuration */
export interface TenantBranding {
  tenantId: string;
  logoUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  name: string;
  description: string | null;
  faviconUrl: string | null;
  version: number;
  updatedAt: string;
}

/** Tenant integration status */
export interface TenantIntegration {
  provider: string;
  enabled: boolean;
  configured: boolean;
  lastSync: string | null;
  maskedApiKey: string | null;
}

/** Integrations list response */
export interface TenantIntegrationsResponse {
  data: TenantIntegration[];
  meta: {
    total: number;
  };
}

// ============================================================================
// Request Types
// ============================================================================

/** Update branding request */
export interface UpdateBrandingRequest {
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  name?: string;
  description?: string;
  faviconUrl?: string;
}

/** Update integration request */
export interface UpdateIntegrationRequest {
  enabled: boolean;
  apiKey?: string;
  apiSecret?: string;
  webhookUrl?: string;
  settings?: Record<string, unknown>;
}

// ============================================================================
// Response Wrappers
// ============================================================================

/** Single response wrapper */
export interface SingleResponse<T> {
  data: T;
}

/** Wrapper response with named property */
export interface CapabilitiesResponse {
  capabilities: TenantAdminCapabilities;
}

export interface SubscriptionResponse {
  subscription: TenantSubscription;
}

export interface BrandingResponse {
  branding: TenantBranding;
}

export interface IntegrationResponse {
  integration: TenantIntegration;
}

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
