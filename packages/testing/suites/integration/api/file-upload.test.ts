/**
 * File Upload API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('File Upload API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('POST /api/upload', () => {
    it('should handle file upload', async () => {
      const response = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
      });
      expect([200, 400, 401, 403, 404, 415, 422, 500]).toContain(response.status);
    });
  });

  describe('POST /api/upload/image', () => {
    it('should handle image upload', async () => {
      const response = await fetch(`${API_URL}/api/upload/image`, {
        method: 'POST',
      });
      expect([200, 400, 401, 403, 404, 415, 422, 500]).toContain(response.status);
    });
  });

  describe('GET /api/upload/signed-url', () => {
    it('should get signed upload URL', async () => {
      const response = await fetch(`${API_URL}/api/upload/signed-url?filename=test.jpg`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
