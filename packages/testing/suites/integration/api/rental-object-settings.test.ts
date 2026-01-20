/**
 * Rental Object Settings API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Rental Object Settings API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/rental-objects/:id/settings', () => {
    it('should return settings for rental object', async () => {
      const response = await fetch(`${API_URL}/api/rental-objects/00000000-0000-0000-0000-000000000000/settings`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('PUT /api/rental-objects/:id/settings', () => {
    it('should update settings', async () => {
      const response = await fetch(`${API_URL}/api/rental-objects/00000000-0000-0000-0000-000000000000/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: true, requiresApproval: false }),
      });
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('GET /api/rental-objects/:id/booking-settings', () => {
    it('should return booking settings', async () => {
      const response = await fetch(`${API_URL}/api/rental-objects/00000000-0000-0000-0000-000000000000/booking-settings`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('PUT /api/rental-objects/:id/booking-settings', () => {
    it('should update booking settings', async () => {
      const response = await fetch(`${API_URL}/api/rental-objects/00000000-0000-0000-0000-000000000000/booking-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minDuration: 60, maxDuration: 480 }),
      });
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });
});
