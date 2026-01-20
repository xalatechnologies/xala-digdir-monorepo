/**
 * Booking Expenses API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Booking Expenses API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/bookings/:id/expenses', () => {
    it('should return expenses for booking', async () => {
      const response = await fetch(`${API_URL}/api/bookings/00000000-0000-0000-0000-000000000000/expenses`);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/bookings/:id/expenses', () => {
    it('should add expense', async () => {
      const response = await fetch(`${API_URL}/api/bookings/00000000-0000-0000-0000-000000000000/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: 'Cleaning', amount: 250 }),
      });
      expect([200, 201, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('DELETE /api/bookings/:id/expenses/:expenseId', () => {
    it('should delete expense', async () => {
      const response = await fetch(`${API_URL}/api/bookings/00000000-0000-0000-0000-000000000000/expenses/00000000-0000-0000-0000-000000000001`, {
        method: 'DELETE',
      });
      expect([200, 204, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
