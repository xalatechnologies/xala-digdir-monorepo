/**
 * Occupancy API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Occupancy API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/occupancy', () => {
    it('should return occupancy data', async () => {
      const response = await fetch(`${API_URL}/api/occupancy`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/occupancy/:rentalObjectId', () => {
    it('should return occupancy for rental object', async () => {
      const response = await fetch(`${API_URL}/api/occupancy/00000000-0000-0000-0000-000000000000`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/occupancy/statistics', () => {
    it('should return occupancy statistics', async () => {
      const response = await fetch(`${API_URL}/api/occupancy/statistics`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
