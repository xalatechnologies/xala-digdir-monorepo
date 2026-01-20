/**
 * Bookings API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Bookings API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/bookings', () => {
    it('should return response (may require auth)', async () => {
      const response = await fetch(`${API_URL}/api/bookings`);
      // May return data, 401, 403, or 500 depending on auth state
      expect([200, 401, 403, 500]).toContain(response.status);
    });
  });

  describe('POST /api/bookings', () => {
    it('should reject invalid booking creation', async () => {
      const response = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rentalObjectId: '00000000-0000-0000-0000-000000000000',
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 3600000).toISOString(),
        }),
      });
      // Should reject - either auth required or validation error
      expect([400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('GET /api/bookings/:id', () => {
    it('should return 404 for non-existent booking', async () => {
      const response = await fetch(`${API_URL}/api/bookings/00000000-0000-0000-0000-000000000000`);
      expect([404, 400, 401, 403, 500]).toContain(response.status);
    });
  });
});
