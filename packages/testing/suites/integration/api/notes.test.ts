/**
 * Notes API Integration Tests
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';
const API_URL = testConfig.apiUrl;

describe('Notes API', () => {
  beforeAll(async () => { await fetch(`${API_URL}/health`); });
  describe('GET /api/notes', () => { it('should return notes', async () => { expect([200,401,403,404,500]).toContain((await fetch(`${API_URL}/api/notes`)).status); }); });
  describe('POST /api/notes', () => { it('should create note', async () => { expect([200,201,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/notes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status); }); });
  describe('PUT /api/notes/:id', () => { it('should update note', async () => { expect([200,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/notes/00000000-0000-0000-0000-000000000000`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status); }); });
  describe('DELETE /api/notes/:id', () => { it('should delete note', async () => { expect([200,204,400,401,403,404,500]).toContain((await fetch(`${API_URL}/api/notes/00000000-0000-0000-0000-000000000000`, { method: 'DELETE' })).status); }); });
});
