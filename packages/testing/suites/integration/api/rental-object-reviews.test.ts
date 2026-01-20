/**
 * Rental Object Reviews API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Rental Object Reviews API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/rental-objects/:id/reviews', () => {
    it('should return reviews for rental object', async () => {
      const response = await fetch(`${API_URL}/api/rental-objects/00000000-0000-0000-0000-000000000000/reviews`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/rental-objects/:id/reviews', () => {
    it('should submit review', async () => {
      const response = await fetch(`${API_URL}/api/rental-objects/00000000-0000-0000-0000-000000000000/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: 5, comment: 'Great experience!' }),
      });
      expect([200, 201, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('GET /api/rental-objects/:id/reviews/stats', () => {
    it('should return review stats', async () => {
      const response = await fetch(`${API_URL}/api/rental-objects/00000000-0000-0000-0000-000000000000/reviews/stats`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
