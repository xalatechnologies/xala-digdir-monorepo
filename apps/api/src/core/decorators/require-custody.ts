/**
 * Custody Enforcement Decorator
 * Enforces resource-scoped permission checks (Custody Scopes)
 */
import type { FastifyRequest, FastifyReply } from 'fastify';
import { CustodyScope } from '../../modules/custody/types';
import { CustodyEvaluator } from '../../modules/custody/custody.evaluator';

/**
 * Decorator: Require specific custody scope on a rental object
 * 
 * Usage:
 * @RequireCustody('RO_EDIT')
 * async updateRentalObject(request: FastifyRequest) { ... }
 */
export function RequireCustody(scope: CustodyScope) {
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
      const tenantId = (request as any).tenantId;
      const userId = (request as any).userId;
      const user = (request as any).user;
      
      // Get rentalObjectId from params (standard for our API)
      const { id: rentalObjectId } = request.params as { id: string };

      if (!tenantId || !userId || !rentalObjectId) {
        return reply.status(401).send({
          title: 'Unauthorized',
          status: 401,
          detail: 'Authentication and resource ID required',
        });
      }

      // We need the evaluator. In our simple DI system, we can't easily inject into decorators
      // so we'll get it from the request's DI container if available, or instantiate it.
      // For now, we'll assume the service is available on the target or request.
      // In this codebase, services are often injected into controllers.
      
      const db = (request as any).server?.db || (this as any).db;
      if (!db) {
        // Fallback: use the global DB if possible, but decorators are tricky
        console.error('[Custody] Database not found in context');
        return reply.status(500).send({ title: 'Internal Server Error', status: 500 });
      }

      const evaluator = new CustodyEvaluator(db);
      
      const userContext = {
        userId,
        tenantId,
        role: user?.role,
      };

      const allowed = await evaluator.can(userContext, scope, rentalObjectId);

      if (!allowed) {
        return reply.status(403).send({
          type: 'https://problems/forbidden',
          title: 'Forbidden',
          status: 403,
          detail: `Missing custody scope: ${scope} for resource ${rentalObjectId}`,
          instance: request.url,
        });
      }

      return originalMethod.apply(this, [request, reply, ...args]);
    };

    return descriptor;
  };
}
