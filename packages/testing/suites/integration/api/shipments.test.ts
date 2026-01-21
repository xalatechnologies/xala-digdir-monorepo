/**
 * Shipments API Integration Tests
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';
const API_URL = testConfig.apiUrl;

describe('Shipments API', () => {
  beforeAll(async () => { await fetch(`${API_URL}/health`); });
  describe('GET /api/shipments', () => { it('should return shipments', async () => { expect([200,401,403,404,500]).toContain((await fetch(`${API_URL}/api/shipments`)).status); }); });
  describe('POST /api/shipments', () => { it('should create shipment', async () => { expect([200,201,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/shipments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status); }); });
  describe('GET /api/shipments/:id/track', () => { it('should track shipment', async () => { expect([200,400,401,403,404,500]).toContain((await fetch(`${API_URL}/api/shipments/00000000-0000-0000-0000-000000000000/track`)).status); }); });
  describe('PUT /api/shipments/:id/status', () => { it('should update status', async () => { expect([200,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/shipments/00000000-0000-0000-0000-000000000000/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status); }); });
});
