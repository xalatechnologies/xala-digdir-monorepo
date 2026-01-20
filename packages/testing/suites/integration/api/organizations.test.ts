/**
 * Organizations API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Organizations API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/organizations', () => {
    it('should require authentication', async () => {
      const response = await fetch(`${API_URL}/api/organizations`);
      expect([401, 403]).toContain(response.status);
    });
  });

  describe('POST /api/organizations', () => {
    it('should require authentication', async () => {
      const response = await fetch(`${API_URL}/api/organizations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test Org' }),
      });
      expect([401, 403]).toContain(response.status);
    });
  });

  describe('GET /api/organizations/:id', () => {
    it('should require authentication', async () => {
      const response = await fetch(`${API_URL}/api/organizations/00000000-0000-0000-0000-000000000000`);
      expect([401, 403, 404]).toContain(response.status);
    });
  });

  describe('PUT /api/organizations/:id', () => {
    it('should require authentication', async () => {
      const response = await fetch(`${API_URL}/api/organizations/00000000-0000-0000-0000-000000000000`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Updated Org' }),
      });
      expect([401, 403, 404]).toContain(response.status);
    });
  });

  describe('POST /api/organizations/:id/members', () => {
    it('should require authentication', async () => {
      const response = await fetch(`${API_URL}/api/organizations/00000000-0000-0000-0000-000000000000/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@test.com' }),
      });
      expect([401, 403, 404]).toContain(response.status);
    });
  });
});
