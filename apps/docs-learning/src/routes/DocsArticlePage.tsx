/**
 * Docs Article Page
 *
 * Full article page with content and right-side TOC.
 */

import { useParams, Navigate } from 'react-router-dom';
import { Heading, Paragraph, Breadcrumb } from '@xalatechnologies/platform/ui';
import { useT } from '@xalatechnologies/platform/i18n';
import { useFeatureFlags } from '@digilist/client-sdk';
import { isSectionEnabled, DOCS_FEATURE_FLAGS } from '../lib/feature-flags';
import { DocsRightTOC } from '../components/toc';
import type { TocItem } from '../types';

export function DocsArticlePage() {
  const { section } = useParams<{ section: string; articleSlug: string }>();
  const t = useT();
  const flags = useFeatureFlags();
  const activeFlags = Object.keys(flags).length > 0 ? flags : { ...DOCS_FEATURE_FLAGS, 'docs.enabled': true };

  // Mock article content for MVP (using t() inside component)
  const MOCK_ARTICLE = {
    title: t('common.opprett_en_booking'),
    description: t('common.stegforsteg_guide_til_opprettelse'),
    updatedAt: '2026-01-15',
    toc: [
      { id: 'introduksjon', text: 'Introduksjon', level: 2 as const },
      { id: 'trinn-1', text: t('common.trinn_1_velg_lokale'), level: 2 as const },
      { id: 'trinn-2', text: t('common.trinn_2_velg_dato'), level: 2 as const },
      { id: 'ekstra-alternativer', text: t('common.ekstra_alternativer'), level: 3 as const },
      { id: 'trinn-3', text: t('common.trinn_3_bekreft_booking'), level: 2 as const },
      { id: 'ofte-stilte-sporsmal', text: t('common.ofte_stilte_sporsmaal'), level: 2 as const },
    ] as TocItem[],
  };

  // Redirect if section is disabled
  if (section && !isSectionEnabled(section, activeFlags)) {
    return <Navigate to="/" replace />;
  }

  const sectionTitle = t(`docs.sections.${section}.title`) || section || '';

  const breadcrumbItems = [
    { label: t('docs.nav.home') || 'Dokumentasjon', href: '/' },
    { label: sectionTitle, href: `/${section}` },
    { label: MOCK_ARTICLE.title },
  ];

  return (
    <div style={{ /* container - converted from CSS module */ }}>
      <div style={{ /* contentWrapper - converted from CSS module */ }}>
        {/* Main Content */}
        <article style={{ /* article - converted from CSS module */ }}>
          {/* Breadcrumb */}
          <Breadcrumb items={breadcrumbItems} />

          {/* Header */}
          <header style={{ /* header - converted from CSS module */ }}>
            <Heading level={1}>{MOCK_ARTICLE.title}</Heading>
            <Paragraph data-size="sm" style={{ /* meta - converted from CSS module */ }}>
              {t('docs.updatedAt') || 'Sist oppdatert'}: {MOCK_ARTICLE.updatedAt}
            </Paragraph>
          </header>

          {/* Article Content */}
          <div style={{ /* content - converted from CSS module */ }}>
            <section>
              <Heading level={2} id="introduksjon">{t('common.text.introduksjon')}</Heading>
              <Paragraph>
                {t('common.denne_guiden_viser_deg')}
              </Paragraph>
            </section>

            <section>
              <Heading level={2} id="trinn-1">Trinn 1: Velg lokale</Heading>
              <Paragraph>
                {t('common.start_med_aa_logge')}
              </Paragraph>
              
              {/* Placeholder for image */}
              <div style={{ /* imagePlaceholder - converted from CSS module */ }}>
                <Paragraph data-size="sm">📸 Skjermbilde: Lokaleoversikt</Paragraph>
              </div>
            </section>

            <section>
              <Heading level={2} id="trinn-2">Trinn 2: Velg dato og tid</Heading>
              <Paragraph>
                {t('common.naar_du_har_valgt')}
              </Paragraph>

              <Heading level={3} id="ekstra-alternativer">{t('common.text.ekstraAlternativer')}</Heading>
              <Paragraph>
                {t('common.du_kan_ogsaa_legge')}
              </Paragraph>

              {/* Placeholder for video */}
              <div style={{ /* videoPlaceholder - converted from CSS module */ }}>
                <Paragraph data-size="sm">🎥 Video: Slik velger du dato og tid (2:30)</Paragraph>
              </div>
            </section>

            <section>
              <Heading level={2} id="trinn-3">Trinn 3: Bekreft booking</Heading>
              <Paragraph>
                {t('common.sjekk_at_alle_detaljer')}
              </Paragraph>
              
              {/* Callout */}
              <div style={{ /* callout - converted from CSS module */ }} data-type="tip">
                <strong>💡 Tips:</strong> Du kan alltid endre eller kansellere bookingen 
                fra "Mine bookinger" frem til 24 timer før starttidspunktet.
              </div>
            </section>

            <section>
              <Heading level={2} id="ofte-stilte-sporsmal">{t('common.text.ofteStilteSporsmal')}</Heading>
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
        <aside style={{ /* tocSidebar - converted from CSS module */ }}>
          <DocsRightTOC items={MOCK_ARTICLE.toc} />
        </aside>
      </div>
    </div>
  );
}

export default DocsArticlePage;
