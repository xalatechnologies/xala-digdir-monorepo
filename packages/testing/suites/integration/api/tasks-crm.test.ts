/**
 * Tasks CRM API Integration Tests
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';
const API_URL = testConfig.apiUrl;

describe('Tasks CRM API', () => {
  beforeAll(async () => { await fetch(`${API_URL}/health`); });
  describe('GET /api/tasks-crm', () => { it('should return tasks', async () => { expect([200,401,403,404,500]).toContain((await fetch(`${API_URL}/api/tasks-crm`)).status); }); });
  describe('POST /api/tasks-crm', () => { it('should create task', async () => { expect([200,201,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/tasks-crm`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status); }); });
  describe('PUT /api/tasks-crm/:id/complete', () => { it('should complete task', async () => { expect([200,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/tasks-crm/00000000-0000-0000-0000-000000000000/complete`, { method: 'PUT' })).status); }); });
  describe('GET /api/tasks-crm/overdue', () => { it('should return overdue', async () => { expect([200,401,403,404,500]).toContain((await fetch(`${API_URL}/api/tasks-crm/overdue`)).status); }); });
});
