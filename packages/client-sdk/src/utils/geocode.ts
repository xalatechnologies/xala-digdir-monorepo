/**
 * Mapbox Forward Geocoding Utility
 *
 * Converts listing addresses to latitude/longitude coordinates using Mapbox Geocoding API.
 * Framework-agnostic, pure TypeScript utility with no UI dependencies.
 *
 * @example
 * ```typescript
 * const result = await geocodeListingAddress({
 *   street: 'Storgata 1',
 *   postalCode: '0155',
 *   city: 'Oslo'
 * });
 *
 * if ('latitude' in result) {
 *   listing.latitude = result.latitude;
 *   listing.longitude = result.longitude;
 * }
 * ```
 */

// =============================================================================
// Types
// =============================================================================

/**
 * Address input for geocoding
 */
export interface ListingAddress {
  street?: string;
  postalCode?: string;
  city?: string;
  municipality?: string;
  country?: string; // default: "Norway"
}

/**
 * Successful geocoding result
 */
export interface GeocodeResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  confidence: number;
  provider: 'mapbox';
}

/**
 * Geocoding error codes
 */
export type GeocodeErrorCode = 'NOT_FOUND' | 'INVALID_ADDRESS' | 'PROVIDER_ERROR' | 'TIMEOUT';

/**
 * Geocoding error result
 */
export interface GeocodeError {
  code: GeocodeErrorCode;
  message: string;
}

/**
 * Configuration for geocoding requests
 */
export interface GeocodeConfig {
  /** Mapbox access token (required) */
  mapboxToken: string;
  /** Request timeout in milliseconds (default: 5000) */
  timeout?: number;
  /** Language for results (default: 'nb' for Norwegian) */
  language?: string;
  /** Country code to bias results (default: 'no' for Norway) */
  country?: string;
  /** Proximity bias [longitude, latitude] - results near this point are prioritized */
  proximity?: [number, number];
}

// =============================================================================
// In-Memory Cache (LRU)
// =============================================================================

interface CacheEntry {
  result: GeocodeResult;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_MAX_SIZE = 500;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get cached result if valid
 */
function getCached(key: string): GeocodeResult | null {
  const entry = cache.get(key);
  if (!entry) return null;

  // Check TTL
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }

  return entry.result;
}

/**
 * Store result in cache with LRU eviction
 */
function setCache(key: string, result: GeocodeResult): void {
  // LRU eviction - remove oldest entries if at capacity
  if (cache.size >= CACHE_MAX_SIZE) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) cache.delete(oldestKey);
  }

  cache.set(key, { result, timestamp: Date.now() });
}

/**
 * Clear the geocoding cache
 */
export function clearGeocodeCache(): void {
  cache.clear();
}

/**
 * Get a cached geocode result without making an API call
 */
export function getCachedGeocode(address: ListingAddress): GeocodeResult | null {
  const key = buildCacheKey(address);
  return getCached(key);
}

/**
 * Get a cached geocode result from a string address without making an API call
 *
 * This adapter function allows looking up cached results using a plain string address
 * instead of a structured ListingAddress object. Useful for hooks that work with
 * string addresses.
 *
 * @param addressString - The address string (e.g., "Storgata 1, 0155 Oslo")
 * @param country - Optional country name (defaults to "Norway")
 * @returns Cached GeocodeResult if found, null if not in cache or cache expired
 *
 * @example
 * ```typescript
 * const cached = getCachedGeocodeFromString("Storgata 1, 0155 Oslo", "Norway");
 * if (cached) {
 *   console.log("Using cached coordinates:", cached.latitude, cached.longitude);
 * }
 * ```
 */
export function getCachedGeocodeFromString(
  addressString: string,
  country?: string
): GeocodeResult | null {
  if (!addressString?.trim()) return null;

  // Normalize the address string
  const normalizedAddress = addressString.trim();

  // Add country if not already present in the address string
  const countryName = country || 'Norway';
  const addressWithCountry = normalizedAddress.toLowerCase().includes(countryName.toLowerCase())
    ? normalizedAddress
    : `${normalizedAddress}, ${countryName}`;

  // Convert to lowercase to match buildCacheKey behavior
  const cacheKey = addressWithCountry.toLowerCase();

  // Look up in cache using the existing getCached function
  return getCached(cacheKey);
}

// =============================================================================
// Address Normalization
// =============================================================================

/**
 * Build a normalized address string for geocoding
 * Skips empty/undefined fields and joins with commas
 */
