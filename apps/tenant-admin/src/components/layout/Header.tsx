/**
 * Tenant Admin Header
 *
 * Top header with theme toggle, settings, and logout functionality.
 */

import { useNavigate } from 'react-router-dom';
import {
  HeaderActions,
  HeaderIconButton,
  HeaderThemeToggle,
  Button,
  BellIcon,
  SettingsIcon,
  LogOutIcon,
} from '@xala/ds';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../providers/ThemeProvider';
import { useT } from '@xala/i18n';
import styles from './Header.module.css';

interface HeaderProps {
  title?: string;
}

export function Header({ title: _title }: HeaderProps) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const t = useT();

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        {/* Left spacer for balance */}
        <div className={styles.leftSpacer} />

        {/* Center - could add search or title here in the future */}
        <div className={styles.centerContent}>
          {/* Placeholder for future search functionality */}
        </div>

        {/* Right side - Actions */}
        <div className={styles.rightActions}>
          <HeaderActions spacing="var(--ds-spacing-3)">
            <HeaderThemeToggle isDark={isDark} onToggle={toggleTheme} />
            <HeaderIconButton
              icon={<BellIcon size={22} />}
              size="md"
              aria-label={t('common.notifications')}
              title={t('common.notifications')}
              onClick={() => navigate('/notifications')}
            />
            <HeaderIconButton
              icon={<SettingsIcon size={22} />}
              size="md"
              aria-label={t('common.settings')}
              title={t('common.settings')}
              onClick={() => navigate('/settings')}
            />
            <div className={styles.divider} />
            {user && (
              <Button
                type="button"
                variant="tertiary"
                data-size="md"
                onClick={logout}
                aria-label={t('auth.logout')}
                className={styles.logoutButton}
              >
                <LogOutIcon size={20} />
                {t('auth.logout')}
              </Button>
            )}
          </HeaderActions>
        </div>
      </div>
    </header>
  );
}
