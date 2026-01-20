/**
 * Auth Integration Tests
 * 
 * Tests authentication endpoints against real API
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

describe('Auth API', () => {
  let apiAvailable = false;

  beforeAll(async () => {
    apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      console.log('⚠️  Skipping auth tests - API not available at', API_URL);
    }
  });

  describe('POST /auth/login', () => {
    it('should reject invalid credentials', async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'invalid@test.com',
          password: 'wrongpassword',
        }),
      });

      expect([400, 401, 403]).toContain(response.status);
    });

    it('should require email and password', async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      expect([400, 422]).toContain(response.status);
    });
  });

  describe('GET /me', () => {
    it('should require authentication', async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_URL}/me`);

      expect([401, 403]).toContain(response.status);
    });
  });

  describe('POST /auth/logout', () => {
    it('should handle logout without auth gracefully', async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
      });

      // Should succeed or return 401
      expect([200, 204, 401]).toContain(response.status);
    });
  });
});
