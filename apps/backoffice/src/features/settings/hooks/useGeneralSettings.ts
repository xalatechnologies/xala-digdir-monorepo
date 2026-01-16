/**
 * General Settings Hook
 * Manages general system settings: locale, timezone, currency, date/time formats
 */

import { useState, useEffect, useCallback } from 'react';
import {
  useOrganizationSettings,
  useUpdateOrganizationSettings,
} from '@digilist/client-sdk';

export type Locale = 'nb' | 'nn' | 'en';
export type Timezone = 'Europe/Oslo' | 'Europe/London' | 'America/New_York';
export type Currency = 'NOK' | 'EUR' | 'USD';
export type DateFormat = 'dd.MM.yyyy' | 'yyyy-MM-dd' | 'MM/dd/yyyy';
export type TimeFormat = '24h' | '12h';

export interface GeneralSettingsData {
  name: string;
  locale: Locale;
  timezone: Timezone;
  currency: Currency;
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
}

interface UseGeneralSettingsOptions {
  onSaveSuccess?: () => void;
  onSaveError?: (error: unknown) => void;
}

export function useGeneralSettings(options: UseGeneralSettingsOptions = {}) {
  const { onSaveSuccess, onSaveError } = options;

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Queries
  const { data: settingsData, isLoading: isLoadingSettings } = useOrganizationSettings();
  const organizationSettings = settingsData?.data;

  // Mutations
  const updateSettingsMutation = useUpdateOrganizationSettings();

  // General settings form state
  const [generalData, setGeneralData] = useState<GeneralSettingsData>({
    name: '',
    locale: 'nb',
    timezone: 'Europe/Oslo',
    currency: 'NOK',
    dateFormat: 'dd.MM.yyyy',
    timeFormat: '24h',
  });

  // Load organization settings into form
  useEffect(() => {
    if (organizationSettings) {
      setGeneralData({
        name: organizationSettings.name || '',
        locale: (organizationSettings.locale as Locale) || 'nb',
        timezone: (organizationSettings.timezone as Timezone) || 'Europe/Oslo',
        currency: (organizationSettings.currency as Currency) || 'NOK',
        dateFormat: (organizationSettings.dateFormat as DateFormat) || 'dd.MM.yyyy',
        timeFormat: (organizationSettings.timeFormat as TimeFormat) || '24h',
      });
    }
  }, [organizationSettings]);

  // Update single field
  const updateField = useCallback(
    <K extends keyof GeneralSettingsData>(field: K, value: GeneralSettingsData[K]) => {
      setGeneralData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // Update multiple fields at once
  const updateFields = useCallback((updates: Partial<GeneralSettingsData>) => {
    setGeneralData((prev) => ({ ...prev, ...updates }));
  }, []);

  // Reset form to original values
  const resetForm = useCallback(() => {
    if (organizationSettings) {
      setGeneralData({
        name: organizationSettings.name || '',
        locale: (organizationSettings.locale as Locale) || 'nb',
        timezone: (organizationSettings.timezone as Timezone) || 'Europe/Oslo',
        currency: (organizationSettings.currency as Currency) || 'NOK',
        dateFormat: (organizationSettings.dateFormat as DateFormat) || 'dd.MM.yyyy',
        timeFormat: (organizationSettings.timeFormat as TimeFormat) || '24h',
      });
    }
  }, [organizationSettings]);

  // Save general settings
  const saveGeneralSettings = useCallback(async () => {
    if (!organizationSettings) return;

    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updateSettingsMutation.mutateAsync({
        ...organizationSettings,
        name: generalData.name,
        locale: generalData.locale,
        timezone: generalData.timezone,
        currency: generalData.currency,
        dateFormat: generalData.dateFormat,
        timeFormat: generalData.timeFormat,
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
  }, [generalData, organizationSettings, updateSettingsMutation, onSaveSuccess, onSaveError]);

  // Check if form has changes
  const hasChanges = useCallback(() => {
    if (!organizationSettings) return false;
    return (
      generalData.name !== (organizationSettings.name || '') ||
      generalData.locale !== (organizationSettings.locale || 'nb') ||
      generalData.timezone !== (organizationSettings.timezone || 'Europe/Oslo') ||
      generalData.currency !== (organizationSettings.currency || 'NOK') ||
      generalData.dateFormat !== (organizationSettings.dateFormat || 'dd.MM.yyyy') ||
      generalData.timeFormat !== (organizationSettings.timeFormat || '24h')
    );
  }, [organizationSettings, generalData]);

  // Validate form data
  const isValid = useCallback(() => {
    return !!(
      generalData.name &&
      generalData.locale &&
      generalData.timezone &&
      generalData.currency &&
      generalData.dateFormat &&
      generalData.timeFormat
    );
  }, [generalData]);

  // Get locale display name
  const getLocaleDisplayName = useCallback((locale: Locale): string => {
    const localeNames: Record<Locale, string> = {
      nb: 'Norsk bokmål',
      nn: 'Norsk nynorsk',
      en: 'English',
    };
    return localeNames[locale];
  }, []);

  // Get timezone display name
  const getTimezoneDisplayName = useCallback((timezone: Timezone): string => {
    const timezoneNames: Record<Timezone, string> = {
      'Europe/Oslo': 'Europa/Oslo (CET)',
      'Europe/London': 'Europa/London (GMT)',
      'America/New_York': 'Amerika/New York (EST)',
    };
    return timezoneNames[timezone];
  }, []);

  // Get currency display name
  const getCurrencyDisplayName = useCallback((currency: Currency): string => {
    const currencyNames: Record<Currency, string> = {
      NOK: 'Norske kroner (NOK)',
      EUR: 'Euro (EUR)',
      USD: 'US Dollar (USD)',
    };
    return currencyNames[currency];
  }, []);

  // Get date format display example
  const getDateFormatExample = useCallback((format: DateFormat): string => {
    const examples: Record<DateFormat, string> = {
      'dd.MM.yyyy': '31.12.2024',
      'yyyy-MM-dd': '2024-12-31',
      'MM/dd/yyyy': '12/31/2024',
    };
    return examples[format];
  }, []);

  // Get time format display example
  const getTimeFormatExample = useCallback((format: TimeFormat): string => {
    const examples: Record<TimeFormat, string> = {
      '24h': '24-timers (13:00)',
      '12h': '12-timers (1:00 PM)',
    };
    return examples[format];
  }, []);

  return {
    // State
    generalData,
    isSaving,
    saveSuccess,
    isLoadingSettings,
    organizationSettings,

    // Actions
    updateField,
    updateFields,
    resetForm,
    saveGeneralSettings,

    // Computed
    hasChanges: hasChanges(),
    isValid: isValid(),

    // Helpers
    getLocaleDisplayName,
    getTimezoneDisplayName,
    getCurrencyDisplayName,
    getDateFormatExample,
    getTimeFormatExample,
  };
}
