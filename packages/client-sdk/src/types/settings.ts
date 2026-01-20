/**
 * Settings & Integration Types
 * Single Responsibility: Tenant settings and third-party integrations
 */

// =============================================================================
// Tenant Settings
// =============================================================================

export interface BookingSettingsConfig {
  requireApproval: boolean;
  defaultLeadTimeMinutes: number;
  maxAdvanceDays: number;
  cancellationPolicy: 'flexible' | 'moderate' | 'strict';
  cancellationHours: number;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  bookingConfirmation: boolean;
  bookingReminder: boolean;
  reminderHoursBefore: number;
}

export interface PaymentSettings {
  enabled: boolean;
  provider: 'vipps' | 'stripe' | 'invoice';
  requirePaymentUpfront: boolean;
  vatRate: number;
}

export interface TenantSettings {
  id: string;
  tenantId: string;
  displayName?: string;
  logo?: string;
  primaryColor?: string;
  timezone: string;
  currency: string;
  language: string;
  bookingSettings?: BookingSettingsConfig;
  notificationSettings?: NotificationSettings;
  paymentSettings?: PaymentSettings;
  // Alias for component compatibility
  notifications?: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
    emailEnabled?: boolean;
    smsEnabled?: boolean;
    pushEnabled?: boolean;
    bookingConfirmation?: boolean;
    bookingReminder?: boolean;
    reminderHours?: number;
    reminderHoursBefore?: number;
  };
}

/**
 * Setting category enum
 */
export type SettingCategory = 'general' | 'booking' | 'notification' | 'payment' | 'integration' | 'branding';

/**
 * Application settings (alias for TenantSettings)
 */
export type AppSettings = TenantSettings;

/**
 * Update settings DTO
 */
export interface UpdateSettingsDTO {
  displayName?: string;
  logo?: string;
  primaryColor?: string;
  timezone?: string;
  currency?: string;
  language?: string;
  bookingSettings?: Partial<BookingSettingsConfig>;
  notificationSettings?: Partial<NotificationSettings>;
  paymentSettings?: Partial<PaymentSettings>;
}

// =============================================================================
// Integration Settings
// =============================================================================

export interface IntegrationConfig {
  enabled: boolean;
  [key: string]: unknown;
}

export interface IntegrationSettings {
  bankid: IntegrationConfig & { clientId?: string };
  vipps: IntegrationConfig & { merchantId?: string };
  idporten: IntegrationConfig & { clientId?: string };
  visma: IntegrationConfig & { companyId?: string };
  brreg: IntegrationConfig;
  rco: IntegrationConfig & { apiKey?: string };
  outlook: IntegrationConfig;
  googleCalendar: IntegrationConfig;
}

// =============================================================================
// RCO Access Control
// =============================================================================

export interface RcoAccessCode {
  code: string;
  bookingId: string;
  rentalObjectId: string;
  validFrom: string;
  validUntil: string;
  type: 'PIN' | 'RFID' | 'QR';
  createdAt: string;
}

export interface RcoLock {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline';
}

export interface CreateAccessCodeDTO {
  bookingId: string;
  rentalObjectId: string;
  validFrom: string;
  validUntil: string;
}

// =============================================================================
// Visma ERP
// =============================================================================

export interface VismaInvoice {
  invoiceNumber: string;
  bookingId: string;
  organizationId: string;
  amount: number;
  currency: string;
  description?: string;
  status: 'created' | 'sent' | 'paid' | 'overdue';
  dueDate: string;
  createdAt: string;
}

export interface CreateInvoiceDTO {
  bookingId: string;
  organizationId: string;
  amount: number;
  description?: string;
}

// =============================================================================
// BRREG (Norwegian Business Registry)
// =============================================================================

export interface BrregOrganization {
  organisasjonsnummer: string;
  navn: string;
  organisasjonsform: { kode: string; beskrivelse: string };
  registreringsdatoEnhetsregisteret: string;
  forretningsadresse: {
    adresse: string[];
    postnummer: string;
    poststed: string;
    kommune: string;
    land: string;
  };
  naeringskode1?: { kode: string; beskrivelse: string };
}

// =============================================================================
// NIF (Norwegian Sports Federation)
// =============================================================================

export interface NifSportsClub {
  id: string;
  name: string;
  region: string;
  sports: string[];
  memberCount: number;
  verified: boolean;
  eligibleForDiscount: boolean;
  discountPercentage: number;
}

// =============================================================================
// Vipps Payments
// =============================================================================

export interface VippsPayment {
  orderId: string;
  bookingId?: string;
  amount: number;
  currency: string;
  status: 'initiated' | 'pending' | 'completed' | 'failed' | 'cancelled';
  redirectUrl?: string;
  paidAt?: string;
  // Refund tracking
  refundedAmount?: number;
  refundStatus?: 'none' | 'partial' | 'full';
  refundedAt?: string;
  // Deposit handling
  depositAmount?: number;
  captureAmount?: number;
  capturedAt?: string;
}

export interface InitiatePaymentDTO {
  bookingId: string;
  amount: number;
  description?: string;
  returnUrl: string;
}

export interface CapturePaymentDTO {
  orderId: string;
  amount?: number; // Optional for partial capture
}

export interface RefundPaymentDTO {
  orderId: string;
  amount?: number; // Optional for partial refund
  reason?: string;
}
