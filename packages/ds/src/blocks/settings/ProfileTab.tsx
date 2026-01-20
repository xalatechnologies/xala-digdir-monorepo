/**
 * ProfileTab Block - Reusable DS Component
 * 
 * Manages user profile information including avatar, personal details
 */
import { useRef } from 'react';
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
} from '@digdir/designsystemet-react';
import { useT } from '@xala/i18n';
import type { Address } from '@digilist/client-sdk/types';

export interface ProfileData {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  nationalId: string;
  invoiceAddress: Address;
  residenceAddress: Address;
}

export interface ProfileTabProps {
  currentUser?: {
    id: string;
    avatar?: string;
  } | null;
  profileData: ProfileData;
  avatarPreview?: string | null;
  isSaving?: boolean;
  isUploadingAvatar?: boolean;
  onProfileDataChange: (data: Partial<ProfileData>) => void;
  onSaveProfile: () => void;
  onAvatarChange: (file: File) => void;
  'data-testid'?: string;
}

export function ProfileTab({
  currentUser,
  profileData,
  avatarPreview,
  isSaving = false,
  isUploadingAvatar = false,
  onProfileDataChange,
  onSaveProfile,
  onAvatarChange,
  'data-testid': testId = 'profile-tab',
}: ProfileTabProps) {
  const t = useT();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onAvatarChange(file);
    }
  };

  return (
    <Stack spacing={6} data-testid={testId}>
      {/* Avatar Section */}
      <Card>
        <Stack spacing={5}>
          <div>
            <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
              {t('common.profilbilde') || 'Profilbilde'}
            </Heading>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              {t('common.last.opp.profilbilde') || 'Last opp et profilbilde som vises i systemet'}
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
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <Button
                variant="secondary"
                data-size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                type="button"
                aria-label={t('common.endre_profilbilde') || 'Endre profilbilde'}
              >
                <CameraIcon />
                {isUploadingAvatar ? t('state.loading') || 'Laster...' : t('common.endre.bilde') || 'Endre bilde'}
              </Button>
              <Paragraph data-size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                {t('common.jpg.png.eller.gif.maks.5mb') || 'JPG, PNG eller GIF (maks 5MB)'}
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
              {t('common.personlig.informasjon') || 'Personlig informasjon'}
            </Heading>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              {t('common.din.grunnleggende.kontaktinformasjon') || 'Din grunnleggende kontaktinformasjon'}
            </Paragraph>
          </div>

          <Stack spacing={4}>
            <FormField label={t('common.fullt_navn') || 'Fullt navn'} required>
              <Textfield
                value={profileData.name}
                onChange={(e) => onProfileDataChange({ name: e.target.value })}
                placeholder={t('common.ola_nordmann') || 'Ola Nordmann'}
                aria-label={t('common.fullt_navn') || 'Fullt navn'}
              />
            </FormField>

            <FormField label={t('common.epostadresse') || 'E-postadresse'} required>
              <Textfield
                type="email"
                value={profileData.email}
                onChange={(e) => onProfileDataChange({ email: e.target.value })}
                placeholder={t('settings.placeholder.olanordmannexamplecom') || 'ola.nordmann@example.com'}
                aria-label={t('common.epostadresse') || 'E-postadresse'}
              />
            </FormField>

            <FormField label={t('common.telefonnummer') || 'Telefonnummer'}>
              <Textfield
                type="tel"
                value={profileData.phone}
                onChange={(e) => onProfileDataChange({ phone: e.target.value })}
                placeholder={t('settings.placeholder.4712345678') || '+47 123 45 678'}
                aria-label={t('common.telefonnummer') || 'Telefonnummer'}
              />
            </FormField>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--ds-spacing-3)' }}>
              <FormField label={t('common.fodselsdato') || 'Fødselsdato'}>
                <Textfield
                  type="date"
                  value={profileData.dateOfBirth}
                  onChange={(e) => onProfileDataChange({ dateOfBirth: e.target.value })}
                  aria-label={t('common.fodselsdato') || 'Fødselsdato'}
                />
              </FormField>

              <FormField label={t('common.fodselsnummer') || 'Fødselsnummer'}>
                <Textfield
                  value={profileData.nationalId}
                  onChange={(e) => onProfileDataChange({ nationalId: e.target.value })}
                  placeholder={t('common.11_siffer') || '11 siffer'}
                  maxLength={11}
                  aria-label={t('common.fodselsnummer') || 'Fødselsnummer'}
                />
              </FormField>
            </div>
          </Stack>

          <div style={{ paddingTop: 'var(--ds-spacing-4)', borderTop: '1px solid var(--ds-color-neutral-border-subtle)' }}>
            <Button onClick={onSaveProfile} disabled={isSaving} type="button" aria-label={t('common.lagre_profilinnstillinger') || 'Lagre profilinnstillinger'}>
              <SaveIcon />
              {isSaving ? t('state.saving') || 'Lagrer...' : t('common.lagre_endringer') || 'Lagre endringer'}
            </Button>
          </div>
        </Stack>
      </Card>
    </Stack>
  );
}
