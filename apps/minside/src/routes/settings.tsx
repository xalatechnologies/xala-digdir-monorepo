/**
 * Settings Page - User Profile Management
 * Comprehensive tabbed settings for end users
 */

import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Spinner,
  Tabs,
  Stack,
  FormField,
  Textfield,
  Select,
  Switch,
  Alert,
  SaveIcon,
  CheckCircleIcon,
  UserIcon,
  CameraIcon,
  DownloadIcon,
  TrashIcon,
  ShieldIcon,
  BellIcon,
  SettingsIcon,
  MapPinIcon,
  HomeIcon,
} from '@xala/ds';
import {
  useCurrentUser,
  useUpdateCurrentUser,
  useUploadUserAvatar,
  useExportData,
  useDeleteAccount,
  useConsents,
  useUpdateConsents,
  type Address,
} from '@digilist/client-sdk';
import { useLocale, useT } from '@xala/i18n';
import { useAuth } from '../hooks/useAuth';

export function SettingsPage() {
  const t = useT();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { locale, setLocale } = useLocale();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('profile');

  // Queries
  const { data: currentUserData, isLoading: isLoadingUser } = useCurrentUser();
  const currentUser = currentUserData?.data;

  const { data: consentsData } = useConsents();
  const consents = consentsData?.data;

  // Mutations
  const updateProfileMutation = useUpdateCurrentUser();
  const uploadAvatarMutation = useUploadUserAvatar();
  const exportDataMutation = useExportData();
  const deleteAccountMutation = useDeleteAccount();
  const updateConsentsMutation = useUpdateConsents();

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    nationalId: '',
    invoiceAddress: {
      street: '',
      city: '',
      postalCode: '',
      country: t('countries.norway'),
    } as Address,
    residenceAddress: {
      street: '',
      city: '',
      postalCode: '',
      country: t('countries.norway'),
    } as Address,
  });

  const [consentSettings, setConsentSettings] = useState({
    marketing: false,
    analytics: false,
    thirdPartySharing: false,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Load current user into profile form
  useState(() => {
    if (currentUser) {
      setProfileData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        dateOfBirth: currentUser.dateOfBirth || '',
        nationalId: currentUser.nationalId || '',
        invoiceAddress: currentUser.invoiceAddress || { street: '', city: '', postalCode: '', country: t('countries.norway') },
        residenceAddress: currentUser.residenceAddress || { street: '', city: '', postalCode: '', country: t('countries.norway') },
      });
      if (currentUser.avatar) {
        setAvatarPreview(currentUser.avatar);
      }
    }
  });

  // Load consents
  useState(() => {
    if (consents) {
      setConsentSettings({
        marketing: consents.marketing || false,
        analytics: consents.analytics || false,
        thirdPartySharing: consents.thirdPartySharing || false,
      });
    }
  });

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updateProfileMutation.mutateAsync(profileData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save profile:', error);
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
    } catch (error) {
      console.error('Failed to upload avatar:', error);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleCopyResidenceToInvoice = () => {
    setProfileData(prev => ({
      ...prev,
      invoiceAddress: { ...prev.residenceAddress },
    }));
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const result = await exportDataMutation.mutateAsync();
      // Create download link
      const dataStr = JSON.stringify(result.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mine-data-${new Date().toISOString()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm(t('privacy.deleteConfirm'))) {
      try {
        await deleteAccountMutation.mutateAsync();
        logout();
        navigate('/');
      } catch (error) {
        console.error('Failed to delete account:', error);
      }
    }
  };

  const handleUpdateConsents = async (field: keyof typeof consentSettings, value: boolean) => {
    const newConsents = { ...consentSettings, [field]: value };
    setConsentSettings(newConsents);
    try {
      await updateConsentsMutation.mutateAsync(newConsents);
    } catch (error) {
      console.error('Failed to update consents:', error);
    }
  };

  if (isLoadingUser) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
        <Spinner data-size="lg" aria-label={t('common.loading')} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-5)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Heading level={1} data-size="lg" style={{ margin: 0 }}>
            {t('settings.title')}
          </Heading>
          <Paragraph
            data-size="sm"
            style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-1)', marginBottom: 0 }}
          >
            {t('settings.subtitle')}
          </Paragraph>
        </div>
        {saveSuccess && (
          <Alert style={{ maxWidth: '400px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
              <CheckCircleIcon />
              {t('settings.changesSaved')}
            </div>
          </Alert>
        )}
      </div>

      {/* Tabs */}
      <div style={{
        backgroundColor: 'var(--ds-color-neutral-background-default)',
        borderRadius: 'var(--ds-border-radius-lg)',
        padding: 'var(--ds-spacing-6)',
        boxShadow: 'var(--ds-shadow-xsmall)',
      }}>
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List style={{ marginBottom: 'var(--ds-spacing-6)' }}>
            <Tabs.Tab value="profile">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                <UserIcon style={{ fontSize: 'var(--ds-font-size-md)' }} />
                {t('settings.tabs.profile')}
              </div>
            </Tabs.Tab>
            <Tabs.Tab value="addresses">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                <HomeIcon style={{ fontSize: 'var(--ds-font-size-md)' }} />
                {t('settings.tabs.addresses')}
              </div>
            </Tabs.Tab>
            <Tabs.Tab value="privacy">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                <ShieldIcon style={{ fontSize: 'var(--ds-font-size-md)' }} />
                {t('settings.tabs.privacy')}
              </div>
            </Tabs.Tab>
            <Tabs.Tab value="notifications">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                <BellIcon style={{ fontSize: 'var(--ds-font-size-md)' }} />
                {t('settings.tabs.notifications')}
              </div>
            </Tabs.Tab>
            <Tabs.Tab value="preferences">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                <SettingsIcon style={{ fontSize: 'var(--ds-font-size-md)' }} />
                {t('settings.tabs.preferences')}
              </div>
            </Tabs.Tab>
          </Tabs.List>

          {/* Profile Tab */}
          <Tabs.Panel value="profile">
            <Stack spacing={6}>
            {/* Avatar Section */}
            <Card>
              <Stack spacing={5}>
                <div>
                  <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
                    {t('profile.avatar')}
                  </Heading>
                  <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {t('profile.avatarDesc')}
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
                    {/* eslint-disable-next-line digdir/prefer-ds-components -- Hidden file input for avatar upload */}
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
                      aria-label={t('profile.changeAvatar')}
                    >
                      <CameraIcon />
                      {isUploadingAvatar ? t('profile.uploading') : t('profile.changeAvatar')}
                    </Button>
                    <Paragraph data-size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                      {t('profile.imageFormats')}
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
                    {t('profile.personalInfo')}
                  </Heading>
                  <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {t('profile.personalInfoDesc')}
                  </Paragraph>
                </div>

                <Stack spacing={4}>
                  <FormField label={t('profile.fullName')} required>
                    <Textfield
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder={t('profile.namePlaceholder')}
                      aria-label={t('profile.fullName')}
                    />
                  </FormField>

                  <FormField label={t('profile.email')} required>
                    <Textfield
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder={t('profile.emailPlaceholder')}
                      aria-label={t('profile.email')}
                    />
                  </FormField>

                  <FormField label={t('profile.phone')}>
                    <Textfield
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder={t('profile.phonePlaceholder')}
                      aria-label={t('profile.phone')}
                    />
                  </FormField>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--ds-spacing-3)' }}>
                    <FormField label={t('profile.dateOfBirth')}>
                      <Textfield
                        type="date"
                        value={profileData.dateOfBirth}
                        onChange={(e) => setProfileData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                        aria-label={t('profile.dateOfBirth')}
                      />
                    </FormField>

                    <FormField label={t('profile.nationalId')}>
                      <Textfield
                        value={profileData.nationalId}
                        onChange={(e) => setProfileData(prev => ({ ...prev, nationalId: e.target.value }))}
                        placeholder={t('profile.nationalIdPlaceholder')}
                        maxLength={11}
                        aria-label={t('profile.nationalId')}
                      />
                    </FormField>
                  </div>
                </Stack>

                <div style={{ paddingTop: 'var(--ds-spacing-4)', borderTop: '1px solid var(--ds-color-neutral-border-subtle)' }}>
                  <Button onClick={handleSaveProfile} disabled={isSaving} type="button" aria-label={t('profile.saveProfile')}>
                    <SaveIcon />
                    {isSaving ? t('profile.saving') : t('common.saveChanges')}
                  </Button>
                </div>
              </Stack>
            </Card>
          </Stack>
        </Tabs.Panel>

        {/* Addresses Tab */}
        <Tabs.Panel value="addresses">
          <Stack spacing={6}>
            {/* Residence Address */}
            <Card>
              <Stack spacing={5}>
                <div>
                  <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
                    <MapPinIcon style={{ verticalAlign: 'middle', marginRight: 'var(--ds-spacing-2)' }} />
                    {t('address.residence')}
                  </Heading>
                  <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {t('address.residenceDesc')}
                  </Paragraph>
                </div>

                <Stack spacing={4}>
                  <FormField label={t('address.street')}>
                    <Textfield
                      value={profileData.residenceAddress.street || ''}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        residenceAddress: { ...prev.residenceAddress, street: e.target.value }
                      }))}
                      placeholder={t('address.streetPlaceholder')}
                      aria-label={t('address.street')}
                    />
                  </FormField>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--ds-spacing-3)' }}>
                    <FormField label={t('address.city')}>
                      <Textfield
                        value={profileData.residenceAddress.city || ''}
                        onChange={(e) => setProfileData(prev => ({
                          ...prev,
                          residenceAddress: { ...prev.residenceAddress, city: e.target.value }
                        }))}
                        placeholder={t('address.cityPlaceholder')}
                        aria-label={t('address.city')}
                      />
                    </FormField>

                    <FormField label={t('address.postalCode')}>
                      <Textfield
                        value={profileData.residenceAddress.postalCode || ''}
                        onChange={(e) => setProfileData(prev => ({
                          ...prev,
                          residenceAddress: { ...prev.residenceAddress, postalCode: e.target.value }
                        }))}
                        placeholder={t('address.postalCodePlaceholder')}
                        maxLength={4}
                        aria-label={t('address.postalCode')}
                      />
                    </FormField>
                  </div>

                  <FormField label={t('address.country')}>
                    <Select
                      value={profileData.residenceAddress.country || t('countries.norway')}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        residenceAddress: { ...prev.residenceAddress, country: e.target.value }
                      }))}
                    >
                      <option value={t('countries.norway')}>{t('countries.norway')}</option>
                      <option value={t('countries.sweden')}>{t('countries.sweden')}</option>
                      <option value={t('countries.denmark')}>{t('countries.denmark')}</option>
                      <option value={t('countries.finland')}>{t('countries.finland')}</option>
                    </Select>
                  </FormField>
                </Stack>
              </Stack>
            </Card>

            {/* Invoice Address */}
            <Card>
              <Stack spacing={5}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
                      <HomeIcon style={{ verticalAlign: 'middle', marginRight: 'var(--ds-spacing-2)' }} />
                      {t('address.invoice')}
                    </Heading>
                    <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                      {t('address.invoiceDesc')}
                    </Paragraph>
                  </div>
                  <Button
                    variant="tertiary"
                    data-size="sm"
                    onClick={handleCopyResidenceToInvoice} type="button"
                  >
                    {t('address.copyFromResidence')}
                  </Button>
                </div>

                <Stack spacing={4}>
                  <FormField label={t('address.street')}>
                    <Textfield
                      value={profileData.invoiceAddress.street || ''}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        invoiceAddress: { ...prev.invoiceAddress, street: e.target.value }
                      }))}
                      placeholder={t('address.streetPlaceholder')}
                      aria-label={t('address.street')}
                    />
                  </FormField>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--ds-spacing-3)' }}>
                    <FormField label={t('address.city')}>
                      <Textfield
                        value={profileData.invoiceAddress.city || ''}
                        onChange={(e) => setProfileData(prev => ({
                          ...prev,
                          invoiceAddress: { ...prev.invoiceAddress, city: e.target.value }
                        }))}
                        placeholder={t('address.cityPlaceholder')}
                        aria-label={t('address.city')}
                      />
                    </FormField>

                    <FormField label={t('address.postalCode')}>
                      <Textfield
                        value={profileData.invoiceAddress.postalCode || ''}
                        onChange={(e) => setProfileData(prev => ({
                          ...prev,
                          invoiceAddress: { ...prev.invoiceAddress, postalCode: e.target.value }
                        }))}
                        placeholder={t('address.postalCodePlaceholder')}
                        maxLength={4}
                        aria-label={t('address.postalCode')}
                      />
                    </FormField>
                  </div>

                  <FormField label={t('address.country')}>
                    <Select
                      value={profileData.invoiceAddress.country || t('countries.norway')}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        invoiceAddress: { ...prev.invoiceAddress, country: e.target.value }
                      }))}
                    >
                      <option value={t('countries.norway')}>{t('countries.norway')}</option>
                      <option value={t('countries.sweden')}>{t('countries.sweden')}</option>
                      <option value={t('countries.denmark')}>{t('countries.denmark')}</option>
                      <option value={t('countries.finland')}>{t('countries.finland')}</option>
                    </Select>
                  </FormField>
                </Stack>

                <div style={{ paddingTop: 'var(--ds-spacing-4)', borderTop: '1px solid var(--ds-color-neutral-border-subtle)' }}>
                  <Button onClick={handleSaveProfile} disabled={isSaving} type="button" aria-label={t('address.saveAddressSettings')}>
                    <SaveIcon />
                    {isSaving ? t('address.savingChanges') : t('address.saveAddresses')}
                  </Button>
                </div>
              </Stack>
            </Card>
          </Stack>
        </Tabs.Panel>

        {/* Privacy Tab */}
        <Tabs.Panel value="privacy">
          <Stack spacing={6}>
            {/* Data Export */}
            <Card>
              <Stack spacing={4}>
                <div>
                  <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
                    <ShieldIcon style={{ verticalAlign: 'middle', marginRight: 'var(--ds-spacing-2)' }} />
                    {t('privacy.dataExport')}
                  </Heading>
                  <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {t('privacy.dataExportDesc')}
                  </Paragraph>
                </div>

                <Alert>
                  <Paragraph data-size="sm" style={{ margin: 0 }}>
                    {t('privacy.gdprInfo')}
                  </Paragraph>
                </Alert>

                <Button
                  variant="secondary"
                  onClick={handleExportData}
                  disabled={isExporting}
                  type="button"
                  aria-label={t('privacy.exportMyData')}
                >
                  <DownloadIcon />
                  {isExporting ? t('privacy.exporting') : t('privacy.exportData')}
                </Button>
              </Stack>
            </Card>

            {/* Consent Settings */}
            <Card>
              <Stack spacing={4}>
                <div>
                  <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
                    {t('privacy.consents')}
                  </Heading>
                  <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {t('privacy.consentsDesc')}
                  </Paragraph>
                </div>

                <Stack spacing={3}>
                  <div style={{
                    padding: 'var(--ds-spacing-4)',
                    backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
                    borderRadius: 'var(--ds-border-radius-md)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                        {t('privacy.marketing')}
                      </Paragraph>
                      <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                        {t('privacy.marketingDesc')}
                      </Paragraph>
                    </div>
                    <Switch
                      checked={consentSettings.marketing}
                      onChange={(e) => handleUpdateConsents('marketing', e.target.checked)}
                      aria-label={t('privacy.marketing')}
                    />
                  </div>

                  <div style={{
                    padding: 'var(--ds-spacing-4)',
                    backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
                    borderRadius: 'var(--ds-border-radius-md)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                        {t('privacy.analytics')}
                      </Paragraph>
                      <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                        {t('privacy.analyticsDesc')}
                      </Paragraph>
                    </div>
                    <Switch
                      checked={consentSettings.analytics}
                      onChange={(e) => handleUpdateConsents('analytics', e.target.checked)}
                      aria-label={t('privacy.analytics')}
                    />
                  </div>

                  <div style={{
                    padding: 'var(--ds-spacing-4)',
                    backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
                    borderRadius: 'var(--ds-border-radius-md)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                        {t('privacy.thirdPartySharing')}
                      </Paragraph>
                      <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                        {t('privacy.thirdPartySharingDesc')}
                      </Paragraph>
                    </div>
                    <Switch
                      checked={consentSettings.thirdPartySharing}
                      onChange={(e) => handleUpdateConsents('thirdPartySharing', e.target.checked)}
                      aria-label={t('privacy.thirdPartySharing')}
                    />
                  </div>
                </Stack>
              </Stack>
            </Card>

            {/* Delete Account */}
            <Card>
              <Stack spacing={4}>
                <div>
                  <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)', color: 'var(--ds-color-danger-text-default)' }}>
                    {t('privacy.deleteAccount')}
                  </Heading>
                  <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {t('privacy.deleteAccountDesc')}
                  </Paragraph>
                </div>

                <Alert>
                  <Stack spacing={2}>
                    <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                      {t('privacy.cannotUndo')}
                    </Paragraph>
                    <Paragraph data-size="sm" style={{ margin: 0 }}>
                      {t('privacy.deleteWarning')}
                    </Paragraph>
                  </Stack>
                </Alert>

                <Button
                  variant="secondary"
                  onClick={handleDeleteAccount}
                  style={{
                    backgroundColor: 'var(--ds-color-danger-surface-default)',
                    color: 'var(--ds-color-danger-text-default)',
                    borderColor: 'var(--ds-color-danger-border-default)'
                  }} type="button"
                >
                  <TrashIcon />
                  {t('privacy.deleteMyAccount')}
                </Button>
              </Stack>
            </Card>
          </Stack>
        </Tabs.Panel>

        {/* Notifications Tab */}
        <Tabs.Panel value="notifications">
          <Stack spacing={6}>
            <Card>
              <Stack spacing={4}>
                <div>
                  <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
                    {t('settings.notificationSettings')}
                  </Heading>
                  <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {t('settings.notificationSettingsDesc')}
                  </Paragraph>
                </div>

                <Alert>
                  <Paragraph data-size="sm" style={{ margin: 0 }}>
                    {t('settings.notificationInfo')}
                  </Paragraph>
                </Alert>

                <Link to="/settings/notifications">
                  <Button variant="secondary" type="button">
                    {t('settings.openNotificationSettings')}
                  </Button>
                </Link>
              </Stack>
            </Card>
          </Stack>
        </Tabs.Panel>

        {/* Preferences Tab */}
        <Tabs.Panel value="preferences">
          <Stack spacing={6}>
            {/* Language */}
            <Card>
              <Stack spacing={4}>
                <div>
                  <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
                    {t('preferences.language')}
                  </Heading>
                  <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {t('preferences.languageDesc')}
                  </Paragraph>
                </div>

                <FormField label={t('preferences.preferredLanguage')}>
                  <Select value={locale} onChange={(e) => setLocale(e.target.value as 'nb' | 'en')}>
                    <option value="nb">{t('languages.nb')}</option>
                    <option value="nn">{t('languages.nn')}</option>
                    <option value="en">{t('languages.en')}</option>
                  </Select>
                </FormField>
              </Stack>
            </Card>

            {/* Display Settings */}
            <Card>
              <Stack spacing={4}>
                <div>
                  <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
                    {t('preferences.appearance')}
                  </Heading>
                  <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {t('preferences.appearanceDesc')}
                  </Paragraph>
                </div>

                <div style={{
                  padding: 'var(--ds-spacing-4)',
                  backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
                  borderRadius: 'var(--ds-border-radius-md)'
                }}>
                  <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {t('preferences.themeSoon')}
                  </Paragraph>
                </div>
              </Stack>
            </Card>

            {/* Session & Security */}
            <Card>
              <Stack spacing={4}>
                <div>
                  <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
                    {t('preferences.sessionSecurity')}
                  </Heading>
                  <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {t('preferences.sessionSecurityDesc')}
                  </Paragraph>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 'var(--ds-spacing-4)',
                  backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
                  borderRadius: 'var(--ds-border-radius-md)'
                }}>
                  <div>
                    <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                      {t('preferences.logout')}
                    </Paragraph>
                    <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                      {t('preferences.logoutDesc')}
                    </Paragraph>
                  </div>
                  <Button variant="secondary" data-size="sm" onClick={logout} type="button">
                    {t('preferences.logout')}
                  </Button>
                </div>
              </Stack>
            </Card>
          </Stack>
        </Tabs.Panel>
      </Tabs>
      </div>
    </div>
  );
}
