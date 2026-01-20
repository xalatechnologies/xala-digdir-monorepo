/**
 * Seasonal Lease Suggestions Integration Tests
 * Tests for KRAV-ADM-05 (Regelstyrt forslag til sesongfordeling)
 * Target: 95%+ coverage
 */
import { describe, it, expect } from 'vitest';
import { setupMockApi } from '@digilist/api/mocks/api-server.mock';

const API_URL = process.env.API_URL || 'http://localhost:4000';
const TENANT_ID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

const headers = {
  'Content-Type': 'application/json',
  'X-Tenant-Id': TENANT_ID,
};

// TODO: Skipped - needs implementation
describe.skip('SeasonalLeaseController - Suggestions Endpoint', () => {
  setupMockApi();
  // =========================================================================
  // GET /api/seasonal-leases/suggestions
  // =========================================================================
  describe('GET /api/seasonal-leases/suggestions', () => {
  setupMockApi();
    it('should return suggestions with algorithm info', async () => {
      const res = await fetch(`${API_URL}/api/seasonal-leases/suggestions`, { headers });
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.data).toBeDefined();
      expect(data.data.algorithm).toBe('priority_queue_v1');
      expect(data.data.canOverride).toBe(true);
    });

    it('should include generation timestamp', async () => {
      const res = await fetch(`${API_URL}/api/seasonal-leases/suggestions`, { headers });
      const data = await res.json();

      expect(data.data.generatedAt).toBeDefined();
      // Verify it's a valid ISO date
      expect(new Date(data.data.generatedAt).toISOString()).toBe(data.data.generatedAt);
    });

    it('should return array of suggestions', async () => {
      const res = await fetch(`${API_URL}/api/seasonal-leases/suggestions`, { headers });
      const data = await res.json();

      expect(data.data.suggestions).toBeInstanceOf(Array);
      expect(data.data.suggestions.length).toBeGreaterThan(0);
    });

    it('should include priority for each suggestion', async () => {
      const res = await fetch(`${API_URL}/api/seasonal-leases/suggestions`, { headers });
      const data = await res.json();

      data.data.suggestions.forEach((suggestion: any, index: number) => {
        expect(suggestion.priority).toBe(index + 1);
      });
    });

    it('should include organization info in suggestions', async () => {
      const res = await fetch(`${API_URL}/api/seasonal-leases/suggestions`, { headers });
      const data = await res.json();

      const suggestion = data.data.suggestions[0];
      expect(suggestion).toHaveProperty('organizationId');
      expect(suggestion).toHaveProperty('organizationName');
    });

    it('should include suggested time slots', async () => {
      const res = await fetch(`${API_URL}/api/seasonal-leases/suggestions`, { headers });
      const data = await res.json();

      const suggestion = data.data.suggestions[0];
      expect(suggestion).toHaveProperty('suggestedWeekdays');
      expect(suggestion.suggestedWeekdays).toBeInstanceOf(Array);
      expect(suggestion).toHaveProperty('suggestedTimeSlot');
      expect(suggestion.suggestedTimeSlot).toHaveProperty('startTime');
      expect(suggestion.suggestedTimeSlot).toHaveProperty('endTime');
    });

    it('should include reasoning for suggestions', async () => {
      const res = await fetch(`${API_URL}/api/seasonal-leases/suggestions`, { headers });
      const data = await res.json();

      const suggestion = data.data.suggestions[0];
      expect(suggestion).toHaveProperty('reasoning');
      expect(typeof suggestion.reasoning).toBe('string');
    });

    it('should include historical usage data', async () => {
      const res = await fetch(`${API_URL}/api/seasonal-leases/suggestions`, { headers });
      const data = await res.json();

      const suggestion = data.data.suggestions[0];
      expect(suggestion).toHaveProperty('historicalUsage');
      expect(suggestion.historicalUsage).toHaveProperty('totalLeases');
      expect(suggestion.historicalUsage).toHaveProperty('lastSeason');
    });

    it('should filter by listingId', async () => {
      const res = await fetch(`${API_URL}/api/seasonal-leases/suggestions?listingId=test-listing`, { headers });
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.data.listingId).toBe('test-listing');
    });

    it('should filter by season', async () => {
      const res = await fetch(`${API_URL}/api/seasonal-leases/suggestions?season=fall2026`, { headers });
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.data.season).toBe('fall2026');
    });

    it('should use default season when not specified', async () => {
      const res = await fetch(`${API_URL}/api/seasonal-leases/suggestions`, { headers });
      const data = await res.json();

      expect(data.data.season).toBe('spring2026');
    });
  });
});
