/**
 * App-Specific Capabilities Hooks
 *
 * Provides React Query hooks for fetching app-specific capabilities
 * from the server. Replaces client-side capability mapping.
 *
 * Types are imported from @xala/contracts for schema-agnostic architecture.
 *
 * @example
 * ```tsx
 * // In backoffice app
 * function AdminPanel() {
 *   const { data, isLoading } = useBackofficeCapabilities();
 *
 *   if (isLoading) return <Spinner />;
 *
 *   const { capabilities, uiHints } = data?.data ?? {};
 *
 *   if (!capabilities?.includes('CAP_SETTINGS_VIEW')) {
 *     return <AccessDenied />;
 *   }
 *
 *   return <SettingsPanel />;
 * }
 * ```
 */

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getClient } from '@/core/client-factory';
import type { CapabilitiesProjection } from '@digilist/contracts/projections';

// =============================================================================
// Types
// =============================================================================

/**
 * App-specific capabilities response
 * 
 * @see CapabilitiesProjection from @xala/contracts
 */
export type AppCapabilities = CapabilitiesProjection;

/**
 * Capabilities API response wrapper
 */
export interface CapabilitiesApiResponse {
  data: AppCapabilities;
}

// =============================================================================
// Query Keys
// =============================================================================

const capabilitiesKeys = {
  all: ['capabilities'] as const,
  web: () => [...capabilitiesKeys.all, 'web'] as const,
  minside: () => [...capabilitiesKeys.all, 'minside'] as const,
  backoffice: () => [...capabilitiesKeys.all, 'backoffice'] as const,
};

// =============================================================================
// Hooks
// =============================================================================

/**
 * Hook to fetch web app capabilities
 *
 * Returns capabilities for the public web app.
 * Works for both authenticated and anonymous users.
 *
 * @returns Query result with web capabilities
 *
 * @example
 * ```tsx
 * function BookingButton() {
 *   const { data } = useWebCapabilities();
 *   const canBook = data?.data.capabilities.includes('CAP_BOOKING_CREATE');
 *
 *   if (!canBook) return null;
 *   return <Button>Book Now</Button>;
 * }
 * ```
 */
