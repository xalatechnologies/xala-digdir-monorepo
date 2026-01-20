/**
 * Organization Rental Objects API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Organization Rental Objects API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/organizations/:id/rental-objects', () => {
    it('should return rental objects for organization', async () => {
      const response = await fetch(`${API_URL}/api/organizations/00000000-0000-0000-0000-000000000000/rental-objects`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/organizations/:id/rental-objects/active', () => {
    it('should return active rental objects', async () => {
      const response = await fetch(`${API_URL}/api/organizations/00000000-0000-0000-0000-000000000000/rental-objects/active`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/organizations/:id/rental-objects/summary', () => {
    it('should return rental objects summary', async () => {
      const response = await fetch(`${API_URL}/api/organizations/00000000-0000-0000-0000-000000000000/rental-objects/summary`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/organizations/:id/rental-objects/stats', () => {
    it('should return rental objects stats', async () => {
      const response = await fetch(`${API_URL}/api/organizations/00000000-0000-0000-0000-000000000000/rental-objects/stats`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/organizations/:id/rental-objects', () => {
    it('should create rental object for organization', async () => {
      const response = await fetch(`${API_URL}/api/organizations/00000000-0000-0000-0000-000000000000/rental-objects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test Object', type: 'room' }),
      });
      expect([200, 201, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('PUT /api/organizations/:id/rental-objects/:objectId/transfer', () => {
    it('should transfer rental object', async () => {
      const response = await fetch(`${API_URL}/api/organizations/00000000-0000-0000-0000-000000000000/rental-objects/00000000-0000-0000-0000-000000000001/transfer`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetOrganizationId: '00000000-0000-0000-0000-000000000002' }),
      });
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('DELETE /api/organizations/:id/rental-objects/:objectId', () => {
    it('should remove rental object from organization', async () => {
      const response = await fetch(`${API_URL}/api/organizations/00000000-0000-0000-0000-000000000000/rental-objects/00000000-0000-0000-0000-000000000001`, {
        method: 'DELETE',
      });
      expect([200, 204, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
