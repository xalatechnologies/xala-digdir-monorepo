/**
 * GDPR Service
 * Business logic for GDPR data subject rights management
 */
import { Injectable, Inject } from '../../core/decorators';
import { GdprRepository } from './gdpr.repository';
import { UserRepository } from '../user/user.repository';
import { validate } from '../../core/validation/zod-pipe';
import { NotFoundError, ConflictError, BadRequestError } from '../../core/errors/problem-details';
import { getAuditService } from '../../core/audit/audit.service';
import {
  CreateGdprRequestSchema,
  UpdateGdprRequestStatusSchema,
  GdprRequestQuerySchema,
  type CreateGdprRequestDTO,
  type UpdateGdprRequestStatusDTO,
  type GdprRequestQueryParams,
  type GdprRequest,
} from '../../schemas/gdpr.schema';
import type { PaginatedResult } from '../../database/base.repository';

@Injectable()
export class GdprService {
  constructor(
    @Inject('GdprRepository') private readonly repository: GdprRepository,
    @Inject('UserRepository') private readonly userRepository: UserRepository,
    @Inject('Adapters') private readonly adapters: any
  ) {}

  /**
   * Create a data export request
   */
  async createExportRequest(
    tenantId: string,
    userId: string,
    data: CreateGdprRequestDTO
  ): Promise<GdprRequest> {
    const validated = validate(CreateGdprRequestSchema, { ...data, requestType: 'export' });

    // Check if user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(`User with id ${userId} not found`);
    }

    // Check if there's already a pending export request
    const existingRequests = await this.repository.findByUserId(userId, tenantId);
    const pendingExport = existingRequests.find(
      (req: any) => req.requestType === 'export' && req.status === 'pending'
    );

    if (pendingExport) {
      throw new ConflictError('A pending export request already exists for this user');
    }

