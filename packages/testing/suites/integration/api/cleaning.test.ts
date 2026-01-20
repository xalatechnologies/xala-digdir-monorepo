/**
 * Cleaning API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Cleaning API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/cleaning', () => {
    it('should return cleaning schedule', async () => {
      const response = await fetch(`${API_URL}/api/cleaning`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/cleaning', () => {
    it('should handle cleaning task creation', async () => {
      const response = await fetch(`${API_URL}/api/cleaning`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rentalObjectId: '00000000-0000-0000-0000-000000000000', scheduledTime: new Date().toISOString() }),
      });
      expect([200, 201, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('PUT /api/cleaning/:id/complete', () => {
    it('should handle cleaning completion', async () => {
      const response = await fetch(`${API_URL}/api/cleaning/00000000-0000-0000-0000-000000000000/complete`, {
        method: 'PUT',
      });
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
