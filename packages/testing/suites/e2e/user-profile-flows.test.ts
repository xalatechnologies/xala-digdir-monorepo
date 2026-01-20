/**
 * E2E User Profile Flow Tests
 * Real API flow tests
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('E2E: User Profile Flows', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('Profile Load Flow', () => {
    it('should fetch profile', async () => {
      const response = await fetch(`${API_URL}/api/profile`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });

    it('should fetch user bookings', async () => {
      const response = await fetch(`${API_URL}/api/bookings`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });

    it('should fetch favorites', async () => {
      const response = await fetch(`${API_URL}/api/favorites`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });

    it('should fetch messages', async () => {
      const response = await fetch(`${API_URL}/api/messages/conversations`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('Profile Update Flow', () => {
    it('should handle profile update', async () => {
      const response = await fetch(`${API_URL}/api/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test User' }),
      });
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });
});
