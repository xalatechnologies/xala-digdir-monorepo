/**
 * Notification Service
 * Orchestrates notification sending with deduplication and delivery tracking
 */
import { Injectable, Inject } from '../../core/decorators';
import { NotificationRepository } from './notification.repository';
import { DeduplicationService } from './deduplication.service';
import { DeliveryService } from './delivery.service';
import { getAuditService } from '../../core/audit/audit.service';
import { NotFoundError, ConflictError } from '../../core/errors/problem-details';
import type { PaginatedResult } from '../../database/base.repository';

export interface SendNotificationDTO {
  userId?: string;
  type: 'email' | 'sms';
  recipient: string;
  subject?: string;
  body: string;
  metadata?: Record<string, unknown>;
}

export interface SendNotificationResult {
  success: boolean;
  notificationId?: string;
  message: string;
  isDuplicate?: boolean;
  existingNotificationId?: string;
}

export interface DeliveryStatusResult {
  notificationId: string;
  status: string;
  type: string;
  recipient: string;
  subject?: string;
  sentAt?: Date;
  deliveredAt?: Date;
  failedAt?: Date;
  attempts: Array<{
    attemptNumber: number;
    status: string;
    error?: string;
    retriedAt: Date;
    nextRetryAt?: Date;
  }>;
}

export interface DeliveryReportFilters {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  userId?: string;
}

@Injectable()
export class NotificationService {
  constructor(
    @Inject('NotificationRepository') private readonly repository: NotificationRepository,
    @Inject('DeduplicationService') private readonly deduplicationService: DeduplicationService,
    @Inject('DeliveryService') private readonly deliveryService: DeliveryService,
    @Inject('Adapters') private readonly adapters: any
  ) {}

  /**
   * Send notification with deduplication
   * Main orchestration method that coordinates deduplication and delivery
   */
  async sendNotification(tenantId: string, data: SendNotificationDTO): Promise<SendNotificationResult> {
    // Step 1: Check for duplicates
    const deduplicationCheck = await this.deduplicationService.shouldAllowNotification(
      data.recipient,
      data.type,
      data.subject || '',
      data.body
    );

    // If duplicate detected, return early
    if (!deduplicationCheck.allowed) {
      this.adapters?.log?.warn('Notification blocked due to deduplication', {
        tenantId,
        recipient: data.recipient,
        type: data.type,
        reason: deduplicationCheck.reason,
        existingNotificationId: deduplicationCheck.existingNotificationId,
      });

      getAuditService().log({
        tenantId,
        userId: data.userId,
        action: 'blocked',
        resource: 'notification',
        resourceId: deduplicationCheck.existingNotificationId,
        severity: 'info',
        metadata: {
          reason: 'duplicate_detected',
          contentHash: deduplicationCheck.contentHash,
          recipient: data.recipient,
          type: data.type,
        },
      });

      return {
        success: false,
        message: deduplicationCheck.reason || 'Duplicate notification detected',
        isDuplicate: true,
        existingNotificationId: deduplicationCheck.existingNotificationId,
      };
    }

    // Step 2: Create notification record
    const notification = await this.repository.create({
      tenantId,
      userId: data.userId || null,
      type: data.type,
      recipient: data.recipient,
      subject: data.subject || null,
      body: data.body,
      contentHash: deduplicationCheck.contentHash,
      status: 'pending',
      metadata: data.metadata || {},
    });

    this.adapters?.log?.info('Notification created', {
      notificationId: notification.id,
      tenantId,
      type: data.type,
      recipient: data.recipient,
    });

    // Audit log - notification created
    getAuditService().log({
      tenantId,
      userId: data.userId,
      action: 'create',
      resource: 'notification',
      resourceId: notification.id,
      metadata: {
        type: data.type,
        recipient: data.recipient,
        contentHash: deduplicationCheck.contentHash,
      },
    });

    // Step 3: Attempt delivery
    const deliveryResult = await this.deliveryService.sendNotification(notification);

    // Audit log - delivery attempt
    getAuditService().log({
      tenantId,
      userId: data.userId,
      action: deliveryResult.success ? 'send' : 'fail',
      resource: 'notification',
      resourceId: notification.id,
      severity: deliveryResult.success ? 'info' : 'warning',
      metadata: {
        type: data.type,
        recipient: data.recipient,
        success: deliveryResult.success,
        error: deliveryResult.error,
      },
    });

    if (deliveryResult.success) {
      this.adapters?.log?.info('Notification sent successfully', {
        notificationId: notification.id,
        tenantId,
        type: data.type,
      });

      return {
        success: true,
        notificationId: notification.id,
        message: 'Notification sent successfully',
        isDuplicate: false,
      };
    } else {
      this.adapters?.log?.error('Notification delivery failed', {
        notificationId: notification.id,
        tenantId,
        type: data.type,
        error: deliveryResult.error,
      });

      return {
        success: false,
        notificationId: notification.id,
        message: `Notification delivery failed: ${deliveryResult.error}`,
        isDuplicate: false,
      };
    }
  }

