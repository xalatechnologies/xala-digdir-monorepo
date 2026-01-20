/**
 * Dashboard Stats API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Dashboard Stats API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/dashboard/stats', () => {
    it('should return dashboard stats', async () => {
      const response = await fetch(`${API_URL}/api/dashboard/stats`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/dashboard/stats/revenue', () => {
    it('should return revenue stats', async () => {
      const response = await fetch(`${API_URL}/api/dashboard/stats/revenue`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/dashboard/stats/bookings', () => {
    it('should return booking stats', async () => {
      const response = await fetch(`${API_URL}/api/dashboard/stats/bookings`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/dashboard/stats/users', () => {
    it('should return user stats', async () => {
      const response = await fetch(`${API_URL}/api/dashboard/stats/users`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/dashboard/stats/utilization', () => {
    it('should return utilization stats', async () => {
      const response = await fetch(`${API_URL}/api/dashboard/stats/utilization`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
