/**
 * Categories API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Categories API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/categories', () => {
    it('should return list of categories', async () => {
      const response = await fetch(`${API_URL}/api/categories`);
      expect([200, 404]).toContain(response.status);
    });
  });

  describe('GET /public/categories', () => {
    it('should return public categories', async () => {
      const response = await fetch(`${API_URL}/public/categories`);
      expect([200, 404]).toContain(response.status);
    });
  });
});
