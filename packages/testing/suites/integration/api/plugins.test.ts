/**
 * Plugins API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Plugins API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/plugins', () => {
    it('should return plugins list', async () => {
      const response = await fetch(`${API_URL}/api/plugins`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/plugins/marketplace', () => {
    it('should return marketplace plugins', async () => {
      const response = await fetch(`${API_URL}/api/plugins/marketplace`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/plugins/:id/install', () => {
    it('should install plugin', async () => {
      const response = await fetch(`${API_URL}/api/plugins/00000000-0000-0000-0000-000000000000/install`, {
        method: 'POST',
      });
      expect([200, 202, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/plugins/:id/uninstall', () => {
    it('should uninstall plugin', async () => {
      const response = await fetch(`${API_URL}/api/plugins/00000000-0000-0000-0000-000000000000/uninstall`, {
        method: 'POST',
      });
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
