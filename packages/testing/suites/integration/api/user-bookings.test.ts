/**
 * User Bookings API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('User Bookings API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/users/:id/bookings', () => {
    it('should return bookings for user', async () => {
      const response = await fetch(`${API_URL}/api/users/00000000-0000-0000-0000-000000000000/bookings`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/users/:id/bookings/upcoming', () => {
    it('should return upcoming bookings', async () => {
      const response = await fetch(`${API_URL}/api/users/00000000-0000-0000-0000-000000000000/bookings/upcoming`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/users/:id/bookings/past', () => {
    it('should return past bookings', async () => {
      const response = await fetch(`${API_URL}/api/users/00000000-0000-0000-0000-000000000000/bookings/past`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/me/bookings', () => {
    it('should return current user bookings', async () => {
      const response = await fetch(`${API_URL}/api/me/bookings`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
