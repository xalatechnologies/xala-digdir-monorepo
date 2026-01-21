/**
 * DashboardHeader
 *
 * Reusable sticky header for dashboard applications.
 * Features: search, notifications, theme toggle, user menu.
 *
 * @example
 * ```tsx
 * <DashboardHeader
 *   logo={<img src="/logo.svg" alt="App" />}
 *   user={{ name: 'John Doe', email: 'john@example.com' }}
 *   onSearch={(query) => handleSearch(query)}
 *   onLogout={() => logout()}
 *   showThemeToggle
 *   showNotifications
 *   notificationCount={3}
 * />
 * ```
 */

import * as React from 'react';
import { forwardRef, useState, useEffect, useRef, useCallback } from 'react';
import { Button, Paragraph } from '@digdir/designsystemet-react';
import { HeaderSearch, type SearchResultItem, type SearchResultGroup } from './header-parts';
import { HeaderThemeToggle } from './header-parts';
import { NotificationBell } from '../blocks/NotificationBell';
import { UserIcon, SettingsIcon, LogOutIcon } from '../primitives/icons';
import { cn } from '../utils';

// =============================================================================
// Types
// =============================================================================

export interface DashboardHeaderUser {
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface DashboardHeaderProps extends React.HTMLAttributes<HTMLElement> {
  /** Logo element (shown on mobile) */
  logo?: React.ReactNode;

  /** Left slot content (e.g., AccountSwitcher on desktop) */
  leftSlot?: React.ReactNode;

  /** Current user info */
  user?: DashboardHeaderUser | null;

  /** Search placeholder text */
  searchPlaceholder?: string;

  /** Search results */
  searchResults?: SearchResultGroup[];

  /** Search query value (controlled) */
  searchValue?: string;

  /** Callback when search value changes */
  onSearchChange?: (value: string) => void;

  /** Callback when search result is selected */
  onSearchResultSelect?: (result: SearchResultItem) => void;

  /** No search results text */
  noSearchResultsText?: string;

  /** Whether to show search on mobile */
  showMobileSearch?: boolean;

  /** Whether to show theme toggle */
  showThemeToggle?: boolean;

  /** Current theme (for theme toggle) */
  isDark?: boolean;

  /** Theme toggle callback */
  onThemeToggle?: () => void;

  /** Whether to show notifications */
  showNotifications?: boolean;

  /** Unread notification count */
  notificationCount?: number;

  /** Notification click callback */
  onNotificationClick?: () => void;

  /** Logout callback */
  onLogout?: () => void;

  /** Settings click callback */
  onSettingsClick?: () => void;

  /** Profile click callback */
  onProfileClick?: () => void;

  /** Custom action buttons */
  actions?: React.ReactNode;

  /** Height in pixels */
  height?: number;

  /** Test ID */
  'data-testid'?: string;
}

// =============================================================================
// Constants
// =============================================================================

const MOBILE_BREAKPOINT = 768;

// =============================================================================
// UserAvatar Component
// =============================================================================

interface UserAvatarProps {
  user: DashboardHeaderUser;
  size?: number;
}

function UserAvatar({ user, size = 32 }: UserAvatarProps) {
  if (user.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.name}
        style={{
          width: size,
          height: size,
          borderRadius: 'var(--ds-border-radius-full)',
          objectFit: 'cover',
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 'var(--ds-border-radius-full)',
        backgroundColor: 'var(--ds-color-accent-surface-default)',
        color: 'var(--ds-color-accent-text-default)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size > 30 ? 'var(--ds-font-size-sm)' : 'var(--ds-font-size-xs)',
        fontWeight: 'var(--ds-font-weight-semibold)',
      }}
    >
      {user.name?.charAt(0).toUpperCase() || <UserIcon size={size * 0.5} />}
    </div>
  );
}

// =============================================================================
// UserMenuDropdown Component
// =============================================================================

interface UserMenuDropdownProps {
  user: DashboardHeaderUser;
  onLogout?: () => void;
  onSettingsClick?: () => void;
  onProfileClick?: () => void;
  onClose: () => void;
}

function UserMenuDropdown({
  user,
  onLogout,
  onSettingsClick,
  onProfileClick,
  onClose,
}: UserMenuDropdownProps) {
  const menuItems = [
    onProfileClick && { label: 'Profil', icon: <UserIcon size={18} />, onClick: onProfileClick },
    onSettingsClick && { label: 'Innstillinger', icon: <SettingsIcon size={18} />, onClick: onSettingsClick },
    onLogout && { label: 'Logg ut', icon: <LogOutIcon size={18} />, onClick: onLogout },
  ].filter(Boolean) as Array<{ label: string; icon: React.ReactNode; onClick: () => void }>;

  return (
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
        minWidth: '220px',
        overflow: 'hidden',
        zIndex: 1000,
      }}
    >
      {/* User info */}
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

      {/* Menu items */}
      <div style={{ padding: 'var(--ds-spacing-2)' }}>
        {menuItems.map((item, index) => (
          <button
            key={index}
            type="button"
            onClick={() => {
              item.onClick();
              onClose();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--ds-spacing-3)',
              width: '100%',
              padding: 'var(--ds-spacing-3)',
              minHeight: '44px',
              border: 'none',
              backgroundColor: 'transparent',
              borderRadius: 'var(--ds-border-radius-md)',
              cursor: 'pointer',
              fontSize: 'var(--ds-font-size-sm)',
              color: 'var(--ds-color-neutral-text-default)',
              textAlign: 'left',
            }}
            className="ds-user-menu-item"
          >
            <span style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      {/* Hover styles */}
      <style>{`
        .ds-user-menu-item:hover {
          background-color: var(--ds-color-neutral-surface-hover) !important;
        }
      `}</style>
    </div>
  );
}

