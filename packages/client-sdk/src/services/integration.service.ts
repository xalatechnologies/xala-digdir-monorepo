/**
 * Integration Services
 * Single Responsibility: Handle third-party integration operations
 */

import { BaseService } from './base.service';
import type {
  TenantSettings,
  IntegrationSettings,
  RcoAccessCode,
  RcoLock,
  CreateAccessCodeDTO,
  VismaInvoice,
  CreateInvoiceDTO,
  BrregOrganization,
  NifSportsClub,
  VippsPayment,
  InitiatePaymentDTO,
  CapturePaymentDTO,
  RefundPaymentDTO
} from '@/types/settings';
import type { SingleResponse, SuccessResponse, PaginatedResponse } from '@/types/enums';

/**
 * Settings Service
 * Manages tenant-level settings and third-party integration configurations
 */
export class SettingsService extends BaseService {
  constructor() {
    super('/api/settings');
  }

  /**
   * Get tenant settings
   * Retrieves all configuration settings for the current tenant including
   * branding, features, notifications, and regional preferences
   *
   * @returns Promise resolving to tenant settings
   *
   * @example
   * ```typescript
   * const { data: settings } = await settingsService.getSettings();
   * console.log(settings.timezone, settings.currency);
   * ```
   */
  async getSettings(): Promise<SingleResponse<TenantSettings>> {
    return this.client.get(this.buildPath());
  }

  /**
   * Update tenant settings
   * Updates one or more tenant configuration settings. Only provided fields
   * will be updated; others remain unchanged.
   *
   * @param data - Partial tenant settings to update
   * @returns Promise resolving to updated tenant settings
   *
   * @example
   * ```typescript
   * const { data } = await settingsService.updateSettings({
   *   timezone: 'Europe/Oslo',
   *   currency: 'NOK',
   *   locale: 'nb-NO'
   * });
   * ```
   */
  async updateSettings(data: Partial<TenantSettings>): Promise<SingleResponse<TenantSettings>> {
    return this.client.put(this.buildPath(), data);
  }

  /**
   * Get integration settings
   * Retrieves configuration for all third-party integrations including
   * RCO, Visma, Vipps, BRREG, and calendar sync
   *
   * @returns Promise resolving to integration settings
   *
   * @example
   * ```typescript
   * const { data: integrations } = await settingsService.getIntegrations();
   * console.log(integrations.vipps.enabled, integrations.rco.connected);
   * ```
   */
  async getIntegrations(): Promise<SingleResponse<IntegrationSettings>> {
    return this.client.get(this.buildPath('/integrations'));
  }

  /**
   * Update integration settings
   * Updates configuration for a specific third-party integration provider
   *
   * @param provider - Integration provider name (e.g., 'vipps', 'rco', 'visma')
   * @param data - Provider-specific configuration data
   * @returns Promise resolving to updated integration settings
   *
   * @example
   * ```typescript
   * const { data } = await settingsService.updateIntegration('vipps', {
   *   enabled: true,
   *   merchantId: '123456',
   *   clientId: 'vipps-client-id'
   * });
   * ```
   */
  async updateIntegration(provider: string, data: Record<string, unknown>): Promise<SingleResponse<IntegrationSettings>> {
    return this.client.put(this.buildPath(`/integrations/${provider}`), data);
  }
}

/**
 * RCO Access Control Service
 * Manages RCO smart lock integration for facility access control.
 * Handles access code generation, lock management, and remote unlock operations.
 */
export class RcoService extends BaseService {
  constructor() {
    super('/api/integrations/rco');
  }

  /**
   * Get RCO connection status
   * Retrieves the current RCO integration status including connection state
   * and the number of active access codes
   *
   * @returns Promise resolving to connection status and active codes count
   *
   * @example
   * ```typescript
   * const { data } = await rcoService.getStatus();
   * if (data.connected) {
   *   console.log(`Active codes: ${data.activeAccessCodes}`);
   * }
   * ```
   */
  async getStatus(): Promise<SingleResponse<{ connected: boolean; activeAccessCodes: number }>> {
    return this.client.get(this.buildPath('/status'));
  }

