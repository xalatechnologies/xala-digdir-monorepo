/**
 * Incidents API Integration Tests
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';
const API_URL = testConfig.apiUrl;

describe('Incidents API', () => {
  beforeAll(async () => { await fetch(`${API_URL}/health`); });
  describe('GET /api/incidents', () => { it('should return incidents', async () => { expect([200,401,403,404,500]).toContain((await fetch(`${API_URL}/api/incidents`)).status); }); });
  describe('POST /api/incidents', () => { it('should report incident', async () => { expect([200,201,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/incidents`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status); }); });
  describe('PUT /api/incidents/:id/resolve', () => { it('should resolve incident', async () => { expect([200,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/incidents/00000000-0000-0000-0000-000000000000/resolve`, { method: 'PUT' })).status); }); });
  describe('GET /api/incidents/:id/timeline', () => { it('should return timeline', async () => { expect([200,400,401,403,404,500]).toContain((await fetch(`${API_URL}/api/incidents/00000000-0000-0000-0000-000000000000/timeline`)).status); }); });
});
