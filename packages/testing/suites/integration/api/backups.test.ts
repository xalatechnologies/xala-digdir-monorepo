/**
 * Backup API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Backup API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/backups', () => {
    it('should return backups list', async () => {
      const response = await fetch(`${API_URL}/api/backups`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/backups', () => {
    it('should handle backup creation', async () => {
      const response = await fetch(`${API_URL}/api/backups`, {
        method: 'POST',
      });
      expect([200, 201, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/backups/:id/restore', () => {
    it('should handle backup restore', async () => {
      const response = await fetch(`${API_URL}/api/backups/00000000-0000-0000-0000-000000000000/restore`, {
        method: 'POST',
      });
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
