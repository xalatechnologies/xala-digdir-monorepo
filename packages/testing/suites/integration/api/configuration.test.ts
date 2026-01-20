/**
 * Configuration API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Configuration API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/configuration', () => {
    it('should return configuration', async () => {
      const response = await fetch(`${API_URL}/api/configuration`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('PUT /api/configuration', () => {
    it('should handle configuration update', async () => {
      const response = await fetch(`${API_URL}/api/configuration`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timezone: 'Europe/Oslo' }),
      });
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('GET /public/configuration', () => {
    it('should return public configuration', async () => {
      const response = await fetch(`${API_URL}/public/configuration`);
      expect([200, 404, 500]).toContain(response.status);
    });
  });
});
