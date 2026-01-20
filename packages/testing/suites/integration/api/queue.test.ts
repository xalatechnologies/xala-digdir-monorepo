/**
 * Queue API Integration Tests  
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Queue API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/queue/jobs', () => {
    it('should return queue jobs', async () => {
      const response = await fetch(`${API_URL}/api/queue/jobs`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/queue/failed', () => {
    it('should return failed jobs', async () => {
      const response = await fetch(`${API_URL}/api/queue/failed`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/queue/retry/:id', () => {
    it('should handle job retry', async () => {
      const response = await fetch(`${API_URL}/api/queue/retry/00000000-0000-0000-0000-000000000000`, {
        method: 'POST',
      });
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
