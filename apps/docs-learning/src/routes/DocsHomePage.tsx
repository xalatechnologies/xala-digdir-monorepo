/**
 * Docs Home Page
 *
 * Overview page with section cards and quick links.
 */

import { Heading, Paragraph, Card, CardContent } from '@xala/ds';
import { Link } from 'react-router-dom';
import { useT } from '@xala/i18n';
import { useFeatureFlags } from '@digilist/client-sdk';
import { isSectionEnabled, DOCS_FEATURE_FLAGS } from '../lib/feature-flags';
import { DOCS_SECTIONS, type DocsSection } from '../types';
import styles from './DocsHomePage.module.css';

const SECTION_CONFIG: Record<DocsSection, { icon: string; color: string }> = {
  booking: { icon: '📅', color: 'accent' },
  rbac: { icon: '🔐', color: 'info' },
  payments: { icon: '💳', color: 'success' },
  admin: { icon: '⚙️', color: 'warning' },
  api: { icon: '🖥️', color: 'neutral' },
  integrations: { icon: '🔌', color: 'info' },
  faq: { icon: '❓', color: 'accent' },
};

export function DocsHomePage() {
  const t = useT();
  const flags = useFeatureFlags();
  const activeFlags = Object.keys(flags).length > 0 ? flags : { ...DOCS_FEATURE_FLAGS, 'docs.enabled': true };

  const enabledSections = DOCS_SECTIONS.filter((section) =>
    isSectionEnabled(section, activeFlags)
  );

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <header className={styles.hero}>
        <Heading level={1}>
          {t('docs.home.title') || 'Velkommen til dokumentasjonen'}
        </Heading>
        <Paragraph data-size="lg" className={styles.heroSubtitle}>
          {t('docs.home.subtitle') || 'Finn svar, lær om funksjoner, og kom i gang med Digilist.'}
        </Paragraph>
      </header>

      {/* Section Cards */}
      <section className={styles.sectionsGrid}>
        {enabledSections.map((section) => {
          const config = SECTION_CONFIG[section];
          return (
            <Link
              key={section}
              to={`/${section}`}
              className={styles.sectionCard}
            >
              <Card className={styles.card}>
                <CardContent>
                  <div className={styles.sectionIcon}>{config.icon}</div>
                  <Heading level={3} className={styles.sectionTitle}>
                    {t(`docs.sections.${section}.title`) || section}
                  </Heading>
                  <Paragraph data-size="sm" className={styles.sectionDescription}>
                    {t(`docs.sections.${section}.description`) || `Les mer om ${section}`}
                  </Paragraph>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </section>

      {/* Quick Links */}
      <section className={styles.quickLinks}>
        <Heading level={2} className={styles.quickLinksTitle}>
          {t('docs.home.quickLinks') || 'Hurtiglenker'}
        </Heading>
        <div className={styles.quickLinksGrid}>
          <Link to="/roles/web/end-user" className={styles.quickLink}>
            <span className={styles.quickLinkIcon}>👤</span>
            <div>
              <Paragraph data-size="sm" className={styles.quickLinkTitle}>
                {t('docs.home.forEndUsers') || 'For sluttbrukere'}
              </Paragraph>
              <Paragraph data-size="xs" className={styles.quickLinkDescription}>
                {t('docs.home.forEndUsersDesc') || 'Kom i gang med booking'}
              </Paragraph>
            </div>
          </Link>
          <Link to="/roles/backoffice/org-admin" className={styles.quickLink}>
            <span className={styles.quickLinkIcon}>🏢</span>
            <div>
              <Paragraph data-size="sm" className={styles.quickLinkTitle}>
                {t('docs.home.forOrgAdmins') || 'For organisasjonsadmins'}
              </Paragraph>
              <Paragraph data-size="xs" className={styles.quickLinkDescription}>
                {t('docs.home.forOrgAdminsDesc') || 'Administrer din organisasjon'}
              </Paragraph>
            </div>
          </Link>
          <Link to="/search" className={styles.quickLink}>
            <span className={styles.quickLinkIcon}>🔍</span>
            <div>
              <Paragraph data-size="sm" className={styles.quickLinkTitle}>
                {t('docs.home.searchDocs') || 'Søk i dokumentasjon'}
              </Paragraph>
              <Paragraph data-size="xs" className={styles.quickLinkDescription}>
                {t('docs.home.searchDocsDesc') || 'Finn svar raskt'}
              </Paragraph>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default DocsHomePage;
