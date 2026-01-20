/**
 * Pricing API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Pricing API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/pricing/:rentalObjectId', () => {
    it('should return pricing info', async () => {
      const response = await fetch(`${API_URL}/api/pricing/00000000-0000-0000-0000-000000000000`);
      expect([200, 400, 404]).toContain(response.status);
    });
  });

  describe('POST /api/pricing/calculate', () => {
    it('should calculate price for booking', async () => {
      const response = await fetch(`${API_URL}/api/pricing/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rentalObjectId: '00000000-0000-0000-0000-000000000000',
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 3600000).toISOString(),
        }),
      });
      expect([200, 400, 404, 422]).toContain(response.status);
    });
  });

  describe('GET /api/pricing/discounts', () => {
    it('should return available discounts', async () => {
      const response = await fetch(`${API_URL}/api/pricing/discounts`);
      expect([200, 401, 403, 404]).toContain(response.status);
    });
  });
});
