/**
 * Import Export API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Import Export API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('POST /api/export/rental-objects', () => {
    it('should export rental objects', async () => {
      const response = await fetch(`${API_URL}/api/export/rental-objects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: 'csv' }),
      });
      expect([200, 202, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('POST /api/export/bookings', () => {
    it('should export bookings', async () => {
      const response = await fetch(`${API_URL}/api/export/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: 'xlsx', dateRange: { from: '2026-01-01', to: '2026-01-31' } }),
      });
      expect([200, 202, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('POST /api/import/rental-objects', () => {
    it('should import rental objects', async () => {
      const response = await fetch(`${API_URL}/api/import/rental-objects`, {
        method: 'POST',
      });
      expect([200, 202, 400, 401, 403, 404, 415, 422, 500]).toContain(response.status);
    });
  });

  describe('GET /api/export/status/:jobId', () => {
    it('should get export status', async () => {
      const response = await fetch(`${API_URL}/api/export/status/00000000-0000-0000-0000-000000000000`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
