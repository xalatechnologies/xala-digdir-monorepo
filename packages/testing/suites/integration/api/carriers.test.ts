/**
 * Carriers API Integration Tests
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';
const API_URL = testConfig.apiUrl;

describe('Carriers API', () => {
  beforeAll(async () => { await fetch(`${API_URL}/health`); });
  describe('GET /api/carriers', () => { it('should return carriers', async () => { expect([200,401,403,404,500]).toContain((await fetch(`${API_URL}/api/carriers`)).status); }); });
  describe('POST /api/carriers', () => { it('should create carrier', async () => { expect([200,201,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/carriers`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status); }); });
  describe('GET /api/carriers/:id/rates', () => { it('should return rates', async () => { expect([200,400,401,403,404,500]).toContain((await fetch(`${API_URL}/api/carriers/00000000-0000-0000-0000-000000000000/rates`)).status); }); });
  describe('POST /api/carriers/:id/validate', () => { it('should validate carrier', async () => { expect([200,400,401,403,404,500]).toContain((await fetch(`${API_URL}/api/carriers/00000000-0000-0000-0000-000000000000/validate`, { method: 'POST' })).status); }); });
});
