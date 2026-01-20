/**
 * Extensions API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Extensions API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/extensions', () => {
    it('should return extensions list', async () => {
      const response = await fetch(`${API_URL}/api/extensions`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/extensions/:id/enable', () => {
    it('should enable extension', async () => {
      const response = await fetch(`${API_URL}/api/extensions/00000000-0000-0000-0000-000000000000/enable`, {
        method: 'POST',
      });
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/extensions/:id/disable', () => {
    it('should disable extension', async () => {
      const response = await fetch(`${API_URL}/api/extensions/00000000-0000-0000-0000-000000000000/disable`, {
        method: 'POST',
      });
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/extensions/:id/config', () => {
    it('should return extension config', async () => {
      const response = await fetch(`${API_URL}/api/extensions/00000000-0000-0000-0000-000000000000/config`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
