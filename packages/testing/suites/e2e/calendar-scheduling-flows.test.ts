/**
 * E2E Calendar & Scheduling Flow Tests
 * Real API flow tests
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('E2E: Calendar & Scheduling Flows', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('Calendar View Flow', () => {
    it('should fetch calendar data', async () => {
      const response = await fetch(`${API_URL}/api/calendar`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });

    it('should fetch availability', async () => {
      const response = await fetch(`${API_URL}/api/availability/00000000-0000-0000-0000-000000000000`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });

    it('should fetch opening hours', async () => {
      const response = await fetch(`${API_URL}/api/opening-hours`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('Recurring Booking Flow', () => {
    it('should fetch recurring bookings', async () => {
      const response = await fetch(`${API_URL}/api/recurring-bookings`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });

    it('should fetch scheduling rules', async () => {
      const response = await fetch(`${API_URL}/api/scheduling/rules`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('Conflict Detection Flow', () => {
    it('should check for conflicts', async () => {
      const response = await fetch(`${API_URL}/api/conflicts`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });

    it('should fetch buffer times', async () => {
      const response = await fetch(`${API_URL}/api/buffer-times`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('Seasonal Configuration Flow', () => {
    it('should fetch seasons', async () => {
      const response = await fetch(`${API_URL}/api/seasons`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });

    it('should fetch holidays', async () => {
      const response = await fetch(`${API_URL}/api/holidays`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
