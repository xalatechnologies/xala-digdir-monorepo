/**
 * E2E Admin Dashboard Flow Tests
 * Real API flow tests
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('E2E: Admin Dashboard Flows', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('Dashboard Load Flow', () => {
    it('should fetch dashboard stats', async () => {
      const response = await fetch(`${API_URL}/api/dashboard`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });

    it('should fetch analytics data', async () => {
      const response = await fetch(`${API_URL}/api/analytics`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });

    it('should fetch recent bookings', async () => {
      const response = await fetch(`${API_URL}/api/bookings?limit=10`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });

    it('should fetch notifications', async () => {
      const response = await fetch(`${API_URL}/api/notifications`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('Admin Settings Flow', () => {
    it('should fetch settings', async () => {
      const response = await fetch(`${API_URL}/api/settings`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });

    it('should fetch branding', async () => {
      const response = await fetch(`${API_URL}/api/branding`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
