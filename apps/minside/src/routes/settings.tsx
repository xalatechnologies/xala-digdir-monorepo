import { Link } from 'react-router-dom';
import { Card, Heading, Paragraph, Button } from '@xala/ds';
import { useT, useLocale } from '@xala/i18n';
import { useAuth } from '../hooks/useAuth';

export function SettingsPage() {
  const t = useT();
  const { locale } = useLocale();
  const { user, logout } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Header */}
      <div>
        <Heading level={1} data-size="lg" style={{ margin: 0 }}>
          {t('minside.settings')}
        </Heading>
        <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)', marginBottom: 0 }}>
          {t('minside.settingsDesc')}
        </Paragraph>
      </div>

      {/* Profile Section */}
      <Card style={{ padding: 'var(--ds-spacing-5)' }}>
        <Heading level={2} data-size="md" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
          {t('minside.profile')}
        </Heading>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-4)' }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: 'var(--ds-border-radius-full)',
              backgroundColor: 'var(--ds-color-accent-surface-default)',
              color: 'var(--ds-color-accent-text-default)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'var(--ds-font-size-xl)',
              fontWeight: 'var(--ds-font-weight-bold)',
            }}
          >
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <Paragraph data-size="md" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)' }}>
              {user?.name || 'Bruker'}
            </Paragraph>
            <Paragraph data-size="sm" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
              {user?.email || ''}
            </Paragraph>
          </div>
        </div>
      </Card>

      {/* Preferences Section */}
      <Card style={{ padding: 'var(--ds-spacing-5)' }}>
        <Heading level={2} data-size="md" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
          {t('minside.preferences')}
        </Heading>

        {/* Language Setting */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 'var(--ds-spacing-4)', borderBottom: '1px solid var(--ds-color-neutral-border-subtle)' }}>
          <div>
            <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
              {t('settings.language')}
            </Paragraph>
            <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
              {locale === 'nb' ? 'Norsk (Bokmål)' : 'English'}
            </Paragraph>
          </div>
          {/* TODO: Re-enable when localization is fully implemented
          <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
            <Button
              type="button"
              variant={locale === 'nb' ? 'primary' : 'secondary'}
              data-size="sm"
              onClick={() => setLocale('nb')}
            >
              Norsk
            </Button>
            <Button
              type="button"
              variant={locale === 'en' ? 'primary' : 'secondary'}
              data-size="sm"
              onClick={() => setLocale('en')}
            >
              English
            </Button>
          </div>
          */}
        </div>

        {/* Notifications Setting */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 'var(--ds-spacing-4)' }}>
          <div>
            <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
              {t('minside.notifications')}
            </Paragraph>
            <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
              Push-varsler, e-post og påminnelser
            </Paragraph>
          </div>
          <Link to="/settings/notifications">
            <Button type="button" variant="secondary" data-size="sm">
              {t('common.edit')}
            </Button>
          </Link>
        </div>
      </Card>

      {/* Logout */}
      <Card style={{ padding: 'var(--ds-spacing-5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
              {t('auth.logout')}
            </Paragraph>
            <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
              Logg ut av din konto
            </Paragraph>
          </div>
          <Button type="button" variant="secondary" data-size="sm" onClick={logout}>
            {t('auth.logout')}
          </Button>
        </div>
      </Card>
    </div>
  );
}
