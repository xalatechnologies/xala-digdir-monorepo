/**
 * Auth Types
 * Single Responsibility: Authentication and authorization types
 */

import type { UserRole } from './enums';

// =============================================================================
// Auth Session
// =============================================================================

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string;
  organizationId?: string;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
  expiresAt: string;
  permissions: string[];
}

// =============================================================================
// Auth DTOs
// =============================================================================

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface EmailLoginCredentials {
  email: string;
  password: string;
}

export interface OAuthLoginParams {
  provider: 'bankid' | 'vipps' | 'idporten' | 'google' | 'github';
  callbackUrl?: string;
}

export interface OAuthCallbackParams {
  code?: string;
  state?: string;
  error?: string;
  error_description?: string;
}

// =============================================================================
// Auth Providers
// =============================================================================

export interface OAuthProvider {
  id: string;
  name: string;
  enabled: boolean;
  icon?: string;
  loginUrl?: string;
}

// =============================================================================
// RBAC Types
// =============================================================================

export interface Permission {
  resource: string;
  action: string;
}

export interface RolePermissions {
  role: UserRole;
  permissions: Record<string, string[]>;
}

export interface PermissionCheckResult {
  allowed: boolean;
  role: UserRole;
  reason?: string;
}

// =============================================================================
// Flow Context Types (Session-Safe Return-to-Flow)
// =============================================================================

/**
 * Booking mode for flow context
 */
export type FlowBookingMode = 'SLOTS' | 'ALL_DAY' | 'DURATION' | 'TICKETS' | 'NONE';

/**
 * Selected time slot for booking flow
 */
export interface FlowSelectedSlot {
  date: string;
  startTime: string;
  endTime: string;
}

/**
 * Recurring booking rules for flow context
 */
export interface FlowRecurringRules {
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number;
  endDate?: string;
  count?: number;
}

/**
 * FlowContext - Serializable navigation and booking state
 * Used to preserve user journey across authentication interruptions
 */
export interface FlowContext {
  // Navigation
  /** URL to return to after authentication */
  returnTo: string;
  /** Timestamp when context was created (for expiration checks) */
  timestamp: number;

  // Booking state
  /** Listing ID if in booking flow */
  listingId?: string;
  /** Current booking mode */
  bookingMode?: FlowBookingMode;
  /** Selected dates (ISO date strings) */
  selectedDates?: string[];
  /** Selected time slots */
  selectedSlots?: FlowSelectedSlot[];
  /** Recurring booking rules */
  recurringRules?: FlowRecurringRules;

  // Form state
  /** Partial form data to restore */
  formData?: Record<string, unknown>;

  // Context
  /** Tenant ID for cross-tenant validation */
  tenantId: string;
  /** Correlation ID for audit logging */
  correlationId: string;
}

/**
 * ReturnToConfig - Configuration for authenticated return flow
 * Wraps FlowContext with security metadata
 */
export interface ReturnToConfig {
  /** URL to return to */
  url: string;
  /** Full flow context (optional) */
  flowContext?: FlowContext;
  /** Expiration timestamp (Unix ms) */
  expiresAt?: number;
  /** HMAC signature for tamper detection */
  signature?: string;
}
