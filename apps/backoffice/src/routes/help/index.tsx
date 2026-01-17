/**
 * Help & Support Page
 * Available to all org_member users (CAP_NAV_HELP capability)
 * Provides overview, guides, and FAQ for operational users
 */
import { Heading, Paragraph, Card } from '@xala/ds';
import { Link } from 'react-router-dom';

export default function HelpPage() {
  const helpSections = [
    {
      title: 'Kom i gang',
      description: 'Lær hvordan du bruker systemet effektivt',
      href: '/help/guides',
      icon: '📚',
    },
    {
      title: 'Vanlige spørsmål',
      description: 'Svar på ofte stilte spørsmål',
      href: '/help/faq',
      icon: '❓',
    },
    {
      title: 'Kontakt support',
      description: 'Trenger du hjelp? Ta kontakt med oss',
      href: 'mailto:support@digilist.no',
      icon: '📧',
      external: true,
    },
  ];

  return (
    <div style={{ padding: 'var(--ds-spacing-6)' }}>
      <header style={{ marginBottom: 'var(--ds-spacing-8)' }}>
        <Heading level={1} data-size="lg">
          Hjelp og støtte
        </Heading>
        <Paragraph data-size="md" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          Finn svar på spørsmål og lær hvordan du bruker systemet
        </Paragraph>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 'var(--ds-spacing-6)',
        }}
      >
        {helpSections.map((section) => (
          <Link
            key={section.title}
            to={section.href}
            style={{ textDecoration: 'none' }}
            {...(section.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            <Card
              style={{
                padding: 'var(--ds-spacing-6)',
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--ds-shadow-md)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: 'var(--ds-spacing-4)' }}>
                {section.icon}
              </div>
              <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
                {section.title}
              </Heading>
              <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                {section.description}
              </Paragraph>
            </Card>
          </Link>
        ))}
      </div>

      <section style={{ marginTop: 'var(--ds-spacing-10)' }}>
        <Heading level={2} data-size="md" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          Hurtigstartsguide
        </Heading>
        <div
          style={{
            backgroundColor: 'var(--ds-color-neutral-surface-hover)',
            borderRadius: 'var(--ds-border-radius-lg)',
            padding: 'var(--ds-spacing-6)',
          }}
        >
          <ol style={{ paddingLeft: 'var(--ds-spacing-6)', margin: 0 }}>
            <li style={{ marginBottom: 'var(--ds-spacing-3)' }}>
              <strong>Se dine tildelte utleieobjekter</strong> - Gå til Dashboard for oversikt
            </li>
            <li style={{ marginBottom: 'var(--ds-spacing-3)' }}>
              <strong>Behandle bookinger</strong> - Bruk Bookinger-siden for å godkjenne eller avslå forespørsler
            </li>
            <li style={{ marginBottom: 'var(--ds-spacing-3)' }}>
              <strong>Se kalenderen</strong> - Kalender viser alle reservasjoner for dine objekter
            </li>
            <li>
              <strong>Kommuniser med brukere</strong> - Bruk Meldinger for å svare på henvendelser
            </li>
          </ol>
        </div>
      </section>
    </div>
  );
}
