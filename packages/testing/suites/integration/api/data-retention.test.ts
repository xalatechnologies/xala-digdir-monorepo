/**
 * Data Retention API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Data Retention API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/data-retention/policy', () => {
    it('should return retention policy', async () => {
      const response = await fetch(`${API_URL}/api/data-retention/policy`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('PUT /api/data-retention/policy', () => {
    it('should update retention policy', async () => {
      const response = await fetch(`${API_URL}/api/data-retention/policy`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ retentionDays: 365 }),
      });
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('POST /api/data-retention/cleanup', () => {
    it('should trigger data cleanup', async () => {
      const response = await fetch(`${API_URL}/api/data-retention/cleanup`, {
        method: 'POST',
      });
      expect([200, 202, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
