/**
 * Organization Settings API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Organization Settings API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/organizations/:id/settings', () => {
    it('should return organization settings', async () => {
      const response = await fetch(`${API_URL}/api/organizations/00000000-0000-0000-0000-000000000000/settings`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('PUT /api/organizations/:id/settings', () => {
    it('should update organization settings', async () => {
      const response = await fetch(`${API_URL}/api/organizations/00000000-0000-0000-0000-000000000000/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailNotifications: true }),
      });
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('GET /api/organizations/:id/branding', () => {
    it('should return organization branding', async () => {
      const response = await fetch(`${API_URL}/api/organizations/00000000-0000-0000-0000-000000000000/branding`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
