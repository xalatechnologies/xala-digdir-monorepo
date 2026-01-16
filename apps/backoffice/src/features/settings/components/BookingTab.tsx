/**
 * BookingTab Component
 * Manages booking configuration: auto-confirm, approval, cancellation, and time settings
 */

import {
  Card,
  Heading,
  Paragraph,
  Button,
  Stack,
  FormField,
  Textfield,
  Switch,
  SaveIcon,
} from '@xala/ds';
import { useBookingSettings } from '../hooks/useBookingSettings';

export function BookingTab() {
  const {
    bookingData,
    updateField,
    saveBookingSettings,
    isSaving,
    shouldShowApprovalField,
    shouldShowCancellationDeadline,
  } = useBookingSettings();

  return (
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
          <FormField label="Automatisk bekreftelse">
            <Switch
              checked={bookingData.autoConfirm}
              onChange={(checked) => updateField('autoConfirm', checked)}
            >
              Bekreft bookinger automatisk uten godkjenning
            </Switch>
          </FormField>

          {shouldShowApprovalField && (
            <FormField label="Krev godkjenning">
              <Switch
                checked={bookingData.requireApproval}
                onChange={(checked) => updateField('requireApproval', checked)}
              >
                Alle bookinger må godkjennes av saksbehandler
              </Switch>
            </FormField>
          )}

          <FormField label="Tillat kansellering">
            <Switch
              checked={bookingData.allowCancellation}
              onChange={(checked) => updateField('allowCancellation', checked)}
            >
              Brukere kan kansellere egne bookinger
            </Switch>
          </FormField>

          {shouldShowCancellationDeadline && (
            <FormField
              label="Kanselleringsfrist"
              description="Antall timer før bookingstart kansellering er tillatt"
            >
              <Textfield
                aria-label="Kanselleringsfrist"
                value={bookingData.cancellationDeadlineHours.toString()}
                onChange={(e) => updateField('cancellationDeadlineHours', parseInt(e.target.value) || 0)}
                type="number"
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
              aria-label="Maksimal forhåndsbooking"
              value={bookingData.maxAdvanceBookingDays.toString()}
              onChange={(e) => updateField('maxAdvanceBookingDays', parseInt(e.target.value) || 0)}
              type="number"
              min="1"
              suffix="dager"
            />
          </FormField>

          <FormField
            label="Minimum forhåndstid"
            description="Hvor kort tid før kan man booke?"
          >
            <Textfield
              aria-label="Minimum forhåndstid"
              value={bookingData.minAdvanceBookingHours.toString()}
              onChange={(e) => updateField('minAdvanceBookingHours', parseInt(e.target.value) || 0)}
              type="number"
              min="0"
              suffix="timer"
            />
          </FormField>

          <FormField
            label="Buffertid mellom bookinger"
            description="Automatisk pause mellom påfølgende bookinger"
          >
            <Textfield
              aria-label="Buffertid mellom bookinger"
              value={bookingData.bufferTimeMinutes.toString()}
              onChange={(e) => updateField('bufferTimeMinutes', parseInt(e.target.value) || 0)}
              type="number"
              min="0"
              suffix="minutter"
            />
          </FormField>
        </Stack>

        <div style={{ paddingTop: 'var(--ds-spacing-3)', borderTop: '1px solid var(--ds-color-neutral-border-subtle)' }}>
          <Button onClick={saveBookingSettings} disabled={isSaving} type="button" aria-label="Lagre endringer">
            <SaveIcon />
            {isSaving ? 'Lagrer...' : 'Lagre endringer'}
          </Button>
        </div>
      </Stack>
    </Card>
  );
}
