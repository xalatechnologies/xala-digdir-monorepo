/**
 * RBAC Authorization Policy Tests
 * 
 * Unit tests for role-based access control decisions
 * Tests allow/deny + denial reasons
 */

import { describe, it, expect } from 'vitest';

// =============================================================================
// RBAC TYPES
// =============================================================================

type Role = 'CITIZEN' | 'CASEWORKER' | 'ORG_ADMIN' | 'ADMIN' | 'SAAS_ADMIN';
type Permission = 
  | 'rental_objects.view'
  | 'rental_objects.create'
  | 'rental_objects.edit'
  | 'rental_objects.delete'
  | 'bookings.view'
  | 'bookings.create'
  | 'bookings.approve'
  | 'bookings.reject'
  | 'bookings.cancel'
  | 'users.view'
  | 'users.manage'
  | 'organizations.view'
  | 'organizations.manage'
  | 'reports.view'
  | 'settings.manage';

interface AuthContext {
  userId: string;
  role: Role;
  tenantId: string;
  organizationId?: string;
}

interface AuthzResult {
  allowed: boolean;
  reason?: string;
  reasonKey?: string;
}

// =============================================================================
// RBAC IMPLEMENTATION
// =============================================================================

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  CITIZEN: [
    'rental_objects.view',
    'bookings.view',
    'bookings.create',
    'bookings.cancel',
  ],
  CASEWORKER: [
    'rental_objects.view',
    'rental_objects.edit',
    'bookings.view',
    'bookings.approve',
    'bookings.reject',
    'reports.view',
  ],
  ORG_ADMIN: [
    'rental_objects.view',
    'rental_objects.create',
    'rental_objects.edit',
    'rental_objects.delete',
    'bookings.view',
    'bookings.approve',
    'bookings.reject',
    'users.view',
    'organizations.view',
    'reports.view',
  ],
  ADMIN: [
    'rental_objects.view',
    'rental_objects.create',
    'rental_objects.edit',
    'rental_objects.delete',
    'bookings.view',
    'bookings.approve',
    'bookings.reject',
    'users.view',
    'users.manage',
    'organizations.view',
    'organizations.manage',
    'reports.view',
    'settings.manage',
  ],
  SAAS_ADMIN: [
    // All permissions
    'rental_objects.view',
    'rental_objects.create',
    'rental_objects.edit',
    'rental_objects.delete',
    'bookings.view',
    'bookings.create',
    'bookings.approve',
    'bookings.reject',
    'bookings.cancel',
    'users.view',
    'users.manage',
    'organizations.view',
    'organizations.manage',
    'reports.view',
    'settings.manage',
  ],
};

function checkPermission(ctx: AuthContext, permission: Permission): AuthzResult {
  const rolePermissions = ROLE_PERMISSIONS[ctx.role];
  
  if (!rolePermissions) {
    return {
      allowed: false,
      reason: 'Unknown role',
      reasonKey: 'policy.role.unknown',
    };
  }

  if (!rolePermissions.includes(permission)) {
    return {
      allowed: false,
      reason: `Role ${ctx.role} does not have permission ${permission}`,
      reasonKey: 'policy.role.insufficient_permissions',
    };
  }

  return { allowed: true };
}

function checkResourceAccess(
  ctx: AuthContext,
  resourceTenantId: string,
  resourceOrgId?: string
): AuthzResult {
  // SAAS_ADMIN can access all tenants
  if (ctx.role === 'SAAS_ADMIN') {
    return { allowed: true };
  }

  // Tenant isolation
  if (ctx.tenantId !== resourceTenantId) {
    return {
      allowed: false,
      reason: 'Cannot access resources from another tenant',
      reasonKey: 'policy.tenant.isolation_violation',
    };
  }

  // ORG_ADMIN can only access their organization's resources
  if (ctx.role === 'ORG_ADMIN' && resourceOrgId && ctx.organizationId !== resourceOrgId) {
    return {
      allowed: false,
      reason: 'Cannot access resources from another organization',
      reasonKey: 'policy.organization.isolation_violation',
    };
  }

  return { allowed: true };
}

// =============================================================================
// TESTS
// =============================================================================

