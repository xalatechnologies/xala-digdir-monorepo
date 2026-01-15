/**
 * GDPR Repository
 * Data access layer for GDPR consent and data subject requests
 */

import { eq, and, desc, sql, inArray } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type * as schema from '../../database/schema';
import {
  consentTypes,
  userConsents,
  consentAuditLog,
  dataSubjectRequests,
  dataProcessingRecords,
  type ConsentType,
  type NewConsentType,
  type UserConsent,
  type NewUserConsent,
  type ConsentAuditLogEntry,
  type NewConsentAuditLogEntry,
  type DataSubjectRequest,
  type NewDataSubjectRequest,
  type DataProcessingRecord,
  type NewDataProcessingRecord,
} from '../../database/schema';

export class GdprRepository {
  constructor(private readonly db: PostgresJsDatabase<typeof schema>) {}

  // ==========================================================================
  // Consent Types
  // ==========================================================================

  async getConsentTypes(tenantId: string): Promise<ConsentType[]> {
    return this.db
      .select()
      .from(consentTypes)
      .where(
        and(
          eq(consentTypes.isActive, true),
          // Get global types (tenantId is null) or tenant-specific
          sql`(${consentTypes.tenantId} = ${tenantId} OR ${consentTypes.tenantId} IS NULL)`
        )
      )
      .orderBy(consentTypes.displayOrder);
  }

  async getConsentTypeByCode(tenantId: string, code: string): Promise<ConsentType | null> {
    const results = await this.db
      .select()
      .from(consentTypes)
      .where(
        and(
          eq(consentTypes.code, code),
          eq(consentTypes.isActive, true),
          sql`(${consentTypes.tenantId} = ${tenantId} OR ${consentTypes.tenantId} IS NULL)`
        )
      )
      .limit(1);
    return results[0] ?? null;
  }

  async getConsentTypeById(id: string): Promise<ConsentType | null> {
    const results = await this.db
      .select()
      .from(consentTypes)
      .where(eq(consentTypes.id, id))
      .limit(1);
    return results[0] ?? null;
  }

  async createConsentType(data: NewConsentType): Promise<ConsentType> {
    const results = await this.db
      .insert(consentTypes)
      .values(data)
      .returning();
    return results[0]!;
  }

