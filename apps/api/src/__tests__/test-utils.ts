/**
 * Test Utilities for Unified API
 * Provides test context, mock data, and helpers
 */
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import { JwtService } from '../core/auth/jwt.service';

// Test context interface
export interface TestContext {
  app: FastifyInstance;
  testTenantId: string;
  testUserId: string;
  adminUserId: string;
  saksbehandlerUserId: string;
  testRentalObjectId: string;
  testOrganizationId: string;
  cleanup: () => Promise<void>;
}

// Mock UUIDs for testing
export const TEST_IDS = {
  tenantId: 'a1b2c3d4-1234-5678-9abc-def012345678',
  adminUserId: 'admin007-0000-0000-0000-000000000001',
  saksbehandlerUserId: 'saksbe01-0000-0000-0000-000000000002',
  userId: 'user0001-0000-0000-0000-000000000003',
  rentalObjectId: 'rental01-0000-0000-0000-000000000001',
  bookingId: 'booking1-0000-0000-0000-000000000001',
  organizationId: 'organi01-0000-0000-0000-000000000001',
};

// Test JWT service with minimum 32-character secret
const TEST_JWT_SECRET = 'test-secret-for-jwt-tokens-minimum-32-chars-required';
export const testJwtService = new JwtService(TEST_JWT_SECRET);

/**
 * Create a test application instance
 */
export async function createTestApp(): Promise<TestContext> {
  const app = Fastify({ logger: false });
  
  // Register test routes (mock implementation)
  await registerTestRoutes(app);
  
  await app.ready();
  
  return {
    app,
    testTenantId: TEST_IDS.tenantId,
    testUserId: TEST_IDS.userId,
    adminUserId: TEST_IDS.adminUserId,
    saksbehandlerUserId: TEST_IDS.saksbehandlerUserId,
    testRentalObjectId: TEST_IDS.rentalObjectId,
    testOrganizationId: TEST_IDS.organizationId,
    cleanup: async () => {
      await app.close();
    },
  };
}

/**
 * Register mock routes for testing
 */
