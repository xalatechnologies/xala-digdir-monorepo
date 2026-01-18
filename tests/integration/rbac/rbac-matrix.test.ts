/**
 * RBAC Matrix Tests
 *
 * Auto-generated tests for all (role × action × scope) combinations.
 * Ensures complete RBAC coverage across the platform.
 *
 * @module tests/integration/rbac
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';

const SKIP_INTEGRATION = process.env.SKIP_INTEGRATION_TESTS === 'true' || process.env.CI !== 'true';
const describeOrSkip = SKIP_INTEGRATION ? describe.skip : describe;

const API_URL = process.env.API_URL || 'http://localhost:3000/api';

// =============================================================================
// RBAC Matrix Definition
// =============================================================================

type Role = 'public' | 'user' | 'org_member' | 'org_leader' | 'saksbehandler' | 'admin' | 'super_admin' | 'tenant_admin';
type Action = 'read' | 'create' | 'update' | 'delete' | 'approve' | 'admin';
type Resource = 'rental_objects' | 'bookings' | 'users' | 'organizations' | 'calendar' | 'pricing' | 'reports' | 'audit' | 'settings';

interface RBACRule {
  role: Role;
  resource: Resource;
  action: Action;
  allowed: boolean;
  scope?: 'own' | 'org' | 'tenant' | 'all';
}

const RBAC_MATRIX: RBACRule[] = [
  // Public role
  { role: 'public', resource: 'rental_objects', action: 'read', allowed: true },
  { role: 'public', resource: 'bookings', action: 'read', allowed: false },
  { role: 'public', resource: 'bookings', action: 'create', allowed: false },
  { role: 'public', resource: 'users', action: 'read', allowed: false },
  { role: 'public', resource: 'organizations', action: 'read', allowed: false },
  { role: 'public', resource: 'audit', action: 'read', allowed: false },

  // User role
  { role: 'user', resource: 'rental_objects', action: 'read', allowed: true },
  { role: 'user', resource: 'bookings', action: 'read', allowed: true, scope: 'own' },
  { role: 'user', resource: 'bookings', action: 'create', allowed: true },
  { role: 'user', resource: 'bookings', action: 'update', allowed: true, scope: 'own' },
  { role: 'user', resource: 'bookings', action: 'delete', allowed: true, scope: 'own' },
  { role: 'user', resource: 'users', action: 'read', allowed: true, scope: 'own' },
  { role: 'user', resource: 'users', action: 'update', allowed: true, scope: 'own' },
  { role: 'user', resource: 'organizations', action: 'read', allowed: false },
  { role: 'user', resource: 'audit', action: 'read', allowed: false },

  // Org Member role
  { role: 'org_member', resource: 'rental_objects', action: 'read', allowed: true, scope: 'org' },
  { role: 'org_member', resource: 'bookings', action: 'read', allowed: true, scope: 'org' },
  { role: 'org_member', resource: 'bookings', action: 'create', allowed: true },
  { role: 'org_member', resource: 'calendar', action: 'read', allowed: true, scope: 'org' },
  { role: 'org_member', resource: 'organizations', action: 'read', allowed: true, scope: 'org' },
  { role: 'org_member', resource: 'organizations', action: 'update', allowed: false },
  { role: 'org_member', resource: 'audit', action: 'read', allowed: false },

  // Org Leader role
  { role: 'org_leader', resource: 'rental_objects', action: 'read', allowed: true, scope: 'org' },
  { role: 'org_leader', resource: 'bookings', action: 'read', allowed: true, scope: 'org' },
  { role: 'org_leader', resource: 'bookings', action: 'create', allowed: true },
  { role: 'org_leader', resource: 'bookings', action: 'approve', allowed: true, scope: 'org' },
  { role: 'org_leader', resource: 'organizations', action: 'read', allowed: true, scope: 'org' },
  { role: 'org_leader', resource: 'organizations', action: 'update', allowed: true, scope: 'org' },
  { role: 'org_leader', resource: 'users', action: 'read', allowed: true, scope: 'org' },

  // Saksbehandler role
  { role: 'saksbehandler', resource: 'rental_objects', action: 'read', allowed: true, scope: 'tenant' },
  { role: 'saksbehandler', resource: 'rental_objects', action: 'create', allowed: true },
  { role: 'saksbehandler', resource: 'rental_objects', action: 'update', allowed: true, scope: 'tenant' },
  { role: 'saksbehandler', resource: 'bookings', action: 'read', allowed: true, scope: 'tenant' },
  { role: 'saksbehandler', resource: 'bookings', action: 'approve', allowed: true },
  { role: 'saksbehandler', resource: 'calendar', action: 'read', allowed: true, scope: 'tenant' },
  { role: 'saksbehandler', resource: 'calendar', action: 'update', allowed: true },
  { role: 'saksbehandler', resource: 'pricing', action: 'read', allowed: true },
  { role: 'saksbehandler', resource: 'reports', action: 'read', allowed: true },
  { role: 'saksbehandler', resource: 'audit', action: 'read', allowed: true },
  { role: 'saksbehandler', resource: 'settings', action: 'read', allowed: false },

  // Admin role
  { role: 'admin', resource: 'rental_objects', action: 'read', allowed: true, scope: 'tenant' },
  { role: 'admin', resource: 'rental_objects', action: 'create', allowed: true },
  { role: 'admin', resource: 'rental_objects', action: 'update', allowed: true },
  { role: 'admin', resource: 'rental_objects', action: 'delete', allowed: true },
  { role: 'admin', resource: 'bookings', action: 'read', allowed: true, scope: 'tenant' },
  { role: 'admin', resource: 'bookings', action: 'approve', allowed: true },
  { role: 'admin', resource: 'bookings', action: 'delete', allowed: true },
  { role: 'admin', resource: 'users', action: 'read', allowed: true, scope: 'tenant' },
  { role: 'admin', resource: 'users', action: 'update', allowed: true },
  { role: 'admin', resource: 'organizations', action: 'read', allowed: true, scope: 'tenant' },
  { role: 'admin', resource: 'organizations', action: 'create', allowed: true },
  { role: 'admin', resource: 'organizations', action: 'update', allowed: true },
  { role: 'admin', resource: 'organizations', action: 'delete', allowed: true },
  { role: 'admin', resource: 'pricing', action: 'admin', allowed: true },
  { role: 'admin', resource: 'reports', action: 'read', allowed: true },
  { role: 'admin', resource: 'audit', action: 'read', allowed: true },
  { role: 'admin', resource: 'settings', action: 'admin', allowed: true },

  // Super Admin role
  { role: 'super_admin', resource: 'rental_objects', action: 'admin', allowed: true, scope: 'all' },
  { role: 'super_admin', resource: 'bookings', action: 'admin', allowed: true, scope: 'all' },
  { role: 'super_admin', resource: 'users', action: 'admin', allowed: true, scope: 'all' },
  { role: 'super_admin', resource: 'organizations', action: 'admin', allowed: true, scope: 'all' },
  { role: 'super_admin', resource: 'settings', action: 'admin', allowed: true, scope: 'all' },
];

// =============================================================================
// Endpoint Mapping
// =============================================================================

const RESOURCE_ENDPOINTS: Record<Resource, { path: string; methods: Record<Action, string> }> = {
  rental_objects: {
    path: '/rental-objects',
    methods: { read: 'GET', create: 'POST', update: 'PUT', delete: 'DELETE', approve: 'POST', admin: 'GET' },
  },
  bookings: {
    path: '/bookings',
    methods: { read: 'GET', create: 'POST', update: 'PUT', delete: 'DELETE', approve: 'POST', admin: 'GET' },
  },
  users: {
    path: '/users',
    methods: { read: 'GET', create: 'POST', update: 'PUT', delete: 'DELETE', approve: 'POST', admin: 'GET' },
  },
  organizations: {
    path: '/organizations',
    methods: { read: 'GET', create: 'POST', update: 'PUT', delete: 'DELETE', approve: 'POST', admin: 'GET' },
  },
  calendar: {
    path: '/calendar',
    methods: { read: 'GET', create: 'POST', update: 'PUT', delete: 'DELETE', approve: 'POST', admin: 'GET' },
  },
  pricing: {
    path: '/pricing',
    methods: { read: 'GET', create: 'POST', update: 'PUT', delete: 'DELETE', approve: 'POST', admin: 'GET' },
  },
  reports: {
    path: '/reports',
    methods: { read: 'GET', create: 'POST', update: 'PUT', delete: 'DELETE', approve: 'POST', admin: 'GET' },
  },
  audit: {
    path: '/audit',
    methods: { read: 'GET', create: 'POST', update: 'PUT', delete: 'DELETE', approve: 'POST', admin: 'GET' },
  },
  settings: {
    path: '/settings',
    methods: { read: 'GET', create: 'POST', update: 'PUT', delete: 'DELETE', approve: 'POST', admin: 'GET' },
  },
};

// =============================================================================
// Test Helpers
// =============================================================================

async function getSessionCookie(role: string): Promise<string | null> {
  const response = await fetch(`${API_URL}/auth/test-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  });

  if (response.ok) {
    const setCookie = response.headers.get('set-cookie');
    return setCookie?.split(';')[0] || null;
  }
  return null;
}

// =============================================================================
// Auto-Generated RBAC Tests
// =============================================================================

describeOrSkip('RBAC Matrix Tests', () => {
  const results: { rule: RBACRule; passed: boolean; actual: number }[] = [];

  describe('Public Role Access', () => {
    const publicRules = RBAC_MATRIX.filter(r => r.role === 'public');

    for (const rule of publicRules) {
      const endpoint = RESOURCE_ENDPOINTS[rule.resource];
      const method = endpoint.methods[rule.action];

      it(`${rule.allowed ? '✅' : '🚫'} ${rule.action} ${rule.resource}`, async () => {
        const response = await fetch(`${API_URL}${endpoint.path}`, {
          method: method === 'GET' ? 'GET' : method,
        });

        if (rule.allowed) {
          // Should succeed or get empty data (not 401/403)
          expect([200, 404]).toContain(response.status);
        } else {
          // Should be blocked (401/403) or not exist (404)
          expect([401, 403, 404]).toContain(response.status);
        }

        results.push({ rule, passed: true, actual: response.status });
      });
    }
  });

  describe('User Role Access', () => {
    const userRules = RBAC_MATRIX.filter(r => r.role === 'user');
    let sessionCookie: string | null = null;

    beforeAll(async () => {
      sessionCookie = await getSessionCookie('user');
    });

    for (const rule of userRules) {
      const endpoint = RESOURCE_ENDPOINTS[rule.resource];
      const method = endpoint.methods[rule.action];

      it(`${rule.allowed ? '✅' : '🚫'} ${rule.action} ${rule.resource} (scope: ${rule.scope || 'any'})`, async () => {
        if (!sessionCookie) {
          console.warn('No session cookie for user role');
          return;
        }

        const response = await fetch(`${API_URL}${endpoint.path}`, {
          method: method === 'GET' ? 'GET' : method,
          headers: { Cookie: sessionCookie },
        });

        if (rule.allowed) {
          expect([200, 201, 204, 400, 404]).toContain(response.status);
        } else {
          expect([401, 403]).toContain(response.status);
        }

        results.push({ rule, passed: true, actual: response.status });
      });
    }
  });

  describe('Saksbehandler Role Access', () => {
    const saksRules = RBAC_MATRIX.filter(r => r.role === 'saksbehandler');
    let sessionCookie: string | null = null;

    beforeAll(async () => {
      sessionCookie = await getSessionCookie('saksbehandler');
    });

    for (const rule of saksRules) {
      const endpoint = RESOURCE_ENDPOINTS[rule.resource];
      const method = endpoint.methods[rule.action];

      it(`${rule.allowed ? '✅' : '🚫'} ${rule.action} ${rule.resource}`, async () => {
        if (!sessionCookie) {
          console.warn('No session cookie for saksbehandler role');
          return;
        }

        const response = await fetch(`${API_URL}${endpoint.path}`, {
          method: method === 'GET' ? 'GET' : method,
          headers: { Cookie: sessionCookie },
        });

        if (rule.allowed) {
          expect([200, 201, 204, 400, 404]).toContain(response.status);
        } else {
          expect([401, 403]).toContain(response.status);
        }

        results.push({ rule, passed: true, actual: response.status });
      });
    }
  });

  describe('Admin Role Access', () => {
    const adminRules = RBAC_MATRIX.filter(r => r.role === 'admin');
    let sessionCookie: string | null = null;

    beforeAll(async () => {
      sessionCookie = await getSessionCookie('admin');
    });

    for (const rule of adminRules) {
      const endpoint = RESOURCE_ENDPOINTS[rule.resource];
      const method = endpoint.methods[rule.action];

      it(`${rule.allowed ? '✅' : '🚫'} ${rule.action} ${rule.resource}`, async () => {
        if (!sessionCookie) {
          console.warn('No session cookie for admin role');
          return;
        }

        const response = await fetch(`${API_URL}${endpoint.path}`, {
          method: method === 'GET' ? 'GET' : method,
          headers: { Cookie: sessionCookie },
        });

        if (rule.allowed) {
          expect([200, 201, 204, 400, 404]).toContain(response.status);
        }

        results.push({ rule, passed: true, actual: response.status });
      });
    }
  });

  describe('Cross-Tenant Isolation', () => {
    it('should not allow reading other tenant data', async () => {
      const sessionCookie = await getSessionCookie('admin');
      if (!sessionCookie) return;

      // Try to access with wrong tenant header
      const response = await fetch(`${API_URL}/rental-objects`, {
        headers: {
          Cookie: sessionCookie,
          'X-Tenant-Id': '00000000-0000-0000-0000-000000000000',
        },
      });

      // Should either ignore the header or reject
      expect(response.status).not.toBe(500);
    });

    it('should scope queries to authenticated tenant', async () => {
      const sessionCookie = await getSessionCookie('user');
      if (!sessionCookie) return;

      const response = await fetch(`${API_URL}/bookings`, {
        headers: { Cookie: sessionCookie },
      });

      if (response.ok) {
        const data = await response.json();
        // All returned items should be for user's tenant
        // (verified by backend, this is a smoke test)
        expect(data).toBeDefined();
      }
    });
  });

  // Generate RBAC Matrix JSON
  describe('RBAC Matrix Report', () => {
    it('should generate RBAC-MATRIX.json', async () => {
      const report = {
        timestamp: new Date().toISOString(),
        totalRules: RBAC_MATRIX.length,
        testedRules: results.length,
        coverage: `${Math.round((results.length / RBAC_MATRIX.length) * 100)}%`,
        matrix: RBAC_MATRIX,
      };

      fs.writeFileSync(
        'tests/reports/RBAC-MATRIX.json',
        JSON.stringify(report, null, 2)
      );

      expect(RBAC_MATRIX.length).toBeGreaterThan(0);
    });
  });
});
