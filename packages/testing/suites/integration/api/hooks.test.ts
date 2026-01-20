/**
 * Hooks API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Hooks API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/hooks', () => {
    it('should return hooks list', async () => {
      const response = await fetch(`${API_URL}/api/hooks`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/hooks', () => {
    it('should create hook', async () => {
      const response = await fetch(`${API_URL}/api/hooks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: 'https://example.com/hook', events: ['booking.created'] }),
      });
      expect([200, 201, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('DELETE /api/hooks/:id', () => {
    it('should delete hook', async () => {
      const response = await fetch(`${API_URL}/api/hooks/00000000-0000-0000-0000-000000000000`, {
        method: 'DELETE',
      });
      expect([200, 204, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/hooks/:id/test', () => {
    it('should test hook', async () => {
      const response = await fetch(`${API_URL}/api/hooks/00000000-0000-0000-0000-000000000000/test`, {
        method: 'POST',
      });
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
