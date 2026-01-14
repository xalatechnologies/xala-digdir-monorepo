/**
 * Capabilities Types
 * Single Responsibility: All tenant capability, licensing, and activation type definitions
 * These types mirror the API projection DTOs for screen-ready usage without transformers
 */

// =============================================================================
// License Status Types
// =============================================================================

/**
 * License status enum values
 */
export type LicenseStatus = 'active' | 'trial' | 'suspended' | 'expired' | 'none';

/**
 * License code status enum values
 */
export type LicenseCodeStatus = 'active' | 'rotated' | 'revoked' | 'expired';

// =============================================================================
// Feature Flag Types
// =============================================================================

/**
 * Feature state for a specific feature flag
 */
export interface FeatureStateDTO {
  key: string;
  enabled: boolean;
  config: Record<string, unknown>;
}

/**
 * Integration provider state
 */
export interface IntegrationStateDTO {
  providerType: string;
  providerName: string;
  enabled: boolean;
  configured: boolean;
}

/**
 * Tenant features collection containing flags and integrations
 */
export interface TenantFeaturesDTO {
  flags: Record<string, FeatureStateDTO>;
  integrations: Record<string, IntegrationStateDTO[]>;
}

// =============================================================================
// Entitlement Types
// =============================================================================

/**
 * License entitlement with quota tracking
 */
export interface EntitlementDTO {
  key: string;
  enabled: boolean;
  quotaLimit: number | null;
  quotaUsed?: number;
  unlimited: boolean;
}

// =============================================================================
// License Types
// =============================================================================

/**
 * Tenant license info (screen-ready)
 */
export interface TenantLicenseDTO {
  status: LicenseStatus;
  planCode: string;
  planName: string;
  validFrom: string | null;
  validUntil: string | null;
  trialEndsAt: string | null;
  isTrialActive: boolean;
  isExpired: boolean;
  isSuspended: boolean;
  daysRemaining: number | null;
  entitlements: Record<string, EntitlementDTO>;
}

// =============================================================================
// Permissions Types
// =============================================================================

/**
 * Computed permissions based on license and features
 */
export interface TenantPermissionsDTO {
  canAccessModule: Record<string, boolean>;
  canUseFeature: Record<string, boolean>;
  canUseIntegration: Record<string, boolean>;
}

// =============================================================================
// Action Types (Capabilities-specific)
// =============================================================================

/**
 * Available action for capabilities context
 */
export interface CapabilitiesActionDTO {
  action: string;
  label: string;
  href?: string;
  enabled: boolean;
  reason?: string;
}

/**
 * Policy decision record for capabilities
 */
export interface CapabilitiesPolicyDecisionDTO {
  policy: string;
  decision: 'allow' | 'deny';
  reason: string;
}

// =============================================================================
// Main Projection DTO
// =============================================================================

/**
 * TenantCapabilitiesProjectionDTO
 * Screen-ready, no transformers needed in frontend
 * This is the single source of truth for tenant capabilities
 */
export interface TenantCapabilitiesProjectionDTO {
  tenantId: string;
  features: TenantFeaturesDTO;
  license: TenantLicenseDTO;
  permissions: TenantPermissionsDTO;
  availableActions: CapabilitiesActionDTO[];
  policyDecisions?: CapabilitiesPolicyDecisionDTO[];
}

// =============================================================================
// Input DTOs for Mutations
// =============================================================================

/**
 * Update feature flag input
 */
export interface UpdateFeatureFlagInput {
  enabled: boolean;
  config?: Record<string, unknown>;
}

/**
 * Bulk update feature flags input
 */
export interface BulkUpdateFeatureFlagsInput {
  flags: Array<{
    featureKey: string;
    enabled: boolean;
    config?: Record<string, unknown>;
  }>;
}

// =============================================================================
// License Plan Types
// =============================================================================

/**
 * License plan projection DTO (screen-ready)
 */
