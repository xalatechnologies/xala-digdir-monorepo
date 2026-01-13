/**
 * Role-Based Access Control (RBAC) utilities
 *
 * This module provides a flexible RBAC system that can be used
 * with any authentication context.
 */

// =============================================================================
// Permission Types
// =============================================================================

/**
 * Available permission keys in the system (string union type)
 * Format: "resource.action"
 */
export type PermissionKey =
  // Booking permissions
  | 'bookings.view'
  | 'bookings.create'
  | 'bookings.approve'
  | 'bookings.reject'
  | 'bookings.cancel'
  // Listing permissions
  | 'listings.view'
  | 'listings.create'
  | 'listings.edit'
  | 'listings.delete'
  // User management permissions
  | 'users.view'
  | 'users.create'
  | 'users.edit'
  | 'users.delete'
  | 'users.manage'
  // Settings permissions
  | 'settings.view'
  | 'settings.edit'
  // Reports permissions
  | 'reports.view'
  | 'reports.export'
  // Organization permissions
  | 'organizations.view'
  | 'organizations.create'
  | 'organizations.edit'
  | 'organizations.delete'
  // Seasonal lease permissions
  | 'seasonal-leases.view'
  | 'seasonal-leases.create'
  | 'seasonal-leases.edit'
  | 'seasonal-leases.delete'
  // Message permissions
  | 'messages.view'
  | 'messages.send';

/**
 * Role types for the backoffice
 */
export type BackofficeRole = 'admin' | 'saksbehandler' | 'user';

/**
 * Role types for the web app
 */
export type WebRole = 'user' | 'organization_admin' | 'guest';

// =============================================================================
// Role Permission Configuration
// =============================================================================

/**
 * Default permission configuration for backoffice roles
 */
export const BACKOFFICE_ROLE_PERMISSIONS: Record<BackofficeRole, PermissionKey[]> = {
  admin: [
    'bookings.view',
    'bookings.create',
    'bookings.approve',
    'bookings.reject',
    'bookings.cancel',
    'listings.view',
    'listings.create',
    'listings.edit',
    'listings.delete',
    'users.view',
    'users.create',
    'users.edit',
    'users.delete',
    'users.manage',
    'settings.view',
    'settings.edit',
    'reports.view',
    'reports.export',
    'organizations.view',
    'organizations.create',
    'organizations.edit',
    'organizations.delete',
    'seasonal-leases.view',
    'seasonal-leases.create',
    'seasonal-leases.edit',
    'seasonal-leases.delete',
    'messages.view',
    'messages.send',
  ],
  saksbehandler: [
    'bookings.view',
    'bookings.approve',
    'bookings.reject',
    'bookings.cancel',
    'listings.view',
    'reports.view',
    'organizations.view',
    'seasonal-leases.view',
    'messages.view',
    'messages.send',
  ],
  user: [
    'bookings.view',
    'listings.view',
  ],
};

/**
 * Default permission configuration for web app roles
 */
export const WEB_ROLE_PERMISSIONS: Record<WebRole, PermissionKey[]> = {
  user: [
    'bookings.view',
    'bookings.create',
    'listings.view',
    'messages.view',
    'messages.send',
  ],
  organization_admin: [
    'bookings.view',
    'bookings.create',
    'bookings.cancel',
    'listings.view',
    'reports.view',
    'messages.view',
    'messages.send',
  ],
  guest: [
    'listings.view',
  ],
};

// =============================================================================
// RBAC Utility Functions
// =============================================================================

/**
 * Configuration options for RBAC
 */
export interface RBACConfig<TRole extends string = string> {
  rolePermissions: Record<TRole, PermissionKey[]>;
  defaultPermissions?: PermissionKey[];
}

/**
 * RBAC result with permission checking methods
 */
export interface RBACResult {
  /** Check if user has a specific permission */
  hasPermission: (permission: PermissionKey) => boolean;
  /** Check if user has any of the given permissions */
  hasAnyPermission: (permissions: PermissionKey[]) => boolean;
  /** Check if user has all of the given permissions */
  hasAllPermissions: (permissions: PermissionKey[]) => boolean;
  /** Throw error if user doesn't have permission */
  requirePermission: (permission: PermissionKey) => void;
  /** List of all permissions for the current role */
  permissions: PermissionKey[];
}

/**
 * Create RBAC utilities for a given role
 *
 * @example
 * ```ts
 * const rbac = createRBAC('admin', { rolePermissions: BACKOFFICE_ROLE_PERMISSIONS });
 * if (rbac.hasPermission('bookings.approve')) {
 *   // User can approve bookings
 * }
 * ```
 */
export function createRBAC<TRole extends string>(
  role: TRole | null | undefined,
  config: RBACConfig<TRole>
): RBACResult {
  const permissions = role
    ? (config.rolePermissions[role] ?? config.defaultPermissions ?? [])
    : (config.defaultPermissions ?? []);

  const hasPermission = (permission: PermissionKey): boolean => {
    return permissions.includes(permission);
  };

  const hasAnyPermission = (perms: PermissionKey[]): boolean => {
    return perms.some((p) => hasPermission(p));
  };

  const hasAllPermissions = (perms: PermissionKey[]): boolean => {
    return perms.every((p) => hasPermission(p));
  };

  const requirePermission = (permission: PermissionKey): void => {
    if (!hasPermission(permission)) {
      throw new Error(`Permission denied: ${permission}`);
    }
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    requirePermission,
    permissions,
  };
}

/**
 * Create RBAC utilities for backoffice roles
 */
export function createBackofficeRBAC(role: BackofficeRole | null | undefined): RBACResult {
  return createRBAC(role, { rolePermissions: BACKOFFICE_ROLE_PERMISSIONS });
}

/**
 * Create RBAC utilities for web app roles
 */
export function createWebRBAC(role: WebRole | null | undefined): RBACResult {
  return createRBAC(role, {
    rolePermissions: WEB_ROLE_PERMISSIONS,
    defaultPermissions: WEB_ROLE_PERMISSIONS.guest,
  });
}
