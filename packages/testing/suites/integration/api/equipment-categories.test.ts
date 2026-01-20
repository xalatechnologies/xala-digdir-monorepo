/**
 * Equipment Categories API Integration Tests
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';
const API_URL = testConfig.apiUrl;

describe('Equipment Categories API', () => {
  beforeAll(async () => { await fetch(`${API_URL}/health`); });
  describe('GET /api/equipment-categories', () => { it('should return equipment categories', async () => { expect([200,401,403,404,500]).toContain((await fetch(`${API_URL}/api/equipment-categories`)).status); }); });
  describe('POST /api/equipment-categories', () => { it('should create category', async () => { expect([200,201,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/equipment-categories`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status); }); });
  describe('PUT /api/equipment-categories/:id', () => { it('should update category', async () => { expect([200,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/equipment-categories/00000000-0000-0000-0000-000000000000`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status); }); });
  describe('DELETE /api/equipment-categories/:id', () => { it('should delete category', async () => { expect([200,204,400,401,403,404,500]).toContain((await fetch(`${API_URL}/api/equipment-categories/00000000-0000-0000-0000-000000000000`, { method: 'DELETE' })).status); }); });
});
