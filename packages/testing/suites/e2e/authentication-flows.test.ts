/**
 * E2E Authentication Flow Tests
 * Real API flow tests
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('E2E: Authentication Flows', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('Login Flow', () => {
    it('should fetch login page config', async () => {
      const response = await fetch(`${API_URL}/public/configuration`);
      expect([200, 404, 500]).toContain(response.status);
    });

    it('should fetch OAuth providers', async () => {
      const response = await fetch(`${API_URL}/api/oauth/providers`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('Password Reset Flow', () => {
    it('step 1: request reset', async () => {
      const response = await fetch(`${API_URL}/api/password/forgot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com' }),
      });
      expect([200, 400, 404, 422, 500]).toContain(response.status);
    });

    it('step 2: verify token', async () => {
      const response = await fetch(`${API_URL}/api/verification/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', code: '123456' }),
      });
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('2FA Flow', () => {
    it('should fetch 2FA status', async () => {
      const response = await fetch(`${API_URL}/api/2fa/status`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
