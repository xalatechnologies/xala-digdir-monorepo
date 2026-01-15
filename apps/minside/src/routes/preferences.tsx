/**
 * UserPreferencesPage
 *
 * User portal preferences page
 * - Notification settings
 * - Privacy preferences
 * - Display settings
 * - Account management
 */

import { useState, useEffect } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Switch,
  Select,
} from '@xala/ds';
import { useT } from '@xala/i18n';

const MOBILE_BREAKPOINT = 768;

export function UserPreferencesPage() {
  const t = useT();
  const [isSaving, setIsSaving] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );

  // Preferences state
  const [prefs, setPrefs] = useState({
    // Notifications
    emailBooking: true,
    emailReminder: true,
    emailNewsletter: false,
    smsReminder: true,
    pushNotifications: true,
    // Privacy
    showProfile: true,
    shareActivity: false,
    allowAnalytics: true,
    // Display
    theme: 'system',
    language: 'no',
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const updatePref = (key: string, value: string | boolean) => {
    setPrefs(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  const notificationSettings = [
    { key: 'emailBooking', label: t('preferences.emailBooking'), description: t('preferences.emailBookingDesc') },
    { key: 'emailReminder', label: t('preferences.emailReminder'), description: t('preferences.emailReminderDesc') },
    { key: 'emailNewsletter', label: t('preferences.emailNewsletter'), description: t('preferences.emailNewsletterDesc') },
    { key: 'smsReminder', label: t('preferences.smsReminder'), description: t('preferences.smsReminderDesc') },
    { key: 'pushNotifications', label: t('preferences.pushNotifications'), description: t('preferences.pushNotificationsDesc') },
  ];

  const privacySettings = [
    { key: 'showProfile', label: t('preferences.showProfile'), description: t('preferences.showProfileDesc') },
    { key: 'shareActivity', label: t('preferences.shareActivity'), description: t('preferences.shareActivityDesc') },
    { key: 'allowAnalytics', label: t('preferences.allowAnalytics'), description: t('preferences.allowAnalyticsDesc') },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'center',
        gap: 'var(--ds-spacing-4)',
      }}>
        <div>
          <Heading level={1} data-size="lg" style={{ margin: 0 }}>
            {t('settings.preferences')}
          </Heading>
          <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)', marginBottom: 0 }}>
            {t('settings.preferencesDesc')}
          </Paragraph>
        </div>
        <Button
          type="button"
          variant="primary"
          data-size="md"
          onClick={handleSave}
          disabled={isSaving}
          style={{ minHeight: '44px' }}
        >
          {isSaving ? t('common.saving') : t('common.save')}
        </Button>
      </div>

      {/* Notifications */}
      <Card style={{ padding: 'var(--ds-spacing-5)' }}>
        <Heading level={2} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
          {t('preferences.notifications')}
        </Heading>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
          {notificationSettings.map(item => (
            <div key={item.key} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 'var(--ds-spacing-3)',
              borderRadius: 'var(--ds-border-radius-md)',
              backgroundColor: 'var(--ds-color-neutral-surface-hover)',
            }}>
              <div>
                <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 500 }}>{item.label}</Paragraph>
                <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                  {item.description}
                </Paragraph>
              </div>
              <Switch
                aria-label={item.label}
                checked={prefs[item.key as keyof typeof prefs] as boolean}
                onChange={(e) => updatePref(item.key, e.target.checked)}
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Privacy */}
      <Card style={{ padding: 'var(--ds-spacing-5)' }}>
        <Heading level={2} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
          {t('preferences.privacy')}
        </Heading>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
          {privacySettings.map(item => (
            <div key={item.key} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 'var(--ds-spacing-3)',
              borderRadius: 'var(--ds-border-radius-md)',
              backgroundColor: 'var(--ds-color-neutral-surface-hover)',
            }}>
              <div>
                <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 500 }}>{item.label}</Paragraph>
                <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                  {item.description}
                </Paragraph>
              </div>
              <Switch
                aria-label={item.label}
                checked={prefs[item.key as keyof typeof prefs] as boolean}
                onChange={(e) => updatePref(item.key, e.target.checked)}
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Display */}
      <Card style={{ padding: 'var(--ds-spacing-5)' }}>
        <Heading level={2} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
          {t('preferences.display')}
        </Heading>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 'var(--ds-spacing-4)' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 500 }}>{t('preferences.theme')}</label>
            <Select
              value={prefs.theme}
              onChange={(e) => updatePref('theme', e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="system">{t('preferences.themeSystem')}</option>
              <option value="light">{t('preferences.themeLight')}</option>
              <option value="dark">{t('preferences.themeDark')}</option>
            </Select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 500 }}>{t('preferences.language')}</label>
            <Select
              value={prefs.language}
              onChange={(e) => updatePref('language', e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="no">{t('preferences.languageNo')}</option>
              <option value="en">{t('preferences.languageEn')}</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card style={{ padding: 'var(--ds-spacing-5)', border: '1px solid var(--ds-color-danger-border-default)' }}>
        <Heading level={2} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)', color: 'var(--ds-color-danger-text-default)' }}>
          {t('preferences.dangerZone')}
        </Heading>
        <Paragraph data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)', color: 'var(--ds-color-neutral-text-subtle)' }}>
          {t('preferences.dangerZoneDesc')}
        </Paragraph>
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', flexWrap: 'wrap' }}>
          <Button type="button" variant="secondary" data-size="md" style={{ minHeight: '44px' }}>
            {t('preferences.exportData')}
          </Button>
          <Button type="button" variant="secondary" data-size="md" style={{ minHeight: '44px', color: 'var(--ds-color-danger-text-default)' }}>
            {t('preferences.deleteAccount')}
          </Button>
        </div>
      </Card>
    </div>
  );
}
