/**
 * Branding Settings Hook
 * Manages branding customization: logo, colors, favicon
 */

import { useState, useEffect, useCallback } from 'react';
import {
  useTenantSettings,
  useUpdateTenantSettings,
} from '@digilist/client-sdk';

export interface BrandingSettingsData {
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  favicon: string;
}

interface UseBrandingSettingsOptions {
  onSaveSuccess?: () => void;
  onSaveError?: (error: unknown) => void;
}

export function useBrandingSettings(options: UseBrandingSettingsOptions = {}) {
  const { onSaveSuccess, onSaveError } = options;

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Queries
  const { data: settingsData, isLoading: isLoadingSettings } = useTenantSettings();
  const tenantSettings = settingsData?.data;

  // Mutations
  const updateSettingsMutation = useUpdateTenantSettings();

  // Branding settings form state
  const [brandingData, setBrandingData] = useState<BrandingSettingsData>({
    logo: '',
    primaryColor: '#1A56DB',
    secondaryColor: '#6B7280',
    favicon: '',
  });

  // Load tenant settings into form
  useEffect(() => {
    if (tenantSettings) {
      setBrandingData({
        logo: tenantSettings.branding?.logo || '',
        primaryColor: tenantSettings.branding?.primaryColor || '#1A56DB',
        secondaryColor: tenantSettings.branding?.secondaryColor || '#6B7280',
        favicon: tenantSettings.branding?.favicon || '',
      });
    }
  }, [tenantSettings]);

  // Update single field
  const updateField = useCallback(
    <K extends keyof BrandingSettingsData>(field: K, value: BrandingSettingsData[K]) => {
      setBrandingData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // Update multiple fields at once
  const updateFields = useCallback((updates: Partial<BrandingSettingsData>) => {
    setBrandingData((prev) => ({ ...prev, ...updates }));
  }, []);

  // Reset form to original values
  const resetForm = useCallback(() => {
    if (tenantSettings) {
      setBrandingData({
        logo: tenantSettings.branding?.logo || '',
        primaryColor: tenantSettings.branding?.primaryColor || '#1A56DB',
        secondaryColor: tenantSettings.branding?.secondaryColor || '#6B7280',
        favicon: tenantSettings.branding?.favicon || '',
      });
    }
  }, [tenantSettings]);

  // Save branding settings
  const saveBrandingSettings = useCallback(async () => {
    if (!tenantSettings) return;

    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updateSettingsMutation.mutateAsync({
        ...tenantSettings,
        branding: {
          logo: brandingData.logo,
          primaryColor: brandingData.primaryColor,
          secondaryColor: brandingData.secondaryColor,
          favicon: brandingData.favicon,
        },
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      if (onSaveSuccess) {
        onSaveSuccess();
      }
    } catch (error) {
      if (onSaveError) {
        onSaveError(error);
      }
    } finally {
      setIsSaving(false);
    }
  }, [brandingData, tenantSettings, updateSettingsMutation, onSaveSuccess, onSaveError]);

  // Check if form has changes
  const hasChanges = useCallback(() => {
    if (!tenantSettings) return false;
    return (
      brandingData.logo !== (tenantSettings.branding?.logo || '') ||
      brandingData.primaryColor !== (tenantSettings.branding?.primaryColor || '#1A56DB') ||
      brandingData.secondaryColor !== (tenantSettings.branding?.secondaryColor || '#6B7280') ||
      brandingData.favicon !== (tenantSettings.branding?.favicon || '')
    );
  }, [tenantSettings, brandingData]);

  // Validate form data (check if colors are valid hex codes)
  const isValid = useCallback(() => {
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return (
      hexColorRegex.test(brandingData.primaryColor) &&
      hexColorRegex.test(brandingData.secondaryColor)
    );
  }, [brandingData]);

  // Validate URL format
  const isValidUrl = useCallback((url: string): boolean => {
    if (!url) return true; // Empty URLs are valid (optional fields)
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }, []);

  // Check if logo URL is valid
  const isLogoUrlValid = useCallback(() => {
    return isValidUrl(brandingData.logo);
  }, [brandingData.logo, isValidUrl]);

  // Check if favicon URL is valid
  const isFaviconUrlValid = useCallback(() => {
    return isValidUrl(brandingData.favicon);
  }, [brandingData.favicon, isValidUrl]);

  // Check if all URLs are valid
  const areUrlsValid = useCallback(() => {
    return isLogoUrlValid() && isFaviconUrlValid();
  }, [isLogoUrlValid, isFaviconUrlValid]);

  // Get color preview style
  const getColorPreview = useCallback((color: string) => {
    return {
      backgroundColor: color,
      width: '32px',
      height: '32px',
      borderRadius: '4px',
      border: '1px solid var(--ds-color-neutral-border-default)',
    };
  }, []);

  return {
    // State
    brandingData,
    isSaving,
    saveSuccess,
    isLoadingSettings,
    tenantSettings,

    // Actions
    updateField,
    updateFields,
    resetForm,
    saveBrandingSettings,

    // Computed
    hasChanges: hasChanges(),
    isValid: isValid(),
    areUrlsValid: areUrlsValid(),
    isLogoUrlValid: isLogoUrlValid(),
    isFaviconUrlValid: isFaviconUrlValid(),

    // Helpers
    getColorPreview,
  };
}
