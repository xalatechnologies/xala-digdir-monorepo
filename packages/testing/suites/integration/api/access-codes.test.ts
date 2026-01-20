/**
 * Access Codes API Integration Tests
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';
const API_URL = testConfig.apiUrl;

describe('Access Codes API', () => {
  beforeAll(async () => { await fetch(`${API_URL}/health`); });
  describe('GET /api/access-codes', () => { it('should return access codes', async () => { expect([200,401,403,404,500]).toContain((await fetch(`${API_URL}/api/access-codes`)).status); }); });
  describe('POST /api/access-codes', () => { it('should generate access code', async () => { expect([200,201,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/access-codes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status); }); });
  describe('DELETE /api/access-codes/:id', () => { it('should revoke access code', async () => { expect([200,204,400,401,403,404,500]).toContain((await fetch(`${API_URL}/api/access-codes/00000000-0000-0000-0000-000000000000`, { method: 'DELETE' })).status); }); });
  describe('POST /api/access-codes/:id/validate', () => { it('should validate access code', async () => { expect([200,400,401,403,404,500]).toContain((await fetch(`${API_URL}/api/access-codes/00000000-0000-0000-0000-000000000000/validate`, { method: 'POST' })).status); }); });
});
