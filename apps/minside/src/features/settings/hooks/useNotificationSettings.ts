/**
 * Notification Settings Hook
 * Manages notification configuration: email, SMS, push, and automatic notification settings
 */

import { useState, useEffect, useCallback } from 'react';
import {
  useTenantSettings,
  useUpdateTenantSettings,
} from '@digilist/client-sdk';

export interface NotificationSettingsData {
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  bookingConfirmation: boolean;
  bookingReminder: boolean;
  reminderHoursBefore: number;
}

interface UseNotificationSettingsOptions {
  onSaveSuccess?: () => void;
  onSaveError?: (error: unknown) => void;
}

export function useNotificationSettings(options: UseNotificationSettingsOptions = {}) {
  const { onSaveSuccess, onSaveError } = options;

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Queries
  const { data: settingsData, isLoading: isLoadingSettings } = useTenantSettings();
  const tenantSettings = settingsData?.data;

  // Mutations
  const updateSettingsMutation = useUpdateTenantSettings();

  // Notification settings form state
  const [notificationData, setNotificationData] = useState<NotificationSettingsData>({
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
    bookingConfirmation: true,
    bookingReminder: true,
    reminderHoursBefore: 24,
  });

  // Load tenant settings into form
  useEffect(() => {
    if (tenantSettings?.notifications) {
      setNotificationData({
        emailEnabled: tenantSettings.notifications.emailEnabled ?? true,
        smsEnabled: tenantSettings.notifications.smsEnabled ?? false,
        pushEnabled: tenantSettings.notifications.pushEnabled ?? true,
        bookingConfirmation: tenantSettings.notifications.bookingConfirmation ?? true,
        bookingReminder: tenantSettings.notifications.bookingReminder ?? true,
        reminderHoursBefore: tenantSettings.notifications.reminderHoursBefore ?? 24,
      });
    }
  }, [tenantSettings]);

  // Update single field
  const updateField = useCallback(
    <K extends keyof NotificationSettingsData>(field: K, value: NotificationSettingsData[K]) => {
      setNotificationData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // Update multiple fields at once
  const updateFields = useCallback((updates: Partial<NotificationSettingsData>) => {
    setNotificationData((prev) => ({ ...prev, ...updates }));
  }, []);

  // Reset form to original values
  const resetForm = useCallback(() => {
    if (tenantSettings?.notifications) {
      setNotificationData({
        emailEnabled: tenantSettings.notifications.emailEnabled ?? true,
        smsEnabled: tenantSettings.notifications.smsEnabled ?? false,
        pushEnabled: tenantSettings.notifications.pushEnabled ?? true,
        bookingConfirmation: tenantSettings.notifications.bookingConfirmation ?? true,
        bookingReminder: tenantSettings.notifications.bookingReminder ?? true,
        reminderHoursBefore: tenantSettings.notifications.reminderHoursBefore ?? 24,
      });
    }
  }, [tenantSettings]);

  // Save notification settings
  const saveNotificationSettings = useCallback(async () => {
    if (!tenantSettings) return;

    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updateSettingsMutation.mutateAsync({
        ...tenantSettings,
        notifications: notificationData,
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
  }, [notificationData, tenantSettings, updateSettingsMutation, onSaveSuccess, onSaveError]);

  // Check if form has changes
  const hasChanges = useCallback(() => {
    if (!tenantSettings?.notifications) return false;
    const original = tenantSettings.notifications;
    return (
      notificationData.emailEnabled !== (original.emailEnabled ?? true) ||
      notificationData.smsEnabled !== (original.smsEnabled ?? false) ||
      notificationData.pushEnabled !== (original.pushEnabled ?? true) ||
      notificationData.bookingConfirmation !== (original.bookingConfirmation ?? true) ||
      notificationData.bookingReminder !== (original.bookingReminder ?? true) ||
      notificationData.reminderHoursBefore !== (original.reminderHoursBefore ?? 24)
    );
  }, [tenantSettings, notificationData]);

  // Validate form data
  const isValid = useCallback(() => {
    return notificationData.reminderHoursBefore >= 1;
  }, [notificationData]);

  // Computed: check if any notification channel is enabled
  const hasEnabledChannel = useCallback(() => {
    return (
      notificationData.emailEnabled ||
      notificationData.smsEnabled ||
      notificationData.pushEnabled
    );
  }, [notificationData.emailEnabled, notificationData.smsEnabled, notificationData.pushEnabled]);

  // Computed: should show reminder hours field
  const shouldShowReminderHours = useCallback(() => {
    return notificationData.bookingReminder;
  }, [notificationData.bookingReminder]);

  // Computed: count enabled notification types
  const enabledChannelCount = useCallback(() => {
    let count = 0;
    if (notificationData.emailEnabled) count++;
    if (notificationData.smsEnabled) count++;
    if (notificationData.pushEnabled) count++;
    return count;
  }, [notificationData.emailEnabled, notificationData.smsEnabled, notificationData.pushEnabled]);

  return {
    // State
    notificationData,
    isSaving,
    saveSuccess,
    isLoadingSettings,
    tenantSettings,

    // Actions
    updateField,
    updateFields,
    resetForm,
    saveNotificationSettings,

    // Computed
    hasChanges: hasChanges(),
    isValid: isValid(),
    hasEnabledChannel: hasEnabledChannel(),
    shouldShowReminderHours: shouldShowReminderHours(),
    enabledChannelCount: enabledChannelCount(),
  };
}
