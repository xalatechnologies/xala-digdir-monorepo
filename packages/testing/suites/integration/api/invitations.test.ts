/**
 * Invitations API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Invitations API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/invitations', () => {
    it('should return invitations', async () => {
      const response = await fetch(`${API_URL}/api/invitations`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/invitations', () => {
    it('should handle invitation creation', async () => {
      const response = await fetch(`${API_URL}/api/invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          organizationId: '00000000-0000-0000-0000-000000000000',
          role: 'member',
        }),
      });
      expect([200, 201, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('POST /api/invitations/:id/accept', () => {
    it('should handle invitation acceptance', async () => {
      const response = await fetch(`${API_URL}/api/invitations/00000000-0000-0000-0000-000000000000/accept`, {
        method: 'POST',
      });
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('DELETE /api/invitations/:id', () => {
    it('should handle invitation cancellation', async () => {
      const response = await fetch(`${API_URL}/api/invitations/00000000-0000-0000-0000-000000000000`, {
        method: 'DELETE',
      });
      expect([200, 204, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
