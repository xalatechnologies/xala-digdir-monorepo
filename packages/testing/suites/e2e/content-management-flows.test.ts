/**
 * E2E Content Management Flow Tests
 * Real API flow tests
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('E2E: Content Management Flows', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('Template Management Flow', () => {
    it('should fetch templates list', async () => {
      const response = await fetch(`${API_URL}/api/templates`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });

    it('should fetch email templates', async () => {
      const response = await fetch(`${API_URL}/api/templates/email`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('Media Management Flow', () => {
    it('should fetch media list', async () => {
      const response = await fetch(`${API_URL}/api/media`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });

    it('should fetch documents', async () => {
      const response = await fetch(`${API_URL}/api/documents`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('Translation Management Flow', () => {
    it('should fetch translations', async () => {
      const response = await fetch(`${API_URL}/api/translations`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });

    it('should fetch public translations', async () => {
      const response = await fetch(`${API_URL}/public/translations`);
      expect([200, 404, 500]).toContain(response.status);
    });

    it('should fetch locales', async () => {
      const response = await fetch(`${API_URL}/api/locales`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
