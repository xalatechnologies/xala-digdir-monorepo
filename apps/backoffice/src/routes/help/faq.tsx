/**
 * Help FAQ Page
 * Frequently asked questions for org_member users
 */
import { Heading, Paragraph } from '@xala/ds';
import { Link } from 'react-router-dom';

export default function FAQPage() {
  const faqItems = [
    {
      question: 'Hvordan godkjenner jeg en bookingforespørsel?',
      answer:
        'Gå til Bookinger-siden, finn forespørselen og klikk på den. I detaljvisningen kan du velge å godkjenne eller avslå forespørselen. Ved godkjenning sendes det automatisk en bekreftelse til brukeren.',
    },
    {
      question: 'Hva skjer når jeg avslår en booking?',
      answer:
        'Når du avslår en booking må du oppgi en begrunnelse. Brukeren får beskjed om avslaget med din begrunnelse, og tidspunktet blir frigjort for andre.',
    },
    {
      question: 'Kan jeg se bookinger for alle utleieobjekter?',
      answer:
        'Nei, du ser kun bookinger for utleieobjekter som er tildelt deg. Kontakt administrator hvis du trenger tilgang til flere objekter.',
    },
    {
      question: 'Hvordan endrer jeg en eksisterende booking?',
      answer:
        'Du kan endre tidspunkt for en booking ved å gå til bookingdetaljer og velge "Endre tidspunkt". Brukeren må bekrefte endringen.',
    },
    {
      question: 'Hvem kan se meldingene mine med brukere?',
      answer:
        'Meldinger er synlige for deg, brukeren, og administratorer. Alt logges for sporbarhet.',
    },
    {
      question: 'Hvordan eksporterer jeg en rapport?',
      answer:
        'Gå til Rapporter-siden (hvis tilgjengelig for deg), velg rapporttype og periode, og klikk på eksport-knappen for å laste ned som CSV eller PDF.',
    },
    {
      question: 'Jeg har glemt passordet mitt. Hva gjør jeg?',
      answer:
        'Bruk BankID for innlogging. Hvis du har problemer med BankID, kontakt din lokale administrator eller IT-support.',
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
          Vanlige spørsmål (FAQ)
        </Heading>
        <Paragraph data-size="md" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          Svar på ofte stilte spørsmål
        </Paragraph>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
        {faqItems.map((item, index) => (
          <details
            key={index}
            style={{
              borderRadius: 'var(--ds-border-radius-md)',
              border: '1px solid var(--ds-color-neutral-border-subtle)',
              overflow: 'hidden',
            }}
          >
            <summary
              style={{
                padding: 'var(--ds-spacing-4) var(--ds-spacing-5)',
                cursor: 'pointer',
                backgroundColor: 'var(--ds-color-neutral-surface-default)',
                fontWeight: 'var(--ds-font-weight-medium)',
                listStyle: 'none',
              }}
            >
              {item.question}
            </summary>
            <div
              style={{
                padding: 'var(--ds-spacing-4) var(--ds-spacing-5)',
                backgroundColor: 'var(--ds-color-neutral-surface-hover)',
                borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
              }}
            >
              <Paragraph data-size="sm">{item.answer}</Paragraph>
            </div>
          </details>
        ))}
      </div>

      <section
        style={{
          marginTop: 'var(--ds-spacing-10)',
          padding: 'var(--ds-spacing-6)',
          backgroundColor: 'var(--ds-color-accent-surface-default)',
          borderRadius: 'var(--ds-border-radius-lg)',
        }}
      >
        <Heading level={2} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
          Fant du ikke svar på spørsmålet ditt?
        </Heading>
        <Paragraph data-size="sm" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          Ta kontakt med support så hjelper vi deg.
        </Paragraph>
        <a
          href="mailto:support@digilist.no"
          style={{
            display: 'inline-block',
            padding: 'var(--ds-spacing-3) var(--ds-spacing-5)',
            backgroundColor: 'var(--ds-color-accent-base-default)',
            color: 'white',
            borderRadius: 'var(--ds-border-radius-md)',
            textDecoration: 'none',
            fontWeight: 'var(--ds-font-weight-medium)',
          }}
        >
          Kontakt support
        </a>
      </section>
    </div>
  );
}
