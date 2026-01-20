/**
 * SDK Geocoding Tests
 * Validates SDK geocoding utility exports
 */

import { describe, it, expect } from 'vitest';

describe('SDK Geocoding Utils', () => {
  describe('geocodeAddress', () => {
    it('should export geocodeAddress function', async () => {
      const { geocodeAddress } = await import('@digilist/client-sdk');
      expect(geocodeAddress).toBeDefined();
      expect(typeof geocodeAddress).toBe('function');
    });
  });

  describe('geocodeAddresses', () => {
    it('should export geocodeAddresses function', async () => {
      const { geocodeAddresses } = await import('@digilist/client-sdk');
      expect(geocodeAddresses).toBeDefined();
      expect(typeof geocodeAddresses).toBe('function');
    });
  });

  describe('clearGeocodeCache', () => {
    it('should export clearGeocodeCache function', async () => {
      const { clearGeocodeCache } = await import('@digilist/client-sdk');
      expect(clearGeocodeCache).toBeDefined();
      expect(typeof clearGeocodeCache).toBe('function');
    });
  });

  describe('getCachedGeocode', () => {
    it('should export getCachedGeocode function', async () => {
      const { getCachedGeocode } = await import('@digilist/client-sdk');
      expect(getCachedGeocode).toBeDefined();
      expect(typeof getCachedGeocode).toBe('function');
    });
  });

  describe('buildAddressString', () => {
    it('should export buildAddressString function', async () => {
      const { buildAddressString } = await import('@digilist/client-sdk');
      expect(buildAddressString).toBeDefined();
      expect(typeof buildAddressString).toBe('function');
    });
  });
});