async function registerTestRoutes(app: FastifyInstance) {
  // Auth routes
  app.post('/api/auth/login', async (request, reply) => {
    const body = request.body as { email?: string };
    if (!body.email) {
      reply.code(400);
      return { error: { code: 'VALIDATION_ERROR', message: 'Email required' } };
    }
    if (body.email === 'nonexistent@test.no') {
      reply.code(404);
      return { error: { code: 'NOT_FOUND', message: 'User not found' } };
    }
    // Generate real JWT token
    const tokenResult = testJwtService.generateToken(TEST_IDS.userId, TEST_IDS.tenantId);
    return {
      data: {
        token: tokenResult.token,
        user: { id: TEST_IDS.userId, email: body.email, name: 'Test User', role: 'user' },
        expiresAt: tokenResult.expiresAt.toISOString(),
      },
    };
  });

  app.get('/api/auth/session', async (request, reply) => {
    const userId = request.headers['x-user-id'];
    if (!userId) {
      reply.code(401);
      return { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } };
    }
    // Generate real JWT token
    const tokenResult = testJwtService.generateToken(userId as string, TEST_IDS.tenantId);
    return {
      data: {
        user: { id: userId, email: 'test@test.no', name: 'Test User', role: 'user' },
        token: tokenResult.token,
      },
    };
  });

  app.post('/api/auth/logout', async () => {
    return { data: { success: true } };
  });

  app.post('/api/auth/refresh', async () => {
    // Generate real JWT token
    const tokenResult = testJwtService.generateToken(TEST_IDS.userId, TEST_IDS.tenantId);
    return { data: { token: tokenResult.token, expiresAt: tokenResult.expiresAt.toISOString() } };
  });

  app.get('/api/auth/providers', async () => {
    return {
      data: [
        { id: 'bankid', name: 'BankID', enabled: true },
        { id: 'vipps', name: 'Vipps', enabled: true },
        { id: 'idporten', name: 'ID-porten', enabled: true },
      ],
    };
  });

  app.get('/api/auth/csrf', async () => {
    return { data: { token: 'csrf-token-123', expiresAt: new Date(Date.now() + 600000).toISOString() } };
  });

  app.post('/api/auth/email', async (request, reply) => {
    const body = request.body as { email?: string; password?: string };
    if (!body.email || !body.password) {
      reply.code(400);
      return { error: { code: 'VALIDATION_ERROR', message: 'Email and password required' } };
    }
    // Generate real JWT token
    const tokenResult = testJwtService.generateToken(TEST_IDS.userId, TEST_IDS.tenantId);
    return {
      data: {
        token: tokenResult.token,
        user: { id: TEST_IDS.userId, email: body.email, name: 'Test User' },
      },
    };
  });

  // Authz routes
  const permissions: Record<string, Record<string, string[]>> = {
    admin: {
      dashboard: ['read', 'write'],
      rentalObjects: ['read', 'create', 'update', 'delete'],
      bookings: ['read', 'create', 'update', 'delete'],
      users: ['read', 'create', 'update', 'delete'],
      organizations: ['read', 'create', 'update', 'delete'],
      settings: ['read', 'write'],
    },
    saksbehandler: {
      dashboard: ['read'],
      rentalObjects: ['read', 'create', 'update'],
      bookings: ['read', 'create', 'update'],
      users: ['read'],
      organizations: ['read', 'update'],
      settings: ['read'],
    },
    user: {
      rentalObjects: ['read'],
      bookings: ['read', 'create'],
      users: ['read'],
      organizations: ['read'],
    },
  };

  app.get('/api/authz/permissions', async (request) => {
    const role = (request.headers['x-user-role'] as string) || 'user';
    return { data: { role, permissions: permissions[role] || permissions.user } };
  });

  app.get('/api/authz/check', async (request, reply) => {
    const { resource, action } = request.query as { resource?: string; action?: string };
    if (!resource || !action) {
      reply.code(400);
      return { error: { code: 'VALIDATION_ERROR', message: 'Resource and action required' } };
    }
    const role = (request.headers['x-user-role'] as string) || 'user';
    const rolePerms = permissions[role] || permissions.user;
    const allowed = rolePerms[resource]?.includes(action) ?? false;
    return { data: { allowed, role } };
  });

  // Public routes
  app.get('/api/public/rental-objects', async (request) => {
    const query = request.query as Record<string, string>;
    const rentalObjects = [
      { id: TEST_IDS.rentalObjectId, name: 'Test Hall', type: 'SPACE', status: 'published', pricing: { basePrice: 500, currency: 'NOK', unit: 'hour' } },
    ];
    return { data: rentalObjects, meta: { total: 1, page: Number(query.page) || 1, limit: Number(query.limit) || 20, totalPages: 1 } };
  });

  app.get('/api/public/rental-objects/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    if (id === '00000000-0000-0000-0000-000000000000') {
      reply.code(404);
      return { error: { code: 'NOT_FOUND', message: 'Rental object not found' } };
    }
    return { data: { id, name: 'Test Hall', type: 'SPACE', status: 'published' } };
  });

  app.get('/api/public/rental-objects/:id/availability', async (request) => {
    const { id } = request.params as { id: string };
    return { data: { rentalObjectId: id, slots: [] } };
  });

  app.get('/api/public/categories', async () => {
    return { data: [{ id: 'sports', name: 'Idrettshall', slug: 'sports' }] };
  });

  app.get('/api/public/cities', async () => {
    return { data: [{ name: 'Oslo', slug: 'oslo' }, { name: 'Bergen', slug: 'bergen' }] };
  });

  app.get('/api/public/municipalities', async () => {
    return { data: [{ code: '0301', name: 'Oslo', county: 'Oslo' }] };
  });

  app.get('/api/public/featured', async () => {
    return { data: [] };
  });

  // Settings routes
  app.get('/api/settings', async (request, reply) => {
    const tenantId = request.headers['x-tenant-id'] as string;
    if (!tenantId) {
      reply.code(400);
      return { error: { code: 'VALIDATION_ERROR', message: 'Tenant ID required' } };
    }
    if (tenantId === '00000000-0000-0000-0000-000000000000') {
      reply.code(404);
      return { error: { code: 'NOT_FOUND', message: 'Tenant not found' } };
    }
    return {
      data: {
        tenantId,
        timezone: 'Europe/Oslo',
        currency: 'NOK',
        language: 'no',
      },
    };
  });

  app.put('/api/settings', async (request, reply) => {
    const tenantId = request.headers['x-tenant-id'] as string;
    if (!tenantId) {
      reply.code(400);
      return { error: { code: 'VALIDATION_ERROR', message: 'Tenant ID required' } };
    }
    const body = request.body as Record<string, unknown>;
    return {
      data: {
        tenantId,
        timezone: 'Europe/Oslo',
        currency: 'NOK',
        ...body,
      },
    };
  });

  app.get('/api/settings/integrations', async (request, reply) => {
    const tenantId = request.headers['x-tenant-id'] as string;
    if (!tenantId) {
      reply.code(400);
      return { error: { code: 'VALIDATION_ERROR', message: 'Tenant ID required' } };
    }
    return {
      data: {
        bankid: { enabled: false },
        vipps: { enabled: false },
        visma: { enabled: false },
        rco: { enabled: false },
      },
    };
  });

  app.put('/api/settings/integrations/:provider', async (request, reply) => {
    const tenantId = request.headers['x-tenant-id'] as string;
    if (!tenantId) {
      reply.code(400);
      return { error: { code: 'VALIDATION_ERROR', message: 'Tenant ID required' } };
    }
    const { provider } = request.params as { provider: string };
    const body = request.body as Record<string, unknown>;
    return {
      data: {
        bankid: { enabled: false },
        vipps: { enabled: false },
        visma: { enabled: false },
        rco: { enabled: false },
        [provider]: body,
      },
    };
  });

  // Discount codes routes
  const discountCodes = new Map<string, Record<string, unknown>>([
    ['welcome10', { id: 'welcome10', code: 'WELCOME10', type: 'percentage', value: 10, isActive: true, usedCount: 0 }],
  ]);

  app.get('/api/discount-codes', async () => {
    return { data: Array.from(discountCodes.values()), meta: { total: discountCodes.size, page: 1, limit: 20, totalPages: 1 } };
  });

  app.post('/api/discount-codes', async (request, reply) => {
    const body = request.body as { code?: string; type?: string; value?: number; description?: string; maxUses?: number; validFrom?: string; validUntil?: string };
    if (!body.code || !body.type || body.value === undefined) {
      reply.code(400);
      return { error: { code: 'VALIDATION_ERROR', message: 'Code, type and value required' } };
    }
    if (discountCodes.has(body.code.toLowerCase())) {
      reply.code(409);
      return { error: { code: 'CONFLICT', message: 'Code already exists' } };
    }
    const id = body.code.toLowerCase();
    const newCode = { id, code: body.code, type: body.type, value: body.value, isActive: true, usedCount: 0, description: body.description, maxUses: body.maxUses, validFrom: body.validFrom, validUntil: body.validUntil, createdAt: new Date().toISOString() };
    discountCodes.set(id, newCode);
    reply.code(201);
    return { data: newCode };
  });

  app.get('/api/discount-codes/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const code = discountCodes.get(id);
    if (!code) {
      reply.code(404);
      return { error: { code: 'NOT_FOUND', message: 'Discount code not found' } };
    }
    return { data: code };
  });

  app.put('/api/discount-codes/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const code = discountCodes.get(id);
    if (!code) {
      reply.code(404);
      return { error: { code: 'NOT_FOUND', message: 'Discount code not found' } };
    }
    const body = request.body as Record<string, unknown>;
    const updated = { ...code, ...body };
    discountCodes.set(id, updated);
    return { data: updated };
  });

  app.delete('/api/discount-codes/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    if (!discountCodes.has(id)) {
      reply.code(404);
      return { error: { code: 'NOT_FOUND', message: 'Discount code not found' } };
    }
    discountCodes.delete(id);
    return { success: true };
  });

  app.post('/api/discount-codes/validate', async (request, reply) => {
    const body = request.body as { code?: string; bookingValue?: number };
    if (!body.code) {
      reply.code(400);
      return { error: { code: 'VALIDATION_ERROR', message: 'Code required' } };
    }
    const code = discountCodes.get(body.code.toLowerCase()) as Record<string, unknown> | undefined;
    if (!code) {
      return { data: { valid: false, reason: 'Discount code not found' } };
    }
    if (!code.isActive) {
      return { data: { valid: false, reason: 'Discount code is not active' } };
    }
    const discountAmount = code.type === 'percentage'
      ? ((body.bookingValue || 0) * (code.value as number)) / 100
      : code.value;
    return { data: { valid: true, discountAmount, code } };
  });

  // Health routes
  app.get('/api/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  app.get('/api/health/ready', async () => {
    return { status: 'ready', database: 'connected' };
  });

  app.get('/api/health/live', async () => {
    return { status: 'live' };
  });
}

/**
 * Create test request helper
 */
export function createTestRequest(ctx: TestContext, options: {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  payload?: unknown;
  headers?: Record<string, string>;
}) {
  return ctx.app.inject({
    method: options.method || 'GET',
    url: options.url,
    payload: options.payload,
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-Id': ctx.testTenantId,
      ...options.headers,
    },
  });
}
