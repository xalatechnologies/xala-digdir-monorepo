/**
 * SaaS Admin Hooks - @xalatechnologies/platform/sdk/saas
 * 
 * React Query hooks for SaaS admin operations.
 * Platform-wide tenant management, plans, feature flags, and billing.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { saasQueryKeys } from './query-keys';
import { saasService } from './service';
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
  AuditQueryParams,
  ListUsersQuery,
  UserListResponse,
} from './types';
import { getClient } from '../http';

// =============================================================================
// SaaS Admin Identity
// =============================================================================

export function useSaasMe() {
  return useQuery({
    queryKey: saasQueryKeys.me(),
    queryFn: () => saasService.getMe(),
    staleTime: 5 * 60 * 1000,
  });
}

// =============================================================================
// Tenant Management Hooks
// =============================================================================

export function useSaasTenants(params?: SaasTenantQueryParams) {
  return useQuery({
    queryKey: saasQueryKeys.tenants.list(params),
    queryFn: () => saasService.getTenants(params),
  });
}

export function useSaasTenant(tenantId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: saasQueryKeys.tenants.detail(tenantId),
    queryFn: () => saasService.getTenant(tenantId),
    enabled: !!tenantId && (options?.enabled ?? true),
  });
}

export function useCreateSaasTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSaasTenantRequest) => saasService.createTenant(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: saasQueryKeys.tenants.lists() });
    },
  });
}

export function useUpdateSaasTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tenantId, data }: { tenantId: string; data: UpdateSaasTenantRequest }) =>
      saasService.updateTenant(tenantId, data),
    onSuccess: (_, { tenantId }) => {
      queryClient.invalidateQueries({ queryKey: saasQueryKeys.tenants.detail(tenantId) });
      queryClient.invalidateQueries({ queryKey: saasQueryKeys.tenants.lists() });
    },
  });
}

export function useSuspendSaasTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tenantId, data }: { tenantId: string; data?: SuspendTenantRequest }) =>
      saasService.suspendTenant(tenantId, data),
    onSuccess: (_, { tenantId }) => {
      queryClient.invalidateQueries({ queryKey: saasQueryKeys.tenants.detail(tenantId) });
      queryClient.invalidateQueries({ queryKey: saasQueryKeys.tenants.lists() });
    },
  });
}

export function useReactivateSaasTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tenantId: string) => saasService.reactivateTenant(tenantId),
    onSuccess: (_, tenantId) => {
      queryClient.invalidateQueries({ queryKey: saasQueryKeys.tenants.detail(tenantId) });
      queryClient.invalidateQueries({ queryKey: saasQueryKeys.tenants.lists() });
    },
  });
}

// =============================================================================
// Seat Limits Hooks
// =============================================================================

export function useUpdateSaasSeatLimits() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tenantId, limits }: { tenantId: string; limits: UpdateSeatLimitsRequest }) =>
      saasService.updateSeatLimits(tenantId, limits),
    onSuccess: (_, { tenantId }) => {
      queryClient.invalidateQueries({ queryKey: saasQueryKeys.tenants.detail(tenantId) });
    },
  });
}

// =============================================================================
// Feature Flags Hooks
// =============================================================================

export function useSaasFeatureFlagsCatalog(params?: FeatureFlagsQueryParams) {
  return useQuery({
    queryKey: saasQueryKeys.featureFlags.catalog(params),
    queryFn: () => saasService.getFeatureFlagsCatalog(params),
    staleTime: 30 * 60 * 1000,
  });
}

export function useSaasTenantFlags(tenantId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: saasQueryKeys.tenants.flags(tenantId),
    queryFn: () => saasService.getTenantFlags(tenantId),
    enabled: !!tenantId && (options?.enabled ?? true),
  });
}

export function useUpdateSaasTenantFlags() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tenantId, data }: { tenantId: string; data: UpdateFeatureFlagsRequest }) =>
      saasService.updateTenantFlags(tenantId, data),
    onSuccess: (_, { tenantId }) => {
      queryClient.invalidateQueries({ queryKey: saasQueryKeys.tenants.flags(tenantId) });
      queryClient.invalidateQueries({ queryKey: saasQueryKeys.tenants.detail(tenantId) });
    },
  });
}

// =============================================================================
// License Key Hooks
// =============================================================================

export function useRotateSaasLicenseKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tenantId: string) => saasService.rotateLicenseKey(tenantId),
    onSuccess: (_, tenantId) => {
      queryClient.invalidateQueries({ queryKey: saasQueryKeys.tenants.detail(tenantId) });
    },
  });
}

export function useValidateSaasLicenseKey() {
  return useMutation({
    mutationFn: ({ tenantId, licenseKey }: { tenantId: string; licenseKey: string }) =>
      saasService.validateLicenseKey(tenantId, licenseKey),
  });
}

// =============================================================================
// Billing Hooks
// =============================================================================

export function useSaasTenantBilling(tenantId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: saasQueryKeys.tenants.billing(tenantId),
    queryFn: () => saasService.getTenantBilling(tenantId),
    enabled: !!tenantId && (options?.enabled ?? true),
  });
}

export function useSaasBillingOverview() {
  return useQuery({
    queryKey: saasQueryKeys.billing.overview(),
    queryFn: () => saasService.getBillingOverview(),
    staleTime: 5 * 60 * 1000,
  });
}

// =============================================================================
// Secrets Hooks
// =============================================================================

export function useSaasTenantSecrets(tenantId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: saasQueryKeys.tenants.secrets(tenantId),
    queryFn: () => saasService.getTenantSecrets(tenantId),
    enabled: !!tenantId && (options?.enabled ?? true),
  });
}

export function useUpdateSaasTenantSecret() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tenantId, key, data }: { tenantId: string; key: string; data: UpdateSecretRequest }) =>
      saasService.updateTenantSecret(tenantId, key, data),
    onSuccess: (_, { tenantId }) => {
      queryClient.invalidateQueries({ queryKey: saasQueryKeys.tenants.secrets(tenantId) });
    },
  });
}

// =============================================================================
// Plans Hooks
// =============================================================================

export function useSaasPlans(params?: PlanQueryParams) {
  return useQuery({
    queryKey: saasQueryKeys.plans.list(params),
    queryFn: () => saasService.getPlans(params),
  });
}

export function useSaasPlan(planId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: saasQueryKeys.plans.detail(planId),
    queryFn: () => saasService.getPlan(planId),
    enabled: !!planId && (options?.enabled ?? true),
  });
}

export function useCreateSaasPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePlanRequest) => saasService.createPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: saasQueryKeys.plans.lists() });
    },
  });
}

export function useUpdateSaasPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, data }: { planId: string; data: UpdatePlanRequest }) =>
      saasService.updatePlan(planId, data),
    onSuccess: (_, { planId }) => {
      queryClient.invalidateQueries({ queryKey: saasQueryKeys.plans.detail(planId) });
      queryClient.invalidateQueries({ queryKey: saasQueryKeys.plans.lists() });
    },
  });
}

// =============================================================================
// Category Entitlements Hooks
// =============================================================================

export function useSaasTenantCategories(tenantId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: saasQueryKeys.tenants.categories(tenantId),
    queryFn: () => saasService.getTenantCategories(tenantId),
    enabled: !!tenantId && (options?.enabled ?? true),
  });
}

export function useUpdateSaasTenantCategories() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tenantId, data }: { tenantId: string; data: UpdateCategoryEntitlementsRequest }) =>
      saasService.updateTenantCategories(tenantId, data),
    onSuccess: (_, { tenantId }) => {
      queryClient.invalidateQueries({ queryKey: saasQueryKeys.tenants.categories(tenantId) });
      queryClient.invalidateQueries({ queryKey: saasQueryKeys.tenants.detail(tenantId) });
    },
  });
}

// =============================================================================
// Scanner Hooks (Monitoring)
// =============================================================================

export function useRunI18nScanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => saasService.runI18nScanner(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: saasQueryKeys.scanners.status('i18n') });
      queryClient.invalidateQueries({ queryKey: saasQueryKeys.scanners.lastResult('i18n') });
      queryClient.invalidateQueries({ queryKey: saasQueryKeys.scanners.allStatuses() });
    },
  });
}

export function useRunDesignSystemScanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => saasService.runDesignSystemScanner(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: saasQueryKeys.scanners.status('design-system') });
      queryClient.invalidateQueries({ queryKey: saasQueryKeys.scanners.lastResult('design-system') });
      queryClient.invalidateQueries({ queryKey: saasQueryKeys.scanners.allStatuses() });
    },
  });
}

export function useRunWcagScanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => saasService.runWcagScanner(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: saasQueryKeys.scanners.status('wcag') });
      queryClient.invalidateQueries({ queryKey: saasQueryKeys.scanners.lastResult('wcag') });
      queryClient.invalidateQueries({ queryKey: saasQueryKeys.scanners.allStatuses() });
    },
  });
}

// =============================================================================
// Audit Log Hooks
// =============================================================================

export function useAuditLog(params?: AuditQueryParams) {
  return useQuery({
    queryKey: saasQueryKeys.audit.list(params),
    queryFn: () => saasService.getAuditLog(params),
  });
}

export function useAuditStats() {
  return useQuery({
    queryKey: saasQueryKeys.audit.stats(),
    queryFn: () => saasService.getAuditStats(),
  });
}

// =============================================================================
// Seed Generation Hooks
// =============================================================================

export function useGenerateSeed() {
  return useMutation({
    mutationFn: (params: { entityType: string; count?: number; tenantId?: string; config?: object }) =>
      saasService.generateSeed(params),
  });
}

// =============================================================================
// User Management Hooks (Platform-wide admin)
// =============================================================================

/**
 * List all users (platform admin only)
 * Used for cross-tenant user management in SaaS admin
 */
export function useUsers(query?: Partial<ListUsersQuery>) {
  return useQuery({
    queryKey: saasQueryKeys.users.list(query),
    queryFn: async () => {
      const params = query
        ? new URLSearchParams(
            Object.entries(query)
              .filter(([, v]) => v !== undefined)
              .map(([k, v]) => [k, String(v)])
          )
        : undefined;
      const url = params ? `/api/admin/users?${params}` : '/api/admin/users';
      return getClient().get<UserListResponse>(url);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

