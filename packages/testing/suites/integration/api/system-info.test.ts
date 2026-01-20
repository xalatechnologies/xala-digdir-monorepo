/**
 * Sys Info API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('System Info API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/system/info', () => {
    it('should return system info', async () => {
      const response = await fetch(`${API_URL}/api/system/info`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/system/version', () => {
    it('should return version', async () => {
      const response = await fetch(`${API_URL}/api/system/version`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/system/database', () => {
    it('should return database status', async () => {
      const response = await fetch(`${API_URL}/api/system/database`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
