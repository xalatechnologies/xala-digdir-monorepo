/**
 * Booking Settings Hook
 * Manages booking configuration: auto-confirm, approval, cancellation, and time settings
 */

import { useState, useEffect, useCallback } from 'react';
import {
  useTenantSettings,
  useUpdateTenantSettings,
} from '@digilist/client-sdk';

export interface BookingSettingsData {
  autoConfirm: boolean;
  requireApproval: boolean;
  allowCancellation: boolean;
  cancellationDeadlineHours: number;
  maxAdvanceBookingDays: number;
  minAdvanceBookingHours: number;
  bufferTimeMinutes: number;
}

interface UseBookingSettingsOptions {
  onSaveSuccess?: () => void;
  onSaveError?: (error: unknown) => void;
}

export function useBookingSettings(options: UseBookingSettingsOptions = {}) {
  const { onSaveSuccess, onSaveError } = options;

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Queries
  const { data: settingsData, isLoading: isLoadingSettings } = useTenantSettings();
  const tenantSettings = settingsData?.data;

  // Mutations
  const updateSettingsMutation = useUpdateTenantSettings();

  // Booking settings form state
  const [bookingData, setBookingData] = useState<BookingSettingsData>({
    autoConfirm: false,
    requireApproval: true,
    allowCancellation: true,
    cancellationDeadlineHours: 24,
    maxAdvanceBookingDays: 90,
    minAdvanceBookingHours: 2,
    bufferTimeMinutes: 0,
  });

  // Load tenant settings into form
  useEffect(() => {
    if (tenantSettings?.booking) {
      setBookingData({
        autoConfirm: tenantSettings.booking.autoConfirm ?? false,
        requireApproval: tenantSettings.booking.requireApproval ?? true,
        allowCancellation: tenantSettings.booking.allowCancellation ?? true,
        cancellationDeadlineHours: tenantSettings.booking.cancellationDeadlineHours ?? 24,
        maxAdvanceBookingDays: tenantSettings.booking.maxAdvanceBookingDays ?? 90,
        minAdvanceBookingHours: tenantSettings.booking.minAdvanceBookingHours ?? 2,
        bufferTimeMinutes: tenantSettings.booking.bufferTimeMinutes ?? 0,
      });
    }
  }, [tenantSettings]);

  // Update single field
  const updateField = useCallback(
    <K extends keyof BookingSettingsData>(field: K, value: BookingSettingsData[K]) => {
      setBookingData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // Update multiple fields at once
  const updateFields = useCallback((updates: Partial<BookingSettingsData>) => {
    setBookingData((prev) => ({ ...prev, ...updates }));
  }, []);

  // Reset form to original values
  const resetForm = useCallback(() => {
    if (tenantSettings?.booking) {
      setBookingData({
        autoConfirm: tenantSettings.booking.autoConfirm ?? false,
        requireApproval: tenantSettings.booking.requireApproval ?? true,
        allowCancellation: tenantSettings.booking.allowCancellation ?? true,
        cancellationDeadlineHours: tenantSettings.booking.cancellationDeadlineHours ?? 24,
        maxAdvanceBookingDays: tenantSettings.booking.maxAdvanceBookingDays ?? 90,
        minAdvanceBookingHours: tenantSettings.booking.minAdvanceBookingHours ?? 2,
        bufferTimeMinutes: tenantSettings.booking.bufferTimeMinutes ?? 0,
      });
    }
  }, [tenantSettings]);

  // Save booking settings
  const saveBookingSettings = useCallback(async () => {
    if (!tenantSettings) return;

    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updateSettingsMutation.mutateAsync({
        ...tenantSettings,
        booking: bookingData,
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
  }, [bookingData, tenantSettings, updateSettingsMutation, onSaveSuccess, onSaveError]);

  // Check if form has changes
  const hasChanges = useCallback(() => {
    if (!tenantSettings?.booking) return false;
    const original = tenantSettings.booking;
    return (
      bookingData.autoConfirm !== (original.autoConfirm ?? false) ||
      bookingData.requireApproval !== (original.requireApproval ?? true) ||
      bookingData.allowCancellation !== (original.allowCancellation ?? true) ||
      bookingData.cancellationDeadlineHours !== (original.cancellationDeadlineHours ?? 24) ||
      bookingData.maxAdvanceBookingDays !== (original.maxAdvanceBookingDays ?? 90) ||
      bookingData.minAdvanceBookingHours !== (original.minAdvanceBookingHours ?? 2) ||
      bookingData.bufferTimeMinutes !== (original.bufferTimeMinutes ?? 0)
    );
  }, [tenantSettings, bookingData]);

  // Validate form data
  const isValid = useCallback(() => {
    return (
      bookingData.cancellationDeadlineHours >= 0 &&
      bookingData.maxAdvanceBookingDays >= 1 &&
      bookingData.minAdvanceBookingHours >= 0 &&
      bookingData.bufferTimeMinutes >= 0
    );
  }, [bookingData]);

  // Computed: should show approval field
  const shouldShowApprovalField = useCallback(() => {
    return !bookingData.autoConfirm;
  }, [bookingData.autoConfirm]);

  // Computed: should show cancellation deadline field
  const shouldShowCancellationDeadline = useCallback(() => {
    return bookingData.allowCancellation;
  }, [bookingData.allowCancellation]);

  return {
    // State
    bookingData,
    isSaving,
    saveSuccess,
    isLoadingSettings,
    tenantSettings,

    // Actions
    updateField,
    updateFields,
    resetForm,
    saveBookingSettings,

    // Computed
    hasChanges: hasChanges(),
    isValid: isValid(),
    shouldShowApprovalField: shouldShowApprovalField(),
    shouldShowCancellationDeadline: shouldShowCancellationDeadline(),
  };
}