describe('RBAC Authorization Policy', () => {
  describe('Role permissions', () => {
    it('should allow CITIZEN to view rental objects', () => {
      const ctx: AuthContext = {
        userId: 'user-1',
        role: 'CITIZEN',
        tenantId: 'tenant-1',
      };

      const result = checkPermission(ctx, 'rental_objects.view');

      expect(result.allowed).toBe(true);
    });

    it('should deny CITIZEN from creating rental objects', () => {
      const ctx: AuthContext = {
        userId: 'user-1',
        role: 'CITIZEN',
        tenantId: 'tenant-1',
      };

      const result = checkPermission(ctx, 'rental_objects.create');

      expect(result.allowed).toBe(false);
      expect(result.reasonKey).toBe('policy.role.insufficient_permissions');
    });

    it('should allow CASEWORKER to approve bookings', () => {
      const ctx: AuthContext = {
        userId: 'user-1',
        role: 'CASEWORKER',
        tenantId: 'tenant-1',
      };

      const result = checkPermission(ctx, 'bookings.approve');

      expect(result.allowed).toBe(true);
    });

    it('should deny CASEWORKER from managing users', () => {
      const ctx: AuthContext = {
        userId: 'user-1',
        role: 'CASEWORKER',
        tenantId: 'tenant-1',
      };

      const result = checkPermission(ctx, 'users.manage');

      expect(result.allowed).toBe(false);
    });

    it('should allow ADMIN to manage settings', () => {
      const ctx: AuthContext = {
        userId: 'user-1',
        role: 'ADMIN',
        tenantId: 'tenant-1',
      };

      const result = checkPermission(ctx, 'settings.manage');

      expect(result.allowed).toBe(true);
    });

    it('should allow SAAS_ADMIN all permissions', () => {
      const ctx: AuthContext = {
        userId: 'user-1',
        role: 'SAAS_ADMIN',
        tenantId: 'system',
      };

      const permissions: Permission[] = [
        'rental_objects.delete',
        'users.manage',
        'settings.manage',
      ];

      permissions.forEach(perm => {
        const result = checkPermission(ctx, perm);
        expect(result.allowed).toBe(true);
      });
    });
  });

  describe('Tenant isolation', () => {
    it('should deny cross-tenant access for CITIZEN', () => {
      const ctx: AuthContext = {
        userId: 'user-1',
        role: 'CITIZEN',
        tenantId: 'tenant-1',
      };

      const result = checkResourceAccess(ctx, 'tenant-2');

      expect(result.allowed).toBe(false);
      expect(result.reasonKey).toBe('policy.tenant.isolation_violation');
    });

    it('should deny cross-tenant access for ADMIN', () => {
      const ctx: AuthContext = {
        userId: 'user-1',
        role: 'ADMIN',
        tenantId: 'tenant-1',
      };

      const result = checkResourceAccess(ctx, 'tenant-2');

      expect(result.allowed).toBe(false);
      expect(result.reasonKey).toBe('policy.tenant.isolation_violation');
    });

    it('should allow SAAS_ADMIN cross-tenant access', () => {
      const ctx: AuthContext = {
        userId: 'user-1',
        role: 'SAAS_ADMIN',
        tenantId: 'system',
      };

      const result = checkResourceAccess(ctx, 'tenant-2');

      expect(result.allowed).toBe(true);
    });
  });

  describe('Organization isolation', () => {
    it('should deny ORG_ADMIN access to other organizations', () => {
      const ctx: AuthContext = {
        userId: 'user-1',
        role: 'ORG_ADMIN',
        tenantId: 'tenant-1',
        organizationId: 'org-1',
      };

      const result = checkResourceAccess(ctx, 'tenant-1', 'org-2');

      expect(result.allowed).toBe(false);
      expect(result.reasonKey).toBe('policy.organization.isolation_violation');
    });

    it('should allow ORG_ADMIN access to own organization', () => {
      const ctx: AuthContext = {
        userId: 'user-1',
        role: 'ORG_ADMIN',
        tenantId: 'tenant-1',
        organizationId: 'org-1',
      };

      const result = checkResourceAccess(ctx, 'tenant-1', 'org-1');

      expect(result.allowed).toBe(true);
    });
  });
});
