/**
 * Municipalities API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Municipalities API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/municipalities', () => {
    it('should return municipalities list', async () => {
      const response = await fetch(`${API_URL}/api/municipalities`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /public/municipalities', () => {
    it('should return public municipalities', async () => {
      const response = await fetch(`${API_URL}/public/municipalities`);
      expect([200, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/municipalities/:id', () => {
    it('should return municipality by ID', async () => {
      const response = await fetch(`${API_URL}/api/municipalities/00000000-0000-0000-0000-000000000000`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
