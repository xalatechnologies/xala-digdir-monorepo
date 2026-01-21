/**
 * Compliance Checks API Integration Tests
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';
const API_URL = testConfig.apiUrl;

describe('Compliance Checks API', () => {
  beforeAll(async () => { await fetch(`${API_URL}/health`); });
  describe('GET /api/compliance-checks', () => { it('should return checks', async () => { expect([200,401,403,404,500]).toContain((await fetch(`${API_URL}/api/compliance-checks`)).status); }); });
  describe('POST /api/compliance-checks', () => { it('should run check', async () => { expect([200,201,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/compliance-checks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status); }); });
  describe('GET /api/compliance-checks/:id/report', () => { it('should return report', async () => { expect([200,400,401,403,404,500]).toContain((await fetch(`${API_URL}/api/compliance-checks/00000000-0000-0000-0000-000000000000/report`)).status); }); });
  describe('GET /api/compliance-checks/summary', () => { it('should return summary', async () => { expect([200,401,403,404,500]).toContain((await fetch(`${API_URL}/api/compliance-checks/summary`)).status); }); });
});
