/**
 * JWT Verification Middleware for Fastify
 * Extracts and verifies JWT tokens from Authorization header
 */
import type { FastifyRequest, FastifyReply } from 'fastify';
import { JwtService } from './jwt.service';
import { UnauthorizedError } from '../errors/problem-details';

/**
 * Create JWT verification middleware for Fastify
 * @param secret - JWT secret for token verification
 * @returns Fastify middleware function
 */
export function createJwtMiddleware(secret: string) {
  const jwtService = new JwtService(secret);

  return async function jwtMiddleware(request: FastifyRequest, reply: FastifyReply) {
    // Extract token from Authorization header
    const authHeader = request.headers.authorization;
    const token = jwtService.extractTokenFromHeader(authHeader);

    if (!token) {
      throw new UnauthorizedError('Missing or invalid Authorization header. Expected format: Bearer <token>');
    }

    try {
      // Verify token and extract claims
      const verified = jwtService.verifyToken(token);

      // Attach userId and tenantId to request for downstream handlers
      (request as any).userId = verified.userId;
      (request as any).tenantId = verified.tenantId;
    } catch (error) {
      // Handle specific JWT verification errors
      if (error instanceof Error) {
        if (error.message.includes('expired')) {
          throw new UnauthorizedError('Token has expired. Please login again.');
        }
        if (error.message.includes('signature')) {
          throw new UnauthorizedError('Invalid token signature. Token may have been tampered with.');
        }
        if (error.message.includes('not yet valid')) {
          throw new UnauthorizedError('Token not yet valid.');
        }
        if (error.message.includes('missing required claims')) {
          throw new UnauthorizedError('Invalid token: missing required claims.');
        }
      }
      // Generic error for any other verification failures
      throw new UnauthorizedError('Invalid token. Please login again.');
    }
  };
}
