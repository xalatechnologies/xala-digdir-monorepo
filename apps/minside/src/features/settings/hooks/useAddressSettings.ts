/**
 * Address Settings Hook
 * Manages address state for invoice and residence addresses
 */

import { useState, useEffect, useCallback } from 'react';
import {
  useCurrentUser,
  useUpdateCurrentUser,
  type Address,
} from '@digilist/client-sdk';

interface AddressFormData {
  invoiceAddress: Address;
  residenceAddress: Address;
}

interface UseAddressSettingsOptions {
  onSaveSuccess?: () => void;
  onSaveError?: (error: unknown) => void;
}

export function useAddressSettings(options: UseAddressSettingsOptions = {}) {
  const { onSaveSuccess, onSaveError } = options;

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Queries
  const { data: currentUserData, isLoading: isLoadingUser } = useCurrentUser();
  const currentUser = currentUserData?.data;

  // Mutations
  const updateProfileMutation = useUpdateCurrentUser();

  // Address form state
  const [addressData, setAddressData] = useState<AddressFormData>({
    invoiceAddress: {
      street: '',
      city: '',
      postalCode: '',
      country: 'Norge',
    },
    residenceAddress: {
      street: '',
      city: '',
      postalCode: '',
      country: 'Norge',
    },
  });

  // Load current user addresses into form
  useEffect(() => {
    if (currentUser) {
      setAddressData({
        invoiceAddress: currentUser.invoiceAddress || {
          street: '',
          city: '',
          postalCode: '',
          country: 'Norge',
        },
        residenceAddress: currentUser.residenceAddress || {
          street: '',
          city: '',
          postalCode: '',
          country: 'Norge',
        },
      });
    }
  }, [currentUser]);

  // Update specific address field
  const updateAddressField = useCallback(
    (addressType: 'invoiceAddress' | 'residenceAddress', field: keyof Address, value: string) => {
      setAddressData((prev) => ({
        ...prev,
        [addressType]: {
          ...prev[addressType],
          [field]: value,
        },
      }));
    },
    []
  );

  // Update entire address
  const updateAddress = useCallback(
    (addressType: 'invoiceAddress' | 'residenceAddress', address: Address) => {
      setAddressData((prev) => ({
        ...prev,
        [addressType]: address,
      }));
    },
    []
  );

  // Copy residence address to invoice address
  const copyResidenceToInvoice = useCallback(() => {
    setAddressData((prev) => ({
      ...prev,
      invoiceAddress: { ...prev.residenceAddress },
    }));
  }, []);

  // Save address data
  const saveAddresses = useCallback(async () => {
    if (!currentUser) return;

    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updateProfileMutation.mutateAsync({
        ...currentUser,
        invoiceAddress: addressData.invoiceAddress,
        residenceAddress: addressData.residenceAddress,
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
  }, [addressData, currentUser, updateProfileMutation, onSaveSuccess, onSaveError]);

  // Check if addresses have changes
  const hasChanges = useCallback(() => {
    if (!currentUser) return false;

    const invoiceChanged =
      addressData.invoiceAddress.street !== (currentUser.invoiceAddress?.street || '') ||
      addressData.invoiceAddress.city !== (currentUser.invoiceAddress?.city || '') ||
      addressData.invoiceAddress.postalCode !== (currentUser.invoiceAddress?.postalCode || '') ||
      addressData.invoiceAddress.country !== (currentUser.invoiceAddress?.country || 'Norge');

    const residenceChanged =
      addressData.residenceAddress.street !== (currentUser.residenceAddress?.street || '') ||
      addressData.residenceAddress.city !== (currentUser.residenceAddress?.city || '') ||
      addressData.residenceAddress.postalCode !== (currentUser.residenceAddress?.postalCode || '') ||
      addressData.residenceAddress.country !== (currentUser.residenceAddress?.country || 'Norge');

    return invoiceChanged || residenceChanged;
  }, [currentUser, addressData]);

  // Validate address fields
  const validateAddress = useCallback((address: Address): boolean => {
    return !!(
      address.street &&
      address.city &&
      address.postalCode &&
      address.country &&
      address.postalCode.length === 4 &&
      /^\d{4}$/.test(address.postalCode)
    );
  }, []);

  // Check if form is valid
  const isValid = useCallback(() => {
    return validateAddress(addressData.invoiceAddress) && validateAddress(addressData.residenceAddress);
  }, [addressData, validateAddress]);

  return {
    // State
    addressData,
    invoiceAddress: addressData.invoiceAddress,
    residenceAddress: addressData.residenceAddress,
    isSaving,
    saveSuccess,
    isLoadingUser,
    currentUser,

    // Actions
    updateAddressField,
    updateAddress,
    copyResidenceToInvoice,
    saveAddresses,
    validateAddress,

    // Computed
    hasChanges: hasChanges(),
    isValid: isValid(),
  };
}
