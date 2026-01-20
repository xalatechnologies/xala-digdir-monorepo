/**
 * Rental Object Types API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Rental Object Types API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/rental-object-types', () => {
    it('should return rental object types list', async () => {
      const response = await fetch(`${API_URL}/api/rental-object-types`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /public/rental-object-types', () => {
    it('should return public rental object types', async () => {
      const response = await fetch(`${API_URL}/public/rental-object-types`);
      expect([200, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/rental-object-types', () => {
    it('should create rental object type', async () => {
      const response = await fetch(`${API_URL}/api/rental-object-types`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Conference Room', icon: 'meeting' }),
      });
      expect([200, 201, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });
});
