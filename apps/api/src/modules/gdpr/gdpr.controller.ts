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
    
    app.get('/api/gdpr/consent-types', this.getConsentTypes.bind(this));

    // =======================================================================
    // Authenticated user routes
    // =======================================================================

    app.get('/api/gdpr/my-consents', this.getMyConsents.bind(this));
    app.post('/api/gdpr/consent', this.grantConsent.bind(this));
    app.post('/api/gdpr/consents', this.grantMultipleConsents.bind(this));
    app.get('/api/gdpr/consent-status', this.checkConsentStatus.bind(this));
    app.get('/api/gdpr/audit-log', this.getAuditLog.bind(this));

    // =======================================================================
    // Data Subject Rights
    // =======================================================================

    app.post('/api/gdpr/data-request', this.createDataSubjectRequest.bind(this));
    app.get('/api/gdpr/my-data-requests', this.getMyDataRequests.bind(this));

    // =======================================================================
    // Admin routes (for backoffice)
    // =======================================================================

    app.get('/api/gdpr/admin/pending-requests', this.getPendingRequests.bind(this));
    app.patch('/api/gdpr/admin/requests/:id/status', this.updateRequestStatus.bind(this));
  }

  // ==========================================================================
  // Route Handlers
  // ==========================================================================

  private async getConsentTypes(
    request: FastifyRequest<{ Querystring: { locale?: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    const tenantId = (request as unknown as { tenantId?: string }).tenantId ?? 'default';
    const locale = request.query.locale ?? 'nb';

    const types = await this.service.getConsentTypes(tenantId, locale);
    reply.send({ data: types });
  }

  private async getMyConsents(
    request: FastifyRequest<{ Querystring: { locale?: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    const tenantId = (request as unknown as { tenantId?: string }).tenantId;
    const userId = (request as unknown as { user?: { id: string } }).user?.id;

    if (!tenantId || !userId) {
      reply.status(401).send({ error: 'Unauthorized' });
      return;
    }

    const locale = request.query.locale ?? 'nb';
    const summary = await this.service.getUserConsentSummary(tenantId, userId, locale);
    reply.send({ data: summary });
  }

  private async grantConsent(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const tenantId = (request as unknown as { tenantId?: string }).tenantId;
    const userId = (request as unknown as { user?: { id: string } }).user?.id;

    if (!tenantId || !userId) {
      reply.status(401).send({ error: 'Unauthorized' });
      return;
    }

    const parsed = grantConsentSchema.safeParse(request.body);
    if (!parsed.success) {
      reply.status(400).send({ error: 'Invalid request body', details: parsed.error.issues });
      return;
    }

    const dto: GrantConsentDTO = {
      consentTypeId: parsed.data.consentTypeId,
      granted: parsed.data.granted,
      source: parsed.data.source ?? 'web',
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'] ?? undefined,
    };

    const result = await this.service.grantConsent(tenantId, userId, dto);
    reply.send({ data: result });
  }

  private async grantMultipleConsents(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const tenantId = (request as unknown as { tenantId?: string }).tenantId;
    const userId = (request as unknown as { user?: { id: string } }).user?.id;

    if (!tenantId || !userId) {
      reply.status(401).send({ error: 'Unauthorized' });
      return;
    }

    const parsed = grantMultipleConsentsSchema.safeParse(request.body);
    if (!parsed.success) {
      reply.status(400).send({ error: 'Invalid request body', details: parsed.error.issues });
      return;
    }

    const consents: GrantConsentDTO[] = parsed.data.consents.map((c) => ({
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
    const tenantId = (request as unknown as { tenantId?: string }).tenantId;
    const userId = (request as unknown as { user?: { id: string } }).user?.id;

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
    const tenantId = (request as unknown as { tenantId?: string }).tenantId;
    const userId = (request as unknown as { user?: { id: string } }).user?.id;

    if (!tenantId || !userId) {
      reply.status(401).send({ error: 'Unauthorized' });
      return;
    }

    const limit = request.query.limit ?? 50;
    const auditLog = await this.service.getConsentAuditLog(tenantId, userId, limit);
    reply.send({ data: auditLog });
  }

  private async createDataSubjectRequest(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const tenantId = (request as unknown as { tenantId?: string }).tenantId;
    const userId = (request as unknown as { user?: { id: string } }).user?.id;

    if (!tenantId || !userId) {
      reply.status(401).send({ error: 'Unauthorized' });
      return;
    }

    const parsed = dataSubjectRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      reply.status(400).send({ error: 'Invalid request body', details: parsed.error.issues });
      return;
    }

    const dto: DataSubjectRequestDTO = {
      requestType: parsed.data.requestType,
      description: parsed.data.description,
    };

    const result = await this.service.createDataSubjectRequest(tenantId, userId, dto);
    reply.status(201).send({ data: result });
  }

  private async getMyDataRequests(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const tenantId = (request as unknown as { tenantId?: string }).tenantId;
    const userId = (request as unknown as { user?: { id: string } }).user?.id;

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
    const tenantId = (request as unknown as { tenantId?: string }).tenantId;

    if (!tenantId) {
      reply.status(401).send({ error: 'Unauthorized' });
      return;
    }

    // TODO: Add admin role check
    const requests = await this.service.getPendingDataSubjectRequests(tenantId);
    reply.send({ data: requests });
  }

  private async updateRequestStatus(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    const tenantId = (request as unknown as { tenantId?: string }).tenantId;
    const userId = (request as unknown as { user?: { id: string } }).user?.id;

    if (!tenantId || !userId) {
      reply.status(401).send({ error: 'Unauthorized' });
      return;
    }

    const parsed = updateRequestStatusSchema.safeParse(request.body);
    if (!parsed.success) {
      reply.status(400).send({ error: 'Invalid request body', details: parsed.error.issues });
      return;
    }

    // TODO: Add admin role check
    const result = await this.service.updateDataSubjectRequestStatus(
      request.params.id,
      parsed.data.status,
      userId,
      parsed.data.responseNotes
    );

    if (!result) {
      reply.status(404).send({ error: 'Request not found' });
      return;
    }

    reply.send({ data: result });
  }
}
