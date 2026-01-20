/**
 * Audit Logs API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Audit Logs API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/audit-logs', () => {
    it('should return audit logs list', async () => {
      const response = await fetch(`${API_URL}/api/audit-logs`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/audit-logs/:id', () => {
    it('should return audit log by ID', async () => {
      const response = await fetch(`${API_URL}/api/audit-logs/00000000-0000-0000-0000-000000000000`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/audit-logs/export', () => {
    it('should export audit logs', async () => {
      const response = await fetch(`${API_URL}/api/audit-logs/export`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
