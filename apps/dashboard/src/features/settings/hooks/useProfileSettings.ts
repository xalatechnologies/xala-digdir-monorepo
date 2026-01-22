/**
 * Profile Settings Hook
 * Manages profile data state, avatar upload, and save functionality
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  useCurrentUser,
  useUpdateCurrentUser,
  useUploadUserAvatar,
  type Address,
} from '@digilist/client-sdk';

interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  nationalId: string;
  invoiceAddress: Address;
  residenceAddress: Address;
}

interface UseProfileSettingsOptions {
  onSaveSuccess?: () => void;
  onSaveError?: (error: unknown) => void;
}

export function useProfileSettings(options: UseProfileSettingsOptions = {}) {
  const { onSaveSuccess, onSaveError } = options;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Queries
  const { data: currentUserData, isLoading: isLoadingUser } = useCurrentUser();
  const currentUser = currentUserData?.data;

  // Mutations
  const updateProfileMutation = useUpdateCurrentUser();
  const uploadAvatarMutation = useUploadUserAvatar();

  // Profile form state
  const [profileData, setProfileData] = useState<ProfileFormData>({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    nationalId: '',
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

  // Load current user into profile form
  useEffect(() => {
    if (currentUser) {
      setProfileData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        dateOfBirth: currentUser.dateOfBirth || '',
        nationalId: currentUser.nationalId || '',
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
      if (currentUser.avatar) {
        setAvatarPreview(currentUser.avatar);
      }
    }
  }, [currentUser]);

  // Update profile data field
  const updateField = useCallback(
    <K extends keyof ProfileFormData>(field: K, value: ProfileFormData[K]) => {
      setProfileData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // Update nested address field
  const updateAddressField = useCallback(
    (addressType: 'invoiceAddress' | 'residenceAddress', field: keyof Address, value: string) => {
      setProfileData((prev) => ({
        ...prev,
        [addressType]: {
          ...prev[addressType],
          [field]: value,
        },
      }));
    },
    []
  );

  // Copy residence address to invoice address
  const copyResidenceToInvoice = useCallback(() => {
    setProfileData((prev) => ({
      ...prev,
      invoiceAddress: { ...prev.residenceAddress },
    }));
  }, []);

  // Handle avatar file change
  const handleAvatarChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !currentUser) return;

      // Show preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload avatar
      setIsUploadingAvatar(true);
      try {
        await uploadAvatarMutation.mutateAsync({
          id: currentUser.id,
          file,
          options: { compress: true },
        });
      } catch (error) {
        if (onSaveError) {
          onSaveError(error);
        }
      } finally {
        setIsUploadingAvatar(false);
      }
    },
    [currentUser, uploadAvatarMutation, onSaveError]
  );

  // Trigger file input click
  const triggerAvatarUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Save profile data
  const saveProfile = useCallback(async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updateProfileMutation.mutateAsync(profileData);
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
  }, [profileData, updateProfileMutation, onSaveSuccess, onSaveError]);

  // Check if form has changes
  const hasChanges = useCallback(() => {
    if (!currentUser) return false;
    return (
      profileData.name !== (currentUser.name || '') ||
      profileData.email !== (currentUser.email || '') ||
      profileData.phone !== (currentUser.phone || '') ||
      profileData.dateOfBirth !== (currentUser.dateOfBirth || '') ||
      profileData.nationalId !== (currentUser.nationalId || '')
    );
  }, [currentUser, profileData]);

  return {
    // State
    profileData,
    avatarPreview,
    isSaving,
    saveSuccess,
    isUploadingAvatar,
    isLoadingUser,

    // Refs
    fileInputRef,

    // Actions
    updateField,
    updateAddressField,
    copyResidenceToInvoice,
    handleAvatarChange,
    triggerAvatarUpload,
    saveProfile,
    hasChanges,
  };
}
