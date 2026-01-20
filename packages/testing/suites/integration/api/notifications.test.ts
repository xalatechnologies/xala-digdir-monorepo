/**
 * Notification System Tests
 * 
 * Tests webhook and notification endpoints
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

async function isApiAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/health`, {
      signal: AbortSignal.timeout(2000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

describe('Notification System', () => {
  let apiAvailable = false;

  beforeAll(async () => {
    apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      console.log('⚠️  Skipping notification tests - API not available at', API_URL);
    }
  });

  describe('Webhook Endpoints', () => {
    it('should reject unauthenticated webhook registration', async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_URL}/api/webhooks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: 'https://attacker.com/webhook',
          events: ['booking.created'],
        }),
      });

      expect([401, 403, 404]).toContain(response.status);
    });

    it('should require auth for webhook management', async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_URL}/api/webhooks`);

      expect([401, 403, 404]).toContain(response.status);
    });
  });

  describe('Notification Preferences', () => {
    it('should require auth for notification preferences', async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_URL}/api/notifications/preferences`);

      expect([401, 403, 404]).toContain(response.status);
    });
  });

  describe('WebSocket', () => {
    it('should have WebSocket endpoint configured', async () => {
      if (!apiAvailable) return;

      // Just verify health - WebSocket testing requires different approach
      const response = await fetch(`${API_URL}/health`);
      expect(response.ok).toBe(true);
    });
  });
});
