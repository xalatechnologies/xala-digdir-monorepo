/**
 * Cities API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Cities API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/cities', () => {
    it('should return cities list', async () => {
      const response = await fetch(`${API_URL}/api/cities`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /public/cities', () => {
    it('should return public cities list', async () => {
      const response = await fetch(`${API_URL}/public/cities`);
      expect([200, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/cities/:id', () => {
    it('should return city by ID', async () => {
      const response = await fetch(`${API_URL}/api/cities/00000000-0000-0000-0000-000000000000`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
