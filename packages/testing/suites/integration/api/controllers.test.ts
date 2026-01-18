/**
 * Integration Tests for Controllers
 * Tests run against the actual API with mock database
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupMockApi } from '@xala/api/mocks/api-server.mock';
import { createTestApp, TestContext, TEST_IDS } from '@xala/api/test-utils';

describe('Integration Tests', () => {
  setupMockApi();
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await createTestApp();
  });

  afterAll(async () => {
    await ctx.cleanup();
  });

  // ==========================================================================
  // Auth Controller Tests
  // ==========================================================================
  describe('Auth Controller', () => {
  setupMockApi();
    describe('POST /api/auth/login', () => {
  setupMockApi();
      it('should login with valid email', async () => {
        const res = await ctx.app.inject({
          method: 'POST',
          url: '/api/auth/login',
          payload: { email: 'admin@test.no' },
        });
        expect(res.statusCode).toBe(200);
        const data = res.json();
        expect(data.data.token).toBeDefined();
        expect(data.data.user.email).toBe('admin@test.no');
      });

      it('should return 400 without email', async () => {
        const res = await ctx.app.inject({
          method: 'POST',
          url: '/api/auth/login',
          payload: {},
        });
        expect(res.statusCode).toBe(400);
        expect(res.json().error.code).toBe('VALIDATION_ERROR');
      });

      it('should return 404 for non-existent user', async () => {
        const res = await ctx.app.inject({
          method: 'POST',
          url: '/api/auth/login',
          payload: { email: 'nonexistent@test.no' },
        });
        expect(res.statusCode).toBe(404);
      });
    });

    describe('GET /api/auth/session', () => {
  setupMockApi();
      it('should return session with user header', async () => {
        const res = await ctx.app.inject({
          method: 'GET',
          url: '/api/auth/session',
          headers: { 'X-User-Id': ctx.testUserId },
        });
        expect(res.statusCode).toBe(200);
        expect(res.json().data.user).toBeDefined();
      });

      it('should return 401 without user header', async () => {
        const res = await ctx.app.inject({
          method: 'GET',
          url: '/api/auth/session',
        });
        expect(res.statusCode).toBe(401);
      });
    });

    describe('POST /api/auth/logout', () => {
  setupMockApi();
      it('should logout successfully', async () => {
        const res = await ctx.app.inject({
          method: 'POST',
          url: '/api/auth/logout',
        });
        expect(res.statusCode).toBe(200);
        expect(res.json().data.success).toBe(true);
      });
    });

    describe('POST /api/auth/refresh', () => {
  setupMockApi();
      it('should refresh token', async () => {
        const res = await ctx.app.inject({
          method: 'POST',
          url: '/api/auth/refresh',
        });
        expect(res.statusCode).toBe(200);
        expect(res.json().data.token).toBeDefined();
      });
    });

    describe('GET /api/auth/providers', () => {
  setupMockApi();
      it('should return auth providers', async () => {
        const res = await ctx.app.inject({
          method: 'GET',
          url: '/api/auth/providers',
        });
        expect(res.statusCode).toBe(200);
        const providers = res.json().data;
        expect(Array.isArray(providers)).toBe(true);
        expect(providers.find((p: any) => p.id === 'bankid')).toBeDefined();
      });
    });

    describe('GET /api/auth/csrf', () => {
  setupMockApi();
      it('should return CSRF token', async () => {
        const res = await ctx.app.inject({
          method: 'GET',
          url: '/api/auth/csrf',
        });
        expect(res.statusCode).toBe(200);
        expect(res.json().data.token).toBeDefined();
        expect(res.json().data.expiresAt).toBeDefined();
      });
    });

    describe('POST /api/auth/email', () => {
  setupMockApi();
      it('should login with email/password', async () => {
        const res = await ctx.app.inject({
          method: 'POST',
          url: '/api/auth/email',
          payload: { email: 'test@test.no', password: 'password123' },
        });
        expect(res.statusCode).toBe(200);
        expect(res.json().data.token).toBeDefined();
      });

      it('should reject without password', async () => {
        const res = await ctx.app.inject({
          method: 'POST',
          url: '/api/auth/email',
          payload: { email: 'test@test.no' },
        });
        expect(res.statusCode).toBe(400);
      });
    });
  });

  // ==========================================================================
  // RBAC/Authz Controller Tests
  // ==========================================================================
  describe('Authz Controller', () => {
  setupMockApi();
    describe('GET /api/authz/permissions', () => {
  setupMockApi();
      it('should return admin permissions', async () => {
        const res = await ctx.app.inject({
          method: 'GET',
          url: '/api/authz/permissions',
          headers: { 'X-User-Role': 'admin' },
        });
        expect(res.statusCode).toBe(200);
        const data = res.json().data;
        expect(data.role).toBe('admin');
        expect(data.permissions.dashboard).toContain('write');
        expect(data.permissions.users).toContain('delete');
      });

      it('should return saksbehandler permissions', async () => {
        const res = await ctx.app.inject({
          method: 'GET',
          url: '/api/authz/permissions',
          headers: { 'X-User-Role': 'saksbehandler' },
        });
        expect(res.statusCode).toBe(200);
        const data = res.json().data;
        expect(data.role).toBe('saksbehandler');
        expect(data.permissions.dashboard).toContain('read');
        expect(data.permissions.dashboard).not.toContain('write');
      });

      it('should return user permissions by default', async () => {
        const res = await ctx.app.inject({
          method: 'GET',
          url: '/api/authz/permissions',
        });
        expect(res.statusCode).toBe(200);
        expect(res.json().data.role).toBe('user');
      });
    });

    describe('GET /api/authz/check', () => {
  setupMockApi();
      it('should allow admin to delete bookings', async () => {
        const res = await ctx.app.inject({
          method: 'GET',
          url: '/api/authz/check',
          query: { resource: 'bookings', action: 'delete' },
          headers: { 'X-User-Role': 'admin' },
        });
        expect(res.statusCode).toBe(200);
        expect(res.json().data.allowed).toBe(true);
      });

      it('should deny user from deleting bookings', async () => {
        const res = await ctx.app.inject({
          method: 'GET',
          url: '/api/authz/check',
          query: { resource: 'bookings', action: 'delete' },
          headers: { 'X-User-Role': 'user' },
        });
        expect(res.statusCode).toBe(200);
        expect(res.json().data.allowed).toBe(false);
      });

      it('should require resource and action', async () => {
        const res = await ctx.app.inject({
          method: 'GET',
          url: '/api/authz/check',
        });
        expect(res.statusCode).toBe(400);
      });

      it('should deny unknown resources', async () => {
        const res = await ctx.app.inject({
          method: 'GET',
          url: '/api/authz/check',
          query: { resource: 'unknown', action: 'read' },
        });
        expect(res.statusCode).toBe(200);
        expect(res.json().data.allowed).toBe(false);
      });
    });
  });

  // ==========================================================================
  // Public Controller Tests
  // ==========================================================================
  describe('Public Controller', () => {
  setupMockApi();
    describe('GET /api/public/listings', () => {
  setupMockApi();
      it('should return listings without auth', async () => {
        const res = await ctx.app.inject({
          method: 'GET',
          url: '/api/public/listings',
        });
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.json().data)).toBe(true);
        expect(res.json().meta).toBeDefined();
      });

      it('should support pagination', async () => {
        const res = await ctx.app.inject({
          method: 'GET',
          url: '/api/public/listings',
          query: { page: '1', limit: '5' },
        });
        expect(res.statusCode).toBe(200);
        expect(res.json().meta.page).toBe(1);
        expect(res.json().meta.limit).toBe(5);
      });
    });

    describe('GET /api/public/listings/:id', () => {
  setupMockApi();
      it('should return listing by ID', async () => {
        const res = await ctx.app.inject({
          method: 'GET',
          url: `/api/public/listings/${TEST_IDS.listingId}`,
        });
        expect(res.statusCode).toBe(200);
        expect(res.json().data.id).toBe(TEST_IDS.listingId);
      });

      it('should return 404 for non-existent', async () => {
        const res = await ctx.app.inject({
          method: 'GET',
          url: '/api/public/listings/00000000-0000-0000-0000-000000000000',
        });
        expect(res.statusCode).toBe(404);
      });
    });

    describe('GET /api/public/listings/:id/availability', () => {
  setupMockApi();
      it('should return availability', async () => {
        const res = await ctx.app.inject({
          method: 'GET',
          url: `/api/public/listings/${TEST_IDS.listingId}/availability`,
          query: { startDate: '2026-01-15', endDate: '2026-01-20' },
        });
        expect(res.statusCode).toBe(200);
      });
    });

    describe('GET /api/public/categories', () => {
  setupMockApi();
      it('should return categories', async () => {
        const res = await ctx.app.inject({
          method: 'GET',
          url: '/api/public/categories',
        });
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.json().data)).toBe(true);
      });
    });

    describe('GET /api/public/cities', () => {
  setupMockApi();
      it('should return cities', async () => {
        const res = await ctx.app.inject({
          method: 'GET',
          url: '/api/public/cities',
        });
        expect(res.statusCode).toBe(200);
        const cities = res.json().data;
        expect(Array.isArray(cities)).toBe(true);
        expect(cities.find((c: any) => c.name === 'Oslo')).toBeDefined();
      });
    });

    describe('GET /api/public/municipalities', () => {
  setupMockApi();
      it('should return municipalities', async () => {
        const res = await ctx.app.inject({
          method: 'GET',
          url: '/api/public/municipalities',
        });
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.json().data)).toBe(true);
      });
    });

    describe('GET /api/public/featured', () => {
  setupMockApi();
      it('should return featured listings', async () => {
        const res = await ctx.app.inject({
          method: 'GET',
          url: '/api/public/featured',
        });
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.json().data)).toBe(true);
      });
    });
  });

  // ==========================================================================
  // Settings Controller Tests
  // ==========================================================================
  describe('Settings Controller', () => {
  setupMockApi();
    describe('GET /api/settings', () => {
  setupMockApi();
      it('should return tenant settings', async () => {
        const res = await ctx.app.inject({
          method: 'GET',
          url: '/api/settings',
          headers: { 'X-Tenant-Id': ctx.testTenantId },
        });
        expect(res.statusCode).toBe(200);
        const data = res.json().data;
        expect(data.tenantId).toBe(ctx.testTenantId);
        expect(data.timezone).toBe('Europe/Oslo');
        expect(data.currency).toBe('NOK');
      });

      it('should return 400 without tenant ID', async () => {
        const res = await ctx.app.inject({
          method: 'GET',
          url: '/api/settings',
        });
        expect(res.statusCode).toBe(400);
      });

      it('should return 404 for non-existent tenant', async () => {
        const res = await ctx.app.inject({
          method: 'GET',
          url: '/api/settings',
          headers: { 'X-Tenant-Id': '00000000-0000-0000-0000-000000000000' },
        });
        expect(res.statusCode).toBe(404);
      });
    });

    describe('PUT /api/settings', () => {
  setupMockApi();
      it('should update settings', async () => {
        const res = await ctx.app.inject({
          method: 'PUT',
          url: '/api/settings',
          headers: { 'X-Tenant-Id': ctx.testTenantId },
          payload: { displayName: 'Updated Name' },
        });
        expect(res.statusCode).toBe(200);
        expect(res.json().data.displayName).toBe('Updated Name');
      });

      it('should return 400 without tenant ID', async () => {
        const res = await ctx.app.inject({
          method: 'PUT',
          url: '/api/settings',
          payload: { displayName: 'Test' },
        });
        expect(res.statusCode).toBe(400);
      });
    });

    describe('GET /api/settings/integrations', () => {
  setupMockApi();
      it('should return integration settings', async () => {
        const res = await ctx.app.inject({
          method: 'GET',
          url: '/api/settings/integrations',
          headers: { 'X-Tenant-Id': ctx.testTenantId },
        });
        expect(res.statusCode).toBe(200);
        const data = res.json().data;
        expect(data.bankid).toBeDefined();
        expect(data.vipps).toBeDefined();
        expect(data.visma).toBeDefined();
        expect(data.rco).toBeDefined();
      });
    });

    describe('PUT /api/settings/integrations/:provider', () => {
  setupMockApi();
      it('should update vipps settings', async () => {
        const res = await ctx.app.inject({
          method: 'PUT',
          url: '/api/settings/integrations/vipps',
          headers: { 'X-Tenant-Id': ctx.testTenantId },
          payload: { enabled: true, merchantId: 'test-123' },
        });
        expect(res.statusCode).toBe(200);
        expect(res.json().data.vipps.enabled).toBe(true);
      });
    });
  });

  // ==========================================================================
  // Discount Codes Controller Tests
  // ==========================================================================
  describe('Discount Codes Controller', () => {
  setupMockApi();
    describe('GET /api/discount-codes', () => {
  setupMockApi();
      it('should list discount codes', async () => {
        const res = await ctx.app.inject({
          method: 'GET',
          url: '/api/discount-codes',
        });
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.json().data)).toBe(true);
      });
    });

    describe('POST /api/discount-codes', () => {
  setupMockApi();
      it('should create percentage code', async () => {
        const res = await ctx.app.inject({
          method: 'POST',
          url: '/api/discount-codes',
          payload: { code: 'TEST25', type: 'percentage', value: 25 },
        });
        expect(res.statusCode).toBe(201);
        expect(res.json().data.code).toBe('TEST25');
        expect(res.json().data.type).toBe('percentage');
        expect(res.json().data.value).toBe(25);
      });

      it('should create fixed code', async () => {
        const res = await ctx.app.inject({
          method: 'POST',
          url: '/api/discount-codes',
          payload: { code: 'FIXED50', type: 'fixed', value: 50 },
        });
        expect(res.statusCode).toBe(201);
        expect(res.json().data.type).toBe('fixed');
      });

      it('should reject duplicate codes', async () => {
        await ctx.app.inject({
          method: 'POST',
          url: '/api/discount-codes',
          payload: { code: 'DUP1', type: 'percentage', value: 10 },
        });
        const res = await ctx.app.inject({
          method: 'POST',
          url: '/api/discount-codes',
          payload: { code: 'DUP1', type: 'percentage', value: 20 },
        });
        expect(res.statusCode).toBe(409);
      });

      it('should require code, type, value', async () => {
        const res = await ctx.app.inject({
          method: 'POST',
          url: '/api/discount-codes',
          payload: { code: 'NOVALUE' },
        });
        expect(res.statusCode).toBe(400);
      });
    });

    describe('GET /api/discount-codes/:id', () => {
  setupMockApi();
      it('should get code by ID', async () => {
        const res = await ctx.app.inject({
          method: 'GET',
          url: '/api/discount-codes/welcome10',
        });
        expect(res.statusCode).toBe(200);
        expect(res.json().data.code).toBe('WELCOME10');
      });

      it('should return 404 for non-existent', async () => {
        const res = await ctx.app.inject({
          method: 'GET',
          url: '/api/discount-codes/nonexistent',
        });
        expect(res.statusCode).toBe(404);
      });
    });

    describe('PUT /api/discount-codes/:id', () => {
  setupMockApi();
      it('should update code', async () => {
        await ctx.app.inject({
          method: 'POST',
          url: '/api/discount-codes',
          payload: { code: 'TOUPDATE', type: 'percentage', value: 10 },
        });
        const res = await ctx.app.inject({
          method: 'PUT',
          url: '/api/discount-codes/toupdate',
          payload: { value: 20, isActive: false },
        });
        expect(res.statusCode).toBe(200);
        expect(res.json().data.value).toBe(20);
        expect(res.json().data.isActive).toBe(false);
      });
    });

    describe('DELETE /api/discount-codes/:id', () => {
  setupMockApi();
      it('should delete code', async () => {
        await ctx.app.inject({
          method: 'POST',
          url: '/api/discount-codes',
          payload: { code: 'TODELETE', type: 'percentage', value: 10 },
        });
        const res = await ctx.app.inject({
          method: 'DELETE',
          url: '/api/discount-codes/todelete',
        });
        expect(res.statusCode).toBe(200);
        
        const getRes = await ctx.app.inject({
          method: 'GET',
          url: '/api/discount-codes/todelete',
        });
        expect(getRes.statusCode).toBe(404);
      });
    });

    describe('POST /api/discount-codes/validate', () => {
  setupMockApi();
      it('should validate active code', async () => {
        const res = await ctx.app.inject({
          method: 'POST',
          url: '/api/discount-codes/validate',
          payload: { code: 'WELCOME10', bookingValue: 1000 },
        });
        expect(res.statusCode).toBe(200);
        expect(res.json().data.valid).toBe(true);
        expect(res.json().data.discountAmount).toBe(100);
      });

      it('should return invalid for non-existent', async () => {
        const res = await ctx.app.inject({
          method: 'POST',
          url: '/api/discount-codes/validate',
          payload: { code: 'NOTEXIST', bookingValue: 1000 },
        });
        expect(res.statusCode).toBe(200);
        expect(res.json().data.valid).toBe(false);
      });

      it('should require code', async () => {
        const res = await ctx.app.inject({
          method: 'POST',
          url: '/api/discount-codes/validate',
          payload: { bookingValue: 1000 },
        });
        expect(res.statusCode).toBe(400);
      });
    });
  });

  // ==========================================================================
  // Health Controller Tests
  // ==========================================================================
  describe('Health Controller', () => {
  setupMockApi();
    describe('GET /api/health', () => {
  setupMockApi();
      it('should return health status', async () => {
        const res = await ctx.app.inject({
          method: 'GET',
          url: '/api/health',
        });
        expect(res.statusCode).toBe(200);
        expect(res.json().status).toBe('ok');
        expect(res.json().timestamp).toBeDefined();
      });
    });

    describe('GET /api/health/ready', () => {
  setupMockApi();
      it('should return readiness status', async () => {
        const res = await ctx.app.inject({
          method: 'GET',
          url: '/api/health/ready',
        });
        expect(res.statusCode).toBe(200);
        expect(res.json().status).toBe('ready');
        expect(res.json().database).toBe('connected');
      });
    });

    describe('GET /api/health/live', () => {
  setupMockApi();
      it('should return liveness status', async () => {
        const res = await ctx.app.inject({
          method: 'GET',
          url: '/api/health/live',
        });
        expect(res.statusCode).toBe(200);
        expect(res.json().status).toBe('live');
      });
    });
  });
});
