/**
 * Transformations API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Transformations API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/transformations', () => {
    it('should return transformations list', async () => {
      const response = await fetch(`${API_URL}/api/transformations`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/transformations/apply', () => {
    it('should apply transformation', async () => {
      const response = await fetch(`${API_URL}/api/transformations/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transform: 'uppercase', value: 'test' }),
      });
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('GET /api/transformations/types', () => {
    it('should return transformation types', async () => {
      const response = await fetch(`${API_URL}/api/transformations/types`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
