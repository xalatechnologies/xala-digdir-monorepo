/**
 * Flow Context Utilities
 * Functions for serializing, validating, and managing authentication flow context
 * Used to preserve user navigation and booking state across authentication interruptions
 */

import type { FlowContext, ReturnToConfig } from '../types/auth';

// =============================================================================
// Constants
// =============================================================================

/** Storage key for flow context in sessionStorage */
export const FLOW_CONTEXT_KEY = 'digilist_flow_context';

/** Maximum size for serialized flow context in bytes (8KB) */
export const MAX_FLOW_CONTEXT_SIZE = 8 * 1024;

/** Flow context expiration time in milliseconds (30 minutes) */
export const FLOW_CONTEXT_EXPIRY_MS = 30 * 60 * 1000;

/** Default paths considered safe for returnTo redirects */
const DEFAULT_ALLOWED_PATHS = [
  '/',
  '/listings',
  '/bookings',
  '/dashboard',
  '/profile',
  '/settings',
  '/minside',
  '/admin',
];

// =============================================================================
// Serialization/Deserialization
// =============================================================================

/**
 * Serialize a FlowContext object to a JSON string for storage
 * @param context - The FlowContext to serialize
 * @returns Serialized JSON string
 * @throws Error if context exceeds maximum size
 */
export function serializeFlowContext(context: FlowContext): string {
  const serialized = JSON.stringify(context);

  if (serialized.length > MAX_FLOW_CONTEXT_SIZE) {
    throw new Error(
      `FlowContext exceeds maximum size of ${MAX_FLOW_CONTEXT_SIZE} bytes (current: ${serialized.length})`
    );
  }

  return serialized;
}

/**
 * Deserialize a JSON string back to a FlowContext object
 * @param serialized - The serialized JSON string
 * @returns Parsed FlowContext or null if invalid
 */
export function deserializeFlowContext(serialized: string): FlowContext | null {
  try {
    const parsed = JSON.parse(serialized);

    // Validate required fields
    if (!isValidFlowContext(parsed)) {
      return null;
    }

    return parsed as FlowContext;
  } catch {
    return null;
  }
}

/**
 * Type guard to validate FlowContext structure
 * @param value - Value to validate
 * @returns True if value is a valid FlowContext
 */
export function isValidFlowContext(value: unknown): value is FlowContext {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const obj = value as Record<string, unknown>;

  // Check required fields
  if (typeof obj.returnTo !== 'string') return false;
  if (typeof obj.timestamp !== 'number') return false;
  if (typeof obj.tenantId !== 'string') return false;
  if (typeof obj.correlationId !== 'string') return false;

  // Validate optional booking mode
  if (obj.bookingMode !== undefined) {
    const validModes = ['SLOTS', 'ALL_DAY', 'DURATION', 'TICKETS', 'NONE'];
    if (!validModes.includes(obj.bookingMode as string)) {
      return false;
    }
  }

  // Validate optional selectedDates
  if (obj.selectedDates !== undefined) {
    if (!Array.isArray(obj.selectedDates)) return false;
    if (!obj.selectedDates.every((d) => typeof d === 'string')) return false;
  }

  // Validate optional selectedSlots
  if (obj.selectedSlots !== undefined) {
    if (!Array.isArray(obj.selectedSlots)) return false;
    if (
      !obj.selectedSlots.every(
        (s) =>
          typeof s === 'object' &&
          s !== null &&
          typeof (s as Record<string, unknown>).date === 'string' &&
          typeof (s as Record<string, unknown>).startTime === 'string' &&
          typeof (s as Record<string, unknown>).endTime === 'string'
      )
    ) {
      return false;
    }
  }

  // Validate optional recurringRules
  if (obj.recurringRules !== undefined) {
    const rules = obj.recurringRules as Record<string, unknown>;
    if (typeof rules !== 'object' || rules === null) return false;
    const validFrequencies = ['daily', 'weekly', 'monthly'];
    if (!validFrequencies.includes(rules.frequency as string)) return false;
    if (typeof rules.interval !== 'number') return false;
  }

  return true;
}

// =============================================================================
// Expiration
// =============================================================================

/**
 * Check if a FlowContext has expired
 * @param context - The FlowContext to check
 * @param expiryMs - Expiration time in milliseconds (default: 30 minutes)
 * @returns True if the context is expired
 */
export function isFlowContextExpired(
  context: FlowContext,
  expiryMs: number = FLOW_CONTEXT_EXPIRY_MS
): boolean {
  const now = Date.now();
  const age = now - context.timestamp;
  return age > expiryMs;
}

/**
 * Get the remaining time before a FlowContext expires
 * @param context - The FlowContext to check
 * @param expiryMs - Expiration time in milliseconds (default: 30 minutes)
 * @returns Remaining time in milliseconds, or 0 if expired
 */
