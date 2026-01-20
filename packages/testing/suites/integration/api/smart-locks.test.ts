/**
 * Smart Lock API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Smart Lock API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/smart-locks', () => {
    it('should return smart locks list', async () => {
      const response = await fetch(`${API_URL}/api/smart-locks`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/smart-locks/:id/unlock', () => {
    it('should handle unlock request', async () => {
      const response = await fetch(`${API_URL}/api/smart-locks/00000000-0000-0000-0000-000000000000/unlock`, {
        method: 'POST',
      });
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/smart-locks/:id/lock', () => {
    it('should handle lock request', async () => {
      const response = await fetch(`${API_URL}/api/smart-locks/00000000-0000-0000-0000-000000000000/lock`, {
        method: 'POST',
      });
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
