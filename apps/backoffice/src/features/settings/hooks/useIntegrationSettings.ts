/**
 * Integration Settings Hook
 * Manages integration configuration and toggling for third-party services
 */

import { useState, useCallback, useMemo } from 'react';
import {
  useIntegrationSettings as useSDKIntegrationSettings,
  useUpdateIntegration,
} from '@digilist/client-sdk';

export type IntegrationType =
  | 'bankid'
  | 'idporten'
  | 'vipps'
  | 'rco'
  | 'googleCalendar'
  | 'outlook'
  | 'visma'
  | 'brreg';

export type IntegrationCategory = 'auth' | 'payment' | 'access' | 'calendar' | 'erp' | 'registry';

export interface IntegrationConfig {
  id: IntegrationType;
  name: string;
  description: string;
  category: IntegrationCategory;
  enabled: boolean;
}

interface UseIntegrationSettingsOptions {
  onToggleSuccess?: (provider: string, enabled: boolean) => void;
  onToggleError?: (provider: string, error: unknown) => void;
}

export function useIntegrationSettings(options: UseIntegrationSettingsOptions = {}) {
  const { onToggleSuccess, onToggleError } = options;

  const [isToggling, setIsToggling] = useState<Record<string, boolean>>({});

  // Queries
  const { data: integrationsData, isLoading } = useSDKIntegrationSettings();
  const integrations = integrationsData?.data;

  // Mutations
  const updateIntegrationMutation = useUpdateIntegration();

  // Toggle integration enabled state
  const toggleIntegration = useCallback(
    async (provider: IntegrationType, enabled: boolean) => {
      setIsToggling((prev) => ({ ...prev, [provider]: true }));
      try {
        await updateIntegrationMutation.mutateAsync({
          provider,
          data: { enabled },
        });
        if (onToggleSuccess) {
          onToggleSuccess(provider, enabled);
        }
      } catch (error) {
        if (onToggleError) {
          onToggleError(provider, error);
        }
      } finally {
        setIsToggling((prev) => ({ ...prev, [provider]: false }));
      }
    },
    [updateIntegrationMutation, onToggleSuccess, onToggleError]
  );

  // Get integration status
  const getIntegrationStatus = useCallback(
    (provider: IntegrationType): boolean => {
      return integrations?.[provider]?.enabled || false;
    },
    [integrations]
  );

  // Check if integration is being toggled
  const isTogglingIntegration = useCallback(
    (provider: IntegrationType): boolean => {
      return isToggling[provider] || false;
    },
    [isToggling]
  );

  // Get integrations by category
  const getIntegrationsByCategory = useCallback(
    (category: IntegrationCategory): IntegrationConfig[] => {
      const categoryMap: Record<IntegrationCategory, IntegrationType[]> = {
        auth: ['bankid', 'idporten'],
        payment: ['vipps'],
        access: ['rco'],
        calendar: ['googleCalendar', 'outlook'],
        erp: ['visma'],
        registry: ['brreg'],
      };

      const integrationNames: Record<IntegrationType, { name: string; description: string }> = {
        bankid: { name: 'BankID', description: 'Norsk e-ID for sikker pålogging' },
        idporten: { name: 'ID-porten', description: 'Offentlig påloggingsløsning' },
        vipps: { name: 'Vipps', description: 'Mobilbetaling med Vipps' },
        rco: { name: 'RCO', description: 'Digital låssystem' },
        googleCalendar: { name: 'Google Calendar', description: 'Synkroniser med Google Calendar' },
        outlook: { name: 'Outlook', description: 'Synkroniser med Outlook/Exchange' },
        visma: { name: 'Visma', description: 'Fakturering via Visma' },
        brreg: { name: 'Brønnøysundregistrene', description: 'Verifiser organisasjoner' },
      };

      const providers = categoryMap[category] || [];
      return providers.map((id) => ({
        id,
        name: integrationNames[id].name,
        description: integrationNames[id].description,
        category,
        enabled: getIntegrationStatus(id),
      }));
    },
    [getIntegrationStatus]
  );

  // Get all integrations
  const allIntegrations = useMemo((): IntegrationConfig[] => {
    const categories: IntegrationCategory[] = ['auth', 'payment', 'access', 'calendar', 'erp', 'registry'];
    return categories.flatMap((category) => getIntegrationsByCategory(category));
  }, [getIntegrationsByCategory]);

  // Count enabled integrations
  const enabledIntegrationsCount = useMemo(() => {
    return allIntegrations.filter((integration) => integration.enabled).length;
  }, [allIntegrations]);

  // Count integrations by category
  const getEnabledCountByCategory = useCallback(
    (category: IntegrationCategory): number => {
      const categoryIntegrations = getIntegrationsByCategory(category);
      return categoryIntegrations.filter((integration) => integration.enabled).length;
    },
    [getIntegrationsByCategory]
  );

  // Check if any integration is enabled in a category
  const hasEnabledInCategory = useCallback(
    (category: IntegrationCategory): boolean => {
      return getEnabledCountByCategory(category) > 0;
    },
    [getEnabledCountByCategory]
  );

  // Get all enabled integrations
  const enabledIntegrations = useMemo(() => {
    return allIntegrations.filter((integration) => integration.enabled);
  }, [allIntegrations]);

  // Get all disabled integrations
  const disabledIntegrations = useMemo(() => {
    return allIntegrations.filter((integration) => !integration.enabled);
  }, [allIntegrations]);

  return {
    // State
    integrations,
    isLoading,
    isToggling,

    // Actions
    toggleIntegration,
    getIntegrationStatus,
    isTogglingIntegration,

    // Queries
    getIntegrationsByCategory,
    getEnabledCountByCategory,
    hasEnabledInCategory,

    // Computed
    allIntegrations,
    enabledIntegrations,
    disabledIntegrations,
    enabledIntegrationsCount,
  };
}
