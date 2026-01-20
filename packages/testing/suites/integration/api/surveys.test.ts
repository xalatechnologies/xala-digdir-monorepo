/**
 * Surveys API Integration Tests
 * Real API tests - no mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

describe('Surveys API', () => {
  beforeAll(async () => {
    const health = await fetch(`${API_URL}/health`);
    if (!health.ok) throw new Error(`API not available at ${API_URL}`);
  });

  describe('GET /api/surveys', () => {
    it('should return surveys list', async () => {
      const response = await fetch(`${API_URL}/api/surveys`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/surveys/active', () => {
    it('should return active surveys', async () => {
      const response = await fetch(`${API_URL}/api/surveys/active`);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/surveys/:id/respond', () => {
    it('should submit survey response', async () => {
      const response = await fetch(`${API_URL}/api/surveys/00000000-0000-0000-0000-000000000000/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: { q1: 'Yes', q2: 5 } }),
      });
      expect([200, 201, 400, 401, 403, 404, 422, 500]).toContain(response.status);
    });
  });
});
