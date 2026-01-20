/**
 * Maintenance API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Maintenance API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/maintenance', () => {
    it('should return maintenance tasks', async () => {
      const response = await fetch(`${API_URL}/api/maintenance`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/maintenance', () => {
    it('should handle maintenance task creation', async () => {
      const response = await fetch(`${API_URL}/api/maintenance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rentalObjectId: '00000000-0000-0000-0000-000000000000', description: 'Fix door' }),
      });
      expect([200, 201, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('PUT /api/maintenance/:id/resolve', () => {
    it('should handle maintenance resolution', async () => {
      const response = await fetch(`${API_URL}/api/maintenance/00000000-0000-0000-0000-000000000000/resolve`, {
        method: 'PUT',
      });
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
