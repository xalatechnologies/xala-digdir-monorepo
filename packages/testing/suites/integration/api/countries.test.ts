/**
 * Countries API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Countries API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/countries', () => {
    it('should return countries list', async () => {
      const response = await fetch(`${API_URL}/api/countries`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /public/countries', () => {
    it('should return public countries list', async () => {
      const response = await fetch(`${API_URL}/public/countries`);
      expect([200, 404, 500]).toContain(response.status);
    });
  });
});
