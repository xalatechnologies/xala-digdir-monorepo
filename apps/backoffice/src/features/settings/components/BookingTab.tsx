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
import { useT } from '@xala/i18n';

export function BookingTab() {
  const t = useT();
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
          <FormField label={t('common.automatisk_bekreftelse')}>
            <Switch
              checked={bookingData.autoConfirm}
              onChange={(checked) => updateField('autoConfirm', checked)}
            >
              Bekreft bookinger automatisk uten godkjenning
            </Switch>
          </FormField>

          {shouldShowApprovalField && (
            <FormField label={t('common.krev_godkjenning')}>
              <Switch
                checked={bookingData.requireApproval}
                onChange={(checked) => updateField('requireApproval', checked)}
              >
                Alle bookinger må godkjennes av saksbehandler
              </Switch>
            </FormField>
          )}

          <FormField label={t('common.tillat_kansellering')}>
            <Switch
              checked={bookingData.allowCancellation}
              onChange={(checked) => updateField('allowCancellation', checked)}
            >
              Brukere kan kansellere egne bookinger
            </Switch>
          </FormField>

          {shouldShowCancellationDeadline && (
            <FormField
              label={t('settings.booking.cancellationDeadline')}
              description={t('common.antall_timer_for_bookingstart')}
            >
              <Textfield
                aria-label={t('settings.booking.cancellationDeadline')}
                value={bookingData.cancellationDeadlineHours.toString()}
                onChange={(e) => updateField('cancellationDeadlineHours', parseInt(e.target.value) || 0)}
                type="number"
                min="0"
                suffix="timer"
              />
            </FormField>
          )}

          <FormField
            label={t('common.maksimal_forhaandsbooking')}
            description={t('common.hvor_langt_frem_i')}
          >
            <Textfield
              aria-label={t('common.maksimal_forhaandsbooking')}
              value={bookingData.maxAdvanceBookingDays.toString()}
              onChange={(e) => updateField('maxAdvanceBookingDays', parseInt(e.target.value) || 0)}
              type="number"
              min="1"
              suffix="dager"
            />
          </FormField>

          <FormField
            label={t('common.minimum_forhaandstid')}
            description={t('common.hvor_kort_tid_for')}
          >
            <Textfield
              aria-label={t('common.minimum_forhaandstid')}
              value={bookingData.minAdvanceBookingHours.toString()}
              onChange={(e) => updateField('minAdvanceBookingHours', parseInt(e.target.value) || 0)}
              type="number"
              min="0"
              suffix="timer"
            />
          </FormField>

          <FormField
            label={t('common.buffertid_mellom_bookinger')}
            description={t('common.automatisk_pause_mellom_paafolgende')}
          >
            <Textfield
              aria-label={t('common.buffertid_mellom_bookinger')}
              value={bookingData.bufferTimeMinutes.toString()}
              onChange={(e) => updateField('bufferTimeMinutes', parseInt(e.target.value) || 0)}
              type="number"
              min="0"
              suffix="minutter"
            />
          </FormField>
        </Stack>

        <div style={{ paddingTop: 'var(--ds-spacing-3)', borderTop: '1px solid var(--ds-color-neutral-border-subtle)' }}>
          <Button onClick={saveBookingSettings} disabled={isSaving} type="button" aria-label={t('common.lagre_endringer')}>
            <SaveIcon />
            {isSaving ? t('common.lagrer') : t('common.lagre_endringer')}
          </Button>
        </div>
      </Stack>
    </Card>
  );
}
