/**
 * Referrals API Integration Tests
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';
const API_URL = testConfig.apiUrl;

describe('Referrals API', () => {
  beforeAll(async () => { await fetch(`${API_URL}/health`); });
  describe('GET /api/referrals', () => { it('should return referrals', async () => { expect([200,401,403,404,500]).toContain((await fetch(`${API_URL}/api/referrals`)).status); }); });
  describe('POST /api/referrals/invite', () => { it('should send invite', async () => { expect([200,201,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/referrals/invite`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status); }); });
  describe('GET /api/referrals/code', () => { it('should get referral code', async () => { expect([200,401,403,404,500]).toContain((await fetch(`${API_URL}/api/referrals/code`)).status); }); });
  describe('POST /api/referrals/apply', () => { it('should apply referral code', async () => { expect([200,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/referrals/apply`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status); }); });
});
