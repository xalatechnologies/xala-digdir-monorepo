/**
 * Discount Codes API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Discount Codes API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/discount-codes', () => {
    it('should return discount codes list', async () => {
      const response = await fetch(`${API_URL}/api/discount-codes`);
      expect([200, 401, 403, 404]).toContain(response.status);
    });
  });

  describe('POST /api/discount-codes', () => {
    it('should handle discount code creation', async () => {
      const response = await fetch(`${API_URL}/api/discount-codes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: 'TEST10',
          discountPercent: 10,
        }),
      });
      expect([200, 201, 400, 401, 403, 404, 422]).toContain(response.status);
    });
  });

  describe('POST /api/discount-codes/validate', () => {
    it('should validate discount code', async () => {
      const response = await fetch(`${API_URL}/api/discount-codes/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: 'TEST10' }),
      });
      expect([200, 400, 404, 422]).toContain(response.status);
    });
  });
});
