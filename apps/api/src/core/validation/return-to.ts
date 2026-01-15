/**
 * ReturnTo URL Validation Utilities
 * Centralized returnTo URL validation for authentication flows
 *
 * Security considerations:
 * - Same-origin validation to prevent open redirects
 * - Known route pattern validation
 * - XSS prevention through URL sanitization
 * - Protocol validation (HTTPS in production)
 */
import { BadRequestError } from '../errors/problem-details';

/**
 * Configuration for allowed origins
 * In production, these should come from environment variables
 */
const ALLOWED_ORIGINS = [
  'http://localhost:5173',  // web app dev
  'http://localhost:5174',  // minside dev
  'http://localhost:5175',  // backoffice dev
  'https://digilist.no',
  'https://www.digilist.no',
  'https://app.digilist.no',
  'https://admin.digilist.no',
  'https://minside.digilist.no',
];

/**
 * Allowed path patterns for returnTo URLs
 * Uses regex patterns to validate known routes
 */
const ALLOWED_PATH_PATTERNS = [
  /^\/$/,                                    // Root
  /^\/listings(\/[a-zA-Z0-9-]+)?$/,         // Listings and listing details
  /^\/bookings(\/[a-zA-Z0-9-]+)?$/,         // Bookings
  /^\/dashboard$/,                           // Dashboard
  /^\/profile$/,                             // Profile
  /^\/settings(\/[a-zA-Z0-9-]+)?$/,         // Settings
  /^\/messages(\/[a-zA-Z0-9-]+)?$/,         // Messages
  /^\/calendar$/,                            // Calendar
  /^\/search$/,                              // Search
  /^\/organizations(\/[a-zA-Z0-9-]+)?$/,    // Organizations
  /^\/admin(\/[a-zA-Z0-9-]+)?$/,            // Admin routes
  /^\/reservations(\/[a-zA-Z0-9-]+)?$/,     // Reservations
  /^\/mine-bookinger(\/[a-zA-Z0-9-]+)?$/,   // My bookings (Norwegian)
  /^\/min-side$/,                            // My page (Norwegian)
];

/**
 * Dangerous patterns that should always be rejected
 */
const DANGEROUS_PATTERNS = [
  /javascript:/i,           // JavaScript protocol
  /data:/i,                 // Data protocol
  /vbscript:/i,             // VBScript protocol
  /<script/i,               // Script tags
  /%3Cscript/i,             // URL-encoded script tags
  /on\w+\s*=/i,             // Event handlers
  /&#/,                     // HTML entities
  /\x00/,                   // Null bytes
  /^\/\//,                  // Protocol-relative (at start only)
];

/**
 * Options for returnTo validation
 */
export interface ReturnToValidationOptions {
  /** List of allowed origins (overrides default) */
  allowedOrigins?: string[];
  /** Whether to allow relative paths only */
  relativeOnly?: boolean;
  /** Custom path patterns to allow */
  additionalPatterns?: RegExp[];
  /** Whether to require HTTPS (default true in production) */
  requireHttps?: boolean;
}

/**
 * Result of returnTo validation
 */
export interface ReturnToValidationResult {
  /** Whether the URL is valid */
  isValid: boolean;
  /** The sanitized URL (if valid) */
  sanitizedUrl: string | null;
  /** Validation failure reason (if invalid) */
  reason?: string;
}

/**
 * Check if a URL contains dangerous patterns
 */
function containsDangerousPattern(url: string): boolean {
  return DANGEROUS_PATTERNS.some(pattern => pattern.test(url));
}

/**
 * Check if a path matches allowed patterns
 */
function isAllowedPath(pathname: string, additionalPatterns?: RegExp[]): boolean {
  const allPatterns = additionalPatterns
    ? [...ALLOWED_PATH_PATTERNS, ...additionalPatterns]
    : ALLOWED_PATH_PATTERNS;

  return allPatterns.some(pattern => pattern.test(pathname));
}

/**
 * Parse and validate a URL safely
 * Returns null if URL is malformed or invalid
 */
function safeParseUrl(url: string, baseUrl?: string): URL | null {
  try {
    return new URL(url, baseUrl);
  } catch {
    return null;
  }
}

/**
 * Get allowed origins from environment or defaults
 */
function getAllowedOrigins(options?: ReturnToValidationOptions): string[] {
  // Check for environment variable override
  const envOrigins = process.env.ALLOWED_RETURN_ORIGINS;
  if (envOrigins) {
    return envOrigins.split(',').map(o => o.trim());
  }

  return options?.allowedOrigins || ALLOWED_ORIGINS;
}

/**
 * Validate a returnTo URL
 * Returns a validation result with sanitized URL or failure reason
 *
 * @param returnTo - The URL to validate
 * @param options - Validation options
 * @returns Validation result
 */
