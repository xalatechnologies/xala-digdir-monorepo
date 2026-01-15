/**
 * OrganizationNotificationsPage
 *
 * Organization notification settings page for MinSide.
 * Allows organization admins to configure:
 * - Master channel toggles (in-app, email, SMS)
 * - Per-notification-type channel preferences
 * - Who receives notifications (admins, booking managers, all members)
 * - Contact information for notifications
 * - Quiet hours configuration
 *
 * Production-ready: Uses SDK hooks for data fetching and mutations.
 *
 * Based on Skien demo specification:
 * - In-app: always on by default
 * - E-post: on for decisions and changes
 * - SMS: off by default, but recommended for reminders and cancellations
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Input,
  Switch,
  Spinner,
  Badge,
  Label,
  Alert,
} from '@xala/ds';
import { useT } from '@xala/i18n';
import {
  useOrganizationNotificationPreferences,
  useUpdateOrganizationNotificationPreferences,
  DEFAULT_NOTIFICATION_PREFERENCES,
} from '@digilist/client-sdk';
import {
  NotificationPreferencesMatrix,
} from '../../components/notifications';
import type {
  NotificationPreferencesMatrixType,
  NotificationChannel,
} from '../../components/notifications';
import { useAccountContext } from '../../providers/AccountContextProvider';

// ============================================================================
// Types
// ============================================================================

interface LocalSettings {
  // Master channel toggles
  inAppEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;

  // Granular notification matrix
  notificationMatrix: NotificationPreferencesMatrixType;

  // Recipient settings
  notifyAdmins: boolean;
  notifyBookingManagers: boolean;
  notifyAllMembers: boolean;

  // Contact information
  primaryEmail: string;
  primaryPhone: string;

  // Quiet hours
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

const DEFAULT_LOCAL_SETTINGS: LocalSettings = {
  inAppEnabled: true,
  emailEnabled: true,
  smsEnabled: false,
  notificationMatrix: DEFAULT_NOTIFICATION_PREFERENCES,
  notifyAdmins: true,
  notifyBookingManagers: true,
  notifyAllMembers: false,
  primaryEmail: '',
  primaryPhone: '',
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
};

// ============================================================================
// Component
// ============================================================================

export function OrganizationNotificationsPage(): React.ReactElement {
  const t = useT();
  const { selectedOrganization } = useAccountContext();
  const organizationId = selectedOrganization?.id;

  // SDK hooks
  const {
    data: preferencesData,
    isLoading,
    isError,
    error,
  } = useOrganizationNotificationPreferences(organizationId);

  const updateMutation = useUpdateOrganizationNotificationPreferences();

  // Local state for form
  const [localSettings, setLocalSettings] = useState<LocalSettings>(DEFAULT_LOCAL_SETTINGS);
  const [hasChanges, setHasChanges] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync server data to local state when loaded
  useEffect(() => {
    if (preferencesData?.data) {
      const serverPrefs = preferencesData.data;
      setLocalSettings({
        inAppEnabled: serverPrefs.inAppEnabled ?? true,
        emailEnabled: serverPrefs.emailEnabled ?? true,
        smsEnabled: serverPrefs.smsEnabled ?? false,
        notificationMatrix: serverPrefs.notificationMatrix ?? DEFAULT_NOTIFICATION_PREFERENCES,
        notifyAdmins: serverPrefs.notifyAdmins ?? true,
        notifyBookingManagers: serverPrefs.notifyBookingManagers ?? true,
        notifyAllMembers: serverPrefs.notifyAllMembers ?? false,
        primaryEmail: serverPrefs.primaryEmail ?? '',
        primaryPhone: serverPrefs.primaryPhone ?? '',
        quietHoursEnabled: serverPrefs.quietHoursEnabled ?? false,
        quietHoursStart: serverPrefs.quietHoursStart ?? '22:00',
        quietHoursEnd: serverPrefs.quietHoursEnd ?? '07:00',
      });
      setHasChanges(false);
    }
  }, [preferencesData]);

  // Handle master toggle change
  const handleMasterToggleChange = useCallback(
    (channel: NotificationChannel, enabled: boolean) => {
      const key = channel === 'in_app' ? 'inAppEnabled' : `${channel}Enabled`;
      setLocalSettings((prev) => ({
        ...prev,
        [key]: enabled,
      }));
      setHasChanges(true);
    },
    []
  );

  // Handle notification matrix change
  const handleMatrixChange = useCallback((matrix: NotificationPreferencesMatrixType) => {
    setLocalSettings((prev) => ({
      ...prev,
      notificationMatrix: matrix,
    }));
    setHasChanges(true);
  }, []);

  // Handle recipient setting change
  const handleRecipientChange = useCallback((key: keyof LocalSettings, value: boolean) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  }, []);

  // Handle contact info change
  const handleContactChange = useCallback((key: 'primaryEmail' | 'primaryPhone', value: string) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  }, []);

  // Handle quiet hours change
  const handleQuietHoursChange = useCallback(
    (key: 'quietHoursEnabled' | 'quietHoursStart' | 'quietHoursEnd', value: string | boolean) => {
      setLocalSettings((prev) => ({ ...prev, [key]: value }));
      setHasChanges(true);
    },
    []
  );

  // Save settings via SDK mutation
  const handleSave = useCallback(async () => {
    if (!organizationId) return;

    await updateMutation.mutateAsync({
      organizationId,
      data: {
        emailEnabled: localSettings.emailEnabled,
        smsEnabled: localSettings.smsEnabled,
        inAppEnabled: localSettings.inAppEnabled,
        notificationMatrix: localSettings.notificationMatrix,
        notifyAdmins: localSettings.notifyAdmins,
        notifyBookingManagers: localSettings.notifyBookingManagers,
        notifyAllMembers: localSettings.notifyAllMembers,
        primaryEmail: localSettings.primaryEmail || undefined,
        primaryPhone: localSettings.primaryPhone || undefined,
        quietHoursEnabled: localSettings.quietHoursEnabled,
        quietHoursStart: localSettings.quietHoursStart,
        quietHoursEnd: localSettings.quietHoursEnd,
      },
    });
    setHasChanges(false);
  }, [organizationId, localSettings, updateMutation]);

  // Reset to defaults
  const handleReset = useCallback(() => {
    setLocalSettings(DEFAULT_LOCAL_SETTINGS);
    setHasChanges(true);
  }, []);

  // Derived state
  const isSaving = updateMutation.isPending;
  const saveError = updateMutation.error;

  // Show error if no organization selected
  if (!organizationId) {
    return (
      <div style={{ padding: 'var(--ds-spacing-8)' }}>
        <Alert data-color="warning">
          <Heading level={3} data-size="sm" style={{ margin: 0 }}>
            Ingen organisasjon valgt
          </Heading>
          <Paragraph style={{ margin: 0, marginTop: 'var(--ds-spacing-2)' }}>
            Velg en organisasjon for å konfigurere varslingsinnstillinger.
          </Paragraph>
        </Alert>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
        <Spinner aria-label={t('common.loading')} data-size="lg" />
      </div>
    );
  }

  // Show error state
  if (isError) {
    return (
      <div style={{ padding: 'var(--ds-spacing-8)' }}>
        <Alert data-color="danger">
          <Heading level={3} data-size="sm" style={{ margin: 0 }}>
            Kunne ikke laste innstillinger
          </Heading>
          <Paragraph style={{ margin: 0, marginTop: 'var(--ds-spacing-2)' }}>
            {error instanceof Error ? error.message : 'En feil oppstod ved lasting av varslingsinnstillinger.'}
          </Paragraph>
        </Alert>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          gap: 'var(--ds-spacing-4)',
        }}
      >
        <div>
          <Heading level={1} data-size="lg" style={{ margin: 0 }}>
            {t('notifications.org.title')}
          </Heading>
          <Paragraph
            style={{
              color: 'var(--ds-color-neutral-text-subtle)',
              marginTop: 'var(--ds-spacing-2)',
              marginBottom: 0,
            }}
          >
            {t('notifications.org.subtitle')}
          </Paragraph>
        </div>
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
          <Button
            type="button"
            variant="tertiary"
            data-size="md"
            onClick={handleReset}
            disabled={isSaving}
            style={{ minHeight: '44px' }}
          >
            Tilbakestill til standard
          </Button>
          <Button
            type="button"
            variant="primary"
            data-size="md"
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            style={{ minHeight: '44px' }}
          >
            {isSaving ? t('common.saving') : t('common.save')}
            {hasChanges && !isSaving && (
              <Badge
                data-size="sm"
                style={{
                  marginLeft: 'var(--ds-spacing-2)',
                  backgroundColor: 'var(--ds-color-accent-surface-default)',
                  color: 'var(--ds-color-accent-text-default)',
                }}
              >
                Endringer
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Save error alert */}
      {saveError && (
        <Alert data-color="danger">
          <Paragraph style={{ margin: 0 }}>
            Kunne ikke lagre innstillinger: {saveError instanceof Error ? saveError.message : 'Ukjent feil'}
          </Paragraph>
        </Alert>
      )}

      {/* Notification Matrix */}
      <NotificationPreferencesMatrix
        preferences={localSettings.notificationMatrix}
        onPreferencesChange={handleMatrixChange}
        masterToggles={{
          inAppEnabled: localSettings.inAppEnabled,
          emailEnabled: localSettings.emailEnabled,
          smsEnabled: localSettings.smsEnabled,
        }}
        onMasterToggleChange={handleMasterToggleChange}
        showMasterToggles={true}
        showSmsRecommended={true}
      />

      {/* Recipients */}
      <Card style={{ padding: 'var(--ds-spacing-5)' }}>
        <Heading level={2} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
          {t('notifications.org.recipients.title')}
        </Heading>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
          {[
            {
              key: 'notifyAdmins' as const,
              label: t('notifications.org.recipients.admins'),
              desc: t('notifications.org.recipients.adminsDesc'),
            },
            {
              key: 'notifyBookingManagers' as const,
              label: t('notifications.org.recipients.bookingManagers'),
              desc: t('notifications.org.recipients.bookingManagersDesc'),
            },
            {
              key: 'notifyAllMembers' as const,
              label: t('notifications.org.recipients.allMembers'),
              desc: t('notifications.org.recipients.allMembersDesc'),
            },
          ].map((item) => (
            <div
              key={item.key}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 'var(--ds-spacing-3)',
                borderRadius: 'var(--ds-border-radius-md)',
                backgroundColor: 'var(--ds-color-neutral-surface-hover)',
              }}
            >
              <div>
                <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                  {item.label}
                </Paragraph>
                <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                  {item.desc}
                </Paragraph>
              </div>
              <Switch
                aria-label={item.label}
                checked={localSettings[item.key]}
                onChange={(e) => handleRecipientChange(item.key, e.target.checked)}
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Contact Information */}
      <Card style={{ padding: 'var(--ds-spacing-5)' }}>
        <Heading level={2} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
          {t('notifications.org.contact.title')}
        </Heading>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: 'var(--ds-spacing-4)',
          }}
        >
          <div>
            <Label
              style={{
                display: 'block',
                marginBottom: 'var(--ds-spacing-2)',
              }}
            >
              {t('notifications.org.contact.primaryEmail')}
            </Label>
            <Input
              type="email"
              value={localSettings.primaryEmail}
              onChange={(e) => handleContactChange('primaryEmail', e.target.value)}
              placeholder="post@organisasjon.no"
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <Label
              style={{
                display: 'block',
                marginBottom: 'var(--ds-spacing-2)',
              }}
            >
              {t('notifications.org.contact.primaryPhone')}
            </Label>
            <Input
              type="tel"
              value={localSettings.primaryPhone}
              onChange={(e) => handleContactChange('primaryPhone', e.target.value)}
              placeholder="+47 123 45 678"
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </Card>

      {/* Quiet Hours */}
      <Card style={{ padding: 'var(--ds-spacing-5)' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 'var(--ds-spacing-4)',
          }}
        >
          <div>
            <Heading level={2} data-size="sm" style={{ margin: 0 }}>
              {t('notifications.org.quietHours.title')}
            </Heading>
            <Paragraph
              data-size="sm"
              style={{
                margin: 0,
                marginTop: 'var(--ds-spacing-1)',
                color: 'var(--ds-color-neutral-text-subtle)',
              }}
            >
              {t('notifications.org.quietHours.description')}
            </Paragraph>
          </div>
          <Switch
            aria-label={t('notifications.org.quietHours.enabled')}
            checked={localSettings.quietHoursEnabled}
            onChange={(e) => handleQuietHoursChange('quietHoursEnabled', e.target.checked)}
          />
        </div>

        {localSettings.quietHoursEnabled && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: 'var(--ds-spacing-4)',
            }}
          >
            <div>
              <Label
                style={{
                  display: 'block',
                  marginBottom: 'var(--ds-spacing-2)',
                }}
              >
                {t('notifications.org.quietHours.start')}
              </Label>
              <Input
                type="time"
                value={localSettings.quietHoursStart}
                onChange={(e) => handleQuietHoursChange('quietHoursStart', e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <Label
                style={{
                  display: 'block',
                  marginBottom: 'var(--ds-spacing-2)',
                }}
              >
                {t('notifications.org.quietHours.end')}
              </Label>
              <Input
                type="time"
                value={localSettings.quietHoursEnd}
                onChange={(e) => handleQuietHoursChange('quietHoursEnd', e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Save indicator */}
      {isSaving && (
        <div
          style={{
            position: 'fixed',
            bottom: 'var(--ds-spacing-6)',
            right: 'var(--ds-spacing-6)',
            padding: 'var(--ds-spacing-4)',
            backgroundColor: 'var(--ds-color-brand-1-surface-default)',
            borderRadius: 'var(--ds-border-radius-md)',
            boxShadow: 'var(--ds-shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--ds-spacing-3)',
          }}
        >
          <Spinner data-size="sm" aria-hidden="true" />
          <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-brand-1-text-default)' }}>
            {t('notifications.settings.save')}
          </Paragraph>
        </div>
      )}

      {/* Success indicator */}
      {updateMutation.isSuccess && !hasChanges && (
        <div
          style={{
            position: 'fixed',
            bottom: 'var(--ds-spacing-6)',
            right: 'var(--ds-spacing-6)',
            padding: 'var(--ds-spacing-4)',
            backgroundColor: 'var(--ds-color-success-surface-default)',
            borderRadius: 'var(--ds-border-radius-md)',
            boxShadow: 'var(--ds-shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--ds-spacing-3)',
          }}
        >
          <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-success-text-default)' }}>
            ✓ Innstillinger lagret
          </Paragraph>
        </div>
      )}
    </div>
  );
}
