import { Card, Heading, Paragraph } from '@xala/ds';
import { useT } from '@xala/i18n';

export function SettingsPage() {
  const t = useT();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-5)' }}>
      <div>
        <Heading level={2} data-size="md">
          {t('settings.systemSettings')}
        </Heading>
        <Paragraph
          data-size="sm"
          style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-1)' }}
        >
          {t('settings.configureSystem')}
        </Paragraph>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'var(--ds-spacing-4)',
        }}
      >
        <Card style={{ padding: 'var(--ds-spacing-5)' }}>
          <Heading level={3} data-size="sm">
            {t('settings.bookingRules')}
          </Heading>
          <Paragraph
            data-size="sm"
            style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)' }}
          >
            {t('settings.bookingRulesDesc')}
          </Paragraph>
        </Card>

        <Card style={{ padding: 'var(--ds-spacing-5)' }}>
          <Heading level={3} data-size="sm">
            {t('settings.pricing')}
          </Heading>
          <Paragraph
            data-size="sm"
            style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)' }}
          >
            {t('settings.pricingDesc')}
          </Paragraph>
        </Card>

        <Card style={{ padding: 'var(--ds-spacing-5)' }}>
          <Heading level={3} data-size="sm">
            {t('settings.integrations')}
          </Heading>
          <Paragraph
            data-size="sm"
            style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)' }}
          >
            {t('settings.integrationsDesc')}
          </Paragraph>
        </Card>

        <Card style={{ padding: 'var(--ds-spacing-5)' }}>
          <Heading level={3} data-size="sm">
            {t('settings.emailNotifications')}
          </Heading>
          <Paragraph
            data-size="sm"
            style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)' }}
          >
            {t('settings.emailNotificationsDesc')}
          </Paragraph>
        </Card>
      </div>

      <Card
        style={{
          padding: 'var(--ds-spacing-5)',
          backgroundColor: 'var(--ds-color-info-surface-default)',
          border: '1px solid var(--ds-color-info-border-default)',
        }}
      >
        <Heading level={3} data-size="sm">
          {t('settings.underDevelopment')}
        </Heading>
        <Paragraph
          data-size="sm"
          style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)' }}
        >
          {t('settings.underDevelopmentDesc')}
        </Paragraph>
      </Card>
    </div>
  );
}
