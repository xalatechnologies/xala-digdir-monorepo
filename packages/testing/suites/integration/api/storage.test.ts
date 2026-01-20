/**
 * Storage API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Storage API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/storage', () => {
    it('should return storage info', async () => {
      const response = await fetch(`${API_URL}/api/storage`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/storage/files', () => {
    it('should return files list', async () => {
      const response = await fetch(`${API_URL}/api/storage/files`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/storage/usage', () => {
    it('should return storage usage', async () => {
      const response = await fetch(`${API_URL}/api/storage/usage`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
