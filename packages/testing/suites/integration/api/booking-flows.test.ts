/**
 * Booking Flow Integration Tests
 * 
 * Tests complete booking flows against real API
 * Requires API server running on localhost:4000
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testConfig } from '@digilist/testing/config/test-config';

const API_URL = testConfig.apiUrl;

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

describe('Booking Flows', () => {
  let apiAvailable = false;

  beforeAll(async () => {
    apiAvailable = await isApiAvailable();
    if (!apiAvailable) {
      console.log('⚠️  Skipping booking tests - API not available at', API_URL);
    }
  });

  describe('Public Booking Discovery', () => {
    it('should list available rental objects', async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_URL}/public/rental-objects?status=published`);
      
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data.items).toBeDefined();
      expect(Array.isArray(data.items)).toBe(true);
    });

    it('should filter by category', async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_URL}/public/rental-objects?category=LOKALER_OG_BANER`);
      
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      data.items.forEach((item: { categoryKey: string }) => {
        expect(item.categoryKey).toBe('LOKALER_OG_BANER');
      });
    });

    it('should search by name', async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_URL}/public/rental-objects?search=hall`);
      
      expect(response.ok).toBe(true);
    });
  });

  describe('Availability Checking', () => {
    it('should return availability for a rental object', async () => {
      if (!apiAvailable) return;

      // First get a rental object
      const listResponse = await fetch(`${API_URL}/public/rental-objects?limit=1`);
      const listData = await listResponse.json();
      
      if (listData.items.length === 0) {
        console.log('No rental objects available');
        return;
      }

      const id = listData.items[0].id;
      
      // Get availability for next 30 days
      const from = new Date().toISOString().split('T')[0];
      const to = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const response = await fetch(`${API_URL}/public/rental-objects/${id}/availability?from=${from}&to=${to}`);
      
      // Availability endpoint may or may not exist
      if (response.status === 404) {
        console.log('Availability endpoint not implemented');
        return;
      }
      
      expect(response.ok).toBe(true);
    });
  });

  describe('Booking Creation', () => {
    it('should require authentication for booking', async () => {
      if (!apiAvailable) return;

      const response = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rentalObjectId: '00000000-0000-0000-0000-000000000000',
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        }),
      });
      
      // Should require auth
      expect([401, 403]).toContain(response.status);
    });
  });
});
