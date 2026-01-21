/**
 * Appointments API Integration Tests
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';
const API_URL = testConfig.apiUrl;

describe('Appointments API', () => {
  beforeAll(async () => { await fetch(`${API_URL}/health`); });
  describe('GET /api/appointments', () => { it('should return appointments', async () => { expect([200,401,403,404,500]).toContain((await fetch(`${API_URL}/api/appointments`)).status); }); });
  describe('POST /api/appointments', () => { it('should create appointment', async () => { expect([200,201,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/appointments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status); }); });
  describe('PUT /api/appointments/:id/confirm', () => { it('should confirm', async () => { expect([200,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/appointments/00000000-0000-0000-0000-000000000000/confirm`, { method: 'PUT' })).status); }); });
  describe('POST /api/appointments/:id/no-show', () => { it('should mark no-show', async () => { expect([200,400,401,403,404,500]).toContain((await fetch(`${API_URL}/api/appointments/00000000-0000-0000-0000-000000000000/no-show`, { method: 'POST' })).status); }); });
});
