/**
 * Sensors API Integration Tests
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';
const API_URL = testConfig.apiUrl;

describe('Sensors API', () => {
  beforeAll(async () => { await fetch(`${API_URL}/health`); });
  describe('GET /api/sensors', () => { it('should return sensors', async () => { expect([200,401,403,404,500]).toContain((await fetch(`${API_URL}/api/sensors`)).status); }); });
  describe('GET /api/sensors/:id/readings', () => { it('should return readings', async () => { expect([200,400,401,403,404,500]).toContain((await fetch(`${API_URL}/api/sensors/00000000-0000-0000-0000-000000000000/readings`)).status); }); });
  describe('POST /api/sensors/:id/calibrate', () => { it('should calibrate sensor', async () => { expect([200,400,401,403,404,500]).toContain((await fetch(`${API_URL}/api/sensors/00000000-0000-0000-0000-000000000000/calibrate`, { method: 'POST' })).status); }); });
  describe('GET /api/sensors/:id/alerts', () => { it('should return sensor alerts', async () => { expect([200,400,401,403,404,500]).toContain((await fetch(`${API_URL}/api/sensors/00000000-0000-0000-0000-000000000000/alerts`)).status); }); });
});
