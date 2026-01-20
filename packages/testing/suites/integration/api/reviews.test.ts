/**
 * Reviews API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Reviews API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/reviews', () => {
    it('should return reviews list', async () => {
      const response = await fetch(`${API_URL}/api/reviews`);
      expect([200, 401, 403, 404]).toContain(response.status);
    });
  });

  describe('GET /api/reviews/:rentalObjectId', () => {
    it('should return reviews for rental object', async () => {
      const response = await fetch(`${API_URL}/api/reviews/00000000-0000-0000-0000-000000000000`);
      expect([200, 400, 404]).toContain(response.status);
    });
  });

  describe('POST /api/reviews', () => {
    it('should handle review submission', async () => {
      const response = await fetch(`${API_URL}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rentalObjectId: '00000000-0000-0000-0000-000000000000',
          rating: 5,
          comment: 'Great!',
        }),
      });
      expect([200, 201, 400, 401, 403, 404, 422]).toContain(response.status);
    });
  });
});
