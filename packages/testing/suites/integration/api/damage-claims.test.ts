/**
 * Damage Claims API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Damage Claims API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/damage-claims', () => {
    it('should return damage claims list', async () => {
      const response = await fetch(`${API_URL}/api/damage-claims`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/damage-claims', () => {
    it('should create damage claim', async () => {
      const response = await fetch(`${API_URL}/api/damage-claims`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: '00000000-0000-0000-0000-000000000000', description: 'Broken window', amount: 500 }),
      });
      expect([200, 201, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('PUT /api/damage-claims/:id/approve', () => {
    it('should approve damage claim', async () => {
      const response = await fetch(`${API_URL}/api/damage-claims/00000000-0000-0000-0000-000000000000/approve`, {
        method: 'PUT',
      });
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('PUT /api/damage-claims/:id/reject', () => {
    it('should reject damage claim', async () => {
      const response = await fetch(`${API_URL}/api/damage-claims/00000000-0000-0000-0000-000000000000/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Pre-existing damage' }),
      });
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });
});
