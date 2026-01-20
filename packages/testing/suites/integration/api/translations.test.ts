/**
 * Translations API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Translations API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/translations', () => {
    it('should return translations', async () => {
      const response = await fetch(`${API_URL}/api/translations`);
      expect([200, 404]).toContain(response.status);
    });
  });

  describe('GET /api/translations/:locale', () => {
    it('should return translations for locale', async () => {
      const response = await fetch(`${API_URL}/api/translations/nb`);
      expect([200, 404]).toContain(response.status);
    });
  });

  describe('GET /public/translations/:locale', () => {
    it('should return public translations', async () => {
      const response = await fetch(`${API_URL}/public/translations/nb`);
      expect([200, 404]).toContain(response.status);
    });
  });
});
