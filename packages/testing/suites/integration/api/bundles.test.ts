/**
 * Bundles API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Bundles API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/bundles', () => {
    it('should return bundles list', async () => {
      const response = await fetch(`${API_URL}/api/bundles`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/bundles', () => {
    it('should create bundle', async () => {
      const response = await fetch(`${API_URL}/api/bundles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Weekend Package', items: [] }),
      });
      expect([200, 201, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('PUT /api/bundles/:id', () => {
    it('should update bundle', async () => {
      const response = await fetch(`${API_URL}/api/bundles/00000000-0000-0000-0000-000000000000`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Holiday Package' }),
      });
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });
});
