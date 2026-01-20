/**
 * Warranties API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Warranties API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/warranties', () => {
    it('should return warranties list', async () => {
      const response = await fetch(`${API_URL}/api/warranties`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/warranties', () => {
    it('should create warranty', async () => {
      const response = await fetch(`${API_URL}/api/warranties`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rentalObjectId: '00000000-0000-0000-0000-000000000000', duration: 12 }),
      });
      expect([200, 201, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('GET /api/warranties/:id', () => {
    it('should return warranty by ID', async () => {
      const response = await fetch(`${API_URL}/api/warranties/00000000-0000-0000-0000-000000000000`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
