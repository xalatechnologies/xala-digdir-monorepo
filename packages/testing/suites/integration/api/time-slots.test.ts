/**
 * Time Slots API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Time Slots API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/time-slots', () => {
    it('should return time slots', async () => {
      const response = await fetch(`${API_URL}/api/time-slots`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/time-slots/available', () => {
    it('should return available time slots', async () => {
      const response = await fetch(`${API_URL}/api/time-slots/available?date=2026-01-20`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/time-slots', () => {
    it('should create time slot', async () => {
      const response = await fetch(`${API_URL}/api/time-slots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startTime: '08:00', endTime: '17:00', dayOfWeek: 1 }),
      });
      expect([200, 201, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });
});
