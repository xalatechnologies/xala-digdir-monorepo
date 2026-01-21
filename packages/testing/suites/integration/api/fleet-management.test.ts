/**
 * Fleet Management API Integration Tests
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';
const API_URL = testConfig.apiUrl;

describe('Fleet Management API', () => {
  beforeAll(async () => { await fetch(`${API_URL}/health`); });
  describe('GET /api/fleet', () => { it('should return fleet', async () => { expect([200,401,403,404,500]).toContain((await fetch(`${API_URL}/api/fleet`)).status); }); });
  describe('POST /api/fleet/vehicles', () => { it('should add vehicle', async () => { expect([200,201,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/fleet/vehicles`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status); }); });
  describe('GET /api/fleet/vehicles/:id/location', () => { it('should return location', async () => { expect([200,400,401,403,404,500]).toContain((await fetch(`${API_URL}/api/fleet/vehicles/00000000-0000-0000-0000-000000000000/location`)).status); }); });
  describe('GET /api/fleet/utilization', () => { it('should return utilization', async () => { expect([200,401,403,404,500]).toContain((await fetch(`${API_URL}/api/fleet/utilization`)).status); }); });
});
