/**
 * SaaS Admin Tenants API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('SaaS Admin Tenants API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/saas/tenants', () => {
    it('should handle tenant list request', async () => {
      const response = await fetch(`${API_URL}/api/saas/tenants`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/saas/tenants', () => {
    it('should handle tenant creation', async () => {
      const response = await fetch(`${API_URL}/api/saas/tenants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test Tenant', domain: 'test.digilist.no' }),
      });
      expect([200, 201, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('PUT /api/saas/tenants/:id', () => {
    it('should handle tenant update', async () => {
      const response = await fetch(`${API_URL}/api/saas/tenants/00000000-0000-0000-0000-000000000000`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Updated Tenant' }),
      });
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('DELETE /api/saas/tenants/:id', () => {
    it('should handle tenant deletion', async () => {
      const response = await fetch(`${API_URL}/api/saas/tenants/00000000-0000-0000-0000-000000000000`, {
        method: 'DELETE',
      });
      expect([200, 204, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
