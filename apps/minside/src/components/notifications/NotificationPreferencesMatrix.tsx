/**
 * NotificationPreferencesMatrix
 *
 * A comprehensive notification settings matrix component that allows users
 * to configure which channels (in-app, email, SMS) to use for each notification type.
 *
 * Based on Skien demo specification:
 * - In-app: always on by default
 * - E-post: on for decisions and changes
 * - SMS: off by default, but recommended for reminders and cancellations
 */

import { useCallback, useMemo } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Switch,
  Badge,
  Checkbox,
} from '@xala/ds';
import { useT } from '@xala/i18n';
import type {
  NotificationType,
  NotificationChannel,
  NotificationPreferencesMatrix as MatrixType,
  NotificationChannelSettings,
} from '@digilist/client-sdk';
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  NOTIFICATION_TYPES_REGISTRY,
} from '@digilist/client-sdk';

// ============================================================================
// Types
// ============================================================================

interface NotificationPreferencesMatrixProps {
  /** Current preferences matrix */
  preferences: MatrixType;
  /** Callback when preferences change */
  onPreferencesChange: (preferences: MatrixType) => void;
  /** Master channel toggles (optional) */
  masterToggles?: {
    inAppEnabled: boolean;
    emailEnabled: boolean;
    smsEnabled: boolean;
  };
  /** Callback when master toggles change (optional) */
  onMasterToggleChange?: (channel: NotificationChannel, enabled: boolean) => void;
  /** Whether the component is in a loading state */
  isLoading?: boolean;
  /** Whether to show the master toggles section */
  showMasterToggles?: boolean;
  /** Whether to show SMS recommended badges */
  showSmsRecommended?: boolean;
  /** Title for the component */
  title?: string;
}

type NotificationCategory = 'booking' | 'reminder' | 'billing';

// ============================================================================
// Subcomponents
// ============================================================================

interface ChannelHeaderProps {
  channel: NotificationChannel;
  label: string;
  enabled?: boolean;
}

function ChannelHeader({ channel, label, enabled = true }: ChannelHeaderProps) {
  const getChannelIcon = (ch: NotificationChannel) => {
    switch (ch) {
      case 'in_app':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        );
      case 'email':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        );
      case 'sms':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="5" y="2" width="14" height="20" rx="2" />
            <line x1="12" y1="18" x2="12" y2="18" />
          </svg>
        );
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--ds-spacing-1)',
        opacity: enabled ? 1 : 0.5,
      }}
    >
      <div
        style={{
          color: enabled
            ? 'var(--ds-color-neutral-text-default)'
            : 'var(--ds-color-neutral-text-subtle)',
        }}
      >
        {getChannelIcon(channel)}
      </div>
      <Paragraph
        data-size="xs"
        style={{
          margin: 0,
          fontWeight: 'var(--ds-font-weight-medium)',
          textAlign: 'center',
        }}
      >
        {label}
      </Paragraph>
    </div>
  );
}

interface NotificationTypeRowProps {
  labelKey: string;
  descriptionKey: string;
  settings: NotificationChannelSettings;
  smsRecommended: boolean;
  showSmsRecommendedBadge: boolean;
  masterToggles?: {
    inAppEnabled: boolean;
    emailEnabled: boolean;
    smsEnabled: boolean;
  };
  onChange: (channel: NotificationChannel, enabled: boolean) => void;
}

