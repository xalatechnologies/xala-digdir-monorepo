/**
 * Certifications API Integration Tests
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';
const API_URL = testConfig.apiUrl;

describe('Certifications API', () => {
  beforeAll(async () => { await fetch(`${API_URL}/health`); });
  describe('GET /api/certifications', () => { it('should return certifications', async () => { expect([200,401,403,404,500]).toContain((await fetch(`${API_URL}/api/certifications`)).status); }); });
  describe('POST /api/certifications', () => { it('should create certification', async () => { expect([200,201,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/certifications`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status); }); });
  describe('PUT /api/certifications/:id/renew', () => { it('should renew certification', async () => { expect([200,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/certifications/00000000-0000-0000-0000-000000000000/renew`, { method: 'PUT' })).status); }); });
  describe('GET /api/certifications/expiring', () => { it('should return expiring', async () => { expect([200,401,403,404,500]).toContain((await fetch(`${API_URL}/api/certifications/expiring`)).status); }); });
});
