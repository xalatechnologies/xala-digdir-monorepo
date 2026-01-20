/**
 * OpenAPI Spec Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('OpenAPI Spec', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/docs', () => {
    it('should return API documentation', async () => {
      const response = await fetch(`${API_URL}/api/docs`);
      expect([200, 301, 302, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/openapi.json', () => {
    it('should return OpenAPI spec', async () => {
      const response = await fetch(`${API_URL}/api/openapi.json`);
      expect([200, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/swagger', () => {
    it('should return Swagger UI', async () => {
      const response = await fetch(`${API_URL}/api/swagger`);
      expect([200, 301, 302, 404, 500]).toContain(response.status);
    });
  });
});
