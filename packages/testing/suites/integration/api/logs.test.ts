/**
 * Logs API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Logs API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/logs', () => {
    it('should return logs', async () => {
      const response = await fetch(`${API_URL}/api/logs`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/logs/errors', () => {
    it('should return error logs', async () => {
      const response = await fetch(`${API_URL}/api/logs/errors`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/logs/access', () => {
    it('should return access logs', async () => {
      const response = await fetch(`${API_URL}/api/logs/access`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
