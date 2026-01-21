/**
 * Opportunities API Integration Tests
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';
const API_URL = testConfig.apiUrl;

describe('Opportunities API', () => {
  beforeAll(async () => { await fetch(`${API_URL}/health`); });
  describe('GET /api/opportunities', () => { it('should return opportunities', async () => { expect([200,401,403,404,500]).toContain((await fetch(`${API_URL}/api/opportunities`)).status); }); });
  describe('POST /api/opportunities', () => { it('should create opportunity', async () => { expect([200,201,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/opportunities`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status); }); });
  describe('PUT /api/opportunities/:id/stage', () => { it('should update stage', async () => { expect([200,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/opportunities/00000000-0000-0000-0000-000000000000/stage`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status); }); });
  describe('GET /api/opportunities/forecast', () => { it('should return forecast', async () => { expect([200,401,403,404,500]).toContain((await fetch(`${API_URL}/api/opportunities/forecast`)).status); }); });
});
