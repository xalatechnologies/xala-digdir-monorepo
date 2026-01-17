/**
 * Policy Controller
 * REST API endpoints for policy set management
 */

import type { FastifyPluginAsync } from 'fastify';
import { getPolicySetService, type PolicyType, type CreatePolicySetInput, type UpdatePolicySetInput } from './policy.service';

// =============================================================================
// Request Schemas
// =============================================================================

const createPolicySchema = {
  body: {
    type: 'object',
    required: ['policyType', 'name', 'rules'],
    properties: {
      policyType: { type: 'string', enum: ['booking', 'pricing', 'approval', 'payment', 'availability', 'privacy', 'compliance'] },
      name: { type: 'string', minLength: 1, maxLength: 255 },
      description: { type: 'string' },
      rules: { type: 'object' },
    },
  },
};

const updatePolicySchema = {
  body: {
    type: 'object',
    properties: {
      name: { type: 'string', minLength: 1, maxLength: 255 },
      description: { type: 'string' },
      rules: { type: 'object' },
    },
  },
};

const publishPolicySchema = {
  body: {
    type: 'object',
    properties: {
      reason: { type: 'string' },
    },
  },
};

const rollbackPolicySchema = {
  body: {
    type: 'object',
    required: ['targetVersion'],
    properties: {
      targetVersion: { type: 'integer', minimum: 1 },
      reason: { type: 'string' },
    },
  },
};

// =============================================================================
// Routes
// =============================================================================

const policyRoutes: FastifyPluginAsync = async (fastify) => {
  const policyService = getPolicySetService();

  // ---------------------------------------------------------------------------
  // GET /api/policies - List all policies for tenant
  // ---------------------------------------------------------------------------
  fastify.get('/', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          policyType: { type: 'string' },
          status: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const { tenantId } = request.user as { tenantId: string };
    const { policyType, status } = request.query as { policyType?: string; status?: string };

    const policies = await policyService.getByTenant(tenantId, {
      policyType: policyType as PolicyType | undefined,
      status: status as any,
    });

    return reply.send({
      data: policies,
      meta: { count: policies.length },
    });
  });

  // ---------------------------------------------------------------------------
  // GET /api/policies/:id - Get policy by ID
  // ---------------------------------------------------------------------------
  fastify.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const policy = await policyService.getByIdOrFail(request.params.id);
    return reply.send({ data: policy });
  });

  // ---------------------------------------------------------------------------
  // GET /api/policies/published/:policyType - Get published policy
  // ---------------------------------------------------------------------------
  fastify.get<{ Params: { policyType: string } }>('/published/:policyType', async (request, reply) => {
    const { tenantId } = request.user as { tenantId: string };
    const policy = await policyService.getPublished(tenantId, request.params.policyType as PolicyType);

    if (!policy) {
      return reply.status(404).send({
        type: 'https://api.digilist.no/errors/not-found',
        title: 'Policy Not Found',
        detail: `No published ${request.params.policyType} policy found`,
        status: 404,
      });
    }

    return reply.send({ data: policy });
  });

  // ---------------------------------------------------------------------------
  // GET /api/policies/projection - Get all published policies as projection
  // ---------------------------------------------------------------------------
  fastify.get<{ Querystring: { rentalObjectId?: string } }>('/projection', async (request, reply) => {
    const { tenantId } = request.user as { tenantId: string };
    const { rentalObjectId } = request.query;

    const projection = await policyService.getProjection(tenantId, rentalObjectId);
    return reply.send({ data: projection });
  });

  // ---------------------------------------------------------------------------
  // POST /api/policies - Create new policy
  // ---------------------------------------------------------------------------
  fastify.post<{ Body: CreatePolicySetInput }>('/', {
    schema: createPolicySchema,
  }, async (request, reply) => {
    const { tenantId, userId } = request.user as { tenantId: string; userId: string };

    const policy = await policyService.create(tenantId, request.body, {
      userId,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    });

    return reply.status(201).send({ data: policy });
  });

  // ---------------------------------------------------------------------------
  // PATCH /api/policies/:id - Update draft policy
  // ---------------------------------------------------------------------------
  fastify.patch<{ Params: { id: string }; Body: UpdatePolicySetInput }>('/:id', {
    schema: updatePolicySchema,
  }, async (request, reply) => {
    const { userId } = request.user as { userId: string };

    const policy = await policyService.update(request.params.id, request.body, {
      userId,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    });

    return reply.send({ data: policy });
  });

  // ---------------------------------------------------------------------------
  // POST /api/policies/:id/publish - Publish draft policy
  // ---------------------------------------------------------------------------
  fastify.post<{ Params: { id: string }; Body: { reason?: string } }>('/:id/publish', {
    schema: publishPolicySchema,
  }, async (request, reply) => {
    const { userId } = request.user as { userId: string };

    const policy = await policyService.publish(request.params.id, request.body, {
      userId,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    });

    return reply.send({ data: policy });
  });

  // ---------------------------------------------------------------------------
  // POST /api/policies/:policyType/rollback - Rollback to previous version
  // ---------------------------------------------------------------------------
  fastify.post<{ Params: { policyType: string }; Body: { targetVersion: number; reason?: string } }>('/:policyType/rollback', {
    schema: rollbackPolicySchema,
  }, async (request, reply) => {
    const { tenantId, userId } = request.user as { tenantId: string; userId: string };

    const policy = await policyService.rollback(
      tenantId,
      request.params.policyType as PolicyType,
      request.body,
      {
        userId,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      }
    );

    return reply.send({ data: policy });
  });

  // ---------------------------------------------------------------------------
  // GET /api/policies/:id/audit - Get audit history
  // ---------------------------------------------------------------------------
  fastify.get<{ Params: { id: string } }>('/:id/audit', async (request, reply) => {
    const history = await policyService.getAuditHistory(request.params.id);
    return reply.send({
      data: history,
      meta: { count: history.length },
    });
  });
};

export default policyRoutes;
