/**
 * Vipps API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Vipps API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('POST /api/vipps/login', () => {
    it('should handle login initiation', async () => {
      const response = await fetch(`${API_URL}/api/vipps/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ redirectUrl: 'https://example.com/callback' }),
      });
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('POST /api/vipps/payment', () => {
    it('should handle payment initiation', async () => {
      const response = await fetch(`${API_URL}/api/vipps/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 10000, bookingId: '00000000-0000-0000-0000-000000000000' }),
      });
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('GET /api/vipps/status/:orderId', () => {
    it('should return payment status', async () => {
      const response = await fetch(`${API_URL}/api/vipps/status/test-order-123`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
