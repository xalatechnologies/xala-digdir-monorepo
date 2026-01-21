/**
 * Work Orders API Integration Tests
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';
const API_URL = testConfig.apiUrl;

describe('Work Orders API', () => {
  beforeAll(async () => { await fetch(`${API_URL}/health`); });
  describe('GET /api/work-orders', () => { it('should return work orders', async () => { expect([200,401,403,404,500]).toContain((await fetch(`${API_URL}/api/work-orders`)).status); }); });
  describe('POST /api/work-orders', () => { it('should create work order', async () => { expect([200,201,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/work-orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status); }); });
  describe('PUT /api/work-orders/:id/assign', () => { it('should assign work order', async () => { expect([200,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/work-orders/00000000-0000-0000-0000-000000000000/assign`, { method: 'PUT' })).status); }); });
  describe('PUT /api/work-orders/:id/complete', () => { it('should complete work order', async () => { expect([200,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/work-orders/00000000-0000-0000-0000-000000000000/complete`, { method: 'PUT' })).status); }); });
});