    // Calculate expiry date (30 days from now for GDPR compliance)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const request = await this.repository.create({
      tenantId,
      userId,
      requestType: validated.requestType,
      status: 'pending',
      expiresAt,
      metadata: validated.metadata || {},
    });

    this.adapters?.log?.info('GDPR export request created', {
      id: request.id,
      tenantId,
      userId,
    });

    getAuditService().log({
      tenantId,
      userId,
      action: 'create',
      resource: 'gdpr_request',
      resourceId: request.id,
      metadata: { requestType: 'export' },
    });

    return request as unknown as GdprRequest;
  }

  /**
   * Create a data deletion request
   */
  async createDeletionRequest(
    tenantId: string,
    userId: string,
    data: CreateGdprRequestDTO
  ): Promise<GdprRequest> {
    const validated = validate(CreateGdprRequestSchema, { ...data, requestType: 'deletion' });

    // Check if user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(`User with id ${userId} not found`);
    }

    // Check if there's already a pending deletion request
    const existingRequests = await this.repository.findByUserId(userId, tenantId);
    const pendingDeletion = existingRequests.find(
      (req: any) => req.requestType === 'deletion' && req.status === 'pending'
    );

    if (pendingDeletion) {
      throw new ConflictError('A pending deletion request already exists for this user');
    }

    // Calculate expiry date (30 days from now for GDPR compliance)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const request = await this.repository.create({
      tenantId,
      userId,
      requestType: validated.requestType,
      status: 'pending',
      expiresAt,
      metadata: validated.metadata || {},
    });

    this.adapters?.log?.info('GDPR deletion request created', {
      id: request.id,
      tenantId,
      userId,
    });

    getAuditService().log({
      tenantId,
      userId,
      action: 'create',
      resource: 'gdpr_request',
      resourceId: request.id,
      metadata: { requestType: 'deletion' },
    });

    return request as unknown as GdprRequest;
  }

  /**
   * Process a data export request
   * Generates JSON export of user data
   */
  async processExportRequest(
    requestId: string,
    processedBy: string
  ): Promise<GdprRequest> {
    const request = await this.findByIdOrFail(requestId);

    if (request.requestType !== 'export') {
      throw new BadRequestError('Request is not an export request');
    }

    if (request.status !== 'pending') {
      throw new BadRequestError(`Request is already ${request.status}`);
    }

    // Get user data
    const user = await this.userRepository.findById(request.userId);
    if (!user) {
      throw new NotFoundError(`User with id ${request.userId} not found`);
    }

    // Generate export data (JSON format)
    const exportData = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        metadata: user.metadata,
      },
      exportedAt: new Date().toISOString(),
      tenantId: request.tenantId,
    };

    // Update request with export data and mark as completed
    const updatedRequest = await this.repository.update(requestId, {
      status: 'completed',
      processedAt: new Date(),
      processedBy,
      metadata: {
        ...request.metadata,
        exportData,
      },
    });

    this.adapters?.log?.info('GDPR export request processed', {
      id: requestId,
      tenantId: request.tenantId,
      processedBy,
    });

    getAuditService().log({
      tenantId: request.tenantId,
      userId: processedBy,
      action: 'approve',
      resource: 'gdpr_request',
      resourceId: requestId,
      metadata: { requestType: 'export', status: 'completed' },
    });

    return updatedRequest as unknown as GdprRequest;
  }

  /**
   * Process a data deletion request
   * Soft deletes the user account
   */
  async processDeletionRequest(
    requestId: string,
    processedBy: string
  ): Promise<GdprRequest> {
    const request = await this.findByIdOrFail(requestId);

    if (request.requestType !== 'deletion') {
      throw new BadRequestError('Request is not a deletion request');
    }

    if (request.status !== 'pending') {
      throw new BadRequestError(`Request is already ${request.status}`);
    }

    // Soft delete the user
    const user = await this.userRepository.findById(request.userId);
    if (!user) {
      throw new NotFoundError(`User with id ${request.userId} not found`);
    }

    // Deactivate user account (soft delete)
    await this.userRepository.deactivate(request.userId);

    // Update request and mark as completed
    const updatedRequest = await this.repository.update(requestId, {
      status: 'completed',
      processedAt: new Date(),
      processedBy,
      metadata: {
        ...request.metadata,
        deletedAt: new Date().toISOString(),
      },
    });

    this.adapters?.log?.info('GDPR deletion request processed', {
      id: requestId,
      tenantId: request.tenantId,
      userId: request.userId,
      processedBy,
    });

    getAuditService().log({
      tenantId: request.tenantId,
      userId: processedBy,
      action: 'approve',
      resource: 'gdpr_request',
      resourceId: requestId,
      metadata: { requestType: 'deletion', status: 'completed' },
    });

    // Audit log the user deletion
    getAuditService().log({
      tenantId: request.tenantId,
      userId: processedBy,
      action: 'delete',
      resource: 'user',
      resourceId: request.userId,
      metadata: { reason: 'gdpr_deletion_request', requestId },
      severity: 'warning',
    });

    return updatedRequest as unknown as GdprRequest;
  }

  /**
   * Update request status (approve/reject)
   */
  async updateRequestStatus(
    requestId: string,
    data: UpdateGdprRequestStatusDTO,
    processedBy: string
  ): Promise<GdprRequest> {
    const validated = validate(UpdateGdprRequestStatusSchema, data);
    const request = await this.findByIdOrFail(requestId);

    if (request.status !== 'pending') {
      throw new BadRequestError(`Request is already ${request.status}`);
    }

    // If approving, use the appropriate processing method
    if (validated.status === 'completed') {
      if (request.requestType === 'export') {
        return this.processExportRequest(requestId, processedBy);
      } else if (request.requestType === 'deletion') {
        return this.processDeletionRequest(requestId, processedBy);
      }
    }

    // Handle rejection or other status updates
    const updatedRequest = await this.repository.updateStatus(
      requestId,
      validated.status,
      processedBy
    );

    // Store rejection reason in metadata if provided
    if (validated.status === 'rejected' && validated.rejectionReason) {
      await this.repository.update(requestId, {
        metadata: {
          ...request.metadata,
          rejectionReason: validated.rejectionReason,
          rejectedAt: new Date().toISOString(),
        },
      });
    }

    this.adapters?.log?.info('GDPR request status updated', {
      id: requestId,
      tenantId: request.tenantId,
      status: validated.status,
      processedBy,
    });

    getAuditService().log({
      tenantId: request.tenantId,
      userId: processedBy,
      action: validated.status === 'rejected' ? 'reject' : 'update',
      resource: 'gdpr_request',
      resourceId: requestId,
      metadata: {
        previousStatus: request.status,
        newStatus: validated.status,
        rejectionReason: validated.rejectionReason,
      },
    });

    return updatedRequest as unknown as GdprRequest;
  }

  /**
   * Get request by ID
   */
  async findById(id: string): Promise<GdprRequest | null> {
    return this.repository.findById(id) as unknown as Promise<GdprRequest | null>;
  }

  /**
   * Get request by ID or throw
   */
  async findByIdOrFail(id: string): Promise<GdprRequest> {
    const request = await this.repository.findById(id);
    if (!request) {
      throw new NotFoundError(`GDPR request with id ${id} not found`);
    }
    return request as unknown as GdprRequest;
  }

  /**
   * Get requests by user ID
   */
  async findByUserId(userId: string, tenantId: string): Promise<GdprRequest[]> {
    return this.repository.findByUserId(userId, tenantId) as unknown as Promise<GdprRequest[]>;
  }

  /**
   * List requests for a tenant with filters
   */
  async findAll(
    tenantId: string,
    params: GdprRequestQueryParams
  ): Promise<PaginatedResult<GdprRequest>> {
    const validated = validate(GdprRequestQuerySchema, params);
    return this.repository.findByTenant(tenantId, {
      ...validated,
      page: validated.page ?? 1,
      limit: validated.limit ?? 20,
    }) as unknown as Promise<PaginatedResult<GdprRequest>>;
  }

  /**
   * Get pending requests for a tenant
   */
  async findPendingRequests(
    tenantId: string,
    params: { page?: number; limit?: number }
  ): Promise<PaginatedResult<GdprRequest>> {
    return this.repository.findPendingRequests(tenantId, {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    }) as unknown as Promise<PaginatedResult<GdprRequest>>;
  }

  /**
   * Cancel a request (only if pending)
   */
  async cancelRequest(requestId: string, userId: string): Promise<GdprRequest> {
    const request = await this.findByIdOrFail(requestId);

    // Only the request owner can cancel
    if (request.userId !== userId) {
      throw new BadRequestError('You can only cancel your own requests');
    }

    if (request.status !== 'pending') {
      throw new BadRequestError(`Cannot cancel request with status ${request.status}`);
    }

    const updatedRequest = await this.repository.update(requestId, {
      status: 'rejected',
      metadata: {
        ...request.metadata,
        cancelledAt: new Date().toISOString(),
        cancelledBy: userId,
      },
    });

    this.adapters?.log?.info('GDPR request cancelled', {
      id: requestId,
      tenantId: request.tenantId,
      userId,
    });

    getAuditService().log({
      tenantId: request.tenantId,
      userId,
      action: 'cancel',
      resource: 'gdpr_request',
      resourceId: requestId,
      metadata: { requestType: request.requestType },
    });

    return updatedRequest as unknown as GdprRequest;
  }
}
