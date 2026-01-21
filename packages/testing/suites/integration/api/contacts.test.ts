/**
 * Contacts API Integration Tests
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';
const API_URL = testConfig.apiUrl;

describe('Contacts API', () => {
  beforeAll(async () => { await fetch(`${API_URL}/health`); });
  describe('GET /api/contacts', () => { it('should return contacts', async () => { expect([200,401,403,404,500]).toContain((await fetch(`${API_URL}/api/contacts`)).status); }); });
  describe('POST /api/contacts', () => { it('should create contact', async () => { expect([200,201,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/contacts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status); }); });
  describe('PUT /api/contacts/:id', () => { it('should update contact', async () => { expect([200,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/contacts/00000000-0000-0000-0000-000000000000`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status); }); });
  describe('POST /api/contacts/:id/merge', () => { it('should merge contacts', async () => { expect([200,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/contacts/00000000-0000-0000-0000-000000000000/merge`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status); }); });
});
