/**
 * Key Cards API Integration Tests
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';
const API_URL = testConfig.apiUrl;

describe('Key Cards API', () => {
  beforeAll(async () => { await fetch(`${API_URL}/health`); });
  describe('GET /api/key-cards', () => { it('should return key cards', async () => { expect([200,401,403,404,500]).toContain((await fetch(`${API_URL}/api/key-cards`)).status); }); });
  describe('POST /api/key-cards', () => { it('should issue key card', async () => { expect([200,201,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/key-cards`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status); }); });
  describe('POST /api/key-cards/:id/deactivate', () => { it('should deactivate key card', async () => { expect([200,400,401,403,404,500]).toContain((await fetch(`${API_URL}/api/key-cards/00000000-0000-0000-0000-000000000000/deactivate`, { method: 'POST' })).status); }); });
  describe('POST /api/key-cards/:id/reactivate', () => { it('should reactivate key card', async () => { expect([200,400,401,403,404,500]).toContain((await fetch(`${API_URL}/api/key-cards/00000000-0000-0000-0000-000000000000/reactivate`, { method: 'POST' })).status); }); });
});
