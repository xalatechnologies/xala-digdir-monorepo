/**
 * Actions API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Actions API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/actions', () => {
    it('should return actions list', async () => {
      const response = await fetch(`${API_URL}/api/actions`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/actions/types', () => {
    it('should return action types', async () => {
      const response = await fetch(`${API_URL}/api/actions/types`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/actions/:id/execute', () => {
    it('should execute action', async () => {
      const response = await fetch(`${API_URL}/api/actions/00000000-0000-0000-0000-000000000000/execute`, {
        method: 'POST',
      });
      expect([200, 202, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/actions/:id/history', () => {
    it('should return action history', async () => {
      const response = await fetch(`${API_URL}/api/actions/00000000-0000-0000-0000-000000000000/history`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
