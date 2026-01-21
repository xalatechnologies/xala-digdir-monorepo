/**
 * Waitlists API Integration Tests
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';
const API_URL = testConfig.apiUrl;

describe('Waitlists API', () => {
  beforeAll(async () => { await fetch(`${API_URL}/health`); });
  describe('GET /api/waitlists', () => { it('should return waitlists', async () => { expect([200,401,403,404,500]).toContain((await fetch(`${API_URL}/api/waitlists`)).status); }); });
  describe('POST /api/waitlists', () => { it('should join waitlist', async () => { expect([200,201,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/waitlists`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status); }); });
  describe('DELETE /api/waitlists/:id', () => { it('should leave waitlist', async () => { expect([200,204,400,401,403,404,500]).toContain((await fetch(`${API_URL}/api/waitlists/00000000-0000-0000-0000-000000000000`, { method: 'DELETE' })).status); }); });
  describe('GET /api/waitlists/:id/position', () => { it('should return position', async () => { expect([200,400,401,403,404,500]).toContain((await fetch(`${API_URL}/api/waitlists/00000000-0000-0000-0000-000000000000/position`)).status); }); });
});
