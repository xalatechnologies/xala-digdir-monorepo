/**
 * SaaS Admin Header
 *
 * Top header with theme toggle, settings, and logout functionality.
 * Mobile: Logo icon only, user menu dropdown
 * Desktop: Full header with actions
 */

import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import {
  HeaderActions,
  HeaderIconButton,
  HeaderThemeToggle,
  Button,
  BellIcon,
  SettingsIcon,
  LogOutIcon,
  UserIcon,
} from '@xala/ds';
import { useT } from '@xala/i18n';
import { useAuth } from '@xala/auth';
import { useTheme } from '../../providers/ThemeProvider';
import styles from './Header.module.css';

interface HeaderProps {
  title?: string;
}

const MOBILE_BREAKPOINT = 768;

export function Header({ title: _title }: HeaderProps) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const t = useT();
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Track viewport size for mobile/desktop detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isUserMenuOpen]);

  return (
    <header className={styles.header}>
      <div className={styles.headerContent} style={{ gap: 'var(--ds-spacing-4)' }}>
        {/* Left - Logo (icon only on mobile) */}
        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          {isMobile ? (
            <img
              src="/logo.svg"
              alt={t('app.name', { defaultValue: 'Digilist' })}
              style={{
                height: '32px',
                width: 'auto',
              }}
            />
          ) : (
            <div className={styles.spacer} />
          )}
        </div>

        {/* Center - Empty on mobile, spacer on desktop */}
        <div className={styles.center} />

          {/* Right side - Actions */}
        <div className={styles.actions} style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
          {isMobile ? (
            // Mobile: Theme toggle + User menu dropdown
            <>
              <HeaderThemeToggle isDark={isDark} onToggle={toggleTheme} />
              <div ref={userMenuRef} style={{ position: 'relative' }}>
                <Button
                  type="button"
                  variant="tertiary"
                  size="md"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  aria-label={user ? `${user.name || 'User'} menu` : 'User menu'}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--ds-spacing-2)',
                    padding: 'var(--ds-spacing-2)',
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--ds-border-radius-full)',
                      backgroundColor: 'var(--ds-color-accent-surface-default)',
                      color: 'var(--ds-color-accent-text-default)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 'var(--ds-font-size-sm)',
                      fontWeight: 'var(--ds-font-weight-semibold)',
                    }}
                  >
                    {user?.name?.charAt(0).toUpperCase() || <UserIcon size={18} />}
                  </div>
                </Button>
                {isUserMenuOpen && user && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: 'var(--ds-spacing-2)',
                      backgroundColor: 'var(--ds-color-neutral-surface-default)',
                      borderRadius: 'var(--ds-border-radius-md)',
                      boxShadow: 'var(--ds-shadow-md)',
                      border: '1px solid var(--ds-color-neutral-border-subtle)',
                      minWidth: '200px',
                      overflow: 'hidden',
                      zIndex: 1000,
                    }}
                  >
                    <div
                      style={{
                        padding: 'var(--ds-spacing-4)',
                        borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
                      }}
                    >
                      <div style={{ fontWeight: 'var(--ds-font-weight-semibold)', marginBottom: 'var(--ds-spacing-1)' }}>
                        {user.name}
                      </div>
                      <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                        {user.email}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      style={{
                        width: '100%',
                        padding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
                        border: 'none',
                        backgroundColor: 'transparent',
                        color: 'var(--ds-color-neutral-text-default)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--ds-spacing-3)',
                        fontSize: 'var(--ds-font-size-sm)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--ds-color-neutral-surface-hover)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <LogOutIcon size={18} />
                      {t('action.logout')}
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            // Desktop: Full actions
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
                aria-label={t('saasAdmin.nav.settings')}
                title={t('saasAdmin.nav.settings')}
                onClick={() => navigate('/settings')}
              />
              <div className={styles.divider} />
              {user && (
                <Button
                  type="button"
                  variant="tertiary"
                  size="md"
                  onClick={logout}
                  aria-label={t('action.logout')}
                  className={styles.logoutButton}
                >
                  <LogOutIcon size={20} />
                  {t('action.logout')}
                </Button>
              )}
            </HeaderActions>
          )}
        </div>
      </div>
    </header>
  );
}
