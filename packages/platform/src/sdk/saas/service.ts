/**
 * SaaS Admin Service - @xalatechnologies/platform/sdk/saas
 * 
 * Platform-wide SaaS administration for tenant management, plans,
 * feature flags, and billing.
 * 
 * Required roles: SAAS_SUPER_ADMIN, SAAS_BILLING_ADMIN, SAAS_SUPPORT_AGENT
 */
import { getClient } from '../http';
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
  ScannerResult,
  AuditQueryParams,
  AuditLogEntry,
  AuditStats,
} from './types';

/**
 * Serialize query params to URL search string
 */
function toQueryString<T extends object>(params?: T): string {
  if (!params) return '';
  const entries = Object.entries(params)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => [k, String(v)]);
  return entries.length > 0 ? `?${new URLSearchParams(entries).toString()}` : '';
}

class SaasService {
  private basePath = '/api/saas';

  // -------------------------------------------------------------------------
  // Current Admin
  // -------------------------------------------------------------------------

  async getMe(): Promise<SingleResponse<SaasAdminCapabilities>> {
    return getClient().get<SingleResponse<SaasAdminCapabilities>>(`${this.basePath}/me`);
  }

  // -------------------------------------------------------------------------
  // Tenant Management
  // -------------------------------------------------------------------------

  async getTenants(params?: SaasTenantQueryParams): Promise<PaginatedResponse<SaasTenant>> {
    return getClient().get<PaginatedResponse<SaasTenant>>(
      `${this.basePath}/tenants${toQueryString(params)}`
    );
  }

  async getTenant(tenantId: string): Promise<SingleResponse<SaasTenantWithStats>> {
    return getClient().get<SingleResponse<SaasTenantWithStats>>(
      `${this.basePath}/tenants/${tenantId}`
    );
  }

  async createTenant(data: CreateSaasTenantRequest): Promise<SingleResponse<SaasTenant>> {
    return getClient().post<SingleResponse<SaasTenant>>(`${this.basePath}/tenants`, data);
  }

  async updateTenant(tenantId: string, data: UpdateSaasTenantRequest): Promise<SingleResponse<SaasTenant>> {
    return getClient().patch<SingleResponse<SaasTenant>>(
      `${this.basePath}/tenants/${tenantId}`,
      data
    );
  }

  async suspendTenant(tenantId: string, data?: SuspendTenantRequest): Promise<SingleResponse<SaasTenant>> {
    return getClient().post<SingleResponse<SaasTenant>>(
      `${this.basePath}/tenants/${tenantId}/suspend`,
      data ?? {}
    );
  }

  async reactivateTenant(tenantId: string): Promise<SingleResponse<SaasTenant>> {
    return getClient().post<SingleResponse<SaasTenant>>(
      `${this.basePath}/tenants/${tenantId}/reactivate`
    );
  }

  // -------------------------------------------------------------------------
  // Seat Limits
  // -------------------------------------------------------------------------

  async updateSeatLimits(tenantId: string, limits: UpdateSeatLimitsRequest): Promise<SingleResponse<SaasTenant>> {
    return getClient().put<SingleResponse<SaasTenant>>(
      `${this.basePath}/tenants/${tenantId}/seat-limits`,
      limits
    );
  }

  // -------------------------------------------------------------------------
  // Feature Flags
  // -------------------------------------------------------------------------

  async getFeatureFlagsCatalog(params?: FeatureFlagsQueryParams): Promise<SingleResponse<FeatureFlagCatalogItem[]>> {
    return getClient().get<SingleResponse<FeatureFlagCatalogItem[]>>(
      `${this.basePath}/feature-flags${toQueryString(params)}`
    );
  }

  async getTenantFlags(tenantId: string): Promise<SingleResponse<TenantFeatureFlag[]>> {
    return getClient().get<SingleResponse<TenantFeatureFlag[]>>(
      `${this.basePath}/tenants/${tenantId}/flags`
    );
  }

  async updateTenantFlags(tenantId: string, data: UpdateFeatureFlagsRequest): Promise<SingleResponse<TenantFeatureFlag[]>> {
    return getClient().put<SingleResponse<TenantFeatureFlag[]>>(
      `${this.basePath}/tenants/${tenantId}/flags`,
      data
    );
  }

  // -------------------------------------------------------------------------
  // License Key
  // -------------------------------------------------------------------------

  async rotateLicenseKey(tenantId: string): Promise<SingleResponse<LicenseKeyResponse>> {
    return getClient().post<SingleResponse<LicenseKeyResponse>>(
      `${this.basePath}/tenants/${tenantId}/rotate-license`
    );
  }

  async validateLicenseKey(tenantId: string, licenseKey: string): Promise<SingleResponse<{ valid: boolean; expiresAt?: string }>> {
    return getClient().post<SingleResponse<{ valid: boolean; expiresAt?: string }>>(
      `${this.basePath}/tenants/${tenantId}/validate-license`,
      { licenseKey }
    );
  }

