/**
 * Docs Article Page
 *
 * Full article page with content and right-side TOC.
 */

import { useParams, Navigate } from 'react-router-dom';
import { Heading, Paragraph, Breadcrumb } from '@xala/ds';
import { useT } from '@xala/i18n';
import { useFeatureFlags } from '@digilist/client-sdk';
import { isSectionEnabled, DOCS_FEATURE_FLAGS } from '../lib/feature-flags';
import { DocsRightTOC } from '../components/toc';
import type { TocItem } from '../types';
import styles from './DocsArticlePage.module.css';

// Mock article content for MVP
const MOCK_ARTICLE = {
  title: 'Opprett en booking',
  description: 'Steg-for-steg guide til opprettelse av booking',
  updatedAt: '2026-01-15',
  toc: [
    { id: 'introduksjon', text: 'Introduksjon', level: 2 as const },
    { id: 'trinn-1', text: 'Trinn 1: Velg lokale', level: 2 as const },
    { id: 'trinn-2', text: 'Trinn 2: Velg dato og tid', level: 2 as const },
    { id: 'ekstra-alternativer', text: 'Ekstra alternativer', level: 3 as const },
    { id: 'trinn-3', text: 'Trinn 3: Bekreft booking', level: 2 as const },
    { id: 'ofte-stilte-sporsmal', text: 'Ofte stilte spørsmål', level: 2 as const },
  ] as TocItem[],
};

export function DocsArticlePage() {
  const { section, articleSlug } = useParams<{ section: string; articleSlug: string }>();
  const t = useT();
  const flags = useFeatureFlags();
  const activeFlags = Object.keys(flags).length > 0 ? flags : { ...DOCS_FEATURE_FLAGS, 'docs.enabled': true };

  // Redirect if section is disabled
  if (section && !isSectionEnabled(section, activeFlags)) {
    return <Navigate to="/" replace />;
  }

  const sectionTitle = t(`docs.sections.${section}.title`) || section;

  const breadcrumbItems = [
    { label: t('docs.nav.home') || 'Dokumentasjon', href: '/' },
    { label: sectionTitle, href: `/${section}` },
    { label: MOCK_ARTICLE.title },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        {/* Main Content */}
        <article className={styles.article}>
          {/* Breadcrumb */}
          <Breadcrumb items={breadcrumbItems} />

          {/* Header */}
          <header className={styles.header}>
            <Heading level={1}>{MOCK_ARTICLE.title}</Heading>
            <Paragraph data-size="sm" className={styles.meta}>
              {t('docs.updatedAt') || 'Sist oppdatert'}: {MOCK_ARTICLE.updatedAt}
            </Paragraph>
          </header>

          {/* Article Content */}
          <div className={styles.content}>
            <section>
              <Heading level={2} id="introduksjon">Introduksjon</Heading>
              <Paragraph>
                Denne guiden viser deg hvordan du oppretter en booking i Digilist. 
                Prosessen er enkel og tar bare noen minutter.
              </Paragraph>
            </section>

            <section>
              <Heading level={2} id="trinn-1">Trinn 1: Velg lokale</Heading>
              <Paragraph>
                Start med å logge inn på plattformen og naviger til "Lokaler". 
                Her finner du en oversikt over alle tilgjengelige lokaler og fasiliteter.
              </Paragraph>
              
              {/* Placeholder for image */}
              <div className={styles.imagePlaceholder}>
                <Paragraph data-size="sm">📸 Skjermbilde: Lokaleoversikt</Paragraph>
              </div>
            </section>

            <section>
              <Heading level={2} id="trinn-2">Trinn 2: Velg dato og tid</Heading>
              <Paragraph>
                Når du har valgt et lokale, vil du se en kalender med tilgjengelige tider.
                Grønne felt indikerer ledige tider, mens røde felt er opptatt.
              </Paragraph>

              <Heading level={3} id="ekstra-alternativer">Ekstra alternativer</Heading>
              <Paragraph>
                Du kan også legge til tilleggstjenester som catering, AV-utstyr, 
                eller ekstra renholdskrav.
              </Paragraph>

              {/* Placeholder for video */}
              <div className={styles.videoPlaceholder}>
                <Paragraph data-size="sm">🎥 Video: Slik velger du dato og tid (2:30)</Paragraph>
              </div>
            </section>

            <section>
              <Heading level={2} id="trinn-3">Trinn 3: Bekreft booking</Heading>
              <Paragraph>
                Sjekk at alle detaljer er korrekte og klikk "Bekreft booking". 
                Du vil motta en bekreftelse på e-post.
              </Paragraph>
              
              {/* Callout */}
              <div className={styles.callout} data-type="tip">
                <strong>💡 Tips:</strong> Du kan alltid endre eller kansellere bookingen 
                fra "Mine bookinger" frem til 24 timer før starttidspunktet.
              </div>
            </section>

            <section>
              <Heading level={2} id="ofte-stilte-sporsmal">Ofte stilte spørsmål</Heading>
              <Paragraph>
                <strong>Kan jeg booke på vegne av andre?</strong><br />
                Ja, hvis du har organisasjonsadministrator-tilgang.
              </Paragraph>
              <Paragraph>
                <strong>Hva skjer hvis jeg trenger å kansellere?</strong><br />
                Du kan kansellere gratis opp til 24 timer før.
              </Paragraph>
            </section>
          </div>
        </article>

        {/* Right TOC */}
        <aside className={styles.tocSidebar}>
          <DocsRightTOC items={MOCK_ARTICLE.toc} />
        </aside>
      </div>
    </div>
  );
}

export default DocsArticlePage;
