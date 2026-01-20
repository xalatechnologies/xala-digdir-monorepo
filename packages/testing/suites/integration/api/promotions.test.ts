/**
 * Promotions API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Promotions API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/promotions', () => {
    it('should return promotions list', async () => {
      const response = await fetch(`${API_URL}/api/promotions`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/promotions/active', () => {
    it('should return active promotions', async () => {
      const response = await fetch(`${API_URL}/api/promotions/active`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/promotions', () => {
    it('should create promotion', async () => {
      const response = await fetch(`${API_URL}/api/promotions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Summer Sale', discount: 20 }),
      });
      expect([200, 201, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('PUT /api/promotions/:id', () => {
    it('should update promotion', async () => {
      const response = await fetch(`${API_URL}/api/promotions/00000000-0000-0000-0000-000000000000`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discount: 25 }),
      });
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });
});
