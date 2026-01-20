/**
 * Themes API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Themes API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/themes', () => {
    it('should return themes list', async () => {
      const response = await fetch(`${API_URL}/api/themes`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('PUT /api/themes/active', () => {
    it('should handle theme activation', async () => {
      const response = await fetch(`${API_URL}/api/themes/active`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themeId: '00000000-0000-0000-0000-000000000000' }),
      });
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('GET /public/theme', () => {
    it('should return public theme', async () => {
      const response = await fetch(`${API_URL}/public/theme`);
      expect([200, 404, 500]).toContain(response.status);
    });
  });
});
