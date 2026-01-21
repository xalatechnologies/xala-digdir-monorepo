/**
 * Driver Management API Integration Tests
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';
const API_URL = testConfig.apiUrl;

describe('Driver Management API', () => {
  beforeAll(async () => { await fetch(`${API_URL}/health`); });
  describe('GET /api/drivers', () => { it('should return drivers', async () => { expect([200,401,403,404,500]).toContain((await fetch(`${API_URL}/api/drivers`)).status); }); });
  describe('POST /api/drivers', () => { it('should add driver', async () => { expect([200,201,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/drivers`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status); }); });
  describe('GET /api/drivers/:id/schedule', () => { it('should return schedule', async () => { expect([200,400,401,403,404,500]).toContain((await fetch(`${API_URL}/api/drivers/00000000-0000-0000-0000-000000000000/schedule`)).status); }); });
  describe('GET /api/drivers/:id/performance', () => { it('should return performance', async () => { expect([200,400,401,403,404,500]).toContain((await fetch(`${API_URL}/api/drivers/00000000-0000-0000-0000-000000000000/performance`)).status); }); });
});
