import { Card, Heading, Paragraph } from '@xala/ds';

export function SettingsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-5)' }}>
      <div>
        <Heading level={2} data-size="md">
          Systeminnstillinger
        </Heading>
        <Paragraph
          data-size="sm"
          style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-1)' }}
        >
          Konfigurer systeminnstillinger og regler
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
            Bookingsregler
          </Heading>
          <Paragraph
            data-size="sm"
            style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)' }}
          >
            Konfigurer regler for automatisk godkjenning, avbestillingsfrister og tilgangsregler.
          </Paragraph>
        </Card>

        <Card style={{ padding: 'var(--ds-spacing-5)' }}>
          <Heading level={3} data-size="sm">
            Prissetting
          </Heading>
          <Paragraph
            data-size="sm"
            style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)' }}
          >
            Sett priser for ulike lokaler, brukergrupper og tidspunkter.
          </Paragraph>
        </Card>

        <Card style={{ padding: 'var(--ds-spacing-5)' }}>
          <Heading level={3} data-size="sm">
            Integrasjoner
          </Heading>
          <Paragraph
            data-size="sm"
            style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)' }}
          >
            Administrer integrasjoner med låssystemer, kalender og regnskapssystemer.
          </Paragraph>
        </Card>

        <Card style={{ padding: 'var(--ds-spacing-5)' }}>
          <Heading level={3} data-size="sm">
            E-postvarsler
          </Heading>
          <Paragraph
            data-size="sm"
            style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)' }}
          >
            Tilpass e-postmaler og varslingsinnstillinger.
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
          Under utvikling
        </Heading>
        <Paragraph
          data-size="sm"
          style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)' }}
        >
          Innstillingssiden er under utvikling. Flere konfigurasjonsalternativer kommer snart.
        </Paragraph>
      </Card>
    </div>
  );
}
