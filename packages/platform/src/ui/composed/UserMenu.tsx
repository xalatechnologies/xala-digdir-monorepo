/**
 * UserMenu
 *
 * A dropdown menu for authenticated users.
 * Displays user info and provides navigation/logout options.
 *
 * @example
 * ```tsx
 * <UserMenu
 *   user={{ name: 'John Doe', email: 'john@example.com' }}
 *   items={[
 *     { id: 'profile', label: 'Min profil', href: '/profile' },
 *     { id: 'settings', label: 'Innstillinger', href: '/settings' },
 *   ]}
 *   onLogout={handleLogout}
 *   data-testid="user-menu"
 * />
 * ```
 */

import * as React from 'react';
import { forwardRef, useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@digdir/designsystemet-react';
import { cn } from '../utils';

// Icons
const UserIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const ChevronDownIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const LogOutIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

/**
 * Menu item definition
 */
export interface UserMenuItem {
  /**
   * Unique identifier
   */
  id: string;

  /**
   * Display label
   */
  label: string;

  /**
   * Navigation href (optional)
   */
  href?: string;

  /**
   * Click handler (optional)
   */
  onClick?: () => void;

  /**
   * Icon element (optional)
   */
  icon?: React.ReactNode;

  /**
   * Whether this is a danger/destructive action
   * @default false
   */
  danger?: boolean;

  /**
   * Whether this item is disabled
   * @default false
   */
  disabled?: boolean;
}

/**
 * User object
 */
export interface UserMenuUser {
  /**
   * User display name
   */
  name: string;

  /**
   * User email (optional)
   */
  email?: string;

  /**
   * Avatar URL (optional)
   */
  avatarUrl?: string;
}

export interface UserMenuProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /**
   * User object with name, email, and optional avatar
   */
  user: UserMenuUser;

  /**
   * Custom menu items
   */
  items?: UserMenuItem[];

  /**
   * Logout handler
   */
  onLogout: () => void;

  /**
   * Logout button label
   * @default 'Logg ut'
   */
  logoutLabel?: string;

  /**
   * Whether to show the logout option
   * @default true
   */
  showLogout?: boolean;

  /**
   * Test ID for E2E testing
   */
  'data-testid'?: string;
}

/**
 * UserMenu Component
 *
 * Displays a dropdown menu for authenticated users with customizable items
 * and a logout option.
 */
