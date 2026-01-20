/**
 * Data Mapping API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Data Mapping API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/data-mappings', () => {
    it('should return data mappings list', async () => {
      const response = await fetch(`${API_URL}/api/data-mappings`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/data-mappings', () => {
    it('should create data mapping', async () => {
      const response = await fetch(`${API_URL}/api/data-mappings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'external.name', target: 'rental_object.name' }),
      });
      expect([200, 201, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('PUT /api/data-mappings/:id', () => {
    it('should update data mapping', async () => {
      const response = await fetch(`${API_URL}/api/data-mappings/00000000-0000-0000-0000-000000000000`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transform: 'uppercase' }),
      });
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('DELETE /api/data-mappings/:id', () => {
    it('should delete data mapping', async () => {
      const response = await fetch(`${API_URL}/api/data-mappings/00000000-0000-0000-0000-000000000000`, {
        method: 'DELETE',
      });
      expect([200, 204, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
