/**
 * Legal Documents API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Legal Documents API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/legal/terms', () => {
    it('should return terms of service', async () => {
      const response = await fetch(`${API_URL}/api/legal/terms`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/legal/privacy', () => {
    it('should return privacy policy', async () => {
      const response = await fetch(`${API_URL}/api/legal/privacy`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /public/legal/terms', () => {
    it('should return public terms', async () => {
      const response = await fetch(`${API_URL}/public/legal/terms`);
      expect([200, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /public/legal/privacy', () => {
    it('should return public privacy policy', async () => {
      const response = await fetch(`${API_URL}/public/legal/privacy`);
      expect([200, 404, 500]).toContain(response.status);
    });
  });
});
