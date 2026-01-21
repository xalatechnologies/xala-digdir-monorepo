/**
 * OrganizationSettingsPage
 *
 * Organization portal settings page
 * - Organization profile
 * - Notification preferences
 * - Contact information
 * - Billing settings
 */

import { useState, useEffect } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Input,
  Switch,
  DashboardPageHeader,
} from '@xalatechnologies/platform/ui';
import { useT } from '@xala/i18n';

const MOBILE_BREAKPOINT = 768;

export function OrganizationSettingsPage() {
  const t = useT();
  const [isSaving, setIsSaving] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );

  // Settings state
  const [settings, setSettings] = useState({
    orgName: 'Skien IL',
    orgNumber: '987654321',
    email: 'post@skien-il.no',
    phone: '35 50 12 34',
    address: 'Idrettsveien 123',
    postalCode: '3700',
    city: 'Skien',
    // Notifications
    emailBookingConfirm: true,
    emailBookingReminder: true,
    emailInvoice: true,
    smsReminder: false,
    // Billing
    invoiceEmail: 'faktura@skien-il.no',
    paymentTerms: '30',
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const updateSetting = (key: string, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Header - Using DashboardPageHeader */}
      <DashboardPageHeader
        title={t('org.settings')}
        subtitle={t('org.settingsDesc')}
        primaryAction={
          <Button 
            type="button" 
            variant="primary"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? t('state.saving') : t('action.save')}
          </Button>
        }
      />

      {/* Organization Profile */}
      <Card style={{ padding: 'var(--ds-spacing-5)' }}>
        <Heading level={2} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
          {t('org.organizationProfile')}
        </Heading>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 'var(--ds-spacing-4)' }}>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 500 }}>{t('label.name')}</label>
              <Input
                value={settings.orgName}
                onChange={(e) => updateSetting('orgName', e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 500 }}>{t('org.orgNumber')}</label>
              <Input
                value={settings.orgNumber}
                onChange={(e) => updateSetting('orgNumber', e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 'var(--ds-spacing-4)' }}>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 500 }}>{t('label.email')}</label>
              <Input
                type="email"
                value={settings.email}
                onChange={(e) => updateSetting('email', e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 500 }}>{t('label.phone')}</label>
              <Input
                value={settings.phone}
                onChange={(e) => updateSetting('phone', e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 500 }}>{t('org.address')}</label>
            <Input
              value={settings.address}
              onChange={(e) => updateSetting('address', e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr', gap: 'var(--ds-spacing-4)' }}>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 500 }}>{t('org.postalCode')}</label>
              <Input
                value={settings.postalCode}
                onChange={(e) => updateSetting('postalCode', e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 500 }}>{t('org.city')}</label>
              <Input
                value={settings.city}
                onChange={(e) => updateSetting('city', e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card style={{ padding: 'var(--ds-spacing-5)' }}>
        <Heading level={2} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
          {t('org.notifications')}
        </Heading>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
          {[
            { key: 'emailBookingConfirm', label: t('org.notificationSettings.bookingConfirmations'), description: t('org.notificationSettings.bookingConfirmationsDesc') },
            { key: 'emailBookingReminder', label: t('org.notificationSettings.reminders'), description: t('org.notificationSettings.remindersDesc') },
            { key: 'emailInvoice', label: t('org.notificationSettings.invoices'), description: t('org.notificationSettings.invoicesDesc') },
            { key: 'smsReminder', label: t('org.notificationSettings.smsReminders'), description: t('org.notificationSettings.smsRemindersDesc') },
          ].map(item => (
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
                checked={settings[item.key as keyof typeof settings] as boolean}
                onChange={(e) => updateSetting(item.key, e.target.checked)}
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Billing */}
      <Card style={{ padding: 'var(--ds-spacing-5)' }}>
        <Heading level={2} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
          {t('org.billing')}
        </Heading>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 'var(--ds-spacing-4)' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 500 }}>{t('org.invoiceEmail')}</label>
            <Input
              type="email"
              value={settings.invoiceEmail}
              onChange={(e) => updateSetting('invoiceEmail', e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 500 }}>{t('org.paymentTerms')}</label>
            <Input
              type="number"
              value={settings.paymentTerms}
              onChange={(e) => updateSetting('paymentTerms', e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
