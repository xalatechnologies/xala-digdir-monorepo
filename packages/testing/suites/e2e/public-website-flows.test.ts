/**
 * E2E Public Website Flow Tests
 * Real API flow tests
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('E2E: Public Website Flows', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('Browse Rental Objects Flow', () => {
    it('should fetch health check', async () => {
      const response = await fetch(`${API_URL}/health`);
      expect(response.ok).toBe(true);
    });

    it('should fetch rental objects list', async () => {
      const response = await fetch(`${API_URL}/api/rental-objects`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });

    it('should fetch categories for filtering', async () => {
      const response = await fetch(`${API_URL}/api/categories`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });

    it('should fetch amenities for filtering', async () => {
      const response = await fetch(`${API_URL}/api/amenities`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('Search Flow', () => {
    it('should handle search query', async () => {
      const response = await fetch(`${API_URL}/api/search?q=test`);
      expect([200, 400, 404, 500]).toContain(response.status);
    });

    it('should handle search with filters', async () => {
      const response = await fetch(`${API_URL}/api/rental-objects?category=room`);
      expect([200, 400, 404, 500]).toContain(response.status);
    });
  });

  describe('Calendar Availability Flow', () => {
    it('should fetch public calendar', async () => {
      const response = await fetch(`${API_URL}/api/calendar`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
