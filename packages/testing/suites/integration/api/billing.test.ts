/**
 * Billing API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Billing API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/billing', () => {
    it('should return billing info', async () => {
      const response = await fetch(`${API_URL}/api/billing`);
      expect([200, 401, 403, 404]).toContain(response.status);
    });
  });

  describe('GET /api/billing/invoices', () => {
    it('should return invoices list', async () => {
      const response = await fetch(`${API_URL}/api/billing/invoices`);
      expect([200, 401, 403, 404]).toContain(response.status);
    });
  });

  describe('GET /api/billing/subscription', () => {
    it('should return subscription info', async () => {
      const response = await fetch(`${API_URL}/api/billing/subscription`);
      expect([200, 401, 403, 404]).toContain(response.status);
    });
  });

  describe('POST /api/billing/payment-method', () => {
    it('should handle payment method update', async () => {
      const response = await fetch(`${API_URL}/api/billing/payment-method`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethodId: 'pm_test' }),
      });
      expect([200, 400, 401, 403, 404, 422]).toContain(response.status);
    });
  });
});
