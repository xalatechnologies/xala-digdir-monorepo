/**
 * WebSocket Authentication Middleware
 * Validates tenant and user credentials during WebSocket upgrade
 */
import type { FastifyRequest, FastifyReply } from 'fastify';
import { getTenantId, getUserId, type TenantRequest } from '../../core/validation/tenant';
import { UnauthorizedError, ForbiddenError } from '../../core/errors/problem-details';

/**
 * Middleware to authenticate WebSocket connections
 * Validates that both tenant ID and user ID are present and valid
 * Supports both headers (X-Tenant-Id, X-User-Id) and query parameters (tenantId, userId)
 *
 * @throws {BadRequestError} If tenant ID or user ID is missing or invalid format
 * @throws {UnauthorizedError} If authentication credentials are missing
 */
export async function authenticateWebSocket(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    // WebSocket connections from browsers can't send custom headers,
    // so we need to support query parameters as well
    const queryParams = request.query as Record<string, string>;
    const tenantRequest = request as TenantRequest;

    // Try to get credentials from headers first, then fall back to query parameters
    // This supports both test scenarios (headers) and browser SDK (query params)
    if (!tenantRequest.tenantId && queryParams.tenantId) {
      tenantRequest.tenantId = queryParams.tenantId;
    }
    if (!tenantRequest.userId && queryParams.userId) {
      tenantRequest.userId = queryParams.userId;
    }

    // Validate tenant ID and user ID
    // getTenantId() and getUserId() will throw BadRequestError if invalid
    const tenantId = getTenantId(tenantRequest);
    const userId = getUserId(tenantRequest);

    // Store validated IDs on request for downstream use
    tenantRequest.tenantId = tenantId;
    tenantRequest.userId = userId;
  } catch (error) {
    // Convert BadRequestError to UnauthorizedError for missing credentials
    // to prevent information leakage about what headers are expected
    if (error instanceof Error && error.message.includes('required')) {
      throw new UnauthorizedError('Authentication credentials are required for WebSocket connections');
    }
    // Re-throw validation errors (invalid format, etc.)
    throw error;
  }
}

/**
 * Middleware to validate tenant-scoped WebSocket connections
 * Ensures the authenticated tenant matches the requested tenant parameter
 * Use this in addition to authenticateWebSocket for tenant-specific routes
 *
 * @param paramName - The name of the route parameter containing the tenant ID (default: 'tenantId')
 * @throws {ForbiddenError} If authenticated tenant doesn't match the requested tenant
 */
export function validateTenantScope(paramName: string = 'tenantId') {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const authenticatedTenantId = (request as TenantRequest).tenantId;
    const requestedTenantId = (request.params as Record<string, string>)[paramName];

    if (!authenticatedTenantId) {
      throw new UnauthorizedError('Authentication required');
    }

    if (!requestedTenantId) {
      throw new ForbiddenError('Tenant ID parameter is required');
    }

    if (authenticatedTenantId !== requestedTenantId) {
      throw new ForbiddenError(
        `Access denied: authenticated tenant '${authenticatedTenantId}' cannot access resources for tenant '${requestedTenantId}'`
      );
    }
  };
}
