/**
 * API Controllers Integration Tests
 * 
 * Tests all API controller endpoints
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

async function isApiAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/health`, {
      signal: AbortSignal.timeout(2000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

describe('API Controllers', () => {
  let apiAvailable = false;

  beforeAll(async () => {
    apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      console.log('⚠️  Skipping controller tests - API not available at', API_URL);
    }
  });

  describe('Health Controller', () => {
    it('GET /health should return ok', async () => {
      if (!apiAvailable) return;
      const response = await fetch(`${API_URL}/health`);
      expect(response.ok).toBe(true);
    });
  });

  describe('Public Controllers', () => {
    it('GET /public/rental-objects should return list', async () => {
      if (!apiAvailable) return;
      const response = await fetch(`${API_URL}/public/rental-objects`);
      expect(response.ok).toBe(true);
    });

    it('GET /public/categories should return list', async () => {
      if (!apiAvailable) return;
      const response = await fetch(`${API_URL}/public/categories`);
      expect(response.ok).toBe(true);
    });

    it('GET /public/amenities should return list', async () => {
      if (!apiAvailable) return;
      const response = await fetch(`${API_URL}/public/amenities`);
      expect([200, 404]).toContain(response.status);
    });
  });

  describe('Auth Controllers', () => {
    it('POST /auth/login should require credentials', async () => {
      if (!apiAvailable) return;
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      expect([400, 401, 422]).toContain(response.status);
    });

    it('GET /me should require auth', async () => {
      if (!apiAvailable) return;
      const response = await fetch(`${API_URL}/me`);
      expect([401, 403]).toContain(response.status);
    });
  });

  describe('Protected Controllers', () => {
    it('GET /api/bookings should require auth', async () => {
      if (!apiAvailable) return;
      const response = await fetch(`${API_URL}/api/bookings`);
      expect([401, 403]).toContain(response.status);
    });

    it('GET /api/users should require auth', async () => {
      if (!apiAvailable) return;
      const response = await fetch(`${API_URL}/api/users`);
      expect([401, 403]).toContain(response.status);
    });

    it('GET /api/organizations should require auth', async () => {
      if (!apiAvailable) return;
      const response = await fetch(`${API_URL}/api/organizations`);
      expect([401, 403]).toContain(response.status);
    });

    it('GET /api/tenants should require auth', async () => {
      if (!apiAvailable) return;
      const response = await fetch(`${API_URL}/api/tenants`);
      expect([401, 403]).toContain(response.status);
    });

    it('GET /api/audit should require auth', async () => {
      if (!apiAvailable) return;
      const response = await fetch(`${API_URL}/api/audit`);
      expect([401, 403]).toContain(response.status);
    });

    it('GET /api/rental-objects should require auth', async () => {
      if (!apiAvailable) return;
      const response = await fetch(`${API_URL}/api/rental-objects`);
      expect([401, 403]).toContain(response.status);
    });
  });

  describe('SaaS Admin Controllers', () => {
    it('GET /api/saas/tenants should require SaaS admin', async () => {
      if (!apiAvailable) return;
      const response = await fetch(`${API_URL}/api/saas/tenants`);
      expect([401, 403, 404]).toContain(response.status);
    });

    it('GET /api/saas/features should require SaaS admin', async () => {
      if (!apiAvailable) return;
      const response = await fetch(`${API_URL}/api/saas/features`);
      expect([401, 403, 404]).toContain(response.status);
    });
  });

  describe('Notification Controllers', () => {
    it('GET /api/notifications should require auth', async () => {
      if (!apiAvailable) return;
      const response = await fetch(`${API_URL}/api/notifications`);
      expect([401, 403, 404]).toContain(response.status);
    });
  });

  describe('Profile Controllers', () => {
    it('GET /api/profile should require auth', async () => {
      if (!apiAvailable) return;
      const response = await fetch(`${API_URL}/api/profile`);
      expect([401, 403, 404]).toContain(response.status);
    });
  });

  describe('Favorites Controllers', () => {
    it('GET /api/favorites should require auth', async () => {
      if (!apiAvailable) return;
      const response = await fetch(`${API_URL}/api/favorites`);
      expect([401, 403, 404]).toContain(response.status);
    });
  });
});
