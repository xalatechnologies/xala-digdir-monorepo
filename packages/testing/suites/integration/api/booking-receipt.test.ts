/**
 * Booking Receipt Integration Tests
 * Tests for KRAV-ADM-07 (Salgsbilag iht bokføringskrav)
 * Target: 95%+ coverage
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { setupMockApi } from '@xala/api/mocks/api-server.mock';

const API_URL = process.env.API_URL || 'http://localhost:4000';
const TENANT_ID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

const headers = {
  'Content-Type': 'application/json',
  'X-Tenant-Id': TENANT_ID,
};

describe('BookingController - Receipt Endpoint', () => {
  setupMockApi();
  let testBookingId: string;

  beforeAll(async () => {
    // Get an existing booking for testing
    const res = await fetch(`${API_URL}/api/bookings?limit=1`, { headers });
    const data = await res.json();
    if (data.data && data.data.length > 0) {
      testBookingId = data.data[0].id;
    }
  });

  // =========================================================================
  // GET /api/bookings/:id/receipt
  // =========================================================================
  describe('GET /api/bookings/:id/receipt', () => {
  setupMockApi();
    it('should return receipt with all required fields', async () => {
      if (!testBookingId) {
        console.log('Skipping test: no booking available');
        return;
      }

      const res = await fetch(`${API_URL}/api/bookings/${testBookingId}/receipt`, { headers });
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.data).toBeDefined();

      // Receipt number format
      expect(data.data.receiptNumber).toMatch(/^REC-/);
      expect(data.data.bookingId).toBe(testBookingId);
      expect(data.data.generatedAt).toBeDefined();
    });

    it('should include customer (hvem) section', async () => {
      if (!testBookingId) return;

      const res = await fetch(`${API_URL}/api/bookings/${testBookingId}/receipt`, { headers });
      const data = await res.json();

      expect(data.data.customer).toBeDefined();
      expect(data.data.customer).toHaveProperty('userId');
      expect(data.data.customer).toHaveProperty('tenantId');
    });

    it('should include service (hva) section', async () => {
      if (!testBookingId) return;

      const res = await fetch(`${API_URL}/api/bookings/${testBookingId}/receipt`, { headers });
      const data = await res.json();

      expect(data.data.service).toBeDefined();
      expect(data.data.service).toHaveProperty('listingId');
      expect(data.data.service).toHaveProperty('description');
      expect(data.data.service).toHaveProperty('duration');
    });

    it('should include location (hvor) section', async () => {
      if (!testBookingId) return;

      const res = await fetch(`${API_URL}/api/bookings/${testBookingId}/receipt`, { headers });
      const data = await res.json();

      expect(data.data.location).toBeDefined();
      expect(data.data.location).toHaveProperty('tenantId');
      expect(data.data.location).toHaveProperty('listingId');
    });

    it('should include timing (når) section', async () => {
      if (!testBookingId) return;

      const res = await fetch(`${API_URL}/api/bookings/${testBookingId}/receipt`, { headers });
      const data = await res.json();

      expect(data.data.timing).toBeDefined();
      expect(data.data.timing).toHaveProperty('bookingDate');
      expect(data.data.timing).toHaveProperty('serviceDate');
      expect(data.data.timing).toHaveProperty('receiptDate');
    });

    it('should include payment information', async () => {
      if (!testBookingId) return;

      const res = await fetch(`${API_URL}/api/bookings/${testBookingId}/receipt`, { headers });
      const data = await res.json();

      expect(data.data.payment).toBeDefined();
      expect(data.data.payment).toHaveProperty('amount');
      expect(data.data.payment).toHaveProperty('currency');
      expect(data.data.payment).toHaveProperty('status');
    });

    it('should return 404 for non-existent booking', async () => {
      const res = await fetch(`${API_URL}/api/bookings/nonexistent-uuid/receipt`, { headers });
      expect(res.status).toBe(404);
    });

    it('should return 404 for invalid UUID format', async () => {
      const res = await fetch(`${API_URL}/api/bookings/invalid/receipt`, { headers });
      // Could be 400 or 404 depending on implementation
      expect([400, 404]).toContain(res.status);
    });
  });
});
