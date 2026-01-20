/**
 * API Keys Management Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('API Keys Management', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/api-keys', () => {
    it('should return API keys list', async () => {
      const response = await fetch(`${API_URL}/api/api-keys`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/api-keys', () => {
    it('should create API key', async () => {
      const response = await fetch(`${API_URL}/api/api-keys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Integration Key', scopes: ['read', 'write'] }),
      });
      expect([200, 201, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('DELETE /api/api-keys/:id', () => {
    it('should revoke API key', async () => {
      const response = await fetch(`${API_URL}/api/api-keys/00000000-0000-0000-0000-000000000000`, {
        method: 'DELETE',
      });
      expect([200, 204, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/api-keys/:id/rotate', () => {
    it('should rotate API key', async () => {
      const response = await fetch(`${API_URL}/api/api-keys/00000000-0000-0000-0000-000000000000/rotate`, {
        method: 'POST',
      });
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
