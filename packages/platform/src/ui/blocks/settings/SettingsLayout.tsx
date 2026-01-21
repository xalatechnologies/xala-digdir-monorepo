/**
 * Settings Tab Layout Block
 * Reusable layout for settings tab content
 */
import { Card, Heading, Paragraph } from '@digdir/designsystemet-react';

export interface SettingsTabLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  'data-testid'?: string;
}

export function SettingsTabLayout({ title, description, children, 'data-testid': testId = 'settings-tab' }: SettingsTabLayoutProps) {
  return (
    <Card data-testid={testId} style={{ padding: 'var(--ds-spacing-6)' }}>
      <Heading level={2} data-size="md" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>{title}</Heading>
      {description && <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-6)' }}>{description}</Paragraph>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-5)' }}>{children}</div>
    </Card>
  );
}

export interface SettingsFieldProps {
  label: string;
  description?: string;
  children: React.ReactNode;
}

export function SettingsField({ label, description, children }: SettingsFieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
      <div>
        <Heading level={3} data-size="xs" style={{ margin: 0 }}>{label}</Heading>
        {description && <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>{description}</Paragraph>}
      </div>
      {children}
    </div>
  );
}

export interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

export function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <div style={{ borderTop: '1px solid var(--ds-color-neutral-border-subtle)', paddingTop: 'var(--ds-spacing-5)' }}>
      <Heading level={3} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>{title}</Heading>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>{children}</div>
    </div>
  );
}
