/**
 * DocsSidebar Component
 *
 * Navigation sidebar with feature-flag controlled sections.
 * Adapts tenant-admin Sidebar pattern for documentation.
 */

import { NavLink, useLocation } from 'react-router-dom';
import {
  Paragraph,
  HomeIcon,
  SearchIcon,
  CalendarIcon,
  ShieldIcon,
  ChartIcon,
  SettingsIcon,
  MapIcon,
  ExternalLinkIcon,
  InfoIcon,
  BookOpenIcon,
  ArrowRightIcon,
  UsersIcon,
} from '@xala/ds';
import { useT } from '@xala/i18n';
import { useFeatureFlags } from '@digilist/client-sdk';
import { isSectionEnabled, DOCS_FEATURE_FLAGS } from '../../lib/feature-flags';
import type { DocsNavItem, DocsNavSection } from '../../types';
import styles from './DocsSidebar.module.css';

// NavItem component with proper active state handling
function SidebarNavItem({ item }: { item: DocsNavItem }) {
  const location = useLocation();
  const isActive =
    item.href === '/' ? location.pathname === '/' : location.pathname.startsWith(item.href);

  return (
    <NavLink
      to={item.href}
      end={item.href === '/'}
      className={`${styles.sidebarNavItem} ${isActive ? styles.active : ''}`}
    >
      <div className={styles.sidebarNavIcon}>{getIcon(item.icon)}</div>

      <div className={styles.sidebarNavTextContent}>
        <Paragraph data-size="sm" className={styles.sidebarNavName}>
          {item.label}
        </Paragraph>
        {item.description && (
          <Paragraph data-size="xs" className={styles.sidebarNavDescription}>
            {item.description}
          </Paragraph>
        )}
      </div>

      <div className={styles.sidebarNavArrow}>
        <ArrowRightIcon />
      </div>
    </NavLink>
  );
}

function getIcon(iconName?: string): React.ReactNode {
  const icons: Record<string, React.ReactNode> = {
    home: <HomeIcon />,
    search: <SearchIcon />,
    calendar: <CalendarIcon />,
    shield: <ShieldIcon />,
    'credit-card': <ChartIcon />,
    settings: <SettingsIcon />,
    api: <MapIcon />,
    link: <ExternalLinkIcon />,
    help: <InfoIcon />,
    book: <BookOpenIcon />,
    users: <UsersIcon />,
  };
  return icons[iconName || 'book'] || <BookOpenIcon />;
}

export function DocsSidebar() {
  const t = useT();
  const flags = useFeatureFlags();
  
  // Use default flags if SDK hasn't loaded yet
  const activeFlags = Object.keys(flags).length > 0 ? flags : { ...DOCS_FEATURE_FLAGS, 'docs.enabled': true };

  const navSections: DocsNavSection[] = [
    {
      items: [
        {
          id: 'home',
          label: t('docs.nav.home') || 'Oversikt',
          description: t('docs.nav.homeDesc') || 'Kom i gang med Digilist',
          href: '/',
          icon: 'home',
        },
        {
          id: 'search',
          label: t('docs.nav.search') || 'Søk',
          description: t('docs.nav.searchDesc') || 'Søk i dokumentasjon',
          href: '/search',
          icon: 'search',
          featureFlag: 'docs.search.enabled',
        },
      ],
    },
    {
      title: t('docs.nav.sections') || 'Seksoner',
      items: [
        {
          id: 'booking',
          label: t('docs.nav.booking') || 'Bookingsystem',
          description: t('docs.nav.bookingDesc') || 'Opprett og administrer bookinger',
          href: '/booking',
          icon: 'calendar',
          featureFlag: 'docs.section.booking.enabled',
        },
        {
          id: 'rbac',
          label: t('docs.nav.rbac') || 'Roller og tilgang',
          description: t('docs.nav.rbacDesc') || 'Forstå brukerroller og tilgang',
          href: '/rbac',
          icon: 'shield',
          featureFlag: 'docs.section.rbac.enabled',
        },
        {
          id: 'payments',
          label: t('docs.nav.payments') || 'Betalinger',
          description: t('docs.nav.paymentsDesc') || 'Betalinger og fakturering',
          href: '/payments',
          icon: 'credit-card',
          featureFlag: 'docs.section.payments.enabled',
        },
        {
          id: 'admin',
          label: t('docs.nav.admin') || 'Administrasjon',
          description: t('docs.nav.adminDesc') || 'Innstillinger og konfigurasjon',
          href: '/admin',
          icon: 'settings',
          featureFlag: 'docs.section.admin.enabled',
        },
        {
          id: 'api',
          label: t('docs.nav.api') || 'API-dokumentasjon',
          description: t('docs.nav.apiDesc') || 'Teknisk referanse for utviklere',
          href: '/api',
          icon: 'api',
          featureFlag: 'docs.section.api.enabled',
        },
        {
          id: 'integrations',
          label: t('docs.nav.integrations') || 'Integrasjoner',
          description: t('docs.nav.integrationsDesc') || 'Koble til andre systemer',
          href: '/integrations',
          icon: 'link',
          featureFlag: 'docs.section.integrations.enabled',
        },
        {
          id: 'faq',
          label: t('docs.nav.faq') || 'Ofte stilte spørsmål',
          description: t('docs.nav.faqDesc') || 'Vanlige spørsmål og svar',
          href: '/faq',
          icon: 'help',
          featureFlag: 'docs.section.faq.enabled',
        },
      ],
    },
    {
      title: t('docs.nav.roleGuides') || 'Rolleguider',
      items: [
        {
          id: 'role-end-user',
          label: t('docs.nav.roleEndUser') || 'For sluttbrukere',
          href: '/roles/web/end-user',
          icon: 'users',
          featureFlag: 'docs.roleGuides.enabled',
        },
        {
          id: 'role-org-member',
          label: t('docs.nav.roleOrgMember') || 'For org-medlemmer',
          href: '/roles/backoffice/org-member',
          icon: 'users',
          featureFlag: 'docs.roleGuides.enabled',
        },
        {
          id: 'role-org-admin',
          label: t('docs.nav.roleOrgAdmin') || 'For org-admins',
          href: '/roles/backoffice/org-admin',
          icon: 'users',
          featureFlag: 'docs.roleGuides.enabled',
        },
      ],
    },
    {
      items: [
        {
          id: 'releases',
          label: t('docs.nav.releases') || 'Endringslogg',
          description: t('docs.nav.releasesDesc') || 'Nytt i siste oppdatering',
          href: '/releases',
          icon: 'book',
          featureFlag: 'docs.releases.enabled',
        },
      ],
    },
  ];

  // Filter items based on feature flags
  const filteredSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (!item.featureFlag) return true;
        return isSectionEnabled(item.id, activeFlags);
      }),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <aside className={styles.sidebar}>
      {/* Logo Section */}
      <div className={styles.logoSection}>
        <div className={styles.brandContainer}>
          <img src="/logo.svg" alt="Digilist" className={styles.logoImage} />
          <div>
            <div className={styles.brandName}>DIGILIST</div>
            <div className={styles.brandTagline}>{t('docs.title') || 'Dokumentasjon'}</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className={styles.navigation}>
        {filteredSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className={styles.navSection}>
            {section.title && (
              <Paragraph data-size="xs" className={styles.navSectionTitle}>
                {section.title}
              </Paragraph>
            )}
            <ul className={styles.navList}>
              {section.items.map((item) => (
                <li key={item.href}>
                  <SidebarNavItem item={item} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}

export default DocsSidebar;
