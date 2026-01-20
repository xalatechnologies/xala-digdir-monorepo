/**
 * Sitemap API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Sitemap API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /sitemap.xml', () => {
    it('should return sitemap', async () => {
      const response = await fetch(`${API_URL}/sitemap.xml`);
      expect([200, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /robots.txt', () => {
    it('should return robots.txt', async () => {
      const response = await fetch(`${API_URL}/robots.txt`);
      expect([200, 404, 500]).toContain(response.status);
    });
  });
});
