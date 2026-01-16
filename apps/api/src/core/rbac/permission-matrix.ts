/**
 * Shared Permission Matrix
 * Single source of truth for role-based permissions across the API
 *
 * This file is imported by:
 * - rbac.middleware.ts (for permission checks)
 * - authz.controller.ts (for permission queries)
 *
 * Role Hierarchy:
 * 1. System-level roles (admin, saksbehandler, user)
 * 2. Organization-scoped roles (COMMUNE_ADMIN, ORG_ADMIN, ORG_CASE_HANDLER, ORG_MEMBER)
 */

/**
 * System-level roles
 */
export type SystemRole = 'super_admin' | 'admin' | 'saksbehandler' | 'user';

/**
 * Organization-level roles
 */
export type OrgRole = 'org_admin' | 'org_case_handler' | 'member';

/**
 * Backoffice roles (used in SDK and UI)
 */
export type BackofficeRole =
  | 'COMMUNE_ADMIN'
  | 'COMMUNE_CASE_HANDLER'
  | 'ORG_ADMIN'
  | 'ORG_CASE_HANDLER'
  | 'ORG_MEMBER';

/**
 * All valid role types
 */
export type Role = SystemRole | OrgRole | BackofficeRole;

/**
 * Permission matrix mapping roles to resource:action permissions
 *
 * System-level roles: super_admin, admin, saksbehandler, user
 * Organization-scoped roles: COMMUNE_ADMIN, ORG_ADMIN, ORG_CASE_HANDLER, ORG_MEMBER
 */
