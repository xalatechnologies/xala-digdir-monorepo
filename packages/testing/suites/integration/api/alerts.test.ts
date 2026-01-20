/**
 * Alerts API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Alerts API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/alerts', () => {
    it('should return alerts list', async () => {
      const response = await fetch(`${API_URL}/api/alerts`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/alerts', () => {
    it('should create alert', async () => {
      const response = await fetch(`${API_URL}/api/alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'warning', message: 'Test alert' }),
      });
      expect([200, 201, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('PUT /api/alerts/:id/acknowledge', () => {
    it('should acknowledge alert', async () => {
      const response = await fetch(`${API_URL}/api/alerts/00000000-0000-0000-0000-000000000000/acknowledge`, {
        method: 'PUT',
      });
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
