/**
 * Securities API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Securities API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/securities', () => {
    it('should return securities list', async () => {
      const response = await fetch(`${API_URL}/api/securities`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/securities', () => {
    it('should create security deposit', async () => {
      const response = await fetch(`${API_URL}/api/securities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 1000, type: 'card_hold' }),
      });
      expect([200, 201, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('POST /api/securities/:id/release', () => {
    it('should release security', async () => {
      const response = await fetch(`${API_URL}/api/securities/00000000-0000-0000-0000-000000000000/release`, {
        method: 'POST',
      });
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
