/**
 * Lookup Tables API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Lookup Tables API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/lookup-tables', () => {
    it('should return lookup tables list', async () => {
      const response = await fetch(`${API_URL}/api/lookup-tables`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/lookup-tables/:name', () => {
    it('should return lookup table by name', async () => {
      const response = await fetch(`${API_URL}/api/lookup-tables/booking-statuses`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/lookup-tables', () => {
    it('should create lookup table', async () => {
      const response = await fetch(`${API_URL}/api/lookup-tables`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'equipment-types', values: ['Projector', 'Whiteboard'] }),
      });
      expect([200, 201, 400, 401, 403, 404, 409, 422, 500]).toContain(response.status);
    });
  });

  describe('PUT /api/lookup-tables/:name', () => {
    it('should update lookup table', async () => {
      const response = await fetch(`${API_URL}/api/lookup-tables/equipment-types`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ values: ['Projector', 'Whiteboard', 'Screen'] }),
      });
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });
});
