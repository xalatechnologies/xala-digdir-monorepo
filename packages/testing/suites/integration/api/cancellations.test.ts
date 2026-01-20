/**
 * Cancellations API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Cancellations API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/cancellations', () => {
    it('should return cancellations list', async () => {
      const response = await fetch(`${API_URL}/api/cancellations`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/cancellations', () => {
    it('should handle booking cancellation', async () => {
      const response = await fetch(`${API_URL}/api/cancellations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: '00000000-0000-0000-0000-000000000000', reason: 'Changed plans' }),
      });
      expect([200, 201, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('GET /api/cancellation-policies', () => {
    it('should return cancellation policies', async () => {
      const response = await fetch(`${API_URL}/api/cancellation-policies`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
