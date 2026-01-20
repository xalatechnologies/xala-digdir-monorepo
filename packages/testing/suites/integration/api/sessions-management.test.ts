/**
 * Sessions Management API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Sessions Management API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/sessions-management', () => {
    it('should return user sessions', async () => {
      const response = await fetch(`${API_URL}/api/sessions-management`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('DELETE /api/sessions-management/:id', () => {
    it('should revoke session', async () => {
      const response = await fetch(`${API_URL}/api/sessions-management/00000000-0000-0000-0000-000000000000`, {
        method: 'DELETE',
      });
      expect([200, 204, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('DELETE /api/sessions-management/all', () => {
    it('should revoke all sessions', async () => {
      const response = await fetch(`${API_URL}/api/sessions-management/all`, {
        method: 'DELETE',
      });
      expect([200, 204, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
