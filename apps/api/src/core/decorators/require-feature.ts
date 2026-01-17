/**
 * Feature Flag Enforcement Decorator
 * Enforces module-level feature flags before controller method execution
 * 
 * Reference: docs/roles/matrix.md - Feature flag registry
 */
import type { FastifyRequest, FastifyReply } from 'fastify';

interface FeatureFlagContext {
  tenantId: string;
  entitlements: Record<string, boolean>;
  flags: Record<string, boolean>;
}

/**
 * Extract feature flag context from request
 * Uses subscription and feature flags populated by authCookieMiddleware from JWT payload
 */
function extractFeatureFlagContext(request: FastifyRequest): FeatureFlagContext | null {
  const tenantId = (request as any).tenantId;
  
  if (!tenantId) {
    return null;
  }

  // authCookieMiddleware populates subscription and featureFlags from JWT
  const subscription = (request as any).subscription || {};
  const featureFlags = (request as any).featureFlags || {};

  return {
    tenantId,
    entitlements: subscription.entitlements || {},
    flags: featureFlags,
  };
}

/**
 * Check if feature is enabled
 * Requires BOTH entitlement (subscription) AND tenant flag
 */
function isFeatureEnabled(ctx: FeatureFlagContext, feature: string): boolean {
  // Check entitlement (subscription plan allows feature)
  const entitled = ctx.entitlements[feature] ?? true; // Default true for dev

  // Check tenant flag (tenant has enabled feature)
  const enabled = ctx.flags[feature] ?? true; // Default true for dev

  return entitled && enabled;
}

/**
 * Decorator: Require feature flag to be enabled
 * 
 * Usage:
 * @RequireFeature('feature.rental_objects')
 * async getRentalObjects() { }
 */
export function RequireFeature(feature: string) {
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
      // Extract feature context
      const ctx = extractFeatureFlagContext(request);

      // If no context (unauthenticated), allow public endpoints to proceed
      // Private endpoints will be caught by @RequireCapability
      if (!ctx) {
        return originalMethod.apply(this, [request, reply, ...args]);
      }

      // Check if feature is enabled
      if (!isFeatureEnabled(ctx, feature)) {
        // Log feature access attempt
        console.warn('[FeatureFlag] Feature disabled', {
          tenantId: ctx.tenantId,
          feature,
          endpoint: request.url,
          method: request.method,
        });

        return reply.status(403).send({
          type: 'https://problems/feature-disabled',
          title: 'Feature Disabled',
          status: 403,
          detail: `Feature not available: ${feature}`,
          instance: request.url,
        });
      }

      // Feature enabled - proceed
      return originalMethod.apply(this, [request, reply, ...args]);
    };

    return descriptor;
  };
}

/**
 * Decorator: Require ANY of multiple features
 * 
 * Usage:
 * @RequireAnyFeature(['feature.messaging', 'feature.notifications'])
 * async getMessages() { }
 */
export function RequireAnyFeature(features: string[]) {
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
      const ctx = extractFeatureFlagContext(request);

      if (!ctx) {
        return originalMethod.apply(this, [request, reply, ...args]);
      }

      // Check if ANY feature is enabled
      const anyEnabled = features.some((feat) => isFeatureEnabled(ctx, feat));

      if (!anyEnabled) {
        return reply.status(403).send({
          type: 'https://problems/feature-disabled',
          title: 'Feature Disabled',
          status: 403,
          detail: `None of these features are available: ${features.join(', ')}`,
          instance: request.url,
        });
      }

      return originalMethod.apply(this, [request, reply, ...args]);
    };

    return descriptor;
  };
}

/**
 * Decorator: Require ALL of multiple features
 * 
 * Usage:
 * @RequireAllFeatures(['feature.bookings', 'feature.payments'])
 * async processPayment() { }
 */
export function RequireAllFeatures(features: string[]) {
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
      const ctx = extractFeatureFlagContext(request);

      if (!ctx) {
        return originalMethod.apply(this, [request, reply, ...args]);
      }

      // Check if ALL features are enabled
      const allEnabled = features.every((feat) => isFeatureEnabled(ctx, feat));

      if (!allEnabled) {
        const disabled = features.filter((feat) => !isFeatureEnabled(ctx, feat));

        return reply.status(403).send({
          type: 'https://problems/feature-disabled',
          title: 'Feature Disabled',
          status: 403,
          detail: `These features are required but not available: ${disabled.join(', ')}`,
          instance: request.url,
        });
      }

      return originalMethod.apply(this, [request, reply, ...args]);
    };

    return descriptor;
  };
}
