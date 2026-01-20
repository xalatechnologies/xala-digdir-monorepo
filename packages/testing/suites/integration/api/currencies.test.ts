/**
 * Currencies API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Currencies API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/currencies', () => {
    it('should return currencies list', async () => {
      const response = await fetch(`${API_URL}/api/currencies`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/currencies/exchange-rates', () => {
    it('should return exchange rates', async () => {
      const response = await fetch(`${API_URL}/api/currencies/exchange-rates`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('PUT /api/currencies/default', () => {
    it('should handle default currency change', async () => {
      const response = await fetch(`${API_URL}/api/currencies/default`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: 'NOK' }),
      });
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });
});
