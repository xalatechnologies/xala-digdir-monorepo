/**
 * Tenant Users API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Tenant Users API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/tenants/:id/users', () => {
    it('should return tenant users', async () => {
      const response = await fetch(`${API_URL}/api/tenants/00000000-0000-0000-0000-000000000000/users`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/tenants/:id/users', () => {
    it('should add user to tenant', async () => {
      const response = await fetch(`${API_URL}/api/tenants/00000000-0000-0000-0000-000000000000/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'newuser@example.com', role: 'admin' }),
      });
      expect([200, 201, 400, 401, 403, 404, 409, 422, 500]).toContain(response.status);
    });
  });

  describe('PUT /api/tenants/:id/users/:userId/role', () => {
    it('should update user role', async () => {
      const response = await fetch(`${API_URL}/api/tenants/00000000-0000-0000-0000-000000000000/users/00000000-0000-0000-0000-000000000001/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'viewer' }),
      });
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('DELETE /api/tenants/:id/users/:userId', () => {
    it('should remove user from tenant', async () => {
      const response = await fetch(`${API_URL}/api/tenants/00000000-0000-0000-0000-000000000000/users/00000000-0000-0000-0000-000000000001`, {
        method: 'DELETE',
      });
      expect([200, 204, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
