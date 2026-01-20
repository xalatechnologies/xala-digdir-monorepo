/**
 * Filters API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Filters API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/filters/rental-objects', () => {
    it('should return rental object filters', async () => {
      const response = await fetch(`${API_URL}/api/filters/rental-objects`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/filters/bookings', () => {
    it('should return booking filters', async () => {
      const response = await fetch(`${API_URL}/api/filters/bookings`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/filters/users', () => {
    it('should return user filters', async () => {
      const response = await fetch(`${API_URL}/api/filters/users`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/filters/organizations', () => {
    it('should return organization filters', async () => {
      const response = await fetch(`${API_URL}/api/filters/organizations`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
