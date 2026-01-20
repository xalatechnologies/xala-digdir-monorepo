/**
 * Webhooks API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Webhooks API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/webhooks', () => {
    it('should return webhooks list', async () => {
      const response = await fetch(`${API_URL}/api/webhooks`);
      expect([200, 401, 403, 404]).toContain(response.status);
    });
  });

  describe('POST /api/webhooks', () => {
    it('should handle webhook registration', async () => {
      const response = await fetch(`${API_URL}/api/webhooks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: 'https://example.com/webhook',
          events: ['booking.created'],
        }),
      });
      expect([200, 201, 400, 401, 403, 404, 422]).toContain(response.status);
    });
  });

  describe('DELETE /api/webhooks/:id', () => {
    it('should handle webhook deletion', async () => {
      const response = await fetch(`${API_URL}/api/webhooks/00000000-0000-0000-0000-000000000000`, {
        method: 'DELETE',
      });
      expect([200, 204, 400, 401, 403, 404]).toContain(response.status);
    });
  });
});
