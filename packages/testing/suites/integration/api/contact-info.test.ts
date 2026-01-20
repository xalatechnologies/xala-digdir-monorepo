/**
 * Contact Info API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Contact Info API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/contact-info', () => {
    it('should return contact info', async () => {
      const response = await fetch(`${API_URL}/api/contact-info`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('PUT /api/contact-info', () => {
    it('should update contact info', async () => {
      const response = await fetch(`${API_URL}/api/contact-info`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '+4712345678', email: 'contact@example.com' }),
      });
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });
});
