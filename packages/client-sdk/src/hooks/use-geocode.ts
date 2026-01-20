/**
 * Geocoding Hooks
 * React hooks for geocoding addresses to coordinates using Google Places API or Mapbox
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  geocodeAddress,
  buildAddressString,
  type GeocodedLocation,
  type GeocodeConfig,
} from '@/utils/geocode';

export interface GeocodedItem<T> {
  item: T;
  geocoded: GeocodedLocation | null;
  isGeocoding: boolean;
}

export interface UseGeocodeListingsOptions<T> {
  /** Array of items to geocode */
  items: T[];
  /** Function to extract address from item */
  getAddress: (item: T) => string;
  /** Function to check if item already has coordinates */
  hasCoordinates?: (item: T) => boolean;
  /** Google Places API key (primary geocoder) */
  googleApiKey?: string;
  /** Mapbox access token (fallback geocoder) */
  mapboxToken?: string;
  /** Country code for geocoding bias (default: 'NO') */
  country?: string;
  /** Whether to enable geocoding (default: true) */
  enabled?: boolean;
}

export interface UseGeocodeListingsResult<T> {
  /** Items with geocoded coordinates */
  geocodedItems: Array<T & { latitude: number; longitude: number }>;
  /** Whether any items are still being geocoded */
  isGeocoding: boolean;
  /** Number of items successfully geocoded */
  geocodedCount: number;
  /** Number of items that failed to geocode */
  failedCount: number;
  /** Retry geocoding for failed items */
  retry: () => void;
}

/**
 * Hook to geocode a list of items that have address fields
 * Uses Google Places API as primary, falls back to Mapbox
 * Caches results and processes in batches to avoid rate limiting
 */
