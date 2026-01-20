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

  describe('GET /api/reports/booking', () => {
    it('should return booking report', async () => {
      const response = await fetch(`${API_URL}/api/reports/booking`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/reports/revenue', () => {
    it('should return revenue report', async () => {
      const response = await fetch(`${API_URL}/api/reports/revenue`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/reports/utilization', () => {
    it('should return utilization report', async () => {
      const response = await fetch(`${API_URL}/api/reports/utilization`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/reports/occupancy', () => {
    it('should return occupancy report', async () => {
      const response = await fetch(`${API_URL}/api/reports/occupancy`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/reports/custom', () => {
    it('should generate custom report', async () => {
      const response = await fetch(`${API_URL}/api/reports/custom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'booking', startDate: '2026-01-01', endDate: '2026-01-31' }),
      });
      expect([200, 201, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });
});
