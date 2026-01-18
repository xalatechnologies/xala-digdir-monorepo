/**
 * Settings Page - Complete Tenant Configuration
 * Manage tenant settings, integrations, and system configuration
 */

/* eslint-disable digdir/prefer-ds-components, digdir/require-interactive-labels -- Complex settings form */

import { useState, useRef } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Skeleton,
  Tabs,
  Stack,
  FormField,
  Textfield,
  Select,
  Switch,
  Badge,
  Alert,
  SaveIcon,
  CheckCircleIcon,
  UserIcon,
  CameraIcon,
  CopyIcon,
  InfoIcon,
} from '@xala/ds';
import {
  useTenantSettings,
  useUpdateTenantSettings,
  useIntegrationSettings,
  useUpdateIntegration,
  useCurrentUser,
  useUpdateCurrentUser,
  useUploadUserAvatar,
  type Address,
} from '@digilist/client-sdk';
import { useT } from '@xala/i18n';

export function SettingsPage() {
  const t = useT();
  const [activeTab, setActiveTab] = useState('profile');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Queries
  const { data: settingsData, isLoading } = useTenantSettings();
  const settings = settingsData?.data;

  const { data: integrationsData } = useIntegrationSettings();
  const integrations = integrationsData?.data;

  const { data: currentUserData, isLoading: isLoadingUser } = useCurrentUser();
  const currentUser = currentUserData?.data;

  // Mutations
  const updateSettingsMutation = useUpdateTenantSettings();
  const updateIntegrationMutation = useUpdateIntegration();
  const updateProfileMutation = useUpdateCurrentUser();
  const uploadAvatarMutation = useUploadUserAvatar();

  const [formData, setFormData] = useState({
    general: {
      name: '',
      locale: 'nb',
      timezone: 'Europe/Oslo',
      currency: 'NOK',
      dateFormat: 'dd.MM.yyyy',
      timeFormat: '24h',
    },
    booking: {
      autoConfirm: false,
      requireApproval: true,
      allowCancellation: true,
      cancellationDeadlineHours: 24,
      maxAdvanceBookingDays: 90,
      minAdvanceBookingHours: 2,
      bufferTimeMinutes: 0,
    },
    notifications: {
      emailEnabled: true,
      smsEnabled: false,
      pushEnabled: false,
      bookingConfirmation: true,
      bookingReminder: true,
      reminderHoursBefore: 24,
    },
    branding: {
      logo: '',
      primaryColor: '#1A56DB',
      secondaryColor: '#6B7280',
      favicon: '',
    },
  });

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
      country: 'Norge',
    } as Address,
    residenceAddress: {
      street: '',
      city: '',
      postalCode: '',
      country: 'Norge',
    } as Address,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Load settings into form
  useState(() => {
    if (settings) {
      setFormData({
        general: settings.general || formData.general,
        booking: settings.booking || formData.booking,
        notifications: settings.notifications || formData.notifications,
        branding: settings.branding || formData.branding,
      });
    }
  });

  // Load current user into profile form
  useState(() => {
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
  });

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updateSettingsMutation.mutateAsync(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error(t('validation.failed_to_save_settings'), error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleIntegrationToggle = async (provider: string, enabled: boolean) => {
    try {
      await updateIntegrationMutation.mutateAsync({ provider, data: { enabled } });
    } catch (error) {
      console.error(`Failed to toggle ${provider}:`, error);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updateProfileMutation.mutateAsync(profileData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error(t('validation.failed_to_save_profile'), error);
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
      console.error(t('validation.failed_to_upload_avatar'), error);
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

  // Loading state - Skeleton screen
  if (isLoading || isLoadingUser) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-5)' }}>
        {/* Header Skeleton */}
        <div>
          <Skeleton width="30%" height={32} style={{ marginBottom: 'var(--ds-spacing-2)' }} />
          <Skeleton width="50%" height={20} />
        </div>

        {/* Tabs Skeleton */}
        <div>
          <div
            style={{
              display: 'flex',
              gap: 'var(--ds-spacing-2)',
              borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
              marginBottom: 'var(--ds-spacing-5)',
            }}
          >
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <Skeleton key={i} width={100} height={40} style={{ marginBottom: '-1px' }} />
            ))}
          </div>

          {/* Tab Content Skeleton */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
            {/* Profile Card Skeleton */}
            <Card style={{ padding: 'var(--ds-spacing-5)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-5)' }}>
                {/* Section Header */}
                <div>
                  <Skeleton width="30%" height={24} style={{ marginBottom: 'var(--ds-spacing-2)' }} />
                  <Skeleton width="60%" height={16} />
                </div>

                {/* Avatar Section */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-4)' }}>
                  <Skeleton width={120} height={120} style={{ borderRadius: 'var(--ds-border-radius-full)' }} />
                  <div style={{ flex: 1 }}>
                    <Skeleton width={150} height={36} style={{ marginBottom: 'var(--ds-spacing-2)' }} />
                    <Skeleton width="60%" height={16} />
                  </div>
                </div>
              </div>
            </Card>

            {/* Personal Information Card Skeleton */}
            <Card style={{ padding: 'var(--ds-spacing-5)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-5)' }}>
                {/* Section Header */}
                <div>
                  <Skeleton width="40%" height={24} style={{ marginBottom: 'var(--ds-spacing-2)' }} />
                  <Skeleton width="50%" height={16} />
                </div>

                {/* Form Fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
                  {[1, 2, 3].map((i) => (
                    <div key={i}>
                      <Skeleton width="25%" height={20} style={{ marginBottom: 'var(--ds-spacing-2)' }} />
                      <Skeleton width="100%" height={48} />
                    </div>
                  ))}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--ds-spacing-3)' }}>
                    <div>
                      <Skeleton width="50%" height={20} style={{ marginBottom: 'var(--ds-spacing-2)' }} />
                      <Skeleton width="100%" height={48} />
                    </div>
                    <div>
                      <Skeleton width="50%" height={20} style={{ marginBottom: 'var(--ds-spacing-2)' }} />
                      <Skeleton width="100%" height={48} />
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div style={{ paddingTop: 'var(--ds-spacing-3)', borderTop: '1px solid var(--ds-color-neutral-border-subtle)' }}>
                  <Skeleton width={150} height={40} />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-5)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Heading level={2} data-size="md">{t("ui.settings")}</Heading>
          <Paragraph
            data-size="sm"
            style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-1)' }}
          >
            {t("settings.configureDesc")}
          </Paragraph>
        </div>
        {saveSuccess && (
          <Alert style={{ maxWidth: '400px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
              <CheckCircleIcon />
              {t("settings.saveSuccess")}
            </div>
          </Alert>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="profile">{t("settings.tabs.profile")}</Tabs.Tab>
          <Tabs.Tab value="addresses">{t("settings.tabs.addresses")}</Tabs.Tab>
          <Tabs.Tab value="general">{t("settings.tabs.general")}</Tabs.Tab>
          <Tabs.Tab value="booking">{t("settings.tabs.booking")}</Tabs.Tab>
          <Tabs.Tab value="notifications">{t("settings.tabs.notifications")}</Tabs.Tab>
          <Tabs.Tab value="integrations">{t("settings.tabs.integrations")}</Tabs.Tab>
          <Tabs.Tab value="branding">{t("settings.tabs.branding")}</Tabs.Tab>
        </Tabs.List>

        {/* Profile Settings */}
        <Tabs.Panel value="profile">
          <Stack spacing={4}>
            {/* Avatar Section */}
            <Card>
              <Stack spacing={5}>
                <div>
                  <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
                    {t("settings.profile.avatar")}
                  </Heading>
                  <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {t("settings.profile.avatarDesc")}
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
                        alt={t("settings.profile.avatar")}
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
                      {isUploadingAvatar ? t("state.loading") : t("settings.profile.changeImage")}
                    </Button>
                    <Paragraph data-size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                      {t("settings.profile.imageFormats")}
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
                    {t("settings.profile.personalInfo")}
                  </Heading>
                  <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {t("settings.profile.personalInfoDesc")}
                  </Paragraph>
                </div>

                <Stack spacing={4}>
                  <FormField label={t("settings.profile.fullName")} required>
                    <Textfield aria-label={t("settings.profile.fullName")}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder={t("settings.profile.fullNamePlaceholder")}
                    />
                  </FormField>

                  <FormField label={t("settings.profile.email")} required>
                    <Textfield aria-label={t("settings.profile.email")}
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder={t("settings.profile.emailPlaceholder")}
                    />
                  </FormField>

                  <FormField label={t("settings.profile.phone")}>
                    <Textfield aria-label={t("settings.profile.phone")}
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder={t("settings.profile.phonePlaceholder")}
                    />
                  </FormField>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--ds-spacing-3)' }}>
                    <FormField label={t("settings.profile.dateOfBirth")}>
                      <Textfield aria-label={t("settings.profile.dateOfBirth")}
                        type="date"
                        value={profileData.dateOfBirth}
                        onChange={(e) => setProfileData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                      />
                    </FormField>

                    <FormField label={t("settings.profile.nationalId")}>
                      <Textfield aria-label={t("settings.profile.nationalId")}
                        onChange={(e) => setProfileData(prev => ({ ...prev, nationalId: e.target.value }))}
                        placeholder={t("settings.profile.nationalIdPlaceholder")}
                        maxLength={11}
                      />
                    </FormField>
                  </div>
                </Stack>

                <div style={{ paddingTop: 'var(--ds-spacing-3)', borderTop: '1px solid var(--ds-color-neutral-border-subtle)' }}>
                  <Button onClick={handleSaveProfile} disabled={isSaving} type="button">
                    <SaveIcon />
                    {isSaving ? t("state.saving") : t("settings.profile.save")}
                  </Button>
                </div>
              </Stack>
            </Card>
          </Stack>
        </Tabs.Panel>

        {/* Addresses Tab */}
        <Tabs.Panel value="addresses">
          <Stack spacing={5}>
            {/* Intro */}
            <Card>
              <Stack spacing={3}>
                <div>
                  <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
                    {t("settings.address.page.title")}
                  </Heading>
                  <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {t("settings.address.infoDesc")}
                  </Paragraph>
                </div>
              </Stack>
            </Card>

            {/* Residence Address */}
            <Card>
              <Stack spacing={5}>
                <div>
                  <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
                    {t("settings.address.residence")}
                  </Heading>
                  <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {t("settings.address.residenceDesc")}
                  </Paragraph>
                </div>

                <Stack spacing={4}>
                  <FormField label={t("settings.address.street")} required>
                    <Textfield aria-label={t("settings.address.street")}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        residenceAddress: { ...prev.residenceAddress, street: e.target.value }
                      }))}
                      placeholder={t("settings.address.streetPlaceholder")}
                    />
                  </FormField>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--ds-spacing-3)' }}>
                    <FormField label={t("settings.address.city")} required>
                      <Textfield aria-label={t("settings.address.city")}
                        onChange={(e) => setProfileData(prev => ({
                          ...prev,
                          residenceAddress: { ...prev.residenceAddress, city: e.target.value }
                        }))}
                        placeholder={t("settings.address.cityPlaceholder")}
                      />
                    </FormField>

                    <FormField label={t("settings.address.postalCode")} required>
                      <Textfield aria-label={t("settings.address.postalCode")}
                        onChange={(e) => setProfileData(prev => ({
                          ...prev,
                          residenceAddress: { ...prev.residenceAddress, postalCode: e.target.value }
                        }))}
                        placeholder={t("settings.address.postalCodePlaceholder")}
                        maxLength={4}
                      />
                    </FormField>
                  </div>

                  <FormField label={t("settings.address.country")} required>
                    <Select
                      value={profileData.residenceAddress.country || t("countries.norway")}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        residenceAddress: { ...prev.residenceAddress, country: e.target.value }
                      }))}
                    >
                      <option value={t("countries.norway")}>{t("countries.norway")}</option>
                      <option value={t("countries.sweden")}>{t("countries.sweden")}</option>
                      <option value={t("countries.denmark")}>{t("countries.denmark")}</option>
                      <option value={t("countries.finland")}>{t("countries.finland")}</option>
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
                    <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
                      {t("settings.address.invoice")}
                    </Heading>
                    <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                      {t("settings.address.invoiceFullDesc")}
                    </Paragraph>
                  </div>
                  <Button
                    variant="tertiary"
                    data-size="sm"
                    onClick={handleCopyResidenceToInvoice} type="button"
                  >
                    <CopyIcon />
                    {t("settings.address.copyResidence")}
                  </Button>
                </div>

                <Stack spacing={4}>
                  <FormField label={t("settings.address.street")} required>
                    <Textfield aria-label={t("settings.address.street")}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        invoiceAddress: { ...prev.invoiceAddress, street: e.target.value }
                      }))}
                      placeholder={t("settings.address.streetPlaceholder")}
                    />
                  </FormField>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--ds-spacing-3)' }}>
                    <FormField label={t("settings.address.city")} required>
                      <Textfield aria-label={t("settings.address.city")}
                        onChange={(e) => setProfileData(prev => ({
                          ...prev,
                          invoiceAddress: { ...prev.invoiceAddress, city: e.target.value }
                        }))}
                        placeholder={t("settings.address.cityPlaceholder")}
                      />
                    </FormField>

                    <FormField label={t("settings.address.postalCode")} required>
                      <Textfield aria-label={t("settings.address.postalCode")}
                        onChange={(e) => setProfileData(prev => ({
                          ...prev,
                          invoiceAddress: { ...prev.invoiceAddress, postalCode: e.target.value }
                        }))}
                        placeholder={t("settings.address.postalCodePlaceholder")}
                        maxLength={4}
                      />
                    </FormField>
                  </div>

                  <FormField label={t("settings.address.country")} required>
                    <Select
                      value={profileData.invoiceAddress.country || t("countries.norway")}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        invoiceAddress: { ...prev.invoiceAddress, country: e.target.value }
                      }))}
                    >
                      <option value={t("countries.norway")}>{t("countries.norway")}</option>
                      <option value={t("countries.sweden")}>{t("countries.sweden")}</option>
                      <option value={t("countries.denmark")}>{t("countries.denmark")}</option>
                      <option value={t("countries.finland")}>{t("countries.finland")}</option>
                    </Select>
                  </FormField>
                </Stack>
              </Stack>
            </Card>

            {/* Address Verification Info */}
            <Card style={{ backgroundColor: 'var(--ds-color-info-surface-default)', border: '1px solid var(--ds-color-info-border-subtle)' }}>
              <Stack spacing={3}>
                <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', alignItems: 'flex-start' }}>
                  <InfoIcon style={{ color: 'var(--ds-color-info-text-default)', marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <Paragraph data-size="sm" style={{ fontWeight: 'var(--ds-font-weight-semibold)', marginBottom: 'var(--ds-spacing-1)' }}>
                      {t("settings.address.verification")}
                    </Paragraph>
                    <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                      {t("settings.address.verificationDesc")}
                    </Paragraph>
                  </div>
                </div>
              </Stack>
            </Card>

            {/* Save Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={handleSaveProfile} disabled={isSaving} type="button">
                <SaveIcon />
                {isSaving ? t("state.saving") : t("settings.profile.saveAddresses")}
              </Button>
            </div>
          </Stack>
        </Tabs.Panel>

        {/* General Settings */}
        <Tabs.Panel value="general">
          <Card>
            <Stack spacing={5}>
              <div>
                <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
                  {t("settings.general.page.title")}
                </Heading>
                <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                  {t("settings.general.desc")}
                </Paragraph>
              </div>

              <Stack spacing={4}>
                <FormField label={t("settings.general.systemName")} description={t("settings.general.systemNameDesc")}>
                  <Textfield aria-label={t("settings.general.systemName")}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      general: { ...prev.general, name: e.target.value }
                    }))}
                    placeholder={t("settings.general.systemNamePlaceholder")}
                  />
                </FormField>

                <FormField label={t("settings.language")}>
                  <Select
                    value={formData.general.locale}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      general: { ...prev.general, locale: e.target.value }
                    }))}
                  >
                    <option value="nb">{t("settings.language.norskBokmal")}</option>
                    <option value="nn">{t("settings.language.norskNynorsk")}</option>
                    <option value="en">{t("settings.language.english")}</option>
                  </Select>
                </FormField>

                <FormField label={t("settings.general.timezone")}>
                  <Select
                    value={formData.general.timezone}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      general: { ...prev.general, timezone: e.target.value }
                    }))}
                  >
                    <option value="Europe/Oslo">{t("settings.general.timezone.oslo")}</option>
                    <option value="Europe/London">{t("settings.general.timezone.london")}</option>
                    <option value="America/New_York">{t("settings.general.timezone.newYork")}</option>
                  </Select>
                </FormField>

                <FormField label={t("settings.general.currency")}>
                  <Select
                    value={formData.general.currency}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      general: { ...prev.general, currency: e.target.value }
                    }))}
                  >
                    <option value="NOK">{t("settings.general.currency.nok")}</option>
                    <option value="EUR">{t("settings.general.currency.eur")}</option>
                    <option value="USD">{t("settings.general.currency.usd")}</option>
                  </Select>
                </FormField>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--ds-spacing-3)' }}>
                  <FormField label={t("settings.general.dateFormat")}>
                    <Select
                      value={formData.general.dateFormat}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        general: { ...prev.general, dateFormat: e.target.value }
                      }))}
                    >
                      <option value="dd.MM.yyyy">31.12.2024</option>
                      <option value="yyyy-MM-dd">2024-12-31</option>
                      <option value="MM/dd/yyyy">12/31/2024</option>
                    </Select>
                  </FormField>

                  <FormField label={t("settings.general.timeFormat")}>
                    <Select
                      value={formData.general.timeFormat}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        general: { ...prev.general, timeFormat: e.target.value }
                      }))}
                    >
                      <option value="24h">{t("settings.general.timeFormat.24h")}</option>
                      <option value="12h">{t("settings.general.timeFormat.12h")}</option>
                    </Select>
                  </FormField>
                </div>
              </Stack>

              <div style={{ paddingTop: 'var(--ds-spacing-3)', borderTop: '1px solid var(--ds-color-neutral-border-subtle)' }}>
                <Button onClick={handleSave} disabled={isSaving} type="button">
                  <SaveIcon />
                  {isSaving ? t("state.saving") : t("settings.profile.save")}
                </Button>
              </div>
            </Stack>
          </Card>
        </Tabs.Panel>

        {/* Booking Settings */}
        <Tabs.Panel value="booking">
          <Card>
            <Stack spacing={5}>
              <div>
                <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
                  {t("settings.booking.page.title")}
                </Heading>
                <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                  {t("settings.booking.desc")}
                </Paragraph>
              </div>

              <Stack spacing={4}>
                <FormField label={t("settings.booking.autoConfirm")}>
                  <Switch
                    checked={formData.booking.autoConfirm}
                    aria-label={t("settings.booking.autoConfirmDesc")}
                    onChange={(checked) => setFormData(prev => ({
                      ...prev,
                      booking: { ...prev.booking, autoConfirm: checked }
                    }))}
                  >
                    {t("settings.booking.autoConfirmDesc")}
                  </Switch>
                </FormField>

                {!formData.booking.autoConfirm && (
                  <FormField label={t("settings.booking.requireApproval")}>
                    <Switch
                      checked={formData.booking.requireApproval}
                      aria-label={t("settings.booking.requireApprovalDesc")}
                      onChange={(checked) => setFormData(prev => ({
                        ...prev,
                        booking: { ...prev.booking, requireApproval: checked }
                      }))}
                    >
                      {t("settings.booking.requireApprovalDesc")}
                    </Switch>
                  </FormField>
                )}

                <FormField label={t("settings.booking.allowCancellation")}>
                  <Switch
                    checked={formData.booking.allowCancellation}
                    aria-label={t("settings.booking.allowCancellationDesc")}
                    onChange={(checked) => setFormData(prev => ({
                      ...prev,
                      booking: { ...prev.booking, allowCancellation: checked }
                    }))}
                  >
                    {t("settings.booking.allowCancellationDesc")}
                  </Switch>
                </FormField>

                {formData.booking.allowCancellation && (
                  <FormField
                    label={t("settings.booking.cancellationDeadline")}
                    description={t("settings.booking.cancellationDeadlineDesc")}
                  >
                    <Textfield aria-label={t("settings.booking.cancellationDeadline")}
                      value={formData.booking.cancellationDeadlineHours.toString()}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        booking: { ...prev.booking, cancellationDeadlineHours: parseInt(e.target.value) || 0 }
                      }))}
                      min="0"
                      suffix={t("settings.booking.unit.hours")}
                    />
                  </FormField>
                )}

                <FormField
                  label={t("settings.booking.maxAdvance")}
                  description={t("settings.booking.maxAdvanceDesc")}
                >
                  <Textfield aria-label={t("settings.booking.maxAdvance")}
                    value={formData.booking.maxAdvanceBookingDays.toString()}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      booking: { ...prev.booking, maxAdvanceBookingDays: parseInt(e.target.value) || 0 }
                    }))}
                    min="1"
                    suffix={t("settings.booking.unit.days")}
                  />
                </FormField>

                <FormField
                  label={t("settings.booking.minAdvance")}
                  description={t("settings.booking.minAdvanceDesc")}
                >
                  <Textfield aria-label={t("settings.booking.minAdvance")}
                    value={formData.booking.minAdvanceBookingHours.toString()}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      booking: { ...prev.booking, minAdvanceBookingHours: parseInt(e.target.value) || 0 }
                    }))}
                    min="0"
                    suffix={t("settings.booking.unit.hours")}
                  />
                </FormField>

                <FormField
                  label={t("settings.booking.bufferTime")}
                  description={t("settings.booking.bufferTimeDesc")}
                >
                  <Textfield aria-label={t("settings.booking.bufferTime")}
                    value={formData.booking.bufferTimeMinutes.toString()}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      booking: { ...prev.booking, bufferTimeMinutes: parseInt(e.target.value) || 0 }
                    }))}
                    min="0"
                    suffix={t("settings.booking.unit.minutes")}
                  />
                </FormField>
              </Stack>

              <div style={{ paddingTop: 'var(--ds-spacing-3)', borderTop: '1px solid var(--ds-color-neutral-border-subtle)' }}>
                <Button onClick={handleSave} disabled={isSaving} type="button">
                  <SaveIcon />
                  {isSaving ? t("state.saving") : t("settings.profile.save")}
                </Button>
              </div>
            </Stack>
          </Card>
        </Tabs.Panel>

        {/* Notification Settings */}
        <Tabs.Panel value="notifications">
          <Card>
            <Stack spacing={5}>
              <div>
                <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
                  {t("settings.notifications.page.title")}
                </Heading>
                <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                  {t("settings.notifications.desc")}
                </Paragraph>
              </div>

              <Stack spacing={4}>
                <FormField label={t("settings.notifications.email")}>
                  <Switch
                    checked={formData.notifications.emailEnabled}
                    aria-label={t("settings.notifications.emailDesc")}
                    onChange={(checked) => setFormData(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, emailEnabled: checked }
                    }))}
                  >
                    {t("settings.notifications.emailDesc")}
                  </Switch>
                </FormField>

                <FormField label={t("settings.notifications.sms")}>
                  <Switch
                    checked={formData.notifications.smsEnabled}
                    aria-label={t("settings.notifications.smsDesc")}
                    onChange={(checked) => setFormData(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, smsEnabled: checked }
                    }))}
                  >
                    {t("settings.notifications.smsDesc")}
                  </Switch>
                </FormField>

                <FormField label={t("settings.notifications.push")}>
                  <Switch
                    checked={formData.notifications.pushEnabled}
                    aria-label={t("settings.notifications.pushDesc")}
                    onChange={(checked) => setFormData(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, pushEnabled: checked }
                    }))}
                  >
                    {t("settings.notifications.pushDesc")}
                  </Switch>
                </FormField>

                <div style={{
                  padding: 'var(--ds-spacing-4)',
                  backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
                  borderRadius: 'var(--ds-border-radius-md)',
                  marginTop: 'var(--ds-spacing-2)',
                }}>
                  <Paragraph data-size="sm" style={{ fontWeight: 'var(--ds-font-weight-semibold)', marginBottom: 'var(--ds-spacing-3)' }}>
                    {t("settings.notifications.automatic")}
                  </Paragraph>

                  <Stack spacing={3}>
                    <FormField label={t("settings.notifications.bookingConfirmation")}>
                      <Switch
                        checked={formData.notifications.bookingConfirmation}
                        aria-label={t("settings.notifications.bookingConfirmationDesc")}
                        onChange={(checked) => setFormData(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, bookingConfirmation: checked }
                        }))}
                      >
                        {t("settings.notifications.bookingConfirmationDesc")}
                      </Switch>
                    </FormField>

                    <FormField label={t("settings.notifications.bookingReminder")}>
                      <Switch
                        checked={formData.notifications.bookingReminder}
                        aria-label={t("settings.notifications.bookingReminderDesc")}
                        onChange={(checked) => setFormData(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, bookingReminder: checked }
                        }))}
                      >
                        {t("settings.notifications.bookingReminderDesc")}
                      </Switch>
                    </FormField>

                    {formData.notifications.bookingReminder && (
                      <FormField
                        label={t("settings.notifications.reminderTiming")}
                        description={t("settings.notifications.reminderTimingDesc")}
                      >
                        <Textfield aria-label={t("settings.notifications.reminderTiming")}
                          value={formData.notifications.reminderHoursBefore.toString()}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            notifications: { ...prev.notifications, reminderHoursBefore: parseInt(e.target.value) || 24 }
                          }))}
                          min="1"
                          suffix={t("settings.booking.unit.hoursBefore")}
                        />
                      </FormField>
                    )}
                  </Stack>
                </div>
              </Stack>

              <div style={{ paddingTop: 'var(--ds-spacing-3)', borderTop: '1px solid var(--ds-color-neutral-border-subtle)' }}>
                <Button onClick={handleSave} disabled={isSaving} type="button">
                  <SaveIcon />
                  {isSaving ? t("state.saving") : t("settings.profile.save")}
                </Button>
              </div>
            </Stack>
          </Card>
        </Tabs.Panel>

        {/* Integrations */}
        <Tabs.Panel value="integrations">
          <Stack spacing={4}>
            <Card>
              <Stack spacing={4}>
                <div>
                  <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
                    {t("settings.integrations.authentication")}
                  </Heading>
                  <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {t("settings.integrations.authenticationDesc")}
                  </Paragraph>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--ds-spacing-3)', backgroundColor: 'var(--ds-color-neutral-surface-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
                  <div>
                    <div style={{ fontWeight: 'var(--ds-font-weight-medium)', marginBottom: 'var(--ds-spacing-1)' }}>{t("settings.integrations.bankid")}</div>
                    <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>{t("settings.integrations.bankidDesc")}</Paragraph>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                    {integrations?.bankid?.enabled ? (
                      <Badge color="success">{t("state.active")}</Badge>
                    ) : (
                      <Badge color="neutral">{t("state.inactive")}</Badge>
                    )}
                    <Switch
                      checked={integrations?.bankid?.enabled || false}
                      onChange={(checked) => handleIntegrationToggle('bankid', checked)}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--ds-spacing-3)', backgroundColor: 'var(--ds-color-neutral-surface-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
                  <div>
                    <div style={{ fontWeight: 'var(--ds-font-weight-medium)', marginBottom: 'var(--ds-spacing-1)' }}>{t("settings.integrations.idporten")}</div>
                    <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>{t("settings.integrations.idportenDesc")}</Paragraph>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                    {integrations?.idporten?.enabled ? (
                      <Badge color="success">{t("state.active")}</Badge>
                    ) : (
                      <Badge color="neutral">{t("state.inactive")}</Badge>
                    )}
                    <Switch
                      checked={integrations?.idporten?.enabled || false}
                      onChange={(checked) => handleIntegrationToggle('idporten', checked)}
                    />
                  </div>
                </div>
              </Stack>
            </Card>

            <Card>
              <Stack spacing={4}>
                <div>
                  <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>{t("settings.integrations.payment")}</Heading>
                  <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {t("settings.integrations.paymentDesc")}
                  </Paragraph>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--ds-spacing-3)', backgroundColor: 'var(--ds-color-neutral-surface-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
                  <div>
                    <div style={{ fontWeight: 'var(--ds-font-weight-medium)', marginBottom: 'var(--ds-spacing-1)' }}>{t("settings.integrations.vipps")}</div>
                    <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>{t("settings.integrations.vippsDesc")}</Paragraph>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                    {integrations?.vipps?.enabled ? (
                      <Badge color="success">{t("state.active")}</Badge>
                    ) : (
                      <Badge color="neutral">{t("state.inactive")}</Badge>
                    )}
                    <Switch
                      checked={integrations?.vipps?.enabled || false}
                      onChange={(checked) => handleIntegrationToggle('vipps', checked)}
                    />
                  </div>
                </div>
              </Stack>
            </Card>

            <Card>
              <Stack spacing={4}>
                <div>
                  <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
                    {t("settings.integrations.accessControl")}
                  </Heading>
                  <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {t("settings.integrations.accessControlDesc")}
                  </Paragraph>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--ds-spacing-3)', backgroundColor: 'var(--ds-color-neutral-surface-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
                  <div>
                    <div style={{ fontWeight: 'var(--ds-font-weight-medium)', marginBottom: 'var(--ds-spacing-1)' }}>{t("settings.integrations.rco")}</div>
                    <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>{t("settings.integrations.rcoDesc")}</Paragraph>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                    {integrations?.rco?.enabled ? (
                      <Badge color="success">{t("state.active")}</Badge>
                    ) : (
                      <Badge color="neutral">{t("state.inactive")}</Badge>
                    )}
                    <Switch
                      checked={integrations?.rco?.enabled || false}
                      onChange={(checked) => handleIntegrationToggle('rco', checked)}
                    />
                  </div>
                </div>
              </Stack>
            </Card>

            <Card>
              <Stack spacing={4}>
                <div>
                  <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
                    {t("settings.integrations.calendar")}
                  </Heading>
                  <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {t("settings.integrations.calendarDesc")}
                  </Paragraph>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--ds-spacing-3)', backgroundColor: 'var(--ds-color-neutral-surface-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
                  <div>
                    <div style={{ fontWeight: 'var(--ds-font-weight-medium)', marginBottom: 'var(--ds-spacing-1)' }}>{t("settings.integrations.googleCalendar")}</div>
                    <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>{t("settings.integrations.googleCalendarDesc")}</Paragraph>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                    {integrations?.googleCalendar?.enabled ? (
                      <Badge color="success">{t("state.active")}</Badge>
                    ) : (
                      <Badge color="neutral">{t("state.inactive")}</Badge>
                    )}
                    <Switch
                      checked={integrations?.googleCalendar?.enabled || false}
                      onChange={(checked) => handleIntegrationToggle('googleCalendar', checked)}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--ds-spacing-3)', backgroundColor: 'var(--ds-color-neutral-surface-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
                  <div>
                    <div style={{ fontWeight: 'var(--ds-font-weight-medium)', marginBottom: 'var(--ds-spacing-1)' }}>{t("settings.integrations.outlook")}</div>
                    <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>{t("settings.integrations.outlookDesc")}</Paragraph>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                    {integrations?.outlook?.enabled ? (
                      <Badge color="success">{t("state.active")}</Badge>
                    ) : (
                      <Badge color="neutral">{t("state.inactive")}</Badge>
                    )}
                    <Switch
                      checked={integrations?.outlook?.enabled || false}
                      onChange={(checked) => handleIntegrationToggle('outlook', checked)}
                    />
                  </div>
                </div>
              </Stack>
            </Card>

            <Card>
              <Stack spacing={4}>
                <div>
                  <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
                    {t("settings.integrations.finance")}
                  </Heading>
                  <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {t("settings.integrations.financeDesc")}
                  </Paragraph>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--ds-spacing-3)', backgroundColor: 'var(--ds-color-neutral-surface-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
                  <div>
                    <div style={{ fontWeight: 'var(--ds-font-weight-medium)', marginBottom: 'var(--ds-spacing-1)' }}>{t("settings.integrations.visma")}</div>
                    <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>{t("settings.integrations.vismaDesc")}</Paragraph>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                    {integrations?.visma?.enabled ? (
                      <Badge color="success">{t("state.active")}</Badge>
                    ) : (
                      <Badge color="neutral">{t("state.inactive")}</Badge>
                    )}
                    <Switch
                      checked={integrations?.visma?.enabled || false}
                      onChange={(checked) => handleIntegrationToggle('visma', checked)}
                    />
                  </div>
                </div>
              </Stack>
            </Card>

            <Card>
              <Stack spacing={4}>
                <div>
                  <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
                    {t("settings.integrations.publicRegisters")}
                  </Heading>
                  <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {t("settings.integrations.publicRegistersDesc")}
                  </Paragraph>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--ds-spacing-3)', backgroundColor: 'var(--ds-color-neutral-surface-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
                  <div>
                    <div style={{ fontWeight: 'var(--ds-font-weight-medium)', marginBottom: 'var(--ds-spacing-1)' }}>{t("settings.integrations.brreg")}</div>
                    <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>{t("settings.integrations.brregDesc")}</Paragraph>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                    {integrations?.brreg?.enabled ? (
                      <Badge color="success">{t("state.active")}</Badge>
                    ) : (
                      <Badge color="neutral">{t("state.inactive")}</Badge>
                    )}
                    <Switch
                      checked={integrations?.brreg?.enabled || false}
                      onChange={(checked) => handleIntegrationToggle('brreg', checked)}
                    />
                  </div>
                </div>
              </Stack>
            </Card>
          </Stack>
        </Tabs.Panel>

        {/* Branding */}
        <Tabs.Panel value="branding">
          <Card>
            <Stack spacing={5}>
              <div>
                <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
                  {t("settings.branding.page.title")}
                </Heading>
                <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                  {t("settings.branding.desc")}
                </Paragraph>
              </div>

              <Stack spacing={4}>
                <FormField
                  label={t("settings.branding.logoUrl")}
                  description={t("settings.branding.logoUrlDesc")}
                >
                  <Textfield aria-label={t("settings.branding.logoUrl")}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      branding: { ...prev.branding, logo: e.target.value }
                    }))}
                    placeholder={t('backoffice.placeholder.httpsexamplecomlogopng')}
                  />
                </FormField>

                <FormField
                  label={t("settings.branding.primaryColor")}
                  description={t("settings.branding.primaryColorDesc")}
                >
                  <Textfield aria-label={t("settings.branding.primaryColor")}
                    value={formData.branding.primaryColor || '#1A56DB'}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      branding: { ...prev.branding, primaryColor: e.target.value }
                    }))}
                  />
                </FormField>

                <FormField
                  label={t("settings.branding.secondaryColor")}
                  description={t("settings.branding.secondaryColorDesc")}
                >
                  <Textfield aria-label={t("settings.branding.secondaryColor")}
                    value={formData.branding.secondaryColor || '#6B7280'}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      branding: { ...prev.branding, secondaryColor: e.target.value }
                    }))}
                  />
                </FormField>

                <FormField
                  label={t("settings.branding.faviconUrl")}
                  description={t("settings.branding.faviconUrlDesc")}
                >
                  <Textfield aria-label={t("settings.branding.faviconUrl")}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      branding: { ...prev.branding, favicon: e.target.value }
                    }))}
                    placeholder={t('backoffice.placeholder.httpsexamplecomfaviconico')}
                  />
                </FormField>
              </Stack>

              <div style={{ paddingTop: 'var(--ds-spacing-3)', borderTop: '1px solid var(--ds-color-neutral-border-subtle)' }}>
                <Button onClick={handleSave} disabled={isSaving} type="button">
                  <SaveIcon />
                  {isSaving ? t("state.saving") : t("action.save")}
                </Button>
              </div>
            </Stack>
          </Card>
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}
