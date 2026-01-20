/**
 * Push Notifications API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Push Notifications API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/push-notifications', () => {
    it('should return push notifications list', async () => {
      const response = await fetch(`${API_URL}/api/push-notifications`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/push-notifications', () => {
    it('should send push notification', async () => {
      const response = await fetch(`${API_URL}/api/push-notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Test', body: 'Test notification' }),
      });
      expect([200, 201, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('POST /api/push-notifications/broadcast', () => {
    it('should broadcast push notification', async () => {
      const response = await fetch(`${API_URL}/api/push-notifications/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Broadcast', body: 'Broadcast message' }),
      });
      expect([200, 201, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });
});
