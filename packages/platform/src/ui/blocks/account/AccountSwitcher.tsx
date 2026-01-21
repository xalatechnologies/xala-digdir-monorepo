/**
 * Account Switcher Block
 *
 * Dropdown button for switching between personal and organization accounts.
 * Domain-agnostic - receives organization data via generic props.
 *
 * @example
 * ```tsx
 * const { accountType, organizations, switchToPersonal, switchToOrganization } = useAccountContext();
 *
 * <AccountSwitcher
 *   accountType={accountType}
 *   selectedOrganization={selectedOrganization}
 *   organizations={organizations}
 *   activeAccount={getActiveAccount()}
 *   onSwitchToPersonal={() => { switchToPersonal(); navigate('/'); }}
 *   onSwitchToOrganization={(orgId) => { switchToOrganization(orgId); navigate('/org'); }}
 *   onManageOrganizations={() => navigate('/settings')}
 * />
 * ```
 */

import { useState, useRef, useEffect } from 'react';
import { Button, Paragraph } from '@digdir/designsystemet-react';
import { UserIcon, BuildingIcon, CheckIcon, SettingsIcon } from '../../primitives/icons';

// =============================================================================
// Types
// =============================================================================

/**
 * Generic organization interface that can be used with any organization data
 */
export interface BaseOrganization {
  id: string;
  name: string;
  organizationNumber?: string;
}

export type AccountType = 'personal' | 'organization';

export interface ActiveAccount {
  type: AccountType;
  id: string;
  name: string;
  displayName: string;
}

export interface AccountSwitcherLabels {
  personal: string;
  organizations: string;
  manageOrganizations: string;
}

export interface AccountSwitcherProps<TOrganization extends BaseOrganization = BaseOrganization> {
  /** Current account type */
  accountType: AccountType;
  /** Currently selected organization (if organization mode) */
  selectedOrganization: TOrganization | null;
  /** List of available organizations */
  organizations: TOrganization[];
  /** Active account information */
  activeAccount: ActiveAccount;
  /** Callback when switching to personal account */
  onSwitchToPersonal: () => void;
  /** Callback when switching to organization account */
  onSwitchToOrganization: (organizationId: string) => void;
  /** Callback when clicking "Manage Organizations" */
  onManageOrganizations?: () => void;
  /** Minimum width of the button */
  minWidth?: string;
  /** Width of the dropdown menu */
  dropdownWidth?: string;
  /** Labels for i18n */
  labels?: Partial<AccountSwitcherLabels>;
}

// =============================================================================
// Default Labels
// =============================================================================

const DEFAULT_LABELS: AccountSwitcherLabels = {
  personal: 'Personlig konto',
  organizations: 'Organisasjoner',
  manageOrganizations: 'Administrer organisasjoner',
};

// =============================================================================
// Icons (TODO: Replace with DS icons when ChevronDownIcon is available)
// =============================================================================

function ChevronDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

// =============================================================================
// Component
// =============================================================================

