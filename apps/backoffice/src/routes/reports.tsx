import { Card, Heading, Paragraph } from '@xala/ds';

const ChartIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

export function ReportsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      <div>
        <Heading level={1} data-size="lg" style={{ margin: 0 }}>
          Rapporter
        </Heading>
        <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)', marginBottom: 0 }}>
          Oversikt og statistikk over bookinger og bruk.
        </Paragraph>
      </div>

      <Card
        style={{
          padding: 'var(--ds-spacing-12)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: 'var(--ds-spacing-4)',
        }}
      >
        <div style={{ color: 'var(--ds-color-neutral-text-subtle)', opacity: 0.5 }}>
          <ChartIcon />
        </div>
        <Heading level={2} data-size="md" style={{ margin: 0 }}>
          Rapporter kommer snart
        </Heading>
        <Paragraph
          data-size="sm"
          style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0, maxWidth: '400px' }}
        >
          Vi jobber med å utvikle rapporter og statistikk for bookinger, bruk og inntekter.
          Denne funksjonen vil være tilgjengelig i en fremtidig oppdatering.
        </Paragraph>
      </Card>
    </div>
  );
}
