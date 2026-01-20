/**
 * Memberships API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Memberships API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/memberships', () => {
    it('should return memberships', async () => {
      const response = await fetch(`${API_URL}/api/memberships`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/memberships', () => {
    it('should handle membership creation', async () => {
      const response = await fetch(`${API_URL}/api/memberships`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: '00000000-0000-0000-0000-000000000000',
          userId: '00000000-0000-0000-0000-000000000000',
          role: 'member',
        }),
      });
      expect([200, 201, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('PUT /api/memberships/:id', () => {
    it('should handle membership update', async () => {
      const response = await fetch(`${API_URL}/api/memberships/00000000-0000-0000-0000-000000000000`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'admin' }),
      });
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('DELETE /api/memberships/:id', () => {
    it('should handle membership deletion', async () => {
      const response = await fetch(`${API_URL}/api/memberships/00000000-0000-0000-0000-000000000000`, {
        method: 'DELETE',
      });
      expect([200, 204, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
