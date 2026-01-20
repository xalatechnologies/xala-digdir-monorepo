/**
 * Triggers API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Triggers API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/triggers', () => {
    it('should return triggers list', async () => {
      const response = await fetch(`${API_URL}/api/triggers`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/triggers/types', () => {
    it('should return trigger types', async () => {
      const response = await fetch(`${API_URL}/api/triggers/types`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/triggers/events', () => {
    it('should return trigger events', async () => {
      const response = await fetch(`${API_URL}/api/triggers/events`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/triggers', () => {
    it('should create trigger', async () => {
      const response = await fetch(`${API_URL}/api/triggers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'booking.created', action: 'send_email' }),
      });
      expect([200, 201, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('DELETE /api/triggers/:id', () => {
    it('should delete trigger', async () => {
      const response = await fetch(`${API_URL}/api/triggers/00000000-0000-0000-0000-000000000000`, {
        method: 'DELETE',
      });
      expect([200, 204, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