  // -------------------------------------------------------------------------
  // Billing
  // -------------------------------------------------------------------------

  async getTenantBilling(tenantId: string): Promise<SingleResponse<TenantBillingSummary>> {
    return getClient().get<SingleResponse<TenantBillingSummary>>(
      `${this.basePath}/tenants/${tenantId}/billing`
    );
  }

  async getBillingOverview(): Promise<SingleResponse<{
    totalRevenue: number;
    monthlyRecurring: number;
    activeSubscriptions: number;
    overdueCount: number;
    currency: string;
  }>> {
    return getClient().get(`${this.basePath}/billing`);
  }

  // -------------------------------------------------------------------------
  // Secrets
  // -------------------------------------------------------------------------

  async getTenantSecrets(tenantId: string): Promise<SingleResponse<MaskedSecret[]>> {
    return getClient().get<SingleResponse<MaskedSecret[]>>(
      `${this.basePath}/tenants/${tenantId}/secrets`
    );
  }

  async updateTenantSecret(tenantId: string, key: string, data: UpdateSecretRequest): Promise<SingleResponse<MaskedSecret>> {
    return getClient().put<SingleResponse<MaskedSecret>>(
      `${this.basePath}/tenants/${tenantId}/secrets/${key}`,
      data
    );
  }

  // -------------------------------------------------------------------------
  // Plans
  // -------------------------------------------------------------------------

  async getPlans(params?: PlanQueryParams): Promise<PaginatedResponse<Plan>> {
    return getClient().get<PaginatedResponse<Plan>>(
      `${this.basePath}/plans${toQueryString(params)}`
    );
  }

  async getPlan(planId: string): Promise<SingleResponse<Plan>> {
    return getClient().get<SingleResponse<Plan>>(`${this.basePath}/plans/${planId}`);
  }

  async createPlan(data: CreatePlanRequest): Promise<SingleResponse<Plan>> {
    return getClient().post<SingleResponse<Plan>>(`${this.basePath}/plans`, data);
  }

  async updatePlan(planId: string, data: UpdatePlanRequest): Promise<SingleResponse<Plan>> {
    return getClient().patch<SingleResponse<Plan>>(
      `${this.basePath}/plans/${planId}`,
      data
    );
  }

  // -------------------------------------------------------------------------
  // Category Entitlements
  // -------------------------------------------------------------------------

  async getTenantCategories(tenantId: string): Promise<SingleResponse<CategoryEntitlement[]>> {
    return getClient().get<SingleResponse<CategoryEntitlement[]>>(
      `${this.basePath}/tenants/${tenantId}/categories`
    );
  }

  async updateTenantCategories(tenantId: string, data: UpdateCategoryEntitlementsRequest): Promise<SingleResponse<CategoryEntitlement[]>> {
    return getClient().put<SingleResponse<CategoryEntitlement[]>>(
      `${this.basePath}/tenants/${tenantId}/categories`,
      data
    );
  }

  // -------------------------------------------------------------------------
  // Scanners (Monitoring)
  // -------------------------------------------------------------------------

  async runI18nScanner(): Promise<SingleResponse<ScannerResult>> {
    return getClient().post<SingleResponse<ScannerResult>>('/api/saas/scanners/i18n/run');
  }

  async runDesignSystemScanner(): Promise<SingleResponse<ScannerResult>> {
    return getClient().post<SingleResponse<ScannerResult>>('/api/saas/scanners/design-system/run');
  }

  async runWcagScanner(): Promise<SingleResponse<ScannerResult>> {
    return getClient().post<SingleResponse<ScannerResult>>('/api/saas/scanners/wcag/run');
  }

  // -------------------------------------------------------------------------
  // Audit Log
  // -------------------------------------------------------------------------

  async getAuditLog(params?: AuditQueryParams): Promise<PaginatedResponse<AuditLogEntry>> {
    return getClient().get<PaginatedResponse<AuditLogEntry>>(
      `/api/audit${toQueryString(params)}`
    );
  }

  async getAuditStats(): Promise<SingleResponse<AuditStats>> {
    return getClient().get<SingleResponse<AuditStats>>('/api/audit/stats');
  }

  // -------------------------------------------------------------------------
  // Seed Data Generation
  // -------------------------------------------------------------------------

  async generateSeed(params: { entityType: string; count?: number; tenantId?: string; config?: object }): Promise<SingleResponse<{ success: boolean; entitiesCreated: number }>> {
    return getClient().post<SingleResponse<{ success: boolean; entitiesCreated: number }>>(
      `/api/saas/seed/generate`,
      params
    );
  }
}

// Singleton instance
export const saasService = new SaasService();
