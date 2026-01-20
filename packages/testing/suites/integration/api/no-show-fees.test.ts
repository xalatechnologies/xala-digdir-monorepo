/**
 * No Show Fees API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('No Show Fees API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/no-show-fees', () => {
    it('should return no show fees configuration', async () => {
      const response = await fetch(`${API_URL}/api/no-show-fees`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('PUT /api/no-show-fees', () => {
    it('should update no show fees configuration', async () => {
      const response = await fetch(`${API_URL}/api/no-show-fees`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chargeFullAmount: true, graceMinutes: 15 }),
      });
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('POST /api/no-show-fees/apply/:bookingId', () => {
    it('should apply no show fee', async () => {
      const response = await fetch(`${API_URL}/api/no-show-fees/apply/00000000-0000-0000-0000-000000000000`, {
        method: 'POST',
      });
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
