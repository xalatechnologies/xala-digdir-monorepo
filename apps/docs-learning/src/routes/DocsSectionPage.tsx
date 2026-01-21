/**
 * Docs Section Page
 *
 * Landing page for a documentation section showing articles list.
 */

import { useParams, Link, Navigate } from 'react-router-dom';
import { Heading, Paragraph, Breadcrumb, Card } from '@xalatechnologies/platform/ui';
import { useT } from '@xalatechnologies/platform/i18n';
import { useFeatureFlags } from '@digilist/client-sdk';
import { isSectionEnabled, DOCS_FEATURE_FLAGS } from '../lib/feature-flags';

// Mock articles for MVP using i18n keys (would come from content loader)
const MOCK_ARTICLES: Record<string, { slug: string; titleKey: string; descKey: string; updatedAt: string }[]> = {
  booking: [
    { slug: 'getting-started', titleKey: 'docs.article.gettingStartedBooking', descKey: 'docs.article.gettingStartedBookingDesc', updatedAt: '2026-01-15' },
    { slug: 'create-booking', titleKey: 'docs.article.createBooking', descKey: 'docs.article.createBookingDesc', updatedAt: '2026-01-14' },
    { slug: 'manage-bookings', titleKey: 'docs.article.manageBookings', descKey: 'docs.article.manageBookingsDesc', updatedAt: '2026-01-12' },
  ],
  rbac: [
    { slug: 'overview', titleKey: 'docs.article.rbacOverview', descKey: 'docs.article.rbacOverviewDesc', updatedAt: '2026-01-10' },
    { slug: 'roles-explained', titleKey: 'docs.article.rolesExplained', descKey: 'docs.article.rolesExplainedDesc', updatedAt: '2026-01-09' },
  ],
  payments: [
    { slug: 'payment-methods', titleKey: 'docs.article.paymentMethods', descKey: 'docs.article.paymentMethodsDesc', updatedAt: '2026-01-08' },
    { slug: 'invoicing', titleKey: 'docs.article.invoicing', descKey: 'docs.article.invoicingDesc', updatedAt: '2026-01-07' },
  ],
  admin: [
    { slug: 'settings-overview', titleKey: 'docs.article.settingsOverview', descKey: 'docs.article.settingsOverviewDesc', updatedAt: '2026-01-06' },
  ],
  api: [
    { slug: 'authentication', titleKey: 'docs.article.apiAuth', descKey: 'docs.article.apiAuthDesc', updatedAt: '2026-01-05' },
    { slug: 'endpoints', titleKey: 'docs.article.apiEndpoints', descKey: 'docs.article.apiEndpointsDesc', updatedAt: '2026-01-04' },
  ],
  integrations: [
    { slug: 'overview', titleKey: 'docs.article.integrationsOverview', descKey: 'docs.article.integrationsOverviewDesc', updatedAt: '2026-01-03' },
  ],
  faq: [
    { slug: 'general', titleKey: 'docs.article.faqGeneral', descKey: 'docs.article.faqGeneralDesc', updatedAt: '2026-01-02' },
    { slug: 'troubleshooting', titleKey: 'docs.article.troubleshooting', descKey: 'docs.article.troubleshootingDesc', updatedAt: '2026-01-01' },
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
  const sectionTitle = t(`docs.sections.${section}.title`);

  const breadcrumbItems = [
    { label: t('docs.nav.home'), href: '/' },
    { label: sectionTitle },
  ];

  return (
    <div style={{ /* container - converted from CSS module */ }}>
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Header */}
      <header style={{ /* header - converted from CSS module */ }}>
        <Heading level={1}>{sectionTitle}</Heading>
        <Paragraph data-size="lg" style={{ /* description - converted from CSS module */ }}>
          {t(`docs.sections.${section}.description`)}
        </Paragraph>
      </header>

      {/* Articles List */}
      <section style={{ /* articlesList - converted from CSS module */ }}>
        {articles.length > 0 ? (
          articles.map((article) => (
            <Link
              key={article.slug}
              to={`/${section}/${article.slug}`}
              style={{ /* articleLink - converted from CSS module */ }}
            >
              <Card style={{ /* articleCard - converted from CSS module */ }} style={{ padding: 'var(--ds-spacing-4)' }}>
                <div style={{ /* articleContent - converted from CSS module */ }}>
                  <div>
                    <Heading level={3} style={{ /* articleTitle - converted from CSS module */ }}>
                      {t(article.titleKey)}
                    </Heading>
                    <Paragraph data-size="sm" style={{ /* articleDescription - converted from CSS module */ }}>
                      {t(article.descKey)}
                    </Paragraph>
                  </div>
                  <Paragraph data-size="xs" style={{ /* articleDate - converted from CSS module */ }}>
                    {t('docs.updatedAt')}: {article.updatedAt}
                  </Paragraph>
                </div>
              </Card>
            </Link>
          ))
        ) : (
          <Paragraph>{t('docs.noArticles')}</Paragraph>
        )}
      </section>
    </div>
  );
}

export default DocsSectionPage;
