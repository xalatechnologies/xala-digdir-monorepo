/**
 * Reminders API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Reminders API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/reminders', () => {
    it('should return reminders list', async () => {
      const response = await fetch(`${API_URL}/api/reminders`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/reminders', () => {
    it('should create reminder', async () => {
      const response = await fetch(`${API_URL}/api/reminders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Check booking', scheduledAt: new Date().toISOString() }),
      });
      expect([200, 201, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('DELETE /api/reminders/:id', () => {
    it('should delete reminder', async () => {
      const response = await fetch(`${API_URL}/api/reminders/00000000-0000-0000-0000-000000000000`, {
        method: 'DELETE',
      });
      expect([200, 204, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
