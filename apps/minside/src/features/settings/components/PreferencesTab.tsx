/**
 * PreferencesTab Component
 * Manages user preferences: language, display settings, and session management
 */

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
import { useAuth } from '../../../hooks/useAuth';

export function PreferencesTab() {
  const { locale, setLocale } = useLocale();
  const { logout } = useAuth();

  return (
    <Stack spacing={6}>
      {/* Language */}
      <Card>
        <Stack spacing={4}>
          <div>
            <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
              Språk
            </Heading>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              Velg språk for brukergrensesnittet
            </Paragraph>
          </div>

          <FormField label="Foretrukket språk">
            <Select value={locale} onChange={(e) => setLocale(e.target.value as 'nb' | 'en')}>
              <option value="nb">Norsk (Bokmål)</option>
              <option value="nn">Norsk (Nynorsk)</option>
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
              Utseende
            </Heading>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              Tilpass hvordan systemet ser ut
            </Paragraph>
          </div>

          <div style={{
            padding: 'var(--ds-spacing-4)',
            backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
            borderRadius: 'var(--ds-border-radius-md)'
          }}>
            <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
              Tema og utseendeinnstillinger kommer snart
            </Paragraph>
          </div>
        </Stack>
      </Card>

      {/* Session & Security */}
      <Card>
        <Stack spacing={4}>
          <div>
            <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
              Økt og sikkerhet
            </Heading>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              Administrer din pålogging og sikkerhet
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
                Logg ut
              </Paragraph>
              <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                Logg ut av din konto på denne enheten
              </Paragraph>
            </div>
            <Button variant="secondary" data-size="sm" onClick={logout} type="button">
              Logg ut
            </Button>
          </div>
        </Stack>
      </Card>
    </Stack>
  );
}
