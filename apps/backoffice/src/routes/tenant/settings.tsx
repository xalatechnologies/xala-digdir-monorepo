/**
 * TenantSettingsPage
 *
 * TenantAdmin page for managing tenant configuration
 * - General settings
 * - Feature toggles
 * - Module configuration
 * - Integration settings
 */

/* eslint-disable digdir/prefer-ds-components -- Complex settings form */

import { useState, useEffect } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Input,
  Select,
  Switch,
} from '@xalatechnologies/platform/ui';
import { useT } from '@xalatechnologies/platform/i18n';

const MOBILE_BREAKPOINT = 768;

export function TenantSettingsPage() {
  const t = useT();
  const [isSaving, setIsSaving] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );

  // Settings state
  const [settings, setSettings] = useState({
    tenantName: 'Skien Kommune',
    tenantSlug: 'skien',
    defaultLanguage: 'nb',
    timezone: 'Europe/Oslo',
    currency: 'NOK',
    bookingEnabled: true,
    seasonalLeaseEnabled: true,
    organizationPortalEnabled: true,
    publicListingsEnabled: true,
    reviewsEnabled: true,
    paymentEnabled: false,
    vippsIntegration: false,
    emailNotifications: true,
    smsNotifications: false,
    maxBookingAdvanceDays: '90',
    defaultCancellationHours: '24',
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

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
            Tenant-innstillinger
          </Heading>
          <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)', marginBottom: 0 }}>
            Konfigurer innstillinger for hele plattformen
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
          {isSaving ? t('state.saving') : 'Lagre endringer'}
        </Button>
      </div>

      {/* General Settings */}
      <Card style={{ padding: 'var(--ds-spacing-5)' }}>
        <Heading level={2} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
          Generelle innstillinger
        </Heading>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 'var(--ds-spacing-4)' }}>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 'var(--ds-font-weight-medium)' }}>{t('common.tenantnavn')}</label>
              <Input
                value={settings.tenantName}
                onChange={(e) => updateSetting('tenantName', e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 'var(--ds-font-weight-medium)' }}>Slug (URL)</label>
              <Input
                value={settings.tenantSlug}
                onChange={(e) => updateSetting('tenantSlug', e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 'var(--ds-spacing-4)' }}>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 'var(--ds-font-weight-medium)' }}>{t('common.spraak')}</label>
              <Select
                value={settings.defaultLanguage}
                onChange={(e) => updateSetting('defaultLanguage', e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="nb">{t('common.norsk_bokmaal')}</option>
                <option value="nn">{t('common.norsk_nynorsk')}</option>
                <option value="en">{t('backoffice.text.english')}</option>
              </Select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 'var(--ds-font-weight-medium)' }}>{t('backoffice.text.tidssone')}</label>
              <Select
                value={settings.timezone}
                onChange={(e) => updateSetting('timezone', e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="Europe/Oslo">Europe/Oslo (CET)</option>
                <option value="UTC">{t('backoffice.text.utc')}</option>
              </Select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 'var(--ds-font-weight-medium)' }}>{t('backoffice.text.valuta')}</label>
              <Select
                value={settings.currency}
                onChange={(e) => updateSetting('currency', e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="NOK">{t('backoffice.text.nok')}</option>
                <option value="EUR">{t('backoffice.text.eur')}</option>
                <option value="SEK">{t('backoffice.text.sek')}</option>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      {/* Feature Toggles */}
      <Card style={{ padding: 'var(--ds-spacing-5)' }}>
        <Heading level={2} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
          Funksjoner
        </Heading>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
          {[
            { key: 'bookingEnabled', label: t('common.booking_aktivert'), description: t('common.tillat_brukere_aa_booke') },
            { key: 'seasonalLeaseEnabled', label: t('common.sesongbooking_aktivert'), description: t('common.tillat_organisasjoner_aa_soke') },
            { key: 'organizationPortalEnabled', label: 'Organisasjonsportal', description: t('common.aktiver_portal_for_organisasjoner') },
            { key: 'publicListingsEnabled', label: t('common.offentlig_visnting'), description: t('common.vis_lokaler_offentlig') },
            { key: 'reviewsEnabled', label: 'Anmeldelser', description: t('common.tillat_brukere_aa_legge') },
          ].map(feature => (
            <div key={feature.key} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 'var(--ds-spacing-3)',
              borderRadius: 'var(--ds-border-radius-md)',
              backgroundColor: 'var(--ds-color-neutral-surface-hover)',
            }}>
              <div>
                <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>{feature.label}</Paragraph>
                <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                  {feature.description}
                </Paragraph>
              </div>
              <Switch
                checked={settings[feature.key as keyof typeof settings] as boolean}
                onChange={(checked: boolean) => updateSetting(feature.key, checked)}
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Integrations */}
      <Card style={{ padding: 'var(--ds-spacing-5)' }}>
        <Heading level={2} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
          Integrasjoner
        </Heading>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
          {[
            { key: 'paymentEnabled', label: t("rule.payment"), description: 'Aktiver online betaling' },
            { key: 'vippsIntegration', label: 'Vipps', description: t('common.integrasjon_med_vipps_for') },
            { key: 'emailNotifications', label: t('common.epostvarsler'), description: t('common.send_varsler_via_epost') },
            { key: 'smsNotifications', label: t('common.smsvarsler'), description: t('common.send_varsler_via_sms') },
          ].map(integration => (
            <div key={integration.key} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 'var(--ds-spacing-3)',
              borderRadius: 'var(--ds-border-radius-md)',
              backgroundColor: 'var(--ds-color-neutral-surface-hover)',
            }}>
              <div>
                <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>{integration.label}</Paragraph>
                <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                  {integration.description}
                </Paragraph>
              </div>
              <Switch
                checked={settings[integration.key as keyof typeof settings] as boolean}
                onChange={(checked: boolean) => updateSetting(integration.key, checked)}
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Booking Rules */}
      <Card style={{ padding: 'var(--ds-spacing-5)' }}>
        <Heading level={2} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
          Bookingregler
        </Heading>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 'var(--ds-spacing-4)' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 'var(--ds-font-weight-medium)' }}>
              Maks. forhåndsbooking (dager)
            </label>
            <Input
              type="number"
              value={settings.maxBookingAdvanceDays}
              onChange={(e) => updateSetting('maxBookingAdvanceDays', e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 'var(--ds-font-weight-medium)' }}>
              Avbudsvarsel (timer før)
            </label>
            <Input
              type="number"
              value={settings.defaultCancellationHours}
              onChange={(e) => updateSetting('defaultCancellationHours', e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
