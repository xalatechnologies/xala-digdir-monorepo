/**
 * RBAC Hook Wrapper
 * 
 * Thin wrapper around SDK capabilities hooks.
 * Replaces client-side RBAC logic with server-driven capabilities.
 * 
 * @deprecated This wrapper maintains backward compatibility.
 * Prefer using useCapabilities() or useBackofficeCapabilities() directly from @digilist/client-sdk
 */

import { useCapabilities, useHasPermission } from '@digilist/client-sdk';

/**
 * Legacy permission types for backward compatibility
 * These map to server capabilities
 */
export type Permission =
  | 'bookings.view'
  | 'bookings.approve'
  | 'bookings.reject'
  | 'bookings.cancel'
  | 'listings.view'
  | 'listings.create'
  | 'listings.edit'
  | 'listings.delete'
  | 'users.view'
  | 'users.manage'
  | 'settings.view'
  | 'settings.edit'
  | 'reports.view'
  | 'reports.export';

/**
 * Map legacy permission strings to capability strings
 * This mapping should match server-side capability definitions
 */
const PERMISSION_TO_CAPABILITY: Record<Permission, string> = {
  'bookings.view': 'bookings:view',
  'bookings.approve': 'bookings:approve',
  'bookings.reject': 'bookings:reject',
  'bookings.cancel': 'bookings:cancel',
  'listings.view': 'rental-objects:view',
  'listings.create': 'rental-objects:create',
  'listings.edit': 'rental-objects:edit',
  'listings.delete': 'rental-objects:delete',
  'users.view': 'users:view',
  'users.manage': 'users:manage',
  'settings.view': 'settings:view',
  'settings.edit': 'settings:edit',
  'reports.view': 'reports:view',
  'reports.export': 'reports:export',
};

/**
 * Hook for checking permissions
 * 
 * Uses server-driven capabilities API instead of client-side role mapping.
 * This ensures permissions are always in sync with server-side authorization.
 * 
 * @example
 * ```tsx
 * function AdminPanel() {
 *   const { hasPermission } = useRBAC();
 *   
 *   if (!hasPermission('bookings.approve')) {
 *     return <AccessDenied />;
 *   }
 *   
 *   return <BookingsPanel />;
 * }
 * ```
 */
export function useRBAC() {
  const { data: capabilitiesData, isLoading } = useCapabilities();
  const capabilities = capabilitiesData?.data?.capabilities ?? [];

  /**
   * Check if user has a specific permission
   * Maps legacy permission string to capability and checks against server capabilities
   */
  const hasPermission = (permission: Permission): boolean => {
    if (isLoading) return false;
    
    const capability = PERMISSION_TO_CAPABILITY[permission];
    if (!capability) return false;
    
    // Check if capability is in the capabilities array
    // Capabilities format: "resource:action" (e.g., "bookings:view")
    return capabilities.includes(capability);
  };

  /**
   * Check if user has any of the specified permissions
   */
  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some((p) => hasPermission(p));
  };

  /**
   * Check if user has all of the specified permissions
   */
  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every((p) => hasPermission(p));
  };

  /**
   * Require a permission, throw error if not granted
   */
  const requirePermission = (permission: Permission): void => {
    if (!hasPermission(permission)) {
      throw new Error(`Permission denied: ${permission}`);
    }
  };

  // Get current user's permissions list (for backward compatibility)
  const permissions: Permission[] = Object.keys(PERMISSION_TO_CAPABILITY).filter(
    (p) => hasPermission(p as Permission)
  ) as Permission[];

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    requirePermission,
    permissions,
    isLoading,
  };
}