export const PERMISSION_MATRIX: Record<string, Record<string, string[]>> = {
  // =================================================================
  // System-level roles
  // =================================================================

  // Super admin - unrestricted access
  super_admin: {
    '*': ['*'],
  },

  // System-level admin role
  admin: {
    dashboard: ['read', 'write'],
    listings: ['create', 'read', 'update', 'delete', 'publish', 'archive'],
    bookings: ['create', 'read', 'update', 'delete', 'confirm', 'cancel', 'approve', 'deny'],
    users: ['create', 'read', 'update', 'delete', 'deactivate', 'reactivate'],
    organizations: ['create', 'read', 'update', 'delete', 'verify'],
    reports: ['read', 'export'],
    settings: ['read', 'write'],
    calendar: ['read', 'write', 'block'],
    messages: ['read', 'write', 'resolve'],
    'seasonal-leases': ['create', 'read', 'update', 'delete', 'terminate'],
    audit: ['read'],
    'access-grants': ['create', 'read', 'update', 'delete'],
    'org-members': ['create', 'read', 'update', 'delete'],
    'org-permissions': ['create', 'read', 'update', 'delete'],
    'case-handler-scopes': ['create', 'read', 'update', 'delete'],
  },

  // System-level case handler (Norwegian: saksbehandler)
  saksbehandler: {
    dashboard: ['read'],
    listings: ['create', 'read', 'update', 'publish', 'archive'],
    bookings: ['create', 'read', 'update', 'confirm', 'cancel', 'approve', 'deny'],
    users: [],
    organizations: ['read'],
    reports: ['read'],
    settings: [],
    calendar: ['read', 'write', 'block'],
    messages: ['read', 'write', 'resolve'],
    'seasonal-leases': ['create', 'read', 'update'],
    audit: [],
    'access-grants': ['read'],
    'org-members': ['read'],
    'org-permissions': ['read'],
    'case-handler-scopes': ['read'],
  },

  // Basic user role
  user: {
    dashboard: [],
    listings: ['read'],
    bookings: ['create', 'read'],
    users: [],
    organizations: [],
    reports: [],
    settings: [],
    calendar: ['read'],
    messages: ['read', 'write'],
    'seasonal-leases': [],
    audit: [],
    'access-grants': [],
    'org-members': [],
    'org-permissions': [],
    'case-handler-scopes': [],
  },

  // =================================================================
  // Organization-scoped roles (Backoffice RBAC hierarchy)
  // =================================================================

  // Commune Admin: Tenant authority who owns rental_objects and grants org access
  // Full CRUD on access-grants, approve/deny/block/cancel/edit bookings
  COMMUNE_ADMIN: {
    dashboard: ['read', 'write'],
    listings: ['create', 'read', 'update', 'delete', 'publish', 'archive'],
    bookings: ['create', 'read', 'update', 'delete', 'confirm', 'cancel', 'approve', 'deny'],
    users: ['create', 'read', 'update', 'delete', 'deactivate', 'reactivate'],
    organizations: ['create', 'read', 'update', 'delete', 'verify'],
    reports: ['read', 'export'],
    settings: ['read', 'write'],
    calendar: ['read', 'write', 'block'],
    messages: ['read', 'write', 'resolve'],
    'seasonal-leases': ['create', 'read', 'update', 'delete', 'terminate'],
    audit: ['read'],
    'access-grants': ['create', 'read', 'update', 'delete'],
    'org-members': ['read'],
    'org-permissions': ['read'],
    'case-handler-scopes': ['create', 'read', 'update', 'delete'],
  },

  // Commune Case Handler: Case handler at commune level
  // Approve/deny/block bookings within assigned scope
  COMMUNE_CASE_HANDLER: {
    dashboard: ['read'],
    listings: ['create', 'read', 'update', 'publish', 'archive'],
    bookings: ['create', 'read', 'update', 'confirm', 'cancel', 'approve', 'deny'],
    users: [],
    organizations: ['read'],
    reports: ['read'],
    settings: [],
    calendar: ['read', 'write', 'block'],
    messages: ['read', 'write', 'resolve'],
    'seasonal-leases': ['create', 'read', 'update'],
    audit: [],
    'access-grants': ['read'],
    'org-members': ['read'],
    'org-permissions': ['read'],
    'case-handler-scopes': ['read'],
  },

  // Organization Admin: Manages org members and assigns per-rental-object permissions
  // CRUD on org members/permissions, approve/deny/cancel/edit bookings (scoped to org's rental objects)
  ORG_ADMIN: {
    dashboard: ['read'],
    listings: ['read'],
    bookings: ['create', 'read', 'update', 'cancel', 'approve', 'deny'],
    users: ['read'],
    organizations: ['read', 'update'],
    reports: ['read'],
    settings: [],
    calendar: ['read', 'write'],
    messages: ['read', 'write', 'resolve'],
    'seasonal-leases': ['read'],
    audit: [],
    'access-grants': ['read'],
    'org-members': ['create', 'read', 'update', 'delete'],
    'org-permissions': ['create', 'read', 'update', 'delete'],
    'case-handler-scopes': ['create', 'read', 'update', 'delete'],
  },

  // Organization Case Handler: Can approve bookings (no deny), scoped to org's rental objects
  // Approve and edit bookings within assigned scope
  ORG_CASE_HANDLER: {
    dashboard: ['read'],
    listings: ['read'],
    bookings: ['read', 'update', 'approve'],
    users: [],
    organizations: ['read'],
    reports: ['read'],
    settings: [],
    calendar: ['read'],
    messages: ['read', 'write'],
    'seasonal-leases': ['read'],
    audit: [],
    'access-grants': ['read'],
    'org-members': ['read'],
    'org-permissions': ['read'],
    'case-handler-scopes': ['read'],
  },

  // Organization Member: Basic member with limited per-rental-object permissions
  // Read listings, read/cancel/edit bookings based on assigned per-RO permissions
  ORG_MEMBER: {
    dashboard: [],
    listings: ['read'],
    bookings: ['create', 'read', 'update', 'cancel'],
    users: [],
    organizations: ['read'],
    reports: [],
    settings: [],
    calendar: ['read'],
    messages: ['read', 'write'],
    'seasonal-leases': [],
    audit: [],
    'access-grants': [],
    'org-members': ['read'],
    'org-permissions': ['read'],
    'case-handler-scopes': [],
  },
};

/**
 * Check if role has permission for resource:action
 */
export function roleHasPermission(role: string, resource: string, action: string): boolean {
  const rolePermissions = PERMISSION_MATRIX[role];

  if (!rolePermissions) {
    return false;
  }

  // Check for wildcard (super_admin)
  if (rolePermissions['*']?.includes('*')) {
    return true;
  }

  const resourceActions = rolePermissions[resource];
  if (!resourceActions) {
    return false;
  }

  return resourceActions.includes(action) || resourceActions.includes('*');
}

/**
 * Get permissions for a given role
 */
export function getPermissionsForRole(role: string): string[] {
  const rolePermissions = PERMISSION_MATRIX[role] || PERMISSION_MATRIX.user;
  const permissions: string[] = [];

  for (const [resource, actions] of Object.entries(rolePermissions)) {
    for (const action of actions) {
      permissions.push(`${resource}:${action}`);
    }
  }

  return permissions;
}

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: string, resource: string, action: string): boolean {
  return roleHasPermission(role, resource, action);
}
