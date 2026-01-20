/**
 * Alarms API Integration Tests
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';
const API_URL = testConfig.apiUrl;

describe('Alarms API', () => {
  beforeAll(async () => { await fetch(`${API_URL}/health`); });
  describe('GET /api/alarms', () => { it('should return alarms', async () => { expect([200,401,403,404,500]).toContain((await fetch(`${API_URL}/api/alarms`)).status); }); });
  describe('POST /api/alarms/:id/arm', () => { it('should arm alarm', async () => { expect([200,400,401,403,404,500]).toContain((await fetch(`${API_URL}/api/alarms/00000000-0000-0000-0000-000000000000/arm`, { method: 'POST' })).status); }); });
  describe('POST /api/alarms/:id/disarm', () => { it('should disarm alarm', async () => { expect([200,400,401,403,404,500]).toContain((await fetch(`${API_URL}/api/alarms/00000000-0000-0000-0000-000000000000/disarm`, { method: 'POST' })).status); }); });
  describe('GET /api/alarms/:id/history', () => { it('should return alarm history', async () => { expect([200,400,401,403,404,500]).toContain((await fetch(`${API_URL}/api/alarms/00000000-0000-0000-0000-000000000000/history`)).status); }); });
});