  /**
   * Generate access code for booking
   * Creates a time-limited access code for a specific booking, allowing
   * users to unlock facility doors during their reservation period
   *
   * @param data - Access code configuration including booking ID, lock IDs, and validity period
   * @returns Promise resolving to generated access code details
   *
   * @example
   * ```typescript
   * const { data: accessCode } = await rcoService.generateAccessCode({
   *   bookingId: 'booking-123',
   *   lockIds: ['lock-456', 'lock-789'],
   *   validFrom: '2024-01-20T10:00:00Z',
   *   validTo: '2024-01-20T12:00:00Z'
   * });
   * console.log(`Access code: ${accessCode.code}`);
   * ```
   */
  async generateAccessCode(data: CreateAccessCodeDTO): Promise<SingleResponse<RcoAccessCode>> {
    return this.client.post(this.buildPath('/access-code'), data);
  }

  /**
   * Get connected locks
   * Retrieves all RCO smart locks configured for the tenant, including
   * their status, location, and battery level
   *
   * @returns Promise resolving to array of connected locks
   *
   * @example
   * ```typescript
   * const { data: locks } = await rcoService.getLocks();
   * locks.forEach(lock => {
   *   console.log(`${lock.name}: ${lock.batteryLevel}%`);
   * });
   * ```
   */
  async getLocks(): Promise<SingleResponse<RcoLock[]>> {
    return this.client.get(this.buildPath('/locks'));
  }

  /**
   * Remote unlock
   * Remotely unlocks a specific lock for a specified duration.
   * Used for emergency access or staff operations.
   *
   * @param lockId - Unique identifier of the lock to unlock
   * @param duration - Optional duration in seconds (default: 5 seconds)
   * @returns Promise resolving to success status
   *
   * @example
   * ```typescript
   * // Unlock for default 5 seconds
   * await rcoService.unlock('lock-456');
   *
   * // Unlock for 30 seconds
   * await rcoService.unlock('lock-456', 30);
   * ```
   */
  async unlock(lockId: string, duration?: number): Promise<SuccessResponse> {
    return this.client.post(this.buildPath('/unlock'), { lockId, duration });
  }
}

/**
 * Visma ERP Service
 * Manages Visma ERP integration for automated invoicing and financial operations.
 * Handles invoice creation, synchronization, and status tracking.
 */
export class VismaService extends BaseService {
  constructor() {
    super('/api/integrations/visma');
  }

  /**
   * Get Visma connection status
   * Retrieves the current Visma ERP connection status and the number
   * of invoices pending synchronization
   *
   * @returns Promise resolving to connection status and pending invoice count
   *
   * @example
   * ```typescript
   * const { data } = await vismaService.getStatus();
   * if (data.connected && data.pendingInvoices > 0) {
   *   console.log(`${data.pendingInvoices} invoices pending sync`);
   * }
   * ```
   */
  async getStatus(): Promise<SingleResponse<{ connected: boolean; pendingInvoices: number }>> {
    return this.client.get(this.buildPath('/status'));
  }

  /**
   * Create invoice
   * Creates a new invoice in Visma ERP for a booking or transaction.
   * The invoice is automatically synced to Visma if the integration is connected.
   *
   * @param data - Invoice details including customer, line items, and amounts
   * @returns Promise resolving to created invoice details
   *
   * @example
   * ```typescript
   * const { data: invoice } = await vismaService.createInvoice({
   *   customerId: 'customer-123',
   *   bookingId: 'booking-456',
   *   lineItems: [
   *     { description: 'Room rental', quantity: 1, amount: 500 }
   *   ],
   *   dueDate: '2024-02-15'
   * });
   * console.log(`Invoice created: ${invoice.invoiceNumber}`);
   * ```
   */
  async createInvoice(data: CreateInvoiceDTO): Promise<SingleResponse<VismaInvoice>> {
    return this.client.post(this.buildPath('/invoice'), data);
  }

  /**
   * Get invoices
   * Retrieves all invoices synced with Visma ERP, with pagination support
   *
   * @returns Promise resolving to paginated list of invoices
   *
   * @example
   * ```typescript
   * const { data: invoices, meta } = await vismaService.getInvoices();
   * console.log(`Showing ${data.length} of ${meta.total} invoices`);
   * ```
   */
  async getInvoices(): Promise<PaginatedResponse<VismaInvoice>> {
    return this.client.get(this.buildPath('/invoices'));
  }

  /**
   * Trigger sync with Visma
   * Manually triggers synchronization of pending invoices with Visma ERP.
   * This is typically done automatically but can be triggered for immediate sync.
   *
   * @returns Promise resolving to success status
   *
   * @example
   * ```typescript
   * await vismaService.sync();
   * console.log('Invoice sync initiated');
   * ```
   */
  async sync(): Promise<SuccessResponse> {
    return this.client.post(this.buildPath('/sync'));
  }
}

