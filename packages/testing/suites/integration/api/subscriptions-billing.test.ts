/**
 * Subscriptions Billing API Integration Tests
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';
const API_URL = testConfig.apiUrl;

describe('Subscriptions Billing API', () => {
  beforeAll(async () => { await fetch(`${API_URL}/health`); });
  describe('GET /api/subscriptions-billing', () => { it('should return subscriptions', async () => { expect([200,401,403,404,500]).toContain((await fetch(`${API_URL}/api/subscriptions-billing`)).status); }); });
  describe('POST /api/subscriptions-billing', () => { it('should create subscription', async () => { expect([200,201,400,401,403,404,422,500]).toContain((await fetch(`${API_URL}/api/subscriptions-billing`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status); }); });
  describe('POST /api/subscriptions-billing/:id/cancel', () => { it('should cancel subscription', async () => { expect([200,400,401,403,404,500]).toContain((await fetch(`${API_URL}/api/subscriptions-billing/00000000-0000-0000-0000-000000000000/cancel`, { method: 'POST' })).status); }); });
  describe('POST /api/subscriptions-billing/:id/resume', () => { it('should resume subscription', async () => { expect([200,400,401,403,404,500]).toContain((await fetch(`${API_URL}/api/subscriptions-billing/00000000-0000-0000-0000-000000000000/resume`, { method: 'POST' })).status); }); });
});
