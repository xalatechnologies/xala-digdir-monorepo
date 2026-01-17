/**
 * Help FAQ Page
 *
 * Frequently asked questions with role-aware content and right-side TOC.
 * Different roles see different FAQs based on their permissions.
 */
import * as React from 'react';
import { Paragraph, Button } from '@xala/ds';
import { useAuth } from '@xala/auth';
import { HelpLayout, HelpFAQItem, type TocItem } from './components';

// =============================================================================
// FAQ Data
// =============================================================================

interface FAQCategory {
  id: string;
  title: string;
  /** Roles that can see this category. Empty = all roles */
  roles?: string[];
  faqs: Array<{
    question: string;
    answer: string;
    /** Roles that can see this FAQ. Empty = all roles */
    roles?: string[];
  }>;
}

const allFAQCategories: FAQCategory[] = [
  // === General FAQs (all users) ===
  {
    id: 'bookings',
    title: 'Bookinger',
    faqs: [
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
        question: 'Hvordan endrer jeg en eksisterende booking?',
        answer:
          'Du kan endre tidspunkt for en booking ved å gå til bookingdetaljer og velge "Endre tidspunkt". Brukeren må bekrefte endringen.',
      },
      {
        question: 'Kan jeg se bookinger for alle utleieobjekter?',
        answer:
          'Nei, du ser kun bookinger for utleieobjekter som er tildelt deg. Kontakt administrator hvis du trenger tilgang til flere objekter.',
      },
    ],
  },
  {
    id: 'calendar',
    title: 'Kalender',
    faqs: [
      {
        question: 'Hvorfor ser jeg ikke alle bookinger i kalenderen?',
        answer:
          'Kalenderen viser kun bookinger for utleieobjekter du har tilgang til. Bruk filtrene for å justere visningen.',
      },
      {
        question: 'Kan jeg blokkere tidspunkter i kalenderen?',
        answer:
          'Ja, du kan opprette blokkering ved å klikke på tidspunktet i kalenderen og velge "Blokkér tid". Dette hindrer nye bookinger på dette tidspunktet.',
        roles: ['admin', 'tenant_admin', 'org_admin'],
      },
    ],
  },
  {
    id: 'messages',
    title: 'Meldinger',
    faqs: [
      {
        question: 'Hvem kan se meldingene mine med brukere?',
        answer:
          'Meldinger er synlige for deg, brukeren, og administratorer. Alt logges for sporbarhet.',
      },
      {
        question: 'Kan jeg sende vedlegg i meldinger?',
        answer:
          'Ja, du kan legge til vedlegg ved å klikke på binders-ikonet i meldingsfeltet. Tillatte formater er PDF, bilder og Office-dokumenter.',
      },
    ],
  },
  // === Admin FAQs ===
  {
    id: 'users',
    title: 'Brukere og tilgang',
    roles: ['admin', 'tenant_admin', 'org_admin'],
    faqs: [
      {
        question: 'Hvordan inviterer jeg en ny bruker?',
        answer:
          'Gå til Brukere-siden og klikk "Inviter bruker". Fyll inn e-postadresse, velg rolle og tildel utleieobjekter. Brukeren får en invitasjons-e-post.',
      },
      {
        question: 'Kan jeg endre en brukers rolle?',
        answer:
          'Ja, gå til brukerens profil og klikk "Rediger". Du kan endre rollen og tilgangsnivået. Endringene trer i kraft umiddelbart.',
      },
      {
        question: 'Hvordan deaktiverer jeg en bruker?',
        answer:
          'Gå til brukerens profil og velg "Deaktiver konto". Brukeren mister tilgang umiddelbart, men data beholdes for historikk.',
      },
    ],
  },
  {
    id: 'rental-objects',
    title: 'Utleieobjekter',
    roles: ['admin', 'tenant_admin', 'org_admin'],
    faqs: [
      {
        question: 'Hvordan oppretter jeg et nytt utleieobjekt?',
        answer:
          'Gå til Utleieobjekter og klikk "Nytt utleieobjekt". Følg veiviseren for å fylle ut informasjon, laste opp bilder og sette opp tilgjengelighet.',
      },
      {
        question: 'Kan jeg kopiere et eksisterende utleieobjekt?',
        answer:
          'Ja, åpne objektet og velg "Dupliser" fra menyen. Du får en kopi som du kan redigere uten å påvirke originalen.',
      },
      {
        question: 'Hvordan arkiverer jeg et utleieobjekt?',
        answer:
          'Åpne objektet og velg "Arkiver". Objektet blir utilgjengelig for booking, men historikken beholdes. Du kan gjenopprette det senere.',
      },
    ],
  },
  {
    id: 'reports',
    title: 'Rapporter',
    roles: ['admin', 'tenant_admin', 'org_admin'],
    faqs: [
      {
        question: 'Hvordan eksporterer jeg en rapport?',
        answer:
          'Gå til Rapporter-siden, velg rapporttype og periode, og klikk på eksport-knappen for å laste ned som CSV eller PDF.',
      },
      {
        question: 'Kan jeg planlegge automatiske rapporter?',
        answer:
          'Ja, du kan sette opp planlagte rapporter under Innstillinger > Rapporter. Velg frekvens og mottakere for automatisk utsending.',
        roles: ['admin', 'tenant_admin'],
      },
    ],
  },
  // === System FAQs (tenant_admin and above) ===
  {
    id: 'settings',
    title: 'Innstillinger og system',
    roles: ['admin', 'tenant_admin'],
    faqs: [
      {
        question: 'Hvordan endrer jeg organisasjonens logo?',
        answer:
          'Gå til Innstillinger > Organisasjon og klikk på logo-området. Last opp et nytt bilde (anbefalt størrelse: 200x200px, PNG eller SVG).',
      },
      {
        question: 'Hvordan aktiverer jeg en ny funksjon?',
        answer:
          'Gå til Innstillinger > Funksjoner. Her kan du aktivere eller deaktivere moduler. Noen moduler har avhengigheter til andre.',
      },
      {
        question: 'Hvordan kobler jeg til en integrasjon?',
        answer:
          'Gå til Innstillinger > Integrasjoner. Velg integrasjonen og følg oppsettsguiden. De fleste integrasjoner krever API-nøkler eller OAuth-autorisering.',
      },
    ],
  },
  // === Security FAQs ===
  {
    id: 'security',
    title: 'Sikkerhet og innlogging',
    faqs: [
      {
        question: 'Jeg har glemt passordet mitt. Hva gjør jeg?',
        answer:
          'Bruk BankID for innlogging. Hvis du har problemer med BankID, kontakt din lokale administrator eller IT-support.',
      },
      {
        question: 'Hvor lenge holder sesjonen min?',
        answer:
          'Sesjoner varer i 24 timer. Ved inaktivitet i mer enn 30 minutter må du logge inn på nytt for sikkerhetens skyld.',
      },
      {
        question: 'Hvem kan se hva jeg gjør i systemet?',
        answer:
          'Alle handlinger logges i revisjonssporet. Administratorer kan se loggene for sporbarhet og sikkerhet.',
      },
    ],
  },
];

