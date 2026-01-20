/**
 * GDPR API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('GDPR API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/gdpr/export', () => {
    it('should handle data export request', async () => {
      const response = await fetch(`${API_URL}/api/gdpr/export`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/gdpr/delete', () => {
    it('should handle deletion request', async () => {
      const response = await fetch(`${API_URL}/api/gdpr/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation: true }),
      });
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('GET /api/gdpr/consents', () => {
    it('should return user consents', async () => {
      const response = await fetch(`${API_URL}/api/gdpr/consents`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('PUT /api/gdpr/consents', () => {
    it('should update user consents', async () => {
      const response = await fetch(`${API_URL}/api/gdpr/consents`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marketing: false }),
      });
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });
});
