/**
 * GDPR Controller
 * REST endpoints for GDPR consent management and data subject rights
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { GdprService, GrantConsentDTO, DataSubjectRequestDTO } from './gdpr.service';
import { z } from 'zod';

// =============================================================================
// Request Schemas
// =============================================================================

const grantConsentSchema = z.object({
  consentTypeId: z.string().uuid(),
  granted: z.boolean(),
  source: z.enum(['web', 'minside', 'backoffice', 'app']).default('web'),
});

const grantMultipleConsentsSchema = z.object({
  consents: z.array(grantConsentSchema),
});

const dataSubjectRequestSchema = z.object({
  requestType: z.enum(['access', 'erasure', 'portability', 'rectification', 'restriction', 'objection']),
  description: z.string().optional(),
});

const updateRequestStatusSchema = z.object({
  status: z.enum(['processing', 'completed', 'rejected']),
  responseNotes: z.string().optional(),
});

// =============================================================================
// Controller
// =============================================================================

export class GdprController {
  constructor(private readonly service: GdprService) {}

  /**
   * Register all GDPR routes
   */
  async register(app: FastifyInstance): Promise<void> {
    // =======================================================================
    // Public routes (for consent popup before auth)
    // =======================================================================
    
    app.get('/api/gdpr/consent-types', {
      schema: {
        description: 'Get all active consent types',
        tags: ['gdpr'],
        querystring: z.object({
          locale: z.enum(['nb', 'en']).default('nb'),
        }),
      },
    }, this.getConsentTypes.bind(this));

    // =======================================================================
    // Authenticated user routes
    // =======================================================================

    app.get('/api/gdpr/my-consents', {
      schema: {
        description: 'Get current user consent summary',
        tags: ['gdpr'],
        querystring: z.object({
          locale: z.enum(['nb', 'en']).default('nb'),
        }),
      },
    }, this.getMyConsents.bind(this));

    app.post('/api/gdpr/consent', {
      schema: {
        description: 'Grant or revoke a single consent',
        tags: ['gdpr'],
        body: grantConsentSchema,
      },
    }, this.grantConsent.bind(this));

    app.post('/api/gdpr/consents', {
      schema: {
        description: 'Grant or revoke multiple consents at once',
        tags: ['gdpr'],
        body: grantMultipleConsentsSchema,
      },
    }, this.grantMultipleConsents.bind(this));

    app.get('/api/gdpr/consent-status', {
      schema: {
        description: 'Check if user has granted all required consents',
        tags: ['gdpr'],
      },
    }, this.checkConsentStatus.bind(this));

    app.get('/api/gdpr/audit-log', {
      schema: {
        description: 'Get consent audit log for current user',
        tags: ['gdpr'],
        querystring: z.object({
          limit: z.coerce.number().min(1).max(100).default(50),
        }),
      },
    }, this.getAuditLog.bind(this));

    // =======================================================================
    // Data Subject Rights
    // =======================================================================

    app.post('/api/gdpr/data-request', {
      schema: {
        description: 'Submit a data subject request (access, erasure, etc.)',
        tags: ['gdpr'],
        body: dataSubjectRequestSchema,
      },
    }, this.createDataSubjectRequest.bind(this));

    app.get('/api/gdpr/my-data-requests', {
      schema: {
        description: 'Get all data subject requests for current user',
        tags: ['gdpr'],
      },
    }, this.getMyDataRequests.bind(this));

    // =======================================================================
    // Admin routes (for backoffice)
    // =======================================================================

    app.get('/api/gdpr/admin/pending-requests', {
      schema: {
        description: 'Get all pending data subject requests (admin)',
        tags: ['gdpr', 'admin'],
      },
    }, this.getPendingRequests.bind(this));

    app.patch('/api/gdpr/admin/requests/:id/status', {
      schema: {
        description: 'Update data subject request status (admin)',
        tags: ['gdpr', 'admin'],
        params: z.object({
          id: z.string().uuid(),
        }),
        body: updateRequestStatusSchema,
      },
    }, this.updateRequestStatus.bind(this));
  }

  // ==========================================================================
  // Route Handlers
  // ==========================================================================

  private async getConsentTypes(
    request: FastifyRequest<{ Querystring: { locale?: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    const tenantId = (request as any).tenantId ?? 'default';
    const locale = request.query.locale ?? 'nb';

    const types = await this.service.getConsentTypes(tenantId, locale);
    reply.send({ data: types });
  }

  private async getMyConsents(
    request: FastifyRequest<{ Querystring: { locale?: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    const tenantId = (request as any).tenantId;
    const userId = (request as any).user?.id;

    if (!tenantId || !userId) {
      reply.status(401).send({ error: 'Unauthorized' });
      return;
    }

    const locale = request.query.locale ?? 'nb';
    const summary = await this.service.getUserConsentSummary(tenantId, userId, locale);
    reply.send({ data: summary });
  }

  private async grantConsent(
    request: FastifyRequest<{ Body: z.infer<typeof grantConsentSchema> }>,
    reply: FastifyReply
  ): Promise<void> {
    const tenantId = (request as any).tenantId;
    const userId = (request as any).user?.id;

    if (!tenantId || !userId) {
      reply.status(401).send({ error: 'Unauthorized' });
      return;
    }

    const dto: GrantConsentDTO = {
      consentTypeId: request.body.consentTypeId,
      granted: request.body.granted,
      source: request.body.source ?? 'web',
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'] ?? undefined,
    };

    const result = await this.service.grantConsent(tenantId, userId, dto);
    reply.send({ data: result });
  }

  private async grantMultipleConsents(
    request: FastifyRequest<{ Body: z.infer<typeof grantMultipleConsentsSchema> }>,
    reply: FastifyReply
  ): Promise<void> {
    const tenantId = (request as any).tenantId;
    const userId = (request as any).user?.id;

    if (!tenantId || !userId) {
      reply.status(401).send({ error: 'Unauthorized' });
      return;
    }

    const consents: GrantConsentDTO[] = request.body.consents.map((c) => ({
      consentTypeId: c.consentTypeId,
      granted: c.granted,
      source: c.source ?? 'web',
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'] ?? undefined,
    }));

    const results = await this.service.grantMultipleConsents(tenantId, userId, consents);
    reply.send({ data: results });
  }

  private async checkConsentStatus(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const tenantId = (request as any).tenantId;
    const userId = (request as any).user?.id;

    if (!tenantId || !userId) {
      reply.status(401).send({ error: 'Unauthorized' });
      return;
    }

    const hasAllRequired = await this.service.hasRequiredConsents(tenantId, userId);
    reply.send({ data: { hasAllRequired } });
  }

  private async getAuditLog(
    request: FastifyRequest<{ Querystring: { limit?: number } }>,
    reply: FastifyReply
  ): Promise<void> {
    const tenantId = (request as any).tenantId;
    const userId = (request as any).user?.id;

    if (!tenantId || !userId) {
      reply.status(401).send({ error: 'Unauthorized' });
      return;
    }

    const limit = request.query.limit ?? 50;
    const auditLog = await this.service.getConsentAuditLog(tenantId, userId, limit);
    reply.send({ data: auditLog });
  }

  private async createDataSubjectRequest(
    request: FastifyRequest<{ Body: z.infer<typeof dataSubjectRequestSchema> }>,
    reply: FastifyReply
  ): Promise<void> {
    const tenantId = (request as any).tenantId;
    const userId = (request as any).user?.id;

    if (!tenantId || !userId) {
      reply.status(401).send({ error: 'Unauthorized' });
      return;
    }

    const dto: DataSubjectRequestDTO = {
      requestType: request.body.requestType,
      description: request.body.description,
    };

    const result = await this.service.createDataSubjectRequest(tenantId, userId, dto);
    reply.status(201).send({ data: result });
  }

  private async getMyDataRequests(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const tenantId = (request as any).tenantId;
    const userId = (request as any).user?.id;

    if (!tenantId || !userId) {
      reply.status(401).send({ error: 'Unauthorized' });
      return;
    }

    const requests = await this.service.getUserDataSubjectRequests(tenantId, userId);
    reply.send({ data: requests });
  }

  private async getPendingRequests(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const tenantId = (request as any).tenantId;

    if (!tenantId) {
      reply.status(401).send({ error: 'Unauthorized' });
      return;
    }

    // TODO: Add admin role check
    const requests = await this.service.getPendingDataSubjectRequests(tenantId);
    reply.send({ data: requests });
  }

  private async updateRequestStatus(
    request: FastifyRequest<{
      Params: { id: string };
      Body: z.infer<typeof updateRequestStatusSchema>;
    }>,
    reply: FastifyReply
  ): Promise<void> {
    const tenantId = (request as any).tenantId;
    const userId = (request as any).user?.id;

    if (!tenantId || !userId) {
      reply.status(401).send({ error: 'Unauthorized' });
      return;
    }

    // TODO: Add admin role check
    const result = await this.service.updateDataSubjectRequestStatus(
      request.params.id,
      request.body.status,
      userId,
      request.body.responseNotes
    );

    if (!result) {
      reply.status(404).send({ error: 'Request not found' });
      return;
    }

    reply.send({ data: result });
  }
}