/**
 * BRREG (Norwegian Business Registry) Service
 * Integrates with Brønnøysundregistrene for organization lookup and verification.
 * Used for validating Norwegian business entities and retrieving official data.
 */
export class BrregService extends BaseService {
  constructor() {
    super('/api/integrations/brreg');
  }

  /**
   * Lookup organization by number
   * Retrieves official organization data from BRREG including name, address,
   * registration status, and organizational form
   *
   * @param orgNumber - Norwegian organization number (9 digits)
   * @returns Promise resolving to organization details
   *
   * @example
   * ```typescript
   * const { data: org } = await brregService.lookup('123456789');
   * console.log(org.name, org.organizationForm, org.registrationDate);
   * ```
   */
  async lookup(orgNumber: string): Promise<SingleResponse<BrregOrganization>> {
    return this.client.get(this.buildPath(`/lookup/${orgNumber}`));
  }

  /**
   * Verify organization
   * Verifies that an organization number is valid and registered in BRREG.
   * Useful for form validation and customer verification workflows.
   *
   * @param organizationNumber - Norwegian organization number to verify
   * @returns Promise resolving to verification result
   *
   * @example
   * ```typescript
   * const { data } = await brregService.verify('123456789');
   * if (data.verified) {
   *   console.log('Valid organization number');
   * } else {
   *   console.error('Invalid or unregistered organization');
   * }
   * ```
   */
  async verify(organizationNumber: string): Promise<SingleResponse<{ verified: boolean }>> {
    return this.client.post(this.buildPath('/verify'), { organizationNumber });
  }
}

/**
 * NIF (Norwegian Sports Federation) Service
 * Integrates with Norges Idrettsforbund for sports club lookup and verification.
 * Used to validate and retrieve information about registered Norwegian sports clubs.
 */
export class NifService extends BaseService {
  constructor() {
    super('/api/integrations/nif');
  }

  /**
   * Lookup sports club
   * Retrieves official sports club data from NIF including club name,
   * sport type, membership count, and contact information
   *
   * @param clubId - NIF club identifier
   * @returns Promise resolving to sports club details
   *
   * @example
   * ```typescript
   * const { data: club } = await nifService.lookup('nif-12345');
   * console.log(club.name, club.sportType, club.memberCount);
   * ```
   */
  async lookup(clubId: string): Promise<SingleResponse<NifSportsClub>> {
    return this.client.get(this.buildPath(`/lookup/${clubId}`));
  }
}

/**
 * Vipps Payments Service
 * Manages Vipps payment integration for Norwegian mobile payments.
 * Handles payment initiation, capture, refund, and status tracking following Vipps API standards.
 */
export class VippsService extends BaseService {
  constructor() {
    super('/api/integrations/vipps');
  }

  /**
   * Get Vipps connection status
   * Retrieves the current Vipps integration status including connection state
   * and merchant identifier
   *
   * @returns Promise resolving to connection status and merchant ID
   *
   * @example
   * ```typescript
   * const { data } = await vippsService.getStatus();
   * if (data.connected) {
   *   console.log(`Vipps merchant: ${data.merchantId}`);
   * }
   * ```
   */
  async getStatus(): Promise<SingleResponse<{ connected: boolean; merchantId: string }>> {
    return this.client.get(this.buildPath('/status'));
  }

  /**
   * Initiate payment
   * Initiates a new Vipps payment flow. Creates a payment authorization that
   * the user must approve in their Vipps app. Use capturePayment to finalize.
   *
   * @param data - Payment initiation details including amount, order ID, and customer info
   * @returns Promise resolving to initiated payment with authorization URL
   *
   * @example
   * ```typescript
   * const { data: payment } = await vippsService.initiatePayment({
   *   amount: 50000, // 500.00 NOK in øre
   *   orderId: 'order-123',
   *   customerPhone: '+4798765432',
   *   description: 'Booking payment for Sports Hall'
   * });
   * // Redirect user to payment.url for authorization
   * ```
   */
  async initiatePayment(data: InitiatePaymentDTO): Promise<SingleResponse<VippsPayment>> {
    return this.client.post(this.buildPath('/initiate'), data);
  }

  /**
   * Get payment status
   * Retrieves the current status of a Vipps payment including authorization
   * and capture state
   *
   * @param orderId - Unique order identifier for the payment
   * @returns Promise resolving to payment details and status
   *
   * @example
   * ```typescript
   * const { data: payment } = await vippsService.getPaymentStatus('order-123');
   * console.log(`Payment status: ${payment.status}`);
   * ```
   */
  async getPaymentStatus(orderId: string): Promise<SingleResponse<VippsPayment>> {
    return this.client.get(this.buildPath(`/payment/${orderId}`));
  }

