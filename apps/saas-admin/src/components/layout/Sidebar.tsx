/**
 * SaaS Admin Sidebar
 *
 * Navigation sidebar for platform-wide administration.
 * Supports role-based navigation visibility.
 */

import { NavLink, useLocation } from 'react-router-dom';
import {
  Paragraph,
  HomeIcon,
  BuildingIcon,
  SettingsIcon,
  ArrowRightIcon,
  ChartIcon,
  ShieldIcon,
  ClockIcon,
  UsersIcon,
  SparklesIcon,
} from '@xala/ds';
import { useT } from '@xala/i18n';
import { useAuth, type SaasAdminRole } from '@xala/auth';
import styles from './Sidebar.module.css';

interface NavItem {
  name: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  badgeColor?: 'accent' | 'success' | 'warning' | 'danger' | 'info';
  /**
   * Roles that can view this nav item.
   * Empty array or undefined = visible to all authenticated SaaS admins.
   * SAAS_SUPER_ADMIN always has access to all items.
   */
  roles?: SaasAdminRole[];
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

// NavItem component with proper active state handling
function SidebarNavItem({ item }: { item: NavItem }) {
  const location = useLocation();
  const isActive =
    item.href === '/' ? location.pathname === '/' : location.pathname.startsWith(item.href);

  return (
    <NavLink
      to={item.href}
      end={item.href === '/'}
      className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
    >
      {/* Icon with background */}
      <div className={`${styles.navIcon} ${isActive ? styles.navIconActive : ''}`}>
        {item.icon}
      </div>

      {/* Text content */}
      <div className={styles.navContent}>
        <Paragraph
          size="sm"
          className={`${styles.navName} ${isActive ? styles.navNameActive : ''}`}
        >
          {item.name}
        </Paragraph>
        <Paragraph size="xs" className={styles.navDescription}>
          {item.description}
        </Paragraph>
      </div>

      {/* Badge or Arrow */}
      <div className={styles.navActions}>
        {item.badge && item.badge > 0 && (
          <div className={styles.navBadge}>{item.badge}</div>
        )}
        <div className={`${styles.navArrow} ${isActive ? styles.navArrowActive : ''}`}>
          <ArrowRightIcon />
        </div>
      </div>
    </NavLink>
  );
}

export function Sidebar() {
  const { user, isSuperAdmin } = useAuth();
  const t = useT();

  const navSections: NavSection[] = [
    {
      items: [
        {
          name: t('saasAdmin.nav.dashboard'),
          description: t('saasAdmin.nav.dashboardDesc'),
          href: '/',
          icon: <HomeIcon />,
        },
      ],
    },
    {
      title: t('saasAdmin.nav.sections.administration'),
      items: [
        {
          name: t('saasAdmin.nav.tenants'),
          description: t('saasAdmin.nav.tenantsDesc'),
          href: '/tenants',
          icon: <BuildingIcon />,
        },
        {
          name: t('saasAdmin.nav.plans'),
          description: t('saasAdmin.nav.plansDesc'),
          href: '/plans',
          icon: <ChartIcon />,
          roles: ['SAAS_SUPER_ADMIN', 'SAAS_BILLING_ADMIN'],
        },
        {
          name: t('saasAdmin.nav.featureFlags'),
          description: t('saasAdmin.nav.featureFlagsDesc'),
          href: '/feature-flags',
          icon: <ShieldIcon />,
          roles: ['SAAS_SUPER_ADMIN'],
        },
      ],
    },
    {
      title: t('saasAdmin.nav.sections.finance'),
      items: [
        {
          name: t('saasAdmin.nav.billing'),
          description: t('saasAdmin.nav.billingDesc'),
          href: '/billing',
          icon: <ChartIcon />,
          roles: ['SAAS_SUPER_ADMIN', 'SAAS_BILLING_ADMIN'],
        },
      ],
    },
    {
      title: t('saasAdmin.nav.sections.support'),
      items: [
        {
          name: t('saasAdmin.nav.users'),
          description: t('saasAdmin.nav.usersDesc'),
          href: '/users',
          icon: <UsersIcon />,
        },
      ],
    },
    {
      title: t('saasAdmin.nav.sections.system'),
      items: [
        {
          name: t('saasAdmin.aiSeed.title'),
          description: t('saasAdmin.aiSeed.description'),
          href: '/ai-seeds',
          icon: <SparklesIcon />,
          roles: ['SAAS_SUPER_ADMIN'],
        },
        {
          name: t('saasAdmin.nav.translations', { defaultValue: 'Oversettelser' }),
          description: t('saasAdmin.nav.translationsDesc', { defaultValue: 'Administrer oversettelser' }),
          href: '/translations',
          icon: <SparklesIcon />,
          roles: ['SAAS_SUPER_ADMIN'],
        },
        {
          name: t('saasAdmin.nav.monitoring', { defaultValue: 'Overvåking' }),
          description: t('saasAdmin.nav.monitoringDesc', { defaultValue: 'Plattformovervåking og helse' }),
          href: '/monitoring',
          icon: <ChartIcon />,
          roles: ['SAAS_SUPER_ADMIN'],
        },
        {
          name: t('saasAdmin.nav.auditLog'),
          description: t('saasAdmin.nav.auditLogDesc'),
          href: '/audit',
          icon: <ClockIcon />,
          roles: ['SAAS_SUPER_ADMIN'],
        },
        {
          name: t('saasAdmin.nav.settings'),
          description: t('saasAdmin.nav.settingsDesc'),
          href: '/settings',
          icon: <SettingsIcon />,
          roles: ['SAAS_SUPER_ADMIN'],
        },
      ],
    },
  ];

  // Filter items based on user role
  // SAAS_SUPER_ADMIN has access to all items
  // Other roles only see items they have access to
  const filteredSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        // If no roles specified, visible to all authenticated users
        if (!item.roles || item.roles.length === 0) {
          return true;
        }
        // Super admin has access to everything
        if (isSuperAdmin) {
          return true;
        }
        // Check if user's role is in the allowed roles
        return user?.role ? item.roles.includes(user.role) : false;
      }),
    }))
    .filter((section) => section.items.length > 0);

  // Role display name mapping using i18n
  const getRoleDisplayName = (role: string | undefined): string => {
    switch (role) {
      case 'SAAS_SUPER_ADMIN':
        return t('saasAdmin.roles.superAdmin');
      case 'SAAS_BILLING_ADMIN':
        return t('saasAdmin.roles.billingAdmin');
      case 'SAAS_SUPPORT_AGENT':
        return t('saasAdmin.roles.supportAgent');
      default:
        return t('saasAdmin.roles.admin');
    }
  };

  return (
    <aside className={styles.sidebar}>
      {/* Logo Section */}
      <div className={styles.logoSection}>
        <div className={styles.logoWrapper}>
          <img
            src="/logo.svg"
            alt={t('common.brandName', { defaultValue: 'Digilist' })}
            className={styles.logoImage}
          />
          <div>
            <div className={styles.brandName}>DIGILIST</div>
            <div className={styles.brandTagline}>
              {t('saasAdmin.brand.tagline')}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        {filteredSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className={styles.navSection}>
            {section.title && (
              <Paragraph size="xs" className={styles.sectionTitle}>
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

      {/* User Info Section */}
      {user && (
        <div className={styles.userSection}>
          <div className={styles.userWrapper}>
            <div className={styles.userAvatar}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className={styles.userInfo}>
              <Paragraph size="sm" className={styles.userName}>
                {user.name}
              </Paragraph>
              <Paragraph size="xs" className={styles.userRole}>
                {getRoleDisplayName(user.role)}
              </Paragraph>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
