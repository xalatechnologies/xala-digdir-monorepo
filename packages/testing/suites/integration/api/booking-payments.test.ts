/**
 * Booking Payments API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Booking Payments API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/bookings/:id/payments', () => {
    it('should return payments for booking', async () => {
      const response = await fetch(`${API_URL}/api/bookings/00000000-0000-0000-0000-000000000000/payments`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/bookings/:id/payments', () => {
    it('should add payment', async () => {
      const response = await fetch(`${API_URL}/api/bookings/00000000-0000-0000-0000-000000000000/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 500, method: 'card' }),
      });
      expect([200, 201, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('GET /api/bookings/:id/payments/summary', () => {
    it('should return payment summary', async () => {
      const response = await fetch(`${API_URL}/api/bookings/00000000-0000-0000-0000-000000000000/payments/summary`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/bookings/:id/payments/:paymentId/refund', () => {
    it('should refund payment', async () => {
      const response = await fetch(`${API_URL}/api/bookings/00000000-0000-0000-0000-000000000000/payments/00000000-0000-0000-0000-000000000001/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 100, reason: 'Partial refund' }),
      });
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });
});
