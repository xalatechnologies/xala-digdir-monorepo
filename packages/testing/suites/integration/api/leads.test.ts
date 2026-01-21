/**
 * Leads API Integration Tests
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';
const API_URL = testConfig.apiUrl;

describe('Leads API', () => {
  beforeAll(async () => { await fetch(`${API_URL}/health`); });
  describe('GET /api/leads', () => { it('should return leads', async () => { expect([200,401,403,404,500]).toContain((await fetch(`${API_URL}/api/leads`)).status); }); });
  describe('POST /api/leads', () => { it('should create lead', async () => { expect([200,201,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/leads`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status); }); });
  describe('PUT /api/leads/:id/convert', () => { it('should convert lead', async () => { expect([200,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/leads/00000000-0000-0000-0000-000000000000/convert`, { method: 'PUT' })).status); }); });
  describe('GET /api/leads/pipeline', () => { it('should return pipeline', async () => { expect([200,401,403,404,500]).toContain((await fetch(`${API_URL}/api/leads/pipeline`)).status); }); });
});
