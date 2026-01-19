/**
 * AccessibilityStatement Component
 *
 * Required accessibility statement page for Norwegian universal design compliance.
 * Displays conformance status, known issues, and contact information.
 *
 * @module @xala/ds/composed/AccessibilityStatement
 * @see https://www.digdir.no/digitalisering-og-samordning/universell-utforming/1652
 */

import React from 'react';

// =============================================================================
// Types
// =============================================================================

export type ConformanceLevel = 'full' | 'partial' | 'non-conformant';
export type WCAGLevel = 'A' | 'AA' | 'AAA';

export interface KnownIssue {
  description: string;
  wcagCriterion?: string;
  workaround?: string;
  expectedFix?: string;
}

export interface AccessibilityContact {
  email: string;
  phone?: string;
  address?: string;
}

export interface AccessibilityStatementProps {
  organizationName: string;
  websiteName: string;
  websiteUrl: string;
  conformanceLevel: ConformanceLevel;
  wcagLevel: WCAGLevel;
  lastUpdated: string;
  lastTested?: string;
  testingMethod?: string;
  knownIssues?: KnownIssue[];
  contact: AccessibilityContact;
  additionalInfo?: string;
  className?: string;
  style?: React.CSSProperties;
}

// =============================================================================
// Helper Components
// =============================================================================

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontSize: 'var(--ds-font-size-lg)',
        fontWeight: 'var(--ds-font-weight-semibold)',
        color: 'var(--ds-color-neutral-text-default)',
        margin: '0 0 var(--ds-spacing-3) 0',
        paddingTop: 'var(--ds-spacing-6)',
      }}
    >
      {children}
    </h2>
  );
}

function ConformanceBadge({ level }: { level: ConformanceLevel }) {
  const config = {
    full: {
      label: 'Fullstendig samsvar',
      color: 'var(--ds-color-success-text-default)',
      bg: 'var(--ds-color-success-surface-default)',
    },
    partial: {
      label: 'Delvis samsvar',
      color: 'var(--ds-color-warning-text-default)',
      bg: 'var(--ds-color-warning-surface-default)',
    },
    'non-conformant': {
      label: 'Ikke i samsvar',
      color: 'var(--ds-color-danger-text-default)',
      bg: 'var(--ds-color-danger-surface-default)',
    },
  }[level];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
        backgroundColor: config.bg,
        color: config.color,
        borderRadius: 'var(--ds-border-radius-md)',
        fontWeight: 'var(--ds-font-weight-medium)',
        fontSize: 'var(--ds-font-size-sm)',
      }}
    >
      {config.label}
    </span>
  );
}

// =============================================================================
// AccessibilityStatement Component
// =============================================================================

