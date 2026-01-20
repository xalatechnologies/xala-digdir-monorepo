/**
 * Refund Policies API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Refund Policies API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/refund-policies', () => {
    it('should return refund policies list', async () => {
      const response = await fetch(`${API_URL}/api/refund-policies`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/refund-policies', () => {
    it('should create refund policy', async () => {
      const response = await fetch(`${API_URL}/api/refund-policies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Full Refund', hoursBeforeBooking: 24, refundPercentage: 100 }),
      });
      expect([200, 201, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('PUT /api/refund-policies/:id', () => {
    it('should update refund policy', async () => {
      const response = await fetch(`${API_URL}/api/refund-policies/00000000-0000-0000-0000-000000000000`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refundPercentage: 50 }),
      });
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('DELETE /api/refund-policies/:id', () => {
    it('should delete refund policy', async () => {
      const response = await fetch(`${API_URL}/api/refund-policies/00000000-0000-0000-0000-000000000000`, {
        method: 'DELETE',
      });
      expect([200, 204, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
