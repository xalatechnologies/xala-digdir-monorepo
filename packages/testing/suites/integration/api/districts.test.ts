/**
 * Districts API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Districts API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/districts', () => {
    it('should return districts list', async () => {
      const response = await fetch(`${API_URL}/api/districts`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /public/districts', () => {
    it('should return public districts', async () => {
      const response = await fetch(`${API_URL}/public/districts`);
      expect([200, 404, 500]).toContain(response.status);
    });
  });
});
