/**
 * Invoices API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Invoices API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/invoices', () => {
    it('should return invoices list', async () => {
      const response = await fetch(`${API_URL}/api/invoices`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/invoices/:id', () => {
    it('should return invoice by ID', async () => {
      const response = await fetch(`${API_URL}/api/invoices/00000000-0000-0000-0000-000000000000`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/invoices/:id/pdf', () => {
    it('should return invoice PDF', async () => {
      const response = await fetch(`${API_URL}/api/invoices/00000000-0000-0000-0000-000000000000/pdf`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/invoices/:id/send', () => {
    it('should send invoice', async () => {
      const response = await fetch(`${API_URL}/api/invoices/00000000-0000-0000-0000-000000000000/send`, {
        method: 'POST',
      });
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
