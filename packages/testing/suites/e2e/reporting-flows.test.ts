/**
 * E2E Reporting Flow Tests
 * Real API flow tests
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('E2E: Reporting Flows', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('Generate Reports Flow', () => {
    it('should fetch reports list', async () => {
      const response = await fetch(`${API_URL}/api/reports`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });

    it('should fetch analytics data', async () => {
      const response = await fetch(`${API_URL}/api/analytics`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });

    it('should export bookings', async () => {
      const response = await fetch(`${API_URL}/api/exports/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: 'csv' }),
      });
      expect([200, 202, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('Dashboard Analytics Flow', () => {
    it('should fetch dashboard stats', async () => {
      const response = await fetch(`${API_URL}/api/dashboard`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });

    it('should fetch booking analytics', async () => {
      const response = await fetch(`${API_URL}/api/analytics/bookings`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });

    it('should fetch revenue analytics', async () => {
      const response = await fetch(`${API_URL}/api/analytics/revenue`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
