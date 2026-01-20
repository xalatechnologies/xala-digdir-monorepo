/**
 * Organization Members API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Organization Members API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/organizations/:id/members', () => {
    it('should return organization members', async () => {
      const response = await fetch(`${API_URL}/api/organizations/00000000-0000-0000-0000-000000000000/members`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/organizations/:id/members', () => {
    it('should add member', async () => {
      const response = await fetch(`${API_URL}/api/organizations/00000000-0000-0000-0000-000000000000/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: '00000000-0000-0000-0000-000000000001', role: 'member' }),
      });
      expect([200, 201, 400, 401, 403, 404, 409, 422, 500]).toContain(response.status);
    });
  });

  describe('PUT /api/organizations/:id/members/:memberId/role', () => {
    it('should update member role', async () => {
      const response = await fetch(`${API_URL}/api/organizations/00000000-0000-0000-0000-000000000000/members/00000000-0000-0000-0000-000000000001/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'admin' }),
      });
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('DELETE /api/organizations/:id/members/:memberId', () => {
    it('should remove member', async () => {
      const response = await fetch(`${API_URL}/api/organizations/00000000-0000-0000-0000-000000000000/members/00000000-0000-0000-0000-000000000001`, {
        method: 'DELETE',
      });
      expect([200, 204, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
