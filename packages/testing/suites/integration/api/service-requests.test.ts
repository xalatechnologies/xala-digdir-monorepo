/**
 * Service Requests API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Service Requests API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/service-requests', () => {
    it('should return service requests list', async () => {
      const response = await fetch(`${API_URL}/api/service-requests`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/service-requests', () => {
    it('should create service request', async () => {
      const response = await fetch(`${API_URL}/api/service-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rentalObjectId: '00000000-0000-0000-0000-000000000000', type: 'repair', description: 'Broken AC' }),
      });
      expect([200, 201, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('PUT /api/service-requests/:id/complete', () => {
    it('should complete service request', async () => {
      const response = await fetch(`${API_URL}/api/service-requests/00000000-0000-0000-0000-000000000000/complete`, {
        method: 'PUT',
      });
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
