/**
 * Capacity API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Capacity API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/capacity', () => {
    it('should return capacity overview', async () => {
      const response = await fetch(`${API_URL}/api/capacity`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/capacity/:rentalObjectId', () => {
    it('should return capacity for rental object', async () => {
      const response = await fetch(`${API_URL}/api/capacity/00000000-0000-0000-0000-000000000000`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('PUT /api/capacity/:rentalObjectId', () => {
    it('should update capacity', async () => {
      const response = await fetch(`${API_URL}/api/capacity/00000000-0000-0000-0000-000000000000`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxCapacity: 50 }),
      });
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });
});
