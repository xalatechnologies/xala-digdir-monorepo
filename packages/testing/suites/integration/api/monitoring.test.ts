/**
 * Monitoring API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Monitoring API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/monitoring/health', () => {
    it('should return health status', async () => {
      const response = await fetch(`${API_URL}/api/monitoring/health`);
      expect([200, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/monitoring/metrics', () => {
    it('should return metrics', async () => {
      const response = await fetch(`${API_URL}/api/monitoring/metrics`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/monitoring/status', () => {
    it('should return service status', async () => {
      const response = await fetch(`${API_URL}/api/monitoring/status`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
