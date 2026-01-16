/**
 * API Internationalization Utility
 * Provides localized error messages for API responses
 *
 * Supports:
 * - Norwegian (nb) - Primary language for municipal platform
 * - English (en) - Fallback language
 */

import type { FastifyRequest } from 'fastify';

// =============================================================================
// Translations
// =============================================================================

const translations = {
  nb: {
    // Auth errors
    'auth.token_required': 'Token er påkrevd',
    'auth.invalid_demo_token': 'Ugyldig demo-token',
    'auth.user_inactive': 'Brukerkonto er inaktiv',
    'auth.no_refresh_token': 'Ingen oppdateringstoken',
    'auth.invalid_refresh_token': 'Ugyldig eller utløpt oppdateringstoken',
    'auth.token_refreshed': 'Token oppdatert',
    'auth.logged_out': 'Logget ut',
    'auth.no_session': 'Ingen aktiv økt',
    'auth.invalid_session': 'Ugyldig økt',

    // CSRF errors
    'csrf.token_mismatch': 'CSRF-token validering feilet',
    'csrf.invalid_origin': 'Forespørsel fra ugyldig opprinnelse',
    'csrf.invalid_referer': 'Ugyldig referer i forespørsel',

    // Generic errors
    'error.bad_request': 'Ugyldig forespørsel',
    'error.unauthorized': 'Ikke autorisert',
    'error.forbidden': 'Ingen tilgang',
    'error.not_found': 'Ikke funnet',
    'error.internal_server': 'Intern serverfeil',
  },
  en: {
    // Auth errors
    'auth.token_required': 'Token is required',
    'auth.invalid_demo_token': 'Invalid demo token',
    'auth.user_inactive': 'User account is inactive',
    'auth.no_refresh_token': 'No refresh token',
    'auth.invalid_refresh_token': 'Invalid or expired refresh token',
    'auth.token_refreshed': 'Token refreshed',
    'auth.logged_out': 'Logged out successfully',
    'auth.no_session': 'No active session',
    'auth.invalid_session': 'Invalid session',

    // CSRF errors
    'csrf.token_mismatch': 'CSRF token validation failed',
    'csrf.invalid_origin': 'Request origin not allowed',
    'csrf.invalid_referer': 'Invalid request referer',

    // Generic errors
    'error.bad_request': 'Bad request',
    'error.unauthorized': 'Unauthorized',
    'error.forbidden': 'Forbidden',
    'error.not_found': 'Not found',
    'error.internal_server': 'Internal server error',
  },
};

// =============================================================================
// Types
// =============================================================================

export type Locale = 'nb' | 'en';
export type TranslationKey = keyof typeof translations.nb;

// =============================================================================
// Locale Detection
// =============================================================================

/**
 * Get locale from Accept-Language header
 *
 * @param request - Fastify request
 * @returns Detected locale (nb or en)
 */
export function getLocale(request: FastifyRequest): Locale {
  const acceptLanguage = request.headers['accept-language'];

  if (!acceptLanguage) {
    return 'nb'; // Default to Norwegian
  }

  // Parse Accept-Language header
  // Format: "en-US,en;q=0.9,nb;q=0.8"
  const languages = acceptLanguage
    .split(',')
    .map((lang) => {
      const [code, qValue] = lang.trim().split(';q=');
      return {
        code: code.split('-')[0].toLowerCase(),
        q: qValue ? parseFloat(qValue) : 1.0,
      };
    })
    .sort((a, b) => b.q - a.q);

  // Find first supported language
  for (const lang of languages) {
    if (lang.code === 'nb' || lang.code === 'no') {
      return 'nb';
    }
    if (lang.code === 'en') {
      return 'en';
    }
  }

  return 'nb'; // Default to Norwegian
}

// =============================================================================
// Translation Function
// =============================================================================

/**
 * Translate a message key to the user's locale
 *
 * @param request - Fastify request
 * @param key - Translation key
 * @param fallback - Fallback text if key not found
 * @returns Localized message
 */
export function t(
  request: FastifyRequest,
  key: TranslationKey,
  fallback?: string
): string {
  const locale = getLocale(request);
  const message = translations[locale][key];

  if (!message) {
    request.log.warn(`Translation key not found: ${key} (locale: ${locale})`);
    return fallback || key;
  }

  return message;
}

/**
 * Translate a message key with explicit locale
 *
 * @param locale - Target locale
 * @param key - Translation key
 * @param fallback - Fallback text if key not found
 * @returns Localized message
 */
export function tLocale(locale: Locale, key: TranslationKey, fallback?: string): string {
  const message = translations[locale][key];
  return message || fallback || key;
}

// =============================================================================
// Error Response Helpers
// =============================================================================

/**
 * Create localized error response
 *
 * @param request - Fastify request
 * @param code - Error code (machine-readable)
 * @param key - Translation key for message
 * @param details - Optional additional details
 * @returns Error object with localized message
 */
export function createErrorResponse(
  request: FastifyRequest,
  code: string,
  key: TranslationKey,
  details?: Record<string, any>
) {
  return {
    error: {
      code,
      message: t(request, key),
      ...(details && { details }),
    },
  };
}

/**
 * Create localized success response
 *
 * @param request - Fastify request
 * @param key - Translation key for message
 * @returns Success object with localized message
 */
export function createSuccessResponse(request: FastifyRequest, key: TranslationKey) {
  return {
    data: {
      success: true,
      message: t(request, key),
    },
  };
}
