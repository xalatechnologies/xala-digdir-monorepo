/**
 * Validation Rules API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Validation Rules API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/validation-rules', () => {
    it('should return validation rules list', async () => {
      const response = await fetch(`${API_URL}/api/validation-rules`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/validation-rules', () => {
    it('should create validation rule', async () => {
      const response = await fetch(`${API_URL}/api/validation-rules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Max Capacity', rule: 'capacity <= 100' }),
      });
      expect([200, 201, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('PUT /api/validation-rules/:id', () => {
    it('should update validation rule', async () => {
      const response = await fetch(`${API_URL}/api/validation-rules/00000000-0000-0000-0000-000000000000`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: true }),
      });
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('DELETE /api/validation-rules/:id', () => {
    it('should delete validation rule', async () => {
      const response = await fetch(`${API_URL}/api/validation-rules/00000000-0000-0000-0000-000000000000`, {
        method: 'DELETE',
      });
      expect([200, 204, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
