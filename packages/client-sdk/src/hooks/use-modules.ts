/**
 * Modules Hooks
 * React Query hooks for module-based feature flags
 *
 * Provides reactive access to module states and capabilities
 * for UI gating and conditional rendering.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { modulesService, type UpdateModuleDTO } from '@/services/modules.service';

// =============================================================================
// Query Keys
// =============================================================================

export const moduleKeys = {
  all: ['modules'] as const,
  catalog: () => [...moduleKeys.all, 'catalog'] as const,
  effective: () => [...moduleKeys.all, 'effective'] as const,
  detail: (key: string) => [...moduleKeys.all, 'detail', key] as const,
};

// =============================================================================
// Query Hooks
// =============================================================================

/**
 * Get module catalog (all available modules)
 * Returns metadata for all modules without tenant-specific states
 *
 * @example
 * ```tsx
 * const { data: catalog } = useModuleCatalog();
 * catalog?.data.modules.map(m => (
 *   <ModuleCard key={m.key} module={m} />
 * ))
 * ```
 */
export function useModuleCatalog() {
  return useQuery({
    queryKey: moduleKeys.catalog(),
    queryFn: () => modulesService.getCatalog(),
    staleTime: 1000 * 60 * 60, // 1 hour - catalog rarely changes
  });
}

/**
 * Get effective modules for current tenant/org
 * Returns resolved module states and computed capabilities
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useEffectiveModules();
 * const capabilities = data?.data.capabilities || {};
 *
 * if (capabilities.ratings) {
 *   return <RatingsSection />;
 * }
 * ```
 */
export function useEffectiveModules() {
  return useQuery({
    queryKey: moduleKeys.effective(),
    queryFn: () => modulesService.getEffective(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Get single module state
 *
 * @param key - Module key (e.g., 'RATINGS')
 */
export function useModule(key: string | undefined) {
  return useQuery({
    queryKey: moduleKeys.detail(key!),
    queryFn: () => modulesService.getModule(key!),
    enabled: !!key,
  });
}

// =============================================================================
// Convenience Hooks
// =============================================================================

/**
 * Check if a module is enabled
 * Lightweight hook for conditional rendering
 *
 * @param moduleKey - Module key to check
 * @returns Boolean indicating if module is enabled
 *
 * @example
 * ```tsx
 * const isRatingsEnabled = useIsModuleEnabled('RATINGS');
 *
 * if (!isRatingsEnabled) {
 *   return <FeatureNotAvailable />;
 * }
 * return <RatingsManager />;
 * ```
 */
export function useIsModuleEnabled(moduleKey: string) {
  const { data, isLoading } = useEffectiveModules();

  if (isLoading || !data) {
    return false;
  }

  const module = data.data.modules.find((m) => m.key === moduleKey);
  return module?.enabled ?? false;
}

/**
 * Check if a capability is available
 * Capabilities are derived from enabled modules
 *
 * @param capability - Capability name (e.g., 'ratings', 'messaging')
 *
 * @example
 * ```tsx
 * const canRate = useHasCapability('ratings');
 * const canMessage = useHasCapability('messaging');
 * ```
 */
export function useHasCapability(capability: string) {
  const { data, isLoading } = useEffectiveModules();

  if (isLoading || !data) {
    return false;
  }

  return data.data.capabilities[capability] === true;
}

/**
 * Get all capabilities as a record
 * Useful for bulk capability checks
 *
 * @example
 * ```tsx
 * const caps = useCapabilities();
 * const navItems = allNavItems.filter(item =>
 *   !item.requiredCapability || caps[item.requiredCapability]
 * );
 * ```
 */
export function useCapabilities(): Record<string, boolean> {
  const { data } = useEffectiveModules();
  return data?.data.capabilities ?? {};
}

/**
 * Get all enabled module keys
 * Useful for module-based routing or filtering
 */
export function useEnabledModules(): string[] {
  const { data } = useEffectiveModules();
  return data?.data.modules.filter((m) => m.enabled).map((m) => m.key) ?? [];
}

// =============================================================================
// Mutation Hooks
// =============================================================================

/**
 * Update module state (admin only)
 *
 * @example
 * ```tsx
 * const { mutate: toggleModule } = useToggleModule();
 *
 * toggleModule({
 *   key: 'RATINGS',
 *   update: { enabled: true }
 * });
 * ```
 */
export function useToggleModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, update }: { key: string; update: UpdateModuleDTO }) =>
      modulesService.setModuleState(key, update),
    onSuccess: (_, { key }) => {
      queryClient.invalidateQueries({ queryKey: moduleKeys.detail(key) });
      queryClient.invalidateQueries({ queryKey: moduleKeys.effective() });
    },
  });
}

// =============================================================================
// Combined Hook for Module Manager UI
// =============================================================================

/**
 * Combined hook for module management UI
 * Returns catalog, effective states, and mutation
 */
export function useModulesManager() {
  const catalog = useModuleCatalog();
  const effective = useEffectiveModules();
  const toggle = useToggleModule();

  return {
    catalog: catalog.data?.data,
    effective: effective.data?.data,
    isLoading: catalog.isLoading || effective.isLoading,
    error: catalog.error || effective.error,
    toggleModule: toggle.mutate,
    isToggling: toggle.isPending,
  };
}
