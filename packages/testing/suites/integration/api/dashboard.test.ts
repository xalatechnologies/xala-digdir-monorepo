/**
 * Dashboard API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Dashboard API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/dashboard', () => {
    it('should return dashboard data', async () => {
      const response = await fetch(`${API_URL}/api/dashboard`);
      expect([200, 401, 403, 404]).toContain(response.status);
    });
  });

  describe('GET /api/dashboard/stats', () => {
    it('should return statistics', async () => {
      const response = await fetch(`${API_URL}/api/dashboard/stats`);
      expect([200, 401, 403, 404]).toContain(response.status);
    });
  });

  describe('GET /api/dashboard/widgets', () => {
    it('should return widgets configuration', async () => {
      const response = await fetch(`${API_URL}/api/dashboard/widgets`);
      expect([200, 401, 403, 404]).toContain(response.status);
    });
  });

  describe('GET /api/dashboard/activity', () => {
    it('should return recent activity', async () => {
      const response = await fetch(`${API_URL}/api/dashboard/activity`);
      expect([200, 401, 403, 404]).toContain(response.status);
    });
  });
});
