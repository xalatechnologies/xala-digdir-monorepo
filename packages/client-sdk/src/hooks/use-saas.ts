/**
 * SaaS Admin Hooks
 * Single Responsibility: React Query hooks for SaaS admin operations
 * Platform-wide tenant management, plans, feature flags, and billing
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { saasService } from '../services/saas.service';
import type {
  SaasTenantQueryParams,
  CreateSaasTenantRequest,
  UpdateSaasTenantRequest,
  SuspendTenantRequest,
  UpdateSeatLimitsRequest,
  UpdateFeatureFlagsRequest,
  PlanQueryParams,
  CreatePlanRequest,
  UpdatePlanRequest,
  FeatureFlagsQueryParams,
  UpdateCategoryEntitlementsRequest,
  UpdateSecretRequest,
} from '../services/saas.service';

// ============================================================================
// SaaS Admin Identity
// ============================================================================

/**
 * Get current SaaS admin capabilities and platform-wide stats
 */
export function useSaasMe() {
  return useQuery({
    queryKey: queryKeys.saas.me(),
    queryFn: () => saasService.getMe(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ============================================================================
// Tenant Management Hooks
// ============================================================================

/**
 * Get paginated list of all tenants
 */
export function useSaasTenants(params?: SaasTenantQueryParams) {
  return useQuery({
    queryKey: queryKeys.saas.tenants.list(params),
    queryFn: () => saasService.getTenants(params),
  });
}

/**
 * Get single tenant by ID with detailed stats
 */
export function useSaasTenant(tenantId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.saas.tenants.detail(tenantId),
    queryFn: () => saasService.getTenant(tenantId),
    enabled: !!tenantId && (options?.enabled ?? true),
  });
}

/**
 * Create a new tenant mutation
 */
export function useCreateSaasTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSaasTenantRequest) => saasService.createTenant(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.saas.tenants.lists() });
    },
  });
}

/**
 * Update tenant details mutation
 */
export function useUpdateSaasTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tenantId, data }: { tenantId: string; data: UpdateSaasTenantRequest }) =>
      saasService.updateTenant(tenantId, data),
    onSuccess: (_, { tenantId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.saas.tenants.detail(tenantId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.saas.tenants.lists() });
    },
  });
}

/**
 * Suspend a tenant mutation
 */
export function useSuspendSaasTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tenantId, data }: { tenantId: string; data?: SuspendTenantRequest }) =>
      saasService.suspendTenant(tenantId, data),
    onSuccess: (_, { tenantId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.saas.tenants.detail(tenantId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.saas.tenants.lists() });
    },
  });
}

/**
 * Reactivate a suspended tenant mutation
 */
export function useReactivateSaasTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tenantId: string) => saasService.reactivateTenant(tenantId),
    onSuccess: (_, tenantId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.saas.tenants.detail(tenantId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.saas.tenants.lists() });
    },
  });
}

// ============================================================================
// Seat Limits Hooks
// ============================================================================

/**
 * Update tenant seat limits mutation
 */
export function useUpdateSaasSeatLimits() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tenantId, limits }: { tenantId: string; limits: UpdateSeatLimitsRequest }) =>
      saasService.updateSeatLimits(tenantId, limits),
    onSuccess: (_, { tenantId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.saas.tenants.detail(tenantId) });
    },
  });
}

// ============================================================================
// Feature Flags Hooks
// ============================================================================

/**
 * Get feature flags catalog (all available flags)
 */
export function useSaasFeatureFlagsCatalog(params?: FeatureFlagsQueryParams) {
  return useQuery({
    queryKey: queryKeys.saas.featureFlags.catalog(params),
    queryFn: () => saasService.getFeatureFlagsCatalog(params),
    staleTime: 30 * 60 * 1000, // 30 minutes - catalog doesn't change often
  });
}

/**
 * Get tenant's feature flag overrides
 */
export function useSaasTenantFlags(tenantId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.saas.tenants.flags(tenantId),
    queryFn: () => saasService.getTenantFlags(tenantId),
    enabled: !!tenantId && (options?.enabled ?? true),
  });
}

/**
 * Update tenant feature flags mutation
 */
