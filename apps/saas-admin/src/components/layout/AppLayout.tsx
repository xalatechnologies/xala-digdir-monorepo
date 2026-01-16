/**
 * SaaS Admin Application Layout
 *
 * Main layout component that wraps all authenticated pages.
 * Provides sidebar navigation, header, and content area.
 */

import { Outlet, useLocation } from 'react-router-dom';
import { useT } from '@xala/i18n';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import styles from './AppLayout.module.css';

export function AppLayout() {
  const location = useLocation();
  const t = useT();

  // Page title lookup using i18n keys
  const pageTitleKeys: Record<string, string> = {
    '/': 'saasAdmin.nav.dashboard',
    '/tenants': 'saasAdmin.nav.tenants',
    '/plans': 'saasAdmin.nav.plans',
    '/feature-flags': 'saasAdmin.nav.featureFlags',
    '/billing': 'saasAdmin.nav.billing',
    '/users': 'saasAdmin.nav.users',
    '/audit': 'saasAdmin.nav.auditLog',
    '/settings': 'saasAdmin.nav.settings',
  };

  const titleKey = pageTitleKeys[location.pathname];
  const title = titleKey ? t(titleKey) : '';

  return (
    <div className={styles.layout}>
      <Sidebar />

      <div className={styles.main}>
        <Header title={title} />

        <main className={styles.content}>
          <div className={styles.contentContainer}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
