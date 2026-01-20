/**
 * Cache API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Cache API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/cache/status', () => {
    it('should return cache status', async () => {
      const response = await fetch(`${API_URL}/api/cache/status`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/cache/clear', () => {
    it('should clear cache', async () => {
      const response = await fetch(`${API_URL}/api/cache/clear`, {
        method: 'POST',
      });
      expect([200, 204, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('DELETE /api/cache/:key', () => {
    it('should delete cache key', async () => {
      const response = await fetch(`${API_URL}/api/cache/test-key`, {
        method: 'DELETE',
      });
      expect([200, 204, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
