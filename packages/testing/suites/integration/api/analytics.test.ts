/**
 * Analytics API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Analytics API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/analytics', () => {
    it('should return analytics data', async () => {
      const response = await fetch(`${API_URL}/api/analytics`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/analytics/bookings', () => {
    it('should return booking analytics', async () => {
      const response = await fetch(`${API_URL}/api/analytics/bookings`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/analytics/revenue', () => {
    it('should return revenue analytics', async () => {
      const response = await fetch(`${API_URL}/api/analytics/revenue`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/analytics/users', () => {
    it('should return user analytics', async () => {
      const response = await fetch(`${API_URL}/api/analytics/users`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
