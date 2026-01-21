/**
 * CSRF Middleware
 * Implements CSRF protection using double-submit cookie pattern
 *
 * Security:
 * - Double-submit: CSRF token in cookie + header must match
 * - Origin validation: Requests must come from allowed origins
 * - Path-specific: Refresh endpoint uses path-scoped cookie
 */

import type { FastifyRequest, FastifyReply } from 'fastify';
import { COOKIE_CONFIG } from '../config/cookies';

// =============================================================================
// Configuration
// =============================================================================

const STATE_CHANGING_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];
const CSRF_HEADER = 'x-csrf-token';

/**
 * Allowed origins for production
 * Must match exactly (no wildcards for security)
 */
const ALLOWED_ORIGINS_PRODUCTION = [
  'https://platform.xala.no',
  'https://api.platform.xala.no',
  // Add domain-specific origins as needed
  'https://digilist.no',
  'https://web.digilist.no',
  'https://backoffice.digilist.no',
  'https://minside.digilist.no',
];

/**
 * Allowed origins for development
 */
const ALLOWED_ORIGINS_DEVELOPMENT = [
  'http://localhost:5173', // Web
  'http://localhost:5174', // Minside
  'http://localhost:5175', // Backoffice
  'http://localhost:5176', // SaaS Admin
  'http://localhost:5177', // Tenant Admin
  'http://localhost:5178', // Monitoring
  'http://localhost:5179', // Docs
];

// =============================================================================
// CSRF Middleware
// =============================================================================

export async function csrfMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // Skip CSRF check for safe methods (GET, HEAD, OPTIONS)
  if (!STATE_CHANGING_METHODS.includes(request.method)) {
    return;
  }

  // Skip CSRF for /api/auth/refresh (uses path-scoped cookie)
  // Refresh endpoint has its own security via one-time refresh token
  if (request.url.startsWith('/api/auth/refresh')) {
    return;
  }

  // Skip CSRF for /api/auth/demo-token (login endpoint)
  // Login doesn't have CSRF token yet (it's set during login)
  if (request.url.startsWith('/api/auth/demo-token')) {
    return;
  }

  // Skip CSRF for other login endpoints
  if (
    request.url.startsWith('/api/auth/login') ||
    request.url.startsWith('/api/auth/email') ||
    request.url.startsWith('/api/auth/callback')
  ) {
    return;
  }

  const isProduction = process.env.NODE_ENV === 'production';

  // 1. Check CSRF token (double-submit pattern)
  const csrfCookie = request.cookies[COOKIE_CONFIG.CSRF.name];
  const csrfHeader = request.headers[CSRF_HEADER] as string | undefined;

  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    request.log.warn(
      {
        url: request.url,
        method: request.method,
        hasCookie: !!csrfCookie,
        hasHeader: !!csrfHeader,
        match: csrfCookie === csrfHeader,
      },
      'CSRF token mismatch'
    );

    reply.code(403);
    return reply.send({
      type: '/errors/csrf-token-mismatch',
      title: 'CSRF Token Mismatch',
      status: 403,
      detail: 'CSRF token validation failed. Please refresh the page and try again.',
    });
  }

  // 2. Check Origin header (must be from allowed origins)
  const origin = request.headers.origin as string | undefined;

  if (origin) {
    const allowedOrigins = isProduction
      ? ALLOWED_ORIGINS_PRODUCTION
      : [...ALLOWED_ORIGINS_PRODUCTION, ...ALLOWED_ORIGINS_DEVELOPMENT];

    if (!allowedOrigins.includes(origin)) {
      request.log.warn(
        {
          url: request.url,
          method: request.method,
          origin,
          isProduction,
        },
        'Invalid Origin header'
      );

      reply.code(403);
      return reply.send({
        type: '/errors/invalid-origin',
        title: 'Invalid Origin',
        status: 403,
        detail: 'Request origin is not allowed.',
      });
    }
  }

  // 3. Check Referer header as fallback (when Origin not set)
  if (!origin) {
    const referer = request.headers.referer as string | undefined;

    if (referer) {
      const refererUrl = new URL(referer);
      const refererOrigin = refererUrl.origin;

      const allowedOrigins = isProduction
        ? ALLOWED_ORIGINS_PRODUCTION
        : [...ALLOWED_ORIGINS_PRODUCTION, ...ALLOWED_ORIGINS_DEVELOPMENT];

      if (!allowedOrigins.includes(refererOrigin)) {
        request.log.warn(
          {
            url: request.url,
            method: request.method,
            referer: refererOrigin,
            isProduction,
          },
          'Invalid Referer header'
        );

        reply.code(403);
        return reply.send({
          type: '/errors/invalid-referer',
          title: 'Invalid Referer',
          status: 403,
          detail: 'Request referer is not allowed.',
        });
      }
    }
  }

  // CSRF check passed
  request.log.debug(
    {
      url: request.url,
      method: request.method,
      origin,
    },
    'CSRF validation passed'
  );
}

/**
 * Fastify plugin to register CSRF middleware
 */
export async function csrfPlugin(fastify: any): Promise<void> {
  // Register CSRF middleware on all routes
  fastify.addHook('onRequest', csrfMiddleware);

  fastify.log.info('CSRF middleware registered');
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Check if origin is allowed
 */
export function isOriginAllowed(origin: string, isProduction: boolean): boolean {
  const allowedOrigins = isProduction
    ? ALLOWED_ORIGINS_PRODUCTION
    : [...ALLOWED_ORIGINS_PRODUCTION, ...ALLOWED_ORIGINS_DEVELOPMENT];

  return allowedOrigins.includes(origin);
}

/**
 * Get allowed origins for current environment
 */
export function getAllowedOrigins(isProduction: boolean): string[] {
  return isProduction
    ? ALLOWED_ORIGINS_PRODUCTION
    : [...ALLOWED_ORIGINS_PRODUCTION, ...ALLOWED_ORIGINS_DEVELOPMENT];
}
