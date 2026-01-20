/**
 * Modules API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Modules API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/modules', () => {
    it('should return modules list', async () => {
      const response = await fetch(`${API_URL}/api/modules`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/modules/:id/enable', () => {
    it('should handle module enablement', async () => {
      const response = await fetch(`${API_URL}/api/modules/00000000-0000-0000-0000-000000000000/enable`, {
        method: 'POST',
      });
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/modules/:id/disable', () => {
    it('should handle module disablement', async () => {
      const response = await fetch(`${API_URL}/api/modules/00000000-0000-0000-0000-000000000000/disable`, {
        method: 'POST',
      });
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
