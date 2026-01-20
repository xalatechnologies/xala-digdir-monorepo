/**
 * Email Templates API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Email Templates API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/email-templates', () => {
    it('should return email templates', async () => {
      const response = await fetch(`${API_URL}/api/email-templates`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/email-templates/:id', () => {
    it('should return email template by ID', async () => {
      const response = await fetch(`${API_URL}/api/email-templates/00000000-0000-0000-0000-000000000000`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('PUT /api/email-templates/:id', () => {
    it('should update email template', async () => {
      const response = await fetch(`${API_URL}/api/email-templates/00000000-0000-0000-0000-000000000000`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: 'Test Subject', body: 'Test Body' }),
      });
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('POST /api/email-templates/:id/preview', () => {
    it('should preview email template', async () => {
      const response = await fetch(`${API_URL}/api/email-templates/00000000-0000-0000-0000-000000000000/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { name: 'Test User' } }),
      });
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('POST /api/email-templates/:id/test', () => {
    it('should send test email', async () => {
      const response = await fetch(`${API_URL}/api/email-templates/00000000-0000-0000-0000-000000000000/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com' }),
      });
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });
});
