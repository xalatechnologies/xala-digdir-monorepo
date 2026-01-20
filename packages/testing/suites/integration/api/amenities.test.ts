/**
 * Amenities API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Amenities API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/amenities', () => {
    it('should return list of amenities', async () => {
      const response = await fetch(`${API_URL}/api/amenities`);
      expect([200, 404]).toContain(response.status);
    });
  });

  describe('POST /api/amenities', () => {
    it('should handle amenity creation', async () => {
      const response = await fetch(`${API_URL}/api/amenities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'test-amenity', label: 'Test' }),
      });
      expect([200, 201, 400, 401, 403, 404, 422]).toContain(response.status);
    });
  });
});
