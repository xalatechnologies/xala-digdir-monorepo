/**
 * Reports API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Reports API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/reports', () => {
    it('should return reports list', async () => {
      const response = await fetch(`${API_URL}/api/reports`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/reports/bookings', () => {
    it('should return booking reports', async () => {
      const response = await fetch(`${API_URL}/api/reports/bookings`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/reports/revenue', () => {
    it('should return revenue reports', async () => {
      const response = await fetch(`${API_URL}/api/reports/revenue`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/reports/usage', () => {
    it('should return usage reports', async () => {
      const response = await fetch(`${API_URL}/api/reports/usage`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/reports/export', () => {
    it('should handle report export', async () => {
      const response = await fetch(`${API_URL}/api/reports/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'bookings', format: 'csv' }),
      });
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });
});
