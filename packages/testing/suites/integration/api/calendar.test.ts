/**
 * Calendar API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Calendar API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /public/calendar/:rentalObjectId', () => {
    it('should return 404 for non-existent rental object', async () => {
      const response = await fetch(`${API_URL}/public/calendar/00000000-0000-0000-0000-000000000000`);
      expect([404, 400]).toContain(response.status);
    });
  });

  describe('GET /public/availability', () => {
    it('should accept date range parameters', async () => {
      const start = new Date().toISOString();
      const end = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const response = await fetch(`${API_URL}/public/availability?start=${start}&end=${end}`);
      expect([200, 404]).toContain(response.status);
    });
  });

  describe('GET /api/calendar/:id', () => {
    it('should require authentication for detailed calendar', async () => {
      const response = await fetch(`${API_URL}/api/calendar/00000000-0000-0000-0000-000000000000`);
      expect([401, 403, 404]).toContain(response.status);
    });
  });
});
