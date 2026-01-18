import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { useCapabilities } from '@digilist/client-sdk/hooks';
import { useBackofficeRole } from '../hooks/useBackofficeRole';
import {
import { useT } from '@xala/i18n';
  type Capability,
  type EffectiveBackofficeRole,
  getCapabilitiesForRole,
  roleHasCapability,
} from '../lib/capabilities';
import type { UserCapabilities } from '@digilist/client-sdk/types';

/**
 * Capability Provider
 * Manages user capabilities for capability-based access control in the backoffice.
 *
 * Features:
 * - Fetches API capabilities via SDK useCapabilities hook
 * - Derives local capabilities from effective role
 * - Provides unified capability checking interface
 * - Supports both local capability checks and API-based global capabilities
 */

// =============================================================================
// Types
// =============================================================================

export interface CapabilityContextState {
  /** Local capabilities derived from effective role */
  localCapabilities: Capability[];
  /** API capabilities projection (if available) */
  apiCapabilities: UserCapabilities | null;
  /** Whether capabilities are being loaded */
  isLoading: boolean;
  /** Error from loading capabilities */
  error: Error | null;
}

export interface CapabilityContextValue extends CapabilityContextState {
  /** Check if user has a specific local capability */
  hasCapability: (capability: Capability) => boolean;
  /** Check if user has any of the specified capabilities */
  hasAnyCapability: (capabilities: Capability[]) => boolean;
  /** Check if user has all of the specified capabilities */
  hasAllCapabilities: (capabilities: Capability[]) => boolean;
  /** Check if user has a global capability from API */
  hasGlobalCapability: (capability: keyof UserCapabilities['globalCapabilities']) => boolean;
  /** Get the effective role */
  effectiveRole: EffectiveBackofficeRole | null;
  /** Refresh capabilities from API */
  refetch: () => void;
}

// =============================================================================
// Context
// =============================================================================

const CapabilityContext = createContext<CapabilityContextValue | undefined>(undefined);

// =============================================================================
// Provider Component
// =============================================================================

interface CapabilityProviderProps {
  children: React.ReactNode;
}

export const CapabilityProvider: React.FC<CapabilityProviderProps> = ({
  children,
}) => {
  // Get the effective role from BackofficeRoleProvider
  const { effectiveRole, hasSelectedRole, isInitializing } = useBackofficeRole();

  // Fetch API capabilities via SDK hook
  // Only fetch when user has selected a role (or was auto-assigned)
  const {
    data: capabilitiesResponse,
    isLoading: isLoadingApi,
    error: apiError,
    refetch,
  } = useCapabilities({
    enabled: hasSelectedRole && !isInitializing,
  });

  // Derive local capabilities from effective role
  const localCapabilities = useMemo<Capability[]>(() => {
    return getCapabilitiesForRole(effectiveRole ?? undefined);
  }, [effectiveRole]);

  // Extract API capabilities from response
  const apiCapabilities = useMemo<UserCapabilities | null>(() => {
    return capabilitiesResponse?.data ?? null;
  }, [capabilitiesResponse]);

  // Combined loading state
  const isLoading = isInitializing || isLoadingApi;

  // Error handling
  const error = apiError instanceof Error ? apiError : null;

  // Method: Check if user has a specific local capability
  const hasCapability = useCallback(
    (capability: Capability): boolean => {
      return roleHasCapability(effectiveRole ?? undefined, capability);
    },
    [effectiveRole]
  );

  // Method: Check if user has any of the specified capabilities
  const hasAnyCapability = useCallback(
    (capabilities: Capability[]): boolean => {
      return capabilities.some((cap) => hasCapability(cap));
    },
    [hasCapability]
  );

  // Method: Check if user has all of the specified capabilities
  const hasAllCapabilities = useCallback(
    (capabilities: Capability[]): boolean => {
      return capabilities.every((cap) => hasCapability(cap));
    },
    [hasCapability]
  );

  // Method: Check if user has a global capability from API
  const hasGlobalCapability = useCallback(
    (capability: keyof UserCapabilities['globalCapabilities']): boolean => {
      return apiCapabilities?.globalCapabilities?.[capability] ?? false;
    },
    [apiCapabilities]
  );

  // Method: Refetch capabilities
  const handleRefetch = useCallback(() => {
    refetch();
  }, [refetch]);

  // Memoized context value
  const value = useMemo<CapabilityContextValue>(
    () => ({
      localCapabilities,
      apiCapabilities,
      isLoading,
      error,
      effectiveRole,
      hasCapability,
      hasAnyCapability,
      hasAllCapabilities,
      hasGlobalCapability,
      refetch: handleRefetch,
    }),
    [
      localCapabilities,
      apiCapabilities,
      isLoading,
      error,
      effectiveRole,
      hasCapability,
      hasAnyCapability,
      hasAllCapabilities,
      hasGlobalCapability,
      handleRefetch,
    ]
  );

  return (
    <CapabilityContext.Provider value={value}>
      {children}
    </CapabilityContext.Provider>
  );
};

