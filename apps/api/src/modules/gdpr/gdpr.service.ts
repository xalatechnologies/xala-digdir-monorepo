/**
 * GDPR Service (GAP-013)
 * Business logic for DSAR and consent management
 * 
 * Reference: packages/client-sdk/src/types/advanced-contracts.ts
 */
import { Injectable, Inject } from '../../core/decorators';
import { eq, desc } from 'drizzle-orm';
import { gdprRequests } from '../../database/schema/gdpr-requests';
import { users } from '../../database/schema/index';
import { NotFoundError, BadRequestError } from '../../core/errors/problem-details';

interface CreateDSARRequest {
  email: string;
  categories?: string[];
  reason?: string;
}

@Injectable()
export class GDPRService {
  constructor(
    @Inject('Database') private readonly db: any,
    @Inject('Adapters') private readonly adapters: any
  ) {}

  /**
   * Create DSAR request
   * Returns DSARRequestDTO
   */
  async createDSAR(request: CreateDSARRequest): Promise<any> {
    // Validate email format
    if (!request.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(request.email)) {
      throw new BadRequestError('Valid email is required');
    }
    
    // Find user by email
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, request.email))
      .limit(1);
    
    if (!user) {
      throw new NotFoundError(`User with email ${request.email} not found`);
    }
    
    // Create DSAR request
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from now
    
    const [dsarRequest] = await this.db
      .insert(gdprRequests)
      .values({
        tenantId: user.tenantId,
        userId: user.id,
        requestType: 'export',
        status: 'pending',
        expiresAt,
        metadata: {
          categories: request.categories || ['personal_data', 'bookings', 'audit_log'],
          reason: request.reason,
        },
      })
      .returning();
    
    this.adapters?.log?.info('DSAR request created', { requestId: dsarRequest.id, userId: user.id });
    
    return {
      requestId: dsarRequest.id,
      userId: user.id,
      email: request.email,
      status: 'PENDING',
      requestedAt: dsarRequest.requestedAt.toISOString(),
      expiresAt: dsarRequest.expiresAt.toISOString(),
      categories: [
        {
          category: 'personal_data',
          label: { nb: 'Personopplysninger', en: 'Personal Data' },
          recordCount: 0,
          included: true,
        },
        {
          category: 'bookings',
          label: { nb: 'Bestillinger', en: 'Bookings' },
          recordCount: 0,
          included: true,
        },
        {
          category: 'audit_log',
          label: { nb: 'Aktivitetslogg', en: 'Audit Log' },
          recordCount: 0,
          included: true,
        },
      ],
    };
  }

  /**
   * Get DSAR request by ID
   * Returns DSARRequestDTO
   */
  async getDSAR(requestId: string): Promise<any> {
    const [request] = await this.db
      .select()
      .from(gdprRequests)
      .where(eq(gdprRequests.id, requestId))
      .limit(1);
    
    if (!request) {
      throw new NotFoundError(`DSAR request ${requestId} not found`);
    }
    
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, request.userId))
      .limit(1);
    
    const statusMap: Record<string, string> = {
      'pending': 'PENDING',
      'processing': 'PROCESSING',
      'completed': 'READY',
      'rejected': 'EXPIRED',
    };
    
    return {
      requestId: request.id,
      userId: request.userId,
      email: user?.email || 'unknown',
      status: statusMap[request.status] || 'PENDING',
      requestedAt: request.requestedAt.toISOString(),
      processedAt: request.processedAt?.toISOString(),
      expiresAt: request.expiresAt.toISOString(),
      categories: [],
      downloadUrl: request.status === 'completed' ? `/api/gdpr/dsar/${requestId}/download` : undefined,
      downloadExpiresAt: request.status === 'completed' 
        ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        : undefined,
    };
  }

  /**
   * Get pending DSAR requests
   * Returns generic list
   */
  async getPendingRequests(limit: number = 5): Promise<any> {
    const requests = await this.db
      .select({
        id: gdprRequests.id,
        status: gdprRequests.status,
        requestedAt: gdprRequests.requestedAt,
        type: gdprRequests.requestType,
        userId: gdprRequests.userId,
      })
      .from(gdprRequests)
      .where(eq(gdprRequests.status, 'pending'))
      .orderBy(desc(gdprRequests.requestedAt))
      .limit(limit);

    // Drizzle sort syntax might vary, let's just use standard limit if sort is tricky without import
    // Re-checking imports: we don't have 'desc' imported in service.
    // Let's import 'desc' from drizzle-orm.
    
    return requests.map((req: any) => ({
      id: req.id,
      status: req.status,
      requestedAt: req.requestedAt.toISOString(),
      type: req.type,
      userId: req.userId,
    }));
  }

  /**
   * Get user consents
   * Returns ConsentDTO
   */
  async getConsents(userId: string): Promise<any> {
    return {
      userId,
      consents: [
        {
          consentType: 'marketing',
          label: { nb: 'Markedsføring', en: 'Marketing' },
          description: { nb: 'Motta markedsføring via e-post', en: 'Receive marketing emails' },
          required: false,
          granted: false,
          version: '1.0',
        },
        {
          consentType: 'analytics',
          label: { nb: 'Analyse', en: 'Analytics' },
          description: { nb: 'Tillat analyse av bruksmønster', en: 'Allow usage analytics' },
          required: false,
          granted: true,
          grantedAt: new Date().toISOString(),
          version: '1.0',
        },
      ],
    };
  }

  /**
   * Update user consent
   * Returns ConsentDTO
   */
  async updateConsent(userId: string, consentType: string, granted: boolean): Promise<any> {
    // TODO: Update in database with audit trail
    
    this.adapters?.log?.info('Consent updated', { userId, consentType, granted });
    
    return this.getConsents(userId);
  }
}
