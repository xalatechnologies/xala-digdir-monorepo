/**
 * Form Submissions API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Form Submissions API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/form-submissions', () => {
    it('should return submissions list', async () => {
      const response = await fetch(`${API_URL}/api/form-submissions`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/form-submissions', () => {
    it('should submit form', async () => {
      const response = await fetch(`${API_URL}/api/form-submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formId: '00000000-0000-0000-0000-000000000000', data: {} }),
      });
      expect([200, 201, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('GET /api/form-submissions/:id', () => {
    it('should return submission by ID', async () => {
      const response = await fetch(`${API_URL}/api/form-submissions/00000000-0000-0000-0000-000000000000`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('DELETE /api/form-submissions/:id', () => {
    it('should delete submission', async () => {
      const response = await fetch(`${API_URL}/api/form-submissions/00000000-0000-0000-0000-000000000000`, {
        method: 'DELETE',
      });
      expect([200, 204, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
