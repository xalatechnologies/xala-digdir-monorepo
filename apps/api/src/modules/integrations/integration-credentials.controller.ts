/**
 * Integration Credentials Controller
 * 
 * API endpoints for managing encrypted integration credentials.
 * All endpoints require super_admin role.
 * 
 * Endpoints:
 * - GET    /api/integrations/:integrationId/credentials       - List credentials
 * - POST   /api/integrations/:integrationId/credentials       - Create credential
 * - GET    /api/integrations/:integrationId/credentials/:id   - Get credential info
 * - PUT    /api/integrations/:integrationId/credentials/:id   - Update credential
 * - DELETE /api/integrations/:integrationId/credentials/:id   - Delete credential
 * - POST   /api/integrations/:integrationId/credentials/:id/rotate - Rotate credential
 */

import type { FastifyRequest, FastifyReply } from 'fastify';
import { Controller, Get, Post, Put, Delete } from '../../core/decorators';
import { getTenantId, type TenantRequest } from '../../core/validation/tenant';
import { IntegrationCredentialsRepository } from './integration-credentials.repository';
import type { CredentialType } from '../../core/encryption';
import { CREDENTIAL_TYPES, INTEGRATION_PROVIDERS } from '../../core/encryption';

interface CredentialParams {
  integrationId: string;
  id?: string;
}

interface CreateCredentialBody {
  credentialType: CredentialType;
  name: string;
  value: string;
  expiresAt?: string;
  metadata?: Record<string, unknown>;
}

