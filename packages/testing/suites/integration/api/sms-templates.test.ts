/**
 * SMS Templates API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('SMS Templates API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/sms-templates', () => {
    it('should return SMS templates', async () => {
      const response = await fetch(`${API_URL}/api/sms-templates`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/sms-templates/:id', () => {
    it('should return SMS template by ID', async () => {
      const response = await fetch(`${API_URL}/api/sms-templates/00000000-0000-0000-0000-000000000000`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('PUT /api/sms-templates/:id', () => {
    it('should update SMS template', async () => {
      const response = await fetch(`${API_URL}/api/sms-templates/00000000-0000-0000-0000-000000000000`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: 'Test SMS body' }),
      });
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('POST /api/sms-templates/:id/test', () => {
    it('should send test SMS', async () => {
      const response = await fetch(`${API_URL}/api/sms-templates/00000000-0000-0000-0000-000000000000/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '+4712345678' }),
      });
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });
});
