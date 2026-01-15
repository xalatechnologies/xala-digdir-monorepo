/**
 * GDPR Service
 * Business logic for GDPR consent management and data subject rights
 */

import type { GdprRepository } from './gdpr.repository';
import type {
  ConsentType,
  UserConsent,
  ConsentAuditLogEntry,
  DataSubjectRequest,
} from '../../database/schema';

// =============================================================================
// DTOs
// =============================================================================

export interface ConsentTypeDTO {
  id: string;
  code: string;
  name: string;
  description: string | null;
  content: Record<string, { title: string; content: string }>;
  version: string;
  isRequired: boolean;
  externalUrl: string | null;
}

export interface UserConsentStatusDTO {
  consentTypeId: string;
  consentTypeCode: string;
  name: string;
  isRequired: boolean;
  granted: boolean;
  version: string;
  grantedAt: string | null;
  currentVersion: string;
  needsUpdate: boolean;
}

export interface GrantConsentDTO {
  consentTypeId: string;
  granted: boolean;
  source: 'web' | 'minside' | 'backoffice' | 'app';
  ipAddress?: string;
  userAgent?: string;
}

export interface ConsentSummaryDTO {
  hasAllRequired: boolean;
  pendingRequired: ConsentTypeDTO[];
  consents: UserConsentStatusDTO[];
}

export interface DataSubjectRequestDTO {
  requestType: 'access' | 'erasure' | 'portability' | 'rectification' | 'restriction' | 'objection';
  description?: string;
}

// =============================================================================
// Service
// =============================================================================

export class GdprService {
  constructor(private readonly repository: GdprRepository) {}

  // ==========================================================================
  // Consent Types
  // ==========================================================================

  async getConsentTypes(tenantId: string, locale = 'nb'): Promise<ConsentTypeDTO[]> {
    const types = await this.repository.getConsentTypes(tenantId);
    return types.map((type) => this.mapConsentTypeToDTO(type, locale));
  }

  async getRequiredConsentTypes(tenantId: string, locale = 'nb'): Promise<ConsentTypeDTO[]> {
    const types = await this.repository.getConsentTypes(tenantId);
    return types
      .filter((type) => type.isRequired)
      .map((type) => this.mapConsentTypeToDTO(type, locale));
  }

  private mapConsentTypeToDTO(type: ConsentType, locale: string): ConsentTypeDTO {
    const content = (type.content ?? {}) as Record<string, { title: string; content: string }>;
    return {
      id: type.id,
      code: type.code,
      name: type.name,
      description: type.description,
      content,
      version: type.version,
      isRequired: type.isRequired,
      externalUrl: type.externalUrl,
    };
  }

  // ==========================================================================
  // User Consent Management
  // ==========================================================================

  async getUserConsentSummary(
    tenantId: string,
    userId: string,
    locale = 'nb'
  ): Promise<ConsentSummaryDTO> {
    const types = await this.repository.getConsentTypes(tenantId);
    const consentStatus = await this.repository.getUserConsentStatus(tenantId, userId);

    const consents: UserConsentStatusDTO[] = types.map((type) => {
      const status = consentStatus.get(type.id);
      const granted = status?.granted ?? false;
      const version = status?.version ?? '';
      const needsUpdate = granted && version !== type.version;

      return {
        consentTypeId: type.id,
        consentTypeCode: type.code,
        name: type.name,
        isRequired: type.isRequired,
        granted,
        version,
        grantedAt: status?.grantedAt?.toISOString() ?? null,
        currentVersion: type.version,
        needsUpdate,
      };
    });

    const pendingRequired = types
      .filter((type) => {
        if (!type.isRequired) return false;
        const status = consentStatus.get(type.id);
        return !status?.granted;
      })
      .map((type) => this.mapConsentTypeToDTO(type, locale));

    return {
      hasAllRequired: pendingRequired.length === 0,
      pendingRequired,
      consents,
    };
  }

