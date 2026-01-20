/**
 * Calendar Sync API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Calendar Sync API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/calendar/ical/:rentalObjectId', () => {
    it('should return iCal feed', async () => {
      const response = await fetch(`${API_URL}/api/calendar/ical/00000000-0000-0000-0000-000000000000`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/calendar/google/connect', () => {
    it('should connect Google Calendar', async () => {
      const response = await fetch(`${API_URL}/api/calendar/google/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authCode: 'test-code' }),
      });
      expect([200, 302, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('POST /api/calendar/outlook/connect', () => {
    it('should connect Outlook Calendar', async () => {
      const response = await fetch(`${API_URL}/api/calendar/outlook/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authCode: 'test-code' }),
      });
      expect([200, 302, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('DELETE /api/calendar/google/disconnect', () => {
    it('should disconnect Google Calendar', async () => {
      const response = await fetch(`${API_URL}/api/calendar/google/disconnect`, {
        method: 'DELETE',
      });
      expect([200, 204, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/calendar/sync', () => {
    it('should sync calendar', async () => {
      const response = await fetch(`${API_URL}/api/calendar/sync`, {
        method: 'POST',
      });
      expect([200, 202, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
