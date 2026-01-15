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
} from '@xala/ds';
import { useT } from '@xala/i18n';
import {
  NotificationPreferencesMatrix,
  DEFAULT_NOTIFICATION_PREFERENCES,
} from '../../components/notifications';
import type {
  NotificationPreferencesMatrixType,
  NotificationChannel,
} from '../../components/notifications';

// ============================================================================
// Types
// ============================================================================

interface OrganizationNotificationSettings {
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

const DEFAULT_SETTINGS: OrganizationNotificationSettings = {
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
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [settings, setSettings] = useState<OrganizationNotificationSettings>(DEFAULT_SETTINGS);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load settings (simulated - replace with SDK hook)
  useEffect(() => {
    // TODO: Replace with actual SDK hook: useOrganizationNotificationPreferences()
    const loadSettings = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      // In production, this would come from the API
      setSettings({
        ...DEFAULT_SETTINGS,
        primaryEmail: 'post@skien-il.no',
        primaryPhone: '+47 35 50 12 34',
      });
      setIsLoading(false);
    };
    loadSettings();
  }, []);

  // Handle master toggle change
  const handleMasterToggleChange = useCallback(
    (channel: NotificationChannel, enabled: boolean) => {
      setSettings((prev) => ({
        ...prev,
        [`${channel === 'in_app' ? 'inApp' : channel}Enabled`]: enabled,
      }));
      setHasChanges(true);
    },
    []
  );

  // Handle notification matrix change
  const handleMatrixChange = useCallback((matrix: NotificationPreferencesMatrixType) => {
    setSettings((prev) => ({
      ...prev,
      notificationMatrix: matrix,
    }));
    setHasChanges(true);
  }, []);

  // Handle recipient setting change
  const handleRecipientChange = useCallback((key: keyof OrganizationNotificationSettings, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  }, []);

  // Handle contact info change
  const handleContactChange = useCallback((key: 'primaryEmail' | 'primaryPhone', value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  }, []);

  // Handle quiet hours change
  const handleQuietHoursChange = useCallback(
    (key: 'quietHoursEnabled' | 'quietHoursStart' | 'quietHoursEnd', value: string | boolean) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
      setHasChanges(true);
    },
    []
  );

  // Save settings
  const handleSave = async () => {
    setIsSaving(true);
    // TODO: Replace with actual SDK mutation: useUpdateOrganizationNotificationPreferences()
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    setHasChanges(false);
  };

  // Reset to defaults
  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    setHasChanges(true);
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
        <Spinner aria-label={t('common.loading')} data-size="lg" />
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

      {/* Notification Matrix */}
      <NotificationPreferencesMatrix
        preferences={settings.notificationMatrix}
        onPreferencesChange={handleMatrixChange}
        masterToggles={{
          inAppEnabled: settings.inAppEnabled,
          emailEnabled: settings.emailEnabled,
          smsEnabled: settings.smsEnabled,
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
                checked={settings[item.key]}
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
            <label
              style={{
                display: 'block',
                marginBottom: 'var(--ds-spacing-2)',
                fontWeight: 'var(--ds-font-weight-medium)',
                fontSize: 'var(--ds-font-size-sm)',
              }}
            >
              {t('notifications.org.contact.primaryEmail')}
            </label>
            <Input
              type="email"
              value={settings.primaryEmail}
              onChange={(e) => handleContactChange('primaryEmail', e.target.value)}
              placeholder="post@organisasjon.no"
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: 'var(--ds-spacing-2)',
                fontWeight: 'var(--ds-font-weight-medium)',
                fontSize: 'var(--ds-font-size-sm)',
              }}
            >
              {t('notifications.org.contact.primaryPhone')}
            </label>
            <Input
              type="tel"
              value={settings.primaryPhone}
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
            checked={settings.quietHoursEnabled}
            onChange={(e) => handleQuietHoursChange('quietHoursEnabled', e.target.checked)}
          />
        </div>

        {settings.quietHoursEnabled && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: 'var(--ds-spacing-4)',
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: 'var(--ds-spacing-2)',
                  fontWeight: 'var(--ds-font-weight-medium)',
                  fontSize: 'var(--ds-font-size-sm)',
                }}
              >
                {t('notifications.org.quietHours.start')}
              </label>
              <Input
                type="time"
                value={settings.quietHoursStart}
                onChange={(e) => handleQuietHoursChange('quietHoursStart', e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: 'var(--ds-spacing-2)',
                  fontWeight: 'var(--ds-font-weight-medium)',
                  fontSize: 'var(--ds-font-size-sm)',
                }}
              >
                {t('notifications.org.quietHours.end')}
              </label>
              <Input
                type="time"
                value={settings.quietHoursEnd}
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
    </div>
  );
}
