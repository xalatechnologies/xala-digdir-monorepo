/**
 * SaaS Admin Service
 * Platform-wide SaaS administration for tenant management, plans, feature flags, and billing
 * Required roles: SAAS_SUPER_ADMIN, SAAS_BILLING_ADMIN, SAAS_SUPPORT_AGENT
 */
import { getClient } from '../core/client-factory';

// ============================================================================
// Types
// ============================================================================

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

/** Tenant with usage stats */
export interface SaasTenantWithStats extends SaasTenant {
  usage: {
    usersCount: number;
    organizationsCount: number;
    listingsCount: number;
    bookingsThisMonth: number;
    storageMb: number;
  };
}

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

/** License key response (only returned once on creation/rotation) */
export interface LicenseKeyResponse {
  tenantId: string;
  licenseKey: string; // Only returned once, never stored in plaintext
  fingerprint: string;
  rotatedAt: string;
  expiresAt?: string;
}

// ============================================================================
// Request/Response Types
// ============================================================================

/** Paginated response wrapper */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/** Single response wrapper */
export interface SingleResponse<T> {
  data: T;
}

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

// ============================================================================
// Service Implementation
// ============================================================================

class SaasService {
  private basePath = '/api/saas';

  // -------------------------------------------------------------------------
  // Current Admin
  // -------------------------------------------------------------------------

  /**
   * Get current SaaS admin capabilities
   * @returns SaaS admin capabilities with platform-wide stats
   */
  async getMe(): Promise<SingleResponse<SaasAdminCapabilities>> {
    return getClient().get<SingleResponse<SaasAdminCapabilities>>(`${this.basePath}/me`);
  }

  // -------------------------------------------------------------------------
  // Tenant Management
  // -------------------------------------------------------------------------

  /**
   * Get paginated list of all tenants
   * @param params - Query parameters for filtering and pagination
   */
  async getTenants(params?: SaasTenantQueryParams): Promise<PaginatedResponse<SaasTenant>> {
    const queryParams = params ? `?${new URLSearchParams(
      Object.entries(params)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    ).toString()}` : '';
    return getClient().get<PaginatedResponse<SaasTenant>>(`${this.basePath}/tenants${queryParams}`);
  }

  /**
   * Get single tenant by ID with detailed stats
   * @param tenantId - Tenant UUID
   */
  async getTenant(tenantId: string): Promise<SingleResponse<SaasTenantWithStats>> {
    return getClient().get<SingleResponse<SaasTenantWithStats>>(`${this.basePath}/tenants/${tenantId}`);
  }

  /**
   * Create a new tenant
   * @param data - Tenant creation data
   */
  async createTenant(data: CreateSaasTenantRequest): Promise<SingleResponse<SaasTenant>> {
    return getClient().post<SingleResponse<SaasTenant>>(`${this.basePath}/tenants`, data);
  }

  /**
   * Update tenant details
   * @param tenantId - Tenant UUID
   * @param data - Fields to update
   */
  async updateTenant(tenantId: string, data: UpdateSaasTenantRequest): Promise<SingleResponse<SaasTenant>> {
    return getClient().patch<SingleResponse<SaasTenant>>(`${this.basePath}/tenants/${tenantId}`, data);
  }

  /**
   * Suspend a tenant (disables access)
   * @param tenantId - Tenant UUID
   * @param data - Suspension details
   */
  async suspendTenant(tenantId: string, data?: SuspendTenantRequest): Promise<SingleResponse<SaasTenant>> {
    return getClient().post<SingleResponse<SaasTenant>>(`${this.basePath}/tenants/${tenantId}/suspend`, data ?? {});
  }

  /**
   * Reactivate a suspended tenant
   * @param tenantId - Tenant UUID
   */
  async reactivateTenant(tenantId: string): Promise<SingleResponse<SaasTenant>> {
    return getClient().post<SingleResponse<SaasTenant>>(`${this.basePath}/tenants/${tenantId}/reactivate`);
  }

  // -------------------------------------------------------------------------
  // Seat Limits
  // -------------------------------------------------------------------------

  /**
   * Update tenant seat limits
   * @param tenantId - Tenant UUID
   * @param limits - New seat limit values
   */
  async updateSeatLimits(tenantId: string, limits: UpdateSeatLimitsRequest): Promise<SingleResponse<SaasTenant>> {
    return getClient().put<SingleResponse<SaasTenant>>(`${this.basePath}/tenants/${tenantId}/seat-limits`, limits);
  }

  // -------------------------------------------------------------------------
  // Feature Flags
  // -------------------------------------------------------------------------

  /**
   * Get feature flags catalog (all available flags)
   * @param params - Optional filter params
   */
  async getFeatureFlagsCatalog(params?: FeatureFlagsQueryParams): Promise<SingleResponse<FeatureFlagCatalogItem[]>> {
    const queryParams = params ? `?${new URLSearchParams(
      Object.entries(params)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    ).toString()}` : '';
    return getClient().get<SingleResponse<FeatureFlagCatalogItem[]>>(`${this.basePath}/feature-flags${queryParams}`);
  }

  /**
   * Get tenant's feature flag overrides
   * @param tenantId - Tenant UUID
   */
  async getTenantFlags(tenantId: string): Promise<SingleResponse<TenantFeatureFlag[]>> {
    return getClient().get<SingleResponse<TenantFeatureFlag[]>>(`${this.basePath}/tenants/${tenantId}/flags`);
  }