interface UpdateCredentialBody {
  name?: string;
  value?: string;
  expiresAt?: string | null;
  isActive?: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Check if user has super_admin role
 */
function requireSuperAdmin(request: TenantRequest, reply: FastifyReply): boolean {
  if (request.user?.role !== 'super_admin') {
    reply.code(403);
    reply.send({
      error: {
        code: 'FORBIDDEN',
        message: 'Only super administrators can manage integration credentials',
      },
    });
    return false;
  }
  return true;
}

/**
 * Get client IP from request
 */
function getClientIp(request: FastifyRequest): string {
  return (
    (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    request.ip ||
    'unknown'
  );
}

@Controller('/api/integrations/:integrationId/credentials')
export class IntegrationCredentialsController {
  /**
   * GET /api/integrations/:integrationId/credentials
   * List all credentials for an integration (without decrypted values)
   */
  @Get()
  async listCredentials(
    request: TenantRequest & FastifyRequest<{ Params: CredentialParams }>,
    reply: FastifyReply
  ): Promise<void> {
    if (!requireSuperAdmin(request, reply)) return;

    const { container } = await import('../../core/container');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = container.resolve('db') as any;
    const repo = new IntegrationCredentialsRepository(db);
    const tenantId = getTenantId(request);
    const { integrationId } = request.params;

    const credentials = await repo.listByIntegration(integrationId, tenantId);

    reply.send({
      data: credentials,
      meta: {
        total: credentials.length,
        integrationId,
      },
    });
  }

  /**
   * POST /api/integrations/:integrationId/credentials
   * Create a new encrypted credential
   */
  @Post()
  async createCredential(
    request: TenantRequest & FastifyRequest<{ Params: CredentialParams; Body: CreateCredentialBody }>,
    reply: FastifyReply
  ): Promise<void> {
    if (!requireSuperAdmin(request, reply)) return;

    const { container } = await import('../../core/container');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = container.resolve('db') as any;
    const repo = new IntegrationCredentialsRepository(db);
    const tenantId = getTenantId(request);
    const { integrationId } = request.params;
    const body = request.body;

    // Validate credential type
    if (!Object.values(CREDENTIAL_TYPES).includes(body.credentialType)) {
      reply.code(400);
      reply.send({
        error: {
          code: 'INVALID_CREDENTIAL_TYPE',
          message: `Invalid credential type. Valid types: ${Object.values(CREDENTIAL_TYPES).join(', ')}`,
        },
      });
      return;
    }

    // Check if credential already exists
    const exists = await repo.exists(
      integrationId,
      body.credentialType,
      body.name,
      tenantId
    );

    if (exists) {
      reply.code(409);
      reply.send({
        error: {
          code: 'CREDENTIAL_EXISTS',
          message: `A credential with type '${body.credentialType}' and name '${body.name}' already exists`,
        },
      });
      return;
    }

    const credential = await repo.create({
      tenantId,
      integrationId,
      credentialType: body.credentialType,
      name: body.name,
      value: body.value,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
      metadata: body.metadata,
      createdBy: request.user?.id,
    });

    reply.code(201);
    reply.send({ data: credential });
  }

  /**
   * GET /api/integrations/:integrationId/credentials/:id
   * Get credential info (without decrypted value)
   */
  @Get('/:id')
  async getCredential(
    request: TenantRequest & FastifyRequest<{ Params: CredentialParams }>,
    reply: FastifyReply
  ): Promise<void> {
    if (!requireSuperAdmin(request, reply)) return;

    const { container } = await import('../../core/container');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = container.resolve('db') as any;
    const repo = new IntegrationCredentialsRepository(db);
    const tenantId = getTenantId(request);
    const { id } = request.params;

    if (!id) {
      reply.code(400);
      reply.send({ error: { code: 'MISSING_ID', message: 'Credential ID is required' } });
      return;
    }

    const credential = await repo.getInfo(id, tenantId);

    if (!credential) {
      reply.code(404);
      reply.send({
        error: {
          code: 'NOT_FOUND',
          message: 'Credential not found',
        },
      });
      return;
    }

    reply.send({ data: credential });
  }

  /**
   * GET /api/integrations/:integrationId/credentials/:id/value
   * Get decrypted credential value (logged for audit)
   */
  @Get('/:id/value')
  async getCredentialValue(
    request: TenantRequest & FastifyRequest<{ Params: CredentialParams }>,
    reply: FastifyReply
  ): Promise<void> {
    if (!requireSuperAdmin(request, reply)) return;

    const { container } = await import('../../core/container');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = container.resolve('db') as any;
    const repo = new IntegrationCredentialsRepository(db);
    const tenantId = getTenantId(request);
    const { id } = request.params;

    if (!id) {
      reply.code(400);
      reply.send({ error: { code: 'MISSING_ID', message: 'Credential ID is required' } });
      return;
    }

    const clientIp = getClientIp(request);

    try {
      const credential = await repo.getDecryptedValue(
        id,
        tenantId,
        request.user?.id,
        clientIp
      );

      if (!credential) {
        reply.code(404);
        reply.send({
          error: {
            code: 'NOT_FOUND',
            message: 'Credential not found',
          },
        });
        return;
      }

      reply.send({ data: { value: credential.value } });
    } catch {
      reply.code(500);
      reply.send({
        error: {
          code: 'DECRYPTION_ERROR',
          message: 'Failed to decrypt credential',
        },
      });
    }
  }

  /**
   * PUT /api/integrations/:integrationId/credentials/:id
   * Update credential (optionally rotate value)
   */
  @Put('/:id')
  async updateCredential(
    request: TenantRequest & FastifyRequest<{ Params: CredentialParams; Body: UpdateCredentialBody }>,
    reply: FastifyReply
  ): Promise<void> {
    if (!requireSuperAdmin(request, reply)) return;

    const { container } = await import('../../core/container');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = container.resolve('db') as any;
    const repo = new IntegrationCredentialsRepository(db);
    const tenantId = getTenantId(request);
    const { id } = request.params;
    const body = request.body;

    if (!id) {
      reply.code(400);
      reply.send({ error: { code: 'MISSING_ID', message: 'Credential ID is required' } });
      return;
    }

    const credential = await repo.update(id, tenantId, {
      name: body.name,
      value: body.value,
      expiresAt: body.expiresAt === null ? null : body.expiresAt ? new Date(body.expiresAt) : undefined,
      isActive: body.isActive,
      metadata: body.metadata,
      updatedBy: request.user?.id,
    });

    if (!credential) {
      reply.code(404);
      reply.send({
        error: {
          code: 'NOT_FOUND',
          message: 'Credential not found',
        },
      });
      return;
    }

    reply.send({ data: credential });
  }

  /**
   * DELETE /api/integrations/:integrationId/credentials/:id
   * Delete a credential
   */
  @Delete('/:id')
  async deleteCredential(
    request: TenantRequest & FastifyRequest<{ Params: CredentialParams }>,
    reply: FastifyReply
  ): Promise<void> {
    if (!requireSuperAdmin(request, reply)) return;

    const { container } = await import('../../core/container');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = container.resolve('db') as any;
    const repo = new IntegrationCredentialsRepository(db);
    const tenantId = getTenantId(request);
    const { id } = request.params;

    if (!id) {
      reply.code(400);
      reply.send({ error: { code: 'MISSING_ID', message: 'Credential ID is required' } });
      return;
    }

    const deleted = await repo.delete(id, tenantId, request.user?.id);

    if (!deleted) {
      reply.code(404);
      reply.send({
        error: {
          code: 'NOT_FOUND',
          message: 'Credential not found',
        },
      });
      return;
    }

    reply.code(204);
    reply.send();
  }

  /**
   * POST /api/integrations/:integrationId/credentials/:id/rotate
   * Rotate credential with new value
   */
  @Post('/:id/rotate')
  async rotateCredential(
    request: TenantRequest & FastifyRequest<{ Params: CredentialParams; Body: { value: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    if (!requireSuperAdmin(request, reply)) return;

    const { container } = await import('../../core/container');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = container.resolve('db') as any;
    const repo = new IntegrationCredentialsRepository(db);
    const tenantId = getTenantId(request);
    const { id } = request.params;
    const { value } = request.body;

    if (!id) {
      reply.code(400);
      reply.send({ error: { code: 'MISSING_ID', message: 'Credential ID is required' } });
      return;
    }

    if (!value) {
      reply.code(400);
      reply.send({ error: { code: 'MISSING_VALUE', message: 'New credential value is required' } });
      return;
    }

    const credential = await repo.update(id, tenantId, {
      value,
      updatedBy: request.user?.id,
    });

    if (!credential) {
      reply.code(404);
      reply.send({
        error: {
          code: 'NOT_FOUND',
          message: 'Credential not found',
        },
      });
      return;
    }

    reply.send({
      data: credential,
      message: 'Credential rotated successfully',
    });
  }
}

/**
 * GET /api/integrations/credential-types
 * List available credential types
 */
@Controller('/api/integrations')
export class IntegrationMetadataController {
  @Get('/credential-types')
  async listCredentialTypes(
    request: TenantRequest,
    reply: FastifyReply
  ): Promise<void> {
    if (!requireSuperAdmin(request, reply)) return;

    reply.send({
      data: Object.entries(CREDENTIAL_TYPES).map(([key, value]) => ({
        key,
        value,
        label: key.replace(/_/g, ' ').toLowerCase(),
      })),
    });
  }

  @Get('/providers')
  async listProviders(
    request: TenantRequest,
    reply: FastifyReply
  ): Promise<void> {
    if (!requireSuperAdmin(request, reply)) return;

    reply.send({
      data: Object.entries(INTEGRATION_PROVIDERS).map(([key, value]) => ({
        key,
        value,
        label: key.replace(/_/g, ' '),
      })),
    });
  }
}

export default IntegrationCredentialsController;
