/**
 * Docs Section Page
 *
 * Landing page for a documentation section showing articles list.
 */

import { useParams, Link, Navigate } from 'react-router-dom';
import { Heading, Paragraph, Breadcrumb, Card } from '@xala/ds';
import { useT } from '@xala/i18n';
import { useFeatureFlags } from '@digilist/client-sdk';
import { isSectionEnabled, DOCS_FEATURE_FLAGS } from '../lib/feature-flags';
import styles from './DocsSectionPage.module.css';

// Mock articles for MVP (would come from content loader)
const MOCK_ARTICLES: Record<string, { slug: string; title: string; description: string; updatedAt: string }[]> = {
  booking: [
    { slug: 'getting-started', title: 'Kom i gang', description: 'Lær hvordan du kommer i gang med booking', updatedAt: '2026-01-15' },
    { slug: 'create-booking', title: 'Opprett en booking', description: 'Steg-for-steg guide til opprettelse av booking', updatedAt: '2026-01-14' },
    { slug: 'manage-bookings', title: 'Administrer bookinger', description: 'Oversikt og håndtering av dine bookinger', updatedAt: '2026-01-12' },
  ],
  rbac: [
    { slug: 'overview', title: 'Rollebasert tilgang', description: 'Introduksjon til roller og tillatelser', updatedAt: '2026-01-10' },
    { slug: 'roles-explained', title: 'Forstå rollene', description: 'Detaljert beskrivelse av alle roller', updatedAt: '2026-01-09' },
  ],
  payments: [
    { slug: 'payment-methods', title: 'Betalingsmåter', description: 'Oversikt over tilgjengelige betalingsmåter', updatedAt: '2026-01-08' },
    { slug: 'invoicing', title: 'Fakturering', description: 'Guide til fakturering og betalingshistorikk', updatedAt: '2026-01-07' },
  ],
  admin: [
    { slug: 'settings-overview', title: 'Innstillinger', description: 'Oversikt over systeminnstillinger', updatedAt: '2026-01-06' },
  ],
  api: [
    { slug: 'authentication', title: 'Autentisering', description: 'Hvordan autentisere mot API-et', updatedAt: '2026-01-05' },
    { slug: 'endpoints', title: 'Endepunkter', description: 'Fullstendig API-referanse', updatedAt: '2026-01-04' },
  ],
  integrations: [
    { slug: 'overview', title: 'Integrasjonsoversikt', description: 'Tilgjengelige integrasjoner', updatedAt: '2026-01-03' },
  ],
  faq: [
    { slug: 'general', title: 'Generelle spørsmål', description: 'Vanlige spørsmål og svar', updatedAt: '2026-01-02' },
    { slug: 'troubleshooting', title: 'Feilsøking', description: 'Løsninger på vanlige problemer', updatedAt: '2026-01-01' },
  ],
};

export function DocsSectionPage() {
  const { section } = useParams<{ section: string }>();
  const t = useT();
  const flags = useFeatureFlags();
  const activeFlags = Object.keys(flags).length > 0 ? flags : { ...DOCS_FEATURE_FLAGS, 'docs.enabled': true };

  // Redirect if section is disabled
  if (section && !isSectionEnabled(section, activeFlags)) {
    return <Navigate to="/" replace />;
  }

  const articles = section ? MOCK_ARTICLES[section] || [] : [];
  const sectionTitle = t(`docs.sections.${section}.title`) || section || '';

  const breadcrumbItems = [
    { label: t('docs.nav.home') || 'Dokumentasjon', href: '/' },
    { label: sectionTitle },
  ];

  return (
    <div className={styles.container}>
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Header */}
      <header className={styles.header}>
        <Heading level={1}>{sectionTitle}</Heading>
        <Paragraph data-size="lg" className={styles.description}>
          {t(`docs.sections.${section}.description`) || `Dokumentasjon for ${section}`}
        </Paragraph>
      </header>

      {/* Articles List */}
      <section className={styles.articlesList}>
        {articles.length > 0 ? (
          articles.map((article) => (
            <Link
              key={article.slug}
              to={`/${section}/${article.slug}`}
              className={styles.articleLink}
            >
              <Card className={styles.articleCard} style={{ padding: 'var(--ds-spacing-4)' }}>
                <div className={styles.articleContent}>
                  <div>
                    <Heading level={3} className={styles.articleTitle}>
                      {article.title}
                    </Heading>
                    <Paragraph data-size="sm" className={styles.articleDescription}>
                      {article.description}
                    </Paragraph>
                  </div>
                  <Paragraph data-size="xs" className={styles.articleDate}>
                    {t('docs.updatedAt') || 'Oppdatert'}: {article.updatedAt}
                  </Paragraph>
                </div>
              </Card>
            </Link>
          ))
        ) : (
          <Paragraph>{t('docs.noArticles') || 'Ingen artikler funnet i denne seksjonen.'}</Paragraph>
        )}
      </section>
    </div>
  );
}

export default DocsSectionPage;