  /**
   * Get delivery status for a notification
   */
  async getDeliveryStatus(notificationId: string): Promise<DeliveryStatusResult> {
    const notification = await this.repository.findById(notificationId);

    if (!notification) {
      throw new NotFoundError('Notification', notificationId);
    }

    // Get all delivery attempts
    const attempts = await this.repository.getDeliveryAttempts(notificationId);

    return {
      notificationId: notification.id,
      status: notification.status,
      type: notification.type,
      recipient: notification.recipient,
      subject: notification.subject || undefined,
      sentAt: notification.sentAt || undefined,
      deliveredAt: notification.deliveredAt || undefined,
      failedAt: notification.failedAt || undefined,
      attempts: attempts.map((attempt: any) => ({
        attemptNumber: attempt.attemptNumber,
        status: attempt.status,
        error: attempt.error || undefined,
        retriedAt: attempt.retriedAt,
        nextRetryAt: attempt.nextRetryAt || undefined,
      })),
    };
  }

  /**
   * Get delivery reports with filters
   */
  async getDeliveryReports(
    tenantId: string,
    filters: DeliveryReportFilters = {}
  ): Promise<PaginatedResult<any>> {
    const page = filters.page || 1;
    const limit = filters.limit || 20;

    const result = await this.repository.findByTenant(tenantId, {
      page,
      limit,
      status: filters.status,
      type: filters.type,
      userId: filters.userId,
    });

    // Enrich with delivery attempts count
    const enrichedData = await Promise.all(
      result.data.map(async (notification: any) => {
        const attempts = await this.repository.getDeliveryAttempts(notification.id);
        return {
          ...notification,
          attemptCount: attempts.length,
          lastAttempt: attempts[0] || null,
        };
      })
    );

    return {
      data: enrichedData,
      pagination: result.pagination,
    };
  }

  /**
   * Retry failed deliveries
   * Triggers retry for all failed notifications ready for retry
   */
  async retryFailedDeliveries(): Promise<{ retriedCount: number; successCount: number; failureCount: number }> {
    this.adapters?.log?.info('Starting retry of failed deliveries');

    const results = await this.deliveryService.retryFailed();

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    this.adapters?.log?.info('Retry batch completed', {
      retriedCount: results.length,
      successCount,
      failureCount,
    });

    // Audit log for batch retry
    getAuditService().log({
      tenantId: 'system', // System-level action
      action: 'retry_batch',
      resource: 'notification',
      resourceId: 'batch',
      metadata: {
        retriedCount: results.length,
        successCount,
        failureCount,
      },
    });

    return {
      retriedCount: results.length,
      successCount,
      failureCount,
    };
  }

  /**
   * Get notification by ID
   */
  async findById(id: string) {
    return this.repository.findById(id);
  }

  /**
   * Get notification by ID or throw
   */
  async findByIdOrFail(id: string) {
    return this.repository.findByIdOrFail(id);
  }

  /**
   * Get all notifications for a tenant (alias for getDeliveryReports)
   */
  async findAll(tenantId: string, filters: DeliveryReportFilters = {}) {
    return this.getDeliveryReports(tenantId, filters);
  }
}
