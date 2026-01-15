/**
 * Unit Tests for Geocoding Utilities
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  geocodeListingAddress,
  geocodeAddresses,
  geocodeAddress,
  buildAddressString,
  getCachedGeocode,
  getCachedGeocodeFromString,
  clearGeocodeCache,
  isGeocodeSuccess,
  isGeocodeError,
  type ListingAddress,
  type GeocodeResult,
  type GeocodeConfig,
} from '../../utils/geocode';

// Mock fetch globally
global.fetch = vi.fn();

describe('Geocoding Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearGeocodeCache();
  });

  afterEach(() => {
    clearGeocodeCache();
  });

  // =============================================================================
  // Address Building
  // =============================================================================

  describe('buildAddressString', () => {
    it('should build complete address with all fields', () => {
      const address: ListingAddress = {
        street: 'Storgata 1',
        postalCode: '0155',
        city: 'Oslo',
        municipality: 'Oslo',
        country: 'Norway',
      };

      const result = buildAddressString(address);
      expect(result).toBe('Storgata 1, 0155 Oslo, Norway');
    });

    it('should skip municipality if same as city', () => {
      const address: ListingAddress = {
        street: 'Storgata 1',
        postalCode: '0155',
        city: 'Oslo',
        municipality: 'Oslo',
        country: 'Norway',
      };

      const result = buildAddressString(address);
      expect(result).not.toContain('Oslo, Oslo');
    });

    it('should include municipality if different from city', () => {
      const address: ListingAddress = {
        street: 'Storgata 1',
        postalCode: '3700',
        city: 'Skien',
        municipality: 'Skien Kommune',
        country: 'Norway',
      };

      const result = buildAddressString(address);
      expect(result).toBe('Storgata 1, 3700 Skien, Skien Kommune, Norway');
    });

    it('should handle missing street', () => {
      const address: ListingAddress = {
        postalCode: '0155',
        city: 'Oslo',
      };

      const result = buildAddressString(address);
      expect(result).toBe('0155 Oslo, Norway');
    });

    it('should handle missing postal code', () => {
      const address: ListingAddress = {
        street: 'Storgata 1',
        city: 'Oslo',
      };

      const result = buildAddressString(address);
      expect(result).toBe('Storgata 1, Oslo, Norway');
    });

    it('should default to Norway when country is missing', () => {
      const address: ListingAddress = {
        city: 'Oslo',
      };

      const result = buildAddressString(address);
      expect(result).toBe('Oslo, Norway');
    });

    it('should handle empty address', () => {
      const address: ListingAddress = {};

      const result = buildAddressString(address);
      expect(result).toBe('Norway');
    });

    it('should trim whitespace from all fields', () => {
      const address: ListingAddress = {
        street: '  Storgata 1  ',
        postalCode: '  0155  ',
        city: '  Oslo  ',
        country: '  Norway  ',
      };

      const result = buildAddressString(address);
      expect(result).toBe('Storgata 1, 0155 Oslo, Norway');
    });
  });

  // =============================================================================
  // Cache - Basic Operations
  // =============================================================================

  describe('getCachedGeocode', () => {
    it('should return null for cache miss', () => {
      const address: ListingAddress = {
        street: 'Storgata 1',
        postalCode: '0155',
        city: 'Oslo',
      };

      const result = getCachedGeocode(address);
      expect(result).toBeNull();
    });

    it('should return cached result after geocoding', async () => {
      const address: ListingAddress = {
        street: 'Storgata 1',
        postalCode: '0155',
        city: 'Oslo',
      };

      const mockResponse: GeocodeResult = {
        latitude: 59.9139,
        longitude: 10.7522,
        formattedAddress: 'Storgata 1, 0155 Oslo, Norway',
        confidence: 1.0,
        provider: 'mapbox',
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          features: [
            {
              center: [10.7522, 59.9139],
              place_name: 'Storgata 1, 0155 Oslo, Norway',
              relevance: 1.0,
              place_type: ['address'],
            },
          ],
        }),
      } as Response);

      const config: GeocodeConfig = {
        mapboxToken: 'test-token',
      };

      // First call should hit API
      await geocodeListingAddress(address, config);

      // Second call should hit cache
      const cached = getCachedGeocode(address);
      expect(cached).toEqual(mockResponse);
    });

    it('should normalize address for cache key (case insensitive)', async () => {
      const address1: ListingAddress = {
        street: 'Storgata 1',
        city: 'Oslo',
      };

      const address2: ListingAddress = {
        street: 'STORGATA 1',
        city: 'OSLO',
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          features: [
            {
              center: [10.7522, 59.9139],
              place_name: 'Storgata 1, Oslo, Norway',
              relevance: 1.0,
              place_type: ['address'],
            },
          ],
        }),
      } as Response);

      const config: GeocodeConfig = {
        mapboxToken: 'test-token',
      };

      await geocodeListingAddress(address1, config);

      // Different case should still hit cache
      const cached = getCachedGeocode(address2);
      expect(cached).not.toBeNull();
      expect(cached?.latitude).toBe(59.9139);
    });
  });

  describe('getCachedGeocodeFromString', () => {
    it('should return null for empty string', () => {
      expect(getCachedGeocodeFromString('')).toBeNull();
      expect(getCachedGeocodeFromString('   ')).toBeNull();
    });

    it('should return null for cache miss', () => {
      const result = getCachedGeocodeFromString('Storgata 1, 0155 Oslo');
      expect(result).toBeNull();
    });

    it('should find cached result with string address', async () => {
      const address: ListingAddress = {
        street: 'Storgata 1',
        postalCode: '0155',
        city: 'Oslo',
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          features: [
            {
              center: [10.7522, 59.9139],
              place_name: 'Storgata 1, 0155 Oslo, Norway',
              relevance: 1.0,
              place_type: ['address'],
            },
          ],
        }),
      } as Response);

      const config: GeocodeConfig = {
        mapboxToken: 'test-token',
      };

      await geocodeListingAddress(address, config);

      // Should find via string lookup
      const cached = getCachedGeocodeFromString('Storgata 1, 0155 Oslo, Norway');
      expect(cached).not.toBeNull();
      expect(cached?.latitude).toBe(59.9139);
    });

    it('should normalize string address (case insensitive)', async () => {
      const address: ListingAddress = {
        street: 'Storgata 1',
        city: 'Oslo',
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          features: [
            {
              center: [10.7522, 59.9139],
              place_name: 'Storgata 1, Oslo, Norway',
              relevance: 1.0,
              place_type: ['address'],
            },
          ],
        }),
      } as Response);

      const config: GeocodeConfig = {
        mapboxToken: 'test-token',
      };

      await geocodeListingAddress(address, config);

      // Different case should still find cache
      const cached = getCachedGeocodeFromString('STORGATA 1, OSLO, NORWAY');
      expect(cached).not.toBeNull();
    });

    it('should add country if not present', async () => {
      const address: ListingAddress = {
        street: 'Storgata 1',
        city: 'Oslo',
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          features: [
            {
              center: [10.7522, 59.9139],
              place_name: 'Storgata 1, Oslo, Norway',
              relevance: 1.0,
              place_type: ['address'],
            },
          ],
        }),
      } as Response);

      const config: GeocodeConfig = {
        mapboxToken: 'test-token',
      };

      await geocodeListingAddress(address, config);

      // String without country should still find cache
      const cached = getCachedGeocodeFromString('Storgata 1, Oslo');
      expect(cached).not.toBeNull();
    });

    it('should use custom country parameter', async () => {
      const address: ListingAddress = {
        street: 'Main Street 1',
        city: 'Stockholm',
        country: 'Sweden',
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          features: [
            {
              center: [18.0686, 59.3293],
              place_name: 'Main Street 1, Stockholm, Sweden',
              relevance: 1.0,
              place_type: ['address'],
            },
          ],
        }),
      } as Response);

      const config: GeocodeConfig = {
        mapboxToken: 'test-token',
      };

      await geocodeListingAddress(address, config);

      // Should find with custom country
      const cached = getCachedGeocodeFromString('Main Street 1, Stockholm', 'Sweden');
      expect(cached).not.toBeNull();
    });
  });

  describe('clearGeocodeCache', () => {
    it('should clear all cached entries', async () => {
      const address: ListingAddress = {
        street: 'Storgata 1',
        city: 'Oslo',
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          features: [
            {
              center: [10.7522, 59.9139],
              place_name: 'Storgata 1, Oslo, Norway',
              relevance: 1.0,
              place_type: ['address'],
            },
          ],
        }),
      } as Response);

      const config: GeocodeConfig = {
        mapboxToken: 'test-token',
      };

      await geocodeListingAddress(address, config);

      // Verify cached
      expect(getCachedGeocode(address)).not.toBeNull();

      // Clear cache
      clearGeocodeCache();

      // Verify cleared
      expect(getCachedGeocode(address)).toBeNull();
    });
  });

  // =============================================================================
  // Cache - TTL (Time To Live)
  // =============================================================================

  describe('Cache TTL', () => {
    it('should expire cached entries after 24 hours', async () => {
      const address: ListingAddress = {
        street: 'Storgata 1',
        city: 'Oslo',
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          features: [
            {
              center: [10.7522, 59.9139],
              place_name: 'Storgata 1, Oslo, Norway',
              relevance: 1.0,
              place_type: ['address'],
            },
          ],
        }),
      } as Response);

      const config: GeocodeConfig = {
        mapboxToken: 'test-token',
      };

      // Mock Date.now for cache timestamp
      const originalDateNow = Date.now;
      const startTime = 1000000000000;
      Date.now = vi.fn(() => startTime);

      await geocodeListingAddress(address, config);

      // Verify cached
      expect(getCachedGeocode(address)).not.toBeNull();

      // Advance time by 24 hours + 1ms
      const expiredTime = startTime + 24 * 60 * 60 * 1000 + 1;
      Date.now = vi.fn(() => expiredTime);

      // Should be expired
      expect(getCachedGeocode(address)).toBeNull();

      // Restore Date.now
      Date.now = originalDateNow;
    });

    it('should not expire cached entries before 24 hours', async () => {
      const address: ListingAddress = {
        street: 'Storgata 1',
        city: 'Oslo',
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          features: [
            {
              center: [10.7522, 59.9139],
              place_name: 'Storgata 1, Oslo, Norway',
              relevance: 1.0,
              place_type: ['address'],
            },
          ],
        }),
      } as Response);

      const config: GeocodeConfig = {
        mapboxToken: 'test-token',
      };

      // Mock Date.now for cache timestamp
      const originalDateNow = Date.now;
      const startTime = 1000000000000;
      Date.now = vi.fn(() => startTime);

      await geocodeListingAddress(address, config);

      // Advance time by 23 hours (still valid)
      const notExpiredTime = startTime + 23 * 60 * 60 * 1000;
      Date.now = vi.fn(() => notExpiredTime);

      // Should still be cached
      expect(getCachedGeocode(address)).not.toBeNull();

      // Restore Date.now
      Date.now = originalDateNow;
    });
  });

  // =============================================================================
  // Cache - LRU Eviction
  // =============================================================================

  describe('Cache LRU Eviction', () => {
    it('should evict oldest entry when cache exceeds 500 entries', async () => {
      const config: GeocodeConfig = {
        mapboxToken: 'test-token',
      };

      // Mock Date.now to prevent TTL expiration during test
      const originalDateNow = Date.now;
      Date.now = vi.fn(() => 1000000000000);

      // Fill cache with 500 entries
      for (let i = 0; i < 500; i++) {
        const address: ListingAddress = {
          street: `Street ${i}`,
          city: 'Oslo',
        };

        vi.mocked(fetch).mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            features: [
              {
                center: [10.7522 + i * 0.001, 59.9139 + i * 0.001],
                place_name: `Street ${i}, Oslo, Norway`,
                relevance: 1.0,
                place_type: ['address'],
              },
            ],
          }),
        } as Response);

        await geocodeListingAddress(address, config);
      }

      // Verify first entry is cached
      const firstAddress: ListingAddress = {
        street: 'Street 0',
        city: 'Oslo',
      };
      expect(getCachedGeocode(firstAddress)).not.toBeNull();

      // Add one more entry to trigger eviction
      const newAddress: ListingAddress = {
        street: 'New Street',
        city: 'Oslo',
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          features: [
            {
              center: [10.7522, 59.9139],
              place_name: 'New Street, Oslo, Norway',
              relevance: 1.0,
              place_type: ['address'],
            },
          ],
        }),
      } as Response);

      await geocodeListingAddress(newAddress, config);

      // First entry should be evicted (LRU)
      expect(getCachedGeocode(firstAddress)).toBeNull();

      // New entry should be cached
      expect(getCachedGeocode(newAddress)).not.toBeNull();

      // Restore Date.now
      Date.now = originalDateNow;
    });
  });

  // =============================================================================
  // Geocoding API - Success Cases
  // =============================================================================

  describe('geocodeListingAddress', () => {
    it('should successfully geocode an address', async () => {
      const address: ListingAddress = {
        street: 'Storgata 1',
        postalCode: '0155',
        city: 'Oslo',
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          features: [
            {
              center: [10.7522, 59.9139],
              place_name: 'Storgata 1, 0155 Oslo, Norway',
              relevance: 1.0,
              place_type: ['address'],
            },
          ],
        }),
      } as Response);

      const config: GeocodeConfig = {
        mapboxToken: 'test-token',
      };

      const result = await geocodeListingAddress(address, config);

      expect(isGeocodeSuccess(result)).toBe(true);
      if (isGeocodeSuccess(result)) {
        expect(result.latitude).toBe(59.9139);
        expect(result.longitude).toBe(10.7522);
        expect(result.formattedAddress).toBe('Storgata 1, 0155 Oslo, Norway');
        expect(result.confidence).toBe(1.0);
        expect(result.provider).toBe('mapbox');
      }
    });

    it('should use cached result on second call', async () => {
      const address: ListingAddress = {
        street: 'Storgata 1',
        city: 'Oslo',
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          features: [
            {
              center: [10.7522, 59.9139],
              place_name: 'Storgata 1, Oslo, Norway',
              relevance: 1.0,
              place_type: ['address'],
            },
          ],
        }),
      } as Response);

      const config: GeocodeConfig = {
        mapboxToken: 'test-token',
      };

      // First call
      const result1 = await geocodeListingAddress(address, config);
      expect(isGeocodeSuccess(result1)).toBe(true);

      // Second call should use cache (no fetch)
      const result2 = await geocodeListingAddress(address, config);
      expect(isGeocodeSuccess(result2)).toBe(true);

      // Fetch should only be called once
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should include proximity parameter when city is recognized', async () => {
      const address: ListingAddress = {
        street: 'Testgata 1',
        city: 'Oslo',
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          features: [
            {
              center: [10.7522, 59.9139],
              place_name: 'Testgata 1, Oslo, Norway',
              relevance: 1.0,
              place_type: ['address'],
            },
          ],
        }),
      } as Response);

      const config: GeocodeConfig = {
        mapboxToken: 'test-token',
      };

      await geocodeListingAddress(address, config);

      // Verify proximity parameter was included
      const fetchCall = vi.mocked(fetch).mock.calls[0]![0] as string;
      expect(fetchCall).toContain('proximity=10.7522,59.9139');
    });

    it('should use custom proximity from config', async () => {
      const address: ListingAddress = {
        street: 'Testgata 1',
        city: 'Oslo',
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          features: [
            {
              center: [10.7522, 59.9139],
              place_name: 'Testgata 1, Oslo, Norway',
              relevance: 1.0,
              place_type: ['address'],
            },
          ],
        }),
      } as Response);

      const config: GeocodeConfig = {
        mapboxToken: 'test-token',
        proximity: [11.0, 60.0],
      };

      await geocodeListingAddress(address, config);

      // Verify custom proximity was used
      const fetchCall = vi.mocked(fetch).mock.calls[0]![0] as string;
      expect(fetchCall).toContain('proximity=11,60');
    });
  });

  // =============================================================================
  // Geocoding API - Error Cases
  // =============================================================================

  describe('geocodeListingAddress - Error Handling', () => {
    it('should return error when mapbox token is missing', async () => {
      const address: ListingAddress = {
        street: 'Storgata 1',
        city: 'Oslo',
      };

      const config: GeocodeConfig = {
        mapboxToken: '',
      };

      const result = await geocodeListingAddress(address, config);

      expect(isGeocodeError(result)).toBe(true);
      if (isGeocodeError(result)) {
        expect(result.code).toBe('PROVIDER_ERROR');
        expect(result.message).toContain('Mapbox access token is required');
      }
    });

    it('should return error for empty address', async () => {
      const address: ListingAddress = {};

      const config: GeocodeConfig = {
        mapboxToken: 'test-token',
      };

      const result = await geocodeListingAddress(address, config);

      expect(isGeocodeError(result)).toBe(true);
      if (isGeocodeError(result)) {
        expect(result.code).toBe('INVALID_ADDRESS');
        expect(result.message).toContain('Address is empty or incomplete');
      }
    });

    it('should return error when no results found', async () => {
      const address: ListingAddress = {
        street: 'Nonexistent Street 999',
        city: 'Oslo',
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          features: [],
        }),
      } as Response);

      const config: GeocodeConfig = {
        mapboxToken: 'test-token',
      };

      const result = await geocodeListingAddress(address, config);

      expect(isGeocodeError(result)).toBe(true);
      if (isGeocodeError(result)) {
        expect(result.code).toBe('NOT_FOUND');
        expect(result.message).toContain('No coordinates found');
      }
    });

    it('should return error on API failure', async () => {
      const address: ListingAddress = {
        street: 'Storgata 1',
        city: 'Oslo',
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      } as Response);

      const config: GeocodeConfig = {
        mapboxToken: 'invalid-token',
      };

      const result = await geocodeListingAddress(address, config);

      expect(isGeocodeError(result)).toBe(true);
      if (isGeocodeError(result)) {
        expect(result.code).toBe('PROVIDER_ERROR');
        expect(result.message).toContain('401');
      }
    });

    it('should return timeout error on slow API', async () => {
      const address: ListingAddress = {
        street: 'Storgata 1',
        city: 'Oslo',
      };

      vi.mocked(fetch).mockImplementation(
        () =>
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error('AbortError')), 100);
          })
      );

      const config: GeocodeConfig = {
        mapboxToken: 'test-token',
        timeout: 50,
      };

      const result = await geocodeListingAddress(address, config);

      expect(isGeocodeError(result)).toBe(true);
      if (isGeocodeError(result)) {
        expect(result.code).toBe('PROVIDER_ERROR');
      }
    });

    it('should return error on network failure', async () => {
      const address: ListingAddress = {
        street: 'Storgata 1',
        city: 'Oslo',
      };

      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

      const config: GeocodeConfig = {
        mapboxToken: 'test-token',
      };

      const result = await geocodeListingAddress(address, config);

      expect(isGeocodeError(result)).toBe(true);
      if (isGeocodeError(result)) {
        expect(result.code).toBe('PROVIDER_ERROR');
        expect(result.message).toContain('Network error');
      }
    });
  });

  // =============================================================================
  // Batch Geocoding
  // =============================================================================

  describe('geocodeAddresses', () => {
    it('should geocode multiple addresses', async () => {
      const addresses: ListingAddress[] = [
        { street: 'Storgata 1', city: 'Oslo' },
        { street: 'Testgata 2', city: 'Bergen' },
      ];

      vi.mocked(fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            features: [
              {
                center: [10.7522, 59.9139],
                place_name: 'Storgata 1, Oslo, Norway',
                relevance: 1.0,
                place_type: ['address'],
              },
            ],
          }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            features: [
              {
                center: [5.3221, 60.3913],
                place_name: 'Testgata 2, Bergen, Norway',
                relevance: 1.0,
                place_type: ['address'],
              },
            ],
          }),
        } as Response);

      const config: GeocodeConfig = {
        mapboxToken: 'test-token',
      };

      const results = await geocodeAddresses(addresses, config);

      expect(results).toHaveLength(2);
      expect(isGeocodeSuccess(results[0]!.result)).toBe(true);
      expect(isGeocodeSuccess(results[1]!.result)).toBe(true);
    });

    it('should respect concurrency limit', async () => {
      const addresses: ListingAddress[] = [
        { street: 'Street 1', city: 'Oslo' },
        { street: 'Street 2', city: 'Oslo' },
        { street: 'Street 3', city: 'Oslo' },
        { street: 'Street 4', city: 'Oslo' },
      ];

      vi.mocked(fetch).mockImplementation(async () => ({
        ok: true,
        json: async () => ({
          features: [
            {
              center: [10.7522, 59.9139],
              place_name: 'Test Address, Oslo, Norway',
              relevance: 1.0,
              place_type: ['address'],
            },
          ],
        }),
      })) as any;

      const config: GeocodeConfig = {
        mapboxToken: 'test-token',
      };

      await geocodeAddresses(addresses, config, {
        concurrency: 2,
        delayMs: 10,
      });

      // Should make 4 API calls total
      expect(fetch).toHaveBeenCalledTimes(4);
    });

    it('should handle mixed success and error results', async () => {
      const addresses: ListingAddress[] = [
        { street: 'Storgata 1', city: 'Oslo' },
        { street: 'Invalid', city: 'Invalid' },
      ];

      vi.mocked(fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            features: [
              {
                center: [10.7522, 59.9139],
                place_name: 'Storgata 1, Oslo, Norway',
                relevance: 1.0,
                place_type: ['address'],
              },
            ],
          }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            features: [],
          }),
        } as Response);

      const config: GeocodeConfig = {
        mapboxToken: 'test-token',
      };

      const results = await geocodeAddresses(addresses, config);

      expect(results).toHaveLength(2);
      expect(isGeocodeSuccess(results[0]!.result)).toBe(true);
      expect(isGeocodeError(results[1]!.result)).toBe(true);
    });
  });

  // =============================================================================
  // Type Guards
  // =============================================================================

  describe('Type Guards', () => {
    it('isGeocodeSuccess should identify successful results', () => {
      const success: GeocodeResult = {
        latitude: 59.9139,
        longitude: 10.7522,
        formattedAddress: 'Test Address',
        confidence: 1.0,
        provider: 'mapbox',
      };

      expect(isGeocodeSuccess(success)).toBe(true);
      expect(isGeocodeError(success)).toBe(false);
    });

    it('isGeocodeError should identify error results', () => {
      const error = {
        code: 'NOT_FOUND' as const,
        message: 'Address not found',
      };

      expect(isGeocodeError(error)).toBe(true);
      expect(isGeocodeSuccess(error)).toBe(false);
    });
  });

  // =============================================================================
  // Legacy Function
  // =============================================================================

  describe('geocodeAddress (legacy)', () => {
    it('should geocode string address', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          features: [
            {
              center: [10.7522, 59.9139],
              place_name: 'Storgata 1, 0155 Oslo, Norway',
              relevance: 1.0,
              place_type: ['address'],
            },
          ],
        }),
      } as Response);

      const result = await geocodeAddress('Storgata 1, 0155 Oslo', {
        mapboxToken: 'test-token',
      });

      expect(result).not.toBeNull();
      expect(result?.latitude).toBe(59.9139);
      expect(result?.longitude).toBe(10.7522);
    });

    it('should return null when mapbox token is missing', async () => {
      const result = await geocodeAddress('Storgata 1, Oslo', {
        mapboxToken: undefined,
      });

      expect(result).toBeNull();
    });

    it('should return null on geocoding error', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          features: [],
        }),
      } as Response);

      const result = await geocodeAddress('Invalid Address', {
        mapboxToken: 'test-token',
      });

      expect(result).toBeNull();
    });

    it('should parse address string into components', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          features: [
            {
              center: [10.7522, 59.9139],
              place_name: 'Storgata 1, 0155 Oslo, Norway',
              relevance: 1.0,
              place_type: ['address'],
            },
          ],
        }),
      } as Response);

      await geocodeAddress('Storgata 1, 0155 Oslo, Oslo Kommune', {
        mapboxToken: 'test-token',
      });

      // Verify address was parsed and geocoded
      expect(fetch).toHaveBeenCalledTimes(1);
      const fetchCall = vi.mocked(fetch).mock.calls[0]![0] as string;
      expect(fetchCall).toContain('Storgata%201');
    });
  });
});
