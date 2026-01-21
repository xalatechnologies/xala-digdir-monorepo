import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Paragraph } from '@xalatechnologies/platform/ui';
import { useBackofficeRole } from '../hooks/useBackofficeRole';
import type { EffectiveBackofficeRole } from '../lib/capabilities';
import { useT } from '@xalatechnologies/platform/i18n';

/**
 * Role Switcher Component
 *
 * Dropdown button in header for switching between admin and case_handler roles.
 * Similar to AccountSwitcher in minside.
 *
 * Features:
 * - Shows current role (admin or case_handler)
 * - Dropdown menu with available roles
 * - Visual indication of active role (checkmark)
 * - Only shown to dual-role users
 */

// =============================================================================
// Icons
// =============================================================================

function AdminIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  );
}

function CaseHandlerIcon() {
  const t = useT();
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// =============================================================================
// Role Display Names
// =============================================================================

const ROLE_DISPLAY: Record<EffectiveBackofficeRole, { name: string; description: string }> = {
  admin: {
    name: 'Administrator',
    description: t('common.full_tilgang_til_alle'),
  },
  case_handler: {
    name: 'Saksbehandler',
    description: t('common.behandle_soknader_og_vedtak'),
  },
};

// =============================================================================
// Component
// =============================================================================

export function RoleSwitcher() {
  // Translation function available for future localization
  const _t = useT(); // eslint-disable-line @typescript-eslint/no-unused-vars
  const {
    effectiveRole,
    grantedRoles,
    setEffectiveRole,
  } = useBackofficeRole();

  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  // IMPORTANT: This hook must be called before any early returns to follow Rules of Hooks
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Don't show if no role is set yet (still initializing)
  if (!effectiveRole) {
    return null;
  }

  const handleRoleClick = (role: EffectiveBackofficeRole) => {
    if (role === effectiveRole) {
      setIsOpen(false);
      return;
    }

    setEffectiveRole(role);
    setIsOpen(false);

    // Navigate to the home route for the new role
    const homeRoute = role === 'case_handler' ? '/work-queue' : '/';
    navigate(homeRoute);
  };

  const currentRoleDisplay = ROLE_DISPLAY[effectiveRole];

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      {/* Dropdown Button */}
      <Button
        type="button"
        variant="secondary"
        data-size="sm"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--ds-spacing-2)',
          minWidth: '180px',
        }}
      >
        <div
          style={{
            width: '24px',
            height: '24px',
            borderRadius: 'var(--ds-border-radius-full)',
            backgroundColor:
              effectiveRole === 'admin'
                ? 'var(--ds-color-accent-surface-default)'
                : 'var(--ds-color-info-surface-default)',
            color:
              effectiveRole === 'admin'
                ? 'var(--ds-color-accent-base-default)'
                : 'var(--ds-color-info-base-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {effectiveRole === 'admin' ? <AdminIcon /> : <CaseHandlerIcon />}
        </div>
        <span
          style={{
            flex: 1,
            textAlign: 'left',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {currentRoleDisplay.name}
        </span>
        <ChevronDownIcon />
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + var(--ds-spacing-2))',
            left: 0,
            width: '280px',
            backgroundColor: 'var(--ds-color-neutral-background-default)',
            border: '1px solid var(--ds-color-neutral-border-default)',
            borderRadius: 'var(--ds-border-radius-md)',
            boxShadow: 'var(--ds-shadow-lg)',
            zIndex: 9999,
            isolation: 'isolate',
            backdropFilter: 'blur(8px)',
          }}
        >
          {/* Role Options */}
          <div style={{ padding: 'var(--ds-spacing-2) 0' }}>
            {grantedRoles.map((role) => {
              const roleDisplay = ROLE_DISPLAY[role];
              const isActive = role === effectiveRole;
              const isAdmin = role === 'admin';

              return (
                <Button
                  key={role}
                  type="button"
                  variant="tertiary"
                  onClick={() => handleRoleClick(role)}
                  style={{
                    all: 'unset',
                    width: '100%',
                    padding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--ds-spacing-3)',
                    cursor: 'pointer',
                    backgroundColor: isActive
                      ? isAdmin
                        ? 'var(--ds-color-accent-surface-default)'
                        : 'var(--ds-color-info-surface-default)'
                      : 'transparent',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'var(--ds-color-neutral-surface-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--ds-border-radius-full)',
                      backgroundColor: isAdmin
                        ? 'var(--ds-color-accent-surface-default)'
                        : 'var(--ds-color-info-surface-default)',
                      color: isAdmin
                        ? 'var(--ds-color-accent-base-default)'
                        : 'var(--ds-color-info-base-default)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {isAdmin ? <AdminIcon /> : <CaseHandlerIcon />}
                  </div>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <Paragraph
                      data-size="sm"
                      style={{
                        margin: 0,
                        fontWeight: 'var(--ds-font-weight-medium)',
                      }}
                    >
                      {roleDisplay.name}
                    </Paragraph>
                    <Paragraph
                      data-size="xs"
                      style={{
                        margin: 0,
                        marginTop: '2px',
                        color: 'var(--ds-color-neutral-text-subtle)',
                      }}
                    >
                      {roleDisplay.description}
                    </Paragraph>
                  </div>
                  {isActive && (
                    <div
                      style={{
                        color: isAdmin
                          ? 'var(--ds-color-accent-base-default)'
                          : 'var(--ds-color-info-base-default)',
                      }}
                    >
                      <CheckIcon />
                    </div>
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
