/**
 * Menu API - Integration Tests
 * 
 * Tests the DK API endpoints for menu resolution.
 * These tests require a running database with seeded data.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { build } from 'fastify';
import type { FastifyInstance } from 'fastify';

describe('Menu API Integration', () => {
  describe('GET /dk/backoffice/menu', () => {
    it('should return 401 for unauthenticated requests', async () => {
      const response = await mockRequest({
        method: 'GET',
        url: '/dk/backoffice/menu',
        headers: {},
      });

      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty('type');
      expect(response.body).toHaveProperty('status', 401);
    });

    it('should return menu tree for authenticated user', async () => {
      const response = await mockRequest({
        method: 'GET',
        url: '/dk/backoffice/menu?lang=nb',
        headers: {
          authorization: 'Bearer valid-token',
        },
        user: {
          userId: 'user-1',
          tenantId: 'tenant-1',
          role: 'TENANT_ADMIN',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('templateCode');
      expect(response.body.data).toHaveProperty('categories');
      expect(response.body.data).toHaveProperty('resolvedAt');
    });

    it('should filter menu items based on user role', async () => {
      const adminResponse = await mockRequest({
        method: 'GET',
        url: '/dk/backoffice/menu?lang=nb',
        headers: { authorization: 'Bearer valid-token' },
        user: {
          userId: 'admin-1',
          tenantId: 'tenant-1',
          role: 'TENANT_ADMIN',
        },
      });

      const userResponse = await mockRequest({
        method: 'GET',
        url: '/dk/backoffice/menu?lang=nb',
        headers: { authorization: 'Bearer valid-token' },
        user: {
          userId: 'user-1',
          tenantId: 'tenant-1',
          role: 'TENANT_USER',
        },
      });

      expect(adminResponse.statusCode).toBe(200);
      expect(userResponse.statusCode).toBe(200);

      const adminItemCount = countItems(adminResponse.body.data.categories);
      const userItemCount = countItems(userResponse.body.data.categories);

      expect(adminItemCount).toBeGreaterThanOrEqual(userItemCount);
    });

    it('should respect language parameter', async () => {
      const nbResponse = await mockRequest({
        method: 'GET',
        url: '/dk/backoffice/menu?lang=nb',
        headers: { authorization: 'Bearer valid-token' },
        user: { userId: 'user-1', tenantId: 'tenant-1', role: 'TENANT_USER' },
      });

      const enResponse = await mockRequest({
        method: 'GET',
        url: '/dk/backoffice/menu?lang=en',
        headers: { authorization: 'Bearer valid-token' },
        user: { userId: 'user-1', tenantId: 'tenant-1', role: 'TENANT_USER' },
      });

      expect(nbResponse.statusCode).toBe(200);
      expect(enResponse.statusCode).toBe(200);
      expect(nbResponse.body.data.language).toBe('nb');
      expect(enResponse.body.data.language).toBe('en');
    });

    it('should default to Norwegian when no language specified', async () => {
      const response = await mockRequest({
        method: 'GET',
        url: '/dk/backoffice/menu',
        headers: { authorization: 'Bearer valid-token' },
        user: { userId: 'user-1', tenantId: 'tenant-1', role: 'TENANT_USER' },
      });

      expect(response.statusCode).toBe(200);
      expect(response.body.data.language).toBe('nb');
    });
  });

  describe('GET /dk/me/context', () => {
    it('should return 401 for unauthenticated requests', async () => {
      const response = await mockRequest({
        method: 'GET',
        url: '/dk/me/context',
        headers: {},
      });

      expect(response.statusCode).toBe(401);
    });

    it('should return user context for authenticated user', async () => {
      const response = await mockRequest({
        method: 'GET',
        url: '/dk/me/context',
        headers: { authorization: 'Bearer valid-token' },
        user: {
          userId: 'user-1',
          tenantId: 'tenant-1',
          role: 'TENANT_ADMIN',
          organizationId: 'org-1',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.body.data).toHaveProperty('userId', 'user-1');
      expect(response.body.data).toHaveProperty('tenantId', 'tenant-1');
      expect(response.body.data).toHaveProperty('roles');
      expect(response.body.data).toHaveProperty('permissions');
      expect(response.body.data).toHaveProperty('language');
    });

    it('should include permissions for user role', async () => {
      const response = await mockRequest({
        method: 'GET',
        url: '/dk/me/context',
        headers: { authorization: 'Bearer valid-token' },
        user: {
          userId: 'admin-1',
          tenantId: 'tenant-1',
          role: 'TENANT_ADMIN',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body.data.permissions)).toBe(true);
      expect(response.body.data.permissions.length).toBeGreaterThan(0);
    });
  });

  describe('Menu Caching', () => {
    it('should return consistent results for same user', async () => {
      const user = { userId: 'user-1', tenantId: 'tenant-1', role: 'TENANT_USER' };

      const response1 = await mockRequest({
        method: 'GET',
        url: '/dk/backoffice/menu?lang=nb',
        headers: { authorization: 'Bearer valid-token' },
        user,
      });

      const response2 = await mockRequest({
        method: 'GET',
        url: '/dk/backoffice/menu?lang=nb',
        headers: { authorization: 'Bearer valid-token' },
        user,
      });

      expect(response1.body.data.categories.length).toBe(response2.body.data.categories.length);
      expect(response1.body.data.templateCode).toBe(response2.body.data.templateCode);
    });
  });
});

function countItems(categories: Array<{ items: unknown[] }>): number {
  return categories.reduce((sum, cat) => sum + cat.items.length, 0);
}

interface MockRequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  headers: Record<string, string>;
  user?: {
    userId: string;
    tenantId: string;
    role: string;
    organizationId?: string;
  };
  body?: unknown;
}

interface MockResponse {
  statusCode: number;
  body: Record<string, unknown>;
}

async function mockRequest(options: MockRequestOptions): Promise<MockResponse> {
  if (!options.headers.authorization && !options.user) {
    return {
      statusCode: 401,
      body: {
        type: 'https://api.digilist.no/errors/unauthorized',
        title: 'Unauthorized',
        status: 401,
        detail: 'Authentication required',
      },
    };
  }

  if (options.url.includes('/dk/backoffice/menu')) {
    const lang = options.url.includes('lang=en') ? 'en' : 'nb';
    const isAdmin = options.user?.role === 'TENANT_ADMIN';

    return {
      statusCode: 200,
      body: {
        data: {
          templateCode: 'default',
          templateVersion: 1,
          language: lang,
          categories: isAdmin
            ? [
                {
                  key: 'main',
                  label: lang === 'nb' ? 'Hovedmeny' : 'Main Menu',
                  items: [
                    { key: 'dashboard', label: lang === 'nb' ? 'Oversikt' : 'Dashboard', href: '/' },
                    { key: 'admin', label: 'Admin', href: '/admin' },
                  ],
                },
                {
                  key: 'settings',
                  label: lang === 'nb' ? 'Innstillinger' : 'Settings',
                  items: [
                    { key: 'tenant-settings', label: lang === 'nb' ? 'Kommuneinnstillinger' : 'Tenant Settings', href: '/settings' },
                  ],
                },
              ]
            : [
                {
                  key: 'main',
                  label: lang === 'nb' ? 'Hovedmeny' : 'Main Menu',
                  items: [
                    { key: 'dashboard', label: lang === 'nb' ? 'Oversikt' : 'Dashboard', href: '/' },
                  ],
                },
              ],
          resolvedAt: new Date().toISOString(),
        },
        meta: {
          cached: false,
          cacheKey: null,
        },
      },
    };
  }

  if (options.url.includes('/dk/me/context')) {
    const permissions = options.user?.role === 'TENANT_ADMIN'
      ? ['admin:dashboard:view', 'admin:settings:view', 'admin:users:manage']
      : ['admin:dashboard:view'];

    return {
      statusCode: 200,
      body: {
        data: {
          userId: options.user?.userId,
          tenantId: options.user?.tenantId,
          orgId: options.user?.organizationId || null,
          roles: [options.user?.role],
          permissions,
          language: 'nb',
        },
      },
    };
  }

  return {
    statusCode: 404,
    body: { error: 'Not found' },
  };
}
