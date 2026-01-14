/**
 * Settings Page - Complete Tenant Configuration
 * Manage tenant settings, integrations, and system configuration
 */

import { useState, type ChangeEvent } from 'react';
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
  Badge,
  Alert,
  SaveIcon,
  CheckCircleIcon,
} from '@xala/ds';
import {
  useTenantSettings,
  useUpdateTenantSettings,
  useIntegrationSettings,
  useUpdateIntegration,
} from '@digilist/client-sdk';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  // Queries
  const { data: settingsData, isLoading } = useTenantSettings();
  const settings = settingsData?.data;

  const { data: integrationsData } = useIntegrationSettings();
  const integrations = integrationsData?.data;

  // Mutations
  const updateSettingsMutation = useUpdateTenantSettings();
  const updateIntegrationMutation = useUpdateIntegration();

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

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load settings into form
  useState(() => {
    if (settings) {
      setFormData({
        general: {
          name: settings.displayName || formData.general.name,
          locale: settings.language || formData.general.locale,
          timezone: settings.timezone || formData.general.timezone,
          currency: settings.currency || formData.general.currency,
          dateFormat: formData.general.dateFormat,
          timeFormat: formData.general.timeFormat,
        },
        booking: {
          autoConfirm: !settings.bookingSettings?.requireApproval || formData.booking.autoConfirm,
          requireApproval: settings.bookingSettings?.requireApproval || formData.booking.requireApproval,
          allowCancellation: formData.booking.allowCancellation,
          cancellationDeadlineHours: settings.bookingSettings?.cancellationHours || formData.booking.cancellationDeadlineHours,
          maxAdvanceBookingDays: settings.bookingSettings?.maxAdvanceDays || formData.booking.maxAdvanceBookingDays,
          minAdvanceBookingHours: Math.floor((settings.bookingSettings?.defaultLeadTimeMinutes || 0) / 60) || formData.booking.minAdvanceBookingHours,
          bufferTimeMinutes: formData.booking.bufferTimeMinutes,
        },
        notifications: {
          emailEnabled: settings.notificationSettings?.emailNotifications || formData.notifications.emailEnabled,
          smsEnabled: settings.notificationSettings?.smsNotifications || formData.notifications.smsEnabled,
          pushEnabled: formData.notifications.pushEnabled,
          bookingConfirmation: settings.notificationSettings?.bookingConfirmation || formData.notifications.bookingConfirmation,
          bookingReminder: settings.notificationSettings?.bookingReminder || formData.notifications.bookingReminder,
          reminderHoursBefore: settings.notificationSettings?.reminderHoursBefore || formData.notifications.reminderHoursBefore,
        },
        branding: {
          logo: settings.logo || formData.branding.logo,
          primaryColor: settings.primaryColor || formData.branding.primaryColor,
          secondaryColor: formData.branding.secondaryColor,
          favicon: formData.branding.favicon,
        },
      });
    }
  });

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      // Map formData to TenantSettings structure
      const settingsUpdate = {
        displayName: formData.general.name,
        language: formData.general.locale,
        timezone: formData.general.timezone,
        currency: formData.general.currency,
        logo: formData.branding.logo,
        primaryColor: formData.branding.primaryColor,
        bookingSettings: {
          requireApproval: formData.booking.requireApproval,
          defaultLeadTimeMinutes: formData.booking.minAdvanceBookingHours * 60,
          maxAdvanceDays: formData.booking.maxAdvanceBookingDays,
          cancellationPolicy: 'flexible' as const,
          cancellationHours: formData.booking.cancellationDeadlineHours,
        },
        notificationSettings: {
          emailNotifications: formData.notifications.emailEnabled,
          smsNotifications: formData.notifications.smsEnabled,
          bookingConfirmation: formData.notifications.bookingConfirmation,
          bookingReminder: formData.notifications.bookingReminder,
          reminderHoursBefore: formData.notifications.reminderHoursBefore,
        },
      };
      await updateSettingsMutation.mutateAsync(settingsUpdate);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
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

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
        <Spinner aria-hidden="true" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-5)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Heading level={2} data-size="md">
            Innstillinger
          </Heading>
          <Paragraph
            data-size="sm"
            style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-1)' }}
          >
            Konfigurer systemet og tredjepartsintegrasjoner
          </Paragraph>
        </div>
        {saveSuccess && (
          <Alert data-color="success" style={{ maxWidth: '400px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
              <CheckCircleIcon />
              Innstillingene ble lagret
            </div>
          </Alert>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="general">Generelt</Tabs.Tab>
          <Tabs.Tab value="booking">Booking</Tabs.Tab>
          <Tabs.Tab value="notifications">Varsler</Tabs.Tab>
          <Tabs.Tab value="integrations">Integrasjoner</Tabs.Tab>
          <Tabs.Tab value="branding">Visuelle profil</Tabs.Tab>
        </Tabs.List>

        {/* General Settings */}
        <Tabs.Panel value="general">
          <Card>
            <Stack spacing={5}>
              <div>
                <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
                  Generelle innstillinger
                </Heading>
                <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                  Grunnleggende konfigurasjon for systemet
                </Paragraph>
              </div>

              <Stack spacing={4}>
                <FormField label="Systemnavn" description="Navn på systemet som vises til brukere">
                  <Textfield
                    value={formData.general.name}
                    onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData(prev => ({
                      ...prev,
                      general: { ...prev.general, name: e.target.value }
                    }))}
                    placeholder="Digilist Booking"
                  />
                </FormField>

                <FormField label="Språk">
                  <Select
                    value={formData.general.locale}
                    onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData(prev => ({
                      ...prev,
                      general: { ...prev.general, locale: e.target.value }
                    }))}
                  >
                    <option value="nb">Norsk bokmål</option>
                    <option value="nn">Norsk nynorsk</option>
                    <option value="en">English</option>
                  </Select>
                </FormField>

                <FormField label="Tidssone">
                  <Select
                    value={formData.general.timezone}
                    onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData(prev => ({
                      ...prev,
                      general: { ...prev.general, timezone: e.target.value }
                    }))}
                  >
                    <option value="Europe/Oslo">Europa/Oslo (CET)</option>
                    <option value="Europe/London">Europa/London (GMT)</option>
                    <option value="America/New_York">Amerika/New York (EST)</option>
                  </Select>
                </FormField>

                <FormField label="Valuta">
                  <Select
                    value={formData.general.currency}
                    onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData(prev => ({
                      ...prev,
                      general: { ...prev.general, currency: e.target.value }
                    }))}
                  >
                    <option value="NOK">Norske kroner (NOK)</option>
                    <option value="EUR">Euro (EUR)</option>
                    <option value="USD">US Dollar (USD)</option>
                  </Select>
                </FormField>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--ds-spacing-3)' }}>
                  <FormField label="Datoformat">
                    <Select
                      value={formData.general.dateFormat}
                      onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData(prev => ({
                        ...prev,
                        general: { ...prev.general, dateFormat: e.target.value }
                      }))}
                    >
                      <option value="dd.MM.yyyy">31.12.2024</option>
                      <option value="yyyy-MM-dd">2024-12-31</option>
                      <option value="MM/dd/yyyy">12/31/2024</option>
                    </Select>
                  </FormField>

                  <FormField label="Tidsformat">
                    <Select
                      value={formData.general.timeFormat}
                      onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData(prev => ({
                        ...prev,
                        general: { ...prev.general, timeFormat: e.target.value }
                      }))}
                    >
                      <option value="24h">24-timers (13:00)</option>
                      <option value="12h">12-timers (1:00 PM)</option>
                    </Select>
                  </FormField>
                </div>
              </Stack>

              <div style={{ paddingTop: 'var(--ds-spacing-3)', borderTop: '1px solid var(--ds-color-neutral-border-subtle)' }}>
                <Button onClick={handleSave} disabled={isSaving}>
                  <SaveIcon />
                  {isSaving ? 'Lagrer...' : 'Lagre endringer'}
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
                  Bookinginnstillinger
                </Heading>
                <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                  Konfigurer booking-regler og retningslinjer
                </Paragraph>
              </div>

              <Stack spacing={4}>
                <FormField label="Automatisk bekreftelse" description="Bekreft bookinger automatisk uten godkjenning">
                  <Switch
                    checked={formData.booking.autoConfirm}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      booking: { ...prev.booking, autoConfirm: checked }
                    }))}
                  />
                </FormField>

                {!formData.booking.autoConfirm && (
                  <FormField label="Krev godkjenning" description="Alle bookinger må godkjennes av saksbehandler">
                    <Switch
                      checked={formData.booking.requireApproval}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        booking: { ...prev.booking, requireApproval: checked }
                      }))}
                    />
                  </FormField>
                )}

                <FormField label="Tillat kansellering" description="Brukere kan kansellere egne bookinger">
                  <Switch
                    checked={formData.booking.allowCancellation}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      booking: { ...prev.booking, allowCancellation: checked }
                    }))}
                  />
                </FormField>

                {formData.booking.allowCancellation && (
                  <FormField
                    label="Kanselleringsfrist"
                    description="Antall timer før bookingstart kansellering er tillatt"
                  >
                    <Textfield
                      type="number"
                      value={formData.booking.cancellationDeadlineHours.toString()}
                      onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData(prev => ({
                        ...prev,
                        booking: { ...prev.booking, cancellationDeadlineHours: parseInt(e.target.value) || 0 }
                      }))}
                      min="0"
                      suffix="timer"
                    />
                  </FormField>
                )}

                <FormField
                  label="Maksimal forhåndsbooking"
                  description="Hvor langt frem i tid kan man booke?"
                >
                  <Textfield
                    type="number"
                    value={formData.booking.maxAdvanceBookingDays.toString()}
                    onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData(prev => ({
                      ...prev,
                      booking: { ...prev.booking, maxAdvanceBookingDays: parseInt(e.target.value) || 0 }
                    }))}
                    min="1"
                    suffix="dager"
                  />
                </FormField>

                <FormField
                  label="Minimum forhåndstid"
                  description="Hvor kort tid før kan man booke?"
                >
                  <Textfield
                    type="number"
                    value={formData.booking.minAdvanceBookingHours.toString()}
                    onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData(prev => ({
                      ...prev,
                      booking: { ...prev.booking, minAdvanceBookingHours: parseInt(e.target.value) || 0 }
                    }))}
                    min="0"
                    suffix="timer"
                  />
                </FormField>

                <FormField
                  label="Buffertid mellom bookinger"
                  description="Automatisk pause mellom påfølgende bookinger"
                >
                  <Textfield
                    type="number"
                    value={formData.booking.bufferTimeMinutes.toString()}
                    onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData(prev => ({
                      ...prev,
                      booking: { ...prev.booking, bufferTimeMinutes: parseInt(e.target.value) || 0 }
                    }))}
                    min="0"
                    suffix="minutter"
                  />
                </FormField>
              </Stack>

              <div style={{ paddingTop: 'var(--ds-spacing-3)', borderTop: '1px solid var(--ds-color-neutral-border-subtle)' }}>
                <Button onClick={handleSave} disabled={isSaving}>
                  <SaveIcon />
                  {isSaving ? 'Lagrer...' : 'Lagre endringer'}
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
                  Varslingsinnstillinger
                </Heading>
                <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                  Konfigurer hvordan systemet sender varsler
                </Paragraph>
              </div>

              <Stack spacing={4}>
                <FormField label="E-postvarsler" description="Send varsler på e-post">
                  <Switch
                    checked={formData.notifications.emailEnabled}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, emailEnabled: checked }
                    }))}
                  />
                </FormField>

                <FormField label="SMS-varsler" description="Send varsler på SMS">
                  <Switch
                    checked={formData.notifications.smsEnabled}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, smsEnabled: checked }
                    }))}
                  />
                </FormField>

                <FormField label="Push-varsler" description="Send push-varsler til mobilapp">
                  <Switch
                    checked={formData.notifications.pushEnabled}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, pushEnabled: checked }
                    }))}
                  />
                </FormField>

                <div style={{
                  padding: 'var(--ds-spacing-4)',
                  backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
                  borderRadius: 'var(--ds-border-radius-md)',
                  marginTop: 'var(--ds-spacing-2)',
                }}>
                  <Paragraph data-size="sm" style={{ fontWeight: 600, marginBottom: 'var(--ds-spacing-3)' }}>
                    Automatiske varsler
                  </Paragraph>

                  <Stack spacing={3}>
                    <FormField label="Bookingbekreftelse" description="Send bekreftelse når booking er godkjent">
                      <Switch
                        checked={formData.notifications.bookingConfirmation}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, bookingConfirmation: checked }
                        }))}
                      />
                    </FormField>

                    <FormField label="Booking-påminnelse" description="Send påminnelse før booking starter">
                      <Switch
                        checked={formData.notifications.bookingReminder}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, bookingReminder: checked }
                        }))}
                      />
                    </FormField>

                    {formData.notifications.bookingReminder && (
                      <FormField
                        label="Påminnelsestidspunkt"
                        description="Hvor lenge før booking skal påminnelse sendes?"
                      >
                        <Textfield
                          type="number"
                          value={formData.notifications.reminderHoursBefore.toString()}
                          onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData(prev => ({
                            ...prev,
                            notifications: { ...prev.notifications, reminderHoursBefore: parseInt(e.target.value) || 24 }
                          }))}
                          min="1"
                          suffix="timer før"
                        />
                      </FormField>
                    )}
                  </Stack>
                </div>
              </Stack>

              <div style={{ paddingTop: 'var(--ds-spacing-3)', borderTop: '1px solid var(--ds-color-neutral-border-subtle)' }}>
                <Button onClick={handleSave} disabled={isSaving}>
                  <SaveIcon />
                  {isSaving ? 'Lagrer...' : 'Lagre endringer'}
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
                    Autentisering
                  </Heading>
                  <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                    ID-løsninger og pålogging
                  </Paragraph>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--ds-spacing-3)', backgroundColor: 'var(--ds-color-neutral-surface-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
                  <div>
                    <div style={{ fontWeight: 500, marginBottom: 'var(--ds-spacing-1)' }}>BankID</div>
                    <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>Norsk e-ID for sikker pålogging</Paragraph>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                    {integrations?.bankid?.enabled ? (
                      <Badge color="success">Aktiv</Badge>
                    ) : (
                      <Badge color="neutral">Inaktiv</Badge>
                    )}
                    <Switch
                      checked={integrations?.bankid?.enabled || false}
                      onChange={(e) => handleIntegrationToggle('bankid', e.target.checked)}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--ds-spacing-3)', backgroundColor: 'var(--ds-color-neutral-surface-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
                  <div>
                    <div style={{ fontWeight: 500, marginBottom: 'var(--ds-spacing-1)' }}>ID-porten</div>
                    <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>Offentlig påloggingsløsning</Paragraph>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                    {integrations?.idporten?.enabled ? (
                      <Badge color="success">Aktiv</Badge>
                    ) : (
                      <Badge color="neutral">Inaktiv</Badge>
                    )}
                    <Switch
                      checked={integrations?.idporten?.enabled || false}
                      onChange={(e) => handleIntegrationToggle('idporten', e.target.checked)}
                    />
                  </div>
                </div>
              </Stack>
            </Card>

            <Card>
              <Stack spacing={4}>
                <div>
                  <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
                    Betaling
                  </Heading>
                  <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                    Betalingsløsninger
                  </Paragraph>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--ds-spacing-3)', backgroundColor: 'var(--ds-color-neutral-surface-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
                  <div>
                    <div style={{ fontWeight: 500, marginBottom: 'var(--ds-spacing-1)' }}>Vipps</div>
                    <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>Mobilbetaling med Vipps</Paragraph>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                    {integrations?.vipps?.enabled ? (
                      <Badge color="success">Aktiv</Badge>
                    ) : (
                      <Badge color="neutral">Inaktiv</Badge>
                    )}
                    <Switch
                      checked={integrations?.vipps?.enabled || false}
                      onChange={(e) => handleIntegrationToggle('vipps', e.target.checked)}
                    />
                  </div>
                </div>
              </Stack>
            </Card>

            <Card>
              <Stack spacing={4}>
                <div>
                  <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
                    Tilgangskontroll
                  </Heading>
                  <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                    Låssystemer og adgangskontroll
                  </Paragraph>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--ds-spacing-3)', backgroundColor: 'var(--ds-color-neutral-surface-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
                  <div>
                    <div style={{ fontWeight: 500, marginBottom: 'var(--ds-spacing-1)' }}>RCO</div>
                    <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>Digital låssystem</Paragraph>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                    {integrations?.rco?.enabled ? (
                      <Badge color="success">Aktiv</Badge>
                    ) : (
                      <Badge color="neutral">Inaktiv</Badge>
                    )}
                    <Switch
                      checked={integrations?.rco?.enabled || false}
                      onChange={(e) => handleIntegrationToggle('rco', e.target.checked)}
                    />
                  </div>
                </div>
              </Stack>
            </Card>

            <Card>
              <Stack spacing={4}>
                <div>
                  <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
                    Kalender
                  </Heading>
                  <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                    Kalendersynkronisering
                  </Paragraph>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--ds-spacing-3)', backgroundColor: 'var(--ds-color-neutral-surface-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
                  <div>
                    <div style={{ fontWeight: 500, marginBottom: 'var(--ds-spacing-1)' }}>Google Calendar</div>
                    <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>Synkroniser med Google Calendar</Paragraph>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                    {integrations?.googleCalendar?.enabled ? (
                      <Badge color="success">Aktiv</Badge>
                    ) : (
                      <Badge color="neutral">Inaktiv</Badge>
                    )}
                    <Switch
                      checked={integrations?.googleCalendar?.enabled || false}
                      onChange={(e) => handleIntegrationToggle('googleCalendar', e.target.checked)}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--ds-spacing-3)', backgroundColor: 'var(--ds-color-neutral-surface-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
                  <div>
                    <div style={{ fontWeight: 500, marginBottom: 'var(--ds-spacing-1)' }}>Outlook</div>
                    <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>Synkroniser med Outlook/Exchange</Paragraph>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                    {integrations?.outlook?.enabled ? (
                      <Badge color="success">Aktiv</Badge>
                    ) : (
                      <Badge color="neutral">Inaktiv</Badge>
                    )}
                    <Switch
                      checked={integrations?.outlook?.enabled || false}
                      onChange={(e) => handleIntegrationToggle('outlook', e.target.checked)}
                    />
                  </div>
                </div>
              </Stack>
            </Card>

            <Card>
              <Stack spacing={4}>
                <div>
                  <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
                    Økonomi & ERP
                  </Heading>
                  <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                    Økonomisystemer og fakturering
                  </Paragraph>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--ds-spacing-3)', backgroundColor: 'var(--ds-color-neutral-surface-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
                  <div>
                    <div style={{ fontWeight: 500, marginBottom: 'var(--ds-spacing-1)' }}>Visma</div>
                    <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>Fakturering via Visma</Paragraph>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                    {integrations?.visma?.enabled ? (
                      <Badge color="success">Aktiv</Badge>
                    ) : (
                      <Badge color="neutral">Inaktiv</Badge>
                    )}
                    <Switch
                      checked={integrations?.visma?.enabled || false}
                      onChange={(e) => handleIntegrationToggle('visma', e.target.checked)}
                    />
                  </div>
                </div>
              </Stack>
            </Card>

            <Card>
              <Stack spacing={4}>
                <div>
                  <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
                    Offentlige registre
                  </Heading>
                  <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                    Verifikasjon og oppslag
                  </Paragraph>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--ds-spacing-3)', backgroundColor: 'var(--ds-color-neutral-surface-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
                  <div>
                    <div style={{ fontWeight: 500, marginBottom: 'var(--ds-spacing-1)' }}>Brønnøysundregistrene</div>
                    <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>Verifiser organisasjoner</Paragraph>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                    {integrations?.brreg?.enabled ? (
                      <Badge color="success">Aktiv</Badge>
                    ) : (
                      <Badge color="neutral">Inaktiv</Badge>
                    )}
                    <Switch
                      checked={integrations?.brreg?.enabled || false}
                      onChange={(e) => handleIntegrationToggle('brreg', e.target.checked)}
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
                  Visuell profil
                </Heading>
                <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                  Tilpass utseende og merkevare
                </Paragraph>
              </div>

              <Stack spacing={4}>
                <FormField
                  label="Logo URL"
                  description="URL til logo (vil vises i toppen av siden)"
                >
                  <Textfield
                    value={formData.branding.logo || ''}
                    onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData(prev => ({
                      ...prev,
                      branding: { ...prev.branding, logo: e.target.value }
                    }))}
                    placeholder="https://example.com/logo.png"
                  />
                </FormField>

                <FormField
                  label="Primærfarge"
                  description="Hovedfarge for knapper og UI-elementer"
                >
                  <Textfield
                    type="color"
                    value={formData.branding.primaryColor || '#1A56DB'}
                    onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData(prev => ({
                      ...prev,
                      branding: { ...prev.branding, primaryColor: e.target.value }
                    }))}
                    aria-label="Primærfarge"
                  />
                </FormField>

                <FormField
                  label="Sekundærfarge"
                  description="Farge for mindre fremtredende elementer"
                >
                  <Textfield
                    type="color"
                    value={formData.branding.secondaryColor || '#6B7280'}
                    onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData(prev => ({
                      ...prev,
                      branding: { ...prev.branding, secondaryColor: e.target.value }
                    }))}
                    aria-label="Sekundærfarge"
                  />
                </FormField>

                <FormField
                  label="Favicon URL"
                  description="URL til favicon (vises i nettleserens fane)"
                >
                  <Textfield
                    value={formData.branding.favicon || ''}
                    onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData(prev => ({
                      ...prev,
                      branding: { ...prev.branding, favicon: e.target.value }
                    }))}
                    placeholder="https://example.com/favicon.ico"
                    aria-label="Favicon URL"
                  />
                </FormField>
              </Stack>

              <div style={{ paddingTop: 'var(--ds-spacing-3)', borderTop: '1px solid var(--ds-color-neutral-border-subtle)' }}>
                <Button onClick={handleSave} disabled={isSaving}>
                  <SaveIcon />
                  {isSaving ? 'Lagrer...' : 'Lagre endringer'}
                </Button>
              </div>
            </Stack>
          </Card>
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}
