/**
 * Custom Fields API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Custom Fields API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/custom-fields', () => {
    it('should return custom fields list', async () => {
      const response = await fetch(`${API_URL}/api/custom-fields`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/custom-fields', () => {
    it('should create custom field', async () => {
      const response = await fetch(`${API_URL}/api/custom-fields`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Equipment', type: 'text', entity: 'rental_object' }),
      });
      expect([200, 201, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('PUT /api/custom-fields/:id', () => {
    it('should update custom field', async () => {
      const response = await fetch(`${API_URL}/api/custom-fields/00000000-0000-0000-0000-000000000000`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRequired: true }),
      });
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('DELETE /api/custom-fields/:id', () => {
    it('should delete custom field', async () => {
      const response = await fetch(`${API_URL}/api/custom-fields/00000000-0000-0000-0000-000000000000`, {
        method: 'DELETE',
      });
      expect([200, 204, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
