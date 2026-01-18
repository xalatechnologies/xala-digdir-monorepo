/**
 * NotificationsTab Component
 * Manages notification configuration: email, SMS, push notifications, and automatic alerts
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
import { useNotificationSettings } from '../hooks/useNotificationSettings';
import { useT } from '@xala/i18n';

export function NotificationsTab() {
  // Translation function available for future localization
  const _t = useT(); // eslint-disable-line @typescript-eslint/no-unused-vars
  const {
  const t = useT();
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
            Varslingsinnstillinger
          </Heading>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
            Konfigurer hvordan systemet sender varsler
          </Paragraph>
        </div>

        <Stack spacing={4}>
          <FormField label={t('common.epostvarsler')}>
            <Switch
              checked={notificationData.emailEnabled}
              onChange={(checked) => updateField('emailEnabled', checked)}
            >
              Send varsler på e-post
            </Switch>
          </FormField>

          <FormField label={t('common.smsvarsler')}>
            <Switch
              checked={notificationData.smsEnabled}
              onChange={(checked) => updateField('smsEnabled', checked)}
            >
              Send varsler på SMS
            </Switch>
          </FormField>

          <FormField label={t('common.pushvarsler')}>
            <Switch
              checked={notificationData.pushEnabled}
              onChange={(checked) => updateField('pushEnabled', checked)}
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
            <Paragraph data-size="sm" style={{ fontWeight: 'var(--ds-font-weight-semibold)', marginBottom: 'var(--ds-spacing-3)' }}>
              Automatiske varsler
            </Paragraph>

            <Stack spacing={3}>
              <FormField label="Bookingbekreftelse">
                <Switch
                  checked={notificationData.bookingConfirmation}
                  onChange={(checked) => updateField('bookingConfirmation', checked)}
                >
                  Send bekreftelse når booking er godkjent
                </Switch>
              </FormField>

              <FormField label={t('common.bookingpaaminnelse')}>
                <Switch
                  checked={notificationData.bookingReminder}
                  onChange={(checked) => updateField('bookingReminder', checked)}
                >
                  Send påminnelse før booking starter
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
                    suffix="timer før"
                  />
                </FormField>
              )}
            </Stack>
          </div>
        </Stack>

        <div style={{ paddingTop: 'var(--ds-spacing-3)', borderTop: '1px solid var(--ds-color-neutral-border-subtle)' }}>
          <Button onClick={saveNotificationSettings} disabled={isSaving} type="button" aria-label={t('common.lagre_endringer')}>
            <SaveIcon />
            {isSaving ? t('state.saving') : 'Lagre endringer'}
          </Button>
        </div>
      </Stack>
    </Card>
  );
}
