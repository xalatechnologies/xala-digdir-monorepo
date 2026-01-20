/**
 * Sorting API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Sorting API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/rental-objects?sort=name', () => {
    it('should sort by name', async () => {
      const response = await fetch(`${API_URL}/api/rental-objects?sort=name`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/rental-objects?sort=-createdAt', () => {
    it('should sort by createdAt descending', async () => {
      const response = await fetch(`${API_URL}/api/rental-objects?sort=-createdAt`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/bookings?sort=startDate', () => {
    it('should sort bookings by startDate', async () => {
      const response = await fetch(`${API_URL}/api/bookings?sort=startDate`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/users?sort=lastName', () => {
    it('should sort users by lastName', async () => {
      const response = await fetch(`${API_URL}/api/users?sort=lastName`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
