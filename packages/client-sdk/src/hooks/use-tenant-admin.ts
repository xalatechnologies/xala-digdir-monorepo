/**
 * Tenant Admin Hooks
 * Single Responsibility: React Query hooks for tenant-scoped administration
 * Includes capabilities, subscription, branding, and integrations management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { tenantAdminService } from '../services/tenant-admin.service';
import type {
  UpdateTenantBrandingRequest as UpdateBrandingRequest,
  UpdateTenantIntegrationRequest as UpdateIntegrationRequest,
} from '../types/tenant-admin';

// ============================================================================
// Capabilities Hooks
// ============================================================================

/**
 * Get current tenant admin capabilities
 * Returns role, permissions, allowed actions, feature flags, seat limits, and usage
 */
export function useTenantCapabilities() {
  return useQuery({
    queryKey: queryKeys.tenantAdmin.capabilities(),
    queryFn: () => tenantAdminService.getCapabilities(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ============================================================================
// Subscription Hooks
// ============================================================================

/**
 * Get current tenant subscription details (read-only)
 * Returns plan info, seat limits, and current usage
 */
export function useTenantSubscription() {
  return useQuery({
    queryKey: queryKeys.tenantAdmin.subscription(),
    queryFn: () => tenantAdminService.getSubscription(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ============================================================================
// Feature Flags Hooks
// ============================================================================

/**
 * Get current tenant feature flags (read-only)
 * Tenant admins can view but not modify feature flags
 */
export function useTenantFlags() {
  return useQuery({
    queryKey: queryKeys.tenantAdmin.flags(),
    queryFn: () => tenantAdminService.getFlags(),
    staleTime: 10 * 60 * 1000, // 10 minutes - flags don't change often
  });
}

// ============================================================================
// Branding Hooks
// ============================================================================

/**
 * Get current tenant branding configuration
 */
export function useTenantBranding() {
  return useQuery({
    queryKey: queryKeys.tenantAdmin.branding(),
    queryFn: () => tenantAdminService.getBranding(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Update tenant branding configuration mutation
 */
export function useUpdateTenantBranding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateBrandingRequest) => tenantAdminService.updateBranding(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tenantAdmin.branding() });
      // Also invalidate capabilities as branding may affect display
      queryClient.invalidateQueries({ queryKey: queryKeys.tenantAdmin.capabilities() });
    },
  });
}

// ============================================================================
// Integration Hooks
// ============================================================================

/**
 * Get list of all integrations with their status
 * API keys are masked for security
 */
export function useTenantIntegrations() {
  return useQuery({
    queryKey: queryKeys.tenantAdmin.integrations.list(),
    queryFn: () => tenantAdminService.getIntegrations(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Configure an integration mutation
 * @param provider - Integration provider (visma, rco, acos, outlook, vipps)
 */
export function useUpdateTenantIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ provider, data }: { provider: string; data: UpdateIntegrationRequest }) =>
      tenantAdminService.updateIntegration(provider, data),
    onSuccess: (_, { provider }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tenantAdmin.integrations.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.tenantAdmin.integrations.provider(provider) });
      // Also invalidate capabilities as integrations may affect available features
      queryClient.invalidateQueries({ queryKey: queryKeys.tenantAdmin.capabilities() });
    },
  });
}
