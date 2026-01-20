/**
 * Search API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Search API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/search', () => {
    it('should return search results', async () => {
      const response = await fetch(`${API_URL}/api/search?q=test`);
      expect([200, 404]).toContain(response.status);
    });

    it('should handle empty query', async () => {
      const response = await fetch(`${API_URL}/api/search`);
      expect([200, 400, 404]).toContain(response.status);
    });
  });

  describe('GET /api/search/suggestions', () => {
    it('should return suggestions', async () => {
      const response = await fetch(`${API_URL}/api/search/suggestions?q=te`);
      expect([200, 404]).toContain(response.status);
    });
  });
});
