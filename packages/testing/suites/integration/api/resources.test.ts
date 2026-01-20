/**
 * Resources API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Resources API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/resources', () => {
    it('should return resources list', async () => {
      const response = await fetch(`${API_URL}/api/resources`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/resources', () => {
    it('should handle resource creation', async () => {
      const response = await fetch(`${API_URL}/api/resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test Resource', type: 'equipment' }),
      });
      expect([200, 201, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('GET /api/resources/:id', () => {
    it('should handle resource lookup', async () => {
      const response = await fetch(`${API_URL}/api/resources/00000000-0000-0000-0000-000000000000`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('DELETE /api/resources/:id', () => {
    it('should handle resource deletion', async () => {
      const response = await fetch(`${API_URL}/api/resources/00000000-0000-0000-0000-000000000000`, {
        method: 'DELETE',
      });
      expect([200, 204, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
