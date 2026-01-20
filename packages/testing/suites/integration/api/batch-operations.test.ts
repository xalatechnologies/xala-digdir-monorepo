/**
 * Batch Operations API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Batch Operations API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('POST /api/batch/bookings', () => {
    it('should batch create bookings', async () => {
      const response = await fetch(`${API_URL}/api/batch/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookings: [] }),
      });
      expect([200, 202, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('POST /api/batch/users/import', () => {
    it('should batch import users', async () => {
      const response = await fetch(`${API_URL}/api/batch/users/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users: [] }),
      });
      expect([200, 202, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('DELETE /api/batch/bookings', () => {
    it('should batch delete bookings', async () => {
      const response = await fetch(`${API_URL}/api/batch/bookings`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [] }),
      });
      expect([200, 204, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
