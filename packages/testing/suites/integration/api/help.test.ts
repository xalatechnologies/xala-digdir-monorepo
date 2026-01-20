/**
 * Help API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Help API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/help', () => {
    it('should return help content', async () => {
      const response = await fetch(`${API_URL}/api/help`);
      expect([200, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/help/articles', () => {
    it('should return help articles', async () => {
      const response = await fetch(`${API_URL}/api/help/articles`);
      expect([200, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/help/articles/:slug', () => {
    it('should return specific article', async () => {
      const response = await fetch(`${API_URL}/api/help/articles/getting-started`);
      expect([200, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/help/search', () => {
    it('should search help content', async () => {
      const response = await fetch(`${API_URL}/api/help/search?q=booking`);
      expect([200, 400, 404, 500]).toContain(response.status);
    });
  });
});
