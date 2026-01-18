/**
 * PreferencesTab Component
 * Manages user preferences: language, display settings, and session management
 */

import { useT } from '@xala/i18n';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Stack,
  FormField,
  Select,
} from '@xala/ds';
import { useLocale } from '@xala/i18n';
import { useAuth } from '@xala/auth';

export function PreferencesTab() {
  const { locale, setLocale } = useLocale();
  const t = useT();
  const { logout } = useAuth();

  return (
    <Stack spacing={6}>
      {/* Language */}
      <Card>
        <Stack spacing={4}>
          <div>
            <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
              {t('common.spraak')}
            </Heading>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              {t('common.velg.spraak.for.brukergrensesnittet')}
            </Paragraph>
          </div>

          <FormField label={t('common.foretrukket_spraak')}>
            <Select value={locale} onChange={(e) => setLocale(e.target.value as 'nb' | 'en')}>
              <option value="nb">{t('common.norsk_bokmaal')}</option>
              <option value="nn">{t('common.norsk_nynorsk')}</option>
              <option value="en">English</option>
            </Select>
          </FormField>
        </Stack>
      </Card>

      {/* Display Settings */}
      <Card>
        <Stack spacing={4}>
          <div>
            <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
              {t('common.utseende')}
            </Heading>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              {t('common.tilpass.hvordan.systemet.ser.ut')}
            </Paragraph>
          </div>

          <div style={{
            padding: 'var(--ds-spacing-4)',
            backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
            borderRadius: 'var(--ds-border-radius-md)'
          }}>
            <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
              {t('common.tema.og.utseende.kommer.snart')}
            </Paragraph>
          </div>
        </Stack>
      </Card>

      {/* Session & Security */}
      <Card>
        <Stack spacing={4}>
          <div>
            <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
              {t('common.okt.og.sikkerhet')}
            </Heading>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              {t('common.administrer.din.paalogging.og.sikkerhet')}
            </Paragraph>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 'var(--ds-spacing-4)',
            backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
            borderRadius: 'var(--ds-border-radius-md)'
          }}>
            <div>
              <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                {t('common.logg_ut')}
              </Paragraph>
              <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                {t('common.logg.ut.av.konto.paa.enhet')}
              </Paragraph>
            </div>
            <Button variant="secondary" data-size="sm" onClick={logout} type="button">
              {t('common.logg_ut')}
            </Button>
          </div>
        </Stack>
      </Card>
    </Stack>
  );
}
