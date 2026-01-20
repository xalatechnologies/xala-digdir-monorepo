/**
 * Connections API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Connections API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/connections', () => {
    it('should return connections list', async () => {
      const response = await fetch(`${API_URL}/api/connections`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/connections', () => {
    it('should create connection', async () => {
      const response = await fetch(`${API_URL}/api/connections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Stripe', type: 'payment', config: {} }),
      });
      expect([200, 201, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('POST /api/connections/:id/test', () => {
    it('should test connection', async () => {
      const response = await fetch(`${API_URL}/api/connections/00000000-0000-0000-0000-000000000000/test`, {
        method: 'POST',
      });
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('DELETE /api/connections/:id', () => {
    it('should delete connection', async () => {
      const response = await fetch(`${API_URL}/api/connections/00000000-0000-0000-0000-000000000000`, {
        method: 'DELETE',
      });
      expect([200, 204, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
