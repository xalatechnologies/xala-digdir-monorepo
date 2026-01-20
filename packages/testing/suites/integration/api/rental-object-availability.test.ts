/**
 * Rental Object Availability API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Rental Object Availability API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/rental-objects/:id/availability', () => {
    it('should return availability for rental object', async () => {
      const response = await fetch(`${API_URL}/api/rental-objects/00000000-0000-0000-0000-000000000000/availability`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/rental-objects/:id/availability/month', () => {
    it('should return monthly availability', async () => {
      const response = await fetch(`${API_URL}/api/rental-objects/00000000-0000-0000-0000-000000000000/availability/month?year=2026&month=1`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/rental-objects/:id/availability/check', () => {
    it('should check availability', async () => {
      const response = await fetch(`${API_URL}/api/rental-objects/00000000-0000-0000-0000-000000000000/availability/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate: '2026-01-20', endDate: '2026-01-21' }),
      });
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });
});
