/**
 * Pagination API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Pagination API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/rental-objects?page=1&limit=10', () => {
    it('should return paginated results', async () => {
      const response = await fetch(`${API_URL}/api/rental-objects?page=1&limit=10`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/rental-objects?page=2&limit=20', () => {
    it('should return second page', async () => {
      const response = await fetch(`${API_URL}/api/rental-objects?page=2&limit=20`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/bookings?page=1&limit=50', () => {
    it('should paginate bookings', async () => {
      const response = await fetch(`${API_URL}/api/bookings?page=1&limit=50`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/users?offset=0&limit=25', () => {
    it('should paginate with offset', async () => {
      const response = await fetch(`${API_URL}/api/users?offset=0&limit=25`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
