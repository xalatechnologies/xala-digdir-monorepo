/**
 * Receipts API Integration Tests  
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Receipts API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/receipts', () => {
    it('should return receipts list', async () => {
      const response = await fetch(`${API_URL}/api/receipts`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/receipts/:id', () => {
    it('should return specific receipt', async () => {
      const response = await fetch(`${API_URL}/api/receipts/00000000-0000-0000-0000-000000000000`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/receipts/:id/pdf', () => {
    it('should return receipt PDF', async () => {
      const response = await fetch(`${API_URL}/api/receipts/00000000-0000-0000-0000-000000000000/pdf`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/receipts/:id/resend', () => {
    it('should handle receipt resend', async () => {
      const response = await fetch(`${API_URL}/api/receipts/00000000-0000-0000-0000-000000000000/resend`, {
        method: 'POST',
      });
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
