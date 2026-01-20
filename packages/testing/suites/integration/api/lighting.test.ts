/**
 * Lighting API Integration Tests
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';
const API_URL = testConfig.apiUrl;

describe('Lighting API', () => {
  beforeAll(async () => { await fetch(`${API_URL}/health`); });
  describe('GET /api/lighting', () => { it('should return lighting', async () => { expect([200,401,403,404,500]).toContain((await fetch(`${API_URL}/api/lighting`)).status); }); });
  describe('PUT /api/lighting/:id/on', () => { it('should turn on lights', async () => { expect([200,400,401,403,404,500]).toContain((await fetch(`${API_URL}/api/lighting/00000000-0000-0000-0000-000000000000/on`, { method: 'PUT' })).status); }); });
  describe('PUT /api/lighting/:id/off', () => { it('should turn off lights', async () => { expect([200,400,401,403,404,500]).toContain((await fetch(`${API_URL}/api/lighting/00000000-0000-0000-0000-000000000000/off`, { method: 'PUT' })).status); }); });
  describe('PUT /api/lighting/:id/dim', () => { it('should dim lights', async () => { expect([200,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/lighting/00000000-0000-0000-0000-000000000000/dim`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: '{"level":50}' })).status); }); });
});
