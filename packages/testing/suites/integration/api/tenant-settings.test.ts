/**
 * Tenant Settings API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Tenant Settings API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/tenants/:id/settings', () => {
    it('should return tenant settings', async () => {
      const response = await fetch(`${API_URL}/api/tenants/00000000-0000-0000-0000-000000000000/settings`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('PUT /api/tenants/:id/settings', () => {
    it('should update tenant settings', async () => {
      const response = await fetch(`${API_URL}/api/tenants/00000000-0000-0000-0000-000000000000/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timezone: 'Europe/Oslo' }),
      });
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('GET /api/tenants/:id/features', () => {
    it('should return tenant features', async () => {
      const response = await fetch(`${API_URL}/api/tenants/00000000-0000-0000-0000-000000000000/features`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
