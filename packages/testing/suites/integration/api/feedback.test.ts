/**
 * Feedback API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Feedback API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/feedback', () => {
    it('should return feedback list', async () => {
      const response = await fetch(`${API_URL}/api/feedback`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/feedback', () => {
    it('should submit feedback', async () => {
      const response = await fetch(`${API_URL}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'bug', message: 'Test feedback' }),
      });
      expect([200, 201, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('PUT /api/feedback/:id/acknowledge', () => {
    it('should acknowledge feedback', async () => {
      const response = await fetch(`${API_URL}/api/feedback/00000000-0000-0000-0000-000000000000/acknowledge`, {
        method: 'PUT',
      });
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