  async updateConsentType(id: string, data: Partial<NewConsentType>): Promise<ConsentType | null> {
    const results = await this.db
      .update(consentTypes)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(consentTypes.id, id))
      .returning();
    return results[0] ?? null;
  }

  // ==========================================================================
  // User Consents
  // ==========================================================================

  async getUserConsents(tenantId: string, userId: string): Promise<UserConsent[]> {
    return this.db
      .select()
      .from(userConsents)
      .where(
        and(
          eq(userConsents.tenantId, tenantId),
          eq(userConsents.userId, userId)
        )
      )
      .orderBy(desc(userConsents.createdAt));
  }

  async getCurrentUserConsent(
    tenantId: string,
    userId: string,
    consentTypeId: string
  ): Promise<UserConsent | null> {
    // Get the most recent consent record for this type
    const results = await this.db
      .select()
      .from(userConsents)
      .where(
        and(
          eq(userConsents.tenantId, tenantId),
          eq(userConsents.userId, userId),
          eq(userConsents.consentTypeId, consentTypeId)
        )
      )
      .orderBy(desc(userConsents.createdAt))
      .limit(1);
    return results[0] ?? null;
  }

  async getUserConsentStatus(
    tenantId: string,
    userId: string
  ): Promise<Map<string, { granted: boolean; version: string; grantedAt: Date | null }>> {
    const consents = await this.db
      .select({
        consentTypeId: userConsents.consentTypeId,
        granted: userConsents.granted,
        consentVersion: userConsents.consentVersion,
        grantedAt: userConsents.grantedAt,
        createdAt: userConsents.createdAt,
      })
      .from(userConsents)
      .where(
        and(
          eq(userConsents.tenantId, tenantId),
          eq(userConsents.userId, userId)
        )
      )
      .orderBy(desc(userConsents.createdAt));

    // Build map with latest consent for each type
    const statusMap = new Map<string, { granted: boolean; version: string; grantedAt: Date | null }>();
    for (const consent of consents) {
      if (!statusMap.has(consent.consentTypeId)) {
        statusMap.set(consent.consentTypeId, {
          granted: consent.granted,
          version: consent.consentVersion,
          grantedAt: consent.grantedAt,
        });
      }
    }
    return statusMap;
  }

  async createUserConsent(data: NewUserConsent): Promise<UserConsent> {
    const results = await this.db
      .insert(userConsents)
      .values(data)
      .returning();
    return results[0]!;
  }

  async hasRequiredConsents(tenantId: string, userId: string): Promise<boolean> {
    // Get all required consent types
    const requiredTypes = await this.db
      .select({ id: consentTypes.id })
      .from(consentTypes)
      .where(
        and(
          eq(consentTypes.isRequired, true),
          eq(consentTypes.isActive, true),
          sql`(${consentTypes.tenantId} = ${tenantId} OR ${consentTypes.tenantId} IS NULL)`
        )
      );

    if (requiredTypes.length === 0) return true;

    // Check if user has granted all required consents
    const consentStatus = await this.getUserConsentStatus(tenantId, userId);
    
    for (const type of requiredTypes) {
      const consent = consentStatus.get(type.id);
      if (!consent || !consent.granted) {
        return false;
      }
    }
    return true;
  }

  // ==========================================================================
  // Consent Audit Log
  // ==========================================================================

  async createAuditLogEntry(data: NewConsentAuditLogEntry): Promise<ConsentAuditLogEntry> {
    const results = await this.db
      .insert(consentAuditLog)
      .values(data)
      .returning();
    return results[0]!;
  }

  async getConsentAuditLog(
    tenantId: string,
    userId: string,
    limit = 50
  ): Promise<ConsentAuditLogEntry[]> {
    return this.db
      .select()
      .from(consentAuditLog)
      .where(
        and(
          eq(consentAuditLog.tenantId, tenantId),
          eq(consentAuditLog.userId, userId)
        )
      )
      .orderBy(desc(consentAuditLog.createdAt))
      .limit(limit);
  }

  // ==========================================================================
  // Data Subject Requests
  // ==========================================================================

  async createDataSubjectRequest(data: NewDataSubjectRequest): Promise<DataSubjectRequest> {
    const results = await this.db
      .insert(dataSubjectRequests)
      .values(data)
      .returning();
    return results[0]!;
  }

  async getDataSubjectRequests(
    tenantId: string,
    userId: string
  ): Promise<DataSubjectRequest[]> {
    return this.db
      .select()
      .from(dataSubjectRequests)
      .where(
        and(
          eq(dataSubjectRequests.tenantId, tenantId),
          eq(dataSubjectRequests.userId, userId)
        )
      )
      .orderBy(desc(dataSubjectRequests.createdAt));
  }

  async getDataSubjectRequestById(id: string): Promise<DataSubjectRequest | null> {
    const results = await this.db
      .select()
      .from(dataSubjectRequests)
      .where(eq(dataSubjectRequests.id, id))
      .limit(1);
    return results[0] ?? null;
  }

  async updateDataSubjectRequest(
    id: string,
    data: Partial<NewDataSubjectRequest>
  ): Promise<DataSubjectRequest | null> {
    const results = await this.db
      .update(dataSubjectRequests)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(dataSubjectRequests.id, id))
      .returning();
    return results[0] ?? null;
  }

  async getPendingDataSubjectRequests(tenantId: string): Promise<DataSubjectRequest[]> {
    return this.db
      .select()
      .from(dataSubjectRequests)
      .where(
        and(
          eq(dataSubjectRequests.tenantId, tenantId),
          inArray(dataSubjectRequests.status, ['pending', 'processing'])
        )
      )
      .orderBy(dataSubjectRequests.dueDate);
  }

  // ==========================================================================
  // Data Processing Records (GDPR Article 30)
  // ==========================================================================

  async getDataProcessingRecords(tenantId: string): Promise<DataProcessingRecord[]> {
    return this.db
      .select()
      .from(dataProcessingRecords)
      .where(
        and(
          eq(dataProcessingRecords.tenantId, tenantId),
          eq(dataProcessingRecords.isActive, true)
        )
      );
  }

  async createDataProcessingRecord(data: NewDataProcessingRecord): Promise<DataProcessingRecord> {
    const results = await this.db
      .insert(dataProcessingRecords)
      .values(data)
      .returning();
    return results[0]!;
  }
}
