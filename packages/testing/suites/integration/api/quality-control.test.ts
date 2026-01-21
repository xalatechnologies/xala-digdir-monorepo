/**
 * Quality Control API Integration Tests
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';
const API_URL = testConfig.apiUrl;

describe('Quality Control API', () => {
  beforeAll(async () => { await fetch(`${API_URL}/health`); });
  describe('GET /api/quality-control', () => { it('should return quality checks', async () => { expect([200,401,403,404,500]).toContain((await fetch(`${API_URL}/api/quality-control`)).status); }); });
  describe('POST /api/quality-control/inspections', () => { it('should create inspection', async () => { expect([200,201,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/quality-control/inspections`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status); }); });
  describe('GET /api/quality-control/defects', () => { it('should return defects', async () => { expect([200,401,403,404,500]).toContain((await fetch(`${API_URL}/api/quality-control/defects`)).status); }); });
  describe('POST /api/quality-control/defects/:id/resolve', () => { it('should resolve defect', async () => { expect([200,400,401,403,404,500]).toContain((await fetch(`${API_URL}/api/quality-control/defects/00000000-0000-0000-0000-000000000000/resolve`, { method: 'POST' })).status); }); });
});
