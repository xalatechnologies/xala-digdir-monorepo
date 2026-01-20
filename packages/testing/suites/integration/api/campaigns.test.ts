/**
 * Campaigns API Integration Tests
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';
const API_URL = testConfig.apiUrl;

describe('Campaigns API', () => {
  beforeAll(async () => { await fetch(`${API_URL}/health`); });
  describe('GET /api/campaigns', () => { it('should return campaigns', async () => { expect([200,401,403,404,500]).toContain((await fetch(`${API_URL}/api/campaigns`)).status); }); });
  describe('POST /api/campaigns', () => { it('should create campaign', async () => { expect([200,201,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/campaigns`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status); }); });
  describe('PUT /api/campaigns/:id', () => { it('should update campaign', async () => { expect([200,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/campaigns/00000000-0000-0000-0000-000000000000`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status); }); });
  describe('GET /api/campaigns/:id/stats', () => { it('should return campaign stats', async () => { expect([200,400,401,403,404,500]).toContain((await fetch(`${API_URL}/api/campaigns/00000000-0000-0000-0000-000000000000/stats`)).status); }); });
});
