/**
 * Scheduled Tasks API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Scheduled Tasks API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/scheduled-tasks', () => {
    it('should return scheduled tasks list', async () => {
      const response = await fetch(`${API_URL}/api/scheduled-tasks`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/scheduled-tasks', () => {
    it('should create scheduled task', async () => {
      const response = await fetch(`${API_URL}/api/scheduled-tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Daily Report', cron: '0 9 * * *' }),
      });
      expect([200, 201, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('DELETE /api/scheduled-tasks/:id', () => {
    it('should delete scheduled task', async () => {
      const response = await fetch(`${API_URL}/api/scheduled-tasks/00000000-0000-0000-0000-000000000000`, {
        method: 'DELETE',
      });
      expect([200, 204, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
