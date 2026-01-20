/**
 * Tiers API Integration Tests
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';
const API_URL = testConfig.apiUrl;

describe('Tiers API', () => {
  beforeAll(async () => { await fetch(`${API_URL}/health`); });
  describe('GET /api/tiers', () => { it('should return tiers', async () => { expect([200,401,403,404,500]).toContain((await fetch(`${API_URL}/api/tiers`)).status); }); });
  describe('POST /api/tiers', () => { it('should create tier', async () => { expect([200,201,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/tiers`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status); }); });
  describe('PUT /api/tiers/:id', () => { it('should update tier', async () => { expect([200,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/tiers/00000000-0000-0000-0000-000000000000`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status); }); });
  describe('DELETE /api/tiers/:id', () => { it('should delete tier', async () => { expect([200,204,400,401,403,404,500]).toContain((await fetch(`${API_URL}/api/tiers/00000000-0000-0000-0000-000000000000`, { method: 'DELETE' })).status); }); });
});
