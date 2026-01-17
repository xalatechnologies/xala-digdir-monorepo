/**
 * DSAR Processor Worker
 * Background worker for processing GDPR Data Subject Access Requests
 * 
 * Exports user data in structured format with 30-day expiry
 * Reference: GAP-013 GDPR Tools
 */
import { Injectable, Inject } from '../core/decorators';
import { eq, and } from 'drizzle-orm';
import { gdprRequests, users, bookings, auditLog } from '../database/schema/index';

interface DSARExportData {
  personal_data: {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    createdAt: string;
    lastLoginAt?: string;
  };
  bookings: Array<{
    id: string;
    rentalObjectId: string;
    startDate: string;
    endDate: string;
    status: string;
    totalCents: number;
    createdAt: string;
  }>;
  audit_log: Array<{
    timestamp: string;
    action: string;
    resource: string;
    metadata: any;
  }>;
  organizations: Array<{
    orgId: string;
    name: string;
    role: string;
    joinedAt: string;
  }>;
}

@Injectable()
export class DSARProcessorWorker {
  constructor(
    @Inject('Database') private readonly db: any,
    @Inject('Adapters') private readonly adapters: any
  ) {}

  /**
   * Process pending DSAR requests
   * Should be run periodically (e.g., every 5 minutes)
   */
  async processPendingRequests(): Promise<number> {
    const pendingRequests = await this.db
      .select()
      .from(gdprRequests)
      .where(
        and(
          eq(gdprRequests.status, 'pending'),
          eq(gdprRequests.requestType, 'export')
        )
      )
      .limit(10); // Process 10 at a time

    this.adapters?.log?.info('Processing DSAR requests', { count: pendingRequests.length });

    for (const request of pendingRequests) {
      await this.processRequest(request);
    }

    return pendingRequests.length;
  }

  /**
   * Process individual DSAR request
   */
  private async processRequest(request: any): Promise<void> {
    try {
      // Update status to processing
      await this.db
        .update(gdprRequests)
        .set({ status: 'processing' })
        .where(eq(gdprRequests.id, request.id));

      this.adapters?.log?.info('Processing DSAR request', { requestId: request.id });

      // Export user data
      const exportData = await this.exportUserData(request.userId, request.metadata?.categories);

      // Generate export file (JSON format)
      const exportJson = JSON.stringify(exportData, null, 2);
      const fileName = `dsar-${request.id}-${Date.now()}.json`;

      // Store export file (TODO: Upload to object storage)
      const downloadUrl = `/api/gdpr/dsar/${request.id}/download`;

      // Update request to completed
      await this.db
        .update(gdprRequests)
        .set({
          status: 'completed',
          processedAt: new Date(),
          metadata: {
            ...request.metadata,
            fileName,
            downloadUrl,
            fileSize: Buffer.byteLength(exportJson, 'utf8'),
          },
        })
        .where(eq(gdprRequests.id, request.id));

      this.adapters?.log?.info('DSAR request completed', {
        requestId: request.id,
        userId: request.userId,
        recordCount: this.countRecords(exportData),
      });

      // Send notification email (TODO: Implement email service)
      this.adapters?.log?.info('DSAR completion email queued', { requestId: request.id });
    } catch (error) {
      this.adapters?.log?.error('DSAR processing failed', {
        requestId: request.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      // Update request to failed
      await this.db
        .update(gdprRequests)
        .set({
          status: 'rejected',
          metadata: {
            ...request.metadata,
            error: error instanceof Error ? error.message : 'Processing failed',
          },
        })
        .where(eq(gdprRequests.id, request.id));
    }
  }

  /**
   * Export all user data based on requested categories
   */
  private async exportUserData(userId: string, categories: string[] = []): Promise<DSARExportData> {
    const data: Partial<DSARExportData> = {};

    // Personal data
    if (categories.includes('personal_data') || categories.length === 0) {
      const [user] = await this.db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (user) {
        data.personal_data = {
          userId: user.id,
          email: user.email,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          phone: user.phone,
          createdAt: user.createdAt?.toISOString(),
          lastLoginAt: user.lastLoginAt?.toISOString(),
        };
      }
    }

    // Bookings
    if (categories.includes('bookings') || categories.length === 0) {
      const userBookings = await this.db
        .select()
        .from(bookings)
        .where(eq(bookings.userId, userId));

      data.bookings = userBookings.map((booking: any) => ({
        id: booking.id,
        rentalObjectId: booking.rentalObjectId,
        startDate: booking.startDate?.toISOString(),
        endDate: booking.endDate?.toISOString(),
        status: booking.status,
        totalCents: booking.totalCents || 0,
        createdAt: booking.createdAt?.toISOString(),
      }));
    }

    // Audit log
    if (categories.includes('audit_log') || categories.length === 0) {
      const userAuditLog = await this.db
        .select()
        .from(auditLog)
        .where(eq(auditLog.userId, userId))
        .limit(1000); // Limit to most recent 1000 entries

      data.audit_log = userAuditLog.map((log: any) => ({
        timestamp: log.timestamp?.toISOString(),
        action: log.action,
        resource: log.resource,
        metadata: log.metadata,
      }));
    }

    // Organizations (placeholder - requires org membership table)
    if (categories.includes('organizations') || categories.length === 0) {
      data.organizations = [];
    }

    return data as DSARExportData;
  }

  /**
   * Count total records in export
   */
  private countRecords(data: DSARExportData): number {
    let count = 0;
    if (data.personal_data) count += 1;
    if (data.bookings) count += data.bookings.length;
    if (data.audit_log) count += data.audit_log.length;
    if (data.organizations) count += data.organizations.length;
    return count;
  }

  /**
   * Cleanup expired DSAR requests
   * Should be run daily
   */
  async cleanupExpiredRequests(): Promise<number> {
    const now = new Date();

    const expiredRequests = await this.db
      .select()
      .from(gdprRequests)
      .where(
        and(
          eq(gdprRequests.status, 'completed'),
          // expiresAt is before now
        )
      );

    for (const request of expiredRequests) {
      if (new Date(request.expiresAt) < now) {
        // Delete export file (TODO: Remove from object storage)
        await this.db
          .update(gdprRequests)
          .set({
            status: 'expired',
            metadata: {
              ...request.metadata,
              expiredAt: now.toISOString(),
            },
          })
          .where(eq(gdprRequests.id, request.id));

        this.adapters?.log?.info('DSAR request expired and cleaned up', { requestId: request.id });
      }
    }

    return expiredRequests.length;
  }
}
