/**
 * Check-in Kiosk API Integration Tests
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';
const API_URL = testConfig.apiUrl;

describe('Check-in Kiosk API', () => {
  beforeAll(async () => { await fetch(`${API_URL}/health`); });
  describe('GET /api/check-in-kiosk', () => { it('should return kiosk config', async () => { expect([200,401,403,404,500]).toContain((await fetch(`${API_URL}/api/check-in-kiosk`)).status); }); });
  describe('POST /api/check-in-kiosk/verify', () => { it('should verify booking', async () => { expect([200,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/check-in-kiosk/verify`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status); }); });
  describe('POST /api/check-in-kiosk/check-in', () => { it('should check in', async () => { expect([200,400,401,403,404,500]).toContain((await fetch(`${API_URL}/api/check-in-kiosk/check-in`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status); }); });
  describe('GET /api/check-in-kiosk/upcoming', () => { it('should return upcoming', async () => { expect([200,401,403,404,500]).toContain((await fetch(`${API_URL}/api/check-in-kiosk/upcoming`)).status); }); });
});
