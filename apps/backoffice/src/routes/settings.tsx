/**
 * Settings Page - Complete Tenant Configuration
 * Manage tenant settings, integrations, and system configuration
 */

import { useState } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Spinner,
  Tabs,
  Stack,
  FormField,
  TextField,
  Select,
  Switch,
  Badge,
  Alert,
  SaveIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@xala/ds';
import {
  useTenantSettings,
  useUpdateTenantSettings,
  useIntegrationSettings,
  useUpdateIntegration,
} from '@digilist/client-sdk';
import { useT } from '@xala/i18n';

export function SettingsPage() {
  const t = useT();
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
        general: settings.general || formData.general,
        booking: settings.booking || formData.booking,
        notifications: settings.notifications || formData.notifications,
        branding: settings.branding || formData.branding,
      });
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
        <Spinner size="lg" />
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
          <Alert severity="success" style={{ maxWidth: '400px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
              <CheckCircleIcon />
              Innstillingene ble lagret
            </div>
          </Alert>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Trigger value="general">Generelt</Tabs.Trigger>
          <Tabs.Trigger value="booking">Booking</Tabs.Trigger>
          <Tabs.Trigger value="notifications">Varsler</Tabs.Trigger>
          <Tabs.Trigger value="integrations">Integrasjoner</Tabs.Trigger>
          <Tabs.Trigger value="branding">Visuelle profil</Tabs.Trigger>
        </Tabs.List>

        {/* General Settings */}
        <Tabs.Content value="general">
          <Card>
            <Stack gap={5}>
              <div>
                <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
                  Generelle innstillinger
                </Heading>
                <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                  Grunnleggende konfigurasjon for systemet
                </Paragraph>
              </div>

              <Stack gap={4}>
                <FormField label="Systemnavn" description="Navn på systemet som vises til brukere">
                  <TextField
                    value={formData.general.name}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      general: { ...prev.general, name: e.target.value }
                    }))}
                    placeholder="Digilist Booking"
                  />
                </FormField>

                <FormField label="Språk">
                  <Select
                    value={formData.general.locale}
                    onChange={(e) => setFormData(prev => ({
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
                    onChange={(e) => setFormData(prev => ({
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
                    onChange={(e) => setFormData(prev => ({
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

                  <FormField label="Tidsformat">
                    <Select
                      value={formData.general.timeFormat}
                      onChange={(e) => setFormData(prev => ({
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
        </Tabs.Content>

        {/* Booking Settings */}
        <Tabs.Content value="booking">
          <Card>
            <Stack gap={5}>
              <div>
                <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
                  Bookinginnstillinger
                </Heading>
                <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                  Konfigurer booking-regler og retningslinjer
                </Paragraph>
              </div>

              <Stack gap={4}>
                <FormField label="Automatisk bekreftelse">
                  <Switch
                    checked={formData.booking.autoConfirm}
                    onChange={(checked) => setFormData(prev => ({
                      ...prev,
                      booking: { ...prev.booking, autoConfirm: checked }
                    }))}
                  >
                    Bekreft bookinger automatisk uten godkjenning
                  </Switch>
                </FormField>

                {!formData.booking.autoConfirm && (
                  <FormField label="Krev godkjenning">
                    <Switch
                      checked={formData.booking.requireApproval}
                      onChange={(checked) => setFormData(prev => ({
                        ...prev,
                        booking: { ...prev.booking, requireApproval: checked }
                      }))}
                    >
                      Alle bookinger må godkjennes av saksbehandler
                    </Switch>
                  </FormField>
                )}

                <FormField label="Tillat kansellering">
                  <Switch
                    checked={formData.booking.allowCancellation}
                    onChange={(checked) => setFormData(prev => ({
                      ...prev,
                      booking: { ...prev.booking, allowCancellation: checked }
                    }))}
                  >
                    Brukere kan kansellere egne bookinger
                  </Switch>
                </FormField>

                {formData.booking.allowCancellation && (
                  <FormField
                    label="Kanselleringsfrist"
                    description="Antall timer før bookingstart kansellering er tillatt"
                  >
                    <TextField
                      type="number"
                      value={formData.booking.cancellationDeadlineHours.toString()}
                      onChange={(e) => setFormData(prev => ({
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
                  <TextField
                    type="number"
                    value={formData.booking.maxAdvanceBookingDays.toString()}
                    onChange={(e) => setFormData(prev => ({
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
                  <TextField
                    type="number"
                    value={formData.booking.minAdvanceBookingHours.toString()}
                    onChange={(e) => setFormData(prev => ({
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
                  <TextField
                    type="number"
                    value={formData.booking.bufferTimeMinutes.toString()}
                    onChange={(e) => setFormData(prev => ({
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
        </Tabs.Content>

        {/* Notification Settings */}
        <Tabs.Content value="notifications">
          <Card>
            <Stack gap={5}>
              <div>
                <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
                  Varslingsinnstillinger
                </Heading>
                <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                  Konfigurer hvordan systemet sender varsler
                </Paragraph>
              </div>

              <Stack gap={4}>
                <FormField label="E-postvarsler">
                  <Switch
                    checked={formData.notifications.emailEnabled}
                    onChange={(checked) => setFormData(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, emailEnabled: checked }
                    }))}
                  >
                    Send varsler på e-post
                  </Switch>
                </FormField>

                <FormField label="SMS-varsler">
                  <Switch
                    checked={formData.notifications.smsEnabled}
                    onChange={(checked) => setFormData(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, smsEnabled: checked }
                    }))}
                  >
                    Send varsler på SMS
                  </Switch>
                </FormField>

                <FormField label="Push-varsler">
                  <Switch
                    checked={formData.notifications.pushEnabled}
                    onChange={(checked) => setFormData(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, pushEnabled: checked }
                    }))}
                  >
                    Send push-varsler til mobilapp
                  </Switch>
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

                  <Stack gap={3}>
                    <FormField label="Bookingbekreftelse">
                      <Switch
                        checked={formData.notifications.bookingConfirmation}
                        onChange={(checked) => setFormData(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, bookingConfirmation: checked }
                        }))}
                      >
                        Send bekreftelse når booking er godkjent
                      </Switch>
                    </FormField>

                    <FormField label="Booking-påminnelse">
                      <Switch
                        checked={formData.notifications.bookingReminder}
                        onChange={(checked) => setFormData(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, bookingReminder: checked }
                        }))}
                      >
                        Send påminnelse før booking starter
                      </Switch>
                    </FormField>

                    {formData.notifications.bookingReminder && (
                      <FormField
                        label="Påminnelsestidspunkt"
                        description="Hvor lenge før booking skal påminnelse sendes?"
                      >
                        <TextField
                          type="number"
                          value={formData.notifications.reminderHoursBefore.toString()}
                          onChange={(e) => setFormData(prev => ({
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
        </Tabs.Content>

        {/* Integrations */}
        <Tabs.Content value="integrations">
          <Stack gap={4}>
            <Card>
              <Stack gap={4}>
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
                      onChange={(checked) => handleIntegrationToggle('bankid', checked)}
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
                      onChange={(checked) => handleIntegrationToggle('idporten', checked)}
                    />
                  </div>
                </div>
              </Stack>
            </Card>

            <Card>
              <Stack gap={4}>
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
                      onChange={(checked) => handleIntegrationToggle('vipps', checked)}
                    />
                  </div>
                </div>
              </Stack>
            </Card>

            <Card>
              <Stack gap={4}>
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
                      onChange={(checked) => handleIntegrationToggle('rco', checked)}
                    />
                  </div>
                </div>
              </Stack>
            </Card>

            <Card>
              <Stack gap={4}>
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
                      onChange={(checked) => handleIntegrationToggle('googleCalendar', checked)}
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
                      onChange={(checked) => handleIntegrationToggle('outlook', checked)}
                    />
                  </div>
                </div>
              </Stack>
            </Card>

            <Card>
              <Stack gap={4}>
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
                      onChange={(checked) => handleIntegrationToggle('visma', checked)}
                    />
                  </div>
                </div>
              </Stack>
            </Card>

            <Card>
              <Stack gap={4}>
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
                      onChange={(checked) => handleIntegrationToggle('brreg', checked)}
                    />
                  </div>
                </div>
              </Stack>
            </Card>
          </Stack>
        </Tabs.Content>

        {/* Branding */}
        <Tabs.Content value="branding">
          <Card>
            <Stack gap={5}>
              <div>
                <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
                  Visuell profil
                </Heading>
                <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                  Tilpass utseende og merkevare
                </Paragraph>
              </div>

              <Stack gap={4}>
                <FormField
                  label="Logo URL"
                  description="URL til logo (vil vises i toppen av siden)"
                >
                  <TextField
                    value={formData.branding.logo || ''}
                    onChange={(e) => setFormData(prev => ({
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
                  <TextField
                    type="color"
                    value={formData.branding.primaryColor || '#1A56DB'}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      branding: { ...prev.branding, primaryColor: e.target.value }
                    }))}
                  />
                </FormField>

                <FormField
                  label="Sekundærfarge"
                  description="Farge for mindre fremtredende elementer"
                >
                  <TextField
                    type="color"
                    value={formData.branding.secondaryColor || '#6B7280'}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      branding: { ...prev.branding, secondaryColor: e.target.value }
                    }))}
                  />
                </FormField>

                <FormField
                  label="Favicon URL"
                  description="URL til favicon (vises i nettleserens fane)"
                >
                  <TextField
                    value={formData.branding.favicon || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      branding: { ...prev.branding, favicon: e.target.value }
                    }))}
                    placeholder="https://example.com/favicon.ico"
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
        </Tabs.Content>
      </Tabs>
    </div>
  );
}
