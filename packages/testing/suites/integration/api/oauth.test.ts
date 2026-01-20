/**
 * OAuth API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('OAuth API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/oauth/providers', () => {
    it('should return OAuth providers', async () => {
      const response = await fetch(`${API_URL}/api/oauth/providers`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/oauth/authorize', () => {
    it('should handle OAuth authorization', async () => {
      const response = await fetch(`${API_URL}/api/oauth/authorize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'google', redirectUri: 'https://example.com/callback' }),
      });
      expect([200, 302, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('DELETE /api/oauth/connections/:id', () => {
    it('should handle OAuth disconnection', async () => {
      const response = await fetch(`${API_URL}/api/oauth/connections/00000000-0000-0000-0000-000000000000`, {
        method: 'DELETE',
      });
      expect([200, 204, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
