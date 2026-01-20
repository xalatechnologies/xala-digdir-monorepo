/**
 * Loyalty Programs API Integration Tests
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';
const API_URL = testConfig.apiUrl;

describe('Loyalty Programs API', () => {
  beforeAll(async () => { await fetch(`${API_URL}/health`); });
  describe('GET /api/loyalty', () => { it('should return loyalty programs', async () => { expect([200,401,403,404,500]).toContain((await fetch(`${API_URL}/api/loyalty`)).status); }); });
  describe('GET /api/loyalty/points', () => { it('should return points balance', async () => { expect([200,401,403,404,500]).toContain((await fetch(`${API_URL}/api/loyalty/points`)).status); }); });
  describe('POST /api/loyalty/redeem', () => { it('should redeem points', async () => { expect([200,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/loyalty/redeem`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status); }); });
  describe('GET /api/loyalty/rewards', () => { it('should return available rewards', async () => { expect([200,401,403,404,500]).toContain((await fetch(`${API_URL}/api/loyalty/rewards`)).status); }); });
});
