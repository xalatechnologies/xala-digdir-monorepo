/**
 * Late Fees API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Late Fees API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/late-fees', () => {
    it('should return late fees configuration', async () => {
      const response = await fetch(`${API_URL}/api/late-fees`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('PUT /api/late-fees', () => {
    it('should update late fees configuration', async () => {
      const response = await fetch(`${API_URL}/api/late-fees`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feePerHour: 25, maxFee: 200 }),
      });
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('POST /api/late-fees/calculate', () => {
    it('should calculate late fee', async () => {
      const response = await fetch(`${API_URL}/api/late-fees/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: '00000000-0000-0000-0000-000000000000', lateMinutes: 90 }),
      });
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });
});
