/**
 * Geocoding Utilities
 * Convert addresses to coordinates using Mapbox Geocoding API
 */

export interface GeocodedLocation {
  latitude: number;
  longitude: number;
  placeName: string;
}

// In-memory cache for geocoded results
const geocodeCache = new Map<string, GeocodedLocation | null>();

/**
 * Geocode an address to coordinates using Mapbox Geocoding API
 * @param address - The address string to geocode
 * @param mapboxToken - Mapbox access token
 * @param country - Country code to bias results (default: 'no' for Norway)
 * @returns Geocoded location or null if not found
 */
export async function geocodeAddress(
  address: string,
  mapboxToken: string,
  country: string = 'no'
): Promise<GeocodedLocation | null> {
  if (!address || !mapboxToken) {
    return null;
  }

  // Normalize the address for cache key
  const cacheKey = `${address.toLowerCase().trim()}:${country}`;

  // Check cache first
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey) ?? null;
  }

  try {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${mapboxToken}&country=${country}&limit=1&language=no`;

    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`Geocoding failed for "${address}": ${response.status}`);
      geocodeCache.set(cacheKey, null);
      return null;
    }

    const data = await response.json();

    if (!data.features || data.features.length === 0) {
      console.warn(`No geocoding results for "${address}"`);
      geocodeCache.set(cacheKey, null);
      return null;
    }

    const feature = data.features[0];
    const [longitude, latitude] = feature.center;

    const result: GeocodedLocation = {
      latitude,
      longitude,
      placeName: feature.place_name || address,
    };

    // Cache the result
    geocodeCache.set(cacheKey, result);

    return result;
  } catch (error) {
    console.error(`Geocoding error for "${address}":`, error);
    geocodeCache.set(cacheKey, null);
    return null;
  }
}

/**
 * Batch geocode multiple addresses
 * @param addresses - Array of addresses to geocode
 * @param mapboxToken - Mapbox access token
 * @param country - Country code to bias results
 * @returns Map of address to geocoded location
 */
export async function geocodeAddresses(
  addresses: string[],
  mapboxToken: string,
  country: string = 'no'
): Promise<Map<string, GeocodedLocation | null>> {
  const results = new Map<string, GeocodedLocation | null>();

  // Process in batches to avoid rate limiting
  const batchSize = 5;
  for (let i = 0; i < addresses.length; i += batchSize) {
    const batch = addresses.slice(i, i + batchSize);
    const batchPromises = batch.map(address =>
      geocodeAddress(address, mapboxToken, country)
        .then(result => ({ address, result }))
    );

    const batchResults = await Promise.all(batchPromises);
    batchResults.forEach(({ address, result }) => {
      results.set(address, result);
    });

    // Small delay between batches to respect rate limits
    if (i + batchSize < addresses.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return results;
}

/**
 * Clear the geocode cache
 */
export function clearGeocodeCache(): void {
  geocodeCache.clear();
}

/**
 * Get cached geocode result without making API call
 */
export function getCachedGeocode(address: string, country: string = 'no'): GeocodedLocation | null | undefined {
  const cacheKey = `${address.toLowerCase().trim()}:${country}`;
  return geocodeCache.get(cacheKey);
}
