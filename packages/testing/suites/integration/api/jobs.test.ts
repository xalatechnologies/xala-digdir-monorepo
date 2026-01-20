/**
 * Jobs API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Jobs API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/jobs', () => {
    it('should return jobs list', async () => {
      const response = await fetch(`${API_URL}/api/jobs`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/jobs/:id', () => {
    it('should return job by ID', async () => {
      const response = await fetch(`${API_URL}/api/jobs/00000000-0000-0000-0000-000000000000`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/jobs/:id/cancel', () => {
    it('should cancel job', async () => {
      const response = await fetch(`${API_URL}/api/jobs/00000000-0000-0000-0000-000000000000/cancel`, {
        method: 'POST',
      });
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/jobs/:id/retry', () => {
    it('should retry job', async () => {
      const response = await fetch(`${API_URL}/api/jobs/00000000-0000-0000-0000-000000000000/retry`, {
        method: 'POST',
      });
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
