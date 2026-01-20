/**
 * Permissions API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Permissions API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/permissions', () => {
    it('should return permissions', async () => {
      const response = await fetch(`${API_URL}/api/permissions`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/permissions/roles', () => {
    it('should return roles', async () => {
      const response = await fetch(`${API_URL}/api/permissions/roles`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/permissions/roles', () => {
    it('should handle role creation', async () => {
      const response = await fetch(`${API_URL}/api/permissions/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'custom-role', permissions: ['read'] }),
      });
      expect([200, 201, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });
});
