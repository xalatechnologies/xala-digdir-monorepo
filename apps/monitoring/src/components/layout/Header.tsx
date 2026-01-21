import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '@xalatechnologies/platform/i18n';
import {
  HeaderSearch,
  HeaderActions,
  HeaderIconButton,
  HeaderThemeToggle,
  Button,
  NotificationBell,
  SettingsIcon,
  LogOutIcon,
  SearchIcon,
  CalendarIcon,
  PeopleIcon,
  UserIcon,
} from '@xalatechnologies/platform/ui';
import type { SearchResultItem, SearchResultGroup } from '@xalatechnologies/platform/ui';
import { useNotificationUnreadCount } from '@digilist/client-sdk';
import { useAuth } from '@xalatechnologies/platform/auth';
import { useTheme } from '@xalatechnologies/platform/ui';
import { useNotificationCenter } from '@xalatechnologies/platform/runtime';
import { AccountSwitcher } from '@xalatechnologies/platform/ui';

interface HeaderProps {
  title?: string;
}

const MOBILE_BREAKPOINT = 768;

/**
 * Get navigation search results based on query
 * TODO: Replace with SDK global search when available
 */
const getNavigationResults = (query: string): SearchResultGroup[] => {
  if (!query.trim()) return [];

  const q = query.toLowerCase();
  const navItems: SearchResultItem[] = [];

  // Dashboard
  if ('dashboard'.includes(q) || 'hjem'.includes(q) || 'oversikt'.includes(q)) {
    navItems.push({
      id: 'nav-dashboard',
      label: 'Dashboard',
      description: t('common.gaa_til_oversikt'),
      icon: <SearchIcon size={18} />,
      href: '/',
    });
  }

  // Bookings
  if ('booking'.includes(q) || 'bestilling'.includes(q)) {
    navItems.push({
      id: 'nav-bookings',
      label: 'Bookinger',
      description: t('common.se_alle_dine_bookinger'),
      icon: <CalendarIcon size={18} />,
      href: '/bookings',
    });
  }

  // Calendar
  if ('kalender'.includes(q) || 'calendar'.includes(q)) {
    navItems.push({
      id: 'nav-calendar',
      label: 'Kalender',
      description: t('common.se_bookinger_i_kalendervisning'),
      icon: <CalendarIcon size={18} />,
      href: '/calendar',
    });
  }

  // Messages
  if ('melding'.includes(q) || 'message'.includes(q) || 'samtale'.includes(q)) {
    navItems.push({
      id: 'nav-messages',
      label: 'Meldinger',
      description: t('common.se_samtaler_og_meldinger'),
      icon: <PeopleIcon size={18} />,
      href: '/messages',
    });
  }

  // Settings
  if ('innstilling'.includes(q) || 'setting'.includes(q)) {
    navItems.push({
      id: 'nav-settings',
      label: 'Innstillinger',
      description: 'Systemkonfigurasjon',
      icon: <SettingsIcon size={18} />,
      href: '/settings',
    });
  }

  if (navItems.length === 0) return [];

  return [{ id: 'navigation', label: 'Sider', items: navItems }];
};

export function Header({ title: _title }: HeaderProps) {
  const { user, logout } = useAuth();
  const t = useT();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { openNotificationCenter } = useNotificationCenter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultGroup[]>([]);
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
  const { data: unreadData } = useNotificationUnreadCount();
  const unreadCount = unreadData?.data?.count ?? 0;

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setSearchResults(getNavigationResults(value));
  };

  const handleResultSelect = (result: SearchResultItem) => {
    if (result.href) {
      navigate(result.href);
    }
  };

  return (
    <>
      <style>{`
        .minside-header-search-container {
          display: flex;
          justify-content: center;
          width: 100%;
        }

        /* Tablet breakpoint (768px - 900px) */
        @media (min-width: 768px) and (max-width: 900px) {
          .minside-header-search-container {
            max-width: 400px;
          }
        }

        /* Small desktop (901px - 1100px) */
        @media (min-width: 901px) and (max-width: 1100px) {
          .minside-header-search-container {
            max-width: 500px;
          }
        }

        /* Desktop (1100px+) */
        @media (min-width: 1101px) {
          .minside-header-search-container {
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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            height: '72px',
            padding: '0 var(--ds-spacing-6)',
            gap: 'var(--ds-spacing-4)',
          }}
        >
          {/* Left zone - Logo icon only on mobile, Account Switcher on desktop */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexShrink: 0 }}>
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
              <AccountSwitcher />
            )}
          </div>

          {/* Center zone - Search (desktop only) */}
          {!isMobile && (
            <div className="minside-header-search-container" style={{ flex: '0 1 auto' }}>
              <HeaderSearch
                placeholder={t('common.sok_i_bookinger_brukere')}
                value={searchQuery}
                onSearchChange={handleSearchChange}
                onResultSelect={handleResultSelect}
                results={searchResults}
                showShortcut
                enableGlobalShortcut
                noResultsText={t('common.ingen_resultater_funnet')}
              />
            </div>
          )}

          {/* Right zone - Actions */}
          <div style={{ flex: isMobile ? '1' : 'none', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
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
                        Logg ut
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              // Desktop: Full actions
              <HeaderActions spacing="var(--ds-spacing-2)">
                <HeaderThemeToggle
                  isDark={isDark}
                  onToggle={toggleTheme}
                />
                <NotificationBell
                  data-testid="notification-bell"
                  count={unreadCount}
                  onClick={openNotificationCenter}
                  aria-label={`Varsler${unreadCount > 0 ? ` (${unreadCount} uleste)` : ''}`}
                />
                <HeaderIconButton
                  icon={<SettingsIcon size={22} />}
                  size="md"
                  aria-label={t('monitoring.ariaLabel.settings')}
                  title={t('monitoring.title.settings')}
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
