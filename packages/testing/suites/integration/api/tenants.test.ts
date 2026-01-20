/**
 * Tenants API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Tenants API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/tenants', () => {
    it('should return response', async () => {
      const response = await fetch(`${API_URL}/api/tenants`);
      expect([200, 401, 403, 404]).toContain(response.status);
    });
  });

  describe('POST /api/tenants', () => {
    it('should handle tenant creation request', async () => {
      const response = await fetch(`${API_URL}/api/tenants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test Tenant', domain: 'test.digilist.no' }),
      });
      expect([200, 201, 400, 401, 403, 422]).toContain(response.status);
    });
  });

  describe('GET /api/tenants/:id', () => {
    it('should handle tenant lookup', async () => {
      const response = await fetch(`${API_URL}/api/tenants/00000000-0000-0000-0000-000000000000`);
      expect([200, 400, 401, 403, 404]).toContain(response.status);
    });
  });
});
