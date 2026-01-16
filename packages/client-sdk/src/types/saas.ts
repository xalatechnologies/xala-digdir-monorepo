/**
 * SaaS Admin Types
 * Single Responsibility: Platform-wide SaaS administration types for tenant management,
 * subscription plans, feature flags, billing, and secrets
 */
import type { PaginatedResponse, SingleResponse } from './enums';

// =============================================================================
// Enums & Status Types
// =============================================================================

/** Tenant status enum */
export type SaasTenantStatus = 'active' | 'inactive' | 'suspended' | 'pending';

/** Plan status enum */
export type PlanStatus = 'active' | 'inactive' | 'deprecated';

/** Billing period enum */
export type BillingPeriod = 'monthly' | 'yearly' | 'lifetime';

/** Feature flag type enum */
export type FeatureFlagType = 'boolean' | 'string' | 'number';

/** Feature flag category enum */
export type FeatureFlagCategory = 'module' | 'integration' | 'policy';

/** Billing status enum */
export type BillingStatus = 'paid' | 'due' | 'overdue' | 'cancelled';

// =============================================================================
// Seat Limits & Entitlements
// =============================================================================

/** Seat limits configuration */
export interface SeatLimits {
  maxUsers: number;
  maxOrganizations: number;
  maxListings: number;
  maxBookingsPerMonth: number;
  maxStorageMb: number;
}

/** Module entitlements */
export interface ModuleEntitlements {
  rating: boolean;
  recommendations: boolean;
  feedback: boolean;
  favorites: boolean;
  share: boolean;
  recurringBookings: boolean;
}

/** Integration entitlements */
export interface IntegrationEntitlements {
  visma: boolean;
  rco: boolean;
  acos: boolean;
  outlook: boolean;
  vipps: boolean;
}

/** Feature entitlements */
export interface FeatureEntitlements {
  customBranding: boolean;
  apiAccess: boolean;
  webhooks: boolean;
  advancedReporting: boolean;
  prioritySupport: boolean;
}

/** Full entitlements configuration */
export interface Entitlements {
  modules: ModuleEntitlements;
  integrations: IntegrationEntitlements;
  features: FeatureEntitlements;
}

// =============================================================================
// Tenant DTOs
// =============================================================================

