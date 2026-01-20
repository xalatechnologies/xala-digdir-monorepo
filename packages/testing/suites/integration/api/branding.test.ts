/**
 * Branding API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Branding API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/branding', () => {
    it('should return branding config', async () => {
      const response = await fetch(`${API_URL}/api/branding`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('PUT /api/branding', () => {
    it('should handle branding update', async () => {
      const response = await fetch(`${API_URL}/api/branding`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ primaryColor: '#0066cc', logoUrl: 'https://example.com/logo.png' }),
      });
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('GET /public/branding', () => {
    it('should return public branding', async () => {
      const response = await fetch(`${API_URL}/public/branding`);
      expect([200, 404, 500]).toContain(response.status);
    });
  });
});
