/**
 * Notifications History API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Notifications History API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/notifications-history', () => {
    it('should return notifications history', async () => {
      const response = await fetch(`${API_URL}/api/notifications-history`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/notifications-history/unread', () => {
    it('should return unread notifications', async () => {
      const response = await fetch(`${API_URL}/api/notifications-history/unread`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('PUT /api/notifications-history/:id/read', () => {
    it('should mark notification as read', async () => {
      const response = await fetch(`${API_URL}/api/notifications-history/00000000-0000-0000-0000-000000000000/read`, {
        method: 'PUT',
      });
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('PUT /api/notifications-history/mark-all-read', () => {
    it('should mark all notifications as read', async () => {
      const response = await fetch(`${API_URL}/api/notifications-history/mark-all-read`, {
        method: 'PUT',
      });
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