export function validateReturnToUrl(
  returnTo: string,
  options?: ReturnToValidationOptions
): ReturnToValidationResult {
  // Empty or whitespace-only URLs are invalid
  if (!returnTo || typeof returnTo !== 'string' || !returnTo.trim()) {
    return {
      isValid: false,
      sanitizedUrl: null,
      reason: 'ReturnTo URL is required',
    };
  }

  const trimmedUrl = returnTo.trim();

  // Check for dangerous patterns before any parsing
  if (containsDangerousPattern(trimmedUrl)) {
    return {
      isValid: false,
      sanitizedUrl: null,
      reason: 'ReturnTo URL contains potentially dangerous content',
    };
  }

  // Handle relative paths
  if (trimmedUrl.startsWith('/') && !trimmedUrl.startsWith('//')) {
    // Relative path - validate path pattern only
    const decodedPath = decodeURIComponent(trimmedUrl.split('?')[0].split('#')[0]);

    if (!isAllowedPath(decodedPath, options?.additionalPatterns)) {
      return {
        isValid: false,
        sanitizedUrl: null,
        reason: `Path "${decodedPath}" is not in the allowed routes`,
      };
    }

    // Sanitize and return the path
    return {
      isValid: true,
      sanitizedUrl: trimmedUrl,
    };
  }

  // For relative-only mode, reject absolute URLs
  if (options?.relativeOnly) {
    return {
      isValid: false,
      sanitizedUrl: null,
      reason: 'Only relative paths are allowed',
    };
  }

  // Parse as absolute URL
  const parsedUrl = safeParseUrl(trimmedUrl);
  if (!parsedUrl) {
    return {
      isValid: false,
      sanitizedUrl: null,
      reason: 'ReturnTo URL is malformed',
    };
  }

  // Validate protocol
  const isProduction = process.env.NODE_ENV === 'production';
  const requireHttps = options?.requireHttps ?? isProduction;

  if (requireHttps && parsedUrl.protocol !== 'https:') {
    return {
      isValid: false,
      sanitizedUrl: null,
      reason: 'ReturnTo URL must use HTTPS in production',
    };
  }

  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    return {
      isValid: false,
      sanitizedUrl: null,
      reason: `Invalid protocol: ${parsedUrl.protocol}`,
    };
  }

  // Validate origin
  const allowedOrigins = getAllowedOrigins(options);
  if (!allowedOrigins.includes(parsedUrl.origin)) {
    return {
      isValid: false,
      sanitizedUrl: null,
      reason: `Origin "${parsedUrl.origin}" is not in the allowed list`,
    };
  }

  // Validate path pattern
  const decodedPath = decodeURIComponent(parsedUrl.pathname);
  if (!isAllowedPath(decodedPath, options?.additionalPatterns)) {
    return {
      isValid: false,
      sanitizedUrl: null,
      reason: `Path "${decodedPath}" is not in the allowed routes`,
    };
  }

  // Return sanitized URL (preserving query string but removing hash)
  const sanitizedUrl = `${parsedUrl.origin}${parsedUrl.pathname}${parsedUrl.search}`;
  return {
    isValid: true,
    sanitizedUrl,
  };
}

/**
 * Get and validate returnTo URL from request
 * Throws BadRequestError if invalid
 *
 * @param returnTo - The returnTo URL to validate
 * @param options - Validation options
 * @returns The sanitized returnTo URL
 */
export function getReturnToUrl(
  returnTo: string | undefined,
  options?: ReturnToValidationOptions
): string {
  if (!returnTo) {
    throw new BadRequestError('ReturnTo URL is required');
  }

  const result = validateReturnToUrl(returnTo, options);

  if (!result.isValid || !result.sanitizedUrl) {
    throw new BadRequestError(result.reason || 'Invalid returnTo URL');
  }

  return result.sanitizedUrl;
}

/**
 * Get returnTo URL from request (optional)
 * Returns null if not provided, throws BadRequestError if provided but invalid
 *
 * @param returnTo - The returnTo URL to validate
 * @param fallback - Default URL to return if returnTo is not provided
 * @param options - Validation options
 * @returns The sanitized returnTo URL or fallback
 */
export function getOptionalReturnToUrl(
  returnTo: string | undefined | null,
  fallback: string = '/',
  options?: ReturnToValidationOptions
): string {
  if (!returnTo) {
    return fallback;
  }

  const result = validateReturnToUrl(returnTo, options);

  if (!result.isValid || !result.sanitizedUrl) {
    // For optional returnTo, log the invalid attempt but don't throw
    // The caller should handle this gracefully
    return fallback;
  }

  return result.sanitizedUrl;
}

/**
 * Sanitize a returnTo URL, falling back to default if invalid
 * Does not throw, always returns a safe URL
 *
 * @param returnTo - The returnTo URL to sanitize
 * @param fallback - Default URL to return if invalid
 * @param options - Validation options
 * @returns A safe URL (either sanitized returnTo or fallback)
 */
export function sanitizeReturnToUrl(
  returnTo: string | undefined | null,
  fallback: string = '/',
  options?: ReturnToValidationOptions
): string {
  if (!returnTo) {
    return fallback;
  }

  const result = validateReturnToUrl(returnTo, options);
  return result.isValid && result.sanitizedUrl ? result.sanitizedUrl : fallback;
}

/**
 * Check if a returnTo URL is valid without throwing
 * Useful for conditional logic
 *
 * @param returnTo - The returnTo URL to check
 * @param options - Validation options
 * @returns True if valid, false otherwise
 */
export function isValidReturnToUrl(
  returnTo: string | undefined | null,
  options?: ReturnToValidationOptions
): boolean {
  if (!returnTo) {
    return false;
  }

  const result = validateReturnToUrl(returnTo, options);
  return result.isValid;
}

/**
 * Add a path to the allowed patterns at runtime
 * Useful for tenant-specific routes
 *
 * @param pattern - The regex pattern to add
 */
export function addAllowedPathPattern(pattern: RegExp): void {
  ALLOWED_PATH_PATTERNS.push(pattern);
}

/**
 * Add an origin to the allowed list at runtime
 * Useful for tenant-specific domains
 *
 * @param origin - The origin to add (e.g., 'https://kommune.digilist.no')
 */
export function addAllowedOrigin(origin: string): void {
  if (!ALLOWED_ORIGINS.includes(origin)) {
    ALLOWED_ORIGINS.push(origin);
  }
}
