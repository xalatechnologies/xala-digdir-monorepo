/**
 * RBAC Constants and Types
 * Role definitions for RBAC middleware
 */

/**
 * System role constants
 */
export const Roles = {
  // Platform-level roles
  SAAS_SUPER_ADMIN: 'saas_super_admin',
  TENANT_ADMIN: 'tenant_admin',

  // Tenant-level roles
  COMMUNE_ADMIN: 'admin',
  CASE_HANDLER: 'case_handler',
  USER: 'user',

  // Organization roles
  ORG_ADMIN: 'org_admin',
  ORG_MEMBER: 'org_member',
} as const;

export type RoleName = typeof Roles[keyof typeof Roles];

/**
 * Permission definitions
 */
export interface Permission {
  resource: string;
  action: string;
}

/**
 * Check if a role is an admin-level role
 */
export function isAdminRole(role: string): boolean {
  return [
    Roles.SAAS_SUPER_ADMIN,
    Roles.TENANT_ADMIN,
    Roles.COMMUNE_ADMIN,
  ].includes(role as RoleName);
}

/**
 * Check if a role is a case handler
 */
export function isCaseHandler(role: string): boolean {
  return role === Roles.CASE_HANDLER;
}