export function AccountSwitcher<TOrganization extends BaseOrganization = BaseOrganization>({
  accountType,
  selectedOrganization,
  organizations,
  activeAccount,
  onSwitchToPersonal,
  onSwitchToOrganization,
  onManageOrganizations,
  minWidth = '220px',
  dropdownWidth = '340px',
  labels: customLabels,
}: AccountSwitcherProps<TOrganization>) {
  const labels = { ...DEFAULT_LABELS, ...customLabels };
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
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

  const handlePersonalClick = () => {
    onSwitchToPersonal();
    setIsOpen(false);
  };

  const handleOrganizationClick = (orgId: string) => {
    onSwitchToOrganization(orgId);
    setIsOpen(false);
  };

  const handleManageClick = () => {
    setIsOpen(false);
    if (onManageOrganizations) {
      onManageOrganizations();
    } else {
      window.location.href = '/settings';
    }
  };

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
          minWidth,
        }}
      >
        <div
          style={{
            width: '24px',
            height: '24px',
            borderRadius: 'var(--ds-border-radius-full)',
            backgroundColor:
              accountType === 'personal'
                ? 'var(--ds-color-accent-surface-default)'
                : 'var(--ds-color-success-surface-default)',
            color:
              accountType === 'personal'
                ? 'var(--ds-color-accent-base-default)'
                : 'var(--ds-color-success-base-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {accountType === 'personal' ? <UserIcon size={20} /> : <BuildingIcon size={20} />}
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
          {activeAccount.displayName}
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
            width: dropdownWidth,
            backgroundColor: 'var(--ds-color-neutral-background-default)',
            border: '1px solid var(--ds-color-neutral-border-default)',
            borderRadius: 'var(--ds-border-radius-md)',
            boxShadow: 'var(--ds-shadow-large)',
            zIndex: 1000,
            maxHeight: '400px',
            overflowY: 'auto',
          }}
        >
          {/* Personal Option */}
          <div style={{ padding: 'var(--ds-spacing-2) 0' }}>
            <Button
              type="button"
              variant="tertiary"
              onClick={handlePersonalClick}
              style={{
                all: 'unset',
                width: '100%',
                padding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--ds-spacing-3)',
                cursor: 'pointer',
                backgroundColor:
                  accountType === 'personal'
                    ? 'var(--ds-color-accent-surface-default)'
                    : 'transparent',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                if (accountType !== 'personal') {
                  e.currentTarget.style.backgroundColor = 'var(--ds-color-neutral-surface-hover)';
                }
              }}
              onMouseLeave={(e) => {
                if (accountType !== 'personal') {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--ds-border-radius-full)',
                  backgroundColor: 'var(--ds-color-accent-surface-default)',
                  color: 'var(--ds-color-accent-base-default)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <UserIcon size={20} />
              </div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                  {labels.personal}
                </Paragraph>
              </div>
              {accountType === 'personal' && (
                <div style={{ color: 'var(--ds-color-accent-base-default)' }}>
                  <CheckIcon size={16} />
                </div>
              )}
            </Button>
          </div>

          {/* Divider */}
          {organizations.length > 0 && (
            <div
              style={{
                height: '1px',
                backgroundColor: 'var(--ds-color-neutral-border-subtle)',
                margin: '0 var(--ds-spacing-2)',
              }}
            />
          )}

          {/* Organizations */}
          {organizations.length > 0 && (
            <div style={{ padding: 'var(--ds-spacing-2) 0' }}>
              <div
                style={{
                  padding: 'var(--ds-spacing-2) var(--ds-spacing-4)',
                }}
              >
                <Paragraph
                  data-size="xs"
                  style={{
                    margin: 0,
                    color: 'var(--ds-color-neutral-text-subtle)',
                    textTransform: 'uppercase',
                    letterSpacing: 'var(--ds-font-letter-spacing-wide)',
                    fontWeight: 'var(--ds-font-weight-semibold)',
                  }}
                >
                  {labels.organizations}
                </Paragraph>
              </div>
              {organizations.map((org) => (
                <Button
                  key={org.id}
                  type="button"
                  variant="tertiary"
                  onClick={() => handleOrganizationClick(org.id)}
                  style={{
                    all: 'unset',
                    width: '100%',
                    padding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--ds-spacing-3)',
                    cursor: 'pointer',
                    backgroundColor:
                      accountType === 'organization' && selectedOrganization?.id === org.id
                        ? 'var(--ds-color-success-surface-default)'
                        : 'transparent',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (!(accountType === 'organization' && selectedOrganization?.id === org.id)) {
                      e.currentTarget.style.backgroundColor = 'var(--ds-color-neutral-surface-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!(accountType === 'organization' && selectedOrganization?.id === org.id)) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--ds-border-radius-md)',
                      backgroundColor: 'var(--ds-color-success-surface-default)',
                      color: 'var(--ds-color-success-base-default)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <BuildingIcon size={20} />
                  </div>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <Paragraph
                      data-size="sm"
                      style={{
                        margin: 0,
                        fontWeight: 'var(--ds-font-weight-medium)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {org.name}
                    </Paragraph>
                    {org.organizationNumber && (
                      <Paragraph
                        data-size="xs"
                        style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}
                      >
                        {org.organizationNumber}
                      </Paragraph>
                    )}
                  </div>
                  {accountType === 'organization' && selectedOrganization?.id === org.id && (
                    <div style={{ color: 'var(--ds-color-success-base-default)' }}>
                      <CheckIcon size={16} />
                    </div>
                  )}
                </Button>
              ))}
            </div>
          )}

          {/* Divider */}
          <div
            style={{
              height: '1px',
              backgroundColor: 'var(--ds-color-neutral-border-subtle)',
              margin: '0 var(--ds-spacing-2)',
            }}
          />

          {/* Manage Organizations Link */}
          <div style={{ padding: 'var(--ds-spacing-2)' }}>
            <Button
              type="button"
              variant="tertiary"
              onClick={handleManageClick}
              style={{
                all: 'unset',
                width: '100%',
                padding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--ds-spacing-3)',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--ds-color-neutral-surface-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--ds-color-neutral-text-subtle)',
                }}
              >
                <SettingsIcon size={16} />
              </div>
              <Paragraph
                data-size="sm"
                style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}
              >
                {labels.manageOrganizations}
              </Paragraph>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
