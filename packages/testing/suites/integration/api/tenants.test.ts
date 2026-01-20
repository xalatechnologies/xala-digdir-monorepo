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
    it('should require authentication', async () => {
      const response = await fetch(`${API_URL}/api/tenants`);
      expect([401, 403]).toContain(response.status);
    });
  });

  describe('POST /api/tenants', () => {
    it('should require authentication', async () => {
      const response = await fetch(`${API_URL}/api/tenants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test Tenant', domain: 'test.digilist.no' }),
      });
      expect([401, 403]).toContain(response.status);
    });
  });

  describe('GET /api/tenants/:id', () => {
    it('should require authentication', async () => {
      const response = await fetch(`${API_URL}/api/tenants/00000000-0000-0000-0000-000000000000`);
      expect([401, 403, 404]).toContain(response.status);
    });
  });

  describe('PUT /api/tenants/:id', () => {
    it('should require authentication', async () => {
      const response = await fetch(`${API_URL}/api/tenants/00000000-0000-0000-0000-000000000000`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Updated Tenant' }),
      });
      expect([401, 403, 404]).toContain(response.status);
    });
  });

  describe('DELETE /api/tenants/:id', () => {
    it('should require authentication', async () => {
      const response = await fetch(`${API_URL}/api/tenants/00000000-0000-0000-0000-000000000000`, {
        method: 'DELETE',
      });
      expect([401, 403, 404]).toContain(response.status);
    });
  });
});
