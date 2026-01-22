/**
 * PreferencesTab Wrapper
 * Thin wrapper that wires SDK/auth hooks to DS PreferencesTab props
 */
import { PreferencesTab as DSPreferencesTab } from '@xalatechnologies/platform/ui';
import { useLocale } from '@xalatechnologies/platform/i18n';
import { useAuth } from '@xalatechnologies/platform/auth';

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
