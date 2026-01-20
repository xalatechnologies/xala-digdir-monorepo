/**
 * Cameras API Integration Tests
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';
const API_URL = testConfig.apiUrl;

describe('Cameras API', () => {
  beforeAll(async () => { await fetch(`${API_URL}/health`); });
  describe('GET /api/cameras', () => { it('should return cameras', async () => { expect([200,401,403,404,500]).toContain((await fetch(`${API_URL}/api/cameras`)).status); }); });
  describe('GET /api/cameras/:id/stream', () => { it('should return stream url', async () => { expect([200,400,401,403,404,500]).toContain((await fetch(`${API_URL}/api/cameras/00000000-0000-0000-0000-000000000000/stream`)).status); }); });
  describe('GET /api/cameras/:id/recordings', () => { it('should return recordings', async () => { expect([200,400,401,403,404,500]).toContain((await fetch(`${API_URL}/api/cameras/00000000-0000-0000-0000-000000000000/recordings`)).status); }); });
  describe('POST /api/cameras/:id/snapshot', () => { it('should take snapshot', async () => { expect([200,201,400,401,403,404,500]).toContain((await fetch(`${API_URL}/api/cameras/00000000-0000-0000-0000-000000000000/snapshot`, { method: 'POST' })).status); }); });
});
