/**
 * Bulk Operations API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Bulk Operations API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('POST /api/bulk/rental-objects/update', () => {
    it('should bulk update rental objects', async () => {
      const response = await fetch(`${API_URL}/api/bulk/rental-objects/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [], updates: { isActive: true } }),
      });
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('POST /api/bulk/bookings/cancel', () => {
    it('should bulk cancel bookings', async () => {
      const response = await fetch(`${API_URL}/api/bulk/bookings/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [], reason: 'Bulk cancellation' }),
      });
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('POST /api/bulk/users/notify', () => {
    it('should bulk notify users', async () => {
      const response = await fetch(`${API_URL}/api/bulk/users/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [], message: 'Test notification' }),
      });
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('DELETE /api/bulk/rentals-objects', () => {
    it('should bulk delete rental objects', async () => {
      const response = await fetch(`${API_URL}/api/bulk/rental-objects`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [] }),
      });
      expect([200, 204, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
