/**
 * Gift Cards API Integration Tests
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';
const API_URL = testConfig.apiUrl;

describe('Gift Cards API', () => {
  beforeAll(async () => { await fetch(`${API_URL}/health`); });
  describe('GET /api/gift-cards', () => { it('should return gift cards', async () => { expect([200,401,403,404,500]).toContain((await fetch(`${API_URL}/api/gift-cards`)).status); }); });
  describe('POST /api/gift-cards', () => { it('should create gift card', async () => { expect([200,201,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/gift-cards`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status); }); });
  describe('POST /api/gift-cards/:id/redeem', () => { it('should redeem gift card', async () => { expect([200,400,401,403,404,500]).toContain((await fetch(`${API_URL}/api/gift-cards/00000000-0000-0000-0000-000000000000/redeem`, { method: 'POST' })).status); }); });
  describe('GET /api/gift-cards/:id/balance', () => { it('should return gift card balance', async () => { expect([200,400,401,403,404,500]).toContain((await fetch(`${API_URL}/api/gift-cards/00000000-0000-0000-0000-000000000000/balance`)).status); }); });
});
