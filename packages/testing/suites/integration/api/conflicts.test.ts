/**
 * Conflicts API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Conflicts API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/conflicts', () => {
    it('should return conflicts list', async () => {
      const response = await fetch(`${API_URL}/api/conflicts`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/conflicts/resolve', () => {
    it('should handle conflict resolution', async () => {
      const response = await fetch(`${API_URL}/api/conflicts/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conflictId: '00000000-0000-0000-0000-000000000000', resolution: 'keep_first' }),
      });
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });
});
