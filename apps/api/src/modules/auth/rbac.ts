/**
 * RBAC - Role-Based Access Control
 * Defines roles, permissions, and role hierarchy for the multi-tenant SaaS platform
 */

// =============================================================================
// ROLE DEFINITIONS
// =============================================================================

/**
 * Platform-level roles (SaaS Admin layer - global access)
 */
export const SaasRoles = {
  SAAS_SUPER_ADMIN: 'SAAS_SUPER_ADMIN',
  SAAS_BILLING_ADMIN: 'SAAS_BILLING_ADMIN',
  SAAS_SUPPORT_AGENT: 'SAAS_SUPPORT_AGENT',
} as const;

/**
 * Tenant-level roles (Tenant Admin layer - tenant-scoped)
 */
export const TenantRoles = {
  TENANT_ADMIN: 'TENANT_ADMIN',
  TENANT_BILLING_ADMIN: 'TENANT_BILLING_ADMIN',
  TENANT_TECH_ADMIN: 'TENANT_TECH_ADMIN',
} as const;

/**
 * Commune-level roles (Backoffice layer - commune-scoped)
 */
export const CommuneRoles = {
  COMMUNE_ADMIN: 'admin',
  COMMUNE_CASE_HANDLER: 'saksbehandler',
} as const;

/**
 * Organization-level roles (within commune)
 */
export const OrgRoles = {
  ORG_ADMIN: 'org_admin',
  ORG_CASE_HANDLER: 'org_saksbehandler',
  ORG_MEMBER: 'org_member',
} as const;

/**
 * Base user role
 */
export const BaseRoles = {
  USER: 'user',
} as const;

/**
 * All roles combined
 */
export const Roles = {
  ...SaasRoles,
  ...TenantRoles,
  ...CommuneRoles,
  ...OrgRoles,
  ...BaseRoles,
} as const;

export type SaasRole = (typeof SaasRoles)[keyof typeof SaasRoles];
export type TenantRole = (typeof TenantRoles)[keyof typeof TenantRoles];
export type CommuneRole = (typeof CommuneRoles)[keyof typeof CommuneRoles];
export type OrgRole = (typeof OrgRoles)[keyof typeof OrgRoles];
export type BaseRole = (typeof BaseRoles)[keyof typeof BaseRoles];
export type Role = SaasRole | TenantRole | CommuneRole | OrgRole | BaseRole;

// =============================================================================
// PERMISSION DEFINITIONS
// =============================================================================

/**
 * Permission actions
 */
export const Actions = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  MANAGE: '*', // Full CRUD access
} as const;

/**
 * Resource domains
 */
export const Resources = {
  // SaaS Admin resources
  SAAS_TENANTS: 'saas:tenants',
  SAAS_PLANS: 'saas:plans',
  SAAS_FEATURE_FLAGS: 'saas:feature-flags',
  SAAS_BILLING: 'saas:billing',
  SAAS_SECRETS: 'saas:secrets',
  SAAS_AUDIT: 'saas:audit',
  SAAS_SUPPORT: 'saas:support',

  // Tenant Admin resources
  TENANT_CAPABILITIES: 'tenant:capabilities',
  TENANT_SUBSCRIPTION: 'tenant:subscription',
  TENANT_BRANDING: 'tenant:branding',
  TENANT_INTEGRATIONS: 'tenant:integrations',
  TENANT_FLAGS: 'tenant:flags',
  TENANT_SEEDS: 'tenant:seeds',

  // Backoffice resources (existing)
  DASHBOARD: 'dashboard',
  LISTINGS: 'listings',
  BOOKINGS: 'bookings',
  USERS: 'users',
  ORGANIZATIONS: 'organizations',
  REPORTS: 'reports',
  SETTINGS: 'settings',
  CALENDAR: 'calendar',
  MESSAGES: 'messages',
  SEASONAL_LEASES: 'seasonal-leases',
} as const;

export type Action = (typeof Actions)[keyof typeof Actions];
export type Resource = (typeof Resources)[keyof typeof Resources];

/**
 * Permission string format: "resource:action"
 */
export type Permission = `${string}:${string}`;

// =============================================================================
// ROLE PERMISSIONS MAPPING
// =============================================================================

/**
 * Permissions by role
 * Each role has a list of permissions in format "resource:action"
 */
