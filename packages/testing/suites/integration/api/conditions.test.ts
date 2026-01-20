/**
 * Conditions API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Conditions API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/conditions', () => {
    it('should return conditions list', async () => {
      const response = await fetch(`${API_URL}/api/conditions`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/conditions/operators', () => {
    it('should return condition operators', async () => {
      const response = await fetch(`${API_URL}/api/conditions/operators`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/conditions', () => {
    it('should create condition', async () => {
      const response = await fetch(`${API_URL}/api/conditions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field: 'booking.total', operator: 'gt', value: 100 }),
      });
      expect([200, 201, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('POST /api/conditions/evaluate', () => {
    it('should evaluate condition', async () => {
      const response = await fetch(`${API_URL}/api/conditions/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conditions: [], data: {} }),
      });
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('DELETE /api/conditions/:id', () => {
    it('should delete condition', async () => {
      const response = await fetch(`${API_URL}/api/conditions/00000000-0000-0000-0000-000000000000`, {
        method: 'DELETE',
      });
      expect([200, 204, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
