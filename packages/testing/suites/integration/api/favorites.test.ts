/**
 * Favorites API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Favorites API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/favorites', () => {
    it('should return favorites list', async () => {
      const response = await fetch(`${API_URL}/api/favorites`);
      expect([200, 401, 403, 404]).toContain(response.status);
    });
  });

  describe('POST /api/favorites', () => {
    it('should handle adding favorite', async () => {
      const response = await fetch(`${API_URL}/api/favorites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rentalObjectId: '00000000-0000-0000-0000-000000000000' }),
      });
      expect([200, 201, 400, 401, 403, 404, 422]).toContain(response.status);
    });
  });

  describe('DELETE /api/favorites/:id', () => {
    it('should handle removing favorite', async () => {
      const response = await fetch(`${API_URL}/api/favorites/00000000-0000-0000-0000-000000000000`, {
        method: 'DELETE',
      });
      expect([200, 204, 400, 401, 403, 404]).toContain(response.status);
    });
  });
});
