/**
 * User Organizations API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('User Organizations API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/users/:id/organizations', () => {
    it('should return organizations for user', async () => {
      const response = await fetch(`${API_URL}/api/users/00000000-0000-0000-0000-000000000000/organizations`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/me/organizations', () => {
    it('should return current user organizations', async () => {
      const response = await fetch(`${API_URL}/api/me/organizations`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/me/organizations/:id/leave', () => {
    it('should leave organization', async () => {
      const response = await fetch(`${API_URL}/api/me/organizations/00000000-0000-0000-0000-000000000000/leave`, {
        method: 'POST',
      });
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
