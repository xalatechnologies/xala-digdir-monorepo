/**
 * Help Guides Page
 * Step-by-step guides for org_member users
 */
import { Heading, Paragraph, Card } from '@xala/ds';
import { Link } from 'react-router-dom';

export default function GuidesPage() {
  const guides = [
    {
      id: 'booking-approval',
      title: 'Behandle bookingforespørsler',
      description: 'Lær hvordan du godkjenner eller avslår bookingforespørsler',
      steps: [
        'Gå til Bookinger-siden fra menyen',
        'Finn forespørselen du vil behandle',
        'Klikk på forespørselen for å se detaljer',
        'Velg "Godkjenn" eller "Avslå" fra handlingsmenyen',
        'Ved avslag: Oppgi en begrunnelse i tekstfeltet',
      ],
    },
    {
      id: 'calendar-view',
      title: 'Bruke kalenderen',
      description: 'Oversikt over reservasjoner for dine tildelte objekter',
      steps: [
        'Gå til Kalender fra menyen',
        'Se alle bookinger for dine objekter',
        'Klikk på en booking for å se detaljer',
        'Bruk filtre for å vise spesifikke objekter',
      ],
    },
    {
      id: 'messages',
      title: 'Svare på meldinger',
      description: 'Kommuniser med brukere om bookinger',
      steps: [
        'Gå til Meldinger fra menyen',
        'Åpne samtalen du vil svare på',
        'Skriv svaret ditt i tekstfeltet',
        'Klikk Send for å sende meldingen',
      ],
    },
  ];

  return (
    <div style={{ padding: 'var(--ds-spacing-6)' }}>
      <header style={{ marginBottom: 'var(--ds-spacing-8)' }}>
        <Link
          to="/help"
          style={{
            color: 'var(--ds-color-accent-text-default)',
            textDecoration: 'none',
            marginBottom: 'var(--ds-spacing-2)',
            display: 'inline-block',
          }}
        >
          ← Tilbake til Hjelp
        </Link>
        <Heading level={1} data-size="lg">
          Veiledninger
        </Heading>
        <Paragraph data-size="md" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          Steg-for-steg guider for vanlige oppgaver
        </Paragraph>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
        {guides.map((guide) => (
          <Card key={guide.id} style={{ padding: 'var(--ds-spacing-6)' }}>
            <Heading level={2} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
              {guide.title}
            </Heading>
            <Paragraph
              data-size="sm"
              style={{ color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-4)' }}
            >
              {guide.description}
            </Paragraph>
            <ol style={{ paddingLeft: 'var(--ds-spacing-6)', margin: 0 }}>
              {guide.steps.map((step, index) => (
                <li key={index} style={{ marginBottom: 'var(--ds-spacing-2)' }}>
                  {step}
                </li>
              ))}
            </ol>
          </Card>
        ))}
      </div>
    </div>
  );
}
