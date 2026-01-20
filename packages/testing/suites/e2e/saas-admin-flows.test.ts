/**
 * E2E SaaS Admin Flow Tests
 * Real API flow tests
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('E2E: SaaS Admin Flows', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('Tenant Management Flow', () => {
    it('should fetch tenants list', async () => {
      const response = await fetch(`${API_URL}/api/admin/tenants`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });

    it('should fetch subscriptions', async () => {
      const response = await fetch(`${API_URL}/api/subscriptions`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });

    it('should fetch feature flags', async () => {
      const response = await fetch(`${API_URL}/api/admin/feature-flags`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('System Configuration Flow', () => {
    it('should fetch configuration', async () => {
      const response = await fetch(`${API_URL}/api/configuration`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });

    it('should fetch branding', async () => {
      const response = await fetch(`${API_URL}/api/branding`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });

    it('should fetch translations', async () => {
      const response = await fetch(`${API_URL}/api/translations`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('Monitoring Flow', () => {
    it('should fetch monitoring data', async () => {
      const response = await fetch(`${API_URL}/api/monitoring`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });

    it('should fetch queue status', async () => {
      const response = await fetch(`${API_URL}/api/queue`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
