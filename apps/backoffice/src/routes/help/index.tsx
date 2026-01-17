/**
 * Help & Support Page
 *
 * Main help hub with role-aware quick start guides and resource links.
 * Available to all org_member users (CAP_NAV_HELP capability).
 */
import * as React from 'react';
import { Heading, Paragraph, Card, Badge } from '@xala/ds';
import { Link } from 'react-router-dom';
import { useAuth } from '@xala/auth';

// =============================================================================
// Types
// =============================================================================

interface HelpSection {
  title: string;
  description: string;
  href: string;
  icon: string;
  external?: boolean;
}

interface QuickStartItem {
  title: string;
  description: string;
  roles?: string[];
}

// =============================================================================
// Data
// =============================================================================

const helpSections: HelpSection[] = [
  {
    title: 'Kom i gang',
    description: 'Steg-for-steg guider for vanlige oppgaver',
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

const quickStartByRole: Record<string, QuickStartItem[]> = {
  org_member: [
    { title: 'Se dine tildelte utleieobjekter', description: 'Gå til Dashboard for oversikt' },
    { title: 'Behandle bookinger', description: 'Bruk Bookinger-siden for å godkjenne eller avslå forespørsler' },
    { title: 'Se kalenderen', description: 'Kalender viser alle reservasjoner for dine objekter' },
    { title: 'Kommuniser med brukere', description: 'Bruk Meldinger for å svare på henvendelser' },
  ],
  org_admin: [
    { title: 'Administrer brukere', description: 'Gå til Brukere for å invitere og administrere medlemmer' },
    { title: 'Opprett utleieobjekter', description: 'Legg til nye lokaler og ressurser via Utleieobjekter' },
    { title: 'Behandle bookinger', description: 'Godkjenn forespørsler og håndter konflikter' },
    { title: 'Se rapporter', description: 'Analyser bruk og inntekter under Rapporter' },
    { title: 'Administrer meldinger', description: 'Kommuniser med brukere og se samtaleoversikt' },
  ],
  tenant_admin: [
    { title: 'Konfigurer organisasjonen', description: 'Sett opp logo, branding og kontaktinfo under Innstillinger' },
    { title: 'Aktiver funksjoner', description: 'Slå av/på moduler i Innstillinger > Funksjoner' },
    { title: 'Administrer brukere', description: 'Inviter og administrer alle brukere' },
    { title: 'Sett opp integrasjoner', description: 'Koble til betalingsløsninger og eksterne systemer' },
    { title: 'Eksporter rapporter', description: 'Generer og eksporter data for analyse' },
  ],
  admin: [
    { title: 'Systemadministrasjon', description: 'Full tilgang til alle funksjoner og innstillinger' },
    { title: 'Bruker- og tilgangsstyring', description: 'Administrer alle brukere på tvers av organisasjoner' },
    { title: 'Funksjoner og moduler', description: 'Kontroller hvilke funksjoner som er tilgjengelige' },
    { title: 'Revisjonslogg', description: 'Se alle handlinger utført i systemet' },
    { title: 'Integrasjoner', description: 'Konfigurer og overvåk systemintegrasjoner' },
  ],
};

const roleLabels: Record<string, string> = {
  org_member: 'Medlem',
  org_admin: 'Organisasjonsadministrator',
  tenant_admin: 'Leietakeradministrator',
  admin: 'Systemadministrator',
};

// =============================================================================
// Icons
// =============================================================================

function ChevronRightIcon(): React.ReactElement {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

// =============================================================================
// Component
// =============================================================================

export default function HelpPage(): React.ReactElement {
  const { data: session } = useAuth();
  const userRole = session?.user?.role ?? 'org_member';
  const quickStartItems = quickStartByRole[userRole] ?? quickStartByRole.org_member;
  const roleLabel = roleLabels[userRole] ?? userRole;

  return (
    <div style={{ padding: 'var(--ds-spacing-6)', maxWidth: '1200px' }}>
      {/* Header */}
      <header style={{ marginBottom: 'var(--ds-spacing-8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)', marginBottom: 'var(--ds-spacing-2)' }}>
          <Heading level={1} data-size="lg">
            Hjelp og støtte
          </Heading>
          <Badge data-color="info" data-size="sm">
            {roleLabel}
          </Badge>
        </div>
        <Paragraph data-size="md" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          Finn svar på spørsmål og lær hvordan du bruker systemet
        </Paragraph>
      </header>

      {/* Help Section Cards */}
      <section style={{ marginBottom: 'var(--ds-spacing-10)' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 'var(--ds-spacing-5)',
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
                  padding: 'var(--ds-spacing-5)',
                  height: '100%',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
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
                <div style={{ fontSize: '2rem', marginBottom: 'var(--ds-spacing-3)' }}>
                  {section.icon}
                </div>
                <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
                  {section.title}
                </Heading>
                <Paragraph
                  data-size="sm"
                  style={{ color: 'var(--ds-color-neutral-text-subtle)', flex: 1 }}
                >
                  {section.description}
                </Paragraph>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--ds-spacing-1)',
                    marginTop: 'var(--ds-spacing-3)',
                    color: 'var(--ds-color-accent-text-default)',
                    fontSize: 'var(--ds-font-size-sm)',
                    fontWeight: 'var(--ds-font-weight-medium)',
                  }}
                >
                  {section.external ? 'Åpne' : 'Les mer'}
                  <ChevronRightIcon />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick Start Guide - Role Aware */}
      <section>
        <Heading level={2} data-size="md" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          Hurtigstartsguide
        </Heading>
        <Paragraph
          data-size="sm"
          style={{
            color: 'var(--ds-color-neutral-text-subtle)',
            marginBottom: 'var(--ds-spacing-4)',
          }}
        >
          Tilpasset for din rolle som {roleLabel.toLowerCase()}
        </Paragraph>
        <div
          style={{
            backgroundColor: 'var(--ds-color-neutral-surface-hover)',
            borderRadius: 'var(--ds-border-radius-lg)',
            padding: 'var(--ds-spacing-6)',
          }}
        >
          <ol
            style={{
              paddingLeft: 'var(--ds-spacing-6)',
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--ds-spacing-4)',
            }}
          >
            {quickStartItems.map((item, index) => (
              <li key={index}>
                <strong style={{ display: 'block', marginBottom: 'var(--ds-spacing-1)' }}>
                  {item.title}
                </strong>
                <span style={{ color: 'var(--ds-color-neutral-text-subtle)', fontSize: 'var(--ds-font-size-sm)' }}>
                  {item.description}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Keyboard Shortcuts */}
      <section style={{ marginTop: 'var(--ds-spacing-10)' }}>
        <Heading level={2} data-size="md" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          Tastatursnarveier
        </Heading>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 'var(--ds-spacing-3)',
          }}
        >
          {[
            { key: '?', description: 'Vis hurtigtaster' },
            { key: 'g d', description: 'Gå til Dashboard' },
            { key: 'g b', description: 'Gå til Bookinger' },
            { key: 'g c', description: 'Gå til Kalender' },
            { key: 'g m', description: 'Gå til Meldinger' },
            { key: 'g h', description: 'Gå til Hjelp' },
          ].map((shortcut) => (
            <div
              key={shortcut.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--ds-spacing-3)',
                padding: 'var(--ds-spacing-3)',
                backgroundColor: 'var(--ds-color-neutral-surface-default)',
                borderRadius: 'var(--ds-border-radius-md)',
                border: '1px solid var(--ds-color-neutral-border-subtle)',
              }}
            >
              <kbd
                style={{
                  padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
                  backgroundColor: 'var(--ds-color-neutral-surface-hover)',
                  borderRadius: 'var(--ds-border-radius-sm)',
                  fontFamily: 'monospace',
                  fontSize: 'var(--ds-font-size-sm)',
                  border: '1px solid var(--ds-color-neutral-border-subtle)',
                  minWidth: '40px',
                  textAlign: 'center',
                }}
              >
                {shortcut.key}
              </kbd>
              <span style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                {shortcut.description}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
