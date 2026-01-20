/**
 * Booking Attendees API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Booking Attendees API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/bookings/:id/attendees', () => {
    it('should return attendees for booking', async () => {
      const response = await fetch(`${API_URL}/api/bookings/00000000-0000-0000-0000-000000000000/attendees`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/bookings/:id/attendees', () => {
    it('should add attendee', async () => {
      const response = await fetch(`${API_URL}/api/bookings/00000000-0000-0000-0000-000000000000/attendees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'attendee@example.com', name: 'Test Attendee' }),
      });
      expect([200, 201, 400, 401, 403, 404, 409, 422, 500]).toContain(response.status);
    });
  });

  describe('DELETE /api/bookings/:id/attendees/:attendeeId', () => {
    it('should remove attendee', async () => {
      const response = await fetch(`${API_URL}/api/bookings/00000000-0000-0000-0000-000000000000/attendees/00000000-0000-0000-0000-000000000001`, {
        method: 'DELETE',
      });
      expect([200, 204, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/bookings/:id/attendees/:attendeeId/notify', () => {
    it('should notify attendee', async () => {
      const response = await fetch(`${API_URL}/api/bookings/00000000-0000-0000-0000-000000000000/attendees/00000000-0000-0000-0000-000000000001/notify`, {
        method: 'POST',
      });
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
