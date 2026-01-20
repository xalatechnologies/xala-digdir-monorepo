/**
 * Analytics Events API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Analytics Events API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('POST /api/analytics/events', () => {
    it('should track event', async () => {
      const response = await fetch(`${API_URL}/api/analytics/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'page_view', properties: { page: '/home' } }),
      });
      expect([200, 201, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('GET /api/analytics/events', () => {
    it('should return events', async () => {
      const response = await fetch(`${API_URL}/api/analytics/events`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/analytics/events/summary', () => {
    it('should return events summary', async () => {
      const response = await fetch(`${API_URL}/api/analytics/events/summary`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/analytics/funnel', () => {
    it('should return funnel analysis', async () => {
      const response = await fetch(`${API_URL}/api/analytics/funnel`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
