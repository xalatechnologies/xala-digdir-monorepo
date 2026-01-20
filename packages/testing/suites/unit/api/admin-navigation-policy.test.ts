/**
 * Admin Navigation Policy Tests
 * 
 * Tests navigation visibility based on user roles
 */

import { describe, it, expect } from 'vitest';

// =============================================================================
// TYPES
// =============================================================================

type Role = 'CITIZEN' | 'ORG_MEMBER' | 'ORG_ADMIN' | 'CASEWORKER' | 'ADMIN' | 'SAAS_ADMIN';

interface NavItem {
  key: string;
  path: string;
  requiredRoles: Role[];
  icon?: string;
}

// =============================================================================
// NAVIGATION CONFIG
// =============================================================================

const ADMIN_NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', path: '/dashboard', requiredRoles: ['ORG_MEMBER', 'ORG_ADMIN', 'CASEWORKER', 'ADMIN', 'SAAS_ADMIN'] },
  { key: 'bookings', path: '/bookings', requiredRoles: ['ORG_MEMBER', 'ORG_ADMIN', 'CASEWORKER', 'ADMIN', 'SAAS_ADMIN'] },
  { key: 'rental-objects', path: '/rental-objects', requiredRoles: ['ORG_ADMIN', 'CASEWORKER', 'ADMIN', 'SAAS_ADMIN'] },
  { key: 'users', path: '/users', requiredRoles: ['ADMIN', 'SAAS_ADMIN'] },
  { key: 'organizations', path: '/organizations', requiredRoles: ['ADMIN', 'SAAS_ADMIN'] },
  { key: 'audit', path: '/audit', requiredRoles: ['ADMIN', 'SAAS_ADMIN'] },
  { key: 'tenants', path: '/tenants', requiredRoles: ['SAAS_ADMIN'] },
  { key: 'feature-flags', path: '/feature-flags', requiredRoles: ['SAAS_ADMIN'] },
];

function getVisibleNavItems(role: Role): NavItem[] {
  return ADMIN_NAV_ITEMS.filter(item => item.requiredRoles.includes(role));
}

function canAccessPath(role: Role, path: string): boolean {
  const item = ADMIN_NAV_ITEMS.find(i => i.path === path);
  if (!item) return false;
  return item.requiredRoles.includes(role);
}

// =============================================================================
// TESTS
// =============================================================================

describe('Admin Navigation Policy', () => {
  describe('Role-based visibility', () => {
    it('should show minimal nav for ORG_MEMBER', () => {
      const items = getVisibleNavItems('ORG_MEMBER');
      
      expect(items.map(i => i.key)).toContain('dashboard');
      expect(items.map(i => i.key)).toContain('bookings');
      expect(items.map(i => i.key)).not.toContain('users');
      expect(items.map(i => i.key)).not.toContain('tenants');
    });

    it('should show org management for ORG_ADMIN', () => {
      const items = getVisibleNavItems('ORG_ADMIN');
      
      expect(items.map(i => i.key)).toContain('rental-objects');
      expect(items.map(i => i.key)).not.toContain('users');
      expect(items.map(i => i.key)).not.toContain('tenants');
    });

    it('should show admin features for ADMIN', () => {
      const items = getVisibleNavItems('ADMIN');
      
      expect(items.map(i => i.key)).toContain('users');
      expect(items.map(i => i.key)).toContain('organizations');
      expect(items.map(i => i.key)).toContain('audit');
      expect(items.map(i => i.key)).not.toContain('tenants');
    });

    it('should show all items for SAAS_ADMIN', () => {
      const items = getVisibleNavItems('SAAS_ADMIN');
      
      expect(items.map(i => i.key)).toContain('tenants');
      expect(items.map(i => i.key)).toContain('feature-flags');
      expect(items.length).toBe(ADMIN_NAV_ITEMS.length);
    });

    it('should hide admin features from CITIZEN', () => {
      const items = getVisibleNavItems('CITIZEN');
      
      expect(items.length).toBe(0);
    });
  });

  describe('Path access control', () => {
    it('should allow dashboard access for ORG_MEMBER', () => {
      expect(canAccessPath('ORG_MEMBER', '/dashboard')).toBe(true);
    });

    it('should deny users access for ORG_MEMBER', () => {
      expect(canAccessPath('ORG_MEMBER', '/users')).toBe(false);
    });

    it('should allow users access for ADMIN', () => {
      expect(canAccessPath('ADMIN', '/users')).toBe(true);
    });

    it('should deny tenants access for ADMIN', () => {
      expect(canAccessPath('ADMIN', '/tenants')).toBe(false);
    });

    it('should allow tenants access for SAAS_ADMIN', () => {
      expect(canAccessPath('SAAS_ADMIN', '/tenants')).toBe(true);
    });
  });

  describe('Hierarchical permissions', () => {
    it('should show more items as role increases', () => {
      const orgMemberCount = getVisibleNavItems('ORG_MEMBER').length;
      const orgAdminCount = getVisibleNavItems('ORG_ADMIN').length;
      const adminCount = getVisibleNavItems('ADMIN').length;
      const saasAdminCount = getVisibleNavItems('SAAS_ADMIN').length;

      expect(orgAdminCount).toBeGreaterThan(orgMemberCount);
      expect(adminCount).toBeGreaterThan(orgAdminCount);
      expect(saasAdminCount).toBeGreaterThan(adminCount);
    });

    it('should include all lower role items in higher roles', () => {
      const orgMemberItems = new Set(getVisibleNavItems('ORG_MEMBER').map(i => i.key));
      const orgAdminItems = new Set(getVisibleNavItems('ORG_ADMIN').map(i => i.key));

      for (const item of orgMemberItems) {
        expect(orgAdminItems.has(item)).toBe(true);
      }
    });
  });
});
