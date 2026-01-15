/**
 * Tenant Validation Utilities
 * Centralized tenant ID validation for all controllers
 */
import { BadRequestError } from '../errors/problem-details';
import type { FastifyRequest } from 'fastify';

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * User context from authentication
 */
export interface UserContext {
  id: string;
  role: 'admin' | 'super_admin' | 'member' | 'guest';
  email?: string;
  name?: string;
}

/**
 * Interface for requests with tenant context
 */
export interface TenantRequest extends FastifyRequest {
  tenantId?: string;
  userId?: string;
  user?: UserContext;
}

/**
 * Check if a string is a valid UUID
 */
export function isValidUUID(value: string): boolean {
  return UUID_REGEX.test(value);
}

/**
 * Get and validate tenant ID from request (required)
 * Throws BadRequestError if missing or invalid
 */
export function getTenantId(request: TenantRequest): string {
  const tenantId = request.tenantId || (request.headers['x-tenant-id'] as string);
  
  if (!tenantId) {
    throw new BadRequestError('X-Tenant-Id header is required');
  }
  
  if (!isValidUUID(tenantId)) {
    throw new BadRequestError(`Invalid tenant ID format: expected UUID, got "${tenantId}"`);
  }
  
  return tenantId;
}

/**
 * Get tenant ID from request (optional)
 * Returns null if not provided, throws BadRequestError if provided but invalid
 */
export function getOptionalTenantId(request: TenantRequest): string | null {
  const tenantId = request.tenantId || (request.headers['x-tenant-id'] as string);
  
  if (!tenantId) {
    return null;
  }
  
  if (!isValidUUID(tenantId)) {
    throw new BadRequestError(`Invalid tenant ID format: expected UUID, got "${tenantId}"`);
  }
  
  return tenantId;
}

/**
 * Get and validate user ID from request (required)
 */
export function getUserId(request: TenantRequest): string {
  const userId = request.userId || (request.headers['x-user-id'] as string);
  
  if (!userId) {
    throw new BadRequestError('X-User-Id header is required');
  }
  
  if (!isValidUUID(userId)) {
    throw new BadRequestError(`Invalid user ID format: expected UUID, got "${userId}"`);
  }
  
  return userId;
}

/**
 * Get user ID from request (optional with fallback)
 */
export function getOptionalUserId(request: TenantRequest, fallback: string = 'anonymous'): string {
  const userId = request.userId || (request.headers['x-user-id'] as string);
  
  if (!userId) {
    return fallback;
  }
  
  if (!isValidUUID(userId)) {
    // For optional user ID, allow 'anonymous' as special value
    if (userId === 'anonymous') {
      return userId;
    }
    throw new BadRequestError(`Invalid user ID format: expected UUID, got "${userId}"`);
  }
  
  return userId;
}
