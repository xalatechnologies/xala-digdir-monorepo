/**
 * Privacy Settings Hook
 * Manages GDPR consents, data export, and account deletion
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  useConsents,
  useUpdateConsents,
  useExportData,
  useDeleteAccount,
} from '@digilist/client-sdk';

interface ConsentSettings {
  marketing: boolean;
  analytics: boolean;
  thirdPartySharing: boolean;
}

interface UsePrivacySettingsOptions {
  onExportSuccess?: () => void;
  onExportError?: (error: Error) => void;
  onDeleteSuccess?: () => void;
  onDeleteError?: (error: Error) => void;
  onConsentUpdateSuccess?: () => void;
  onConsentUpdateError?: (error: Error) => void;
}

export function usePrivacySettings(options: UsePrivacySettingsOptions = {}) {
  const {
    onExportSuccess,
    onExportError,
    onDeleteSuccess,
    onDeleteError,
    onConsentUpdateSuccess,
    onConsentUpdateError,
  } = options;

  // SDK hooks
  const { data: consentsData, isLoading: isLoadingConsents } = useConsents();
  const updateConsentsMutation = useUpdateConsents();
  const exportDataMutation = useExportData();
  const deleteAccountMutation = useDeleteAccount();

  // State
  const [consentSettings, setConsentSettings] = useState<ConsentSettings>({
    marketing: false,
    analytics: false,
    thirdPartySharing: false,
  });
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load consents from API - handle both array format (from SDK) and object format
  useEffect(() => {
    if (consentsData?.data) {
      const data = consentsData.data as any;
      if (Array.isArray(data)) {
        // SDK returns Consent[] array - find each consent type
        const findConsent = (type: string) =>
          data.find((c: any) => c.type === type)?.granted ?? false;
        setConsentSettings({
          marketing: findConsent('marketing'),
          analytics: findConsent('analytics'),
          thirdPartySharing: findConsent('thirdPartySharing'),
        });
      } else {
        setConsentSettings({
          marketing: data.marketing || false,
          analytics: data.analytics || false,
          thirdPartySharing: data.thirdPartySharing || false,
        });
      }
    }
  }, [consentsData]);

  // Update individual consent
  const updateConsent = useCallback(
    async (field: keyof ConsentSettings, value: boolean) => {
      const newConsents = { ...consentSettings, [field]: value };
      setConsentSettings(newConsents);

      try {
        // Transform to array format expected by SDK
        const payload = [
          { type: 'marketing', granted: newConsents.marketing },
          { type: 'analytics', granted: newConsents.analytics },
          { type: 'thirdPartySharing', granted: newConsents.thirdPartySharing },
        ];
        await updateConsentsMutation.mutateAsync(payload as any);
        onConsentUpdateSuccess?.();
      } catch (error) {
        // Revert on error
        setConsentSettings(consentSettings);
        onConsentUpdateError?.(error as Error);
        throw error;
      }
    },
    [consentSettings, updateConsentsMutation, onConsentUpdateSuccess, onConsentUpdateError]
  );

  // Update multiple consents at once
  const updateConsents = useCallback(
    async (consents: Partial<ConsentSettings>) => {
      const newConsents = { ...consentSettings, ...consents };
      setConsentSettings(newConsents);

      try {
        // Transform to array format expected by SDK
        const payload = [
          { type: 'marketing', granted: newConsents.marketing },
          { type: 'analytics', granted: newConsents.analytics },
          { type: 'thirdPartySharing', granted: newConsents.thirdPartySharing },
        ];
        await updateConsentsMutation.mutateAsync(payload as any);
        onConsentUpdateSuccess?.();
      } catch (error) {
        // Revert on error
        setConsentSettings(consentSettings);
        onConsentUpdateError?.(error as Error);
        throw error;
      }
    },
    [consentSettings, updateConsentsMutation, onConsentUpdateSuccess, onConsentUpdateError]
  );

  // Export user data (GDPR compliance)
  const exportData = useCallback(async () => {
    setIsExporting(true);
    try {
      const result = await exportDataMutation.mutateAsync();

      // Create download link
      const dataStr = JSON.stringify(result.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mine-data-${new Date().toISOString()}.json`;
      link.click();
      URL.revokeObjectURL(url);

      onExportSuccess?.();
    } catch (error) {
      onExportError?.(error as Error);
      throw error;
    } finally {
      setIsExporting(false);
    }
  }, [exportDataMutation, onExportSuccess, onExportError]);

  // Delete account permanently
  const deleteAccount = useCallback(async () => {
    setIsDeleting(true);
    try {
      await deleteAccountMutation.mutateAsync();
      onDeleteSuccess?.();
    } catch (error) {
      onDeleteError?.(error as Error);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  }, [deleteAccountMutation, onDeleteSuccess, onDeleteError]);

  // Computed values
  const hasAnyConsent = useMemo(() => {
    return consentSettings.marketing || consentSettings.analytics || consentSettings.thirdPartySharing;
  }, [consentSettings]);

  const hasAllConsents = useMemo(() => {
    return consentSettings.marketing && consentSettings.analytics && consentSettings.thirdPartySharing;
  }, [consentSettings]);

  const consentCount = useMemo(() => {
    return Object.values(consentSettings).filter(Boolean).length;
  }, [consentSettings]);

  return {
    // State
    consentSettings,
    isLoadingConsents,
    isExporting,
    isDeleting,

    // Computed
    hasAnyConsent,
    hasAllConsents,
    consentCount,

    // Actions
    updateConsent,
    updateConsents,
    exportData,
    deleteAccount,

    // Mutation states
    isUpdatingConsents: updateConsentsMutation.isPending,
    isExportingData: exportDataMutation.isPending,
    isDeletingAccount: deleteAccountMutation.isPending,
  };
}
