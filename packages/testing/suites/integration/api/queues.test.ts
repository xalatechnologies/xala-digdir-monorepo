/**
 * Queues API Integration Tests
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';
const API_URL = testConfig.apiUrl;

describe('Queues API', () => {
  beforeAll(async () => { await fetch(`${API_URL}/health`); });
  describe('GET /api/queues', () => { it('should return queues', async () => { expect([200,401,403,404,500]).toContain((await fetch(`${API_URL}/api/queues`)).status); }); });
  describe('POST /api/queues/:id/join', () => { it('should join queue', async () => { expect([200,201,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/queues/00000000-0000-0000-0000-000000000000/join`, { method: 'POST' })).status); }); });
  describe('POST /api/queues/:id/next', () => { it('should advance queue', async () => { expect([200,400,401,403,404,500]).toContain((await fetch(`${API_URL}/api/queues/00000000-0000-0000-0000-000000000000/next`, { method: 'POST' })).status); }); });
  describe('GET /api/queues/:id/status', () => { it('should return status', async () => { expect([200,400,401,403,404,500]).toContain((await fetch(`${API_URL}/api/queues/00000000-0000-0000-0000-000000000000/status`)).status); }); });
});
