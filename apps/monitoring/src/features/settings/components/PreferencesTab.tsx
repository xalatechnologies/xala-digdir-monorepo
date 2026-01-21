/**
 * PreferencesTab Wrapper
 * Thin wrapper that wires SDK/auth hooks to DS PreferencesTab props
 */
import { PreferencesTab as DSPreferencesTab } from '@xalatechnologies/platform/ui';
import { useLocale } from '@xala/i18n';
import { useAuth } from '@xala/auth';

export function PreferencesTab() {
  const { locale, setLocale } = useLocale();
  const { logout } = useAuth();

  return (
    <DSPreferencesTab
      locale={locale as 'nb' | 'nn' | 'en'}
      onLocaleChange={setLocale}
      onLogout={logout}
    />
  );
}
