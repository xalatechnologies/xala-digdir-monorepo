/**
 * Geocoding Hooks
 * React hooks for geocoding addresses to coordinates
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { geocodeAddress, getCachedGeocode, type GeocodedLocation } from '../utils/geocode';

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
  /** Mapbox access token */
  mapboxToken: string;
  /** Country code for geocoding bias (default: 'no') */
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
 * Caches results and processes in batches to avoid rate limiting
 */
export function useGeocodeListings<T extends { id: string }>(
  options: UseGeocodeListingsOptions<T>
): UseGeocodeListingsResult<T> {
  const {
    items,
    getAddress,
    hasCoordinates = () => false,
    mapboxToken,
    country = 'no',
    enabled = true,
  } = options;

  const [geocodedMap, setGeocodedMap] = useState<Map<string, GeocodedLocation | null>>(new Map());
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [retryTrigger, setRetryTrigger] = useState(0);

  // Find items that need geocoding
  const itemsNeedingGeocode = useMemo(() => {
    if (!enabled || !mapboxToken) return [];
    return items.filter(item => {
      if (hasCoordinates(item)) return false;
      const address = getAddress(item);
      if (!address) return false;
      // Check if we already have a cached result
      const cached = getCachedGeocode(address, country);
      return cached === undefined; // undefined means not cached, null means failed
    });
  }, [items, getAddress, hasCoordinates, mapboxToken, country, enabled]);

  // Geocode items that need it
  useEffect(() => {
    if (!enabled || !mapboxToken || itemsNeedingGeocode.length === 0) {
      return;
    }

    let cancelled = false;
    setIsGeocoding(true);

    const geocodeItems = async () => {
      const batchSize = 3;
      const newResults = new Map<string, GeocodedLocation | null>();

      for (let i = 0; i < itemsNeedingGeocode.length && !cancelled; i += batchSize) {
        const batch = itemsNeedingGeocode.slice(i, i + batchSize);

        const batchPromises = batch.map(async item => {
          const address = getAddress(item);
          const result = await geocodeAddress(address, mapboxToken, country);
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
          await new Promise(resolve => setTimeout(resolve, 150));
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
  }, [itemsNeedingGeocode, mapboxToken, country, enabled, getAddress, retryTrigger]);

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
      const cached = getCachedGeocode(address, country);
      if (cached) {
        return {
          ...item,
          latitude: cached.latitude,
          longitude: cached.longitude,
        };
      }

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
    let failed = 0;

    items.forEach(item => {
      if (hasCoordinates(item)) {
        geocoded++;
        return;
      }

      const address = getAddress(item);
      if (!address) return;

      const cached = getCachedGeocode(address, country);
      if (cached === null) {
        failed++;
      } else if (cached !== undefined) {
        geocoded++;
      }
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
 */
export function useGeocode(
  address: string | null | undefined,
  mapboxToken: string,
  country: string = 'no'
): {
  location: GeocodedLocation | null;
  isGeocoding: boolean;
  error: boolean;
} {
  const [location, setLocation] = useState<GeocodedLocation | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!address || !mapboxToken) {
      setLocation(null);
      return;
    }

    // Check cache first
    const cached = getCachedGeocode(address, country);
    if (cached !== undefined) {
      setLocation(cached);
      setError(cached === null);
      return;
    }

    let cancelled = false;
    setIsGeocoding(true);
    setError(false);

    geocodeAddress(address, mapboxToken, country)
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
  }, [address, mapboxToken, country]);

  return { location, isGeocoding, error };
}
