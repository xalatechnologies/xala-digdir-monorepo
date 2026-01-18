/**
 * Booking Flow Journey E2E Test
 * Full flow: Browse listings → Check availability → Create booking → Confirm → Complete
 */
import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:4000';
const TENANT_ID = 'test-tenant';

test.describe('Booking Flow Journey', () => {
  let listingId: string;
  let bookingId: string;

  test.beforeAll(async ({ request }) => {
    // Create a listing for booking tests
    const response = await request.post(`${API_URL}/api/listings`, {
      headers: { 'x-tenant-id': TENANT_ID },
      data: {
        title: 'Conference Room A',
        slug: 'conference-room-a',
        type: 'space',
        description: 'Large conference room with projector',
        capacity: 20,
        pricePerHour: 50,
        currency: 'NOK',
      },
    });
    
    if (response.status() === 201) {
      const body = await response.json();
      listingId = body.listing.id;
    }
  });

  test('1. Browse available listings', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/listings`, {
      headers: { 'x-tenant-id': TENANT_ID },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('2. Get listing details', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/listings/${listingId}`, {
      headers: { 'x-tenant-id': TENANT_ID },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.listing.title).toBe('Conference Room A');
  });

  test('3. Create booking', async ({ request }) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const response = await request.post(`${API_URL}/api/bookings`, {
      headers: { 'x-tenant-id': TENANT_ID },
      data: {
        listingId,
        startDate: tomorrow.toISOString(),
        endDate: new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000).toISOString(),
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        notes: 'Team meeting',
      },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.booking.status).toBe('pending');
    bookingId = body.booking.id;
  });

  test('4. View booking details', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/bookings/${bookingId}`, {
      headers: { 'x-tenant-id': TENANT_ID },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.booking.id).toBe(bookingId);
  });

  test('5. Confirm booking', async ({ request }) => {
    const response = await request.put(`${API_URL}/api/bookings/${bookingId}/confirm`, {
      headers: { 'x-tenant-id': TENANT_ID },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.booking.status).toBe('confirmed');
  });

  test('6. Get calendar view', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/bookings/calendar`, {
      headers: { 'x-tenant-id': TENANT_ID },
      params: {
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    });

    expect(response.status()).toBe(200);
  });

  test('7. Complete booking', async ({ request }) => {
    const response = await request.put(`${API_URL}/api/bookings/${bookingId}/complete`, {
      headers: { 'x-tenant-id': TENANT_ID },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.booking.status).toBe('completed');
  });
});
