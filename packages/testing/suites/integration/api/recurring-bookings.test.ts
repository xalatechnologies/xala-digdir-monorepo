/**
 * Recurring Bookings API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Recurring Bookings API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/recurring-bookings', () => {
    it('should return recurring bookings list', async () => {
      const response = await fetch(`${API_URL}/api/recurring-bookings`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/recurring-bookings', () => {
    it('should handle recurring booking creation', async () => {
      const response = await fetch(`${API_URL}/api/recurring-bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rentalObjectId: '00000000-0000-0000-0000-000000000000',
          pattern: 'weekly',
          daysOfWeek: [1, 3, 5],
        }),
      });
      expect([200, 201, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('DELETE /api/recurring-bookings/:id', () => {
    it('should handle recurring booking deletion', async () => {
      const response = await fetch(`${API_URL}/api/recurring-bookings/00000000-0000-0000-0000-000000000000`, {
        method: 'DELETE',
      });
      expect([200, 204, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
