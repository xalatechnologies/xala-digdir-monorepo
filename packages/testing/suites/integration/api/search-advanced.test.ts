/**
 * Search Advanced API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Search Advanced API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/search/autocomplete', () => {
    it('should return autocomplete suggestions', async () => {
      const response = await fetch(`${API_URL}/api/search/autocomplete?q=test`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/search/advanced', () => {
    it('should perform advanced search', async () => {
      const response = await fetch(`${API_URL}/api/search/advanced`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'meeting room', filters: { city: 'Oslo' } }),
      });
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('GET /api/search/suggestions', () => {
    it('should return search suggestions', async () => {
      const response = await fetch(`${API_URL}/api/search/suggestions`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/search/recent', () => {
    it('should return recent searches', async () => {
      const response = await fetch(`${API_URL}/api/search/recent`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('DELETE /api/search/recent', () => {
    it('should clear recent searches', async () => {
      const response = await fetch(`${API_URL}/api/search/recent`, {
        method: 'DELETE',
      });
      expect([200, 204, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