/** SaaS tenant detail */
export interface SaasTenant {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  status: SaasTenantStatus;
  subscriptionPlanId?: string;
  subscriptionPlanName?: string;
  licenseKeyFingerprint?: string;
  licenseKeyRotatedAt?: string;
  seatLimits: SeatLimits;
  settings: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/** Tenant usage statistics */
export interface TenantUsageStats {
  usersCount: number;
  organizationsCount: number;
  listingsCount: number;
  bookingsThisMonth: number;
  storageMb: number;
}

/** Tenant with usage stats */
export interface SaasTenantWithStats extends SaasTenant {
  usage: TenantUsageStats;
}

// =============================================================================
// Plan DTOs
// =============================================================================

/** Subscription plan */
export interface Plan {
  id: string;
  name: string;
  slug: string;
  description?: string;
  seatLimits: SeatLimits;
  entitlements: Entitlements;
  basePrice: number;
  currency: string;
  billingPeriod: BillingPeriod;
  trialDays: number;
  isPublic: boolean;
  status: PlanStatus;
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// Feature Flags DTOs
// =============================================================================

/** Feature flag catalog item */
export interface FeatureFlagCatalogItem {
  id: string;
  key: string;
  name: string;
  description?: string;
  type: FeatureFlagType;
  defaultValue: unknown;
  category: FeatureFlagCategory;
  status: 'active' | 'deprecated';
  metadata?: Record<string, unknown>;
}

/** Tenant feature flag override */
export interface TenantFeatureFlag {
  flagKey: string;
  value: unknown;
  enabled: boolean;
  reason?: string;
  updatedAt: string;
  updatedBy?: string;
}

// =============================================================================
// Category Entitlements
// =============================================================================

/** Category entitlement */
export interface CategoryEntitlement {
  id: string;
  tenantId: string;
  organizationId?: string;
  categoryKey: string;
  enabled: boolean;
  restrictions?: Record<string, unknown>;
  reason?: string;
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// Billing DTOs
// =============================================================================

/** Tenant invoice */
export interface TenantInvoice {
  id: string;
  number: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  dueDate: string;
  paidAt?: string;
  invoiceUrl?: string;
}

/** Tenant billing summary */
export interface TenantBillingSummary {
  tenantId: string;
  status: BillingStatus;
  currentPlan?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  amountDue: number;
  amountPaid: number;
  currency: string;
  nextBillingDate?: string;
  invoices: TenantInvoice[];
}

/** Platform billing overview */
export interface BillingOverview {
  totalRevenue: number;
  monthlyRecurring: number;
  activeSubscriptions: number;
  overdueCount: number;
  currency: string;
}

// =============================================================================
// Secrets DTOs
// =============================================================================

/** Masked secret */
export interface MaskedSecret {
  key: string;
  provider: string;
  isConfigured: boolean;
  maskedValue?: string;
  fingerprint?: string;
  lastRotatedAt?: string;
  updatedAt: string;
}

// =============================================================================
// License Key DTOs
// =============================================================================

/** License key response (only returned once on creation/rotation) */
export interface LicenseKeyResponse {
  tenantId: string;
  licenseKey: string; // Only returned once, never stored in plaintext
  fingerprint: string;
  rotatedAt: string;
  expiresAt?: string;
}

/** License key validation result */
export interface LicenseKeyValidationResult {
  valid: boolean;
  expiresAt?: string;
}

// =============================================================================
// SaaS Admin Capabilities
// =============================================================================

/** SaaS admin capabilities */
export interface SaasAdminCapabilities {
  userId: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
  tenantCount: number;
  activeTenantCount: number;
  totalUsers: number;
  totalBookings: number;
}

// =============================================================================
// Request DTOs
// =============================================================================

/** Tenant list query params */
export interface SaasTenantQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: SaasTenantStatus;
  planId?: string;
  sortBy?: 'name' | 'createdAt' | 'status';
  sortOrder?: 'asc' | 'desc';
}

/** Create tenant request */
export interface CreateSaasTenantRequest {
  name: string;
  slug?: string;
  domain?: string;
  planId?: string;
  settings?: Record<string, unknown>;
  seatLimits?: Partial<SeatLimits>;
}

/** Update tenant request */
export interface UpdateSaasTenantRequest {
  name?: string;
  slug?: string;
  domain?: string;
  planId?: string;
  settings?: Record<string, unknown>;
  status?: SaasTenantStatus;
}

/** Suspend tenant request */
export interface SuspendTenantRequest {
  reason?: string;
  notifyAdmins?: boolean;
}

/** Update seat limits request */
export interface UpdateSeatLimitsRequest {
  maxUsers?: number;
  maxOrganizations?: number;
  maxListings?: number;
  maxBookingsPerMonth?: number;
  maxStorageMb?: number;
}

/** Update feature flags request */
export interface UpdateFeatureFlagsRequest {
  flags: Record<string, {
    value: unknown;
    enabled: boolean;
    reason?: string;
  }>;
}

/** Plan query params */
export interface PlanQueryParams {
  page?: number;
  limit?: number;
  status?: PlanStatus;
  isPublic?: boolean;
}

/** Create plan request */
export interface CreatePlanRequest {
  name: string;
  slug?: string;
  description?: string;
  seatLimits: SeatLimits;
  entitlements: Entitlements;
  basePrice: number;
  currency?: string;
  billingPeriod: BillingPeriod;
  trialDays?: number;
  isPublic?: boolean;
}

/** Update plan request */
export interface UpdatePlanRequest {
  name?: string;
  description?: string;
  seatLimits?: Partial<SeatLimits>;
  entitlements?: Partial<Entitlements>;
  basePrice?: number;
  trialDays?: number;
  isPublic?: boolean;
  status?: PlanStatus;
}

/** Feature flags query params */
export interface FeatureFlagsQueryParams {
  category?: FeatureFlagCategory;
  status?: 'active' | 'deprecated';
}

/** Update category entitlements request */
export interface UpdateCategoryEntitlementsRequest {
  categories: Array<{
    categoryKey: string;
    enabled: boolean;
    restrictions?: Record<string, unknown>;
    reason?: string;
  }>;
}

/** Update secret request */
export interface UpdateSecretRequest {
  value: string;
  rotateExisting?: boolean;
}

// =============================================================================
// Response Wrappers (re-export from enums for convenience)
// =============================================================================

// PaginatedResponse and SingleResponse are imported from ./enums
export type { PaginatedResponse, SingleResponse };

// =============================================================================
// Response Type Aliases (for SDK convenience)
// =============================================================================

/** Tenant list response */
export type SaasTenantListResponse = PaginatedResponse<SaasTenant>;

/** Tenant detail response */
export type SaasTenantDetailResponse = SingleResponse<SaasTenantWithStats>;

/** Tenant create/update response */
export type SaasTenantResponse = SingleResponse<SaasTenant>;

/** Plan list response */
export type PlanListResponse = PaginatedResponse<Plan>;

/** Plan detail response */
export type PlanDetailResponse = SingleResponse<Plan>;

/** Feature flags catalog response */
export type FeatureFlagsCatalogResponse = SingleResponse<FeatureFlagCatalogItem[]>;

/** Tenant feature flags response */
export type TenantFeatureFlagsResponse = SingleResponse<TenantFeatureFlag[]>;

/** Category entitlements response */
export type CategoryEntitlementsResponse = SingleResponse<CategoryEntitlement[]>;

/** Masked secrets response */
export type MaskedSecretsResponse = SingleResponse<MaskedSecret[]>;

/** License key rotation response */
export type LicenseKeyRotationResponse = SingleResponse<LicenseKeyResponse>;

/** Billing summary response */
export type BillingSummaryResponse = SingleResponse<TenantBillingSummary>;

/** SaaS admin capabilities response */
export type SaasAdminCapabilitiesResponse = SingleResponse<SaasAdminCapabilities>;
