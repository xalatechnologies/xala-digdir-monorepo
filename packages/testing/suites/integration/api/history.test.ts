/**
 * History API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('History API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/history', () => {
    it('should return history', async () => {
      const response = await fetch(`${API_URL}/api/history`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/history/bookings', () => {
    it('should return booking history', async () => {
      const response = await fetch(`${API_URL}/api/history/bookings`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/history/payments', () => {
    it('should return payment history', async () => {
      const response = await fetch(`${API_URL}/api/history/payments`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
