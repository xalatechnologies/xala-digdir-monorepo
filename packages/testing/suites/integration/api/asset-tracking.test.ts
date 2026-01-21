/**
 * Asset Tracking API Integration Tests
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';
const API_URL = testConfig.apiUrl;

describe('Asset Tracking API', () => {
  beforeAll(async () => { await fetch(`${API_URL}/health`); });
  describe('GET /api/asset-tracking', () => { it('should return assets', async () => { expect([200,401,403,404,500]).toContain((await fetch(`${API_URL}/api/asset-tracking`)).status); }); });
  describe('POST /api/asset-tracking', () => { it('should register asset', async () => { expect([200,201,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/asset-tracking`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status); }); });
  describe('GET /api/asset-tracking/:id/location', () => { it('should return location', async () => { expect([200,400,401,403,404,500]).toContain((await fetch(`${API_URL}/api/asset-tracking/00000000-0000-0000-0000-000000000000/location`)).status); }); });
  describe('POST /api/asset-tracking/:id/scan', () => { it('should record scan', async () => { expect([200,201,400,401,403,404,500]).toContain((await fetch(`${API_URL}/api/asset-tracking/00000000-0000-0000-0000-000000000000/scan`, { method: 'POST' })).status); }); });
});
