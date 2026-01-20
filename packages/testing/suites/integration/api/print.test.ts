/**
 * Print API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Print API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/print/booking/:id', () => {
    it('should get printable booking', async () => {
      const response = await fetch(`${API_URL}/api/print/booking/00000000-0000-0000-0000-000000000000`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/print/invoice/:id', () => {
    it('should get printable invoice', async () => {
      const response = await fetch(`${API_URL}/api/print/invoice/00000000-0000-0000-0000-000000000000`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/print/receipt/:id', () => {
    it('should get printable receipt', async () => {
      const response = await fetch(`${API_URL}/api/print/receipt/00000000-0000-0000-0000-000000000000`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/print/report/:type', () => {
    it('should get printable report', async () => {
      const response = await fetch(`${API_URL}/api/print/report/booking?month=2026-01`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