export const RolePermissions: Record<Role, Permission[]> = {
  // SaaS Platform Roles
  [SaasRoles.SAAS_SUPER_ADMIN]: [
    'saas:tenants:*',
    'saas:plans:*',
    'saas:feature-flags:*',
    'saas:billing:*',
    'saas:secrets:*',
    'saas:audit:*',
    'saas:support:*',
    // Can also access tenant-level for debugging
    'tenant:capabilities:read',
    'tenant:subscription:read',
    'tenant:branding:read',
    'tenant:integrations:read',
    'tenant:flags:read',
  ],

  [SaasRoles.SAAS_BILLING_ADMIN]: [
    'saas:tenants:read',
    'saas:plans:*',
    'saas:billing:*',
    'saas:audit:read',
  ],

  [SaasRoles.SAAS_SUPPORT_AGENT]: [
    'saas:tenants:read',
    'saas:support:*',
    'saas:audit:read',
    // Read-only access to help tenants
    'tenant:capabilities:read',
    'tenant:subscription:read',
  ],

  // Tenant Admin Roles
  [TenantRoles.TENANT_ADMIN]: [
    'tenant:capabilities:*',
    'tenant:subscription:read',
    'tenant:branding:*',
    'tenant:integrations:*',
    'tenant:flags:read',
    'tenant:seeds:*',
    // Full backoffice access for tenant admin
    'dashboard:*',
    'listings:*',
    'bookings:*',
    'users:*',
    'organizations:*',
    'reports:*',
    'settings:*',
    'calendar:*',
    'messages:*',
    'seasonal-leases:*',
  ],

  [TenantRoles.TENANT_BILLING_ADMIN]: [
    'tenant:capabilities:read',
    'tenant:subscription:read',
    'tenant:branding:read',
    // Limited backoffice access
    'dashboard:read',
    'reports:read',
  ],

  [TenantRoles.TENANT_TECH_ADMIN]: [
    'tenant:capabilities:read',
    'tenant:subscription:read',
    'tenant:integrations:*',
    'tenant:branding:read',
    // Technical settings access
    'settings:*',
  ],

  // Commune Roles (Backoffice)
  [CommuneRoles.COMMUNE_ADMIN]: [
    'dashboard:*',
    'listings:*',
    'bookings:*',
    'users:*',
    'organizations:*',
    'reports:*',
    'settings:*',
    'calendar:*',
    'messages:*',
    'seasonal-leases:*',
  ],

  [CommuneRoles.COMMUNE_CASE_HANDLER]: [
    'dashboard:read',
    'listings:*',
    'bookings:*',
    'organizations:read',
    'reports:read',
    'calendar:*',
    'messages:*',
    'seasonal-leases:*',
  ],

  // Organization Roles
  [OrgRoles.ORG_ADMIN]: [
    'listings:*',
    'bookings:*',
    'users:read',
    'calendar:*',
    'messages:*',
    'seasonal-leases:*',
  ],

  [OrgRoles.ORG_CASE_HANDLER]: [
    'listings:read',
    'bookings:*',
    'calendar:*',
    'messages:*',
    'seasonal-leases:*',
  ],

  [OrgRoles.ORG_MEMBER]: [
    'listings:read',
    'bookings:read',
    'bookings:create',
    'messages:read',
    'messages:create',
  ],

  // Base User Role
  [BaseRoles.USER]: [
    'listings:read',
    'bookings:read',
    'bookings:create',
    'messages:read',
    'messages:create',
  ],
};

// =============================================================================
// ROLE HIERARCHY
// =============================================================================

/**
 * Role hierarchy defines which roles inherit from other roles
 * Higher roles inherit all permissions from lower roles
 */
