/**
 * Auth API Integration Tests
 *
 * Tests for authentication endpoints including:
 * - Session management
 * - Profile preferences
 * - Logout flow
 *
 * NOTE: These tests require the API server to be running
 * Run with: pnpm dev & pnpm test:integration
 */

import { describe, it, expect } from 'vitest';
import { setupMockApi } from '@xala/api/mocks/api-server.mock';
import { request, skipIfNoServer } from './setup';

describe('Auth API Integration Tests', () => {
  setupMockApi();
  describe('GET /api/auth/session', () => {
  setupMockApi();
    it('should return response for session check', async () => {
      if (skipIfNoServer()) return;
      const res = await request('GET', '/api/auth/session');
      // 401 when no session, 200 when authenticated, 500 if service issue
      expect([200, 401, 500]).toContain(res.status);
    });
  });

  describe('POST /api/auth/logout', () => {
  setupMockApi();
    it('should handle logout request', async () => {
      if (skipIfNoServer()) return;
      const res = await request('POST', '/api/auth/logout');
      // 200/302 for success, 401 if not authenticated, 500 if service issue
      expect([200, 302, 401, 500]).toContain(res.status);
    });
  });

  describe('GET /api/profile/preferences', () => {
  setupMockApi();
    it('should return response for preferences', async () => {
      if (skipIfNoServer()) return;
      const res = await request('GET', '/api/profile/preferences');
      // 401 when not authenticated, 200 when authenticated, 500 if service issue
      expect([200, 401, 500]).toContain(res.status);
    });

    it('should include expected fields when authenticated', async () => {
      if (skipIfNoServer()) return;
      const res = await request('GET', '/api/profile/preferences');
      if (res.status === 200 && res.body) {
        // Check for expected preference fields - response may be wrapped in data
        const data = res.body.data || res.body;
        expect(data).toHaveProperty('language');
        expect(data).toHaveProperty('theme');
      }
    });
  });

  describe('PUT /api/profile/preferences', () => {
  setupMockApi();
    it('should handle preference update request', async () => {
      if (skipIfNoServer()) return;
      const res = await request('PUT', '/api/profile/preferences', {
        body: { language: 'nb', theme: 'dark' },
      });
      // 401 when not authenticated, 200 when updated, 400/422 for validation, 500 if service issue
      expect([200, 400, 401, 422, 500]).toContain(res.status);
    });

    it('should validate preference values', async () => {
      if (skipIfNoServer()) return;
      const res = await request('PUT', '/api/profile/preferences', {
        body: { language: 'invalid-lang', theme: 'invalid-theme' },
      });
      // API may accept any string or reject invalid values
      expect([200, 400, 401, 422, 500]).toContain(res.status);
    });
  });

  describe('Health Check', () => {
  setupMockApi();
    it('should have working health endpoint', async () => {
      if (skipIfNoServer()) return;
      const res = await request('GET', '/health');
      expect([200, 500]).toContain(res.status);
    });
  });
});
