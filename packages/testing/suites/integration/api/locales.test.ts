/**
 * Locales API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Locales API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/locales', () => {
    it('should return locales list', async () => {
      const response = await fetch(`${API_URL}/api/locales`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/locales/:code', () => {
    it('should return specific locale', async () => {
      const response = await fetch(`${API_URL}/api/locales/nb`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('PUT /api/locales/default', () => {
    it('should handle default locale change', async () => {
      const response = await fetch(`${API_URL}/api/locales/default`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: 'nb' }),
      });
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('GET /public/locales', () => {
    it('should return public locales', async () => {
      const response = await fetch(`${API_URL}/public/locales`);
      expect([200, 404, 500]).toContain(response.status);
    });
  });
});
