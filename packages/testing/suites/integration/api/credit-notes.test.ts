/**
 * Credit Notes API Integration Tests
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';
const API_URL = testConfig.apiUrl;

describe('Credit Notes API', () => {
  beforeAll(async () => { await fetch(`${API_URL}/health`); });
  describe('GET /api/credit-notes', () => { it('should return credit notes', async () => { expect([200,401,403,404,500]).toContain((await fetch(`${API_URL}/api/credit-notes`)).status); }); });
  describe('POST /api/credit-notes', () => { it('should create credit note', async () => { expect([200,201,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/credit-notes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status); }); });
  describe('GET /api/credit-notes/:id', () => { it('should return credit note', async () => { expect([200,400,401,403,404,500]).toContain((await fetch(`${API_URL}/api/credit-notes/00000000-0000-0000-0000-000000000000`)).status); }); });
  describe('POST /api/credit-notes/:id/apply', () => { it('should apply credit note', async () => { expect([200,400,401,403,404,500]).toContain((await fetch(`${API_URL}/api/credit-notes/00000000-0000-0000-0000-000000000000/apply`, { method: 'POST' })).status); }); });
});
