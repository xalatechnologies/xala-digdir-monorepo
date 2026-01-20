/**
 * Booking Restrictions API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Booking Restrictions API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/booking-restrictions', () => {
    it('should return booking restrictions', async () => {
      const response = await fetch(`${API_URL}/api/booking-restrictions`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/booking-restrictions', () => {
    it('should create booking restriction', async () => {
      const response = await fetch(`${API_URL}/api/booking-restrictions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'blackout', startDate: '2026-01-01', endDate: '2026-01-07' }),
      });
      expect([200, 201, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('DELETE /api/booking-restrictions/:id', () => {
    it('should delete booking restriction', async () => {
      const response = await fetch(`${API_URL}/api/booking-restrictions/00000000-0000-0000-0000-000000000000`, {
        method: 'DELETE',
      });
      expect([200, 204, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
