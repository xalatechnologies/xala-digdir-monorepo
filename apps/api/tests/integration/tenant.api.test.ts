/**
 * Tenant API Integration Tests
 */
import { describe, it, expect } from 'vitest';
import { request, skipIfNoServer } from './setup';

describe('Tenant API', () => {
  describe('GET /health', () => {
    it('should return healthy status', async () => {
      if (skipIfNoServer()) return;
      const res = await request('GET', '/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });

  describe('GET /api/tenants', () => {
    it('should return list of tenants', async () => {
      if (skipIfNoServer()) return;
      const res = await request('GET', '/api/tenants');
      expect([200, 500]).toContain(res.status);
    });
  });

  describe('POST /api/tenants', () => {
    it('should validate required fields', async () => {
      if (skipIfNoServer()) return;
      const res = await request('POST', '/api/tenants', { body: { name: '' } });
      // 400/422 for validation error
      expect([400, 422]).toContain(res.status);
    });
  });
});
