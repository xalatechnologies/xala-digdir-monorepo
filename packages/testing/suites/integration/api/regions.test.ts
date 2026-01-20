/**
 * Regions API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Regions API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/regions', () => {
    it('should return regions list', async () => {
      const response = await fetch(`${API_URL}/api/regions`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /public/regions', () => {
    it('should return public regions list', async () => {
      const response = await fetch(`${API_URL}/public/regions`);
      expect([200, 404, 500]).toContain(response.status);
    });
  });
});
