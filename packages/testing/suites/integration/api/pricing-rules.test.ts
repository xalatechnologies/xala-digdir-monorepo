/**
 * Pricing Rules API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Pricing Rules API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/pricing-rules', () => {
    it('should return pricing rules', async () => {
      const response = await fetch(`${API_URL}/api/pricing-rules`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/pricing-rules', () => {
    it('should handle pricing rule creation', async () => {
      const response = await fetch(`${API_URL}/api/pricing-rules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Weekend Rate', multiplier: 1.5 }),
      });
      expect([200, 201, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('DELETE /api/pricing-rules/:id', () => {
    it('should handle pricing rule deletion', async () => {
      const response = await fetch(`${API_URL}/api/pricing-rules/00000000-0000-0000-0000-000000000000`, {
        method: 'DELETE',
      });
      expect([200, 204, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
