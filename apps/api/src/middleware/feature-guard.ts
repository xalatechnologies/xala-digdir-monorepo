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
 *   preHandler: [requireAuth, requireFeature('backoffice.reporting')],
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
        type: 'https://api.digilist.no/errors/unauthorized',
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
          type: error.type || 'https://api.digilist.no/errors/feature-disabled',
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
        type: 'https://api.digilist.no/errors/feature-disabled',
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
        type: 'https://api.digilist.no/errors/unauthorized',
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
      const capabilities = user.capabilities || {};
      const modules = user.modules || [];
      const targetModule = modules.find((m: any) => m.key === moduleKey);
      
      if (!targetModule?.enabled) {
        return reply.status(403).send({
          type: 'https://api.digilist.no/errors/feature-disabled',
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
        type: error.type || 'https://api.digilist.no/errors/feature-disabled',
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
 * Middleware to require a specific rental object category
 * Returns 403 if category is not enabled for the tenant
 * 
 * @param category - The category to check (LOCALE, ARRANGEMENT, etc.)
 * 
 * @example
 * ```typescript
 * fastify.post('/api/rental-objects', {
 *   preHandler: [requireAuth, requireCategory('ARRANGEMENT')],
 *   handler: async (request, reply) => {
 *     // Only accessible if category is enabled
 *   },
 * });
 * ```
 */
export function requireCategory(category: string) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as any;
    
    if (!user || !user.tenantId) {
      return reply.status(401).send({
        type: 'https://api.digilist.no/errors/unauthorized',
        title: 'Unauthorized',
        status: 401,
        detail: 'Authentication required',
        instance: request.url,
      });
    }

    try {
      const featureFlagsService = (request as any).featureFlagsService;
      if (featureFlagsService) {
        await featureFlagsService.requireCategory(user.tenantId, category);
        return;
      }
      // Fallback: check in user.enabledCategories
      const enabledCategories = user.enabledCategories || [];
      if (!enabledCategories.includes(category)) {
        throw { statusCode: 403, detail: `Category '${category}' is not enabled` };
      }
    } catch (error: any) {
      return reply.status(error.statusCode || 403).send({
        type: error.type || 'https://api.digilist.no/errors/category-disabled',
        title: error.title || 'Category Disabled',
        status: error.statusCode || 403,
        detail: error.detail || `Category '${category}' is not enabled`,
        instance: request.url,
      });
    }
  };
}

/**
 * Middleware to validate category in request body
 * Checks if the category in the request is enabled for the tenant
 * 
 * @example
 * ```typescript
 * fastify.post('/api/rental-objects', {
 *   preHandler: [requireAuth, validateCategoryInBody],
 *   handler: async (request, reply) => {
 *     // Category in body has been validated
 *   },
 * });
 * ```
 */
export async function validateCategoryInBody(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const user = request.user as any;
  const body = request.body as any;

  if (!user || !user.tenantId) {
    return reply.status(401).send({
      type: 'https://api.digilist.no/errors/unauthorized',
      title: 'Unauthorized',
      status: 401,
      detail: 'Authentication required',
      instance: request.url,
    });
  }

  if (!body || !body.category) {
    return reply.status(400).send({
      type: 'https://api.digilist.no/errors/validation-error',
      title: 'Validation Error',
      status: 400,
      detail: 'Category is required',
      instance: request.url,
    });
  }

  try {
    const featureFlagsService = (request as any).featureFlagsService;
    if (featureFlagsService) {
      await featureFlagsService.requireCategory(user.tenantId, body.category);
      return;
    }
    // Fallback: check in user.enabledCategories
    const enabledCategories = user.enabledCategories || [];
    if (!enabledCategories.includes(body.category)) {
      throw { statusCode: 403, detail: `Category '${body.category}' is not enabled` };
    }
  } catch (error: any) {
    return reply.status(error.statusCode || 403).send({
      type: error.type || 'https://api.digilist.no/errors/category-disabled',
      title: error.title || 'Category Disabled',
      status: error.statusCode || 403,
      detail: error.detail || `Category '${body.category}' is not enabled`,
      instance: request.url,
    });
  }
}

/**
 * Helper to check feature in handler (non-blocking)
 * Returns boolean instead of throwing error
 * 
 * @example
 * ```typescript
 * const hasReporting = await checkFeature(request, 'backoffice.reporting');
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

/**
 * Helper to check category in handler (non-blocking)
 * Returns boolean instead of throwing error
 * 
 * @example
 * ```typescript
 * const canUseArrangements = await checkCategory(request, 'ARRANGEMENT');
 * if (canUseArrangements) {
 *   // Include arrangement-specific logic
 * }
 * ```
 */
export async function checkCategory(
  request: FastifyRequest,
  category: string
): Promise<boolean> {
  const user = request.user as any;
  
  if (!user || !user.tenantId) {
    return false;
  }

  try {
    const featureFlagsService = (request as any).featureFlagsService;
    if (featureFlagsService) {
      return await featureFlagsService.isCategoryEnabled(user.tenantId, category);
    }
    // Fallback: check in user.enabledCategories
    return (user.enabledCategories || []).includes(category);
  } catch {
    return false;
  }
}
