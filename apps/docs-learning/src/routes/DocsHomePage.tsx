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
    <div style={{ /* container - converted from CSS module */ }}>
      {/* Hero Section */}
      <header style={{ /* hero - converted from CSS module */ }}>
        <Heading level={1}>
          {t('docs.home.page.title')}
        </Heading>
        <Paragraph data-size="lg" style={{ /* heroSubtitle - converted from CSS module */ }}>
          {t('docs.home.page.description')}
        </Paragraph>
      </header>

      {/* Section Cards */}
      <section style={{ /* sectionsGrid - converted from CSS module */ }}>
        {enabledSections.map((section) => {
          const config = SECTION_CONFIG[section];
          return (
            <Link
              key={section}
              to={`/${section}`}
              style={{ /* sectionCard - converted from CSS module */ }}
            >
              <Card style={{ /* card - converted from CSS module */ }} style={{ padding: 'var(--ds-spacing-4)' }}>
                <div style={{ /* sectionIcon - converted from CSS module */ }}>{config.icon}</div>
                <Heading level={3} style={{ /* sectionTitle - converted from CSS module */ }}>
                  {t(`docs.sections.${section}.title`)}
                </Heading>
                <Paragraph data-size="sm" style={{ /* sectionDescription - converted from CSS module */ }}>
                  {t(`docs.sections.${section}.description`)}
                </Paragraph>
              </Card>
            </Link>
          );
        })}
      </section>

      {/* Quick Links */}
      <section style={{ /* quickLinks - converted from CSS module */ }}>
        <Heading level={2} style={{ /* quickLinksTitle - converted from CSS module */ }}>
          {t('docs.home.quickLinks')}
        </Heading>
        <div style={{ /* quickLinksGrid - converted from CSS module */ }}>
          <Link to="/roles/web/end-user" style={{ /* quickLink - converted from CSS module */ }}>
            <span style={{ /* quickLinkIcon - converted from CSS module */ }}>👤</span>
            <div>
              <Paragraph data-size="sm" style={{ /* quickLinkTitle - converted from CSS module */ }}>
                {t('docs.home.forEndUsers')}
              </Paragraph>
              <Paragraph data-size="xs" style={{ /* quickLinkDescription - converted from CSS module */ }}>
                {t('docs.home.forEndUsersDesc')}
              </Paragraph>
            </div>
          </Link>
          <Link to="/roles/backoffice/org-admin" style={{ /* quickLink - converted from CSS module */ }}>
            <span style={{ /* quickLinkIcon - converted from CSS module */ }}>🏢</span>
            <div>
              <Paragraph data-size="sm" style={{ /* quickLinkTitle - converted from CSS module */ }}>
                {t('docs.home.forOrgAdmins')}
              </Paragraph>
              <Paragraph data-size="xs" style={{ /* quickLinkDescription - converted from CSS module */ }}>
                {t('docs.home.forOrgAdminsDesc')}
              </Paragraph>
            </div>
          </Link>
          <Link to="/search" style={{ /* quickLink - converted from CSS module */ }}>
            <span style={{ /* quickLinkIcon - converted from CSS module */ }}>🔍</span>
            <div>
              <Paragraph data-size="sm" style={{ /* quickLinkTitle - converted from CSS module */ }}>
                {t('docs.home.searchDocs')}
              </Paragraph>
              <Paragraph data-size="xs" style={{ /* quickLinkDescription - converted from CSS module */ }}>
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
