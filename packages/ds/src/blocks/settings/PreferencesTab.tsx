/**
 * PreferencesTab Block - Reusable DS Component
 * 
 * Manages user preferences: language, display settings, and session management
 */
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Select,
} from '@digdir/designsystemet-react';
import { Stack, FormField } from '../../primitives';
import { useT } from '@xala/i18n';

export interface PreferencesTabProps {
  locale: 'nb' | 'nn' | 'en';
  onLocaleChange: (locale: 'nb' | 'nn' | 'en') => void;
  onLogout: () => void;
  'data-testid'?: string;
}

export function PreferencesTab({
  locale,
  onLocaleChange,
  onLogout,
  'data-testid': testId = 'preferences-tab',
}: PreferencesTabProps) {
  const t = useT();

  return (
    <Stack spacing="var(--ds-spacing-6)" data-testid={testId}>
      {/* Language */}
      <Card>
        <Stack spacing="var(--ds-spacing-4)">
          <div>
            <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
              {t('common.spraak') || 'Språk'}
            </Heading>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              {t('common.velg.spraak.for.brukergrensesnittet') || 'Velg språk for brukergrensesnittet'}
            </Paragraph>
          </div>

          <FormField label={t('common.foretrukket_spraak') || 'Foretrukket språk'}>
            <Select value={locale} onChange={(e) => onLocaleChange(e.target.value as 'nb' | 'nn' | 'en')}>
              <option value="nb">{t('common.norsk_bokmaal') || 'Norsk bokmål'}</option>
              <option value="nn">{t('common.norsk_nynorsk') || 'Norsk nynorsk'}</option>
              <option value="en">{t('settings.text.english') || 'English'}</option>
            </Select>
          </FormField>
        </Stack>
      </Card>

      {/* Display Settings */}
      <Card>
        <Stack spacing="var(--ds-spacing-4)">
          <div>
            <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
              {t('common.utseende') || 'Utseende'}
            </Heading>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              {t('common.tilpass.hvordan.systemet.ser.ut') || 'Tilpass hvordan systemet ser ut'}
            </Paragraph>
          </div>

          <div style={{
            padding: 'var(--ds-spacing-4)',
            backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
            borderRadius: 'var(--ds-border-radius-md)'
          }}>
            <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
              {t('common.tema.og.utseende.kommer.snart') || 'Tema og utseendeinnstillinger kommer snart'}
            </Paragraph>
          </div>
        </Stack>
      </Card>

      {/* Session & Security */}
      <Card>
        <Stack spacing="var(--ds-spacing-4)">
          <div>
            <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
              {t('common.okt.og.sikkerhet') || 'Økt og sikkerhet'}
            </Heading>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              {t('common.administrer.din.paalogging.og.sikkerhet') || 'Administrer din pålogging og sikkerhet'}
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
                {t('common.logg_ut') || 'Logg ut'}
              </Paragraph>
              <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                {t('common.logg.ut.av.konto.paa.enhet') || 'Logg ut av din konto på denne enheten'}
              </Paragraph>
            </div>
            <Button variant="secondary" data-size="sm" onClick={onLogout} type="button">
              {t('common.logg_ut') || 'Logg ut'}
            </Button>
          </div>
        </Stack>
      </Card>
    </Stack>
  );
}
