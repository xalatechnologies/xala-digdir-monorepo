/**
 * Help Guides Page
 *
 * Step-by-step guides with role-aware content and right-side TOC.
 * Different roles see different guides based on their permissions.
 */
import * as React from 'react';
import { Card, Paragraph, Badge } from '@xala/ds';
import { useAuth } from '@xala/auth';
import { HelpLayout, HelpSection, HelpStepList, type TocItem } from './components';

// =============================================================================
// Guide Data
// =============================================================================

interface Guide {
  id: string;
  title: string;
  description: string;
  steps: string[];
  /** Roles that can see this guide. Empty = all roles */
  roles?: string[];
  /** Icon for the guide */
  icon?: string;
  /** Difficulty level */
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

const allGuides: Guide[] = [
  // === Guides for all users ===
  {
    id: 'booking-approval',
    title: 'Behandle bookingforespørsler',
    description: 'Lær hvordan du godkjenner eller avslår bookingforespørsler',
    icon: '✅',
    difficulty: 'beginner',
    steps: [
      'Gå til Bookinger-siden fra menyen',
      'Finn forespørselen du vil behandle i listen',
      'Klikk på forespørselen for å se detaljer',
      'Se gjennom informasjon om booker og tidspunkt',
      'Velg "Godkjenn" for å bekrefte bookingen',
      'Velg "Avslå" med begrunnelse for å avvise',
      'Brukeren får automatisk beskjed om resultatet',
    ],
  },
  {
    id: 'calendar-view',
    title: 'Bruke kalenderen',
    description: 'Oversikt over reservasjoner for dine tildelte objekter',
    icon: '📅',
    difficulty: 'beginner',
    steps: [
      'Gå til Kalender fra menyen',
      'Velg visningstype: dag, uke eller måned',
      'Se alle bookinger for dine tildelte objekter',
      'Klikk på en booking for å se detaljer',
      'Bruk filtre for å vise spesifikke objekter',
      'Dra og slipp for å endre tidspunkt (hvis tillatt)',
    ],
  },
  {
    id: 'messages',
    title: 'Svare på meldinger',
    description: 'Kommuniser med brukere om bookinger',
    icon: '💬',
    difficulty: 'beginner',
    steps: [
      'Gå til Meldinger fra menyen',
      'Åpne samtalen du vil svare på',
      'Les meldingshistorikken for kontekst',
      'Skriv svaret ditt i tekstfeltet',
      'Legg til vedlegg om nødvendig',
      'Klikk Send for å sende meldingen',
    ],
  },
  // === Guides for org_admin and above ===
  {
    id: 'user-management',
    title: 'Administrere brukere',
    description: 'Inviter og administrer brukere i din organisasjon',
    icon: '👥',
    difficulty: 'intermediate',
    roles: ['admin', 'tenant_admin', 'org_admin'],
    steps: [
      'Gå til Brukere-siden fra menyen',
      'Klikk "Inviter bruker" for å legge til ny bruker',
      'Fyll inn brukerens e-postadresse og navn',
      'Velg rolle og tilgangsnivå',
      'Tildel utleieobjekter brukeren skal ha tilgang til',
      'Send invitasjonen - brukeren får e-post',
      'Følg med på "Ventende" for ubehandlede invitasjoner',
    ],
  },
  {
    id: 'rental-object-create',
    title: 'Opprette utleieobjekt',
    description: 'Legg til et nytt utleieobjekt i systemet',
    icon: '🏢',
    difficulty: 'intermediate',
    roles: ['admin', 'tenant_admin', 'org_admin'],
    steps: [
      'Gå til Utleieobjekter fra menyen',
      'Klikk "Nytt utleieobjekt"',
      'Fyll ut grunnleggende informasjon (navn, beskrivelse, kategori)',
      'Last opp bilder av objektet',
      'Sett opp tilgjengelighet og åpningstider',
      'Konfigurer priser og betalingsalternativer',
      'Definer bookingsregler og begrensninger',
      'Forhåndsvis og publiser objektet',
    ],
  },
  {
    id: 'reports-export',
    title: 'Generere rapporter',
    description: 'Eksporter booking- og inntektsdata',
    icon: '📊',
    difficulty: 'intermediate',
    roles: ['admin', 'tenant_admin', 'org_admin'],
    steps: [
      'Gå til Rapporter fra menyen',
      'Velg rapporttype (bookinger, inntekter, bruk)',
      'Angi periode for rapporten',
      'Velg hvilke utleieobjekter som skal inkluderes',
      'Klikk "Generer rapport" for å se forhåndsvisning',
      'Eksporter til CSV eller PDF ved behov',
    ],
  },
  // === Guides for tenant_admin and above ===
  {
    id: 'org-settings',
    title: 'Organisasjonsinnstillinger',
    description: 'Konfigurer organisasjonsprofil og branding',
    icon: '⚙️',
    difficulty: 'advanced',
    roles: ['admin', 'tenant_admin'],
    steps: [
      'Gå til Innstillinger > Organisasjon',
      'Oppdater organisasjonslogo og navn',
      'Sett opp kontaktinformasjon',
      'Konfigurer standardinnstillinger for bookinger',
      'Sett opp e-postmaler for kommunikasjon',
      'Aktiver eller deaktiver funksjoner',
      'Lagre endringene',
    ],
  },
  {
    id: 'integrations',
    title: 'Sette opp integrasjoner',
    description: 'Koble til eksterne systemer',
    icon: '🔗',
    difficulty: 'advanced',
    roles: ['admin', 'tenant_admin'],
    steps: [
      'Gå til Innstillinger > Integrasjoner',
      'Velg integrasjonen du vil sette opp',
      'Følg stegene for å koble til tjenesten',
      'Test integrasjonen for å bekrefte at den fungerer',
      'Konfigurer synkroniseringsinnstillinger',
      'Aktiver integrasjonen',
    ],
  },
  // === Admin-only guides ===
  {
    id: 'feature-flags',
    title: 'Administrere funksjoner',
    description: 'Aktiver og deaktiver systemfunksjoner',
    icon: '🚩',
    difficulty: 'advanced',
    roles: ['admin', 'tenant_admin'],
    steps: [
      'Gå til Innstillinger > Funksjoner',
      'Se liste over tilgjengelige moduler',
      'Klikk på bryteren for å aktivere/deaktivere',
      'Se avhengigheter mellom moduler',
      'Husk at noen moduler krever at andre er aktivert',
      'Endringer trer i kraft umiddelbart',
    ],
  },
];

// =============================================================================
// Helpers
// =============================================================================

function getDifficultyBadge(difficulty: Guide['difficulty']): React.ReactElement | null {
  if (!difficulty) return null;

  const config = {
    beginner: { label: 'Nybegynner', color: 'success' as const },
    intermediate: { label: 'Middels', color: 'warning' as const },
    advanced: { label: 'Avansert', color: 'danger' as const },
  };

  const { label, color } = config[difficulty];

  return (
    <Badge data-color={color} data-size="sm">
      {label}
    </Badge>
  );
}

// =============================================================================
// Component
// =============================================================================

export default function GuidesPage(): React.ReactElement {
  const { data: session } = useAuth();
  const userRole = session?.user?.role ?? 'org_member';

  // Filter guides based on user role
  const visibleGuides = allGuides.filter((guide) => {
    if (!guide.roles || guide.roles.length === 0) return true;
    return guide.roles.includes(userRole);
  });

  // Create TOC items from visible guides
  const tocItems: TocItem[] = visibleGuides.map((guide) => ({
    id: guide.id,
    title: guide.title,
    roles: guide.roles,
  }));

  return (
    <HelpLayout
      title="Veiledninger"
      description="Steg-for-steg guider for vanlige oppgaver"
      tocItems={tocItems}
      showBackButton
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
        {visibleGuides.map((guide) => (
          <Card key={guide.id} style={{ padding: 'var(--ds-spacing-6)' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: 'var(--ds-spacing-4)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
                {guide.icon && (
                  <span style={{ fontSize: '1.5rem' }}>{guide.icon}</span>
                )}
                <div>
                  <h2
                    id={guide.id}
                    style={{
                      margin: 0,
                      fontSize: 'var(--ds-font-size-md)',
                      fontWeight: 'var(--ds-font-weight-medium)',
                      scrollMarginTop: 'var(--ds-spacing-6)',
                    }}
                  >
                    {guide.title}
                  </h2>
                  <Paragraph
                    data-size="sm"
                    style={{
                      margin: 0,
                      marginTop: 'var(--ds-spacing-1)',
                      color: 'var(--ds-color-neutral-text-subtle)',
                    }}
                  >
                    {guide.description}
                  </Paragraph>
                </div>
              </div>
              {getDifficultyBadge(guide.difficulty)}
            </div>

            <HelpStepList steps={guide.steps} />

            {guide.roles && guide.roles.length > 0 && (
              <Paragraph
                data-size="xs"
                style={{
                  margin: 0,
                  marginTop: 'var(--ds-spacing-4)',
                  color: 'var(--ds-color-neutral-text-subtle)',
                  fontStyle: 'italic',
                }}
              >
                Tilgjengelig for: {guide.roles.join(', ')}
              </Paragraph>
            )}
          </Card>
        ))}
      </div>

      {visibleGuides.length === 0 && (
        <Card style={{ padding: 'var(--ds-spacing-6)', textAlign: 'center' }}>
          <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
            Ingen veiledninger tilgjengelig for din rolle.
          </Paragraph>
        </Card>
      )}
    </HelpLayout>
  );
}
