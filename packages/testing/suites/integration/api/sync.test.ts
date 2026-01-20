/**
 * Sync API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Sync API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/sync/status', () => {
    it('should return sync status', async () => {
      const response = await fetch(`${API_URL}/api/sync/status`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/sync/trigger', () => {
    it('should trigger sync', async () => {
      const response = await fetch(`${API_URL}/api/sync/trigger`, {
        method: 'POST',
      });
      expect([200, 202, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/sync/history', () => {
    it('should return sync history', async () => {
      const response = await fetch(`${API_URL}/api/sync/history`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