export function getFlowContextTTL(
  context: FlowContext,
  expiryMs: number = FLOW_CONTEXT_EXPIRY_MS
): number {
  const now = Date.now();
  const expiresAt = context.timestamp + expiryMs;
  const remaining = expiresAt - now;
  return Math.max(0, remaining);
}

// =============================================================================
// URL Validation
// =============================================================================

/**
 * Validate a returnTo URL for security
 * Ensures same-origin and known route patterns only
 * @param url - The URL to validate
 * @param allowedOrigins - Optional list of allowed origins (defaults to current origin)
 * @param allowedPathPrefixes - Optional list of allowed path prefixes
 * @returns True if the URL is safe to redirect to
 */
export function validateReturnToUrl(
  url: string,
  allowedOrigins?: string[],
  allowedPathPrefixes?: string[]
): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  // Reject obvious attack patterns
  const dangerousPatterns = [
    /^javascript:/i,
    /^data:/i,
    /^vbscript:/i,
    /^file:/i,
    /^\/\//,  // Protocol-relative URLs (//evil.com)
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(url.trim())) {
      return false;
    }
  }

  // If it's a relative path, validate it
  if (url.startsWith('/') && !url.startsWith('//')) {
    return validatePathOnly(url, allowedPathPrefixes);
  }

  // For absolute URLs, validate origin
  try {
    const parsedUrl = new URL(url);

    // Validate protocol
    if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
      return false;
    }

    // Check if origin is allowed
    const currentOrigin =
      typeof window !== 'undefined' ? window.location.origin : '';
    const origins = allowedOrigins ?? [currentOrigin];

    if (!origins.includes(parsedUrl.origin)) {
      return false;
    }

    // Validate the path portion
    return validatePathOnly(parsedUrl.pathname, allowedPathPrefixes);
  } catch {
    // Invalid URL
    return false;
  }
}

/**
 * Validate a path against allowed prefixes
 * @param path - The path to validate
 * @param allowedPrefixes - List of allowed path prefixes
 * @returns True if path is allowed
 */
function validatePathOnly(
  path: string,
  allowedPrefixes?: string[]
): boolean {
  const prefixes = allowedPrefixes ?? DEFAULT_ALLOWED_PATHS;

  // Normalize path (remove trailing slash for comparison)
  const normalizedPath = path.replace(/\/$/, '') || '/';

  // Check exact match or prefix match
  return prefixes.some((prefix) => {
    const normalizedPrefix = prefix.replace(/\/$/, '') || '/';
    return (
      normalizedPath === normalizedPrefix ||
      normalizedPath.startsWith(normalizedPrefix + '/')
    );
  });
}

/**
 * Sanitize a returnTo URL by removing potentially dangerous parts
 * @param url - The URL to sanitize
 * @returns Sanitized URL or '/' if invalid
 */
export function sanitizeReturnToUrl(url: string): string {
  if (!validateReturnToUrl(url)) {
    return '/';
  }

  // For relative paths, return as-is (already validated)
  if (url.startsWith('/') && !url.startsWith('//')) {
    // Remove any URL fragments or extra query params that might contain scripts
    try {
      const pathWithQuery = url.split('#')[0]; // Remove fragment
      return pathWithQuery;
    } catch {
      return '/';
    }
  }

  // For absolute URLs, extract and return just the path
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.pathname + parsedUrl.search;
  } catch {
    return '/';
  }
}

// =============================================================================
// Signature / Verification
// =============================================================================

/**
 * Generate a signature for a FlowContext for tamper detection
 * Uses a simple HMAC-like approach with available crypto APIs
 * @param context - The FlowContext to sign
 * @param secret - Secret key for signing (should be from environment)
 * @returns Promise resolving to base64 signature
 */
export async function signFlowContext(
  context: FlowContext,
  secret: string
): Promise<string> {
  const data = serializeFlowContext(context);
  const signature = await generateHMAC(data, secret);
  return signature;
}

/**
 * Verify a FlowContext signature
 * @param context - The FlowContext to verify
 * @param signature - The expected signature
 * @param secret - Secret key used for signing
 * @returns Promise resolving to true if signature is valid
 */
export async function verifyFlowContext(
  context: FlowContext,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    const expectedSignature = await signFlowContext(context, secret);
    return timingSafeEqual(expectedSignature, signature);
  } catch {
    return false;
  }
}

/**
 * Generate HMAC signature using Web Crypto API
 * Falls back to simple hash if crypto unavailable
 * @param data - Data to sign
 * @param secret - Secret key
 * @returns Base64 encoded signature
 */
async function generateHMAC(data: string, secret: string): Promise<string> {
  // Try Web Crypto API (available in modern browsers and Node 15+)
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(data);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
    return btoa(String.fromCharCode(...new Uint8Array(signature)));
  }

  // Fallback: Simple non-cryptographic hash (not secure, but better than nothing)
  // This should only be used in environments without crypto support
  return simpleHash(data + secret);
}