export function useUpdateSaasTenantFlags() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tenantId, data }: { tenantId: string; data: UpdateFeatureFlagsRequest }) =>
      saasService.updateTenantFlags(tenantId, data),
    onSuccess: (_, { tenantId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.saas.tenants.flags(tenantId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.saas.tenants.detail(tenantId) });
    },
  });
}

// ============================================================================
// License Key Hooks
// ============================================================================

/**
 * Rotate (regenerate) tenant license key mutation
 * WARNING: This invalidates the previous key immediately
 */
export function useRotateSaasLicenseKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tenantId: string) => saasService.rotateLicenseKey(tenantId),
    onSuccess: (_, tenantId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.saas.tenants.detail(tenantId) });
    },
  });
}

/**
 * Validate a tenant license key mutation
 */
export function useValidateSaasLicenseKey() {
  return useMutation({
    mutationFn: ({ tenantId, licenseKey }: { tenantId: string; licenseKey: string }) =>
      saasService.validateLicenseKey(tenantId, licenseKey),
  });
}

// ============================================================================
// Billing Hooks
// ============================================================================

/**
 * Get tenant billing summary
 */
export function useSaasTenantBilling(tenantId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.saas.tenants.billing(tenantId),
    queryFn: () => saasService.getTenantBilling(tenantId),
    enabled: !!tenantId && (options?.enabled ?? true),
  });
}

/**
 * Get platform-wide billing overview
 */
export function useSaasBillingOverview() {
  return useQuery({
    queryKey: queryKeys.saas.billing.overview(),
    queryFn: () => saasService.getBillingOverview(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ============================================================================
// Secrets Hooks
// ============================================================================

/**
 * Get tenant secrets (masked)
 */
export function useSaasTenantSecrets(tenantId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.saas.tenants.secrets(tenantId),
    queryFn: () => saasService.getTenantSecrets(tenantId),
    enabled: !!tenantId && (options?.enabled ?? true),
  });
}

/**
 * Update a tenant secret mutation
 */
export function useUpdateSaasTenantSecret() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tenantId, key, data }: { tenantId: string; key: string; data: UpdateSecretRequest }) =>
      saasService.updateTenantSecret(tenantId, key, data),
    onSuccess: (_, { tenantId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.saas.tenants.secrets(tenantId) });
    },
  });
}

// ============================================================================
// Plans Hooks
// ============================================================================

/**
 * Get all subscription plans
 */
export function useSaasPlans(params?: PlanQueryParams) {
  return useQuery({
    queryKey: queryKeys.saas.plans.list(params),
    queryFn: () => saasService.getPlans(params),
  });
}

/**
 * Get single plan by ID
 */
export function useSaasPlan(planId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.saas.plans.detail(planId),
    queryFn: () => saasService.getPlan(planId),
    enabled: !!planId && (options?.enabled ?? true),
  });
}

/**
 * Create a new subscription plan mutation
 */
export function useCreateSaasPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePlanRequest) => saasService.createPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.saas.plans.lists() });
    },
  });
}

/**
 * Update a subscription plan mutation
 */
export function useUpdateSaasPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ planId, data }: { planId: string; data: UpdatePlanRequest }) =>
      saasService.updatePlan(planId, data),
    onSuccess: (_, { planId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.saas.plans.detail(planId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.saas.plans.lists() });
    },
  });
}

// ============================================================================
// Category Entitlements Hooks
// ============================================================================

/**
 * Get tenant's allowed categories
 */
export function useSaasTenantCategories(tenantId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.saas.tenants.categories(tenantId),
    queryFn: () => saasService.getTenantCategories(tenantId),
    enabled: !!tenantId && (options?.enabled ?? true),
  });
}

/**
 * Update tenant's allowed categories mutation
 */
export function useUpdateSaasTenantCategories() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tenantId, data }: { tenantId: string; data: UpdateCategoryEntitlementsRequest }) =>
      saasService.updateTenantCategories(tenantId, data),
    onSuccess: (_, { tenantId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.saas.tenants.categories(tenantId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.saas.tenants.detail(tenantId) });
    },
  });
}
