/**
 * Cookie Configuration
 * Industry-standard HTTP-only cookie settings for session management
 */

import type { CookieSerializeOptions } from '@fastify/cookie';

// =============================================================================
// Cookie Names and Lifetimes
// =============================================================================

export const COOKIE_CONFIG = {
  ACCESS: {
    name: 'dl_at', // Digilist Access Token
    maxAge: 15 * 60, // 15 minutes (short-lived for security)
    path: '/',
  },
  REFRESH: {
    name: 'dl_rt', // Digilist Refresh Token
    maxAge: 7 * 24 * 60 * 60, // 7 days (long-lived, but rotated)
    path: '/api/auth/refresh', // Path-scoped for security
  },
  CSRF: {
    name: 'dl_csrf', // CSRF token
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  },
} as const;

// =============================================================================
// Cookie Options Builder
// =============================================================================

/**
 * Get cookie options for a specific cookie type
 *
 * @param cookieType - Type of cookie (ACCESS, REFRESH, CSRF)
 * @param isProduction - Whether running in production
 * @returns Fastify cookie options
 */
export function getCookieOptions(
  cookieType: keyof typeof COOKIE_CONFIG,
  isProduction = process.env.NODE_ENV === 'production'
): CookieSerializeOptions {
  const config = COOKIE_CONFIG[cookieType];

  return {
    // HttpOnly: Prevents JavaScript access (XSS protection)
    // CSRF cookie must be readable by JS for double-submit pattern
    httpOnly: cookieType !== 'CSRF',

    // Secure: HTTPS only in production
    secure: isProduction,

    // SameSite: CSRF protection
    // 'lax' allows cookies on top-level navigation (e.g., OAuth callback)
    // 'strict' would break OAuth flows
    sameSite: 'lax',

    // Domain: Enables cross-subdomain SSO
    // .digilist.no allows web.digilist.no, backoffice.digilist.no, etc.
    // undefined for localhost (doesn't support subdomain cookies)
    domain: isProduction ? '.digilist.no' : undefined,

    // Path: Where cookie is valid
    path: config.path,

    // MaxAge: Cookie lifetime in seconds
    maxAge: config.maxAge,

    // Signed: Use signed cookies for tamper protection (optional)
    // signed: true, // Requires cookie secret in Fastify

    // Priority: High priority for authentication cookies
    priority: cookieType === 'ACCESS' ? 'high' : 'medium',
  };
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Calculate expiry date from maxAge
 */
export function getExpiryDate(maxAge: number): Date {
  return new Date(Date.now() + maxAge * 1000);
}

/**
 * Check if cookie configuration is valid
 */
export function validateCookieConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate environment
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    // Production checks
    if (!process.env.COOKIE_DOMAIN || process.env.COOKIE_DOMAIN !== '.digilist.no') {
      errors.push('COOKIE_DOMAIN must be set to .digilist.no in production');
    }
  }

  // Validate maxAge values
  if (COOKIE_CONFIG.ACCESS.maxAge > 60 * 60) {
    errors.push('Access token maxAge should not exceed 1 hour for security');
  }

  if (COOKIE_CONFIG.REFRESH.maxAge < 24 * 60 * 60) {
    errors.push('Refresh token maxAge should be at least 24 hours');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// =============================================================================
// Constants for Cookie Management
// =============================================================================

/**
 * Cookie clear options (for logout)
 */
export function getClearCookieOptions(
  isProduction = process.env.NODE_ENV === 'production'
): { path: string; domain?: string } {
  return {
    path: '/',
    domain: isProduction ? '.digilist.no' : undefined,
  };
}

/**
 * All cookie names for bulk operations
 */
export const ALL_COOKIE_NAMES = [
  COOKIE_CONFIG.ACCESS.name,
  COOKIE_CONFIG.REFRESH.name,
  COOKIE_CONFIG.CSRF.name,
] as const;

// =============================================================================
// Type Exports
// =============================================================================

export type CookieType = keyof typeof COOKIE_CONFIG;
export type CookieName = typeof ALL_COOKIE_NAMES[number];
