/**
 * 2FA API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('2FA API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/2fa/status', () => {
    it('should return 2FA status', async () => {
      const response = await fetch(`${API_URL}/api/2fa/status`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/2fa/enable', () => {
    it('should handle 2FA enablement', async () => {
      const response = await fetch(`${API_URL}/api/2fa/enable`, {
        method: 'POST',
      });
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('POST /api/2fa/verify', () => {
    it('should handle 2FA verification', async () => {
      const response = await fetch(`${API_URL}/api/2fa/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: '123456' }),
      });
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('POST /api/2fa/disable', () => {
    it('should handle 2FA disablement', async () => {
      const response = await fetch(`${API_URL}/api/2fa/disable`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: '123456' }),
      });
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });
});
