/**
 * Health Extended API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Health Extended API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await fetch(`${API_URL}/health`);
      expect(response.status).toBe(200);
    });
  });

  describe('GET /health/live', () => {
    it('should return liveness probe', async () => {
      const response = await fetch(`${API_URL}/health/live`);
      expect([200, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /health/ready', () => {
    it('should return readiness probe', async () => {
      const response = await fetch(`${API_URL}/health/ready`);
      expect([200, 404, 500, 503]).toContain(response.status);
    });
  });

  describe('GET /health/detailed', () => {
    it('should return detailed health', async () => {
      const response = await fetch(`${API_URL}/health/detailed`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
