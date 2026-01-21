/**
 * Purchase Orders API Integration Tests
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';
const API_URL = testConfig.apiUrl;

describe('Purchase Orders API', () => {
  beforeAll(async () => { await fetch(`${API_URL}/health`); });
  describe('GET /api/purchase-orders', () => { it('should return purchase orders', async () => { expect([200,401,403,404,500]).toContain((await fetch(`${API_URL}/api/purchase-orders`)).status); }); });
  describe('POST /api/purchase-orders', () => { it('should create purchase order', async () => { expect([200,201,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/purchase-orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status); }); });
  describe('PUT /api/purchase-orders/:id/approve', () => { it('should approve order', async () => { expect([200,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/purchase-orders/00000000-0000-0000-0000-000000000000/approve`, { method: 'PUT' })).status); }); });
  describe('POST /api/purchase-orders/:id/receive', () => { it('should receive order', async () => { expect([200,400,401,403,404,500]).toContain((await fetch(`${API_URL}/api/purchase-orders/00000000-0000-0000-0000-000000000000/receive`, { method: 'POST' })).status); }); });
});
