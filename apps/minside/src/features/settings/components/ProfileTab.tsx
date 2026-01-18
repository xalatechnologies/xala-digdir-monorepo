/**
 * ProfileTab Component
 * Manages user profile information including avatar, personal details
 */

/* eslint-disable digdir/prefer-ds-components -- Hidden file input for avatar upload */

import { useRef, useState, useEffect } from 'react';
import {
import { useT } from '@xala/i18n';
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
} from '@xala/ds';
import {
  useCurrentUser,
  useUpdateCurrentUser,
  useUploadUserAvatar,
  type Address,
} from '@digilist/client-sdk';

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Queries
  const { data: currentUserData } = useCurrentUser();
  const t = useT();
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
    <Stack spacing={6}>
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
                <UserIcon style={{ fontSize: 'var(--ds-font-size-2xl)', color: 'var(--ds-color-neutral-text-subtle)' }} />
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
                disabled={isUploadingAvatar}
                type="button"
                aria-label={t('common.endre_profilbilde')}
              >
                <CameraIcon />
                {isUploadingAvatar ? 't('common.laster_opp')' : 'Endre bilde'}
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
            <FormField label={t('common.fullt_navn')} required>
              <Textfield
                value={profileData.name}
                onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                placeholder={t('common.ola_nordmann')}
                aria-label={t('common.fullt_navn')}
              />
            </FormField>

            <FormField label={t('common.epostadresse')} required>
              <Textfield
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="ola.nordmann@example.com"
                aria-label={t('common.epostadresse')}
              />
            </FormField>

            <FormField label="Telefonnummer">
              <Textfield
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+47 123 45 678"
                aria-label="Telefonnummer"
              />
            </FormField>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--ds-spacing-3)' }}>
              <FormField label={t('common.fodselsdato')}>
                <Textfield
                  type="date"
                  value={profileData.dateOfBirth}
                  onChange={(e) => setProfileData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  aria-label={t('common.fodselsdato')}
                />
              </FormField>

              <FormField label={t('common.fodselsnummer')}>
                <Textfield
                  value={profileData.nationalId}
                  onChange={(e) => setProfileData(prev => ({ ...prev, nationalId: e.target.value }))}
                  placeholder={t('common.11_siffer')}
                  maxLength={11}
                  aria-label={t('common.fodselsnummer')}
                />
              </FormField>
            </div>
          </Stack>

          <div style={{ paddingTop: 'var(--ds-spacing-4)', borderTop: '1px solid var(--ds-color-neutral-border-subtle)' }}>
            <Button onClick={handleSaveProfile} disabled={isSaving} type="button" aria-label={t('common.lagre_profilinnstillinger')}>
              <SaveIcon />
              {isSaving ? 't('common.lagrer')' : 'Lagre endringer'}
            </Button>
          </div>
        </Stack>
      </Card>
    </Stack>
  );
}
