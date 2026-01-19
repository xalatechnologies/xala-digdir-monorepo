/**
 * DemoRoleSwitcher Component
 * 
 * Role-based demo login switcher that replaces manual token entry.
 * Shows role options as buttons - clicking logs in as that role.
 * 
 * Features:
 * - One-click demo login per role
 * - No manual token entry required
 * - SSR/hydration safe
 * - Keyboard accessible (arrow navigation, ESC to close)
 * - Uses Designsystemet components only
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button, Paragraph, Spinner } from '@digdir/designsystemet-react';
import { Dialog } from '@digdir/designsystemet-react';
import { Stack } from '../primitives';
import {
  ShieldCheckIcon,
  ClipboardListIcon,
  BuildingIcon,
  UserIcon,
} from '../primitives/icons';

export type DemoRoleKey = 'admin' | 'case_handler' | 'org_admin' | 'org_member';

export interface DemoRoleOption {
  key: DemoRoleKey;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

export interface DemoRoleSwitcherProps {
  open: boolean;
  onClose: () => void;
  onRoleSelect: (key: DemoRoleKey) => Promise<void>;
  title?: string;
  description?: string;
  cancelText?: string;
  options?: DemoRoleOption[];
  loadingRole?: DemoRoleKey | null;
  error?: string | null;
}

const DEFAULT_ROLE_OPTIONS: DemoRoleOption[] = [
  {
    key: 'admin',
    label: 'Administrator',
    description: 'Full tilgang til alle funksjoner og innstillinger',
  },
  {
    key: 'case_handler',
    label: 'Saksbehandler',
    description: 'Håndterer bookinger og henvendelser',
  },
  {
    key: 'org_admin',
    label: 'Organisasjonsadmin',
    description: 'Administrerer egen organisasjon',
  },
  {
    key: 'org_member',
    label: 'Organisasjonsmedlem',
    description: 'Vanlig bruker i en organisasjon',
  },
];

const ROLE_ICONS: Record<DemoRoleKey, React.ComponentType<{ size?: number }>> = {
  admin: ShieldCheckIcon,
  case_handler: ClipboardListIcon,
  org_admin: BuildingIcon,
  org_member: UserIcon,
};

export function DemoRoleSwitcher({
  open,
  onClose,
  onRoleSelect,
  title = 'Demo-innlogging',
  description = 'Velg en rolle for å logge inn som demo-bruker.',
  cancelText = 'Avbryt',
  options = DEFAULT_ROLE_OPTIONS,
  loadingRole = null,
  error = null,
}: DemoRoleSwitcherProps): React.ReactElement {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleClose = useCallback(() => {
    if (!loadingRole) {
      onClose();
    }
  }, [loadingRole, onClose]);

  const handleRoleClick = useCallback(
    async (key: DemoRoleKey) => {
      if (loadingRole) return;
      await onRoleSelect(key);
    },
    [loadingRole, onRoleSelect]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (loadingRole) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((prev) => (prev + 1) % options.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((prev) => (prev - 1 + options.length) % options.length);
          break;
        case 'Escape':
          e.preventDefault();
          handleClose();
          break;
      }
    },
    [loadingRole, options.length, handleClose]
  );

  useEffect(() => {
    if (open && buttonRefs.current[focusedIndex]) {
      buttonRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex, open]);

  useEffect(() => {
    if (open) {
      setFocusedIndex(0);
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={handleClose} title={title}>
      <div onKeyDown={handleKeyDown} role="menu" aria-label={title}>
        <Stack direction="vertical" spacing={16}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
            {description}
          </Paragraph>

          {error && (
            <div
              style={{
                padding: 'var(--ds-spacing-3)',
                backgroundColor: 'var(--ds-color-danger-surface-default)',
                borderRadius: 'var(--ds-border-radius-md)',
                color: 'var(--ds-color-danger-text-default)',
              }}
              role="alert"
            >
              <Paragraph data-size="sm" style={{ margin: 0 }}>
                {error}
              </Paragraph>
            </div>
          )}

          <Stack direction="vertical" spacing={8}>
            {options.map((option, index) => {
              const IconComponent = option.icon || ROLE_ICONS[option.key];
              const isLoading = loadingRole === option.key;
              const isDisabled = loadingRole !== null;

              return (
                <Button
                  key={option.key}
                  ref={(el) => {
                    buttonRefs.current[index] = el;
                  }}
                  data-testid={`demo-login-option-${option.key}`}
                  type="button"
                  variant="secondary"
                  onClick={() => handleRoleClick(option.key)}
                  disabled={isDisabled && !isLoading}
                  role="menuitem"
                  aria-selected={focusedIndex === index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--ds-spacing-3)',
                    width: '100%',
                    padding: 'var(--ds-spacing-3)',
                    height: 'auto',
                    textAlign: 'left',
                    justifyContent: 'flex-start',
                    opacity: isDisabled && !isLoading ? 0.6 : 1,
                  }}
                >
                  <div
                    style={{
                      flexShrink: 0,
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isLoading ? (
                      <Spinner data-size="sm" aria-label="Logger inn..." />
                    ) : (
                      typeof IconComponent === 'function' ? <IconComponent size={24} /> : IconComponent
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <Paragraph
                      data-size="sm"
                      style={{
                        fontWeight: 'var(--ds-font-weight-medium)',
                        color: 'var(--ds-color-neutral-text-default)',
                        margin: 0,
                      }}
                    >
                      {option.label}
                    </Paragraph>
                    {option.description && (
                      <Paragraph
                        data-size="xs"
                        style={{
                          color: 'var(--ds-color-neutral-text-subtle)',
                          margin: 0,
                          marginTop: 'var(--ds-spacing-1)',
                        }}
                      >
                        {option.description}
                      </Paragraph>
                    )}
                  </div>
                </Button>
              );
            })}
          </Stack>

          <div
            style={{
              marginTop: 'var(--ds-spacing-2)',
              paddingTop: 'var(--ds-spacing-4)',
              borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <Button
              data-testid="demo-login-cancel"
              type="button"
              variant="tertiary"
              onClick={handleClose}
              disabled={loadingRole !== null}
            >
              {cancelText}
            </Button>
          </div>
        </Stack>
      </div>
    </Dialog>
  );
}

export default DemoRoleSwitcher;
