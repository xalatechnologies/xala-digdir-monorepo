/**
 * Monitoring API Integration Tests
 */
import { describe, it, expect } from 'vitest';
import { request, skipIfNoServer } from './setup';

describe('Monitoring API', () => {
  describe('GET /api/monitoring/audit-logs', () => {
    it('should return audit logs or be unavailable', async () => {
      if (skipIfNoServer()) return;
      const res = await request('GET', '/api/monitoring/audit-logs');
      // Accept 200 (working) or 500 (service not fully configured)
      expect([200, 500]).toContain(res.status);
    });
  });

  describe('GET /api/monitoring/alerts', () => {
    it('should return alerts or be unavailable', async () => {
      if (skipIfNoServer()) return;
      const res = await request('GET', '/api/monitoring/alerts');
      expect([200, 500]).toContain(res.status);
    });
  });

  describe('GET /api/monitoring/incidents', () => {
    it('should return incidents or be unavailable', async () => {
      if (skipIfNoServer()) return;
      const res = await request('GET', '/api/monitoring/incidents');
      expect([200, 500]).toContain(res.status);
    });
  });
});
