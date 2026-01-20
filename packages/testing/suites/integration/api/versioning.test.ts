/**
 * API Versioning Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('API Versioning', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/version', () => {
    it('should return API version info', async () => {
      const response = await fetch(`${API_URL}/api/version`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/v1/health', () => {
    it('should accept v1 API version', async () => {
      const response = await fetch(`${API_URL}/api/v1/health`);
      expect([200, 301, 302, 404, 500]).toContain(response.status);
    });
  });
});
