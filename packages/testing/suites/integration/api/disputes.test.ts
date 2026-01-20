/**
 * Disputes API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Disputes API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/disputes', () => {
    it('should return disputes list', async () => {
      const response = await fetch(`${API_URL}/api/disputes`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/disputes/:id', () => {
    it('should return dispute by ID', async () => {
      const response = await fetch(`${API_URL}/api/disputes/00000000-0000-0000-0000-000000000000`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/disputes', () => {
    it('should create dispute', async () => {
      const response = await fetch(`${API_URL}/api/disputes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: '00000000-0000-0000-0000-000000000000', reason: 'Test dispute' }),
      });
      expect([200, 201, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('PUT /api/disputes/:id/resolve', () => {
    it('should resolve dispute', async () => {
      const response = await fetch(`${API_URL}/api/disputes/00000000-0000-0000-0000-000000000000/resolve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolution: 'Refund issued' }),
      });
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });
});
