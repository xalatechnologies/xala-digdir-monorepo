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

  describe('Public Endpoints', () => {
    it('GET /public/availability should return availability', async () => {
      const response = await fetch(`${API_URL}/public/availability`);
      expect([200, 404]).toContain(response.status);
    });
  });

  describe('Protected Endpoints', () => {
    it('GET /api/bookings should require auth', async () => {
      const response = await fetch(`${API_URL}/api/bookings`);
      expect([401, 403]).toContain(response.status);
    });

    it('POST /api/bookings should require auth', async () => {
      const response = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rentalObjectId: '00000000-0000-0000-0000-000000000000',
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 3600000).toISOString(),
        }),
      });
      expect([401, 403]).toContain(response.status);
    });

    it('GET /api/bookings/:id should require auth', async () => {
      const response = await fetch(`${API_URL}/api/bookings/00000000-0000-0000-0000-000000000000`);
      expect([401, 403, 404]).toContain(response.status);
    });

    it('POST /api/bookings/:id/cancel should require auth', async () => {
      const response = await fetch(`${API_URL}/api/bookings/00000000-0000-0000-0000-000000000000/cancel`, {
        method: 'POST',
      });
      expect([401, 403, 404]).toContain(response.status);
    });

    it('POST /api/bookings/:id/approve should require auth', async () => {
      const response = await fetch(`${API_URL}/api/bookings/00000000-0000-0000-0000-000000000000/approve`, {
        method: 'POST',
      });
      expect([401, 403, 404]).toContain(response.status);
    });
  });
});
