/**
 * ProfileTab Component
 * Manages user profile information including avatar, personal details
 */

/* eslint-disable digdir/prefer-ds-components, digdir/require-interactive-labels -- Complex settings form */

import { useRef, useState, useEffect } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Stack,
  FormField,
  Textfield,
  SaveIcon,
  UserIcon,
  CameraIcon,
} from '@xalatechnologies/platform/ui';
import {
  useCurrentUser,
  useUpdateCurrentUser,
  useUploadUserAvatar,
  type Address,
} from '@digilist/client-sdk';
import { useT } from '@xala/i18n';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  nationalId: string;
  invoiceAddress: Address;
  residenceAddress: Address;
}

export function ProfileTab() {
  // Translation function available for future localization
  const _t = useT(); // eslint-disable-line @typescript-eslint/no-unused-vars
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

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

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  return (
    <Stack spacing={4}>
      {/* Avatar Section */}
      <Card>
        <Stack spacing={5}>
          <div>
            <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
              Profilbilde
            </Heading>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              Last opp et profilbilde som vises i systemet
            </Paragraph>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-4)' }}>
            <div style={{
              position: 'relative',
              width: '120px',
              height: '120px',
              borderRadius: 'var(--ds-border-radius-full)',
              overflow: 'hidden',
              backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <UserIcon style={{ fontSize: 'var(--ds-font-size-heading-lg)', color: 'var(--ds-color-neutral-text-subtle)' }} />
              )}
            </div>

            <Stack spacing={2}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
              <Button
                variant="secondary"
                data-size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar} type="button"
              >
                <CameraIcon />
                {isUploadingAvatar ? 'Laster opp...' : 'Endre bilde'}
              </Button>
              <Paragraph data-size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                JPG, PNG eller GIF (maks 5MB)
              </Paragraph>
            </Stack>
          </div>
        </Stack>
      </Card>

      {/* Personal Information */}
      <Card>
        <Stack spacing={5}>
          <div>
            <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
              Personlig informasjon
            </Heading>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              Din grunnleggende kontaktinformasjon
            </Paragraph>
          </div>

          <Stack spacing={4}>
            <FormField label="Fullt navn" required>
              <Textfield aria-label="Fullt navn"
                value={profileData.name}
                onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ola Nordmann"
              />
            </FormField>

            <FormField label="E-postadresse" required>
              <Textfield aria-label="E-postadresse"
                value={profileData.email}
                onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="ola.nordmann@example.com"
              />
            </FormField>

            <FormField label="Telefonnummer">
              <Textfield aria-label="Telefonnummer"
                value={profileData.phone}
                onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+47 123 45 678"
              />
            </FormField>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--ds-spacing-3)' }}>
              <FormField label="Fødselsdato">
                <Textfield aria-label="Fødselsdato"
                  type="date"
                  value={profileData.dateOfBirth}
                  onChange={(e) => setProfileData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                />
              </FormField>

              <FormField label="Fødselsnummer">
                <Textfield aria-label="Fødselsnummer"
                  value={profileData.nationalId}
                  onChange={(e) => setProfileData(prev => ({ ...prev, nationalId: e.target.value }))}
                  placeholder="11 siffer"
                  maxLength={11}
                />
              </FormField>
            </div>
          </Stack>

          <div style={{ paddingTop: 'var(--ds-spacing-3)', borderTop: '1px solid var(--ds-color-neutral-border-subtle)' }}>
            <Button onClick={handleSaveProfile} disabled={isSaving} type="button">
              <SaveIcon />
              {isSaving ? 'Lagrer...' : 'Lagre endringer'}
            </Button>
          </div>
        </Stack>
      </Card>
    </Stack>
  );
}
