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
  InitiatePaymentDTO
} from '../types/settings';
import type { SingleResponse, SuccessResponse, PaginatedResponse } from '../types/enums';

/**
 * Settings Service
 */
export class SettingsService extends BaseService {
  constructor() {
    super('/api/settings');
  }

  /**
   * Get tenant settings
   */
  async getSettings(): Promise<SingleResponse<TenantSettings>> {
    return this.client.get(this.buildPath());
  }

  /**
   * Update tenant settings
   */
  async updateSettings(data: Partial<TenantSettings>): Promise<SingleResponse<TenantSettings>> {
    return this.client.put(this.buildPath(), data);
  }

  /**
   * Get integration settings
   */
  async getIntegrations(): Promise<SingleResponse<IntegrationSettings>> {
    return this.client.get(this.buildPath('/integrations'));
  }

  /**
   * Update integration settings
   */
  async updateIntegration(provider: string, data: Record<string, unknown>): Promise<SingleResponse<IntegrationSettings>> {
    return this.client.put(this.buildPath(`/integrations/${provider}`), data);
  }
}

/**
 * RCO Access Control Service
 */
export class RcoService extends BaseService {
  constructor() {
    super('/api/integrations/rco');
  }

  /**
   * Get RCO connection status
   */
  async getStatus(): Promise<SingleResponse<{ connected: boolean; activeAccessCodes: number }>> {
    return this.client.get(this.buildPath('/status'));
  }

  /**
   * Generate access code for booking
   */
  async generateAccessCode(data: CreateAccessCodeDTO): Promise<SingleResponse<RcoAccessCode>> {
    return this.client.post(this.buildPath('/access-code'), data);
  }

  /**
   * Get connected locks
   */
  async getLocks(): Promise<SingleResponse<RcoLock[]>> {
    return this.client.get(this.buildPath('/locks'));
  }

  /**
   * Remote unlock
   */
  async unlock(lockId: string, duration?: number): Promise<SuccessResponse> {
    return this.client.post(this.buildPath('/unlock'), { lockId, duration });
  }
}

/**
 * Visma ERP Service
 */
export class VismaService extends BaseService {
  constructor() {
    super('/api/integrations/visma');
  }

  /**
   * Get Visma connection status
   */
  async getStatus(): Promise<SingleResponse<{ connected: boolean; pendingInvoices: number }>> {
    return this.client.get(this.buildPath('/status'));
  }

  /**
   * Create invoice
   */
  async createInvoice(data: CreateInvoiceDTO): Promise<SingleResponse<VismaInvoice>> {
    return this.client.post(this.buildPath('/invoice'), data);
  }

  /**
   * Get invoices
   */
  async getInvoices(): Promise<PaginatedResponse<VismaInvoice>> {
    return this.client.get(this.buildPath('/invoices'));
  }

  /**
   * Trigger sync with Visma
   */
  async sync(): Promise<SuccessResponse> {
    return this.client.post(this.buildPath('/sync'));
  }
}

/**
 * BRREG (Norwegian Business Registry) Service
 */
export class BrregService extends BaseService {
  constructor() {
    super('/api/integrations/brreg');
  }

  /**
   * Lookup organization by number
   */
  async lookup(orgNumber: string): Promise<SingleResponse<BrregOrganization>> {
    return this.client.get(this.buildPath(`/lookup/${orgNumber}`));
  }

  /**
   * Verify organization
   */
  async verify(organizationNumber: string): Promise<SingleResponse<{ verified: boolean }>> {
    return this.client.post(this.buildPath('/verify'), { organizationNumber });
  }
}

/**
 * NIF (Norwegian Sports Federation) Service
 */
export class NifService extends BaseService {
  constructor() {
    super('/api/integrations/nif');
  }

  /**
   * Lookup sports club
   */
  async lookup(clubId: string): Promise<SingleResponse<NifSportsClub>> {
    return this.client.get(this.buildPath(`/lookup/${clubId}`));
  }
}

/**
 * Vipps Payments Service
 */
export class VippsService extends BaseService {
  constructor() {
    super('/api/integrations/vipps');
  }

  /**
   * Get Vipps connection status
   */
  async getStatus(): Promise<SingleResponse<{ connected: boolean; merchantId: string }>> {
    return this.client.get(this.buildPath('/status'));
  }

  /**
   * Initiate payment
   */
  async initiatePayment(data: InitiatePaymentDTO): Promise<SingleResponse<VippsPayment>> {
    return this.client.post(this.buildPath('/initiate'), data);
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(orderId: string): Promise<SingleResponse<VippsPayment>> {
    return this.client.get(this.buildPath(`/payment/${orderId}`));
  }
}

/**
 * Calendar Sync Service
 */
export class CalendarSyncService extends BaseService {
  constructor() {
    super('/api/integrations/calendar');
  }

  /**
   * Get calendar sync status
   */
  async getStatus(): Promise<SingleResponse<{
    googleCalendar: { connected: boolean };
    outlookCalendar: { connected: boolean; lastSync?: string };
  }>> {
    return this.client.get(this.buildPath('/status'));
  }

  /**
   * Trigger calendar sync
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
