/**
 * GDPR Types
 * Single Responsibility: GDPR data subject rights and request tracking
 */

import type { TenantEntity, BaseQueryParams } from './enums';
import type { User, Organization } from './organization';

// =============================================================================
// GDPR Request Enums
// =============================================================================

export type GdprRequestType = 'export' | 'deletion';
export type GdprRequestStatus = 'pending' | 'processing' | 'completed' | 'rejected';

// =============================================================================
// GDPR Request Entity
// =============================================================================

export interface GdprRequest extends TenantEntity {
  userId: string;
  requestType: GdprRequestType;
  status: GdprRequestStatus;
  requestedAt: string;
  processedAt?: string | null;
  processedBy?: string | null;
  expiresAt: string;
  metadata?: Record<string, unknown>;
}

// =============================================================================
// GDPR Request DTOs
// =============================================================================

export interface CreateGdprRequestDTO {
  requestType: GdprRequestType;
  metadata?: Record<string, unknown>;
}

export interface UpdateGdprRequestDTO {
  status?: GdprRequestStatus;
  processedBy?: string | null;
  processedAt?: string | null;
  metadata?: Record<string, unknown>;
}

export interface UpdateGdprRequestStatusDTO {
  status: GdprRequestStatus;
  rejectionReason?: string;
}

export interface GdprRequestQueryParams extends BaseQueryParams {
  userId?: string;
  requestType?: GdprRequestType;
  status?: GdprRequestStatus;
}

// =============================================================================
// GDPR Data Export
// =============================================================================

export interface GdprDataExport {
  user: User;
  bookings: unknown[];
  conversations: unknown[];
  organizations: Organization[];
  auditEvents: unknown[];
  exportedAt: string;
}

// =============================================================================
// Consent Management
// =============================================================================

export interface ConsentSettings {
  marketing: boolean;
  analytics: boolean;
  thirdPartySharing: boolean;
  updatedAt: string;
}

export interface UpdateConsentDTO {
  marketing?: boolean;
  analytics?: boolean;
  thirdPartySharing?: boolean;
}
