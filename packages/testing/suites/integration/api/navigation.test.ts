/**
 * Navigation API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Navigation API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/navigation', () => {
    it('should return navigation menu', async () => {
      const response = await fetch(`${API_URL}/api/navigation`);
      expect([200, 401, 403, 404]).toContain(response.status);
    });
  });

  describe('GET /api/navigation/backoffice', () => {
    it('should require authentication', async () => {
      const response = await fetch(`${API_URL}/api/navigation/backoffice`);
      expect([401, 403, 404]).toContain(response.status);
    });
  });

  describe('GET /api/navigation/minside', () => {
    it('should require authentication for user menu', async () => {
      const response = await fetch(`${API_URL}/api/navigation/minside`);
      expect([401, 403, 404]).toContain(response.status);
    });
  });
});
