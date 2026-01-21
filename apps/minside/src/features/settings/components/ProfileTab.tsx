/**
 * ProfileTab Wrapper
 * Thin wrapper that wires SDK hooks to DS ProfileTab props
 */
import { useState, useEffect } from 'react';
import { ProfileTab as DSProfileTab, type ProfileData } from '@xalatechnologies/platform/ui';
import {
  useCurrentUser,
  useUpdateCurrentUser,
  useUploadUserAvatar,
  type Address,
} from '@digilist/client-sdk';

export function ProfileTab() {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Queries
  const { data: currentUserData } = useCurrentUser();
  const currentUser = currentUserData?.data;

  // Mutations
  const updateProfileMutation = useUpdateCurrentUser();
  const uploadAvatarMutation = useUploadUserAvatar();

  const [profileData, setProfileData] = useState<ProfileData>({
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
        invoiceAddress: currentUser.invoiceAddress || { street: '', city: '', postalCode: '', country: 'Norge' },
        residenceAddress: currentUser.residenceAddress || { street: '', city: '', postalCode: '', country: 'Norge' },
      });
      if (currentUser.avatar) {
        setAvatarPreview(currentUser.avatar);
      }
    }
  }, [currentUser]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateProfileMutation.mutateAsync(profileData);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async (file: File) => {
    if (!currentUser) return;

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
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  return (
    <DSProfileTab
      currentUser={currentUser}
      profileData={profileData}
      avatarPreview={avatarPreview}
      isSaving={isSaving}
      isUploadingAvatar={isUploadingAvatar}
      onProfileDataChange={(partial) => setProfileData(prev => ({ ...prev, ...partial }))}
      onSaveProfile={handleSaveProfile}
      onAvatarChange={handleAvatarChange}
    />
  );
}
