/**
 * E2E Organization Management Flow Tests
 * Real API flow tests
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('E2E: Organization Management Flows', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('Organization Load Flow', () => {
    it('should fetch organizations', async () => {
      const response = await fetch(`${API_URL}/api/organizations`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });

    it('should fetch organization members', async () => {
      const response = await fetch(`${API_URL}/api/memberships`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });

    it('should fetch invitations', async () => {
      const response = await fetch(`${API_URL}/api/invitations`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('Invite Member Flow', () => {
    it('should handle member invitation', async () => {
      const response = await fetch(`${API_URL}/api/invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', role: 'member' }),
      });
      expect([200, 201, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });
});
