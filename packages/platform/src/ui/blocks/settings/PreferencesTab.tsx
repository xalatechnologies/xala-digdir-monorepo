/**
 * PreferencesTab Block - Reusable DS Component
 *
 * Manages user preferences: language, display settings, and session management.
 * Domain-agnostic - receives all data and handlers via props.
 *
 * @example
 * ```tsx
 * // In app with i18n
 * import { useT } from '@xala/i18n';
 *
 * function MyPreferencesTab() {
 *   const t = useT();
 *
 *   return (
 *     <PreferencesTab
 *       locale={locale}
 *       onLocaleChange={setLocale}
 *       onLogout={handleLogout}
 *       labels={{
 *         language: t('settings.language'),
 *         selectLanguage: t('settings.selectLanguage'),
 *         // ... other labels
 *       }}
 *     />
 *   );
 * }
 * ```
 */
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Select,
} from '@digdir/designsystemet-react';
import { Stack } from '../../primitives';
import { FormField } from '../../composed';

// =============================================================================
// Types
// =============================================================================

export interface PreferencesTabLabels {
  language: string;
  selectLanguage: string;
  preferredLanguage: string;
  norwegianBokmal: string;
  norwegianNynorsk: string;
  english: string;
  appearance: string;
  customizeAppearance: string;
  themeComingSoon: string;
  sessionAndSecurity: string;
  manageSession: string;
  logout: string;
  logoutDescription: string;
}

export interface PreferencesTabProps {
  locale: 'nb' | 'nn' | 'en';
  onLocaleChange: (locale: 'nb' | 'nn' | 'en') => void;
  onLogout: () => void;
  /** Labels for i18n */
  labels?: Partial<PreferencesTabLabels>;
  'data-testid'?: string;
}

// =============================================================================
// Default Labels
// =============================================================================

const DEFAULT_LABELS: PreferencesTabLabels = {
  language: 'Sprak',
  selectLanguage: 'Velg sprak for brukergrensesnittet',
  preferredLanguage: 'Foretrukket sprak',
  norwegianBokmal: 'Norsk bokmal',
  norwegianNynorsk: 'Norsk nynorsk',
  english: 'English',
  appearance: 'Utseende',
  customizeAppearance: 'Tilpass hvordan systemet ser ut',
  themeComingSoon: 'Tema og utseendeinnstillinger kommer snart',
  sessionAndSecurity: 'Okt og sikkerhet',
  manageSession: 'Administrer din palogging og sikkerhet',
  logout: 'Logg ut',
  logoutDescription: 'Logg ut av din konto pa denne enheten',
};

// =============================================================================
// Component
// =============================================================================

export function PreferencesTab({
  locale,
  onLocaleChange,
  onLogout,
  labels: customLabels,
  'data-testid': testId = 'preferences-tab',
}: PreferencesTabProps) {
  const labels = { ...DEFAULT_LABELS, ...customLabels };

  return (
    <Stack spacing="var(--ds-spacing-6)" data-testid={testId}>
      {/* Language */}
      <Card>
        <Stack spacing="var(--ds-spacing-4)">
          <div>
            <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
              {labels.language}
            </Heading>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              {labels.selectLanguage}
            </Paragraph>
          </div>

          <FormField label={labels.preferredLanguage}>
            <Select value={locale} onChange={(e) => onLocaleChange(e.target.value as 'nb' | 'nn' | 'en')}>
              <option value="nb">{labels.norwegianBokmal}</option>
              <option value="nn">{labels.norwegianNynorsk}</option>
              <option value="en">{labels.english}</option>
            </Select>
          </FormField>
        </Stack>
      </Card>

      {/* Display Settings */}
      <Card>
        <Stack spacing="var(--ds-spacing-4)">
          <div>
            <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
              {labels.appearance}
            </Heading>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              {labels.customizeAppearance}
            </Paragraph>
          </div>

          <div style={{
            padding: 'var(--ds-spacing-4)',
            backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
            borderRadius: 'var(--ds-border-radius-md)'
          }}>
            <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
              {labels.themeComingSoon}
            </Paragraph>
          </div>
        </Stack>
      </Card>

      {/* Session & Security */}
      <Card>
        <Stack spacing="var(--ds-spacing-4)">
          <div>
            <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
              {labels.sessionAndSecurity}
            </Heading>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              {labels.manageSession}
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
                {labels.logout}
              </Paragraph>
              <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                {labels.logoutDescription}
              </Paragraph>
            </div>
            <Button variant="secondary" data-size="sm" onClick={onLogout} type="button">
              {labels.logout}
            </Button>
          </div>
        </Stack>
      </Card>
    </Stack>
  );
}
