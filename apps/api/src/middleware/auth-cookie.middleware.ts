/**
 * Auth Cookie Middleware
 * Extracts JWT from HTTP-only cookie or Authorization header
 *
 * Security: Supports dual mode for backwards compatibility
 * - Primary: HTTP-only cookie (secure, XSS-proof)
 * - Fallback: Authorization header (deprecated, will be removed)
 */
import type { FastifyRequest, FastifyReply } from 'fastify';
import { container } from '../core/container';
import type { JwtService } from '../core/auth/jwt.service';
import { COOKIE_CONFIG } from '../config/cookies';

export async function authCookieMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const jwtService = container.resolve<JwtService>('JwtService');

  // Try to extract JWT from access cookie first (new, secure method)
  let token = request.cookies[COOKIE_CONFIG.ACCESS.name];
  let authSource = 'cookie';

  // Fallback to Authorization header (old method, backwards compatibility)
  if (!token) {
    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
      authSource = 'header';

      // Log deprecation warning
      request.log.warn(
        {
          path: request.url,
          method: request.method,
        },
        'Authorization header authentication is deprecated. Please migrate to cookie-based auth.'
      );
    }
  }

  // If no token found, continue without authentication
  if (!token) {
    return;
  }

  try {
    // Verify JWT token with comprehensive validation
    const decoded = jwtService.verifyToken(token, {
      validateTenant: true,
      validateSubscription: true,
    });

    // Attach user info to request
    (request as any).userId = decoded.userId;
    (request as any).tenantId = decoded.tenantId;
    (request as any).subscription = decoded.subscription;
    (request as any).featureFlags = decoded.featureFlags;
    (request as any).authSource = authSource;

    request.log.debug(
      {
        userId: decoded.userId,
        tenantId: decoded.tenantId,
        authSource,
      },
      'User authenticated'
    );
  } catch (error) {
    // Token invalid or expired - log but don't throw
    // This allows unauthenticated requests to continue
    request.log.warn(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        authSource,
      },
      'Invalid or expired JWT token'
    );
  }
}

/**
 * Fastify plugin to register auth cookie middleware
 */
export async function authCookiePlugin(fastify: any): Promise<void> {
  // Register middleware on all routes
  fastify.addHook('onRequest', authCookieMiddleware);

  fastify.log.info('Auth cookie middleware registered');
}
