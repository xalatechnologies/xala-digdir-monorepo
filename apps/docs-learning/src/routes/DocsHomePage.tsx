/**
 * Docs Home Page
 *
 * Overview page with section cards and quick links.
 */

import { Heading, Paragraph, Card } from '@xala/ds';
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
          {t('docs.home.title')}
        </Heading>
        <Paragraph data-size="lg" className={styles.heroSubtitle}>
          {t('docs.home.subtitle')}
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
              <Card className={styles.card} style={{ padding: 'var(--ds-spacing-4)' }}>
                <div className={styles.sectionIcon}>{config.icon}</div>
                <Heading level={3} className={styles.sectionTitle}>
                  {t(`docs.sections.${section}.title`)}
                </Heading>
                <Paragraph data-size="sm" className={styles.sectionDescription}>
                  {t(`docs.sections.${section}.description`)}
                </Paragraph>
              </Card>
            </Link>
          );
        })}
      </section>

      {/* Quick Links */}
      <section className={styles.quickLinks}>
        <Heading level={2} className={styles.quickLinksTitle}>
          {t('docs.home.quickLinks')}
        </Heading>
        <div className={styles.quickLinksGrid}>
          <Link to="/roles/web/end-user" className={styles.quickLink}>
            <span className={styles.quickLinkIcon}>👤</span>
            <div>
              <Paragraph data-size="sm" className={styles.quickLinkTitle}>
                {t('docs.home.forEndUsers')}
              </Paragraph>
              <Paragraph data-size="xs" className={styles.quickLinkDescription}>
                {t('docs.home.forEndUsersDesc')}
              </Paragraph>
            </div>
          </Link>
          <Link to="/roles/backoffice/org-admin" className={styles.quickLink}>
            <span className={styles.quickLinkIcon}>🏢</span>
            <div>
              <Paragraph data-size="sm" className={styles.quickLinkTitle}>
                {t('docs.home.forOrgAdmins')}
              </Paragraph>
              <Paragraph data-size="xs" className={styles.quickLinkDescription}>
                {t('docs.home.forOrgAdminsDesc')}
              </Paragraph>
            </div>
          </Link>
          <Link to="/search" className={styles.quickLink}>
            <span className={styles.quickLinkIcon}>🔍</span>
            <div>
              <Paragraph data-size="sm" className={styles.quickLinkTitle}>
                {t('docs.home.searchDocs')}
              </Paragraph>
              <Paragraph data-size="xs" className={styles.quickLinkDescription}>
                {t('docs.home.searchDocsDesc')}
              </Paragraph>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default DocsHomePage;
