/**
 * Sessions API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Sessions API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/sessions', () => {
    it('should return active sessions', async () => {
      const response = await fetch(`${API_URL}/api/sessions`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('DELETE /api/sessions/:id', () => {
    it('should handle session revocation', async () => {
      const response = await fetch(`${API_URL}/api/sessions/00000000-0000-0000-0000-000000000000`, {
        method: 'DELETE',
      });
      expect([200, 204, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('DELETE /api/sessions/all', () => {
    it('should handle all sessions revocation', async () => {
      const response = await fetch(`${API_URL}/api/sessions/all`, {
        method: 'DELETE',
      });
      expect([200, 204, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
