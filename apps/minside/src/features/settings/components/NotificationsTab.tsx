/**
 * NotificationsTab Component
 * Manages notification configuration: email, SMS, push notifications, and automatic alerts
 */

import { useT } from '@xala/i18n';
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
import { useNotificationSettings } from '../hooks/useNotificationSettings';

export function NotificationsTab() {
  const t = useT();
  const {
    notificationData,
    updateField,
    saveNotificationSettings,
    isSaving,
    shouldShowReminderHours,
  } = useNotificationSettings();

  return (
    <Card>
      <Stack spacing={5}>
        <div>
          <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
            {t('common.varslingsinnstillinger')}
          </Heading>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
            {t('common.konfigurer.hvordan.systemet.sender.varsler')}
          </Paragraph>
        </div>

        <Stack spacing={4}>
          <FormField label={t('common.epostvarsler')}>
            <Switch
              checked={notificationData.emailEnabled}
              onChange={(checked) => updateField('emailEnabled', checked)}
            >
              {t('common.send.varsler.paa.epost')}
            </Switch>
          </FormField>

          <FormField label={t('common.smsvarsler')}>
            <Switch
              checked={notificationData.smsEnabled}
              onChange={(checked) => updateField('smsEnabled', checked)}
            >
              {t('common.send.varsler.paa.sms')}
            </Switch>
          </FormField>

          <FormField label={t('common.pushvarsler')}>
            <Switch
              checked={notificationData.pushEnabled}
              onChange={(checked) => updateField('pushEnabled', checked)}
            >
              {t('common.send.pushvarsler.til.mobilapp')}
            </Switch>
          </FormField>

          <div style={{
            padding: 'var(--ds-spacing-4)',
            backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
            borderRadius: 'var(--ds-border-radius-md)',
            marginTop: 'var(--ds-spacing-2)',
          }}>
            <Paragraph data-size="sm" style={{ fontWeight: 'var(--ds-font-weight-semibold)', marginBottom: 'var(--ds-spacing-3)' }}>
              {t('common.automatiske.varsler')}
            </Paragraph>

            <Stack spacing={3}>
              <FormField label={t('common.bookingbekreftelse')}>
                <Switch
                  checked={notificationData.bookingConfirmation}
                  onChange={(checked) => updateField('bookingConfirmation', checked)}
                >
                  {t('common.send.bekreftelse.naar.booking.er.godkjent')}
                </Switch>
              </FormField>

              <FormField label={t('common.bookingpaaminnelse')}>
                <Switch
                  checked={notificationData.bookingReminder}
                  onChange={(checked) => updateField('bookingReminder', checked)}
                >
                  {t('common.send.paaminnelse.for.booking.starter')}
                </Switch>
              </FormField>

              {shouldShowReminderHours && (
                <FormField
                  label={t('common.paaminnelsestidspunkt')}
                  description={t('common.hvor_lenge_for_booking')}
                >
                  <Textfield
                    aria-label={t('common.paaminnelsestidspunkt')}
                    value={notificationData.reminderHoursBefore.toString()}
                    onChange={(e) => updateField('reminderHoursBefore', parseInt(e.target.value) || 24)}
                    type="number"
                    min="1"
                    suffix={t('common.timer.for')}
                  />
                </FormField>
              )}
            </Stack>
          </div>
        </Stack>

        <div style={{ paddingTop: 'var(--ds-spacing-3)', borderTop: '1px solid var(--ds-color-neutral-border-subtle)' }}>
          <Button
            onClick={saveNotificationSettings}
            disabled={isSaving}
            type="button"
            aria-label={isSaving ? t('common.lagrer_endringer') : 'Lagre endringer'}
          >
            <SaveIcon />
            {isSaving ? t('state.saving') : t('common.lagre_endringer')}
          </Button>
        </div>
      </Stack>
    </Card>
  );
}
