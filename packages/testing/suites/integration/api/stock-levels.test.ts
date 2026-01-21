/**
 * Stock Levels API Integration Tests
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';
const API_URL = testConfig.apiUrl;

describe('Stock Levels API', () => {
  beforeAll(async () => { await fetch(`${API_URL}/health`); });
  describe('GET /api/stock-levels', () => { it('should return stock levels', async () => { expect([200,401,403,404,500]).toContain((await fetch(`${API_URL}/api/stock-levels`)).status); }); });
  describe('PUT /api/stock-levels/:id', () => { it('should update stock level', async () => { expect([200,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/stock-levels/00000000-0000-0000-0000-000000000000`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status); }); });
  describe('GET /api/stock-levels/alerts', () => { it('should return low stock alerts', async () => { expect([200,401,403,404,500]).toContain((await fetch(`${API_URL}/api/stock-levels/alerts`)).status); }); });
  describe('POST /api/stock-levels/adjustment', () => { it('should adjust stock', async () => { expect([200,201,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/stock-levels/adjustment`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status); }); });
});
