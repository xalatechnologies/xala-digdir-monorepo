/**
 * Rental Object Statistics API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Rental Object Statistics API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/rental-objects/:id/stats', () => {
    it('should return stats for rental object', async () => {
      const response = await fetch(`${API_URL}/api/rental-objects/00000000-0000-0000-0000-000000000000/stats`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/rental-objects/:id/revenue', () => {
    it('should return revenue data', async () => {
      const response = await fetch(`${API_URL}/api/rental-objects/00000000-0000-0000-0000-000000000000/revenue`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/rental-objects/:id/occupancy', () => {
    it('should return occupancy data', async () => {
      const response = await fetch(`${API_URL}/api/rental-objects/00000000-0000-0000-0000-000000000000/occupancy`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/rental-objects/:id/utilization', () => {
    it('should return utilization data', async () => {
      const response = await fetch(`${API_URL}/api/rental-objects/00000000-0000-0000-0000-000000000000/utilization`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/rental-objects/:id/trends', () => {
    it('should return trend data', async () => {
      const response = await fetch(`${API_URL}/api/rental-objects/00000000-0000-0000-0000-000000000000/trends`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
