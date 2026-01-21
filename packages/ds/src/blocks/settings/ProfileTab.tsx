/**
 * ProfileTab Block - Reusable DS Component
 *
 * Manages user profile information including avatar, personal details.
 * Domain-agnostic - receives all data and handlers via props.
 *
 * @example
 * ```tsx
 * // In app with SDK
 * import { useT } from '@xala/i18n';
 * import { useProfile, useAvatarUpload } from '@digilist/client-sdk';
 *
 * function MyProfileTab() {
 *   const t = useT();
 *   const { profile, updateProfile, isSaving } = useProfile();
 *   const { uploadAvatar, isUploading, preview } = useAvatarUpload();
 *
 *   return (
 *     <ProfileTab
 *       currentUser={currentUser}
 *       profileData={profile}
 *       avatarPreview={preview}
 *       isSaving={isSaving}
 *       isUploadingAvatar={isUploading}
 *       onProfileDataChange={updateProfile}
 *       onSaveProfile={handleSave}
 *       onAvatarChange={uploadAvatar}
 *       labels={{
 *         profilePicture: t('settings.profilePicture'),
 *         uploadDescription: t('settings.uploadDescription'),
 *         // ... other labels
 *       }}
 *     />
 *   );
 * }
 * ```
 */
import { useRef } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Textfield,
} from '@digdir/designsystemet-react';
import { Stack, FormField, SaveIcon, UserIcon, CameraIcon } from '../../primitives';

// =============================================================================
// Types
// =============================================================================

/**
 * Generic address interface - domain-agnostic
 */
export interface ProfileAddress {
  street?: string;
  postalCode?: string;
  city?: string;
  country?: string;
}

export interface ProfileData {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  nationalId: string;
  invoiceAddress: ProfileAddress;
  residenceAddress: ProfileAddress;
}

export interface ProfileTabLabels {
  profilePicture: string;
  uploadDescription: string;
  changeImage: string;
  uploading: string;
  fileTypeHint: string;
  personalInfo: string;
  personalInfoDescription: string;
  fullName: string;
  fullNamePlaceholder: string;
  email: string;
  emailPlaceholder: string;
  phone: string;
  phonePlaceholder: string;
  dateOfBirth: string;
  nationalId: string;
  nationalIdPlaceholder: string;
  saveChanges: string;
  saving: string;
  changeProfilePicture: string;
  saveProfileSettings: string;
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
  /** Labels for i18n */
  labels?: Partial<ProfileTabLabels>;
  'data-testid'?: string;
}

// =============================================================================
// Default Labels
// =============================================================================

const DEFAULT_LABELS: ProfileTabLabels = {
  profilePicture: 'Profilbilde',
  uploadDescription: 'Last opp et profilbilde som vises i systemet',
  changeImage: 'Endre bilde',
  uploading: 'Laster...',
  fileTypeHint: 'JPG, PNG eller GIF (maks 5MB)',
  personalInfo: 'Personlig informasjon',
  personalInfoDescription: 'Din grunnleggende kontaktinformasjon',
  fullName: 'Fullt navn',
  fullNamePlaceholder: 'Ola Nordmann',
  email: 'E-postadresse',
  emailPlaceholder: 'ola.nordmann@example.com',
  phone: 'Telefonnummer',
  phonePlaceholder: '+47 123 45 678',
  dateOfBirth: 'Fodselsdato',
  nationalId: 'Fodselsnummer',
  nationalIdPlaceholder: '11 siffer',
  saveChanges: 'Lagre endringer',
  saving: 'Lagrer...',
  changeProfilePicture: 'Endre profilbilde',
  saveProfileSettings: 'Lagre profilinnstillinger',
};

// =============================================================================
// Component
// =============================================================================

export function ProfileTab({
  currentUser,
  profileData,
  avatarPreview,
  isSaving = false,
  isUploadingAvatar = false,
  onProfileDataChange,
  onSaveProfile,
  onAvatarChange,
  labels: customLabels,
  'data-testid': testId = 'profile-tab',
}: ProfileTabProps) {
  const labels = { ...DEFAULT_LABELS, ...customLabels };
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onAvatarChange(file);
    }
  };

  return (
    <Stack spacing="var(--ds-spacing-6)" data-testid={testId}>
      {/* Avatar Section */}
      <Card>
        <Stack spacing="var(--ds-spacing-5)">
          <div>
            <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
              {labels.profilePicture}
            </Heading>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              {labels.uploadDescription}
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

            <Stack spacing="var(--ds-spacing-2)">
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
                aria-label={labels.changeProfilePicture}
              >
                <CameraIcon />
                {isUploadingAvatar ? labels.uploading : labels.changeImage}
              </Button>
              <Paragraph data-size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                {labels.fileTypeHint}
              </Paragraph>
            </Stack>
          </div>
        </Stack>
      </Card>

      {/* Personal Information */}
      <Card>
        <Stack spacing="var(--ds-spacing-5)">
          <div>
            <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
              {labels.personalInfo}
            </Heading>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              {labels.personalInfoDescription}
            </Paragraph>
          </div>

          <Stack spacing="var(--ds-spacing-4)">
            <FormField label={labels.fullName} required>
              <Textfield
                value={profileData.name}
                onChange={(e) => onProfileDataChange({ name: e.target.value })}
                placeholder={labels.fullNamePlaceholder}
                aria-label={labels.fullName}
              />
            </FormField>

            <FormField label={labels.email} required>
              <Textfield
                type="email"
                value={profileData.email}
                onChange={(e) => onProfileDataChange({ email: e.target.value })}
                placeholder={labels.emailPlaceholder}
                aria-label={labels.email}
              />
            </FormField>

            <FormField label={labels.phone}>
              <Textfield
                type="tel"
                value={profileData.phone}
                onChange={(e) => onProfileDataChange({ phone: e.target.value })}
                placeholder={labels.phonePlaceholder}
                aria-label={labels.phone}
              />
            </FormField>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--ds-spacing-3)' }}>
              <FormField label={labels.dateOfBirth}>
                <Textfield
                  type="date"
                  value={profileData.dateOfBirth}
                  onChange={(e) => onProfileDataChange({ dateOfBirth: e.target.value })}
                  aria-label={labels.dateOfBirth}
                />
              </FormField>

              <FormField label={labels.nationalId}>
                <Textfield
                  value={profileData.nationalId}
                  onChange={(e) => onProfileDataChange({ nationalId: e.target.value })}
                  placeholder={labels.nationalIdPlaceholder}
                  maxLength={11}
                  aria-label={labels.nationalId}
                />
              </FormField>
            </div>
          </Stack>

          <div style={{ paddingTop: 'var(--ds-spacing-4)', borderTop: '1px solid var(--ds-color-neutral-border-subtle)' }}>
            <Button onClick={onSaveProfile} disabled={isSaving} type="button" aria-label={labels.saveProfileSettings}>
              <SaveIcon />
              {isSaving ? labels.saving : labels.saveChanges}
            </Button>
          </div>
        </Stack>
      </Card>
    </Stack>
  );
}
