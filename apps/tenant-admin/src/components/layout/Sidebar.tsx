/**
 * Tenant Admin Sidebar
 *
 * Navigation sidebar for tenant-level administration.
 * Supports role-based navigation visibility.
 */

import { NavLink, useLocation } from 'react-router-dom';
import {
  Paragraph,
  HomeIcon,
  SettingsIcon,
  ArrowRightIcon,
  ChartIcon,
  ClockIcon,
  UsersIcon,
  SparklesIcon,
  ShieldIcon,
} from '@xala/ds';
import { useAuth, type TenantAdminRole } from '../../hooks/useAuth';
import { useT } from '@xala/i18n';
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
   * Empty array or undefined = visible to all authenticated tenant admins.
   * TENANT_ADMIN always has access to all items.
   */
  roles?: TenantAdminRole[];
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
      className={`${styles.sidebarNavItem} ${isActive ? styles.active : ''}`}
    >
      <div className={styles.sidebarNavIcon}>{item.icon}</div>

      <div className={styles.sidebarNavTextContent}>
        <Paragraph data-size="sm" className={styles.sidebarNavName}>
          {item.name}
        </Paragraph>
        <Paragraph data-size="xs" className={styles.sidebarNavDescription}>
          {item.description}
        </Paragraph>
      </div>

      <div className={styles.sidebarNavBadgeArrow}>
        {item.badge && item.badge > 0 && (
          <div className={styles.sidebarNavBadge}>{item.badge}</div>
        )}
        <div className={styles.sidebarNavArrow}>
          <ArrowRightIcon />
        </div>
      </div>
    </NavLink>
  );
}

export function Sidebar() {
  const { user, isTenantAdmin } = useAuth();
  const t = useT();

  const navSections: NavSection[] = [
    {
      items: [
        {
          name: t('tenantAdmin.nav.dashboard'),
          description: t('tenantAdmin.nav.dashboardDesc'),
          href: '/',
          icon: <HomeIcon />,
        },
      ],
    },
    {
      title: t('tenantAdmin.nav.administration'),
      items: [
        {
          name: t('tenantAdmin.nav.users'),
          description: t('tenantAdmin.nav.usersDesc'),
          href: '/users',
          icon: <UsersIcon />,
          roles: ['TENANT_ADMIN'],
        },
        {
          name: t('tenantAdmin.nav.featureFlags'),
          description: t('tenantAdmin.nav.featureFlagsDesc'),
          href: '/feature-flags',
          icon: <ShieldIcon />,
          roles: ['TENANT_ADMIN', 'TENANT_TECH_ADMIN'],
        },
      ],
    },
    {
      title: t('tenantAdmin.nav.appearance'),
      items: [
        {
          name: t('tenantAdmin.nav.branding'),
          description: t('tenantAdmin.nav.brandingDesc'),
          href: '/branding',
          icon: <SparklesIcon />,
          roles: ['TENANT_ADMIN', 'TENANT_TECH_ADMIN'],
        },
      ],
    },
    {
      title: t('tenantAdmin.nav.subscriptionSection'),
      items: [
        {
          name: t('tenantAdmin.nav.planAndBilling'),
          description: t('tenantAdmin.nav.planAndBillingDesc'),
          href: '/subscription',
          icon: <ChartIcon />,
          roles: ['TENANT_ADMIN', 'TENANT_BILLING_ADMIN'],
        },
      ],
    },
    {
      title: t('tenantAdmin.nav.system'),
      items: [
        {
          name: t('tenantAdmin.nav.auditLog'),
          description: t('tenantAdmin.nav.auditLogDesc'),
          href: '/audit',
          icon: <ClockIcon />,
          roles: ['TENANT_ADMIN'],
        },
        {
          name: t('tenantAdmin.nav.settings'),
          description: t('tenantAdmin.nav.settingsDesc'),
          href: '/settings',
          icon: <SettingsIcon />,
          roles: ['TENANT_ADMIN'],
        },
      ],
    },
  ];

  // Filter items based on user role
  // TENANT_ADMIN has access to all items
  // Other roles only see items they have access to
  const filteredSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        // If no roles specified, visible to all authenticated users
        if (!item.roles || item.roles.length === 0) {
          return true;
        }
        // Tenant admin has access to everything
        if (isTenantAdmin) {
          return true;
        }
        // Check if user's role is in the allowed roles
        return user?.role ? item.roles.includes(user.role) : false;
      }),
    }))
    .filter((section) => section.items.length > 0);

  // Role display name mapping
  const getRoleDisplayName = (role: string | undefined): string => {
    switch (role) {
      case 'TENANT_ADMIN':
        return t('tenantAdmin.roles.tenantAdmin');
      case 'TENANT_BILLING_ADMIN':
        return t('tenantAdmin.roles.billingAdmin');
      case 'TENANT_TECH_ADMIN':
        return t('tenantAdmin.roles.techAdmin');
      default:
        return t('tenantAdmin.roles.admin');
    }
  };

  return (
    <aside className={styles.sidebar}>
      {/* Logo Section */}
      <div className={styles.logoSection}>
        <div className={styles.brandContainer}>
          <img src="/logo.svg" alt="Digilist" className={styles.logoImage} />
          <div>
            <div className={styles.brandName}>{user?.tenantName || 'DIGILIST'}</div>
            <div className={styles.brandTagline}>Tenant Admin</div>
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

      {/* User Info Section */}
      {user && (
        <div className={styles.userInfoSection}>
          <div className={styles.userAvatarContainer}>
            <div className={styles.userAvatar}>{user.name.charAt(0).toUpperCase()}</div>
            <div className={styles.userDetails}>
              <Paragraph data-size="sm" className={styles.userName}>
                {user.name}
              </Paragraph>
              <Paragraph data-size="xs" className={styles.userRole}>
                {getRoleDisplayName(user.role)}
              </Paragraph>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
