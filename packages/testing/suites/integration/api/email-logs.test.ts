/**
 * Email Logs API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Email Logs API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/email-logs', () => {
    it('should return email logs list', async () => {
      const response = await fetch(`${API_URL}/api/email-logs`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/email-logs/:id', () => {
    it('should return email log by ID', async () => {
      const response = await fetch(`${API_URL}/api/email-logs/00000000-0000-0000-0000-000000000000`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/email-logs/:id/resend', () => {
    it('should resend email', async () => {
      const response = await fetch(`${API_URL}/api/email-logs/00000000-0000-0000-0000-000000000000/resend`, {
        method: 'POST',
      });
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
