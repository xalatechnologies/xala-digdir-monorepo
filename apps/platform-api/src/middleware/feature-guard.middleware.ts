/**
 * Feature Guard Middleware
 * Protects routes based on tenant feature flags and category permissions
 */

import { FastifyRequest, FastifyReply } from 'fastify';

/**
 * Middleware to require a specific feature flag
 * Returns 403 if feature is not enabled for the tenant
 *
 * @param featureKey - The feature flag key to check
 *
 * @example
 * ```typescript
 * fastify.get('/api/reports', {
 *   preHandler: [requireAuth, requireFeature('platform.reporting')],
 *   handler: async (request, reply) => {
 *     // Only accessible if feature is enabled
 *   },
 * });
 * ```
 */
export function requireFeature(featureKey: string) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as any;

    if (!user || !user.tenantId) {
      return reply.status(401).send({
        type: 'https://api.platform.xala.no/errors/unauthorized',
        title: 'Unauthorized',
        status: 401,
        detail: 'Authentication required',
        instance: request.url,
      });
    }

    // Check if feature is enabled via featureFlagsService (attached to request in main.ts)
    const featureFlagsService = (request as any).featureFlagsService;
    if (featureFlagsService) {
      try {
        await featureFlagsService.requireFeature(user.tenantId, featureKey);
        return;
      } catch (error: any) {
        return reply.status(error.statusCode || 403).send({
          type: error.type || 'https://api.platform.xala.no/errors/feature-disabled',
          title: error.title || 'Feature Disabled',
          status: error.statusCode || 403,
          detail: error.detail || `Feature '${featureKey}' is not enabled`,
          instance: request.url,
        });
      }
    }

    // Fallback: check in user.featureFlags if service not available
    const featureFlags = user.featureFlags || {};
    if (featureFlags[featureKey] !== true) {
      return reply.status(403).send({
        type: 'https://api.platform.xala.no/errors/feature-disabled',
        title: 'Feature Disabled',
        status: 403,
        detail: `Feature '${featureKey}' is not enabled for this tenant.`,
        instance: request.url,
        feature: featureKey,
        tenantId: user.tenantId,
      });
    }
  };
}

/**
 * Middleware to require a specific module to be enabled
 * Returns RFC7807 error if module is not enabled for the tenant
 *
 * @param moduleKey - The module key to check (e.g., 'RATINGS', 'MESSAGING')
 *
 * @example
 * ```typescript
 * fastify.get('/api/ratings', {
 *   preHandler: [requireAuth, requireModule('RATINGS')],
 *   handler: async (request, reply) => {
 *     // Only accessible if RATINGS module is enabled
 *   },
 * });
 * ```
 */
export function requireModule(moduleKey: string) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as any;

    if (!user || !user.tenantId) {
      return reply.status(401).send({
        type: 'https://api.platform.xala.no/errors/unauthorized',
        title: 'Unauthorized',
        status: 401,
        detail: 'Authentication required',
        instance: request.url,
      });
    }

    // Check if module is enabled via modulesService (attached to request in main.ts)
    const modulesService = (request as any).modulesService;
    if (!modulesService) {
      // Fallback: if modulesService not available, check in user.capabilities
      const modules = user.modules || [];
      const targetModule = modules.find((m: any) => m.key === moduleKey);

      if (!targetModule?.enabled) {
        return reply.status(403).send({
          type: 'https://api.platform.xala.no/errors/feature-disabled',
          title: 'Feature Disabled',
          status: 403,
          detail: `The module '${moduleKey}' is not enabled for this tenant.`,
          instance: request.url,
          module: moduleKey,
          tenantId: user.tenantId,
        });
      }
      return;
    }

    try {
      await modulesService.requireModule(
        { tenantId: user.tenantId, orgId: user.organizationId },
        moduleKey
      );
    } catch (error: any) {
      return reply.status(error.status || 403).send({
        type: error.type || 'https://api.platform.xala.no/errors/feature-disabled',
        title: error.title || 'Feature Disabled',
        status: error.status || 403,
        detail: error.detail || `Module '${moduleKey}' is not enabled`,
        instance: request.url,
        module: moduleKey,
        tenantId: user.tenantId,
      });
    }
  };
}

/**
 * Helper to check feature in handler (non-blocking)
 * Returns boolean instead of throwing error
 *
 * @example
 * ```typescript
 * const hasReporting = await checkFeature(request, 'platform.reporting');
 * if (hasReporting) {
 *   // Include additional data
 * }
 * ```
 */
export async function checkFeature(
  request: FastifyRequest,
  featureKey: string
): Promise<boolean> {
  const user = request.user as any;

  if (!user || !user.tenantId) {
    return false;
  }

  try {
    const featureFlagsService = (request as any).featureFlagsService;
    if (featureFlagsService) {
      return await featureFlagsService.isFeatureEnabled(user.tenantId, featureKey);
    }
    // Fallback: check in user.featureFlags
    return (user.featureFlags || {})[featureKey] === true;
  } catch {
    return false;
  }
}
