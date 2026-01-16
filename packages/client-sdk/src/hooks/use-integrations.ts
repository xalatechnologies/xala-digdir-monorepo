/**
 * Integration Hooks
 * Single Responsibility: React Query hooks for third-party integrations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { 
  settingsService,
  rcoService,
  vismaService,
  brregService,
  nifService,
  vippsService,
  calendarSyncService
} from '../services/integration.service';
import type { TenantSettings, CreateAccessCodeDTO, CreateInvoiceDTO, InitiatePaymentDTO, CapturePaymentDTO, RefundPaymentDTO } from '../types/settings';

// ============================================================================
// Settings Hooks
// ============================================================================

/**
 * Get tenant settings
 */
export function useTenantSettings() {
  return useQuery({
    queryKey: queryKeys.settings.tenant(),
    queryFn: () => settingsService.getSettings(),
  });
}

/**
 * Update tenant settings mutation
 */
export function useUpdateTenantSettings() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<TenantSettings>) => settingsService.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.tenant() });
    },
  });
}

/**
 * Get integration settings
 */
export function useIntegrationSettings() {
  return useQuery({
    queryKey: queryKeys.settings.integrations(),
    queryFn: () => settingsService.getIntegrations(),
  });
}

/**
 * Update integration settings mutation
 */
export function useUpdateIntegration() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ provider, data }: { provider: string; data: Record<string, unknown> }) => 
      settingsService.updateIntegration(provider, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.integrations() });
    },
  });
}

// ============================================================================
// RCO Hooks
// ============================================================================

/**
 * Get RCO connection status
 */
export function useRcoStatus() {
  return useQuery({
    queryKey: queryKeys.integrations.rco.status(),
    queryFn: () => rcoService.getStatus(),
  });
}

/**
 * Get connected locks
 */
export function useRcoLocks() {
  return useQuery({
    queryKey: queryKeys.integrations.rco.locks(),
    queryFn: () => rcoService.getLocks(),
  });
}

/**
 * Generate access code mutation
 */
export function useGenerateAccessCode() {
  return useMutation({
    mutationFn: (data: CreateAccessCodeDTO) => rcoService.generateAccessCode(data),
  });
}

/**
 * Remote unlock mutation
 */
export function useRemoteUnlock() {
  return useMutation({
    mutationFn: ({ lockId, duration }: { lockId: string; duration?: number }) => 
      rcoService.unlock(lockId, duration),
  });
}

// ============================================================================
// Visma Hooks
// ============================================================================

/**
 * Get Visma connection status
 */
export function useVismaStatus() {
  return useQuery({
    queryKey: queryKeys.integrations.visma.status(),
    queryFn: () => vismaService.getStatus(),
  });
}

/**
 * Get Visma invoices
 */
export function useVismaInvoices() {
  return useQuery({
    queryKey: queryKeys.integrations.visma.invoices(),
    queryFn: () => vismaService.getInvoices(),
  });
}

/**
 * Create Visma invoice mutation
 */
export function useCreateInvoice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateInvoiceDTO) => vismaService.createInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.visma.invoices() });
    },
  });
}

/**
 * Sync with Visma mutation
 */
export function useSyncVisma() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => vismaService.sync(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.visma.invoices() });
    },
  });
}

// ============================================================================
// BRREG Hooks
// ============================================================================

/**
 * Lookup organization in BRREG
 */
export function useBrregLookup(orgNumber: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.integrations.brreg.lookup(orgNumber),
    queryFn: () => brregService.lookup(orgNumber),
    enabled: !!orgNumber && orgNumber.length >= 9 && (options?.enabled ?? true),
  });
}

/**
 * Verify organization in BRREG mutation
 */
export function useVerifyBrreg() {
  return useMutation({
    mutationFn: (organizationNumber: string) => brregService.verify(organizationNumber),
  });
}

// ============================================================================
// NIF Hooks
// ============================================================================

/**
 * Lookup sports club in NIF
 */