export interface LicensePlanProjectionDTO {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  entitlements: Array<{
    key: string;
    enabled: boolean;
    quotaLimit: number | null;
    unlimited: boolean;
  }>;
  metadata: Record<string, unknown>;
  permissions: {
    canEdit: boolean;
    canDelete: boolean;
    canAssign: boolean;
  };
  availableActions: Array<{
    action: string;
    label: string;
    enabled: boolean;
    reason?: string;
  }>;
}

/**
 * Tenant license projection DTO (screen-ready)
 */
export interface TenantLicenseProjectionDTO {
  tenantId: string;
  status: LicenseStatus;
  planCode: string;
  planName: string;
  validFrom: string | null;
  validUntil: string | null;
  trialEndsAt: string | null;
  isTrialActive: boolean;
  isExpired: boolean;
  isSuspended: boolean;
  daysRemaining: number | null;
  entitlements: Record<string, {
    key: string;
    enabled: boolean;
    quotaLimit: number | null;
    unlimited: boolean;
  }>;
  permissions: {
    canUpgrade: boolean;
    canDowngrade: boolean;
    canCancel: boolean;
    canRenew: boolean;
  };
  availableActions: Array<{
    action: string;
    label: string;
    href?: string;
    enabled: boolean;
    reason?: string;
  }>;
}

/**
 * License plan query params
 */
export interface LicensePlanQueryParams {
  isActive?: boolean;
  page?: number;
  limit?: number;
}

// =============================================================================
// License Code Types
// =============================================================================

/**
 * License code projection DTO (screen-ready)
 */
export interface LicenseCodeProjectionDTO {
  id: string;
  code: string;
  maskedCode: string;
  status: LicenseCodeStatus;
  issuedAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
  isExpired: boolean;
  isRevoked: boolean;
  daysUntilExpiry: number | null;
  activationsCount: number;
  permissions: {
    canRotate: boolean;
    canRevoke: boolean;
    canViewToken: boolean;
  };
  availableActions: Array<{
    action: string;
    label: string;
    enabled: boolean;
    reason?: string;
  }>;
}

/**
 * Issue license code input
 */
export interface IssueLicenseCodeInput {
  expiresAt?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Rotate license code input
 */
export interface RotateLicenseCodeInput {
  currentCode: string;
  expiresAt?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Revoke license code input
 */
export interface RevokeLicenseCodeInput {
  code: string;
  reason?: string;
}

/**
 * Validate license code input
 */
export interface ValidateLicenseCodeInput {
  code: string;
  environment?: string;
  appId?: string;
  moduleId?: string;
}

/**
 * Validate license code result
 */
export interface ValidateLicenseCodeResult {
  valid: boolean;
  tenantId: string;
  codeId: string;
  reason?: string;
}

// =============================================================================
// Activation Types
// =============================================================================

/**
 * Activation projection DTO (screen-ready)
 */
export interface ActivationProjectionDTO {
  id: string;
  tenantId: string;
  environment: string;
  appId: string;
  moduleId: string | null;
  activatedAt: string;
  lastVerifiedAt: string | null;
  isActive: boolean;
  permissions: {
    canDeactivate: boolean;
  };
}

/**
 * Activate license input
 */
export interface ActivateLicenseInput {
  code: string;
  environment: string;
  appId: string;
  moduleId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Activation result
 */
export interface ActivationResult {
  activation: ActivationProjectionDTO;
  capabilities: TenantCapabilitiesProjectionDTO;
}

// =============================================================================
// API Response Wrappers
// =============================================================================

/**
 * Single item response wrapper
 */
export interface CapabilitiesResponse<T> {
  data: T;
}

/**
 * List response wrapper with pagination
 */
export interface CapabilitiesListResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// =============================================================================
// Helper Types
// =============================================================================

/**
 * Feature check result
 */
export interface FeatureCheckResult {
  enabled: boolean;
  reason?: string;
}

/**
 * Entitlement check result
 */
export interface EntitlementCheckResult {
  hasEntitlement: boolean;
  quotaRemaining?: number;
  reason?: string;
}

/**
 * License verification result
 */
export interface LicenseVerificationResult {
  valid: boolean;
  status: LicenseStatus;
  reason?: string;
}
