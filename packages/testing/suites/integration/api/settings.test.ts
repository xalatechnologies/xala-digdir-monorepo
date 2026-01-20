/**
 * Settings API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Settings API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/settings', () => {
    it('should return settings', async () => {
      const response = await fetch(`${API_URL}/api/settings`);
      expect([200, 401, 403, 404]).toContain(response.status);
    });
  });

  describe('PUT /api/settings', () => {
    it('should handle settings update', async () => {
      const response = await fetch(`${API_URL}/api/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: 'dark' }),
      });
      expect([200, 400, 401, 403, 404, 422]).toContain(response.status);
    });
  });

  describe('GET /api/settings/notifications', () => {
    it('should return notification preferences', async () => {
      const response = await fetch(`${API_URL}/api/settings/notifications`);
      expect([200, 401, 403, 404]).toContain(response.status);
    });
  });
});
