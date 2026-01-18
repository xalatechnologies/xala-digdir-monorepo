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
import { useUnreadCount } from '@digilist/client-sdk';
import { useAuth } from '@xala/auth';
import { useTheme } from '@xala/ds';
import { GlobalSearch } from '@xala/ds';
import { useT } from '@xala/i18n';

interface HeaderProps {
  title?: string;
}

const MOBILE_BREAKPOINT = 768;

export function Header({ title: _title }: HeaderProps) {
  const t = useT();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
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

  // Get real unread notification count
  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.data?.count ?? 0;

  return (
    <>
      <style>{`
        .backoffice-header-search-container {
          display: flex;
          justify-content: center;
          width: 100%;
        }

        /* Tablet breakpoint (768px - 900px) */
        @media (min-width: 768px) and (max-width: 900px) {
          .backoffice-header-search-container {
            max-width: 400px;
          }
        }

        /* Small desktop (901px - 1100px) */
        @media (min-width: 901px) and (max-width: 1100px) {
          .backoffice-header-search-container {
            max-width: 500px;
          }
        }

        /* Desktop (1100px+) */
        @media (min-width: 1101px) {
          .backoffice-header-search-container {
            max-width: 650px;
          }
        }
      `}</style>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: 'var(--ds-color-neutral-surface-default)',
          borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
          boxShadow: 'var(--ds-shadow-xs)',
        }}
      >
        {/* Main header row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            height: '72px',
            padding: '0 var(--ds-spacing-6)',
            gap: 'var(--ds-spacing-4)',
          }}
        >
          {/* Left - Logo (icon only on mobile) */}
          <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            {isMobile ? (
              <img
                src="/logo.svg"
                alt="Digilist"
                style={{
                  height: '32px',
                  width: 'auto',
                }}
              />
            ) : (
              <div style={{ flex: '1 1 0', minWidth: 0 }} />
            )}
          </div>

          {/* Center - Search (desktop only) */}
          {!isMobile && (
            <div
              className="backoffice-header-search-container"
              style={{
                flex: '0 1 auto',
              }}
            >
              <GlobalSearch
                placeholder={t('common.sok_i_bookinger_lokaler')}
                showShortcut
                enableGlobalShortcut
              />
            </div>
          )}

          {/* Right side - Actions */}
          <div style={{ flex: isMobile ? '1' : '1 1 0', minWidth: 0, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
            {isMobile ? (
              // Mobile: Theme toggle + User menu dropdown
              <>
                <HeaderThemeToggle
                  isDark={isDark}
                  onToggle={toggleTheme}
                />
                <div ref={userMenuRef} style={{ position: 'relative' }}>
                  <Button
                    type="button"
                    variant="tertiary"
                    data-size="md"
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
                      <Button
                        type="button"
                        variant="tertiary"
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        style={{
                          width: '100%',
                          padding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
                          backgroundColor: 'transparent',
                          color: 'var(--ds-color-neutral-text-default)',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--ds-spacing-3)',
                          fontSize: 'var(--ds-font-size-sm)',
                          borderRadius: 0,
                        }}
                      >
                        <LogOutIcon size={18} />
                        Logg ut
                      </Button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              // Desktop: Full actions
              <HeaderActions spacing="var(--ds-spacing-3)">
                <HeaderThemeToggle
                  isDark={isDark}
                  onToggle={toggleTheme}
                />
                <HeaderIconButton
                  data-testid="notification-bell"
                  icon={<BellIcon size={22} />}
                  {...(unreadCount > 0 ? { badge: unreadCount, badgeColor: 'danger' as const } : {})}
                  size="md"
                  aria-label={`Varsler${unreadCount > 0 ? ` (${unreadCount} uleste)` : ''}`}
                  title="Varsler"
                  onClick={() => navigate('/messages')}
                />
                <HeaderIconButton
                  icon={<SettingsIcon size={22} />}
                  size="md"
                  aria-label={t("ui.settings")}
                  title={t("ui.settings")}
                  onClick={() => navigate('/settings')}
                />
                <div
                  style={{
                    width: '1px',
                    height: '28px',
                    backgroundColor: 'var(--ds-color-neutral-border-subtle)',
                    margin: '0 var(--ds-spacing-2)',
                  }}
                />
                {user && (
                  <Button
                    type="button"
                    variant="tertiary"
                    data-size="md"
                    onClick={logout}
                    aria-label={t('common.logg_ut')}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    <LogOutIcon size={20} />
                    Logg ut
                  </Button>
                )}
              </HeaderActions>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
