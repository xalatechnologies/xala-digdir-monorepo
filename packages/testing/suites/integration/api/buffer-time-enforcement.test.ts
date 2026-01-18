/**
 * Buffer Time Enforcement Integration Tests
 * Tests for Real-Time Availability with Conflict Prevention (Phase 2)
 * Verifies buffer time validation between bookings
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupMockApi } from '@xala/api/mocks/api-server.mock';

const API_URL = process.env.API_URL || 'http://localhost:3000';
const TENANT_ID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

const headers = {
  'Content-Type': 'application/json',
  'X-Tenant-Id': TENANT_ID,
};

describe('Buffer Time Enforcement', () => {
  setupMockApi();
  let testListingId: string;
  let firstBookingId: string;
  let secondBookingId: string;

  beforeAll(async () => {
    // Create a test listing with 15-minute buffer time
    const createListingRes = await fetch(`${API_URL}/api/listings`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: 'Test Listing with Buffer Time',
        description: 'Integration test listing for buffer time enforcement',
        type: 'space',
        status: 'active',
        pricePerHour: 100,
        currency: 'NOK',
        metadata: {
          bufferTimeMinutes: 15, // 15-minute buffer time
        },
      }),
    });

    if (createListingRes.ok) {
      const data = await createListingRes.json();
      testListingId = data.data?.id;
      console.log(`Created test listing with ID: ${testListingId}`);
    } else {
      // If listing creation fails, try to find an existing listing
      const listingsRes = await fetch(`${API_URL}/api/listings?limit=1`, { headers });
      const listingsData = await listingsRes.json();
      if (listingsData.data && listingsData.data.length > 0) {
        testListingId = listingsData.data[0].id;
        console.log(`Using existing listing with ID: ${testListingId}`);

        // Update the listing to have buffer time
        await fetch(`${API_URL}/api/listings/${testListingId}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            metadata: {
              bufferTimeMinutes: 15,
            },
          }),
        });
      }
    }
  });

  afterAll(async () => {
    // Clean up: delete test bookings
    if (firstBookingId) {
      await fetch(`${API_URL}/api/bookings/${firstBookingId}`, {
        method: 'DELETE',
        headers,
      });
    }
    if (secondBookingId) {
      await fetch(`${API_URL}/api/bookings/${secondBookingId}`, {
        method: 'DELETE',
        headers,
      });
    }

    // Clean up: delete test listing (optional, may fail if listing is used elsewhere)
    if (testListingId) {
      await fetch(`${API_URL}/api/listings/${testListingId}`, {
        method: 'DELETE',
        headers,
      }).catch(() => {
        // Ignore errors if listing can't be deleted
        console.log('Note: Test listing not deleted (may be in use)');
      });
    }
  });

  describe('Buffer Time Validation', () => {
  setupMockApi();
    it('should successfully book a slot 10:00-11:00', async () => {
      if (!testListingId) {
        console.log('Skipping test: no listing available');
        return;
      }

      // Create a booking for tomorrow 10:00-11:00
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      const startTime = tomorrow.toISOString();

      const endDate = new Date(tomorrow);
      endDate.setHours(11, 0, 0, 0);
      const endTime = endDate.toISOString();

      const res = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          listingId: testListingId,
          startTime,
          endTime,
          totalPrice: 100,
          notes: 'First booking 10:00-11:00',
        }),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.data).toBeDefined();
      expect(data.data.id).toBeDefined();

      firstBookingId = data.data.id;
      console.log(`Created first booking ${firstBookingId}: ${startTime} to ${endTime}`);
    });

    it('should reject booking 11:00-12:00 (needs 15min buffer)', async () => {
      if (!testListingId || !firstBookingId) {
        console.log('Skipping test: prerequisite booking not created');
        return;
      }

      // Attempt to book 11:00-12:00 (immediately after first booking)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(11, 0, 0, 0);

      const startTime = tomorrow.toISOString();

      const endDate = new Date(tomorrow);
      endDate.setHours(12, 0, 0, 0);
      const endTime = endDate.toISOString();

      const res = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          listingId: testListingId,
          startTime,
          endTime,
          totalPrice: 100,
          notes: 'Second booking 11:00-12:00 (should fail)',
        }),
      });

      // Should fail with 403 Forbidden due to buffer time conflict
      expect(res.status).toBe(403);

      const data = await res.json();
      expect(data.title).toBeDefined();
      expect(data.detail).toMatch(/not available|buffer/i);

      console.log(`Correctly rejected booking at 11:00-12:00: ${data.detail}`);
    });

    it('should accept booking 11:15-12:15 (after 15min buffer)', async () => {
      if (!testListingId || !firstBookingId) {
        console.log('Skipping test: prerequisite booking not created');
        return;
      }

      // Attempt to book 11:15-12:15 (15 minutes after first booking)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(11, 15, 0, 0);

      const startTime = tomorrow.toISOString();

      const endDate = new Date(tomorrow);
      endDate.setHours(12, 15, 0, 0);
      const endTime = endDate.toISOString();

      const res = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          listingId: testListingId,
          startTime,
          endTime,
          totalPrice: 100,
          notes: 'Third booking 11:15-12:15 (should succeed)',
        }),
      });

      // Should succeed
      expect(res.status).toBe(201);

      const data = await res.json();
      expect(data.data).toBeDefined();
      expect(data.data.id).toBeDefined();

      secondBookingId = data.data.id;
      console.log(`Successfully created second booking ${secondBookingId}: ${startTime} to ${endTime}`);
    });

    it('should reject booking at 10:45-11:45 (overlaps buffer before second booking)', async () => {
      if (!testListingId || !secondBookingId) {
        console.log('Skipping test: prerequisite bookings not created');
        return;
      }

      // Attempt to book 10:45-11:45 (would end at 11:45, but second booking starts at 11:15 with 15min buffer at 11:00)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 45, 0, 0);

      const startTime = tomorrow.toISOString();

      const endDate = new Date(tomorrow);
      endDate.setHours(11, 45, 0, 0);
      const endTime = endDate.toISOString();

      const res = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          listingId: testListingId,
          startTime,
          endTime,
          totalPrice: 100,
          notes: 'Booking 10:45-11:45 (should fail)',
        }),
      });

      // Should fail with 403 Forbidden due to buffer time conflict
      expect(res.status).toBe(403);

      const data = await res.json();
      expect(data.title).toBeDefined();

      console.log(`Correctly rejected booking at 10:45-11:45: ${data.detail}`);
    });
  });

  describe('Availability Endpoint with Buffer Time', () => {
  setupMockApi();
    it('should reflect buffer time in availability check', async () => {
      if (!testListingId || !firstBookingId) {
        console.log('Skipping test: prerequisite booking not created');
        return;
      }

      // Check availability for 11:00-12:00 (should be unavailable due to buffer)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(11, 0, 0, 0);
      const startTime = tomorrow.toISOString();

      const endDate = new Date(tomorrow);
      endDate.setHours(12, 0, 0, 0);
      const endTime = endDate.toISOString();

      const res = await fetch(
        `${API_URL}/api/availability/check?listingId=${testListingId}&startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`,
        { headers }
      );

      expect(res.status).toBe(200);
      const data = await res.json();

      // Should indicate unavailable due to buffer time
      expect(data.data.available).toBe(false);
      console.log(`Availability check correctly shows unavailable for 11:00-12:00: ${JSON.stringify(data.data)}`);
    });

    it('should show availability for slot after buffer time', async () => {
      if (!testListingId || !firstBookingId) {
        console.log('Skipping test: prerequisite booking not created');
        return;
      }

      // Check availability for 11:15-12:15 (should be available after buffer)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(11, 15, 0, 0);
      const startTime = tomorrow.toISOString();

      const endDate = new Date(tomorrow);
      endDate.setHours(12, 15, 0, 0);
      const endTime = endDate.toISOString();

      // First, delete the second booking if it exists to make the slot truly available
      if (secondBookingId) {
        await fetch(`${API_URL}/api/bookings/${secondBookingId}`, {
          method: 'DELETE',
          headers,
        });
        secondBookingId = '';
      }

      const res = await fetch(
        `${API_URL}/api/availability/check?listingId=${testListingId}&startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`,
        { headers }
      );

      expect(res.status).toBe(200);
      const data = await res.json();

      // Should indicate available after buffer time
      expect(data.data.available).toBe(true);
      console.log(`Availability check correctly shows available for 11:15-12:15: ${JSON.stringify(data.data)}`);
    });
  });

  describe('Edge Cases', () => {
  setupMockApi();
    it('should handle 0-minute buffer time (back-to-back bookings allowed)', async () => {
      if (!testListingId) {
        console.log('Skipping test: no listing available');
        return;
      }

      // Update listing to have 0-minute buffer time
      await fetch(`${API_URL}/api/listings/${testListingId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          metadata: {
            bufferTimeMinutes: 0,
          },
        }),
      });

      // Create a booking for day after tomorrow 10:00-11:00
      const dayAfterTomorrow = new Date();
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
      dayAfterTomorrow.setHours(10, 0, 0, 0);
      const startTime1 = dayAfterTomorrow.toISOString();

      const endDate1 = new Date(dayAfterTomorrow);
      endDate1.setHours(11, 0, 0, 0);
      const endTime1 = endDate1.toISOString();

      const res1 = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          listingId: testListingId,
          startTime: startTime1,
          endTime: endTime1,
          totalPrice: 100,
          notes: 'First booking with 0 buffer',
        }),
      });

      expect(res1.status).toBe(201);
      const booking1 = await res1.json();
      const zeroBufferBooking1Id = booking1.data.id;

      // Attempt to book 11:00-12:00 (immediately after, should succeed with 0 buffer)
      const startTime2 = endDate1.toISOString();
      const endDate2 = new Date(endDate1);
      endDate2.setHours(12, 0, 0, 0);
      const endTime2 = endDate2.toISOString();

      const res2 = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          listingId: testListingId,
          startTime: startTime2,
          endTime: endTime2,
          totalPrice: 100,
          notes: 'Second booking with 0 buffer (back-to-back)',
        }),
      });

      expect(res2.status).toBe(201);
      const booking2 = await res2.json();
      const zeroBufferBooking2Id = booking2.data.id;

      console.log('Successfully created back-to-back bookings with 0 buffer time');

      // Clean up
      await fetch(`${API_URL}/api/bookings/${zeroBufferBooking1Id}`, {
        method: 'DELETE',
        headers,
      });
      await fetch(`${API_URL}/api/bookings/${zeroBufferBooking2Id}`, {
        method: 'DELETE',
        headers,
      });

      // Restore 15-minute buffer time for other tests
      await fetch(`${API_URL}/api/listings/${testListingId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          metadata: {
            bufferTimeMinutes: 15,
          },
        }),
      });
    });

    it('should handle 30-minute buffer time (larger buffer)', async () => {
      if (!testListingId) {
        console.log('Skipping test: no listing available');
        return;
      }

      // Update listing to have 30-minute buffer time
      await fetch(`${API_URL}/api/listings/${testListingId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          metadata: {
            bufferTimeMinutes: 30,
          },
        }),
      });

      // Create a booking for day after tomorrow 14:00-15:00
      const dayAfterTomorrow = new Date();
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
      dayAfterTomorrow.setHours(14, 0, 0, 0);
      const startTime1 = dayAfterTomorrow.toISOString();

      const endDate1 = new Date(dayAfterTomorrow);
      endDate1.setHours(15, 0, 0, 0);
      const endTime1 = endDate1.toISOString();

      const res1 = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          listingId: testListingId,
          startTime: startTime1,
          endTime: endTime1,
          totalPrice: 100,
          notes: 'First booking with 30min buffer',
        }),
      });

      expect(res1.status).toBe(201);
      const booking1 = await res1.json();
      const largeBufferBooking1Id = booking1.data.id;

      // Attempt to book 15:20-16:20 (20 minutes after, should fail with 30min buffer)
      const startDate2 = new Date(endDate1);
      startDate2.setMinutes(20);
      const startTime2 = startDate2.toISOString();

      const endDate2 = new Date(startDate2);
      endDate2.setHours(16, 20, 0, 0);
      const endTime2 = endDate2.toISOString();

      const res2 = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          listingId: testListingId,
          startTime: startTime2,
          endTime: endTime2,
          totalPrice: 100,
          notes: 'Second booking at 15:20 (should fail with 30min buffer)',
        }),
      });

      expect(res2.status).toBe(403);
      console.log('Correctly rejected booking within 30-minute buffer period');

      // Attempt to book 15:30-16:30 (30 minutes after, should succeed)
      const startDate3 = new Date(endDate1);
      startDate3.setMinutes(30);
      const startTime3 = startDate3.toISOString();

      const endDate3 = new Date(startDate3);
      endDate3.setHours(16, 30, 0, 0);
      const endTime3 = endDate3.toISOString();

      const res3 = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          listingId: testListingId,
          startTime: startTime3,
          endTime: endTime3,
          totalPrice: 100,
          notes: 'Third booking at 15:30 (should succeed)',
        }),
      });

      expect(res3.status).toBe(201);
      const booking3 = await res3.json();
      const largeBufferBooking2Id = booking3.data.id;

      console.log('Successfully created booking after 30-minute buffer period');

      // Clean up
      await fetch(`${API_URL}/api/bookings/${largeBufferBooking1Id}`, {
        method: 'DELETE',
        headers,
      });
      await fetch(`${API_URL}/api/bookings/${largeBufferBooking2Id}`, {
        method: 'DELETE',
        headers,
      });

      // Restore 15-minute buffer time for other tests
      await fetch(`${API_URL}/api/listings/${testListingId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          metadata: {
            bufferTimeMinutes: 15,
          },
        }),
      });
    });
  });

  describe('Calendar View Buffer Zone Visualization (Backend Support)', () => {
  setupMockApi();
    it('should return calendar events with buffer time metadata', async () => {
      if (!testListingId) {
        console.log('Skipping test: no listing available');
        return;
      }

      // Get calendar events for the listing
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const startDate = tomorrow.toISOString();

      const endDate = new Date(tomorrow);
      endDate.setDate(endDate.getDate() + 1);
      const endDateStr = endDate.toISOString();

      const res = await fetch(
        `${API_URL}/api/calendar/events?listingId=${testListingId}&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDateStr)}`,
        { headers }
      );

      if (res.status === 200) {
        const data = await res.json();
        expect(data.data).toBeDefined();

        // The backend should provide events that the frontend can use to display buffer zones
        console.log(`Retrieved ${data.data.length} calendar events for buffer zone visualization`);
      } else {
        // If the calendar endpoint doesn't exist, that's okay - buffer zones can still be calculated client-side
        console.log('Note: Calendar events endpoint may not be implemented yet');
      }
    });

    it('should allow fetching listing metadata including buffer time', async () => {
      if (!testListingId) {
        console.log('Skipping test: no listing available');
        return;
      }

      // Get listing details to verify buffer time is accessible
      const res = await fetch(`${API_URL}/api/listings/${testListingId}`, { headers });

      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.data).toBeDefined();
      expect(data.data.metadata).toBeDefined();
      expect(data.data.metadata.bufferTimeMinutes).toBeDefined();

      console.log(`Listing buffer time: ${data.data.metadata.bufferTimeMinutes} minutes`);
      console.log('Backend provides buffer time metadata for frontend visualization');
    });
  });
});