  async grantConsent(
    tenantId: string,
    userId: string,
    dto: GrantConsentDTO
  ): Promise<UserConsentStatusDTO> {
    // Get consent type
    const consentType = await this.repository.getConsentTypeById(dto.consentTypeId);
    if (!consentType) {
      throw new Error('Consent type not found');
    }

    // Get current consent status
    const currentConsent = await this.repository.getCurrentUserConsent(
      tenantId,
      userId,
      dto.consentTypeId
    );

    const previousState = currentConsent?.granted ?? null;

    // Create new consent record (we always create a new record for audit trail)
    const newConsent = await this.repository.createUserConsent({
      tenantId,
      userId,
      consentTypeId: dto.consentTypeId,
      granted: dto.granted,
      consentVersion: consentType.version,
      source: dto.source,
      ipAddress: dto.ipAddress ?? null,
      userAgent: dto.userAgent ?? null,
      grantedAt: dto.granted ? new Date() : null,
      revokedAt: !dto.granted ? new Date() : null,
    });

    // Create audit log entry
    await this.repository.createAuditLogEntry({
      tenantId,
      userId,
      consentTypeId: dto.consentTypeId,
      action: dto.granted ? 'granted' : 'revoked',
      previousState: previousState ?? undefined,
      newState: dto.granted,
      consentVersion: consentType.version,
      source: dto.source,
      ipAddress: dto.ipAddress ?? null,
      userAgent: dto.userAgent ?? null,
    });

    return {
      consentTypeId: consentType.id,
      consentTypeCode: consentType.code,
      name: consentType.name,
      isRequired: consentType.isRequired,
      granted: newConsent.granted,
      version: newConsent.consentVersion,
      grantedAt: newConsent.grantedAt?.toISOString() ?? null,
      currentVersion: consentType.version,
      needsUpdate: false,
    };
  }

  async grantMultipleConsents(
    tenantId: string,
    userId: string,
    consents: GrantConsentDTO[]
  ): Promise<UserConsentStatusDTO[]> {
    const results: UserConsentStatusDTO[] = [];
    for (const consent of consents) {
      const result = await this.grantConsent(tenantId, userId, consent);
      results.push(result);
    }
    return results;
  }

  async hasRequiredConsents(tenantId: string, userId: string): Promise<boolean> {
    return this.repository.hasRequiredConsents(tenantId, userId);
  }

  // ==========================================================================
  // Consent Audit Log
  // ==========================================================================

  async getConsentAuditLog(
    tenantId: string,
    userId: string,
    limit = 50
  ): Promise<ConsentAuditLogEntry[]> {
    return this.repository.getConsentAuditLog(tenantId, userId, limit);
  }

  // ==========================================================================
  // Data Subject Requests
  // ==========================================================================

  async createDataSubjectRequest(
    tenantId: string,
    userId: string,
    dto: DataSubjectRequestDTO
  ): Promise<DataSubjectRequest> {
    // Calculate due date (30 days per GDPR)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    return this.repository.createDataSubjectRequest({
      tenantId,
      userId,
      requestType: dto.requestType,
      description: dto.description ?? null,
      status: 'pending',
      dueDate,
    });
  }

  async getUserDataSubjectRequests(
    tenantId: string,
    userId: string
  ): Promise<DataSubjectRequest[]> {
    return this.repository.getDataSubjectRequests(tenantId, userId);
  }

  async getPendingDataSubjectRequests(tenantId: string): Promise<DataSubjectRequest[]> {
    return this.repository.getPendingDataSubjectRequests(tenantId);
  }

  async updateDataSubjectRequestStatus(
    id: string,
    status: 'processing' | 'completed' | 'rejected',
    processedBy: string,
    responseNotes?: string
  ): Promise<DataSubjectRequest | null> {
    return this.repository.updateDataSubjectRequest(id, {
      status,
      processedBy,
      responseNotes,
      completedAt: status === 'completed' ? new Date() : undefined,
    });
  }
}