export const RoleHierarchy: Record<Role, Role[]> = {
  // SaaS roles don't inherit from each other
  [SaasRoles.SAAS_SUPER_ADMIN]: [],
  [SaasRoles.SAAS_BILLING_ADMIN]: [],
  [SaasRoles.SAAS_SUPPORT_AGENT]: [],

  // Tenant roles
  [TenantRoles.TENANT_ADMIN]: [CommuneRoles.COMMUNE_ADMIN],
  [TenantRoles.TENANT_BILLING_ADMIN]: [],
  [TenantRoles.TENANT_TECH_ADMIN]: [],

  // Commune roles
  [CommuneRoles.COMMUNE_ADMIN]: [CommuneRoles.COMMUNE_CASE_HANDLER],
  [CommuneRoles.COMMUNE_CASE_HANDLER]: [BaseRoles.USER],

  // Org roles
  [OrgRoles.ORG_ADMIN]: [OrgRoles.ORG_CASE_HANDLER],
  [OrgRoles.ORG_CASE_HANDLER]: [OrgRoles.ORG_MEMBER],
  [OrgRoles.ORG_MEMBER]: [BaseRoles.USER],

  // Base role
  [BaseRoles.USER]: [],
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Check if a role is a SaaS-level role
 */
export function isSaasRole(role: string): role is SaasRole {
  return Object.values(SaasRoles).includes(role as SaasRole);
}

/**
 * Check if a role is a Tenant-level role
 */
export function isTenantRole(role: string): role is TenantRole {
  return Object.values(TenantRoles).includes(role as TenantRole);
}

/**
 * Check if a role is a Commune-level role
 */
export function isCommuneRole(role: string): role is CommuneRole {
  return Object.values(CommuneRoles).includes(role as CommuneRole);
}

/**
 * Check if a role is an Organization-level role
 */
export function isOrgRole(role: string): role is OrgRole {
  return Object.values(OrgRoles).includes(role as OrgRole);
}

/**
 * Get all inherited roles for a given role
 */
export function getInheritedRoles(role: Role): Role[] {
  const inherited: Role[] = [];
  const directInherits = RoleHierarchy[role] || [];

  for (const inheritedRole of directInherits) {
    inherited.push(inheritedRole);
    // Recursively get inherited roles
    inherited.push(...getInheritedRoles(inheritedRole));
  }

  return [...new Set(inherited)]; // Remove duplicates
}

/**
 * Get all permissions for a role, including inherited permissions
 */
export function getPermissionsForRole(role: string): Permission[] {
  const normalizedRole = role as Role;
  const directPermissions = RolePermissions[normalizedRole] || RolePermissions[BaseRoles.USER];
  const inheritedRoles = getInheritedRoles(normalizedRole);

  const allPermissions = new Set<Permission>(directPermissions);

  for (const inheritedRole of inheritedRoles) {
    const inheritedPerms = RolePermissions[inheritedRole] || [];
    for (const perm of inheritedPerms) {
      allPermissions.add(perm);
    }
  }

  return Array.from(allPermissions);
}

/**
 * Check if a role has a specific permission
 * Handles wildcard permissions (e.g., "listings:*" matches "listings:read")
 */
export function hasPermission(role: string, requiredPermission: Permission): boolean {
  const permissions = getPermissionsForRole(role);

  // Extract resource and action from required permission
  const [requiredResource, requiredAction] = requiredPermission.split(':');

  for (const permission of permissions) {
    const [resource, action] = permission.split(':');

    // Check for exact match
    if (permission === requiredPermission) {
      return true;
    }

    // Check for wildcard resource match (e.g., "listings:*" matches "listings:read")
    if (resource === requiredResource && action === '*') {
      return true;
    }

    // Check for full wildcard match (e.g., "*:*" matches everything)
    if (resource === '*' && action === '*') {
      return true;
    }
  }

  return false;
}

/**
 * Check if a role has any of the required permissions
 */
export function hasAnyPermission(role: string, requiredPermissions: Permission[]): boolean {
  return requiredPermissions.some((perm) => hasPermission(role, perm));
}

/**
 * Check if a role has all of the required permissions
 */
export function hasAllPermissions(role: string, requiredPermissions: Permission[]): boolean {
  return requiredPermissions.every((perm) => hasPermission(role, perm));
}

/**
 * Get role level (used for hierarchy comparison)
 * Higher number = higher authority
 */
export function getRoleLevel(role: string): number {
  if (isSaasRole(role)) return 100;
  if (isTenantRole(role)) return 80;
  if (isCommuneRole(role)) return 60;
  if (isOrgRole(role)) return 40;
  return 20; // Base user
}

/**
 * Check if a role can manage another role
 * A role can manage another role if it has higher level
 */
export function canManageRole(actorRole: string, targetRole: string): boolean {
  return getRoleLevel(actorRole) > getRoleLevel(targetRole);
}

/**
 * Get a flat list of all permission strings for a role
 * Used for capability projection endpoints
 */
export function getCapabilityProjection(role: string): {
  role: string;
  level: string;
  permissions: string[];
} {
  let level = 'user';
  if (isSaasRole(role)) level = 'saas';
  else if (isTenantRole(role)) level = 'tenant';
  else if (isCommuneRole(role)) level = 'commune';
  else if (isOrgRole(role)) level = 'organization';

  return {
    role,
    level,
    permissions: getPermissionsForRole(role),
  };
}

/**
 * Validate that a role string is a valid role
 */
export function isValidRole(role: string): role is Role {
  return Object.values(Roles).includes(role as Role);
}

/**
 * Get display name for a role
 */
export function getRoleDisplayName(role: string): string {
  const displayNames: Record<string, string> = {
    [SaasRoles.SAAS_SUPER_ADMIN]: 'SaaS Super Administrator',
    [SaasRoles.SAAS_BILLING_ADMIN]: 'SaaS Billing Administrator',
    [SaasRoles.SAAS_SUPPORT_AGENT]: 'SaaS Support Agent',
    [TenantRoles.TENANT_ADMIN]: 'Tenant Administrator',
    [TenantRoles.TENANT_BILLING_ADMIN]: 'Tenant Billing Administrator',
    [TenantRoles.TENANT_TECH_ADMIN]: 'Tenant Technical Administrator',
    [CommuneRoles.COMMUNE_ADMIN]: 'Kommune Administrator',
    [CommuneRoles.COMMUNE_CASE_HANDLER]: 'Saksbehandler',
    [OrgRoles.ORG_ADMIN]: 'Organization Administrator',
    [OrgRoles.ORG_CASE_HANDLER]: 'Organization Case Handler',
    [OrgRoles.ORG_MEMBER]: 'Organization Member',
    [BaseRoles.USER]: 'User',
  };

  return displayNames[role] || role;
}
