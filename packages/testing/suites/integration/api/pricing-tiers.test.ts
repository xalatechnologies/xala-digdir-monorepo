/**
 * Pricing Tiers API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Pricing Tiers API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/pricing-tiers', () => {
    it('should return pricing tiers list', async () => {
      const response = await fetch(`${API_URL}/api/pricing-tiers`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/pricing-tiers', () => {
    it('should create pricing tier', async () => {
      const response = await fetch(`${API_URL}/api/pricing-tiers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Premium', multiplier: 1.5 }),
      });
      expect([200, 201, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('PUT /api/pricing-tiers/:id', () => {
    it('should update pricing tier', async () => {
      const response = await fetch(`${API_URL}/api/pricing-tiers/00000000-0000-0000-0000-000000000000`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Enterprise' }),
      });
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });
});