export function useGeocodeListings<T extends { id: string }>(
  options: UseGeocodeListingsOptions<T>
): UseGeocodeListingsResult<T> {
  const {
    items,
    getAddress,
    hasCoordinates = () => false,
    googleApiKey,
    mapboxToken,
    country = 'NO',
    enabled = true,
  } = options;

  const [geocodedMap, setGeocodedMap] = useState<Map<string, GeocodedLocation | null>>(new Map());
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [retryTrigger, setRetryTrigger] = useState(0);

  // Build config for geocoding
  const geocodeConfig = useMemo(() => ({
    mapboxToken,
    googleApiKey,
    country,
    language: 'no',
  }), [mapboxToken, googleApiKey, country]);

  // Check if we have any API keys
  const hasApiKeys = Boolean(googleApiKey || mapboxToken);

  // Find items that need geocoding
  const itemsNeedingGeocode = useMemo(() => {
    if (!enabled || !hasApiKeys) return [];
    return items.filter(item => {
      if (hasCoordinates(item)) return false;
      const address = getAddress(item);
      if (!address) return false;
      // Check if we already have a cached result
      // const cached = getCachedGeocode(address, country); // TODO: Fix cache call
      return true; // TODO: Check cache properly // undefined means not cached, null means failed
    });
  }, [items, getAddress, hasCoordinates, hasApiKeys, country, enabled]);

  // Geocode items that need it
  useEffect(() => {
    if (!enabled || !hasApiKeys || itemsNeedingGeocode.length === 0) {
      return;
    }

    let cancelled = false;
    setIsGeocoding(true);

    const geocodeItems = async () => {
      // Use larger batches with Google (more reliable)
      const batchSize = googleApiKey ? 5 : 3;
      const delayMs = googleApiKey ? 100 : 150;
      const newResults = new Map<string, GeocodedLocation | null>();

      for (let i = 0; i < itemsNeedingGeocode.length && !cancelled; i += batchSize) {
        const batch = itemsNeedingGeocode.slice(i, i + batchSize);

        const batchPromises = batch.map(async item => {
          const address = getAddress(item);
          const result = await geocodeAddress(address, geocodeConfig);
          return { address, result };
        });

        const results = await Promise.all(batchPromises);
        results.forEach(({ address, result }) => {
          newResults.set(address, result);
        });

        // Update state incrementally
        if (!cancelled) {
          setGeocodedMap(prev => {
            const updated = new Map(prev);
            newResults.forEach((value, key) => updated.set(key, value));
            return updated;
          });
        }

        // Small delay between batches
        if (i + batchSize < itemsNeedingGeocode.length && !cancelled) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }

      if (!cancelled) {
        setIsGeocoding(false);
      }
    };

    geocodeItems();

    return () => {
      cancelled = true;
    };
  }, [itemsNeedingGeocode, geocodeConfig, enabled, getAddress, retryTrigger, googleApiKey, hasApiKeys]);

  // Build the final geocoded items list
  const geocodedItems = useMemo(() => {
    return items.map(item => {
      // If item already has coordinates, use them
      if (hasCoordinates(item)) {
        return item as T & { latitude: number; longitude: number };
      }

      const address = getAddress(item);
      if (!address) {
        return item as T & { latitude: number; longitude: number };
      }

      // Check cache first
      // const cached = getCachedGeocode(address, country); // TODO: Fix cache call
      // if (cached) {
      //   return {
      //     ...item,
      //     latitude: cached.latitude,
      //     longitude: cached.longitude,
      //   };
      // }

      // Check our local state
      const geocoded = geocodedMap.get(address);
      if (geocoded) {
        return {
          ...item,
          latitude: geocoded.latitude,
          longitude: geocoded.longitude,
        };
      }

      // Return item as-is (may not have coordinates)
      return item as T & { latitude: number; longitude: number };
    });
  }, [items, getAddress, hasCoordinates, geocodedMap, country]);

  // Count statistics
  const { geocodedCount, failedCount } = useMemo(() => {
    let geocoded = 0;
    const failed = 0;

    items.forEach(item => {
      if (hasCoordinates(item)) {
        geocoded++;
        return;
      }

      const address = getAddress(item);
      if (!address) return;

      // const cached = getCachedGeocode(address, country); // TODO: Fix cache call
      // if (cached === null) {
      //   failed++;
      // } else if (cached !== undefined) {
      //   geocoded++;
      // }
    });

    return { geocodedCount: geocoded, failedCount: failed };
  }, [items, getAddress, hasCoordinates, country]);

  const retry = useCallback(() => {
    setRetryTrigger(prev => prev + 1);
  }, []);

  return {
    geocodedItems,
    isGeocoding,
    geocodedCount,
    failedCount,
    retry,
  };
}

/**
 * Simple hook to geocode a single address
 * Uses Google Places API as primary, falls back to Mapbox
 */
export function useGeocode(
  address: string | null | undefined,
  config: GeocodeConfig
): {
  location: GeocodedLocation | null;
  isGeocoding: boolean;
  error: boolean;
} {
  const [location, setLocation] = useState<GeocodedLocation | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [error, setError] = useState(false);

  const { mapboxToken, country = 'NO' } = config;
  const hasApiKeys = Boolean(mapboxToken);

  useEffect(() => {
    if (!address || !hasApiKeys) {
      setLocation(null);
      return;
    }

    // Check cache first (note: getCachedGeocode expects ListingAddress object, not string)
    // For now, skip caching for string addresses
    // // const cached = getCachedGeocode(address, country); // TODO: Fix cache call
    // if (cached !== undefined) {
    //   setLocation(cached);
    //   setError(cached === null);
    //   return;
    // }

    let cancelled = false;
    setIsGeocoding(true);
    setError(false);

    geocodeAddress(address, config)
      .then(result => {
        if (!cancelled) {
          setLocation(result);
          setError(result === null);
          setIsGeocoding(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLocation(null);
          setError(true);
          setIsGeocoding(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [address, config, hasApiKeys, country]);

  return { location, isGeocoding, error };
}

// Re-export buildAddressString for convenience
export { buildAddressString };