/**
 * Simple hash function as fallback
 * NOT cryptographically secure - only used when crypto.subtle unavailable
 * @param str - String to hash
 * @returns Hash string
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Timing-safe string comparison to prevent timing attacks
 * @param a - First string
 * @param b - Second string
 * @returns True if strings are equal
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// =============================================================================
// Storage Helpers
// =============================================================================

/**
 * Save FlowContext to sessionStorage
 * @param context - The FlowContext to save
 * @param key - Storage key (default: FLOW_CONTEXT_KEY)
 * @returns True if saved successfully
 */
export function saveFlowContextToStorage(
  context: FlowContext,
  key: string = FLOW_CONTEXT_KEY
): boolean {
  if (typeof sessionStorage === 'undefined') {
    return false;
  }

  try {
    const serialized = serializeFlowContext(context);
    sessionStorage.setItem(key, serialized);
    return true;
  } catch {
    // Storage full or access denied
    return false;
  }
}

/**
 * Load FlowContext from sessionStorage
 * @param key - Storage key (default: FLOW_CONTEXT_KEY)
 * @returns FlowContext or null if not found/invalid
 */
export function loadFlowContextFromStorage(
  key: string = FLOW_CONTEXT_KEY
): FlowContext | null {
  if (typeof sessionStorage === 'undefined') {
    return null;
  }

  try {
    const serialized = sessionStorage.getItem(key);
    if (!serialized) {
      return null;
    }

    const context = deserializeFlowContext(serialized);
    if (!context) {
      // Invalid context, clear it
      clearFlowContextFromStorage(key);
      return null;
    }

    // Check expiration
    if (isFlowContextExpired(context)) {
      clearFlowContextFromStorage(key);
      return null;
    }

    return context;
  } catch {
    return null;
  }
}

/**
 * Clear FlowContext from sessionStorage
 * @param key - Storage key (default: FLOW_CONTEXT_KEY)
 */
export function clearFlowContextFromStorage(
  key: string = FLOW_CONTEXT_KEY
): void {
  if (typeof sessionStorage === 'undefined') {
    return;
  }

  try {
    sessionStorage.removeItem(key);
  } catch {
    // Access denied, ignore
  }
}

/**
 * Check if a FlowContext exists in storage
 * @param key - Storage key (default: FLOW_CONTEXT_KEY)
 * @returns True if valid context exists
 */
export function hasStoredFlowContext(key: string = FLOW_CONTEXT_KEY): boolean {
  const context = loadFlowContextFromStorage(key);
  return context !== null;
}

// =============================================================================
// ReturnToConfig Helpers
// =============================================================================

/**
 * Create a ReturnToConfig from a FlowContext
 * @param context - The FlowContext to wrap
 * @param secret - Optional secret for signing
 * @returns Promise resolving to ReturnToConfig
 */
export async function createReturnToConfig(
  context: FlowContext,
  secret?: string
): Promise<ReturnToConfig> {
  const config: ReturnToConfig = {
    url: context.returnTo,
    flowContext: context,
    expiresAt: context.timestamp + FLOW_CONTEXT_EXPIRY_MS,
  };

  if (secret) {
    config.signature = await signFlowContext(context, secret);
  }

  return config;
}

/**
 * Validate a ReturnToConfig including optional signature verification
 * @param config - The ReturnToConfig to validate
 * @param secret - Optional secret for signature verification
 * @returns Promise resolving to true if valid
 */
export async function validateReturnToConfig(
  config: ReturnToConfig,
  secret?: string
): Promise<boolean> {
  // Check URL validity
  if (!validateReturnToUrl(config.url)) {
    return false;
  }

  // Check expiration
  if (config.expiresAt && Date.now() > config.expiresAt) {
    return false;
  }

  // Check flow context if present
  if (config.flowContext) {
    if (!isValidFlowContext(config.flowContext)) {
      return false;
    }

    if (isFlowContextExpired(config.flowContext)) {
      return false;
    }

    // Verify signature if secret provided
    if (secret && config.signature) {
      const isValid = await verifyFlowContext(
        config.flowContext,
        config.signature,
        secret
      );
      if (!isValid) {
        return false;
      }
    }
  }

  return true;
}

// =============================================================================
// Factory Functions
// =============================================================================

/**
 * Create a new FlowContext with required fields
 * @param returnTo - URL to return to after auth
 * @param tenantId - Current tenant ID
 * @param options - Optional additional context fields
 * @returns New FlowContext
 */
export function createFlowContext(
  returnTo: string,
  tenantId: string,
  options?: Partial<Omit<FlowContext, 'returnTo' | 'timestamp' | 'tenantId' | 'correlationId'>>
): FlowContext {
  return {
    returnTo: sanitizeReturnToUrl(returnTo),
    timestamp: Date.now(),
    tenantId,
    correlationId: generateCorrelationId(),
    ...options,
  };
}

/**
 * Generate a unique correlation ID for audit logging
 * @returns Unique correlation ID string
 */
function generateCorrelationId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `flow_${timestamp}_${random}`;
}
