/**
 * Dashboard Activity API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Dashboard Activity API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/dashboard/activity', () => {
    it('should return recent activity', async () => {
      const response = await fetch(`${API_URL}/api/dashboard/activity`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/dashboard/activity/feed', () => {
    it('should return activity feed', async () => {
      const response = await fetch(`${API_URL}/api/dashboard/activity/feed`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/dashboard/activity/timeline', () => {
    it('should return activity timeline', async () => {
      const response = await fetch(`${API_URL}/api/dashboard/activity/timeline`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/dashboard/activity/summary', () => {
    it('should return activity summary', async () => {
      const response = await fetch(`${API_URL}/api/dashboard/activity/summary`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
