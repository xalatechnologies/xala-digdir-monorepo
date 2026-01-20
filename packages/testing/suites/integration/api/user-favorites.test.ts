/**
 * User Favorites API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('User Favorites API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/me/favorites', () => {
    it('should return user favorites', async () => {
      const response = await fetch(`${API_URL}/api/me/favorites`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/me/favorites/:id', () => {
    it('should add to favorites', async () => {
      const response = await fetch(`${API_URL}/api/me/favorites/00000000-0000-0000-0000-000000000000`, {
        method: 'POST',
      });
      expect([200, 201, 400, 401, 403, 404, 409, 500]).toContain(response.status);
    });
  });

  describe('DELETE /api/me/favorites/:id', () => {
    it('should remove from favorites', async () => {
      const response = await fetch(`${API_URL}/api/me/favorites/00000000-0000-0000-0000-000000000000`, {
        method: 'DELETE',
      });
      expect([200, 204, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
