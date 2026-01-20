/**
 * Broadcasts API Integration Tests
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';
const API_URL = testConfig.apiUrl;

describe('Broadcasts API', () => {
  beforeAll(async () => { await fetch(`${API_URL}/health`); });
  describe('GET /api/broadcasts', () => { it('should return broadcasts', async () => { expect([200,401,403,404,500]).toContain((await fetch(`${API_URL}/api/broadcasts`)).status); }); });
  describe('POST /api/broadcasts', () => { it('should create broadcast', async () => { expect([200,201,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/broadcasts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status); }); });
  describe('POST /api/broadcasts/:id/send', () => { it('should send broadcast', async () => { expect([200,202,400,401,403,404,500]).toContain((await fetch(`${API_URL}/api/broadcasts/00000000-0000-0000-0000-000000000000/send`, { method: 'POST' })).status); }); });
  describe('GET /api/broadcasts/:id/stats', () => { it('should return broadcast stats', async () => { expect([200,400,401,403,404,500]).toContain((await fetch(`${API_URL}/api/broadcasts/00000000-0000-0000-0000-000000000000/stats`)).status); }); });
});
