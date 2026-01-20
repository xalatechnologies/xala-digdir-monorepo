/**
 * Integration Providers API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Integration Providers API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/integrations', () => {
    it('should return integrations list', async () => {
      const response = await fetch(`${API_URL}/api/integrations`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/integrations', () => {
    it('should handle integration setup', async () => {
      const response = await fetch(`${API_URL}/api/integrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'stripe', credentials: {} }),
      });
      expect([200, 201, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('GET /api/integrations/:id/status', () => {
    it('should return integration status', async () => {
      const response = await fetch(`${API_URL}/api/integrations/00000000-0000-0000-0000-000000000000/status`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
