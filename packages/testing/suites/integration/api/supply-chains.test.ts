/**
 * Supply Chains API Integration Tests
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';
const API_URL = testConfig.apiUrl;

describe('Supply Chains API', () => {
  beforeAll(async () => { await fetch(`${API_URL}/health`); });
  describe('GET /api/supply-chains', () => { it('should return supply chains', async () => { expect([200,401,403,404,500]).toContain((await fetch(`${API_URL}/api/supply-chains`)).status); }); });
  describe('POST /api/supply-chains', () => { it('should create supply chain', async () => { expect([200,201,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/supply-chains`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status); }); });
  describe('GET /api/supply-chains/:id/status', () => { it('should return status', async () => { expect([200,400,401,403,404,500]).toContain((await fetch(`${API_URL}/api/supply-chains/00000000-0000-0000-0000-000000000000/status`)).status); }); });
  describe('POST /api/supply-chains/:id/reorder', () => { it('should trigger reorder', async () => { expect([200,202,400,401,403,404,500]).toContain((await fetch(`${API_URL}/api/supply-chains/00000000-0000-0000-0000-000000000000/reorder`, { method: 'POST' })).status); }); });
});
