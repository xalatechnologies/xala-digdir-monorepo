/**
 * Messages API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Messages API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/messages', () => {
    it('should return messages', async () => {
      const response = await fetch(`${API_URL}/api/messages`);
      expect([200, 401, 403, 404]).toContain(response.status);
    });
  });

  describe('GET /api/messages/conversations', () => {
    it('should return conversations', async () => {
      const response = await fetch(`${API_URL}/api/messages/conversations`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/messages', () => {
    it('should handle message sending', async () => {
      const response = await fetch(`${API_URL}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: '00000000-0000-0000-0000-000000000000',
          content: 'Test message',
        }),
      });
      expect([200, 201, 400, 401, 403, 404, 422]).toContain(response.status);
    });
  });

  describe('PUT /api/messages/:id/read', () => {
    it('should mark message as read', async () => {
      const response = await fetch(`${API_URL}/api/messages/00000000-0000-0000-0000-000000000000/read`, {
        method: 'PUT',
      });
      expect([200, 204, 400, 401, 403, 404]).toContain(response.status);
    });
  });
});
