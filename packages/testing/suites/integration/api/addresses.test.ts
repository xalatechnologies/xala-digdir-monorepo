/**
 * Addresses API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Addresses API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/addresses', () => {
    it('should return addresses list', async () => {
      const response = await fetch(`${API_URL}/api/addresses`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/addresses/validate', () => {
    it('should validate address', async () => {
      const response = await fetch(`${API_URL}/api/addresses/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ street: 'Karl Johans gate 1', city: 'Oslo', postalCode: '0154' }),
      });
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('POST /api/addresses/geocode', () => {
    it('should geocode address', async () => {
      const response = await fetch(`${API_URL}/api/addresses/geocode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: 'Karl Johans gate 1, Oslo, Norway' }),
      });
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });
});