// =============================================================================
// Component
// =============================================================================

export default function FAQPage(): React.ReactElement {
  const { data: session } = useAuth();
  const userRole = session?.user?.role ?? 'org_member';

  // Filter categories based on user role
  const visibleCategories = allFAQCategories
    .map((category) => {
      // Filter the category itself
      if (category.roles && category.roles.length > 0 && !category.roles.includes(userRole)) {
        return null;
      }

      // Filter FAQs within the category
      const visibleFaqs = category.faqs.filter((faq) => {
        if (!faq.roles || faq.roles.length === 0) return true;
        return faq.roles.includes(userRole);
      });

      if (visibleFaqs.length === 0) return null;

      return { ...category, faqs: visibleFaqs };
    })
    .filter(Boolean) as FAQCategory[];

  // Create TOC items from visible categories
  const tocItems: TocItem[] = visibleCategories.map((category) => ({
    id: category.id,
    title: category.title,
    roles: category.roles,
  }));

  return (
    <HelpLayout
      title="Vanlige spørsmål (FAQ)"
      description="Svar på ofte stilte spørsmål"
      tocItems={tocItems}
      showBackButton
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-8)' }}>
        {visibleCategories.map((category) => (
          <section key={category.id}>
            <h2
              id={category.id}
              style={{
                margin: 0,
                marginBottom: 'var(--ds-spacing-4)',
                fontSize: 'var(--ds-font-size-md)',
                fontWeight: 'var(--ds-font-weight-medium)',
                color: 'var(--ds-color-neutral-text-default)',
                scrollMarginTop: 'var(--ds-spacing-6)',
              }}
            >
              {category.title}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
              {category.faqs.map((faq, index) => (
                <HelpFAQItem
                  key={index}
                  question={faq.question}
                  answer={faq.answer}
                  roles={faq.roles}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Contact Support Section */}
      <section
        style={{
          marginTop: 'var(--ds-spacing-10)',
          padding: 'var(--ds-spacing-6)',
          backgroundColor: 'var(--ds-color-accent-surface-default)',
          borderRadius: 'var(--ds-border-radius-lg)',
        }}
      >
        <h2
          style={{
            margin: 0,
            marginBottom: 'var(--ds-spacing-2)',
            fontSize: 'var(--ds-font-size-md)',
            fontWeight: 'var(--ds-font-weight-medium)',
          }}
        >
          Fant du ikke svar på spørsmålet ditt?
        </h2>
        <Paragraph data-size="sm" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          Ta kontakt med support så hjelper vi deg.
        </Paragraph>
        <Button
          asChild
          data-color="accent" type="button"
        >
          <a href="mailto:support@digilist.no">
            Kontakt support
          </a>
        </Button>
      </section>
    </HelpLayout>
  );
}
