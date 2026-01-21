import type { SupportedLocale, TranslationParams } from './types';
import { translations } from './locales';
import { interpolate } from './utils';

/**
 * SSR-safe check for development mode.
 * Works in both Node.js and browser environments without requiring @types/node.
 */
function isDevelopment(): boolean {
  try {
    // Vite sets import.meta.env.DEV in browser environments
    if (import.meta?.env?.DEV === true) {
      return true;
    }
    // Check for production mode explicitly
    if (import.meta?.env?.PROD === true) {
      return false;
    }
  } catch {
    // Ignore errors - import.meta might not be available in all environments
  }
  // Default to false (production) to avoid noisy console warnings
  return false;
}

/**
 * Canonical list of all API reason keys that must have translations.
 * These are used in:
 * - availableActions.reasonKey
 * - policyDecisions.reasonKey
 * - RFC 7807 ProblemDetails.type
 */
export const CANONICAL_REASON_KEYS = [
  // Policy keys - explain why an action is not allowed
  'policy.role.insufficient_permissions',
  'policy.slot.already_booked',
  'policy.booking.cancelled',
  'policy.booking.past',
  'policy.rental-object.inactive',
  'policy.user.not_verified',
  'policy.organization.suspended',

  // Action keys - explain why a UI action is disabled
  'actions.book.disabled.slot_unavailable',
  'actions.book.disabled.not_authenticated',
  'actions.cancel.disabled.too_late',
  'actions.edit.disabled.not_owner',

  // Error keys - RFC 7807 ProblemDetails type mappings
  'errors.VALIDATION_ERROR.title',
  'errors.VALIDATION_ERROR.description',
  'errors.NOT_FOUND.title',
  'errors.NOT_FOUND.description',
  'errors.UNAUTHORIZED.title',
  'errors.UNAUTHORIZED.description',
  'errors.FORBIDDEN.title',
  'errors.FORBIDDEN.description',
  'errors.INTERNAL_ERROR.title',
  'errors.INTERNAL_ERROR.description',
] as const;

/**
 * Type for canonical reason keys
 */
export type ReasonKey = (typeof CANONICAL_REASON_KEYS)[number];

/**
 * Options for resolveReasonKey
 */
export interface ResolveReasonKeyOptions {
  /**
   * Parameters for interpolation in the translation
   */
  params?: TranslationParams;

  /**
   * Custom fallback text if key is not found.
   * If not provided, returns the last segment of the key.
   */
  fallback?: string;

  /**
   * Whether to log a warning when key is not found.
   * Defaults to true in development.
   */
  logWarning?: boolean;
}

/**
 * Maps common API reason key prefixes to their translation key domains.
 * This handles cases where the API returns shortened keys.
 */
const REASON_KEY_PREFIX_MAP: Record<string, string> = {
  role: 'policy.role',
  slot: 'policy.slot',
  booking: 'policy.booking',
  'rental-object': 'policy.rental-object',
  listing: 'policy.rental-object', // @deprecated - use 'rental-object'
  user: 'policy.user',
  organization: 'policy.organization',
  book: 'actions.book',
  cancel: 'actions.cancel',
  edit: 'actions.edit',
  VALIDATION_ERROR: 'errors.VALIDATION_ERROR',
  NOT_FOUND: 'errors.NOT_FOUND',
  UNAUTHORIZED: 'errors.UNAUTHORIZED',
  FORBIDDEN: 'errors.FORBIDDEN',
  INTERNAL_ERROR: 'errors.INTERNAL_ERROR',
};

/**
 * Normalizes an API reason key to its translation key.
 *
 * Handles several formats:
 * - Full key: 'policy.role.insufficient_permissions' -> 'policy.role.insufficient_permissions'
 * - Short key: 'role.insufficient_permissions' -> 'policy.role.insufficient_permissions'
 * - Error type: 'VALIDATION_ERROR' -> 'errors.VALIDATION_ERROR.title'
 *
 * @param reasonKey - The API reason key to normalize
 * @returns The normalized translation key
 */
