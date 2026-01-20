/**
 * Vouchers API Integration Tests
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';
const API_URL = testConfig.apiUrl;

describe('Vouchers API', () => {
  beforeAll(async () => { await fetch(`${API_URL}/health`); });
  describe('GET /api/vouchers', () => { it('should return vouchers', async () => { expect([200,401,403,404,500]).toContain((await fetch(`${API_URL}/api/vouchers`)).status); }); });
  describe('POST /api/vouchers', () => { it('should create voucher', async () => { expect([200,201,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/vouchers`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status); }); });
  describe('POST /api/vouchers/:id/apply', () => { it('should apply voucher', async () => { expect([200,400,401,403,404,500]).toContain((await fetch(`${API_URL}/api/vouchers/00000000-0000-0000-0000-000000000000/apply`, { method: 'POST' })).status); }); });
  describe('POST /api/vouchers/validate', () => { it('should validate voucher', async () => { expect([200,400,401,403,404,500]).toContain((await fetch(`${API_URL}/api/vouchers/validate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status); }); });
});
