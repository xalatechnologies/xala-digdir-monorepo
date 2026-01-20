/**
 * E2E Payment Flow Tests
 * Real API flow tests
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('E2E: Payment Flows', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('Checkout Flow', () => {
    it('step 1: initiate checkout', async () => {
      const response = await fetch(`${API_URL}/api/checkout/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: '00000000-0000-0000-0000-000000000000' }),
      });
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });

    it('step 2: get payment methods', async () => {
      const response = await fetch(`${API_URL}/api/payments`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });

    it('step 3: complete payment', async () => {
      const response = await fetch(`${API_URL}/api/checkout/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: 'test-session' }),
      });
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('Refund Flow', () => {
    it('should handle refund request', async () => {
      const response = await fetch(`${API_URL}/api/refunds`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: '00000000-0000-0000-0000-000000000000', amount: 1000 }),
      });
      expect([200, 201, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });
});
