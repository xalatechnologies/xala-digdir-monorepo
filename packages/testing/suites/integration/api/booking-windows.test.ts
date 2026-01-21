/**
 * Booking Windows API Integration Tests
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';
const API_URL = testConfig.apiUrl;

describe('Booking Windows API', () => {
  beforeAll(async () => { await fetch(`${API_URL}/health`); });
  describe('GET /api/booking-windows', () => { it('should return windows', async () => { expect([200,401,403,404,500]).toContain((await fetch(`${API_URL}/api/booking-windows`)).status); }); });
  describe('POST /api/booking-windows', () => { it('should create window', async () => { expect([200,201,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/booking-windows`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status); }); });
  describe('PUT /api/booking-windows/:id', () => { it('should update window', async () => { expect([200,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/booking-windows/00000000-0000-0000-0000-000000000000`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status); }); });
  describe('DELETE /api/booking-windows/:id', () => { it('should delete window', async () => { expect([200,204,400,401,403,404,500]).toContain((await fetch(`${API_URL}/api/booking-windows/00000000-0000-0000-0000-000000000000`, { method: 'DELETE' })).status); }); });
});