export function buildAddressString(address: ListingAddress): string {
  const parts: string[] = [];

  // Street address
  if (address.street?.trim()) {
    parts.push(address.street.trim());
  }

  // Postal code and city together
  const postalCity: string[] = [];
  if (address.postalCode?.trim()) {
    postalCity.push(address.postalCode.trim());
  }
  if (address.city?.trim()) {
    postalCity.push(address.city.trim());
  }
  if (postalCity.length > 0) {
    parts.push(postalCity.join(' '));
  }

  // Municipality (if different from city)
  if (address.municipality?.trim() && address.municipality !== address.city) {
    parts.push(address.municipality.trim());
  }

  // Country (default to Norway)
  const country = address.country?.trim() || 'Norway';
  parts.push(country);

  return parts.join(', ');
}

/**
 * Build cache key from address
 */
function buildCacheKey(address: ListingAddress): string {
  return buildAddressString(address).toLowerCase();
}

// =============================================================================
// Norwegian City Coordinates (for proximity bias)
// =============================================================================

/**
 * Approximate coordinates for major Norwegian cities
 * Used to bias geocoding results toward the correct region
 */
const NORWEGIAN_CITY_COORDS: Record<string, [number, number]> = {
  // [longitude, latitude] format for Mapbox
  'oslo': [10.7522, 59.9139],
  'bergen': [5.3221, 60.3913],
  'trondheim': [10.3951, 63.4305],
  'stavanger': [5.7331, 58.9700],
  'drammen': [10.2039, 59.7439],
  'fredrikstad': [10.9343, 59.2181],
  'kristiansand': [7.9956, 58.1467],
  'tromsø': [18.9553, 69.6496],
  'sandnes': [5.7352, 58.8520],
  'sarpsborg': [11.1096, 59.2839],
  'skien': [9.6089, 59.2086],  // Skien - important for this project
  'porsgrunn': [9.6562, 59.1405],
  'bodø': [14.4049, 67.2804],
  'sandefjord': [10.2167, 59.1308],
  'arendal': [8.7726, 58.4613],
  'ålesund': [6.1549, 62.4722],
  'tønsberg': [10.4087, 59.2676],
  'haugesund': [5.2678, 59.4138],
  'moss': [10.6587, 59.4329],
  'hamar': [11.0680, 60.7945],
  'larvik': [10.0327, 59.0531],
  'halden': [11.3875, 59.1225],
  'kongsberg': [9.6500, 59.6690],
  'lillehammer': [10.4663, 61.1153],
  'molde': [7.1617, 62.7375],
  'harstad': [16.5417, 68.7983],
  'gjøvik': [10.6915, 60.7958],
  'askøy': [5.1500, 60.4000],
  'skedsmo': [11.0500, 59.9500],  // Near Oslo
  'lørenskog': [10.9667, 59.9167],
  'ski': [10.8333, 59.7167],
  'rælingen': [11.0833, 59.9333],
  'fetsund': [11.1667, 59.9167],
};

/**
 * Get proximity coordinates for a city name
 */
function getCityProximity(city: string): [number, number] | undefined {
  if (!city) return undefined;
  const normalized = city.toLowerCase().trim();
  return NORWEGIAN_CITY_COORDS[normalized];
}

// =============================================================================
// Mapbox API Integration
// =============================================================================

/** Mapbox Geocoding API response types */
interface MapboxFeature {
  center: [number, number]; // [longitude, latitude]
  place_name: string;
  relevance: number;
  place_type: string[];
}

interface MapboxResponse {
  features: MapboxFeature[];
}

/**
 * Geocode a listing address using Mapbox Forward Geocoding API
 *
 * @param address - The address to geocode
 * @param config - Geocoding configuration
 * @returns Promise resolving to GeocodeResult or GeocodeError
 */
