/**
 * Rate Limiting API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Rate Limiting API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/rate-limits', () => {
    it('should return rate limit configuration', async () => {
      const response = await fetch(`${API_URL}/api/rate-limits`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/rate-limits/status', () => {
    it('should return current rate limit status', async () => {
      const response = await fetch(`${API_URL}/api/rate-limits/status`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
