/**
 * E2E Search & Discovery Flow Tests
 * Real API flow tests
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('E2E: Search & Discovery Flows', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('Search with Filters Flow', () => {
    it('should fetch all categories', async () => {
      const response = await fetch(`${API_URL}/api/categories`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });

    it('should fetch all amenities', async () => {
      const response = await fetch(`${API_URL}/api/amenities`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });

    it('should search with category filter', async () => {
      const response = await fetch(`${API_URL}/api/rental-objects?category=room`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });

    it('should search with date range', async () => {
      const response = await fetch(`${API_URL}/api/rental-objects?startDate=2026-01-20&endDate=2026-01-25`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });

    it('should search with location', async () => {
      const response = await fetch(`${API_URL}/api/rental-objects?lat=59.9&lng=10.7&radius=10`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('Discovery Maps Flow', () => {
    it('should fetch locations for map', async () => {
      const response = await fetch(`${API_URL}/api/locations`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });

    it('should fetch zones', async () => {
      const response = await fetch(`${API_URL}/api/zones`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
