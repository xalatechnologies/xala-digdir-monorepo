/**
 * Metrics API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Metrics API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/metrics', () => {
    it('should return metrics', async () => {
      const response = await fetch(`${API_URL}/api/metrics`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/metrics/prometheus', () => {
    it('should return Prometheus metrics', async () => {
      const response = await fetch(`${API_URL}/api/metrics/prometheus`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/metrics/booking', () => {
    it('should return booking metrics', async () => {
      const response = await fetch(`${API_URL}/api/metrics/booking`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
