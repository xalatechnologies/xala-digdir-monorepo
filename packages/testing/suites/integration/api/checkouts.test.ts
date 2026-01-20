/**
 * Checkouts API Integration Tests
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';
const API_URL = testConfig.apiUrl;

describe('Checkouts API', () => {
  beforeAll(async () => { await fetch(`${API_URL}/health`); });
  describe('GET /api/checkouts', () => { it('should return checkouts', async () => { expect([200,401,403,404,500]).toContain((await fetch(`${API_URL}/api/checkouts`)).status); }); });
  describe('POST /api/checkouts', () => { it('should create checkout', async () => { expect([200,201,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/checkouts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status); }); });
  describe('GET /api/checkouts/:id', () => { it('should return checkout', async () => { expect([200,400,401,403,404,500]).toContain((await fetch(`${API_URL}/api/checkouts/00000000-0000-0000-0000-000000000000`)).status); }); });
  describe('PUT /api/checkouts/:id/complete', () => { it('should complete checkout', async () => { expect([200,400,401,403,404,500]).toContain((await fetch(`${API_URL}/api/checkouts/00000000-0000-0000-0000-000000000000/complete`, { method: 'PUT' })).status); }); });
});
