/**
 * Integration Adapters Index
 * Third-party service integrations for Digilist platform
 *
 * Each integration follows the adapter pattern:
 * - Interface definition (IXxxClient)
 * - Real client for production
 * - Mock client for demo/testing
 * - Config-based provider selection
 *
 * Integrations:
 * - Visma Enterprise: ERP/invoicing (Norwegian municipal financial system)
 * - Microsoft Outlook: Calendar sync via Microsoft Graph API
 * - ACOS WebSak: Case management (NOARK-compliant archive system) - TODO
 * - RCO Security: Physical access control - TODO
 * - Vipps: Payment processing - TODO
 * - Google Calendar: Calendar sync via Google APIs - TODO
 *
 * Environment variables control mock vs real implementation.
 */

// =============================================================================
// Visma Enterprise (ERP/Invoicing)
// =============================================================================
export {
  // Client factory
  getVismaClient,
  getVismaClientSingleton,
  resetVismaClient,
  vismaClient,

  // Client classes
  VismaClient,
  VismaMockClient,

  // Types
  type IVismaClient,
  type VismaConfig,
  type VismaConnectionStatus,
  type VismaSyncResult,
  type VismaInvoice,
  type VismaInvoiceExtended,
  type VismaInvoiceLine,
  type VismaInvoiceStatus,
  type VismaInvoiceQueryParams,
  type CreateVismaInvoiceDTO,
  type VismaCustomer,
  type VismaAddress,
  type CreateVismaCustomerDTO,
  type VismaCreditNote,
  type CreateVismaCreditNoteDTO,
  type VismaPayment,
  type VismaPaymentMethod,
  type RegisterVismaPaymentDTO,
  type VismaFinancialSummary,
  type VismaAgedReceivables,
  type VismaExportResult,
  type VismaExportFormat,
  type SendInvoiceReminderDTO,
  type VismaIntegrationEvent,
  type VismaEventType,
} from './visma';

// =============================================================================
// Microsoft Outlook (Calendar Sync)
// =============================================================================
export {
  // Client factory
  getOutlookClient,
  getOutlookClientSingleton,
  resetOutlookClient,
  outlookClient,

  // Client classes
  OutlookClient,
  OutlookMockClient,

  // Types
  type IOutlookClient,
  type OutlookConfig,
  type OutlookConnectionStatus,
  type OutlookSyncResult,
  type OutlookCalendar,
  type OutlookEmailAddress,
  type OutlookEvent,
  type OutlookDateTime,
  type OutlookLocation,
  type OutlookAttendee,
  type OutlookResponseStatus,
  type OutlookEventStatus,
  type OutlookRecurrence,
  type CreateOutlookEventDTO,
  type UpdateOutlookEventDTO,
  type OutlookEventQueryParams,
  type OutlookSyncMapping,
  type OutlookIntegrationEvent,
  type OutlookEventType,
} from './outlook';

// =============================================================================
// Vipps Payment Integration
// =============================================================================
export {
  // Client factory
  getVippsClient,
  getVippsClientSingleton,
  resetVippsClient,
  vippsClient,

  // Client classes
  VippsClient,
  VippsMockClient,

  // Types
  type IVippsClient,
  type VippsConfig,
  type VippsConnectionStatus,
  type VippsPayment,
  type VippsPaymentExtended,
  type VippsPaymentResponse,
  type VippsPaymentStatus,
  type VippsPaymentQueryParams,
  type VippsAmount,
  type VippsPaymentMethod,
  type VippsUserProfile,
  type VippsTransactionEvent,
  type VippsEventType,
  type CreateVippsPaymentDTO,
  type CaptureVippsPaymentDTO,
  type RefundVippsPaymentDTO,
  type VippsRefundResponse,
  type VippsWebhookPayload,
  type VippsWebhookVerificationResult,
  type VippsAgreement,
  type VippsAgreementStatus,
  type VippsInterval,
  type VippsCampaign,
  type CreateVippsAgreementDTO,
  type VippsChargeDTO,
  type VippsCharge,
  type VippsIntegrationEvent,
} from './vipps';

// =============================================================================
// Integration Status Helper
// =============================================================================

/**
 * Get status of all configured integrations
 * Useful for health checks and admin dashboards
 */
export async function getAllIntegrationStatuses(): Promise<{
  visma: { connected: boolean; provider: string; error?: string };
  outlook: { connected: boolean; provider: string; error?: string };
  vipps: { connected: boolean; provider: string; error?: string };
}> {
  const statuses: Record<string, { connected: boolean; provider: string; error?: string }> = {};

  // Visma status
  try {
    const { vismaClient } = await import('./visma');
    const vismaStatus = await vismaClient.getStatus();
    statuses.visma = {
      connected: vismaStatus.connected,
      provider: vismaStatus.provider,
    };
  } catch (error) {
    statuses.visma = {
      connected: false,
      provider: 'Visma Enterprise',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // Outlook status
  try {
    const { outlookClient } = await import('./outlook');
    const outlookStatus = await outlookClient.getStatus();
    statuses.outlook = {
      connected: outlookStatus.connected,
      provider: outlookStatus.provider,
    };
  } catch (error) {
    statuses.outlook = {
      connected: false,
      provider: 'Microsoft Outlook',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // Vipps status
  try {
    const { vippsClient } = await import('./vipps');
    const vippsStatus = await vippsClient.getStatus();
    statuses.vipps = {
      connected: vippsStatus.connected,
      provider: vippsStatus.provider,
    };
  } catch (error) {
    statuses.vipps = {
      connected: false,
      provider: 'Vipps',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  return statuses as any;
}

/**
 * Integration provider names for UI display
 */
export const INTEGRATION_PROVIDERS = {
  visma: {
    name: 'Visma Enterprise',
    description: 'Norwegian municipal ERP/invoicing system',
    category: 'financial',
  },
  acos: {
    name: 'ACOS WebSak',
    description: 'Norwegian municipal case management (NOARK)',
    category: 'archive',
  },
  rco: {
    name: 'RCO Security',
    description: 'Physical access control system',
    category: 'access',
  },
  vipps: {
    name: 'Vipps',
    description: 'Norwegian mobile payment solution',
    category: 'payment',
  },
  outlook: {
    name: 'Microsoft Outlook',
    description: 'Calendar sync via Microsoft Graph API',
    category: 'calendar',
  },
  google: {
    name: 'Google Calendar',
    description: 'Calendar sync via Google APIs',
    category: 'calendar',
  },
} as const;

export type IntegrationProviderKey = keyof typeof INTEGRATION_PROVIDERS;
