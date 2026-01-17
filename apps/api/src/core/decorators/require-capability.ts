/**
 * RBAC Capability Enforcement Decorator
 * Enforces permission checks before controller method execution
 * 
 * Reference: docs/roles/matrix.md - Permission resolution algorithm
 */
import type { FastifyRequest, FastifyReply } from 'fastify';

interface UserContext {
  authenticated: boolean;
  tenantId: string;
  userId: string;
  roles: string[];
  capabilities: Set<string>;
}

/**
 * Extract user context from request
 * TODO: Integrate with real auth middleware
 */
function extractUserContext(request: FastifyRequest): UserContext | null {
  // Placeholder - real implementation would extract from JWT/session
  const user = (request as any).user;
  
  if (!user) {
    return null;
  }

  return {
    authenticated: true,
    tenantId: user.tenantId,
    userId: user.id,
    roles: user.roles || [],
    capabilities: new Set(user.capabilities || []),
  };
}

/**
 * Check if user has required capability
 */
function hasCapability(ctx: UserContext, capability: string): boolean {
  // SAAS_ADMIN has all capabilities globally
  if (ctx.roles.includes('SAAS_ADMIN')) {
    return true;
  }

  // KOMMUNE_ADMIN has all capabilities within tenant
  if (ctx.roles.includes('KOMMUNE_ADMIN')) {
    return true;
  }

  // Check explicit capability grant
  return ctx.capabilities.has(capability);
}

/**
 * Decorator: Require specific capability
 * 
 * Usage:
 * @RequireCapability('rental_objects.write')
 * async createRentalObject() { }
 */
export function RequireCapability(capability: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (
      request: FastifyRequest,
      reply: FastifyReply,
      ...args: any[]
    ) {
      // Extract user context
      const ctx = extractUserContext(request);

      // 1. Authentication check
      if (!ctx) {
        return reply.status(401).send({
          type: 'https://problems/unauthorized',
          title: 'Unauthorized',
          status: 401,
          detail: 'Authentication required',
          instance: request.url,
        });
      }

      // 2. Capability check
      if (!hasCapability(ctx, capability)) {
        // Log access attempt
        console.warn('[RBAC] Access denied', {
          userId: ctx.userId,
          capability,
          endpoint: request.url,
          method: request.method,
        });

        return reply.status(403).send({
          type: 'https://problems/forbidden',
          title: 'Forbidden',
          status: 403,
          detail: `Missing capability: ${capability}`,
          instance: request.url,
        });
      }

      // Capability granted - proceed
      return originalMethod.apply(this, [request, reply, ...args]);
    };

    return descriptor;
  };
}

/**
 * Decorator: Require ANY of multiple capabilities
 * 
 * Usage:
 * @RequireAnyCapability(['rental_objects.read', 'rental_objects.write'])
 * async getRentalObject() { }
 */
export function RequireAnyCapability(capabilities: string[]) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (
      request: FastifyRequest,
      reply: FastifyReply,
      ...args: any[]
    ) {
      const ctx = extractUserContext(request);

      if (!ctx) {
        return reply.status(401).send({
          type: 'https://problems/unauthorized',
          title: 'Unauthorized',
          status: 401,
          detail: 'Authentication required',
          instance: request.url,
        });
      }

      // Check if user has ANY of the required capabilities
      const hasAny = capabilities.some((cap) => hasCapability(ctx, cap));

      if (!hasAny) {
        return reply.status(403).send({
          type: 'https://problems/forbidden',
          title: 'Forbidden',
          status: 403,
          detail: `Missing one of: ${capabilities.join(', ')}`,
          instance: request.url,
        });
      }

      return originalMethod.apply(this, [request, reply, ...args]);
    };

    return descriptor;
  };
}

/**
 * Decorator: Require ALL of multiple capabilities
 * 
 * Usage:
 * @RequireAllCapabilities(['rental_objects.read', 'bookings.approve'])
 * async approveBooking() { }
 */
export function RequireAllCapabilities(capabilities: string[]) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (
      request: FastifyRequest,
      reply: FastifyReply,
      ...args: any[]
    ) {
      const ctx = extractUserContext(request);

      if (!ctx) {
        return reply.status(401).send({
          type: 'https://problems/unauthorized',
          title: 'Unauthorized',
          status: 401,
          detail: 'Authentication required',
          instance: request.url,
        });
      }

      // Check if user has ALL required capabilities
      const hasAll = capabilities.every((cap) => hasCapability(ctx, cap));

      if (!hasAll) {
        const missing = capabilities.filter((cap) => !hasCapability(ctx, cap));

        return reply.status(403).send({
          type: 'https://problems/forbidden',
          title: 'Forbidden',
          status: 403,
          detail: `Missing capabilities: ${missing.join(', ')}`,
          instance: request.url,
        });
      }

      return originalMethod.apply(this, [request, reply, ...args]);
    };

    return descriptor;
  };
}
