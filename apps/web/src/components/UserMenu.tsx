/**
 * User Menu Component
 *
 * Displays a dropdown menu for logged-in users with options to:
 * - Go to minside (user portal)
 * - Logout
 */

import { useState, useRef, useEffect } from 'react';
import { Button } from '@xala/ds';
import { UserIcon, LogOutIcon } from '@xala/ds';
import { useT } from '@xala/i18n';

interface UserMenuProps {
  userName: string;
  onLogout: () => void;
  avatarUrl?: string;
}

// Chevron Down Icon (if not already in the icon set)
const ChevronDown = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export function UserMenu({ userName, onLogout, avatarUrl }: UserMenuProps) {
  const t = useT();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMinsideClick = () => {
    // Navigate to minside portal
    window.location.href = window.location.origin.replace('//web', '//minside').replace(':5173', ':5174');
    setIsOpen(false);
  };

  const handleLogoutClick = () => {
    setIsOpen(false);
    onLogout();
  };

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      <Button
        variant="primary"
        data-color="accent"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--ds-spacing-2)',
        }}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            style={{
              width: '20px',
              height: '20px',
              borderRadius: 'var(--ds-border-radius-full)',
              objectFit: 'cover',
            }}
          />
        ) : (
          <UserIcon size={20} aria-hidden />
        )}
        <span>{userName}</span>
        <ChevronDown size={16} />
      </Button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + var(--ds-spacing-2))',
            right: 0,
            minWidth: '200px',
            backgroundColor: 'var(--ds-color-neutral-surface-default)',
            borderRadius: 'var(--ds-border-radius-lg)',
            boxShadow: 'var(--ds-shadow-dropdown)',
            border: '1px solid var(--ds-color-neutral-border-default)',
            zIndex: 1000,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: 'var(--ds-spacing-2) 0',
            }}
          >
            {/* Minside Option */}
            <button
              type="button"
              onClick={handleMinsideClick}
              style={{
                width: '100%',
                padding: 'var(--ds-spacing-3) var(--ds-spacing-5)',
                border: 'none',
                backgroundColor: 'transparent',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--ds-spacing-3)',
                fontSize: 'var(--ds-font-size-md)',
                color: 'var(--ds-color-neutral-text-default)',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--ds-color-neutral-surface-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <UserIcon size={20} />
              <span>{t('minside.dashboard')}</span>
            </button>

            {/* Divider */}
            <div
              style={{
                height: '1px',
                backgroundColor: 'var(--ds-color-neutral-border-subtle)',
                margin: 'var(--ds-spacing-2) var(--ds-spacing-5)',
              }}
            />

            {/* Logout Option */}
            <button
              type="button"
              onClick={handleLogoutClick}
              style={{
                width: '100%',
                padding: 'var(--ds-spacing-3) var(--ds-spacing-5)',
                border: 'none',
                backgroundColor: 'transparent',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--ds-spacing-3)',
                fontSize: 'var(--ds-font-size-md)',
                color: 'var(--ds-color-danger-text-default)',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--ds-color-danger-surface-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <LogOutIcon size={20} />
              <span>{t('auth.logout')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
