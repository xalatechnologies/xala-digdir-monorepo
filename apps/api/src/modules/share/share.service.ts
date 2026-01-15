/**
 * Share Service
 * Business logic for share link domain
 */
import { Injectable, Inject } from '../../core/decorators';
import { ShareRepository } from './share.repository';
import { validate } from '../../core/validation/zod-pipe';
import { ForbiddenError, NotFoundError, GoneError } from '../../core/errors/problem-details';
import { getAuditService } from '../../core/audit/audit.service';
import {
  CreateShareSchema,
  ShareQuerySchema,
  RevokeShareSchema,
  type CreateShareDTO,
  type ShareQueryParams,
  type RevokeShareDTO,
  type ShareLink,
  type ShareLinkResponse,
} from '../../schemas/share.schema';
import type { PaginatedResult } from '../../database/base.repository';
import type { ShareLink as ShareLinkEntity, NewShareLink } from '../../database/schema';

@Injectable()
export class ShareService {
  constructor(
    @Inject('ShareRepository') private readonly repository: ShareRepository,
    @Inject('Adapters') private readonly adapters: any
  ) {}

  /**
   * Generate a unique share token
   */
  private generateToken(): string {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 16);
  }

  /**
   * Build the full share URL from a token
   */
  private buildShareUrl(token: string): string {
    return `https://digilist.no/share/${token}`;
  }

  /**
   * Create a new share link
   */
  async create(
    tenantId: string,
    userId: string | null,
    data: CreateShareDTO
  ): Promise<ShareLinkResponse> {
    const validated = validate(CreateShareSchema, data);

    const token = this.generateToken();

    // Default expiration: 7 days if not specified
    const expiresAt = validated.expiresAt
      ? new Date(validated.expiresAt)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const shareLink = await this.repository.create({
      tenantId,
      type: validated.type || 'listing',
      resourceId: validated.resourceId,
      token,
      createdById: userId,
      expiresAt,
      viewCount: 0,
      status: 'active',
      metadata: validated.metadata || {},
    } as NewShareLink);

    this.adapters?.log?.info('Share link created', {
      id: shareLink.id,
      token,
      tenantId,
      resourceId: validated.resourceId,
    });

    // Audit log
    getAuditService().log({
      tenantId,
      userId: userId || undefined,
      action: 'create',
      resource: 'share_link',
      resourceId: shareLink.id,
      metadata: {
        type: shareLink.type,
        targetResourceId: shareLink.resourceId,
        expiresAt: shareLink.expiresAt,
      },
    });

    return this.toResponse(shareLink);
  }

  /**
   * Validate a share link by token
   * Returns the share link if valid, throws appropriate error otherwise
   */
  async validate(token: string): Promise<ShareLinkResponse> {
    const shareLink = await this.repository.findByToken(token);

    if (!shareLink) {
      throw new NotFoundError('Share link not found');
    }

    // Check if revoked
    if (shareLink.revokedAt || shareLink.status === 'revoked') {
      throw new GoneError('Share link has been revoked');
    }

    // Check if expired
    if (shareLink.expiresAt && new Date(shareLink.expiresAt) < new Date()) {
      // Mark as expired in database
      await this.repository.markExpired(shareLink.id);
      throw new GoneError('Share link has expired');
    }

    if (shareLink.status !== 'active') {
      throw new GoneError('Share link is no longer active');
    }

    return this.toResponse(shareLink);
  }

  /**
   * Track a view on a share link
   * Increments view count atomically and returns updated share link
   */
  async trackView(token: string): Promise<ShareLinkResponse> {
    // First validate the link is active
    const shareLink = await this.repository.findValidByToken(token);

    if (!shareLink) {
      // Try to find the link to give a more specific error
      const rawLink = await this.repository.findByToken(token);
      if (!rawLink) {
        throw new NotFoundError('Share link not found');
      }
      if (rawLink.revokedAt || rawLink.status === 'revoked') {
        throw new GoneError('Share link has been revoked');
      }
      if (rawLink.expiresAt && new Date(rawLink.expiresAt) < new Date()) {
        throw new GoneError('Share link has expired');
      }
      throw new GoneError('Share link is no longer active');
    }

    // Increment view count
    const updated = await this.repository.incrementViewCount(token);

    if (!updated) {
      throw new NotFoundError('Share link not found');
    }

    this.adapters?.log?.info('Share link viewed', {
      id: updated.id,
      token,
      viewCount: updated.viewCount,
    });

    // Audit log view (without PII - GDPR compliant)
    getAuditService().log({
      tenantId: updated.tenantId,
      action: 'view',
      resource: 'share_link',
      resourceId: updated.id,
      metadata: {
        viewCount: updated.viewCount,
      },
    });

    return this.toResponse(updated);
  }

  /**
   * Revoke a share link
   * Only the creator or admin can revoke
   */
  async revoke(
    tenantId: string,
    userId: string,
    token: string,
    data?: RevokeShareDTO
  ): Promise<void> {
    const validated = data ? validate(RevokeShareSchema, data) : {};

    const shareLink = await this.repository.findByToken(token);

    if (!shareLink) {
      throw new NotFoundError('Share link not found');
    }

    // Tenant isolation check
    if (shareLink.tenantId !== tenantId) {
      throw new ForbiddenError('You do not have permission to revoke this share link');
    }

    // Check if already revoked
    if (shareLink.status === 'revoked' || shareLink.revokedAt) {
      throw new GoneError('Share link has already been revoked');
    }

    // Revoke the link
    await this.repository.revoke(shareLink.id);

    this.adapters?.log?.warn('Share link revoked', {
      id: shareLink.id,
      token,
      reason: validated.reason,
    });

    // Audit log
    getAuditService().log({
      tenantId,
      userId,
      action: 'revoke',
      resource: 'share_link',
      resourceId: shareLink.id,
      severity: 'warning',
      metadata: {
        reason: validated.reason,
        type: shareLink.type,
        targetResourceId: shareLink.resourceId,
      },
    });
  }

  /**
   * Get share link by token (internal use, no tracking)
   */
  async findByToken(token: string): Promise<ShareLinkEntity | null> {
    return this.repository.findByToken(token);
  }

  /**
   * List share links with filters
   */
  async findAll(
    tenantId: string,
    params: ShareQueryParams
  ): Promise<PaginatedResult<ShareLinkEntity>> {
    const validated = validate(ShareQuerySchema, params);
    return this.repository.findWithFilters(tenantId, {
      ...validated,
      page: validated.page ?? 1,
      limit: validated.limit ?? 20,
    });
  }

  /**
   * Find share links created by a user
   */
  async findByCreator(
    tenantId: string,
    createdById: string,
    params: { page?: number; limit?: number } = {}
  ): Promise<PaginatedResult<ShareLinkEntity>> {
    return this.repository.findByCreator(tenantId, createdById, params);
  }

  /**
   * Find share links for a specific resource
   */
  async findByResource(
    tenantId: string,
    type: string,
    resourceId: string
  ): Promise<ShareLinkEntity[]> {
    return this.repository.findByResource(tenantId, type, resourceId);
  }

  /**
   * Find active (non-expired, non-revoked) share links for a resource
   */
  async findActiveByResource(
    tenantId: string,
    type: string,
    resourceId: string
  ): Promise<ShareLinkEntity[]> {
    return this.repository.findActiveByResource(tenantId, type, resourceId);
  }

  /**
   * Count active share links for a resource
   */
  async countActiveByResource(
    tenantId: string,
    type: string,
    resourceId: string
  ): Promise<number> {
    return this.repository.countActiveByResource(tenantId, type, resourceId);
  }

  /**
   * Expire stale links (cleanup job)
   */
  async expireStaleLinks(): Promise<number> {
    const count = await this.repository.expireStaleLinks();

    if (count > 0) {
      this.adapters?.log?.info('Expired stale share links', { count });
    }

    return count;
  }

  /**
   * Convert entity to API response format
   */
  private toResponse(shareLink: ShareLinkEntity): ShareLinkResponse {
    return {
      token: shareLink.token,
      url: this.buildShareUrl(shareLink.token),
      type: shareLink.type as 'listing',
      resourceId: shareLink.resourceId,
      expiresAt: shareLink.expiresAt,
      viewCount: shareLink.viewCount,
      status: shareLink.status as 'active' | 'expired' | 'revoked',
      createdAt: shareLink.createdAt,
    };
  }
}
