/**
 * Capabilities Hooks
 * Single Responsibility: React Query hooks for tenant capabilities, licensing, and activations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { capabilitiesService } from '../services/capabilities.service';
import type {
  UpdateFeatureFlagInput,
  BulkUpdateFeatureFlagsInput,
  ActivateLicenseInput,
  IssueLicenseCodeInput,
  RotateLicenseCodeInput,
  RevokeLicenseCodeInput,
  LicensePlanQueryParams,
} from '../types/capabilities';

// =============================================================================
// Capabilities Hooks
// =============================================================================

/**
 * Get current tenant capabilities
 * Returns screen-ready projection DTO with features, license, permissions, and actions
 */
export function useTenantCapabilities() {
  return useQuery({
    queryKey: queryKeys.capabilities.current(),
    queryFn: () => capabilitiesService.getTenantCapabilities(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// =============================================================================
// Feature Flag Hooks
// =============================================================================

/**
 * Get all feature flags for current tenant
 */
export function useFeatures() {
  return useQuery({
    queryKey: queryKeys.capabilities.features(),
    queryFn: () => capabilitiesService.getFeatures(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get a specific feature flag by key
 */
export function useFeature(key: string) {
  return useQuery({
    queryKey: queryKeys.capabilities.feature(key),
    queryFn: () => capabilitiesService.getFeature(key),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!key,
  });
}

/**
 * Update a feature flag
 */
export function useUpdateFeature() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, data }: { key: string; data: UpdateFeatureFlagInput }) =>
      capabilitiesService.updateFeature(key, data),
    onSuccess: (_response, variables) => {
      // Invalidate specific feature
      queryClient.invalidateQueries({
        queryKey: queryKeys.capabilities.feature(variables.key),
      });
      // Invalidate features list
      queryClient.invalidateQueries({
        queryKey: queryKeys.capabilities.features(),
      });
      // Invalidate capabilities projection (includes features)
      queryClient.invalidateQueries({
        queryKey: queryKeys.capabilities.current(),
      });
    },
  });
}

/**
 * Bulk update multiple feature flags
 */
export function useBulkUpdateFeatures() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkUpdateFeatureFlagsInput) =>
      capabilitiesService.bulkUpdateFeatures(data),
    onSuccess: () => {
      // Invalidate all capabilities-related queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.capabilities.all,
      });
    },
  });
}

// =============================================================================
// License Plan Hooks
// =============================================================================

/**
 * Get all available license plans
 */
export function useLicensePlans(params?: LicensePlanQueryParams) {
  return useQuery({
    queryKey: queryKeys.licensing.plans(),
    queryFn: () => capabilitiesService.getLicensePlans(params),
    staleTime: 10 * 60 * 1000, // 10 minutes - plans don't change often
  });
}

/**
 * Get a specific license plan by ID
 */
export function useLicensePlan(id: string) {
  return useQuery({
    queryKey: [...queryKeys.licensing.plans(), id] as const,
    queryFn: () => capabilitiesService.getLicensePlan(id),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!id,
  });
}

// =============================================================================
// Tenant License Hooks
// =============================================================================

/**
 * Get current tenant license
 */
export function useCurrentLicense() {
  return useQuery({
    queryKey: queryKeys.licensing.current(),
    queryFn: () => capabilitiesService.getCurrentLicense(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Activate a license code
 */
export function useActivateLicense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ActivateLicenseInput) =>
      capabilitiesService.activateLicense(data),
    onSuccess: () => {
      // Invalidate all licensing and capabilities queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.licensing.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.capabilities.all,
      });
    },
  });
}

// =============================================================================
// License Code Hooks
// =============================================================================

/**
 * Get all license codes for current tenant
 */
export function useLicenseCodes() {
  return useQuery({
    queryKey: queryKeys.licensing.codes(),
    queryFn: () => capabilitiesService.getLicenseCodes(),
    staleTime: 2 * 60 * 1000, // 2 minutes - codes may change more frequently
  });
}

/**
 * Issue a new license code
 */
export function useIssueLicenseCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IssueLicenseCodeInput) =>
      capabilitiesService.issueLicenseCode(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.licensing.codes(),
      });
    },
  });
}

/**
 * Rotate an existing license code
 */
export function useRotateLicenseCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RotateLicenseCodeInput) =>
      capabilitiesService.rotateLicenseCode(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.licensing.codes(),
      });
    },
  });
}

/**
 * Revoke a license code
 */
export function useRevokeLicenseCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RevokeLicenseCodeInput) =>
      capabilitiesService.revokeLicenseCode(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.licensing.codes(),
      });
      // Also invalidate capabilities as permissions may change
      queryClient.invalidateQueries({
        queryKey: queryKeys.capabilities.all,
      });
    },
  });
}

// =============================================================================
// Activation Hooks
// =============================================================================

/**
 * Get all activations for current tenant
 */
export function useActivations() {
  return useQuery({
    queryKey: [...queryKeys.licensing.all, 'activations'] as const,
    queryFn: () => capabilitiesService.getActivations(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Deactivate an activation
 */
export function useDeactivate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (activationId: string) =>
      capabilitiesService.deactivate(activationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.licensing.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.capabilities.all,
      });
    },
  });
}
