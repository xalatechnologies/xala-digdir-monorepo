/**
 * Feature Flags Hooks
 * React hooks for tenant-controlled feature access
 */

import { useQuery } from '@tanstack/react-query';
import { getClient } from '@/core/client-factory';
import { queryKeys } from './query-keys';
import type { TenantFeatures, RentalObjectCategory } from '@/types/feature-flags';

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Get tenant features
 * Returns enabled categories and feature flags for the current tenant
 *
 * @example
 * ```typescript
 * const { data: features } = useTenantFeatures();
 * console.log(features.enabledRentalObjectCategories); // ['LOCALE', 'ARRANGEMENT']
 * console.log(features.featureFlags['backoffice.reporting']); // true/false
 * ```
 */
export function useTenantFeatures() {
  return useQuery({
    queryKey: queryKeys.features.tenant(),
    queryFn: async () => {
      const response = await getClient().get<{ data: TenantFeatures }>('/api/me/features');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - features don't change often
    gcTime: 10 * 60 * 1000,   // 10 minutes cache
  });
}

// ============================================================================
// Helper Hooks
// ============================================================================

/**
 * Check if a specific feature is enabled
 *
 * @param featureKey - The feature flag key to check
 * @returns boolean indicating if the feature is enabled
 *
 * @example
 * ```typescript
 * const canViewReports = useFeature('backoffice.reporting');
 * if (canViewReports) {
 *   // Show reports link
 * }
 * ```
 */
export function useFeature(featureKey: string): boolean {
  const { data } = useTenantFeatures();
  return data?.featureFlags[featureKey] === true;
}

/**
 * Check if a rental object category is enabled
 *
 * @param category - The category to check
 * @returns boolean indicating if the category is enabled
 *
 * @example
 * ```typescript
 * const canUseArrangements = useCategory('ARRANGEMENT');
 * if (canUseArrangements) {
 *   // Show arrangement creation option
 * }
 * ```
 */
export function useCategory(category: RentalObjectCategory | string): boolean {
  const { data } = useTenantFeatures();
  return data?.enabledRentalObjectCategories.includes(category as RentalObjectCategory) || false;
}

/**
 * Get all enabled rental object categories
 *
 * @returns Array of enabled category strings
 *
 * @example
 * ```typescript
 * const categories = useEnabledCategories();
 * // ['LOCALE', 'ARRANGEMENT']
 * ```
 */
export function useEnabledCategories(): RentalObjectCategory[] {
  const { data } = useTenantFeatures();
  return data?.enabledRentalObjectCategories || [];
}

/**
 * Get all feature flags as an object
 *
 * @returns Object with all feature flags
 *
 * @example
 * ```typescript
 * const flags = useFeatureFlags();
 * if (flags['backoffice.reporting']) {
 *   // Feature is enabled
 * }
 * ```
 */
export function useFeatureFlags(): Record<string, boolean> {
  const { data } = useTenantFeatures();
  return data?.featureFlags || {};
}

/**
 * Check if tenant features are loading
 *
 * @returns boolean indicating loading state
 */
export function useFeaturesLoading(): boolean {
  const { isLoading } = useTenantFeatures();
  return isLoading;
}

/**
 * Check if any of the provided features are enabled
 *
 * @param features - Array of feature keys to check
 * @returns boolean indicating if ANY feature is enabled
 *
 * @example
 * ```typescript
 * const hasAnyReporting = useAnyFeature(['backoffice.reporting', 'backoffice.auditLog']);
 * ```
 */
export function useAnyFeature(features: string[]): boolean {
  const flags = useFeatureFlags();
  return features.some(feature => flags[feature] === true);
}

/**
 * Check if all of the provided features are enabled
 *
 * @param features - Array of feature keys to check
 * @returns boolean indicating if ALL features are enabled
 *
 * @example
 * ```typescript
 * const hasAllFeatures = useAllFeatures(['backoffice.messaging', 'backoffice.auditLog']);
 * ```
 */
export function useAllFeatures(features: string[]): boolean {
  const flags = useFeatureFlags();
  return features.every(feature => flags[feature] === true);
}