export const UserMenu = forwardRef<HTMLDivElement, UserMenuProps>(
  (
    {
      user,
      items = [],
      onLogout,
      logoutLabel = 'Logg ut',
      showLogout = true,
      className,
      'data-testid': testId,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [focusedIndex, setFocusedIndex] = useState(-1);

    // Get all focusable items (including logout)
    const allItems: (UserMenuItem | { id: 'logout'; label: string; danger: true })[] = [
      ...items,
      ...(showLogout ? [{ id: 'logout' as const, label: logoutLabel, danger: true as const }] : []),
    ];

    // Close menu when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
          setIsOpen(false);
          setFocusedIndex(-1);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen]);

    // Handle escape key
    useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && isOpen) {
          setIsOpen(false);
          setFocusedIndex(-1);
          buttonRef.current?.focus();
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen]);

    // Handle keyboard navigation
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (!isOpen) return;

        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            setFocusedIndex((prev) => (prev < allItems.length - 1 ? prev + 1 : 0));
            break;
          case 'ArrowUp':
            e.preventDefault();
            setFocusedIndex((prev) => (prev > 0 ? prev - 1 : allItems.length - 1));
            break;
          case 'Home':
            e.preventDefault();
            setFocusedIndex(0);
            break;
          case 'End':
            e.preventDefault();
            setFocusedIndex(allItems.length - 1);
            break;
          case 'Enter':
          case ' ':
            e.preventDefault();
            if (focusedIndex >= 0) {
              const item = allItems[focusedIndex];
              if (item) {
                handleItemClick(item);
              }
            }
            break;
          case 'Tab':
            setIsOpen(false);
            setFocusedIndex(-1);
            break;
        }
      },
      [isOpen, focusedIndex, allItems]
    );

    const handleItemClick = (item: UserMenuItem | { id: 'logout'; label: string; danger: true }) => {
      if ('onClick' in item && item.onClick) {
        item.onClick();
      } else if (item.id === 'logout') {
        onLogout();
      } else if ('href' in item && item.href) {
        window.location.href = item.href;
      }
      setIsOpen(false);
      setFocusedIndex(-1);
    };

    const toggleMenu = () => {
      setIsOpen((prev) => !prev);
      if (!isOpen) {
        setFocusedIndex(0);
      }
    };

    // Combine refs
    const combinedRef = useCallback(
      (node: HTMLDivElement | null) => {
        // Update local ref
        (menuRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        // Forward to external ref
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }
      },
      [ref]
    );

    return (
      <div
        ref={combinedRef}
        className={cn('ds-user-menu', className)}
        data-testid={testId}
        onKeyDown={handleKeyDown}
        style={{ position: 'relative' }}
        {...props}
      >
        {/* Trigger Button */}
        <Button
          ref={buttonRef}
          variant="primary"
          data-color="accent"
          type="button"
          onClick={toggleMenu}
          aria-expanded={isOpen}
          aria-haspopup="menu"
          aria-controls={isOpen ? 'user-menu-dropdown' : undefined}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--ds-spacing-2)',
          }}
          data-testid={testId ? `${testId}-trigger` : undefined}
        >
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt=""
              style={{
                width: '20px',
                height: '20px',
                borderRadius: 'var(--ds-border-radius-full)',
                objectFit: 'cover',
              }}
            />
          ) : (
            <UserIcon size={20} />
          )}
          <span>{user.name}</span>
          <ChevronDownIcon size={16} />
        </Button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            id="user-menu-dropdown"
            role="menu"
            aria-label="Brukermeny"
            style={{
              position: 'absolute',
              top: 'calc(100% + var(--ds-spacing-2))',
              right: 0,
              minWidth: '220px',
              backgroundColor: 'var(--ds-color-neutral-surface-default)',
              borderRadius: 'var(--ds-border-radius-lg)',
              boxShadow: 'var(--ds-shadow-lg)',
              border: '1px solid var(--ds-color-neutral-border-default)',
              zIndex: 1000,
              overflow: 'hidden',
              animation: 'ds-menu-enter 0.15s ease-out',
            }}
            data-testid={testId ? `${testId}-dropdown` : undefined}
          >
            <style>{`
              @keyframes ds-menu-enter {
                from { opacity: 0; transform: translateY(-8px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}</style>

            {/* User Info Header */}
            <div
              style={{
                padding: 'var(--ds-spacing-4)',
                borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
              }}
            >
              <div
                style={{
                  fontSize: 'var(--ds-font-size-md)',
                  fontWeight: 'var(--ds-font-weight-semibold)' as unknown as number,
                  color: 'var(--ds-color-neutral-text-default)',
                }}
              >
                {user.name}
              </div>
              {user.email && (
                <div
                  style={{
                    fontSize: 'var(--ds-font-size-sm)',
                    color: 'var(--ds-color-neutral-text-subtle)',
                    marginTop: 'var(--ds-spacing-1)',
                  }}
                >
                  {user.email}
                </div>
              )}
            </div>

            {/* Menu Items */}
            <div style={{ padding: 'var(--ds-spacing-2) 0' }}>
              {items.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  onClick={() => handleItemClick(item)}
                  tabIndex={focusedIndex === index ? 0 : -1}
                  style={{
                    width: '100%',
                    padding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
                    border: 'none',
                    backgroundColor:
                      focusedIndex === index
                        ? 'var(--ds-color-neutral-surface-hover)'
                        : 'transparent',
                    textAlign: 'left',
                    cursor: item.disabled ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--ds-spacing-3)',
                    fontSize: 'var(--ds-font-size-md)',
                    color: item.danger
                      ? 'var(--ds-color-danger-text-default)'
                      : 'var(--ds-color-neutral-text-default)',
                    opacity: item.disabled ? 0.5 : 1,
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={() => setFocusedIndex(index)}
                  data-testid={testId ? `${testId}-item-${item.id}` : undefined}
                >
                  {item.icon && <span style={{ display: 'flex' }}>{item.icon}</span>}
                  <span>{item.label}</span>
                </button>
              ))}

              {/* Divider before logout */}
              {showLogout && items.length > 0 && (
                <div
                  style={{
                    height: '1px',
                    backgroundColor: 'var(--ds-color-neutral-border-subtle)',
                    margin: 'var(--ds-spacing-2) var(--ds-spacing-4)',
                  }}
                />
              )}

              {/* Logout */}
              {showLogout && (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => handleItemClick({ id: 'logout', label: logoutLabel, danger: true })}
                  tabIndex={focusedIndex === items.length ? 0 : -1}
                  style={{
                    width: '100%',
                    padding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
                    border: 'none',
                    backgroundColor:
                      focusedIndex === items.length
                        ? 'var(--ds-color-danger-surface-hover)'
                        : 'transparent',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--ds-spacing-3)',
                    fontSize: 'var(--ds-font-size-md)',
                    color: 'var(--ds-color-danger-text-default)',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={() => setFocusedIndex(items.length)}
                  data-testid={testId ? `${testId}-logout` : undefined}
                >
                  <LogOutIcon size={20} />
                  <span>{logoutLabel}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

UserMenu.displayName = 'UserMenu';

export default UserMenu;
