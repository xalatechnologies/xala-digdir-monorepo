/**
 * API Performance Tests
 * 
 * Basic performance tests for critical API endpoints
 * Measures response times and validates against thresholds
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

// Performance thresholds (milliseconds)
const THRESHOLDS = {
  health: 100,
  listRentalObjects: 500,
  getRentalObject: 300,
  getCategories: 200,
};

async function isApiAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/health`, {
      signal: AbortSignal.timeout(2000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function measureResponseTime(url: string): Promise<number> {
  const start = performance.now();
  await fetch(url);
  return performance.now() - start;
}

describe('API Performance', () => {
  let apiAvailable = false;

  beforeAll(async () => {
    apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      console.log('⚠️  Skipping performance tests - API not available at', API_URL);
    }
  });

  describe('Health Endpoint', () => {
    it(`should respond within ${THRESHOLDS.health}ms`, async () => {
      if (!apiAvailable) return;

      const times: number[] = [];
      
      // Run 5 times and take median
      for (let i = 0; i < 5; i++) {
        const time = await measureResponseTime(`${API_URL}/health`);
        times.push(time);
      }

      const sorted = times.sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)];

      console.log(`Health endpoint median: ${median.toFixed(2)}ms`);
      expect(median).toBeLessThan(THRESHOLDS.health);
    });
  });

  describe('Rental Objects List', () => {
    it(`should respond within ${THRESHOLDS.listRentalObjects}ms`, async () => {
      if (!apiAvailable) return;

      const times: number[] = [];
      
      for (let i = 0; i < 3; i++) {
        const time = await measureResponseTime(`${API_URL}/public/rental-objects?limit=20`);
        times.push(time);
      }

      const sorted = times.sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)];

      console.log(`List rental objects median: ${median.toFixed(2)}ms`);
      expect(median).toBeLessThan(THRESHOLDS.listRentalObjects);
    });
  });

  describe('Categories', () => {
    it(`should respond within ${THRESHOLDS.getCategories}ms`, async () => {
      if (!apiAvailable) return;

      const times: number[] = [];
      
      for (let i = 0; i < 3; i++) {
        const time = await measureResponseTime(`${API_URL}/public/categories`);
        times.push(time);
      }

      const sorted = times.sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)];

      console.log(`Categories median: ${median.toFixed(2)}ms`);
      expect(median).toBeLessThan(THRESHOLDS.getCategories);
    });
  });

  describe('Concurrent Requests', () => {
    it('should handle 10 concurrent requests without errors', async () => {
      if (!apiAvailable) return;

      const requests = Array(10).fill(null).map(() => 
        fetch(`${API_URL}/public/rental-objects?limit=5`)
      );

      const responses = await Promise.all(requests);
      
      const allOk = responses.every(r => r.ok);
      expect(allOk).toBe(true);
    });
  });
});