  /**
   * Capture payment (finalize authorized payment)
   * Captures an authorized Vipps payment, transferring funds from customer to merchant.
   * Must be called after successful payment authorization.
   *
   * @param data - Capture details including order ID and optional capture amount
   * @returns Promise resolving to captured payment details
   *
   * @example
   * ```typescript
   * // Capture full authorized amount
   * const { data } = await vippsService.capturePayment({
   *   orderId: 'order-123'
   * });
   *
   * // Partial capture
   * const { data } = await vippsService.capturePayment({
   *   orderId: 'order-123',
   *   amount: 25000 // Capture 250.00 NOK
   * });
   * ```
   */
  async capturePayment(data: CapturePaymentDTO): Promise<SingleResponse<VippsPayment>> {
    return this.client.post(this.buildPath('/capture'), data);
  }

  /**
   * Refund payment (full or partial)
   * Refunds a captured Vipps payment to the customer. Supports both full
   * and partial refunds.
   *
   * @param data - Refund details including order ID, amount, and reason
   * @returns Promise resolving to refunded payment details
   *
   * @example
   * ```typescript
   * // Full refund
   * await vippsService.refundPayment({
   *   orderId: 'order-123',
   *   reason: 'Booking cancelled by user'
   * });
   *
   * // Partial refund
   * await vippsService.refundPayment({
   *   orderId: 'order-123',
   *   amount: 10000, // Refund 100.00 NOK
   *   reason: 'Partial cancellation'
   * });
   * ```
   */
  async refundPayment(data: RefundPaymentDTO): Promise<SingleResponse<VippsPayment>> {
    return this.client.post(this.buildPath('/refund'), data);
  }

  /**
   * Get payment history
   * Retrieves all Vipps payments for the tenant with pagination support.
   * Includes initiated, captured, and refunded payments.
   *
   * @returns Promise resolving to paginated payment history
   *
   * @example
   * ```typescript
   * const { data: payments, meta } = await vippsService.getPaymentHistory();
   * payments.forEach(payment => {
   *   console.log(`${payment.orderId}: ${payment.status} - ${payment.amount/100} NOK`);
   * });
   * ```
   */
  async getPaymentHistory(): Promise<PaginatedResponse<VippsPayment>> {
    return this.client.get(this.buildPath('/history'));
  }
}

/**
 * Calendar Sync Service
 * Manages calendar integration with Google Calendar and Outlook/Microsoft 365.
 * Synchronizes bookings and resource availability with external calendars.
 */
export class CalendarSyncService extends BaseService {
  constructor() {
    super('/api/integrations/calendar');
  }

  /**
   * Get calendar sync status
   * Retrieves the connection status for all calendar integrations including
   * Google Calendar and Outlook, with last sync timestamps
   *
   * @returns Promise resolving to calendar integration status
   *
   * @example
   * ```typescript
   * const { data } = await calendarSyncService.getStatus();
   * if (data.googleCalendar.connected) {
   *   console.log('Google Calendar connected');
   * }
   * if (data.outlookCalendar.connected) {
   *   console.log(`Last Outlook sync: ${data.outlookCalendar.lastSync}`);
   * }
   * ```
   */
  async getStatus(): Promise<SingleResponse<{
    googleCalendar: { connected: boolean };
    outlookCalendar: { connected: boolean; lastSync?: string };
  }>> {
    return this.client.get(this.buildPath('/status'));
  }

  /**
   * Trigger calendar sync
   * Manually triggers synchronization with the specified calendar provider.
   * Syncs booking events and resource availability to external calendar.
   *
   * @param provider - Calendar provider to sync ('google' or 'outlook')
   * @returns Promise resolving to success status
   *
   * @example
   * ```typescript
   * // Sync with Google Calendar
   * await calendarSyncService.sync('google');
   *
   * // Sync with Outlook
   * await calendarSyncService.sync('outlook');
   * ```
   */
  async sync(provider: 'google' | 'outlook'): Promise<SuccessResponse> {
    return this.client.post(this.buildPath('/sync'), { provider });
  }
}

// Singleton instances
export const settingsService = new SettingsService();
export const rcoService = new RcoService();
export const vismaService = new VismaService();
export const brregService = new BrregService();
export const nifService = new NifService();
export const vippsService = new VippsService();
export const calendarSyncService = new CalendarSyncService();
