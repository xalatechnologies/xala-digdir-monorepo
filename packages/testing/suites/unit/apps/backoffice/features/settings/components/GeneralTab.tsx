/**
 * GeneralTab Component
 * Manages general system settings including locale, timezone, currency, and formats
 */

import {
  Card,
  Heading,
  Paragraph,
  Button,
  Stack,
  FormField,
  Textfield,
  Select,
  SaveIcon,
} from '@xala/ds';
import { useGeneralSettings } from '@digilist/api/hooks/useGeneralSettings';
import { useT } from '@xala/i18n';

export function GeneralTab() {
  // Translation function available for future localization
  const _t = useT(); // eslint-disable-line @typescript-eslint/no-unused-vars
  const {
    generalData,
    updateField,
    saveGeneralSettings,
    isSaving,
  } = useGeneralSettings();

  return (
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
              aria-label="Systemnavn"
              value={generalData.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="Digilist Booking"
            />
          </FormField>

          <FormField label="Språk">
            <Select
              value={generalData.locale}
              onChange={(e) => updateField('locale', e.target.value as 'nb' | 'nn' | 'en')}
            >
              <option value="nb">Norsk bokmål</option>
              <option value="nn">Norsk nynorsk</option>
              <option value="en">English</option>
            </Select>
          </FormField>

          <FormField label="Tidssone">
            <Select
              value={generalData.timezone}
              onChange={(e) => updateField('timezone', e.target.value as 'Europe/Oslo' | 'Europe/London' | 'America/New_York')}
            >
              <option value="Europe/Oslo">Europa/Oslo (CET)</option>
              <option value="Europe/London">Europa/London (GMT)</option>
              <option value="America/New_York">Amerika/New York (EST)</option>
            </Select>
          </FormField>

          <FormField label="Valuta">
            <Select
              value={generalData.currency}
              onChange={(e) => updateField('currency', e.target.value as 'NOK' | 'EUR' | 'USD')}
            >
              <option value="NOK">Norske kroner (NOK)</option>
              <option value="EUR">Euro (EUR)</option>
              <option value="USD">US Dollar (USD)</option>
            </Select>
          </FormField>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--ds-spacing-3)' }}>
            <FormField label="Datoformat">
              <Select
                value={generalData.dateFormat}
                onChange={(e) => updateField('dateFormat', e.target.value as 'dd.MM.yyyy' | 'yyyy-MM-dd' | 'MM/dd/yyyy')}
              >
                <option value="dd.MM.yyyy">31.12.2024</option>
                <option value="yyyy-MM-dd">2024-12-31</option>
                <option value="MM/dd/yyyy">12/31/2024</option>
              </Select>
            </FormField>

            <FormField label="Tidsformat">
              <Select
                value={generalData.timeFormat}
                onChange={(e) => updateField('timeFormat', e.target.value as '24h' | '12h')}
              >
                <option value="24h">24-timers (13:00)</option>
                <option value="12h">12-timers (1:00 PM)</option>
              </Select>
            </FormField>
          </div>
        </Stack>

        <div style={{ paddingTop: 'var(--ds-spacing-3)', borderTop: '1px solid var(--ds-color-neutral-border-subtle)' }}>
          <Button onClick={saveGeneralSettings} disabled={isSaving} type="button" aria-label="Lagre endringer">
            <SaveIcon />
            {isSaving ? 'Lagrer...' : 'Lagre endringer'}
          </Button>
        </div>
      </Stack>
    </Card>
  );
}
