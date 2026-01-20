/**
 * SaaS Admin Service
 * Platform-wide SaaS administration for tenant management, plans, feature flags, and billing
 * Required roles: SAAS_SUPER_ADMIN, SAAS_BILLING_ADMIN, SAAS_SUPPORT_AGENT
 */
import { getClient } from '@/core/client-factory';
import type {
  SaasTenant,
  SaasTenantWithStats,
  SaasTenantQueryParams,
  CreateSaasTenantRequest,
  UpdateSaasTenantRequest,
  SuspendTenantRequest,
  UpdateSeatLimitsRequest,
  UpdateFeatureFlagsRequest,
  FeatureFlagsQueryParams,
  FeatureFlagCatalogItem,
  TenantFeatureFlag,
  CategoryEntitlement,
  UpdateCategoryEntitlementsRequest,
  LicenseKeyResponse,
  TenantBillingSummary,
  MaskedSecret,
  UpdateSecretRequest,
  Plan,
  PlanQueryParams,
  CreatePlanRequest,
  UpdatePlanRequest,
  SaasAdminCapabilities,
  PaginatedResponse,
  SingleResponse,
} from '@/types/saas';

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
