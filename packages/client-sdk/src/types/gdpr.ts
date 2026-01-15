/**
 * GDPR Consent Types
 * Type definitions for GDPR consent management
 */

// =============================================================================
// Consent Types
// =============================================================================

export interface ConsentTypeContent {
  title: string;
  content: string;
}

export interface ConsentType {
  id: string;
  code: string;
  name: string;
  description: string | null;
  content: Record<string, ConsentTypeContent>; // { nb: { title, content }, en: { ... } }
  version: string;
  isRequired: boolean;
  externalUrl: string | null;
}

export interface UserConsentStatus {
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

export interface ConsentSummary {
  hasAllRequired: boolean;
  pendingRequired: ConsentType[];
  consents: UserConsentStatus[];
}

// =============================================================================
// Consent Actions
// =============================================================================

export type ConsentSource = 'web' | 'minside' | 'backoffice' | 'app';

export interface GrantConsentDTO {
  consentTypeId: string;
  granted: boolean;
  source?: ConsentSource;
}

export interface GrantMultipleConsentsDTO {
  consents: GrantConsentDTO[];
}

// =============================================================================
// Data Subject Requests
// =============================================================================

export type DataSubjectRequestType = 
  | 'access'
  | 'erasure'
  | 'portability'
  | 'rectification'
  | 'restriction'
  | 'objection';

export type DataSubjectRequestStatus = 'pending' | 'processing' | 'completed' | 'rejected';

export interface CreateDataSubjectRequestDTO {
  requestType: DataSubjectRequestType;
  description?: string;
}

export interface DataSubjectRequest {
  id: string;
  tenantId: string;
  userId: string;
  requestType: DataSubjectRequestType;
  status: DataSubjectRequestStatus;
  description: string | null;
  assignedTo: string | null;
  processedBy: string | null;
  responseNotes: string | null;
  requestedAt: string;
  dueDate: string;
  completedAt: string | null;
  identityVerified: boolean;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// Audit Log
// =============================================================================

export type ConsentAction = 'granted' | 'revoked' | 'expired' | 'updated';

export interface ConsentAuditLogEntry {
  id: string;
  tenantId: string;
  userId: string;
  consentTypeId: string;
  action: ConsentAction;
  previousState: boolean | null;
  newState: boolean;
  consentVersion: string;
  source: ConsentSource;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

// =============================================================================
// API Response Types
// =============================================================================

export interface ConsentTypesResponse {
  data: ConsentType[];
}

export interface ConsentSummaryResponse {
  data: ConsentSummary;
}

export interface ConsentStatusResponse {
  data: UserConsentStatus;
}

export interface ConsentStatusCheckResponse {
  data: { hasAllRequired: boolean };
}

export interface ConsentAuditLogResponse {
  data: ConsentAuditLogEntry[];
}

export interface DataSubjectRequestResponse {
  data: DataSubjectRequest;
}

export interface DataSubjectRequestsResponse {
  data: DataSubjectRequest[];
}
