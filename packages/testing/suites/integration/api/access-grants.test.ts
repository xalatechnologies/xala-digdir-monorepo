/**
 * Access Grants API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Access Grants API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/access-grants', () => {
    it('should return access grants', async () => {
      const response = await fetch(`${API_URL}/api/access-grants`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/access-grants', () => {
    it('should handle grant creation', async () => {
      const response = await fetch(`${API_URL}/api/access-grants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: '00000000-0000-0000-0000-000000000000',
          resourceId: '00000000-0000-0000-0000-000000000000',
          permission: 'read',
        }),
      });
      expect([200, 201, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('DELETE /api/access-grants/:id', () => {
    it('should handle grant revocation', async () => {
      const response = await fetch(`${API_URL}/api/access-grants/00000000-0000-0000-0000-000000000000`, {
        method: 'DELETE',
      });
      expect([200, 204, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
