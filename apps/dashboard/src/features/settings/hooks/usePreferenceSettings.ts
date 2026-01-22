/**
 * Preference Settings Hook
 * Manages user preferences: theme, display, locale, and customization settings
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  useUserPreferences,
  useUpdateUserPreferences,
} from '@digilist/client-sdk';

export interface PreferenceSettingsData {
  locale: 'nb' | 'nn' | 'en';
  theme: 'light' | 'dark' | 'auto';
  colorScheme?: string;
  fontSize: 'sm' | 'md' | 'lg';
  defaultView: 'list' | 'grid';
  compactMode: boolean;
}

interface UsePreferenceSettingsOptions {
  onSaveSuccess?: () => void;
  onSaveError?: (error: unknown) => void;
}

export function usePreferenceSettings(options: UsePreferenceSettingsOptions = {}) {
  const { onSaveSuccess, onSaveError } = options;

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Queries
  const { data: preferencesData, isLoading: isLoadingPreferences } = useUserPreferences();
  const userPreferences = preferencesData?.data;

  // Mutations
  const updatePreferencesMutation = useUpdateUserPreferences();

  // Preference settings form state
  const [preferenceData, setPreferenceData] = useState<PreferenceSettingsData>({
    locale: 'nb',
    theme: 'auto',
    colorScheme: undefined,
    fontSize: 'md',
    defaultView: 'list',
    compactMode: false,
  });

  // Load user preferences into form
  useEffect(() => {
    if (userPreferences) {
      setPreferenceData({
        locale: (userPreferences.locale as 'nb' | 'nn' | 'en') ?? 'nb',
        theme: userPreferences.theme ?? 'auto',
        colorScheme: userPreferences.colorScheme,
        fontSize: userPreferences.fontSize ?? 'md',
        defaultView: userPreferences.defaultView ?? 'list',
        compactMode: userPreferences.compactMode ?? false,
      });
    }
  }, [userPreferences]);

  // Update single field
  const updateField = useCallback(
    <K extends keyof PreferenceSettingsData>(field: K, value: PreferenceSettingsData[K]) => {
      setPreferenceData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // Update multiple fields at once
  const updateFields = useCallback((updates: Partial<PreferenceSettingsData>) => {
    setPreferenceData((prev) => ({ ...prev, ...updates }));
  }, []);

  // Reset form to original values
  const resetForm = useCallback(() => {
    if (userPreferences) {
      setPreferenceData({
        locale: (userPreferences.locale as 'nb' | 'nn' | 'en') ?? 'nb',
        theme: userPreferences.theme ?? 'auto',
        colorScheme: userPreferences.colorScheme,
        fontSize: userPreferences.fontSize ?? 'md',
        defaultView: userPreferences.defaultView ?? 'list',
        compactMode: userPreferences.compactMode ?? false,
      });
    }
  }, [userPreferences]);

  // Save preference settings
  const savePreferenceSettings = useCallback(async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updatePreferencesMutation.mutateAsync({
        locale: preferenceData.locale,
        theme: preferenceData.theme,
        colorScheme: preferenceData.colorScheme,
        fontSize: preferenceData.fontSize,
        defaultView: preferenceData.defaultView,
        compactMode: preferenceData.compactMode,
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
  }, [preferenceData, updatePreferencesMutation, onSaveSuccess, onSaveError]);

  // Check if form has changes
  const hasChanges = useMemo(() => {
    if (!userPreferences) return false;
    return (
      preferenceData.locale !== (userPreferences.locale ?? 'nb') ||
      preferenceData.theme !== (userPreferences.theme ?? 'auto') ||
      preferenceData.colorScheme !== userPreferences.colorScheme ||
      preferenceData.fontSize !== (userPreferences.fontSize ?? 'md') ||
      preferenceData.defaultView !== (userPreferences.defaultView ?? 'list') ||
      preferenceData.compactMode !== (userPreferences.compactMode ?? false)
    );
  }, [userPreferences, preferenceData]);

  // Validate form data
  const isValid = useMemo(() => {
    return (
      ['nb', 'nn', 'en'].includes(preferenceData.locale) &&
      ['light', 'dark', 'auto'].includes(preferenceData.theme) &&
      ['sm', 'md', 'lg'].includes(preferenceData.fontSize) &&
      ['list', 'grid'].includes(preferenceData.defaultView)
    );
  }, [preferenceData]);

  // Computed: Check if dark mode is active
  const isDarkMode = useMemo(() => {
    if (preferenceData.theme === 'dark') return true;
    if (preferenceData.theme === 'light') return false;
    // Auto mode - check system preference
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  }, [preferenceData.theme]);

  // Computed: Get display name for locale
  const getLocaleDisplayName = useCallback((locale: string) => {
    const localeNames: Record<string, string> = {
      nb: 'Norsk (Bokmål)',
      nn: 'Norsk (Nynorsk)',
      en: 'English',
    };
    return localeNames[locale] || locale;
  }, []);

  // Computed: Get display name for theme
  const getThemeDisplayName = useCallback((theme: string) => {
    const themeNames: Record<string, string> = {
      light: 'Lys',
      dark: 'Mørk',
      auto: 'Automatisk',
    };
    return themeNames[theme] || theme;
  }, []);

  // Computed: Get display name for font size
  const getFontSizeDisplayName = useCallback((fontSize: string) => {
    const fontSizeNames: Record<string, string> = {
      sm: 'Liten',
      md: 'Normal',
      lg: 'Stor',
    };
    return fontSizeNames[fontSize] || fontSize;
  }, []);

  return {
    // State
    preferenceData,
    isSaving,
    saveSuccess,
    isLoadingPreferences,
    userPreferences,

    // Actions
    updateField,
    updateFields,
    resetForm,
    savePreferenceSettings,

    // Computed
    hasChanges,
    isValid,
    isDarkMode,

    // Helper functions
    getLocaleDisplayName,
    getThemeDisplayName,
    getFontSizeDisplayName,
  };
}
