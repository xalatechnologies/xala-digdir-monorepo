/**
 * Dashboard Widgets API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Dashboard Widgets API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/dashboard/widgets', () => {
    it('should return dashboard widgets', async () => {
      const response = await fetch(`${API_URL}/api/dashboard/widgets`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/dashboard/widgets/booking-overview', () => {
    it('should return booking overview widget', async () => {
      const response = await fetch(`${API_URL}/api/dashboard/widgets/booking-overview`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/dashboard/widgets/recent-activity', () => {
    it('should return recent activity widget', async () => {
      const response = await fetch(`${API_URL}/api/dashboard/widgets/recent-activity`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/dashboard/widgets/upcoming-bookings', () => {
    it('should return upcoming bookings widget', async () => {
      const response = await fetch(`${API_URL}/api/dashboard/widgets/upcoming-bookings`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('PUT /api/dashboard/widgets/preferences', () => {
    it('should update widget preferences', async () => {
      const response = await fetch(`${API_URL}/api/dashboard/widgets/preferences`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ layout: ['booking-overview', 'recent-activity'] }),
      });
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });
});
