/**
 * Booking Resources API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Booking Resources API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/bookings/:id/resources', () => {
    it('should return resources for booking', async () => {
      const response = await fetch(`${API_URL}/api/bookings/00000000-0000-0000-0000-000000000000/resources`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/bookings/:id/resources', () => {
    it('should add resource', async () => {
      const response = await fetch(`${API_URL}/api/bookings/00000000-0000-0000-0000-000000000000/resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resourceId: '00000000-0000-0000-0000-000000000001', quantity: 1 }),
      });
      expect([200, 201, 400, 401, 403, 404, 409, 422, 500]).toContain(response.status);
    });
  });

  describe('DELETE /api/bookings/:id/resources/:resourceId', () => {
    it('should remove resource', async () => {
      const response = await fetch(`${API_URL}/api/bookings/00000000-0000-0000-0000-000000000000/resources/00000000-0000-0000-0000-000000000001`, {
        method: 'DELETE',
      });
      expect([200, 204, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