// =============================================================================
// Hook
// =============================================================================

/**
 * Hook to access capability context.
 * Must be used within a CapabilityProvider.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { hasCapability, hasGlobalCapability } = useCapabilityContext();
 *
 *   // Check local capability (derived from role)
 *   if (hasCapability('CAP_BOOKING_APPROVE')) {
 *     return <ApproveButton />;
 *   }
 *
 *   // Check API capability (global feature flag)
 *   if (hasGlobalCapability('canManageAccessGrants')) {
 *     return <AccessGrantsPanel />;
 *   }
 *
 *   return null;
 * }
 * ```
 */
export function useCapabilityContext(): CapabilityContextValue {
  const context = useContext(CapabilityContext);
  if (context === undefined) {
  const t = useT();
    throw new Error('useCapabilityContext must be used within a CapabilityProvider');
  }
  return context;
}

// =============================================================================
// Convenience Hooks
// =============================================================================

/**
 * Hook for checking a single capability.
 * Returns true if the user has the specified capability.
 *
 * @param capability - The capability to check
 * @returns Whether the user has the capability
 *
 * @example
 * ```tsx
 * function BookingApproval() {
 *   const canApprove = useHasCapability('CAP_BOOKING_APPROVE');
 *
 *   if (!canApprove) return null;
 *   return <ApproveButton />;
 * }
 * ```
 */
export function useHasCapability(capability: Capability): boolean {
  const { hasCapability } = useCapabilityContext();
  return hasCapability(capability);
}

/**
 * Hook for checking multiple capabilities (any).
 * Returns true if the user has at least one of the specified capabilities.
 *
 * @param capabilities - The capabilities to check
 * @returns Whether the user has any of the capabilities
 *
 * @example
 * ```t('common.tsx_function_listingactions_const') ```
 */
export function useHasAnyCapability(capabilities: Capability[]): boolean {
  const { hasAnyCapability } = useCapabilityContext();
  return hasAnyCapability(capabilities);
}

/**
 * Hook for checking multiple capabilities (all).
 * Returns true if the user has all of the specified capabilities.
 *
 * @param capabilities - The capabilities to check
 * @returns Whether the user has all of the capabilities
 *
 * @example
 * ```tsx
 * function AdminSettings() {
 *   const canManageAll = useHasAllCapabilities([
 *     'CAP_USER_ADMIN',
 *     'CAP_ORG_ADMIN',
 *     'CAP_SETTINGS_ADMIN'
 *   ]);
 *
 *   if (!canManageAll) return null;
 *   return <FullAdminPanel />;
 * }
 * ```
 */
export function useHasAllCapabilities(capabilities: Capability[]): boolean {
  const { hasAllCapabilities } = useCapabilityContext();
  return hasAllCapabilities(capabilities);
}

/**
 * Hook for checking a global capability from API.
 * Returns true if the user has the specified global capability.
 *
 * @param capability - The global capability to check
 * @returns Whether the user has the global capability
 *
 * @example
 * ```tsx
 * function AccessGrantsTab() {
 *   const canManageGrants = useHasGlobalCapability('canManageAccessGrants');
 *
 *   if (!canManageGrants) return null;
 *   return <AccessGrantsPanel />;
 * }
 * ```
 */
export function useHasGlobalCapability(
  capability: keyof UserCapabilities['globalCapabilities']
): boolean {
  const { hasGlobalCapability } = useCapabilityContext();
  return hasGlobalCapability(capability);
}

/**
 * Hook for getting all current capabilities.
 * Useful for debugging or displaying capability information.
 *
 * @returns Object with local and API capabilities, plus loading state
 *
 * @example
 * ```tsx
 * function CapabilityDebugger() {
 *   const { localCapabilities, apiCapabilities, isLoading } = useCapabilities();
 *
 *   if (isLoading) return <Spinner />;
 *
 *   return (
 *     <pre>{JSON.stringify({ localCapabilities, apiCapabilities }, null, 2)}</pre>
 *   );
 * }
 * ```
 */
export function useCapabilitiesState() {
  const { localCapabilities, apiCapabilities, isLoading, error, effectiveRole } =
    useCapabilityContext();

  return {
    localCapabilities,
    apiCapabilities,
    isLoading,
    error,
    effectiveRole,
  };
}