export function AccessibilityStatement({
  organizationName,
  websiteName,
  websiteUrl,
  conformanceLevel,
  wcagLevel,
  lastUpdated,
  lastTested,
  testingMethod,
  knownIssues = [],
  contact,
  additionalInfo,
  className,
  style,
}: AccessibilityStatementProps): React.ReactElement {
  return (
    <article
      className={className}
      style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: 'var(--ds-spacing-6)',
        ...style,
      }}
      aria-labelledby="accessibility-statement-title"
    >
      <h1
        id="accessibility-statement-title"
        style={{
          fontSize: 'var(--ds-font-size-2xl)',
          fontWeight: 'var(--ds-font-weight-bold)',
          color: 'var(--ds-color-neutral-text-default)',
          margin: '0 0 var(--ds-spacing-4) 0',
        }}
      >
        Tilgjengelighetserklæring
      </h1>

      <p
        style={{
          fontSize: 'var(--ds-font-size-md)',
          color: 'var(--ds-color-neutral-text-subtle)',
          margin: '0 0 var(--ds-spacing-6) 0',
        }}
      >
        Sist oppdatert: {lastUpdated}
      </p>

      {/* Introduction */}
      <section>
        <p style={{ margin: '0 0 var(--ds-spacing-4) 0', lineHeight: 1.6 }}>
          {organizationName} er forpliktet til å gjøre {websiteName} tilgjengelig for alle brukere,
          inkludert personer med nedsatt funksjonsevne. Vi jobber kontinuerlig med å forbedre
          brukeropplevelsen og sikre at nettstedet følger gjeldende tilgjengelighetskrav.
        </p>
      </section>

      {/* Conformance Status */}
      <SectionHeading>Samsvarsstatus</SectionHeading>
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)', marginBottom: 'var(--ds-spacing-4)' }}>
          <ConformanceBadge level={conformanceLevel} />
          <span style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
            WCAG 2.1 Nivå {wcagLevel}
          </span>
        </div>
        <p style={{ margin: 0, lineHeight: 1.6 }}>
          {conformanceLevel === 'full' && (
            <>
              Dette nettstedet er i fullstendig samsvar med Web Content Accessibility Guidelines (WCAG) 2.1,
              nivå {wcagLevel}. Det finnes ingen kjente tilgjengelighetsproblemer.
            </>
          )}
          {conformanceLevel === 'partial' && (
            <>
              Dette nettstedet er i delvis samsvar med Web Content Accessibility Guidelines (WCAG) 2.1,
              nivå {wcagLevel}. Noen innhold eller funksjonalitet er ikke fullt tilgjengelig.
              Se listen over kjente problemer nedenfor.
            </>
          )}
          {conformanceLevel === 'non-conformant' && (
            <>
              Dette nettstedet er for øyeblikket ikke i samsvar med Web Content Accessibility Guidelines (WCAG) 2.1.
              Vi arbeider aktivt med å løse tilgjengelighetsproblemene.
            </>
          )}
        </p>
      </section>

      {/* Known Issues */}
      {knownIssues.length > 0 && (
        <>
          <SectionHeading>Kjente tilgjengelighetsproblemer</SectionHeading>
          <section>
            <p style={{ margin: '0 0 var(--ds-spacing-4) 0', lineHeight: 1.6 }}>
              Følgende tilgjengelighetsproblemer er identifisert:
            </p>
            <ul
              style={{
                margin: 0,
                padding: '0 0 0 var(--ds-spacing-5)',
                listStyleType: 'disc',
              }}
            >
              {knownIssues.map((issue, index) => (
                <li
                  key={index}
                  style={{
                    marginBottom: 'var(--ds-spacing-4)',
                    lineHeight: 1.6,
                  }}
                >
                  <strong>{issue.description}</strong>
                  {issue.wcagCriterion && (
                    <span style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                      {' '}(WCAG {issue.wcagCriterion})
                    </span>
                  )}
                  {issue.workaround && (
                    <p style={{ margin: 'var(--ds-spacing-2) 0 0 0', fontSize: 'var(--ds-font-size-sm)' }}>
                      <strong>Alternativ løsning:</strong> {issue.workaround}
                    </p>
                  )}
                  {issue.expectedFix && (
                    <p style={{ margin: 'var(--ds-spacing-1) 0 0 0', fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                      Forventet utbedring: {issue.expectedFix}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      {/* Testing Information */}
      {(lastTested || testingMethod) && (
        <>
          <SectionHeading>Testing</SectionHeading>
          <section>
            {lastTested && (
              <p style={{ margin: '0 0 var(--ds-spacing-2) 0', lineHeight: 1.6 }}>
                <strong>Sist testet:</strong> {lastTested}
              </p>
            )}
            {testingMethod && (
              <p style={{ margin: '0', lineHeight: 1.6 }}>
                <strong>Testmetode:</strong> {testingMethod}
              </p>
            )}
          </section>
        </>
      )}

      {/* Technical Standards */}
      <SectionHeading>Tekniske standarder</SectionHeading>
      <section>
        <p style={{ margin: '0 0 var(--ds-spacing-3) 0', lineHeight: 1.6 }}>
          Tilgjengeligheten på {websiteName} er basert på følgende standarder:
        </p>
        <ul style={{ margin: 0, padding: '0 0 0 var(--ds-spacing-5)', listStyleType: 'disc' }}>
          <li style={{ marginBottom: 'var(--ds-spacing-2)' }}>
            <a
              href="https://www.w3.org/TR/WCAG21/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--ds-color-accent-text-default)' }}
            >
              Web Content Accessibility Guidelines (WCAG) 2.1
            </a>
          </li>
          <li style={{ marginBottom: 'var(--ds-spacing-2)' }}>
            <a
              href="https://designsystemet.no/en/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--ds-color-accent-text-default)' }}
            >
              Designsystemet (Digdir)
            </a>
          </li>
          <li style={{ marginBottom: 'var(--ds-spacing-2)' }}>
            <a
              href="https://lovdata.no/dokument/SF/forskrift/2013-06-21-732"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--ds-color-accent-text-default)' }}
            >
              Forskrift om universell utforming av IKT-løsninger
            </a>
          </li>
        </ul>
      </section>

      {/* Contact Information */}
      <SectionHeading>Kontakt oss</SectionHeading>
      <section>
        <p style={{ margin: '0 0 var(--ds-spacing-4) 0', lineHeight: 1.6 }}>
          Hvis du opplever tilgjengelighetsproblemer på dette nettstedet, eller har forslag til forbedringer,
          vennligst kontakt oss:
        </p>
        <address
          style={{
            fontStyle: 'normal',
            padding: 'var(--ds-spacing-4)',
            backgroundColor: 'var(--ds-color-neutral-surface-default)',
            borderRadius: 'var(--ds-border-radius-md)',
            border: '1px solid var(--ds-color-neutral-border-subtle)',
          }}
        >
          <p style={{ margin: '0 0 var(--ds-spacing-2) 0' }}>
            <strong>E-post:</strong>{' '}
            <a href={`mailto:${contact.email}`} style={{ color: 'var(--ds-color-accent-text-default)' }}>
              {contact.email}
            </a>
          </p>
          {contact.phone && (
            <p style={{ margin: '0 0 var(--ds-spacing-2) 0' }}>
              <strong>Telefon:</strong>{' '}
              <a href={`tel:${contact.phone.replace(/\s/g, '')}`} style={{ color: 'var(--ds-color-accent-text-default)' }}>
                {contact.phone}
              </a>
            </p>
          )}
          {contact.address && (
            <p style={{ margin: 0 }}>
              <strong>Adresse:</strong> {contact.address}
            </p>
          )}
        </address>
      </section>

      {/* Enforcement */}
      <SectionHeading>Tilsyn og klage</SectionHeading>
      <section>
        <p style={{ margin: '0 0 var(--ds-spacing-3) 0', lineHeight: 1.6 }}>
          Digitaliseringsdirektoratet (Digdir) har ansvaret for tilsyn med universell utforming av IKT i Norge.
          Hvis du mener at nettstedet ikke oppfyller kravene til universell utforming, og vi ikke har løst
          problemet etter at du har kontaktet oss, kan du sende en klage til:
        </p>
        <address
          style={{
            fontStyle: 'normal',
            padding: 'var(--ds-spacing-4)',
            backgroundColor: 'var(--ds-color-neutral-surface-default)',
            borderRadius: 'var(--ds-border-radius-md)',
            border: '1px solid var(--ds-color-neutral-border-subtle)',
          }}
        >
          <p style={{ margin: '0 0 var(--ds-spacing-2) 0', fontWeight: 'var(--ds-font-weight-semibold)' }}>
            Digitaliseringsdirektoratet
          </p>
          <p style={{ margin: '0 0 var(--ds-spacing-2) 0' }}>
            <a
              href="https://www.digdir.no/digitalisering-og-samordning/universell-utforming/1652"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--ds-color-accent-text-default)' }}
            >
              digdir.no/universell-utforming
            </a>
          </p>
          <p style={{ margin: 0 }}>
            E-post:{' '}
            <a href="mailto:postmottak@digdir.no" style={{ color: 'var(--ds-color-accent-text-default)' }}>
              postmottak@digdir.no
            </a>
          </p>
        </address>
      </section>

      {/* Additional Information */}
      {additionalInfo && (
        <>
          <SectionHeading>Tilleggsinformasjon</SectionHeading>
          <section>
            <p style={{ margin: 0, lineHeight: 1.6 }}>{additionalInfo}</p>
          </section>
        </>
      )}
    </article>
  );
}

export default AccessibilityStatement;
