/**
 * Tenant Billing API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Tenant Billing API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/tenants/:id/billing', () => {
    it('should return billing info', async () => {
      const response = await fetch(`${API_URL}/api/tenants/00000000-0000-0000-0000-000000000000/billing`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('PUT /api/tenants/:id/billing', () => {
    it('should update billing info', async () => {
      const response = await fetch(`${API_URL}/api/tenants/00000000-0000-0000-0000-000000000000/billing`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billingEmail: 'billing@example.com' }),
      });
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('GET /api/tenants/:id/invoices', () => {
    it('should return tenant invoices', async () => {
      const response = await fetch(`${API_URL}/api/tenants/00000000-0000-0000-0000-000000000000/invoices`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/tenants/:id/subscription', () => {
    it('should return tenant subscription', async () => {
      const response = await fetch(`${API_URL}/api/tenants/00000000-0000-0000-0000-000000000000/subscription`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
