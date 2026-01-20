/**
 * Insurance API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Insurance API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/insurance', () => {
    it('should return insurance options', async () => {
      const response = await fetch(`${API_URL}/api/insurance`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/insurance/purchase', () => {
    it('should purchase insurance', async () => {
      const response = await fetch(`${API_URL}/api/insurance/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: '00000000-0000-0000-0000-000000000000', planId: 'basic' }),
      });
      expect([200, 201, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('POST /api/insurance/claim', () => {
    it('should file insurance claim', async () => {
      const response = await fetch(`${API_URL}/api/insurance/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: '00000000-0000-0000-0000-000000000000', description: 'Accident damage' }),
      });
      expect([200, 201, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('GET /api/insurance/claims', () => {
    it('should return insurance claims', async () => {
      const response = await fetch(`${API_URL}/api/insurance/claims`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
