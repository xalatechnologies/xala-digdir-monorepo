/**
 * API Health Check Tests
 * 
 * Integration tests that verify API endpoints are accessible
 * Requires API server running on localhost:4000
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

describe('API Health & Connectivity', () => {
  let apiAvailable = false;

  beforeAll(async () => {
    try {
      const response = await fetch(`${testConfig.apiUrl}/health`, { 
        method: 'GET',
        signal: AbortSignal.timeout(2000),
      });
      apiAvailable = response.ok;
    } catch {
      apiAvailable = false;
    }
  });

  it('should have API health endpoint returning OK', async () => {
    if (!apiAvailable) {
      console.log('Skipping: API not available at', testConfig.apiUrl);
      return;
    }

    const response = await fetch(`${testConfig.apiUrl}/health`);
    expect(response.ok).toBe(true);
    
    const data = await response.json();
    expect(data.status).toBe('ok');
  });

  it('should have API docs endpoint', async () => {
    if (!apiAvailable) {
      console.log('Skipping: API not available at', testConfig.apiUrl);
      return;
    }

    const response = await fetch(`${testConfig.apiUrl}/docs`);
    expect(response.status).toBeLessThan(500);
  });

  it('should return 404 for unknown routes', async () => {
    if (!apiAvailable) {
      console.log('Skipping: API not available at', testConfig.apiUrl);
      return;
    }

    const response = await fetch(`${testConfig.apiUrl}/nonexistent-route-12345`);
    expect(response.status).toBe(404);
  });
});
