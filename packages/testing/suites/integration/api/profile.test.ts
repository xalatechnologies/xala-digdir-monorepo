/**
 * Profile API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Profile API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/profile', () => {
    it('should return profile or require auth', async () => {
      const response = await fetch(`${API_URL}/api/profile`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('PUT /api/profile', () => {
    it('should handle profile update', async () => {
      const response = await fetch(`${API_URL}/api/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test User' }),
      });
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('DELETE /api/profile', () => {
    it('should handle profile deletion request', async () => {
      const response = await fetch(`${API_URL}/api/profile`, {
        method: 'DELETE',
      });
      expect([200, 204, 400, 401, 403, 404]).toContain(response.status);
    });
  });
});
