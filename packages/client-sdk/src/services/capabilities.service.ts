/**
 * Capabilities Service
 * Tenant capabilities, feature flags, and licensing API integration
 */
import { getClient } from '../core/client-factory';
import type {
  TenantCapabilitiesProjectionDTO,
  FeatureStateDTO,
  UpdateFeatureFlagInput,
  BulkUpdateFeatureFlagsInput,
  LicensePlanProjectionDTO,
  TenantLicenseProjectionDTO,
  LicenseCodeProjectionDTO,
  ActivationProjectionDTO,
  ActivateLicenseInput,
  ActivationResult,
  IssueLicenseCodeInput,
  RotateLicenseCodeInput,
  RevokeLicenseCodeInput,
  ValidateLicenseCodeInput,
  ValidateLicenseCodeResult,
  CapabilitiesResponse,
  CapabilitiesListResponse,
  LicensePlanQueryParams,
} from '../types/capabilities';

class CapabilitiesService {
  private basePath = '/api/capabilities';
  private licensingPath = '/api/licensing';

  // =============================================================================
  // Capabilities Endpoints
  // =============================================================================

  /**
   * Get current tenant capabilities projection
   * Returns screen-ready DTO with features, license, permissions, and actions
   */
  async getTenantCapabilities(): Promise<CapabilitiesResponse<TenantCapabilitiesProjectionDTO>> {
    return getClient().get<CapabilitiesResponse<TenantCapabilitiesProjectionDTO>>(
      `${this.basePath}/current`
    );
  }

  // =============================================================================
  // Feature Flag Endpoints
  // =============================================================================

  /**
   * Get all feature flags for the current tenant
   */
  async getFeatures(): Promise<CapabilitiesResponse<FeatureStateDTO[]>> {
    return getClient().get<CapabilitiesResponse<FeatureStateDTO[]>>(
      `${this.basePath}/features`
    );
  }

  /**
   * Get a specific feature flag by key
   */
  async getFeature(key: string): Promise<CapabilitiesResponse<FeatureStateDTO>> {
    return getClient().get<CapabilitiesResponse<FeatureStateDTO>>(
      `${this.basePath}/features/${encodeURIComponent(key)}`
    );
  }

  /**
   * Update a feature flag
   */
  async updateFeature(
    key: string,
    data: UpdateFeatureFlagInput
  ): Promise<CapabilitiesResponse<FeatureStateDTO>> {
    return getClient().put<CapabilitiesResponse<FeatureStateDTO>>(
      `${this.basePath}/features/${encodeURIComponent(key)}`,
      data
    );
  }

  /**
   * Bulk update multiple feature flags
   */
  async bulkUpdateFeatures(
    data: BulkUpdateFeatureFlagsInput
  ): Promise<CapabilitiesResponse<FeatureStateDTO[]>> {
    return getClient().put<CapabilitiesResponse<FeatureStateDTO[]>>(
      `${this.basePath}/features`,
      data
    );
  }

  // =============================================================================
  // License Plan Endpoints
  // =============================================================================

  /**
   * Get all available license plans
   */
  async getLicensePlans(
    params?: LicensePlanQueryParams
  ): Promise<CapabilitiesListResponse<LicensePlanProjectionDTO>> {
    const searchParams = new URLSearchParams();
    if (params?.isActive !== undefined) {
      searchParams.set('isActive', String(params.isActive));
    }
    if (params?.page !== undefined) {
      searchParams.set('page', String(params.page));
    }
    if (params?.limit !== undefined) {
      searchParams.set('limit', String(params.limit));
    }
    const query = searchParams.toString();
    const url = `${this.licensingPath}/plans${query ? `?${query}` : ''}`;
    return getClient().get<CapabilitiesListResponse<LicensePlanProjectionDTO>>(url);
  }

  /**
   * Get a specific license plan by ID
   */
  async getLicensePlan(id: string): Promise<CapabilitiesResponse<LicensePlanProjectionDTO>> {
    return getClient().get<CapabilitiesResponse<LicensePlanProjectionDTO>>(
      `${this.licensingPath}/plans/${encodeURIComponent(id)}`
    );
  }

  // =============================================================================
  // Tenant License Endpoints
  // =============================================================================

  /**
   * Get current tenant's license
   */
  async getCurrentLicense(): Promise<CapabilitiesResponse<TenantLicenseProjectionDTO>> {
    return getClient().get<CapabilitiesResponse<TenantLicenseProjectionDTO>>(
      `${this.licensingPath}/current`
    );
  }

  /**
   * Activate a license code
   */
  async activateLicense(data: ActivateLicenseInput): Promise<CapabilitiesResponse<ActivationResult>> {
    return getClient().post<CapabilitiesResponse<ActivationResult>>(
      `${this.licensingPath}/activate`,
      data
    );
  }

  // =============================================================================
  // License Code Endpoints
  // =============================================================================

  /**
   * Get all license codes for current tenant
   */
  async getLicenseCodes(): Promise<CapabilitiesResponse<LicenseCodeProjectionDTO[]>> {
    return getClient().get<CapabilitiesResponse<LicenseCodeProjectionDTO[]>>(
      `${this.licensingPath}/codes`
    );
  }

  /**
   * Issue a new license code
   */
  async issueLicenseCode(
    data: IssueLicenseCodeInput
  ): Promise<CapabilitiesResponse<LicenseCodeProjectionDTO & { token: string }>> {
    return getClient().post<CapabilitiesResponse<LicenseCodeProjectionDTO & { token: string }>>(
      `${this.licensingPath}/codes/issue`,
      data
    );
  }

  /**
   * Rotate an existing license code
   */
  async rotateLicenseCode(
    data: RotateLicenseCodeInput
  ): Promise<CapabilitiesResponse<LicenseCodeProjectionDTO & { token: string }>> {
    return getClient().post<CapabilitiesResponse<LicenseCodeProjectionDTO & { token: string }>>(
      `${this.licensingPath}/codes/rotate`,
      data
    );
  }

  /**
   * Revoke a license code
   */
  async revokeLicenseCode(
    data: RevokeLicenseCodeInput
  ): Promise<CapabilitiesResponse<LicenseCodeProjectionDTO>> {
    return getClient().post<CapabilitiesResponse<LicenseCodeProjectionDTO>>(
      `${this.licensingPath}/codes/revoke`,
      data
    );
  }

  /**
   * Validate a license code
   */
  async validateLicenseCode(
    data: ValidateLicenseCodeInput
  ): Promise<CapabilitiesResponse<ValidateLicenseCodeResult>> {
    return getClient().post<CapabilitiesResponse<ValidateLicenseCodeResult>>(
      `${this.licensingPath}/codes/validate`,
      data
    );
  }

  // =============================================================================
  // Activation Endpoints
  // =============================================================================

  /**
   * Get all activations for current tenant
   */
  async getActivations(): Promise<CapabilitiesResponse<ActivationProjectionDTO[]>> {
    return getClient().get<CapabilitiesResponse<ActivationProjectionDTO[]>>(
      `${this.licensingPath}/activations`
    );
  }

  /**
   * Deactivate an activation
   */
  async deactivate(activationId: string): Promise<CapabilitiesResponse<{ success: boolean }>> {
    return getClient().delete<CapabilitiesResponse<{ success: boolean }>>(
      `${this.licensingPath}/activations/${encodeURIComponent(activationId)}`
    );
  }
}

export const capabilitiesService = new CapabilitiesService();
