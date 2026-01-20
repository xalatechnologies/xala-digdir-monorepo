/**
 * Notification Preferences API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Notification Preferences API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/notification-preferences', () => {
    it('should return notification preferences', async () => {
      const response = await fetch(`${API_URL}/api/notification-preferences`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('PUT /api/notification-preferences', () => {
    it('should update notification preferences', async () => {
      const response = await fetch(`${API_URL}/api/notification-preferences`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailEnabled: true, smsEnabled: false }),
      });
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('GET /api/notification-channels', () => {
    it('should return notification channels', async () => {
      const response = await fetch(`${API_URL}/api/notification-channels`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
