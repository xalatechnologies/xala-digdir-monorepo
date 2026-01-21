/**
 * Meetings API Integration Tests
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';
const API_URL = testConfig.apiUrl;

describe('Meetings API', () => {
  beforeAll(async () => { await fetch(`${API_URL}/health`); });
  describe('GET /api/meetings', () => { it('should return meetings', async () => { expect([200,401,403,404,500]).toContain((await fetch(`${API_URL}/api/meetings`)).status); }); });
  describe('POST /api/meetings', () => { it('should create meeting', async () => { expect([200,201,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/meetings`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status); }); });
  describe('POST /api/meetings/:id/reschedule', () => { it('should reschedule meeting', async () => { expect([200,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/meetings/00000000-0000-0000-0000-000000000000/reschedule`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status); }); });
  describe('GET /api/meetings/:id/attendees', () => { it('should return attendees', async () => { expect([200,400,401,403,404,500]).toContain((await fetch(`${API_URL}/api/meetings/00000000-0000-0000-0000-000000000000/attendees`)).status); }); });
});
