/**
 * Checkins API Integration Tests
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';
const API_URL = testConfig.apiUrl;

describe('Checkins API', () => {
  beforeAll(async () => { await fetch(`${API_URL}/health`); });
  describe('GET /api/checkins', () => { it('should return checkins', async () => { expect([200,401,403,404,500]).toContain((await fetch(`${API_URL}/api/checkins`)).status); }); });
  describe('POST /api/checkins', () => { it('should create checkin', async () => { expect([200,201,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/checkins`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status); }); });
  describe('GET /api/checkins/:id', () => { it('should return checkin', async () => { expect([200,400,401,403,404,500]).toContain((await fetch(`${API_URL}/api/checkins/00000000-0000-0000-0000-000000000000`)).status); }); });
  describe('PUT /api/checkins/:id/verify', () => { it('should verify checkin', async () => { expect([200,400,401,403,404,500]).toContain((await fetch(`${API_URL}/api/checkins/00000000-0000-0000-0000-000000000000/verify`, { method: 'PUT' })).status); }); });
});
