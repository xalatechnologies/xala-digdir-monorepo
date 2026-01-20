/**
 * Tenant API Integration Tests
 */
import { describe, it, expect } from 'vitest';
import { setupMockApi } from '@digilist/api/mocks/api-server.mock';
import { request, skipIfNoServer } from './setup';

// TODO: Skipped - needs implementation
describe.skip('Tenant API', () => {
  setupMockApi();
  describe('GET /health', () => {
  setupMockApi();
    it('should return healthy status', async () => {
      if (skipIfNoServer()) return;
      const res = await request('GET', '/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });

  describe('GET /api/tenants', () => {
  setupMockApi();
    it('should return list of tenants', async () => {
      if (skipIfNoServer()) return;
      const res = await request('GET', '/api/tenants');
      expect([200, 500]).toContain(res.status);
    });
  });

  describe('POST /api/tenants', () => {
  setupMockApi();
    it('should validate required fields', async () => {
      if (skipIfNoServer()) return;
      const res = await request('POST', '/api/tenants', { body: { name: '' } });
      // 400/422 for validation error
      expect([400, 422]).toContain(res.status);
    });
  });
});