// =============================================================================
// DashboardHeader Component
// =============================================================================

export const DashboardHeader = forwardRef<HTMLElement, DashboardHeaderProps>(
  (
    {
      logo,
      leftSlot,
      user,
      searchPlaceholder = 'Søk...',
      searchResults = [],
      searchValue,
      onSearchChange,
      onSearchResultSelect,
      noSearchResultsText = 'Ingen resultater funnet',
      showMobileSearch = false,
      showThemeToggle = true,
      isDark = false,
      onThemeToggle,
      showNotifications = true,
      notificationCount = 0,
      onNotificationClick,
      onLogout,
      onSettingsClick,
      onProfileClick,
      actions,
      height = 72,
      className,
      'data-testid': testId = 'dashboard-header',
      ...props
    },
    ref
  ) => {
    const [isMobile, setIsMobile] = useState(
      typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
    );
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [internalSearchValue, setInternalSearchValue] = useState('');
    const userMenuRef = useRef<HTMLDivElement>(null);

    const searchQuery = searchValue ?? internalSearchValue;

    // Track viewport size
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

    const handleSearchChange = useCallback((value: string) => {
      if (searchValue === undefined) {
        setInternalSearchValue(value);
      }
      onSearchChange?.(value);
    }, [searchValue, onSearchChange]);

    return (
      <>
        <style>{`
          .ds-header-search-container {
            display: flex;
            justify-content: center;
            width: 100%;
          }
          @media (min-width: 768px) and (max-width: 900px) {
            .ds-header-search-container { max-width: 400px; }
          }
          @media (min-width: 901px) and (max-width: 1100px) {
            .ds-header-search-container { max-width: 500px; }
          }
          @media (min-width: 1101px) {
            .ds-header-search-container { max-width: 650px; }
          }
        `}</style>

        <header
          ref={ref as React.RefObject<HTMLElement>}
          className={cn('ds-dashboard-header', className)}
          data-testid={testId}
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            backgroundColor: 'var(--ds-color-neutral-surface-default)',
            borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
            boxShadow: 'var(--ds-shadow-xs)',
          }}
          {...props}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: `${height}px`,
              padding: '0 var(--ds-spacing-6)',
              position: 'relative',
            }}
          >
            {/* Left zone - Logo/AccountSwitcher */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)', flexShrink: 0, zIndex: 1 }}>
              {isMobile && logo}
              {!isMobile && leftSlot}
            </div>

            {/* Center zone - Search (absolute center) */}
            {!isMobile && onSearchChange && (
              <div 
                className="ds-header-search-container" 
                style={{ 
                  position: 'absolute',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '100%',
                  maxWidth: '500px',
                  display: 'flex',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                }}
              >
                <div style={{ width: '100%', pointerEvents: 'auto' }}>
                  <HeaderSearch
                    placeholder={searchPlaceholder}
                    value={searchQuery}
                    onSearchChange={handleSearchChange}
                    onResultSelect={onSearchResultSelect}
                    results={searchResults}
                    showShortcut
                    enableGlobalShortcut
                    noResultsText={noSearchResultsText}
                  />
                </div>
              </div>
            )}

            {/* Right zone - Actions, Icons & User Profile */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--ds-spacing-2)',
                flexShrink: 0,
                zIndex: 1,
              }}
            >
              {/* Custom actions */}
              {actions}

              {/* Theme toggle */}
              {showThemeToggle && onThemeToggle && (
                <HeaderThemeToggle isDark={isDark} onToggle={onThemeToggle} />
              )}

              {/* Notifications */}
              {showNotifications && onNotificationClick && (
                <NotificationBell count={notificationCount} onClick={onNotificationClick} />
              )}

              {/* User profile dropdown - rightmost */}
              {user && (
                <div ref={userMenuRef} style={{ position: 'relative' }}>
                  <Button
                    type="button"
                    variant="tertiary"
                    data-size="md"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    aria-label={`${user.name} menu`}
                    aria-expanded={isUserMenuOpen}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--ds-spacing-2)',
                      padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                    }}
                  >
                    <UserAvatar user={user} />
                    <span style={{ 
                      fontWeight: 'var(--ds-font-weight-medium)',
                      fontSize: 'var(--ds-font-size-sm)',
                      display: isMobile ? 'none' : 'inline',
                    }}>
                      {user.name}
                    </span>
                  </Button>
                  
                  {isUserMenuOpen && (
                    <UserMenuDropdown
                      user={user}
                      onLogout={onLogout}
                      onSettingsClick={onSettingsClick}
                      onProfileClick={onProfileClick}
                      onClose={() => setIsUserMenuOpen(false)}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </header>
      </>
    );
  }
);

DashboardHeader.displayName = 'DashboardHeader';

export default DashboardHeader;
