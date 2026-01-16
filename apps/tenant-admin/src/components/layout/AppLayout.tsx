/**
 * Tenant Admin Application Layout
 *
 * Main layout component that wraps all authenticated pages.
 * Provides sidebar navigation, header, and content area.
 */

import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import styles from './AppLayout.module.css';

export function AppLayout() {
  return (
    <div className={styles.appLayout}>
      <Sidebar />

      <div className={styles.contentArea}>
        <Header />

        <main className={styles.mainContent}>
          <div className={styles.maxWidthWrapper}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
