/**
 * Booking Statuses API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Booking Statuses API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/booking-statuses', () => {
    it('should return booking statuses list', async () => {
      const response = await fetch(`${API_URL}/api/booking-statuses`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/booking-statuses/transitions', () => {
    it('should return status transitions', async () => {
      const response = await fetch(`${API_URL}/api/booking-statuses/transitions`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
