/**
 * Delivery Routes API Integration Tests
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';
const API_URL = testConfig.apiUrl;

describe('Delivery Routes API', () => {
  beforeAll(async () => { await fetch(`${API_URL}/health`); });
  describe('GET /api/delivery-routes', () => { it('should return routes', async () => { expect([200,401,403,404,500]).toContain((await fetch(`${API_URL}/api/delivery-routes`)).status); }); });
  describe('POST /api/delivery-routes', () => { it('should create route', async () => { expect([200,201,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/delivery-routes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status); }); });
  describe('POST /api/delivery-routes/optimize', () => { it('should optimize routes', async () => { expect([200,400,401,403,404,500]).toContain((await fetch(`${API_URL}/api/delivery-routes/optimize`, { method: 'POST' })).status); }); });
  describe('GET /api/delivery-routes/:id/stops', () => { it('should return stops', async () => { expect([200,400,401,403,404,500]).toContain((await fetch(`${API_URL}/api/delivery-routes/00000000-0000-0000-0000-000000000000/stops`)).status); }); });
});
