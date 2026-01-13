/**
 * Settings Hooks
 * React Query hooks for tenant settings operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTenantSettings,
  updateTenantSettings,
  getIntegrationSettings,
  updateIntegrationSettings,
} from '../services/api';
import type { TenantSettings } from '../types/api';

// Query keys for cache management
export const settingsKeys = {
  all: ['settings'] as const,
  tenant: () => [...settingsKeys.all, 'tenant'] as const,
  integrations: () => [...settingsKeys.all, 'integrations'] as const,
};

/**
 * Get tenant settings
 */
export function useTenantSettings() {
  return useQuery({
    queryKey: settingsKeys.tenant(),
    queryFn: () => getTenantSettings(),
  });
}

/**
 * Update tenant settings
 */
export function useUpdateTenantSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<TenantSettings>) => updateTenantSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.tenant() });
    },
  });
}

/**
 * Get integration settings
 */
export function useIntegrationSettings() {
  return useQuery({
    queryKey: settingsKeys.integrations(),
    queryFn: () => getIntegrationSettings(),
  });
}

/**
 * Update integration settings for a provider
 */
export function useUpdateIntegrationSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ provider, data }: { provider: string; data: Record<string, unknown> }) =>
      updateIntegrationSettings(provider, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.integrations() });
    },
  });
}
