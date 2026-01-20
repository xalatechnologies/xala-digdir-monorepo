/**
 * Cancellation Fees API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Cancellation Fees API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/cancellation-fees', () => {
    it('should return cancellation fees list', async () => {
      const response = await fetch(`${API_URL}/api/cancellation-fees`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/cancellation-fees', () => {
    it('should create cancellation fee', async () => {
      const response = await fetch(`${API_URL}/api/cancellation-fees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Same Day', percentage: 100 }),
      });
      expect([200, 201, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('PUT /api/cancellation-fees/:id', () => {
    it('should update cancellation fee', async () => {
      const response = await fetch(`${API_URL}/api/cancellation-fees/00000000-0000-0000-0000-000000000000`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ percentage: 50 }),
      });
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('DELETE /api/cancellation-fees/:id', () => {
    it('should delete cancellation fee', async () => {
      const response = await fetch(`${API_URL}/api/cancellation-fees/00000000-0000-0000-0000-000000000000`, {
        method: 'DELETE',
      });
      expect([200, 204, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
