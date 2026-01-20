/**
 * Users API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Users API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/users', () => {
    it('should return response', async () => {
      const response = await fetch(`${API_URL}/api/users`);
      expect([200, 401, 403, 404]).toContain(response.status);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should handle user lookup', async () => {
      const response = await fetch(`${API_URL}/api/users/00000000-0000-0000-0000-000000000000`);
      expect([200, 400, 401, 403, 404]).toContain(response.status);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should handle user update', async () => {
      const response = await fetch(`${API_URL}/api/users/00000000-0000-0000-0000-000000000000`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test' }),
      });
      expect([200, 400, 401, 403, 404, 422]).toContain(response.status);
    });
  });
});
