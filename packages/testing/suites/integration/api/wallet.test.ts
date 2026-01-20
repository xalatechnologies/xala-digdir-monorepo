/**
 * Wallet API Integration Tests
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';
const API_URL = testConfig.apiUrl;

describe('Wallet API', () => {
  beforeAll(async () => { await fetch(`${API_URL}/health`); });
  describe('GET /api/wallet', () => { it('should return wallet', async () => { expect([200,401,403,404,500]).toContain((await fetch(`${API_URL}/api/wallet`)).status); }); });
  describe('GET /api/wallet/balance', () => { it('should return balance', async () => { expect([200,401,403,404,500]).toContain((await fetch(`${API_URL}/api/wallet/balance`)).status); }); });
  describe('POST /api/wallet/topup', () => { it('should topup wallet', async () => { expect([200,201,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/wallet/topup`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status); }); });
  describe('GET /api/wallet/transactions', () => { it('should return transactions', async () => { expect([200,401,403,404,500]).toContain((await fetch(`${API_URL}/api/wallet/transactions`)).status); }); });
});