export function useNifLookup(clubId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.integrations.nif.lookup(clubId),
    queryFn: () => nifService.lookup(clubId),
    enabled: !!clubId && (options?.enabled ?? true),
  });
}

// ============================================================================
// Vipps Hooks
// ============================================================================

/**
 * Get Vipps connection status
 */
export function useVippsStatus() {
  return useQuery({
    queryKey: queryKeys.integrations.vipps.status(),
    queryFn: () => vippsService.getStatus(),
  });
}

/**
 * Get payment status
 */
export function useVippsPayment(orderId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.integrations.vipps.payment(orderId),
    queryFn: () => vippsService.getPaymentStatus(orderId),
    enabled: !!orderId && (options?.enabled ?? true),
  });
}

/**
 * Initiate Vipps payment mutation
 */
export function useInitiatePayment() {
  return useMutation({
    mutationFn: (data: InitiatePaymentDTO) => vippsService.initiatePayment(data),
  });
}

/**
 * Get payment history
 */
export function useVippsPaymentHistory() {
  return useQuery({
    queryKey: queryKeys.integrations.vipps.history(),
    queryFn: () => vippsService.getPaymentHistory(),
  });
}

/**
 * Capture payment mutation (finalize authorized payment)
 */
export function useCapturePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CapturePaymentDTO) => vippsService.capturePayment(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.vipps.payment(variables.orderId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.vipps.history() });
    },
  });
}

/**
 * Refund payment mutation (full or partial)
 */
export function useRefundPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RefundPaymentDTO) => vippsService.refundPayment(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.vipps.payment(variables.orderId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.vipps.history() });
    },
  });
}

// ============================================================================
// Calendar Sync Hooks
// ============================================================================

/**
 * Get calendar sync status
 */
export function useCalendarSyncStatus() {
  return useQuery({
    queryKey: queryKeys.integrations.calendar.status(),
    queryFn: () => calendarSyncService.getStatus(),
  });
}

/**
 * Sync external calendar mutation
 */
export function useSyncCalendar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (provider: 'google' | 'outlook') => calendarSyncService.sync(provider),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.calendar.status() });
      queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
    },
  });
}

// ============================================================================
// Integration Configuration Hooks
// Manage integration credentials and settings (ID-porten, Vipps, Visma, RCO, ACOS)
// ============================================================================

import { integrationsService, type Integration, type IntegrationUpdate } from '../services';

const INTEGRATION_CONFIG_KEYS = {
  all: ['integration-configs'] as const,
  lists: () => [...INTEGRATION_CONFIG_KEYS.all, 'list'] as const,
  list: () => [...INTEGRATION_CONFIG_KEYS.lists()] as const,
  details: () => [...INTEGRATION_CONFIG_KEYS.all, 'detail'] as const,
  detail: (provider: string) => [...INTEGRATION_CONFIG_KEYS.details(), provider] as const,
};

/**
 * List all integration configurations
 */
export function useIntegrationConfigs() {
  return useQuery({
    queryKey: INTEGRATION_CONFIG_KEYS.list(),
    queryFn: () => integrationsService.listIntegrations(),
  });
}

/**
 * Get specific integration configuration by provider
 */
export function useIntegrationConfig(provider: string) {
  return useQuery({
    queryKey: INTEGRATION_CONFIG_KEYS.detail(provider),
    queryFn: () => integrationsService.getIntegration(provider),
    enabled: !!provider,
  });
}

/**
 * Update integration configuration
 */
export function useUpdateIntegrationConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ provider, data }: { provider: string; data: IntegrationUpdate }) =>
      integrationsService.updateIntegration(provider, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: INTEGRATION_CONFIG_KEYS.list() });
      queryClient.invalidateQueries({ queryKey: INTEGRATION_CONFIG_KEYS.detail(variables.provider) });
    },
  });
}

/**
 * Test integration connection
 */
export function useTestIntegrationConfig() {
  return useMutation({
    mutationFn: (provider: string) => integrationsService.testIntegration(provider),
  });
}
