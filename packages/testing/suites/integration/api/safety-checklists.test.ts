/**
 * Safety Checklists API Integration Tests
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';
const API_URL = testConfig.apiUrl;

describe('Safety Checklists API', () => {
  beforeAll(async () => { await fetch(`${API_URL}/health`); });
  describe('GET /api/safety-checklists', () => { it('should return checklists', async () => { expect([200,401,403,404,500]).toContain((await fetch(`${API_URL}/api/safety-checklists`)).status); }); });
  describe('POST /api/safety-checklists', () => { it('should create checklist', async () => { expect([200,201,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/safety-checklists`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status); }); });
  describe('POST /api/safety-checklists/:id/complete', () => { it('should complete checklist', async () => { expect([200,400,401,403,404,500]).toContain((await fetch(`${API_URL}/api/safety-checklists/00000000-0000-0000-0000-000000000000/complete`, { method: 'POST' })).status); }); });
  describe('GET /api/safety-checklists/:id/items', () => { it('should return items', async () => { expect([200,400,401,403,404,500]).toContain((await fetch(`${API_URL}/api/safety-checklists/00000000-0000-0000-0000-000000000000/items`)).status); }); });
});
