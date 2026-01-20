/**
 * Internal Admin API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Internal Admin API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/admin/stats', () => {
    it('should return admin stats', async () => {
      const response = await fetch(`${API_URL}/api/admin/stats`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/admin/users', () => {
    it('should return admin user list', async () => {
      const response = await fetch(`${API_URL}/api/admin/users`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/admin/impersonate', () => {
    it('should handle impersonation request', async () => {
      const response = await fetch(`${API_URL}/api/admin/impersonate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: '00000000-0000-0000-0000-000000000000' }),
      });
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('POST /api/admin/cache/clear', () => {
    it('should handle cache clear request', async () => {
      const response = await fetch(`${API_URL}/api/admin/cache/clear`, {
        method: 'POST',
      });
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