function NotificationTypeRow({
  labelKey,
  descriptionKey,
  settings,
  smsRecommended,
  showSmsRecommendedBadge,
  masterToggles,
  onChange,
}: NotificationTypeRowProps) {
  const t = useT();

  // Determine if channels are enabled based on master toggles
  const isInAppEnabled = masterToggles?.inAppEnabled ?? true;
  const isEmailEnabled = masterToggles?.emailEnabled ?? true;
  const isSmsEnabled = masterToggles?.smsEnabled ?? true;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 80px 80px 80px',
        gap: 'var(--ds-spacing-4)',
        alignItems: 'center',
        padding: 'var(--ds-spacing-4) 0',
        borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
      }}
    >
      {/* Notification type info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
          <Paragraph
            data-size="sm"
            style={{
              margin: 0,
              fontWeight: 'var(--ds-font-weight-medium)',
            }}
          >
            {t(labelKey)}
          </Paragraph>
          {smsRecommended && showSmsRecommendedBadge && (
            <Badge
              data-size="sm"
              style={{
                backgroundColor: 'var(--ds-color-info-surface-default)',
                color: 'var(--ds-color-info-text-default)',
              }}
            >
              SMS anbefalt
            </Badge>
          )}
        </div>
        <Paragraph
          data-size="xs"
          style={{
            margin: 0,
            color: 'var(--ds-color-neutral-text-subtle)',
          }}
        >
          {t(descriptionKey)}
        </Paragraph>
      </div>

      {/* In-app checkbox */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Checkbox
          checked={settings.in_app && isInAppEnabled}
          onChange={(e) => onChange('in_app', e.target.checked)}
          disabled={!isInAppEnabled}
          aria-label={`${t(labelKey)} - ${t('notifications.channels.inApp')}`}
        />
      </div>

      {/* Email checkbox */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Checkbox
          checked={settings.email && isEmailEnabled}
          onChange={(e) => onChange('email', e.target.checked)}
          disabled={!isEmailEnabled}
          aria-label={`${t(labelKey)} - ${t('notifications.channels.email')}`}
        />
      </div>

      {/* SMS checkbox */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Checkbox
          checked={settings.sms && isSmsEnabled}
          onChange={(e) => onChange('sms', e.target.checked)}
          disabled={!isSmsEnabled}
          aria-label={`${t(labelKey)} - ${t('notifications.channels.sms')}`}
        />
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function NotificationPreferencesMatrix({
  preferences,
  onPreferencesChange,
  masterToggles,
  onMasterToggleChange,
  isLoading: _isLoading = false,
  showMasterToggles = true,
  showSmsRecommended = true,
  title,
}: NotificationPreferencesMatrixProps) {
  const t = useT();

  // Group notification types by category
  const groupedTypes = useMemo(() => {
    const groups: Record<NotificationCategory, typeof NOTIFICATION_TYPES_REGISTRY> = {
      booking: [],
      reminder: [],
      billing: [],
    };

    for (const type of NOTIFICATION_TYPES_REGISTRY) {
      groups[type.category].push(type);
    }

    return groups;
  }, []);

  // Handle individual notification type channel change
  const handleTypeChannelChange = useCallback(
    (type: NotificationType, channel: NotificationChannel, enabled: boolean) => {
      const newPreferences = {
        ...preferences,
        [type]: {
          ...preferences[type],
          [channel]: enabled,
        },
      };
      onPreferencesChange(newPreferences);
    },
    [preferences, onPreferencesChange]
  );

  // Render category section
  const renderCategory = (category: NotificationCategory, types: typeof NOTIFICATION_TYPES_REGISTRY) => {
    const categoryLabels: Record<NotificationCategory, string> = {
      booking: 'notifications.categories.booking',
      reminder: 'notifications.categories.reminder',
      billing: 'notifications.categories.billing',
    };

    const categoryDescLabels: Record<NotificationCategory, string> = {
      booking: 'notifications.categories.bookingDesc',
      reminder: 'notifications.categories.reminderDesc',
      billing: 'notifications.categories.billingDesc',
    };

    if (types.length === 0) return null;

    return (
      <div key={category} style={{ marginBottom: 'var(--ds-spacing-6)' }}>
        <div style={{ marginBottom: 'var(--ds-spacing-3)' }}>
          <Heading level={3} data-size="xs" style={{ margin: 0 }}>
            {t(categoryLabels[category])}
          </Heading>
          <Paragraph
            data-size="xs"
            style={{
              margin: 0,
              marginTop: 'var(--ds-spacing-1)',
              color: 'var(--ds-color-neutral-text-subtle)',
            }}
          >
            {t(categoryDescLabels[category])}
          </Paragraph>
        </div>

        {types.map((typeInfo) => (
          <NotificationTypeRow
            key={typeInfo.type}
            labelKey={typeInfo.labelKey}
            descriptionKey={typeInfo.descriptionKey}
            settings={preferences[typeInfo.type]}
            smsRecommended={typeInfo.smsRecommended}
            showSmsRecommendedBadge={showSmsRecommended}
            masterToggles={masterToggles}
            onChange={(channel, enabled) => handleTypeChannelChange(typeInfo.type, channel, enabled)}
          />
        ))}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Master Toggles */}
      {showMasterToggles && masterToggles && onMasterToggleChange && (
        <Card style={{ padding: 'var(--ds-spacing-5)' }}>
          <Heading level={2} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
            {t('notifications.masterToggles.title')}
          </Heading>
          <Paragraph
            data-size="sm"
            style={{
              margin: 0,
              marginBottom: 'var(--ds-spacing-4)',
              color: 'var(--ds-color-neutral-text-subtle)',
            }}
          >
            {t('notifications.masterToggles.description')}
          </Paragraph>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
            {/* In-app (always on info) */}
            <div
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
                  {t('notifications.channels.inApp')}
                </Paragraph>
                <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                  {t('notifications.masterToggles.inAppAlwaysOn')}
                </Paragraph>
              </div>
              <Switch
                checked={masterToggles.inAppEnabled}
                onChange={(e) => onMasterToggleChange('in_app', e.target.checked)}
                aria-label={t('notifications.channels.inApp')}
              />
            </div>

            {/* Email toggle */}
            <div
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
                  {t('notifications.channels.email')}
                </Paragraph>
                <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                  {t('notifications.channels.emailDesc')}
                </Paragraph>
              </div>
              <Switch
                checked={masterToggles.emailEnabled}
                onChange={(e) => onMasterToggleChange('email', e.target.checked)}
                aria-label={t('notifications.channels.email')}
              />
            </div>

            {/* SMS toggle */}
            <div
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                  <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                    {t('notifications.channels.sms')}
                  </Paragraph>
                  <Badge
                    data-size="sm"
                    style={{
                      backgroundColor: 'var(--ds-color-info-surface-default)',
                      color: 'var(--ds-color-info-text-default)',
                    }}
                  >
                    {t('notifications.channels.smsRecommended')}
                  </Badge>
                </div>
                <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                  {t('notifications.channels.smsDesc')}
                </Paragraph>
              </div>
              <Switch
                checked={masterToggles.smsEnabled}
                onChange={(e) => onMasterToggleChange('sms', e.target.checked)}
                aria-label={t('notifications.channels.sms')}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Notification Matrix */}
      <Card style={{ padding: 'var(--ds-spacing-5)' }}>
        <Heading level={2} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>
          {title ?? t('notifications.matrix.title')}
        </Heading>
        <Paragraph
          data-size="sm"
          style={{
            margin: 0,
            marginBottom: 'var(--ds-spacing-6)',
            color: 'var(--ds-color-neutral-text-subtle)',
          }}
        >
          {t('notifications.matrix.description')}
        </Paragraph>

        {/* Column headers */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 80px 80px 80px',
            gap: 'var(--ds-spacing-4)',
            paddingBottom: 'var(--ds-spacing-4)',
            borderBottom: '2px solid var(--ds-color-neutral-border-default)',
            marginBottom: 'var(--ds-spacing-4)',
          }}
        >
          <div />
          <ChannelHeader
            channel="in_app"
            label={t('notifications.channels.inApp')}
            enabled={masterToggles?.inAppEnabled}
          />
          <ChannelHeader
            channel="email"
            label={t('notifications.channels.email')}
            enabled={masterToggles?.emailEnabled}
          />
          <ChannelHeader
            channel="sms"
            label={t('notifications.channels.sms')}
            enabled={masterToggles?.smsEnabled}
          />
        </div>

        {/* Notification types by category */}
        {renderCategory('booking', groupedTypes.booking)}
        {renderCategory('reminder', groupedTypes.reminder)}
        {renderCategory('billing', groupedTypes.billing)}
      </Card>
    </div>
  );
}

// ============================================================================
// Exports
// ============================================================================

export {
  DEFAULT_NOTIFICATION_PREFERENCES,
  NOTIFICATION_TYPES_REGISTRY,
};

export type {
  NotificationPreferencesMatrixProps,
  NotificationType,
  NotificationChannel,
  MatrixType as NotificationPreferencesMatrixType,
  NotificationChannelSettings,
};
