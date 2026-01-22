/**
 * NotificationsTab - Notification settings tab
 */

import React from 'react';
import { Card, Heading, Paragraph, Switch } from '@digdir/designsystemet-react';

export interface NotificationSettingsData {
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  pushNotifications?: boolean;
  marketingEmails?: boolean;
}

export interface NotificationsTabProps {
  settings?: NotificationSettingsData;
  onSave?: (settings: NotificationSettingsData) => void;
  isLoading?: boolean;
  t?: (key: string) => string;
  className?: string;
}

export function NotificationsTab({
  settings = {},
  onSave,
  isLoading,
  t = (key) => key,
  className,
}: NotificationsTabProps) {
  const [formData, setFormData] = React.useState<NotificationSettingsData>(settings);

  const handleChange = (key: keyof NotificationSettingsData, value: boolean) => {
    const newSettings = { ...formData, [key]: value };
    setFormData(newSettings);
    onSave?.(newSettings);
  };

  return (
    <div className={className}>
      <Card>
        <Card.Block>
          <Heading level={3} size="sm" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
            {t('settings.notifications.title')}
          </Heading>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Paragraph>{t('settings.notifications.email')}</Paragraph>
                <Paragraph size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                  {t('settings.notifications.emailDescription')}
                </Paragraph>
              </div>
              <Switch
                checked={formData.emailNotifications ?? true}
                onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                disabled={isLoading}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Paragraph>{t('settings.notifications.sms')}</Paragraph>
                <Paragraph size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                  {t('settings.notifications.smsDescription')}
                </Paragraph>
              </div>
              <Switch
                checked={formData.smsNotifications ?? false}
                onChange={(e) => handleChange('smsNotifications', e.target.checked)}
                disabled={isLoading}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Paragraph>{t('settings.notifications.push')}</Paragraph>
                <Paragraph size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                  {t('settings.notifications.pushDescription')}
                </Paragraph>
              </div>
              <Switch
                checked={formData.pushNotifications ?? true}
                onChange={(e) => handleChange('pushNotifications', e.target.checked)}
                disabled={isLoading}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Paragraph>{t('settings.notifications.marketing')}</Paragraph>
                <Paragraph size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                  {t('settings.notifications.marketingDescription')}
                </Paragraph>
              </div>
              <Switch
                checked={formData.marketingEmails ?? false}
                onChange={(e) => handleChange('marketingEmails', e.target.checked)}
                disabled={isLoading}
              />
            </div>
          </div>
        </Card.Block>
      </Card>
    </div>
  );
}