  /**
   * Update tenant feature flags
   * @param tenantId - Tenant UUID
   * @param data - Flag updates
   */
  async updateTenantFlags(tenantId: string, data: UpdateFeatureFlagsRequest): Promise<SingleResponse<TenantFeatureFlag[]>> {
    return getClient().put<SingleResponse<TenantFeatureFlag[]>>(`${this.basePath}/tenants/${tenantId}/flags`, data);
  }

  // -------------------------------------------------------------------------
  // License Key
  // -------------------------------------------------------------------------

  /**
   * Rotate (regenerate) tenant license key
   * WARNING: This invalidates the previous key immediately
   * @param tenantId - Tenant UUID
   * @returns New license key (only returned once, never stored in plaintext)
   */
  async rotateLicenseKey(tenantId: string): Promise<SingleResponse<LicenseKeyResponse>> {
    return getClient().post<SingleResponse<LicenseKeyResponse>>(`${this.basePath}/tenants/${tenantId}/rotate-license`);
  }

  /**
   * Validate a license key
   * @param tenantId - Tenant UUID
   * @param licenseKey - License key to validate
   */
  async validateLicenseKey(tenantId: string, licenseKey: string): Promise<SingleResponse<{ valid: boolean; expiresAt?: string }>> {
    return getClient().post<SingleResponse<{ valid: boolean; expiresAt?: string }>>(`${this.basePath}/tenants/${tenantId}/validate-license`, { licenseKey });
  }

  // -------------------------------------------------------------------------
  // Billing
  // -------------------------------------------------------------------------

  /**
   * Get tenant billing summary
   * @param tenantId - Tenant UUID
   */
  async getTenantBilling(tenantId: string): Promise<SingleResponse<TenantBillingSummary>> {
    return getClient().get<SingleResponse<TenantBillingSummary>>(`${this.basePath}/tenants/${tenantId}/billing`);
  }

  /**
   * Get platform-wide billing overview
   */
  async getBillingOverview(): Promise<SingleResponse<{
    totalRevenue: number;
    monthlyRecurring: number;
    activeSubscriptions: number;
    overdueCount: number;
    currency: string;
  }>> {
    return getClient().get<SingleResponse<{
      totalRevenue: number;
      monthlyRecurring: number;
      activeSubscriptions: number;
      overdueCount: number;
      currency: string;
    }>>(`${this.basePath}/billing`);
  }

  // -------------------------------------------------------------------------
  // Secrets
  // -------------------------------------------------------------------------

  /**
   * Get tenant secrets (masked)
   * @param tenantId - Tenant UUID
   */
  async getTenantSecrets(tenantId: string): Promise<SingleResponse<MaskedSecret[]>> {
    return getClient().get<SingleResponse<MaskedSecret[]>>(`${this.basePath}/tenants/${tenantId}/secrets`);
  }

  /**
   * Update a tenant secret
   * @param tenantId - Tenant UUID
   * @param key - Secret key (e.g., 'visma_api_key')
   * @param data - New secret value
   */
  async updateTenantSecret(tenantId: string, key: string, data: UpdateSecretRequest): Promise<SingleResponse<MaskedSecret>> {
    return getClient().put<SingleResponse<MaskedSecret>>(`${this.basePath}/tenants/${tenantId}/secrets/${key}`, data);
  }

  // -------------------------------------------------------------------------
  // Plans
  // -------------------------------------------------------------------------

  /**
   * Get all subscription plans
   * @param params - Optional filter params
   */
  async getPlans(params?: PlanQueryParams): Promise<PaginatedResponse<Plan>> {
    const queryParams = params ? `?${new URLSearchParams(
      Object.entries(params)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    ).toString()}` : '';
    return getClient().get<PaginatedResponse<Plan>>(`${this.basePath}/plans${queryParams}`);
  }

  /**
   * Get single plan by ID
   * @param planId - Plan UUID
   */
  async getPlan(planId: string): Promise<SingleResponse<Plan>> {
    return getClient().get<SingleResponse<Plan>>(`${this.basePath}/plans/${planId}`);
  }

  /**
   * Create a new subscription plan
   * @param data - Plan creation data
   */
  async createPlan(data: CreatePlanRequest): Promise<SingleResponse<Plan>> {
    return getClient().post<SingleResponse<Plan>>(`${this.basePath}/plans`, data);
  }

  /**
   * Update a subscription plan
   * @param planId - Plan UUID
   * @param data - Fields to update
   */
  async updatePlan(planId: string, data: UpdatePlanRequest): Promise<SingleResponse<Plan>> {
    return getClient().patch<SingleResponse<Plan>>(`${this.basePath}/plans/${planId}`, data);
  }

  // -------------------------------------------------------------------------
  // Category Entitlements
  // -------------------------------------------------------------------------

  /**
   * Get tenant's allowed categories
   * @param tenantId - Tenant UUID
   */
  async getTenantCategories(tenantId: string): Promise<SingleResponse<CategoryEntitlement[]>> {
    return getClient().get<SingleResponse<CategoryEntitlement[]>>(`${this.basePath}/tenants/${tenantId}/categories`);
  }

  /**
   * Update tenant's allowed categories
   * @param tenantId - Tenant UUID
   * @param data - Category entitlement updates
   */
  async updateTenantCategories(tenantId: string, data: UpdateCategoryEntitlementsRequest): Promise<SingleResponse<CategoryEntitlement[]>> {
    return getClient().put<SingleResponse<CategoryEntitlement[]>>(`${this.basePath}/tenants/${tenantId}/categories`, data);
  }
}

// Singleton instance
export const saasService = new SaasService();
