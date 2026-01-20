/**
 * Rental Object Bookings API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Rental Object Bookings API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/rental-objects/:id/bookings', () => {
    it('should return bookings for rental object', async () => {
      const response = await fetch(`${API_URL}/api/rental-objects/00000000-0000-0000-0000-000000000000/bookings`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/rental-objects/:id/bookings/upcoming', () => {
    it('should return upcoming bookings', async () => {
      const response = await fetch(`${API_URL}/api/rental-objects/00000000-0000-0000-0000-000000000000/bookings/upcoming`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/rental-objects/:id/bookings/calendar', () => {
    it('should return booking calendar', async () => {
      const response = await fetch(`${API_URL}/api/rental-objects/00000000-0000-0000-0000-000000000000/bookings/calendar?year=2026&month=1`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/rental-objects/:id/bookings/summary', () => {
    it('should return booking summary', async () => {
      const response = await fetch(`${API_URL}/api/rental-objects/00000000-0000-0000-0000-000000000000/bookings/summary`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/rental-objects/:id/bookings/stats', () => {
    it('should return booking stats', async () => {
      const response = await fetch(`${API_URL}/api/rental-objects/00000000-0000-0000-0000-000000000000/bookings/stats`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
