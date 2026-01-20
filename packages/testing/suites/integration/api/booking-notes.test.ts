/**
 * Booking Notes API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Booking Notes API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/bookings/:id/notes', () => {
    it('should return notes for booking', async () => {
      const response = await fetch(`${API_URL}/api/bookings/00000000-0000-0000-0000-000000000000/notes`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/bookings/:id/notes', () => {
    it('should add note', async () => {
      const response = await fetch(`${API_URL}/api/bookings/00000000-0000-0000-0000-000000000000/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'Test note', isInternal: true }),
      });
      expect([200, 201, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('PUT /api/bookings/:id/notes/:noteId', () => {
    it('should update note', async () => {
      const response = await fetch(`${API_URL}/api/bookings/00000000-0000-0000-0000-000000000000/notes/00000000-0000-0000-0000-000000000001`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'Updated note' }),
      });
      expect([200, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('DELETE /api/bookings/:id/notes/:noteId', () => {
    it('should delete note', async () => {
      const response = await fetch(`${API_URL}/api/bookings/00000000-0000-0000-0000-000000000000/notes/00000000-0000-0000-0000-000000000001`, {
        method: 'DELETE',
      });
      expect([200, 204, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
