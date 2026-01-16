/**
 * Tenant Admin Types
 * Single Responsibility: Tenant-scoped administration types for capabilities,
 * subscription, branding, and integrations management
 */

// =============================================================================
// Seat Limits & Usage
// =============================================================================

/** Tenant admin seat limits configuration */
export interface TenantAdminSeatLimits {
  maxUsers: number;
  maxOrganizations: number;
  maxListings: number;
  maxBookingsPerMonth: number;
  maxStorageMb: number;
}

/** Tenant usage statistics */
export interface TenantAdminUsageStats {
  currentUsers: number;
  currentOrganizations: number;
  currentListings: number;
  bookingsThisMonth: number;
  storageMb: number;
}

// =============================================================================
// Capabilities & Actions
// =============================================================================

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
  usage: TenantAdminUsageStats;
}

// =============================================================================
// Subscription DTOs
// =============================================================================

/** Tenant subscription details */
export interface TenantAdminSubscription {
  tenantId: string;
  planId: string | null;
  planName: string | null;
  status: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  seatLimits: TenantAdminSeatLimits;
  usage: TenantAdminUsageStats;
}

// =============================================================================
// Feature Flags DTOs
// =============================================================================

/** Tenant feature flags (read-only) */
export interface TenantAdminFlags {
  tenantId: string;
  flags: Record<string, boolean>;
  lastUpdated: string | null;
}

// =============================================================================
// Branding DTOs
// =============================================================================

/** Tenant branding configuration */
export interface TenantAdminBranding {
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

// =============================================================================
// Integration DTOs
// =============================================================================

/** Integration provider type */
export type IntegrationProvider = 'visma' | 'rco' | 'acos' | 'outlook' | 'vipps';

/** Tenant integration status */
export interface TenantAdminIntegration {
  provider: string;
  enabled: boolean;
  configured: boolean;
  lastSync: string | null;
  maskedApiKey: string | null;
}

// =============================================================================
// Request DTOs
// =============================================================================

/** Update branding request */
export interface UpdateTenantBrandingRequest {
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  name?: string;
  description?: string;
  faviconUrl?: string;
}

/** Update integration request */
export interface UpdateTenantIntegrationRequest {
  enabled: boolean;
  apiKey?: string;
  apiSecret?: string;
  webhookUrl?: string;
  settings?: Record<string, unknown>;
}

// =============================================================================
// Response Wrappers
// =============================================================================

/** Capabilities response */
export interface TenantAdminCapabilitiesResponse {
  capabilities: TenantAdminCapabilities;
}

/** Subscription response */
export interface TenantAdminSubscriptionResponse {
  subscription: TenantAdminSubscription;
}

/** Flags response */
export interface TenantAdminFlagsResponse {
  flags: TenantAdminFlags;
}

/** Branding response */
export interface TenantAdminBrandingResponse {
  branding: TenantAdminBranding;
}

/** Integration response */
export interface TenantAdminIntegrationResponse {
  integration: TenantAdminIntegration;
}

/** Integrations list response */
export interface TenantAdminIntegrationsResponse {
  data: TenantAdminIntegration[];
  meta: {
    total: number;
  };
}
