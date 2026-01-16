/**
 * Tenant Validation Utilities
 * Centralized tenant ID validation for all controllers
 */
import { BadRequestError } from '../errors/problem-details';
import type { FastifyRequest } from 'fastify';

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Interface for requests with tenant context
 */
export interface TenantRequest extends FastifyRequest {
  tenantId?: string;
  userId?: string;
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
  const tenantId = request.tenantId;

  if (!tenantId) {
    throw new BadRequestError('Tenant ID is required (authenticated request expected)');
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
  const tenantId = request.tenantId;
  
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
  const userId = request.userId;

  if (!userId) {
    throw new BadRequestError('User ID is required (authenticated request expected)');
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
  const userId = request.userId;
  
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
