/**
 * Unit tests for listing type transformations
 */
import { describe, it, expect } from 'vitest';
import { transformListing, transformListings, type Listing } from './listing';

describe('transformListing', () => {
  const createMockListing = (overrides: Partial<Listing> = {}): Listing => ({
    id: 'listing-123',
    tenantId: 'tenant-abc',
    name: 'Test Meeting Room',
    slug: 'test-meeting-room',
    type: 'SPACE',
    status: 'published',
    images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    pricing: {
      basePrice: 500,
      currency: 'NOK',
      unit: 'hour',
    },
    capacity: 20,
    description: 'A great meeting room',
    metadata: {
      address: 'Storgata 1, Oslo',
      city: 'Oslo',
      facilities: ['WiFi', 'Projector', 'Whiteboard', 'Coffee', 'AC'],
      location: {
        lat: 59.9139,
        lng: 10.7522,
      },
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  });

  it('should transform basic listing properties', () => {
    const listing = createMockListing();
    const result = transformListing(listing);

    expect(result.id).toBe('listing-123');
    expect(result.name).toBe('Test Meeting Room');
    expect(result.listingType).toBe('SPACE');
    expect(result.description).toBe('A great meeting room');
  });

  it('should transform pricing correctly', () => {
    const listing = createMockListing();
    const result = transformListing(listing);

    expect(result.price).toBe(500);
    expect(result.priceUnit).toBe('time'); // Norwegian translation of 'hour'
  });

  it('should map pricing units to Norwegian', () => {
    const testCases: Array<{ unit: 'hour' | 'day' | 'week' | 'month' | 'booking'; expected: string }> = [
      { unit: 'hour', expected: 'time' },
      { unit: 'day', expected: 'dag' },
      { unit: 'week', expected: 'uke' },
      { unit: 'month', expected: 'måned' },
      { unit: 'booking', expected: 'booking' },
    ];

    for (const { unit, expected } of testCases) {
      const listing = createMockListing({
        pricing: { basePrice: 100, currency: 'NOK', unit },
      });
      const result = transformListing(listing);
      expect(result.priceUnit).toBe(expected);
    }
  });

  it('should limit facilities to 3 and count remaining', () => {
    const listing = createMockListing();
    const result = transformListing(listing);

    expect(result.facilities).toHaveLength(3);
    expect(result.facilities).toEqual(['WiFi', 'Projector', 'Whiteboard']);
    expect(result.moreFacilities).toBe(2); // Coffee and AC
  });

  it('should handle fewer than 3 facilities', () => {
    const listing = createMockListing({
      metadata: {
        facilities: ['WiFi', 'Projector'],
      },
    });
    const result = transformListing(listing);

    expect(result.facilities).toEqual(['WiFi', 'Projector']);
    expect(result.moreFacilities).toBe(0);
  });

  it('should use address for location', () => {
    const listing = createMockListing();
    const result = transformListing(listing);

    expect(result.location).toBe('Storgata 1, Oslo');
  });

  it('should fall back to city when address not available', () => {
    const listing = createMockListing({
      metadata: { city: 'Bergen' },
    });
    const result = transformListing(listing);

    expect(result.location).toBe('Bergen');
  });

  it('should use "Unknown" when no location info', () => {
    const listing = createMockListing({
      metadata: {},
    });
    const result = transformListing(listing);

    expect(result.location).toBe('Unknown');
  });

  it('should include coordinates when available', () => {
    const listing = createMockListing();
    const result = transformListing(listing);

    expect(result.latitude).toBe(59.9139);
    expect(result.longitude).toBe(10.7522);
  });

  it('should not include coordinates when missing', () => {
    const listing = createMockListing({
      metadata: {
        location: {},
      },
    });
    const result = transformListing(listing);

    expect(result.latitude).toBeUndefined();
    expect(result.longitude).toBeUndefined();
  });

  it('should set available based on status', () => {
    const publishedListing = createMockListing({ status: 'published' });
    const draftListing = createMockListing({ status: 'draft' });
    const archivedListing = createMockListing({ status: 'archived' });

    expect(transformListing(publishedListing).available).toBe(true);
    expect(transformListing(draftListing).available).toBe(false);
    expect(transformListing(archivedListing).available).toBe(false);
  });

  it('should use first image or placeholder', () => {
    const listing = createMockListing();
    const result = transformListing(listing);

    expect(result.image).toBe('https://example.com/image1.jpg');

    const noImageListing = createMockListing({ images: [] });
    const noImageResult = transformListing(noImageListing);

    expect(noImageResult.image).toBe('/placeholder.jpg');
  });

  it('should handle missing optional fields gracefully', () => {
    const minimalListing: Listing = {
      id: 'min-123',
      tenantId: 'tenant-1',
      name: 'Minimal',
      slug: 'minimal',
      type: 'RESOURCE',
      status: 'draft',
      images: [],
      pricing: { basePrice: 0, currency: 'NOK', unit: 'hour' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = transformListing(minimalListing);

    expect(result.id).toBe('min-123');
    expect(result.name).toBe('Minimal');
    expect(result.description).toBe('');
    expect(result.facilities).toEqual([]);
    expect(result.moreFacilities).toBe(0);
    expect(result.capacity).toBe(0);
    expect(result.price).toBe(0);
    expect(result.available).toBe(false);
  });

  it('should set default rating and reviewCount to 0', () => {
    const listing = createMockListing();
    const result = transformListing(listing);

    expect(result.rating).toBe(0);
    expect(result.reviewCount).toBe(0);
  });
});

describe('transformListings', () => {
  it('should transform multiple listings', () => {
    const listings: Listing[] = [
      {
        id: '1',
        tenantId: 't1',
        name: 'Room 1',
        slug: 'room-1',
        type: 'SPACE',
        status: 'published',
        images: ['img1.jpg'],
        pricing: { basePrice: 100, currency: 'NOK', unit: 'hour' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        tenantId: 't1',
        name: 'Room 2',
        slug: 'room-2',
        type: 'RESOURCE',
        status: 'draft',
        images: [],
        pricing: { basePrice: 200, currency: 'NOK', unit: 'day' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const results = transformListings(listings);

    expect(results).toHaveLength(2);
    expect(results[0].id).toBe('1');
    expect(results[0].name).toBe('Room 1');
    expect(results[1].id).toBe('2');
    expect(results[1].name).toBe('Room 2');
  });

  it('should return empty array for empty input', () => {
    const results = transformListings([]);
    expect(results).toEqual([]);
  });
});