export async function geocodeListingAddress(
  address: ListingAddress,
  config: GeocodeConfig
): Promise<GeocodeResult | GeocodeError> {
  // Validate config
  if (!config.mapboxToken) {
    return {
      code: 'PROVIDER_ERROR',
      message: 'Mapbox access token is required',
    };
  }

  // Build address string
  const addressString = buildAddressString(address);

  // Validate address
  if (!addressString || addressString === 'Norway') {
    return {
      code: 'INVALID_ADDRESS',
      message: 'Address is empty or incomplete',
    };
  }

  // Check cache first
  const cacheKey = addressString.toLowerCase();
  const cached = getCached(cacheKey);
  if (cached) {
    return cached;
  }

  // Build Mapbox API URL
  const query = encodeURIComponent(addressString);
  const language = config.language || 'nb';
  const country = config.country || 'no';
  const timeout = config.timeout || 5000;

  // Get proximity from config or try to derive from city in address
  const proximity = config.proximity || getCityProximity(address.city || '');

  let url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?` +
    `access_token=${config.mapboxToken}&` +
    `limit=1&` +
    `language=${language}&` +
    `country=${country}&` +
    `types=address,place`;

  // Add proximity bias if available - this is CRITICAL for accurate Norwegian geocoding
  // Without proximity, Mapbox may return addresses in wrong cities with same street names
  if (proximity) {
    url += `&proximity=${proximity[0]},${proximity[1]}`;
  }

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        code: 'PROVIDER_ERROR',
        message: `Mapbox API error: ${response.status} ${response.statusText}`,
      };
    }

    const data = await response.json() as MapboxResponse;

    // Check for results
    if (!data.features || data.features.length === 0) {
      return {
        code: 'NOT_FOUND',
        message: `No coordinates found for address: ${addressString}`,
      };
    }

    // Extract first result
    const feature = data.features[0]!;
    const [longitude, latitude] = feature.center;

    // Build result
    const result: GeocodeResult = {
      latitude,
      longitude,
      formattedAddress: feature.place_name,
      confidence: feature.relevance,
      provider: 'mapbox',
    };

    // Cache successful result
    setCache(cacheKey, result);

    return result;

  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      return {
        code: 'TIMEOUT',
        message: `Geocoding request timed out after ${timeout}ms`,
      };
    }

    return {
      code: 'PROVIDER_ERROR',
      message: error instanceof Error ? error.message : 'Unknown geocoding error',
    };
  }
}

// =============================================================================
// Batch Geocoding
// =============================================================================

/**
 * Result for batch geocoding operations
 */
export interface BatchGeocodeResult {
  address: ListingAddress;
  result: GeocodeResult | GeocodeError;
}

/**
 * Geocode multiple addresses with rate limiting
 *
 * @param addresses - Array of addresses to geocode
 * @param config - Geocoding configuration
 * @param options - Batch options
 * @returns Array of results in same order as input
 */
export async function geocodeAddresses(
  addresses: ListingAddress[],
  config: GeocodeConfig,
  options: {
    /** Concurrent requests (default: 3) */
    concurrency?: number;
    /** Delay between batches in ms (default: 100) */
    delayMs?: number;
  } = {}
): Promise<BatchGeocodeResult[]> {
  const { concurrency = 3, delayMs = 100 } = options;
  const results: BatchGeocodeResult[] = [];

  // Process in batches
  for (let i = 0; i < addresses.length; i += concurrency) {
    const batch = addresses.slice(i, i + concurrency);

    const batchResults = await Promise.all(
      batch.map(async (address) => ({
        address,
        result: await geocodeListingAddress(address, config),
      }))
    );

    results.push(...batchResults);

    // Rate limiting delay between batches
    if (i + concurrency < addresses.length) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return results;
}

// =============================================================================
// Type Guards
// =============================================================================

/**
 * Check if result is a successful geocode
 */
export function isGeocodeSuccess(result: GeocodeResult | GeocodeError): result is GeocodeResult {
  return 'latitude' in result;
}

/**
 * Check if result is a geocode error
 */
export function isGeocodeError(result: GeocodeResult | GeocodeError): result is GeocodeError {
  return 'code' in result;
}

// =============================================================================
// Legacy Compatibility (Deprecated)
// =============================================================================

/** @deprecated Use GeocodeResult instead */
export type GeocodedLocation = GeocodeResult;

/**
 * @deprecated Use geocodeListingAddress instead
 * Legacy function that accepts a string address for backwards compatibility
 */
export async function geocodeAddress(
  addressString: string,
  config: { mapboxToken?: string; googleApiKey?: string; country?: string; language?: string }
): Promise<GeocodeResult | null> {
  // Only use mapbox token (googleApiKey is ignored)
  if (!config.mapboxToken) return null;

  // Parse string into address components (best effort)
  const parts = addressString.split(',').map(p => p.trim());

  const address: ListingAddress = {};
  if (parts.length >= 1) address.street = parts[0];
  if (parts.length >= 2) {
    // Try to split postal code and city
    const cityPart = parts[1]!;
    const match = cityPart.match(/^(\d{4})\s+(.+)$/);
    if (match) {
      address.postalCode = match[1];
      address.city = match[2];
    } else {
      address.city = cityPart;
    }
  }
  if (parts.length >= 3) address.municipality = parts[2];

  const result = await geocodeListingAddress(address, {
    mapboxToken: config.mapboxToken,
    country: config.country || 'no',
    language: config.language || 'nb',
  });

  return isGeocodeSuccess(result) ? result : null;
}