function normalizeReasonKey(reasonKey: string): string {
  // Already a full translation key
  if (
    reasonKey.startsWith('policy.') ||
    reasonKey.startsWith('actions.') ||
    reasonKey.startsWith('errors.')
  ) {
    return reasonKey;
  }

  // Check if it's a known prefix that needs mapping
  const segments = reasonKey.split('.');
  const firstSegment = segments[0];
  if (!firstSegment) {
    return reasonKey;
  }
  const prefix = REASON_KEY_PREFIX_MAP[firstSegment];

  if (prefix) {
    // Replace the first segment with the full prefix
    const rest = reasonKey.slice(firstSegment.length);
    return prefix + rest;
  }

  // For error codes without suffix, add default .title suffix
  if (reasonKey in REASON_KEY_PREFIX_MAP && !reasonKey.includes('.')) {
    return `${REASON_KEY_PREFIX_MAP[reasonKey]}.title`;
  }

  // Return as-is if we can't normalize
  return reasonKey;
}

/**
 * Extracts the last segment of a key as a human-readable fallback.
 *
 * @param key - The translation key
 * @returns The last segment, with underscores replaced by spaces
 *
 * @example
 * getLastSegment('policy.role.insufficient_permissions')
 * // Returns: 'insufficient permissions'
 */
function getLastSegment(key: string): string {
  const segments = key.split('.');
  const lastSegment = segments[segments.length - 1] || key;
  return lastSegment.replace(/_/g, ' ');
}

/**
 * Resolves an API reason key to a localized string.
 *
 * This function maps API `reasonKey` values (from availableActions,
 * policyDecisions, and ProblemDetails) to their corresponding
 * localized translation strings.
 *
 * @param reasonKey - The API reason key to resolve
 * @param locale - The locale to use for translation
 * @param options - Optional configuration
 * @returns The localized string, or a fallback if not found
 *
 * @example
 * ```ts
 * // Policy reason key
 * resolveReasonKey('role.insufficient_permissions', 'nb');
 * // Returns: "Du har ikke tilgang til denne handlingen"
 *
 * // Action disabled reason
 * resolveReasonKey('actions.book.disabled.slot_unavailable', 'en');
 * // Returns: "This time slot is no longer available"
 *
 * // Error type from ProblemDetails
 * resolveReasonKey('FORBIDDEN', 'nb');
 * // Returns: "Tilgang nektet" (errors.FORBIDDEN.title)
 *
 * // With interpolation
 * resolveReasonKey('actions.cancel.disabled.too_late', 'en', {
 *   params: { hours: 24 }
 * });
 * // Returns: "Cannot cancel within 24 hours of booking"
 * ```
 */
export function resolveReasonKey(
  reasonKey: string,
  locale: SupportedLocale,
  options?: ResolveReasonKeyOptions
): string {
  const { params, fallback, logWarning = true } = options ?? {};

  // Normalize the key to a translation key
  const translationKey = normalizeReasonKey(reasonKey);

  // Get the translation
  const localeTranslations = translations[locale];
  const translation = localeTranslations?.[translationKey];

  if (translation) {
    return interpolate(translation, params);
  }

  // Key not found - log warning in development
  // Use typeof to safely check for process in browser environments
  if (logWarning && isDevelopment()) {
    console.warn(
      `[i18n] Reason key not found: "${reasonKey}" (normalized: "${translationKey}")`
    );
  }

  // Return fallback or last segment
  return fallback ?? getLastSegment(translationKey);
}

/**
 * Checks if a reason key has a translation in the given locale.
 *
 * @param reasonKey - The reason key to check
 * @param locale - The locale to check
 * @returns true if the key has a translation
 */
export function hasReasonKeyTranslation(
  reasonKey: string,
  locale: SupportedLocale
): boolean {
  const translationKey = normalizeReasonKey(reasonKey);
  const localeTranslations = translations[locale];
  return translationKey in localeTranslations;
}

/**
 * Gets all reason keys that are missing translations.
 * Useful for tests and build-time validation.
 *
 * @param locale - The locale to check
 * @returns Array of missing reason keys
 */
export function getMissingReasonKeys(locale: SupportedLocale): string[] {
  const localeTranslations = translations[locale];
  return CANONICAL_REASON_KEYS.filter((key) => !(key in localeTranslations));
}