export function useWebCapabilities(): UseQueryResult<CapabilitiesApiResponse, Error> {
  return useQuery({
    queryKey: capabilitiesKeys.web(),
    queryFn: async () => {
      const response = await getClient().get<CapabilitiesApiResponse>(
        '/api/web/me/capabilities'
      );
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch minside (user portal) capabilities
 *
 * Returns capabilities for the authenticated user in minside.
 * Requires authentication.
 *
 * @returns Query result with minside capabilities
 *
 * @example
 * ```tsx
 * function ProfilePage() {
 *   const { data, isLoading, error } = useMinsideCapabilities();
 *
 *   if (error?.status === 401) {
 *     return <Navigate to="/login" />;
 *   }
 *
 *   const canEdit = data?.data.capabilities.includes('CAP_PROFILE_EDIT');
 *   return <Profile editable={canEdit} />;
 * }
 * ```
 */
export function useMinsideCapabilities(): UseQueryResult<CapabilitiesApiResponse, Error> {
  return useQuery({
    queryKey: capabilitiesKeys.minside(),
    queryFn: async () => {
      const response = await getClient().get<CapabilitiesApiResponse>(
        '/api/minside/me/capabilities'
      );
      return response;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error: Error & { status?: number }) => {
      // Don't retry on auth errors
      if (error.status === 401) return false;
      return failureCount < 3;
    },
  });
}

/**
 * Hook to fetch backoffice (admin portal) capabilities
 *
 * Returns role-specific capabilities for the admin portal.
 * Includes UI hints for navigation rendering.
 *
 * @returns Query result with backoffice capabilities
 *
 * @example
 * ```tsx
 * function BackofficeNav() {
 *   const { data } = useBackofficeCapabilities();
 *   const { uiHints } = data?.data ?? {};
 *
 *   return (
 *     <Nav>
 *       <NavLink to="/dashboard">Dashboard</NavLink>
 *       {uiHints?.showReports && <NavLink to="/reports">Reports</NavLink>}
 *       {uiHints?.showAudit && <NavLink to="/audit">Audit Log</NavLink>}
 *       {uiHints?.showSettings && <NavLink to="/settings">Settings</NavLink>}
 *     </Nav>
 *   );
 * }
 * ```
 */
export function useBackofficeCapabilities(): UseQueryResult<CapabilitiesApiResponse, Error> {
  return useQuery({
    queryKey: capabilitiesKeys.backoffice(),
    queryFn: async () => {
      const response = await getClient().get<CapabilitiesApiResponse>(
        '/api/backoffice/me/capabilities'
      );
      return response;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error: Error & { status?: number }) => {
      if (error.status === 401) return false;
      return failureCount < 3;
    },
  });
}

// =============================================================================
// Helper Hooks
// =============================================================================

/**
 * Hook to check if current user has a specific capability
 *
 * @param capability - The capability to check
 * @param app - Which app context ('web' | 'minside' | 'backoffice')
 * @returns Boolean indicating if capability is granted
 *
 * @example
 * ```tsx
 * function DeleteButton() {
 *   const canDelete = useHasCapability('CAP_RENTAL_OBJECT_DELETE', 'backoffice');
 *
 *   if (!canDelete) return null;
 *   return <Button variant="danger">Delete</Button>;
 * }
 * ```
 */
export function useHasCapability(
  capability: string,
  app: 'web' | 'minside' | 'backoffice' = 'backoffice'
): boolean {
  const hooks = {
    web: useWebCapabilities,
    minside: useMinsideCapabilities,
    backoffice: useBackofficeCapabilities,
  };

  const { data } = hooks[app]();
  return data?.data.capabilities.includes(capability) ?? false;
}

/**
 * Hook to check if current user has all specified capabilities
 *
 * @param capabilities - Array of capabilities to check
 * @param app - Which app context
 * @returns Boolean indicating if all capabilities are granted
 */
export function useHasAllCapabilities(
  capabilities: string[],
  app: 'web' | 'minside' | 'backoffice' = 'backoffice'
): boolean {
  const hooks = {
    web: useWebCapabilities,
    minside: useMinsideCapabilities,
    backoffice: useBackofficeCapabilities,
  };

  const { data } = hooks[app]();
  const userCapabilities = data?.data.capabilities ?? [];
  return capabilities.every((cap) => userCapabilities.includes(cap));
}

/**
 * Hook to check if current user has any of specified capabilities
 *
 * @param capabilities - Array of capabilities to check
 * @param app - Which app context
 * @returns Boolean indicating if any capability is granted
 */
export function useHasAnyCapability(
  capabilities: string[],
  app: 'web' | 'minside' | 'backoffice' = 'backoffice'
): boolean {
  const hooks = {
    web: useWebCapabilities,
    minside: useMinsideCapabilities,
    backoffice: useBackofficeCapabilities,
  };

  const { data } = hooks[app]();
  const userCapabilities = data?.data.capabilities ?? [];
  return capabilities.some((cap) => userCapabilities.includes(cap));
}

/**
 * Hook to get a specific feature flag value
 *
 * @param flagName - Name of the feature flag
 * @param app - Which app context
 * @returns Boolean value of the feature flag (false if not set)
 */
export function useFeatureFlag(
  flagName: string,
  app: 'web' | 'minside' | 'backoffice' = 'backoffice'
): boolean {
  const hooks = {
    web: useWebCapabilities,
    minside: useMinsideCapabilities,
    backoffice: useBackofficeCapabilities,
  };

  const { data } = hooks[app]();
  return data?.data.featureFlags[flagName] ?? false;
}

// =============================================================================
// Exports
// =============================================================================

export { capabilitiesKeys };
