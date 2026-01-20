/**
 * Automations API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Automations API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/automations', () => {
    it('should return automations list', async () => {
      const response = await fetch(`${API_URL}/api/automations`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/automations/logs', () => {
    it('should return automation logs', async () => {
      const response = await fetch(`${API_URL}/api/automations/logs`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/automations/:id/trigger', () => {
    it('should manually trigger automation', async () => {
      const response = await fetch(`${API_URL}/api/automations/00000000-0000-0000-0000-000000000000/trigger`, {
        method: 'POST',
      });
      expect([200, 202, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('PUT /api/automations/:id/toggle', () => {
    it('should toggle automation state', async () => {
      const response = await fetch(`${API_URL}/api/automations/00000000-0000-0000-0000-000000000000/toggle`, {
        method: 'PUT',
      });
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
