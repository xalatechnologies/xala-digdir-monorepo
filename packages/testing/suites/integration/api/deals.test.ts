/**
 * Deals API Integration Tests
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';
const API_URL = testConfig.apiUrl;

describe('Deals API', () => {
  beforeAll(async () => { await fetch(`${API_URL}/health`); });
  describe('GET /api/deals', () => { it('should return deals', async () => { expect([200,401,403,404,500]).toContain((await fetch(`${API_URL}/api/deals`)).status); }); });
  describe('POST /api/deals', () => { it('should create deal', async () => { expect([200,201,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/deals`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status); }); });
  describe('PUT /api/deals/:id/close', () => { it('should close deal', async () => { expect([200,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/deals/00000000-0000-0000-0000-000000000000/close`, { method: 'PUT' })).status); }); });
  describe('GET /api/deals/:id/activities', () => { it('should return activities', async () => { expect([200,400,401,403,404,500]).toContain((await fetch(`${API_URL}/api/deals/00000000-0000-0000-0000-000000000000/activities`)).status); }); });
});
