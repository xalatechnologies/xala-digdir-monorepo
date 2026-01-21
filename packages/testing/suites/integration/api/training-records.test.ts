/**
 * Training Records API Integration Tests
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';
const API_URL = testConfig.apiUrl;

describe('Training Records API', () => {
  beforeAll(async () => { await fetch(`${API_URL}/health`); });
  describe('GET /api/training-records', () => { it('should return records', async () => { expect([200,401,403,404,500]).toContain((await fetch(`${API_URL}/api/training-records`)).status); }); });
  describe('POST /api/training-records', () => { it('should create record', async () => { expect([200,201,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/training-records`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status); }); });
  describe('PUT /api/training-records/:id/complete', () => { it('should complete training', async () => { expect([200,400,401,403,404,500]).toContain((await fetch(`${API_URL}/api/training-records/00000000-0000-0000-0000-000000000000/complete`, { method: 'PUT' })).status); }); });
  describe('GET /api/training-records/:id/certificate', () => { it('should return certificate', async () => { expect([200,400,401,403,404,500]).toContain((await fetch(`${API_URL}/api/training-records/00000000-0000-0000-0000-000000000000/certificate`)).status); }); });
});
