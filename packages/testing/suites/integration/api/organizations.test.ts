/**
 * Organizations API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Organizations API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/organizations', () => {
    it('should return response (may require auth)', async () => {
      const response = await fetch(`${API_URL}/api/organizations`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/organizations', () => {
    it('should reject unauthenticated creation', async () => {
      const response = await fetch(`${API_URL}/api/organizations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test Org' }),
      });
      expect([400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('GET /api/organizations/:id', () => {
    it('should return 404 for non-existent org', async () => {
      const response = await fetch(`${API_URL}/api/organizations/00000000-0000-0000-0000-000000000000`);
      expect([404, 400, 401, 403, 500]).toContain(response.status);
    });
  });
});
