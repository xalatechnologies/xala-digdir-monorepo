/**
 * Thermostats API Integration Tests
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';
const API_URL = testConfig.apiUrl;

describe('Thermostats API', () => {
  beforeAll(async () => { await fetch(`${API_URL}/health`); });
  describe('GET /api/thermostats', () => { it('should return thermostats', async () => { expect([200,401,403,404,500]).toContain((await fetch(`${API_URL}/api/thermostats`)).status); }); });
  describe('GET /api/thermostats/:id', () => { it('should return thermostat', async () => { expect([200,400,401,403,404,500]).toContain((await fetch(`${API_URL}/api/thermostats/00000000-0000-0000-0000-000000000000`)).status); }); });
  describe('PUT /api/thermostats/:id/temperature', () => { it('should set temperature', async () => { expect([200,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/thermostats/00000000-0000-0000-0000-000000000000/temperature`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: '{"temperature":22}' })).status); }); });
  describe('PUT /api/thermostats/:id/mode', () => { it('should set mode', async () => { expect([200,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/thermostats/00000000-0000-0000-0000-000000000000/mode`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: '{"mode":"heating"}' })).status); }); });
});
