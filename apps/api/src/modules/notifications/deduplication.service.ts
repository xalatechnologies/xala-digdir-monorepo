/**
 * Deduplication Service
 * Hash-based notification deduplication with time window checking
 */
import { createHash } from 'crypto';
import { Injectable, Inject } from '../../core/decorators';
import { NotificationRepository } from './notification.repository';

export interface DeduplicationResult {
  allowed: boolean;
  reason?: string;
  existingNotificationId?: string;
  contentHash: string;
}

@Injectable()
export class DeduplicationService {
  private readonly DEFAULT_WINDOW_MINUTES = 5;

  constructor(
    @Inject('NotificationRepository') private readonly repository: NotificationRepository,
    @Inject('Adapters') private readonly adapters: any
  ) {}

  /**
   * Generate content hash for notification
   * Uses SHA-256 to create unique hash from notification content
   *
   * @param recipient - Email or phone number
   * @param type - Notification type (email, sms)
   * @param subject - Notification subject (can be empty for SMS)
   * @param body - Notification body content
   * @returns SHA-256 hash (64 characters hex)
   */
  generateContentHash(recipient: string, type: string, subject: string, body: string): string {
    // Normalize inputs to ensure consistent hashing
    const normalizedRecipient = recipient.trim().toLowerCase();
    const normalizedType = type.trim().toLowerCase();
    const normalizedSubject = (subject || '').trim();
    const normalizedBody = body.trim();

    // Create deterministic string for hashing
    const content = `${normalizedRecipient}:${normalizedType}:${normalizedSubject}:${normalizedBody}`;

    // Generate SHA-256 hash
    const hash = createHash('sha256').update(content).digest('hex');

    this.adapters?.log?.debug('Generated content hash', {
      type: normalizedType,
      recipient: normalizedRecipient,
      hash,
    });

    return hash;
  }

  /**
   * Check if notification is a duplicate within time window
   *
   * @param contentHash - SHA-256 hash of notification content
   * @param windowMinutes - Time window for duplicate checking (default: 5 minutes)
   * @returns True if duplicate exists within window, false otherwise
   */
  async checkDuplicate(contentHash: string, windowMinutes: number = this.DEFAULT_WINDOW_MINUTES): Promise<boolean> {
    const duplicates = await this.repository.findDuplicatesInWindow(contentHash, windowMinutes);

    if (duplicates.length > 0) {
      this.adapters?.log?.info('Duplicate notification detected', {
        contentHash,
        windowMinutes,
        duplicateCount: duplicates.length,
        firstDuplicateId: duplicates[0].id,
      });
      return true;
    }

    return false;
  }

  /**
   * Check if notification should be allowed (comprehensive check)
   * Combines hash generation and duplicate checking in one operation
   *
   * @param recipient - Email or phone number
   * @param type - Notification type (email, sms)
   * @param subject - Notification subject
   * @param body - Notification body content
   * @param windowMinutes - Time window for duplicate checking (default: 5 minutes)
   * @returns Deduplication result with allowed status and details
   */
  async shouldAllowNotification(
    recipient: string,
    type: string,
    subject: string,
    body: string,
    windowMinutes: number = this.DEFAULT_WINDOW_MINUTES
  ): Promise<DeduplicationResult> {
    // Generate content hash
    const contentHash = this.generateContentHash(recipient, type, subject, body);

    // Check for duplicates in time window
    const duplicates = await this.repository.findDuplicatesInWindow(contentHash, windowMinutes);

    if (duplicates.length > 0) {
      const existingNotification = duplicates[0];

      this.adapters?.log?.warn('Notification blocked - duplicate detected', {
        contentHash,
        recipient,
        type,
        windowMinutes,
        existingNotificationId: existingNotification.id,
        existingCreatedAt: existingNotification.createdAt,
      });

      return {
        allowed: false,
        reason: `Duplicate notification detected within ${windowMinutes}-minute window`,
        existingNotificationId: existingNotification.id,
        contentHash,
      };
    }

    this.adapters?.log?.debug('Notification allowed - no duplicates found', {
      contentHash,
      recipient,
      type,
      windowMinutes,
    });

    return {
      allowed: true,
      contentHash,
    };
  }

  /**
   * Get deduplication window in minutes (for testing/configuration)
   */
  getDefaultWindow(): number {
    return this.DEFAULT_WINDOW_MINUTES;
  }
}
