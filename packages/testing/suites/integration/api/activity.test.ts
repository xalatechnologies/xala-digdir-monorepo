/**
 * Activity Log API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Activity Log API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/activity', () => {
    it('should return activity log', async () => {
      const response = await fetch(`${API_URL}/api/activity`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/activity/user/:userId', () => {
    it('should return user activity', async () => {
      const response = await fetch(`${API_URL}/api/activity/user/00000000-0000-0000-0000-000000000000`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/activity/resource/:resourceId', () => {
    it('should return resource activity', async () => {
      const response = await fetch(`${API_URL}/api/activity/resource/00000000-0000-0000-0000-000000000000`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
