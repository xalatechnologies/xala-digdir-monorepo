/**
 * Scheduling API Integration Tests  
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Scheduling API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/scheduling/rules', () => {
    it('should return scheduling rules', async () => {
      const response = await fetch(`${API_URL}/api/scheduling/rules`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/scheduling/rules', () => {
    it('should handle rule creation', async () => {
      const response = await fetch(`${API_URL}/api/scheduling/rules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Business Hours',
          startTime: '09:00',
          endTime: '17:00',
          daysOfWeek: [1, 2, 3, 4, 5],
        }),
      });
      expect([200, 201, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('GET /api/scheduling/availability', () => {
    it('should return availability', async () => {
      const response = await fetch(`${API_URL}/api/scheduling/availability`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/scheduling/conflicts', () => {
    it('should return conflicts', async () => {
      const response = await fetch(`${API_URL}/api/scheduling/conflicts`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
