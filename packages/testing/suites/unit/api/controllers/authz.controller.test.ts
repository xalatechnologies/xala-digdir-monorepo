/**
 * Authz (RBAC) Controller Tests
 * Target: 95%+ coverage
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestApp, TestContext } from '@xala/api/test-utils';

describe('AuthzController', () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await createTestApp();
  });

  afterAll(async () => {
    await ctx.cleanup();
  });

  describe('GET /api/authz/permissions', () => {
    it('should return admin permissions for admin user', async () => {
      const response = await ctx.app.inject({
        method: 'GET',
        url: '/api/authz/permissions',
        headers: {
          'X-User-Id': ctx.adminUserId,
          'X-User-Role': 'admin',
        },
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(data.data.role).toBe('admin');
      expect(data.data.permissions).toBeDefined();
      expect(data.data.permissions.dashboard).toContain('read');
      expect(data.data.permissions.dashboard).toContain('write');
      expect(data.data.permissions.users).toContain('create');
      expect(data.data.permissions.users).toContain('delete');
    });

    it('should return saksbehandler permissions', async () => {
      const response = await ctx.app.inject({
        method: 'GET',
        url: '/api/authz/permissions',
        headers: {
          'X-User-Id': ctx.saksbehandlerUserId,
          'X-User-Role': 'saksbehandler',
        },
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(data.data.role).toBe('saksbehandler');
      expect(data.data.permissions.dashboard).toContain('read');
      expect(data.data.permissions.dashboard).not.toContain('write');
      expect(data.data.permissions.bookings).toContain('create');
    });

    it('should return user permissions', async () => {
      const response = await ctx.app.inject({
        method: 'GET',
        url: '/api/authz/permissions',
        headers: {
          'X-User-Id': ctx.testUserId,
          'X-User-Role': 'user',
        },
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(data.data.role).toBe('user');
      expect(data.data.permissions.listings).toContain('read');
      expect(data.data.permissions.listings).not.toContain('create');
      expect(data.data.permissions.bookings).toContain('create');
    });

    it('should default to user role when no role specified', async () => {
      const response = await ctx.app.inject({
        method: 'GET',
        url: '/api/authz/permissions',
        headers: {
          'X-User-Id': ctx.testUserId,
        },
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(data.data.role).toBe('user');
    });
  });

  describe('GET /api/authz/check', () => {
    it('should allow admin to access bookings:delete', async () => {
      const response = await ctx.app.inject({
        method: 'GET',
        url: '/api/authz/check',
        query: { resource: 'bookings', action: 'delete' },
        headers: {
          'X-User-Id': ctx.adminUserId,
          'X-User-Role': 'admin',
        },
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(data.data.allowed).toBe(true);
    });

    it('should deny user from accessing bookings:delete', async () => {
      const response = await ctx.app.inject({
        method: 'GET',
        url: '/api/authz/check',
        query: { resource: 'bookings', action: 'delete' },
        headers: {
          'X-User-Id': ctx.testUserId,
          'X-User-Role': 'user',
        },
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(data.data.allowed).toBe(false);
    });

    it('should allow user to create bookings', async () => {
      const response = await ctx.app.inject({
        method: 'GET',
        url: '/api/authz/check',
        query: { resource: 'bookings', action: 'create' },
        headers: {
          'X-User-Id': ctx.testUserId,
          'X-User-Role': 'user',
        },
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(data.data.allowed).toBe(true);
    });

    it('should require resource and action params', async () => {
      const response = await ctx.app.inject({
        method: 'GET',
        url: '/api/authz/check',
        headers: {
          'X-User-Id': ctx.testUserId,
        },
      });

      expect(response.statusCode).toBe(400);
      const data = response.json();
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should deny access to unknown resources', async () => {
      const response = await ctx.app.inject({
        method: 'GET',
        url: '/api/authz/check',
        query: { resource: 'unknown', action: 'read' },
        headers: {
          'X-User-Id': ctx.testUserId,
          'X-User-Role': 'user',
        },
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(data.data.allowed).toBe(false);
    });
  });
});
