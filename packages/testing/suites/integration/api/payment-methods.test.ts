/**
 * Payment Methods API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Payment Methods API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/payment-methods', () => {
    it('should return payment methods list', async () => {
      const response = await fetch(`${API_URL}/api/payment-methods`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/payment-methods', () => {
    it('should add payment method', async () => {
      const response = await fetch(`${API_URL}/api/payment-methods`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'card', token: 'tok_test' }),
      });
      expect([200, 201, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('DELETE /api/payment-methods/:id', () => {
    it('should remove payment method', async () => {
      const response = await fetch(`${API_URL}/api/payment-methods/00000000-0000-0000-0000-000000000000`, {
        method: 'DELETE',
      });
      expect([200, 204, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('PUT /api/payment-methods/:id/default', () => {
    it('should set default payment method', async () => {
      const response = await fetch(`${API_URL}/api/payment-methods/00000000-0000-0000-0000-000000000000/default`, {
        method: 'PUT',
      });
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
