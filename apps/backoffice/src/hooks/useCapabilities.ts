/**
 * useCapabilities Hook
 *
 * Provides capability-based permission checks for the backoffice RBAC system.
 * Use this hook instead of direct role comparisons for cleaner, more maintainable code.
 *
 * @example
 * ```t('common.tsx_function_listingactions_const') ```
 */

import { useMemo } from 'react';
import { useBackofficeRole } from './useBackofficeRole';
import {
  type Capability,
  type EffectiveBackofficeRole,
  getCapabilitiesForRole,
  roleHasCapability,
} from '../lib/capabilities';
import { useT } from '@xalatechnologies/platform/i18n';

// =============================================================================
// Re-exports for convenience
// =============================================================================

export type { Capability, EffectiveBackofficeRole } from '../lib/capabilities';
export { ROLE_CAPABILITIES } from '../lib/capabilities';

// =============================================================================
// Hook Return Type
// =============================================================================

export interface UseCapabilitiesReturn {
  /**
   * Check if the current role has a specific capability.
   * @param capability - The capability to check
   * @returns true if the role has the capability, false otherwise
   */
  hasCapability: (capability: Capability) => boolean;

  /**
   * Check if the current role has at least one of the specified capabilities.
   * @param capabilities - Array of capabilities to check
   * @returns true if the role has any of the capabilities, false otherwise
   */
  hasAnyCapability: (capabilities: Capability[]) => boolean;

  /**
   * Check if the current role has all of the specified capabilities.
   * @param capabilities - Array of capabilities to check
   * @returns true if the role has all capabilities, false otherwise
   */
  hasAllCapabilities: (capabilities: Capability[]) => boolean;

  /**
   * Throws an error if the current role doesn't have the specified capability.
   * Use for imperative permission checks (e.g., before API calls).
   * @param capability - The required capability
   * @throws Error if the capability is not granted
   */
  requireCapability: (capability: Capability) => void;

  /**
   * Array of all capabilities granted to the current role.
   */
  capabilities: Capability[];

  /**
   * The current effective role (admin or case_handler).
   * Undefined if no role is selected.
   */
  effectiveRole: EffectiveBackofficeRole | undefined;
}

// =============================================================================
// Hook Implementation
// =============================================================================

/**
 * Hook for capability-based permission checks.
 *
 * Provides a cleaner alternative to direct role comparisons.
 * Uses the effective backoffice role from BackofficeRoleProvider.
 *
 * Must be used within a BackofficeRoleProvider.
 *
 * @returns {UseCapabilitiesReturn} Capability checking methods and state
 *
 * @example
 * ```tsx
 * // Basic capability check
 * function EditButton() {
 *   const { hasCapability } = useCapabilities();
 *
 *   if (!hasCapability('CAP_LISTING_EDIT')) {
 *     return null;
 *   }
 *
 *   return <Button>{t('common.edit_listing')}</Button>;
 * }
 *
 * // Multiple capability check
 * function AdminSection() {
 *   const { hasAllCapabilities } = useCapabilities();
 *
 *   if (!hasAllCapabilities(['CAP_USER_ADMIN', 'CAP_SETTINGS_ADMIN'])) {
 *     return <AccessDenied />;
 *   }
 *
 *   return <AdminPanel />;
 * }
 *
 * // Imperative check before action
 * function DeleteAction() {
 *   const { requireCapability } = useCapabilities();
 *
 *   const handleDelete = async () => {
 *     try {
 *       requireCapability('CAP_USER_ADMIN');
 *       await deleteUser(userId);
 *     } catch (error) {
 *       // Handle permission denied
 *     }
 *   };
 *
 *   return <Button onClick={handleDelete}>Delete</Button>;
 * }
 * ```
 */
export function useCapabilities(): UseCapabilitiesReturn {
  const { effectiveRole } = useBackofficeRole();
  const t = useT();

  // Memoize capabilities array to avoid unnecessary recalculations
  const capabilities = useMemo(
    () => getCapabilitiesForRole(effectiveRole),
    [effectiveRole]
  );

  const hasCapability = (capability: Capability): boolean => {
    return roleHasCapability(effectiveRole, capability);
  };

  const hasAnyCapability = (caps: Capability[]): boolean => {
    return caps.some((cap) => hasCapability(cap));
  };

  const hasAllCapabilities = (caps: Capability[]): boolean => {
    return caps.every((cap) => hasCapability(cap));
  };

  const requireCapability = (capability: Capability): void => {
    if (!hasCapability(capability)) {
      throw new Error(t('error.capabilityDenied', { capability }));
    }
  };

  return {
    hasCapability,
    hasAnyCapability,
    hasAllCapabilities,
    requireCapability,
    capabilities,
    effectiveRole,
  };
}

/**
 * Convenience hook to check a single capability.
 * Returns true if the current role has the specified capability.
 */
export function useHasCapability(capability: Capability): boolean {
  const { hasCapability } = useCapabilities();
  return hasCapability(capability);
}

/**
 * Convenience hook to check if the current role has all specified capabilities.
 */
export function useHasAllCapabilities(capabilities: Capability[]): boolean {
  const { hasAllCapabilities } = useCapabilities();
  return hasAllCapabilities(capabilities);
}

/**
 * Convenience hook to check if the current role has any of the specified capabilities.
 */
export function useHasAnyCapability(capabilities: Capability[]): boolean {
  const { hasAnyCapability } = useCapabilities();
  return hasAnyCapability(capabilities);
}
