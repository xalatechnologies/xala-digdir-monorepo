/**
 * BookingContextSelector Component
 *
 * Allows users to choose whether to book as an individual (private)
 * or on behalf of an organization they are a member of.
 *
 * This affects:
 * - Pricing (org members may get different rates)
 * - Invoice recipient
 * - Calendar visibility rules
 * - Approval workflow (some orgs have auto-approval)
 */

import * as React from 'react';
import { Paragraph, Spinner } from '@xala/ds';
import { useT } from '@xala/i18n';
import { useMyOrgMemberships } from '@digilist/client-sdk/hooks';

// =============================================================================
// Types
// =============================================================================

export type BookingContextType = 'PRIVATE' | 'ORGANIZATION';

export interface BookingContext {
  type: BookingContextType;
  organizationId?: string;
  organizationName?: string;
}

export interface OrganizationMembership {
  id: string;
  organizationId: string;
  organizationName: string;
  role: string;
  canBookOnBehalf: boolean;
}

export interface BookingContextSelectorProps {
  /** Currently selected context */
  value: BookingContext;
  /** Callback when context changes */
  onChange: (context: BookingContext) => void;
  /** Whether the selector is disabled */
  disabled?: boolean;
  /** Custom class name */
  className?: string;
}

// =============================================================================
// Icons
// =============================================================================

function UserIcon({ size = 20 }: { size?: number }): React.ReactElement {
  return (
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
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function BuildingIcon({ size = 20 }: { size?: number }): React.ReactElement {
  return (
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
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <line x1="8" y1="6" x2="8" y2="6" />
      <line x1="16" y1="6" x2="16" y2="6" />
      <line x1="12" y1="6" x2="12" y2="6" />
      <line x1="8" y1="10" x2="8" y2="10" />
      <line x1="16" y1="10" x2="16" y2="10" />
      <line x1="12" y1="10" x2="12" y2="10" />
      <line x1="8" y1="14" x2="8" y2="14" />
      <line x1="16" y1="14" x2="16" y2="14" />
      <line x1="12" y1="14" x2="12" y2="14" />
    </svg>
  );
}

function CheckIcon({ size = 16 }: { size?: number }): React.ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// =============================================================================
// Component
// =============================================================================

export function BookingContextSelector({
  value,
  onChange,
  disabled = false,
  className,
}: BookingContextSelectorProps): React.ReactElement {
  const t = useT();

  // Fetch user's organization memberships from SDK
  const { data: membershipsData, isLoading } = useMyOrgMemberships();
  const memberships = membershipsData?.data ?? [];

  // Filter to orgs where user can book on behalf
  const bookableOrgs = memberships.filter(
    (m: OrganizationMembership) => m.canBookOnBehalf !== false
  );

  const handleSelect = (type: BookingContextType, org?: OrganizationMembership) => {
    if (type === 'PRIVATE') {
      onChange({ type: 'PRIVATE' });
    } else if (org) {
      onChange({
        type: 'ORGANIZATION',
        organizationId: org.organizationId,
        organizationName: org.organizationName,
      });
    }
  };

  const isPrivateSelected = value.type === 'PRIVATE';

  return (
    <div className={className}>
      <Paragraph
        data-size="sm"
        style={{
          margin: 0,
          marginBottom: 'var(--ds-spacing-3)',
          fontWeight: 'var(--ds-font-weight-medium)',
          color: 'var(--ds-color-neutral-text-default)',
        }}
      >
        Booker du for deg selv eller en organisasjon?
      </Paragraph>

      <fieldset
        style={{
          border: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--ds-spacing-2)',
        }}
      >
        <legend className="sr-only">Velg bookingkontekst</legend>

        {/* Private Option */}
        <button
          type="button"
          onClick={() => handleSelect('PRIVATE')}
          disabled={disabled}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--ds-spacing-3)',
            padding: 'var(--ds-spacing-4)',
            borderRadius: 'var(--ds-border-radius-md)',
            backgroundColor: isPrivateSelected
              ? 'var(--ds-color-accent-surface-default)'
              : 'var(--ds-color-neutral-surface-default)',
            border: isPrivateSelected
              ? '2px solid var(--ds-color-accent-border-default)'
              : '1px solid var(--ds-color-neutral-border-subtle)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.6 : 1,
            transition: 'all 0.15s ease',
            width: '100%',
            textAlign: 'left',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--ds-border-radius-full)',
              backgroundColor: isPrivateSelected
                ? 'var(--ds-color-accent-base-default)'
                : 'var(--ds-color-neutral-surface-hover)',
              color: isPrivateSelected
                ? 'white'
                : 'var(--ds-color-neutral-text-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <UserIcon />
          </div>

          <div style={{ flex: 1 }}>
            <Paragraph
              data-size="sm"
              style={{
                margin: 0,
                fontWeight: 'var(--ds-font-weight-medium)',
                color: isPrivateSelected
                  ? 'var(--ds-color-accent-text-default)'
                  : 'var(--ds-color-neutral-text-default)',
              }}
            >
              Meg selv (privatperson)
            </Paragraph>
            <Paragraph
              data-size="xs"
              style={{
                margin: 0,
                marginTop: 'var(--ds-spacing-1)',
                color: 'var(--ds-color-neutral-text-subtle)',
              }}
            >
              Book som privatperson
            </Paragraph>
          </div>

          {isPrivateSelected && (
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: 'var(--ds-border-radius-full)',
                backgroundColor: 'var(--ds-color-success-base-default)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckIcon />
            </div>
          )}
        </button>

        {/* Organization Options */}
        {isLoading ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--ds-spacing-4)',
              color: 'var(--ds-color-neutral-text-subtle)',
            }}
          >
            <Spinner data-size="sm" />
            <Paragraph data-size="sm" style={{ margin: 0, marginLeft: 'var(--ds-spacing-2)' }}>
              Laster organisasjoner...
            </Paragraph>
          </div>
        ) : bookableOrgs.length > 0 ? (
          <>
            <Paragraph
              data-size="xs"
              style={{
                margin: 0,
                marginTop: 'var(--ds-spacing-2)',
                color: 'var(--ds-color-neutral-text-subtle)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Dine organisasjoner
            </Paragraph>
            {bookableOrgs.map((org: OrganizationMembership) => {
              const isOrgSelected =
                value.type === 'ORGANIZATION' && value.organizationId === org.organizationId;

              return (
                <button
                  key={org.organizationId}
                  type="button"
                  onClick={() => handleSelect('ORGANIZATION', org)}
                  disabled={disabled}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--ds-spacing-3)',
                    padding: 'var(--ds-spacing-4)',
                    borderRadius: 'var(--ds-border-radius-md)',
                    backgroundColor: isOrgSelected
                      ? 'var(--ds-color-accent-surface-default)'
                      : 'var(--ds-color-neutral-surface-default)',
                    border: isOrgSelected
                      ? '2px solid var(--ds-color-accent-border-default)'
                      : '1px solid var(--ds-color-neutral-border-subtle)',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.6 : 1,
                    transition: 'all 0.15s ease',
                    width: '100%',
                    textAlign: 'left',
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: 'var(--ds-border-radius-md)',
                      backgroundColor: isOrgSelected
                        ? 'var(--ds-color-accent-base-default)'
                        : 'var(--ds-color-neutral-surface-hover)',
                      color: isOrgSelected
                        ? 'white'
                        : 'var(--ds-color-neutral-text-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <BuildingIcon />
                  </div>

                  <div style={{ flex: 1 }}>
                    <Paragraph
                      data-size="sm"
                      style={{
                        margin: 0,
                        fontWeight: 'var(--ds-font-weight-medium)',
                        color: isOrgSelected
                          ? 'var(--ds-color-accent-text-default)'
                          : 'var(--ds-color-neutral-text-default)',
                      }}
                    >
                      {org.organizationName}
                    </Paragraph>
                    <Paragraph
                      data-size="xs"
                      style={{
                        margin: 0,
                        marginTop: 'var(--ds-spacing-1)',
                        color: 'var(--ds-color-neutral-text-subtle)',
                      }}
                    >
                      {org.role}
                    </Paragraph>
                  </div>

                  {isOrgSelected && (
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: 'var(--ds-border-radius-full)',
                        backgroundColor: 'var(--ds-color-success-base-default)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <CheckIcon />
                    </div>
                  )}
                </button>
              );
            })}
          </>
        ) : null}
      </fieldset>

      {/* Info about organization booking */}
      {value.type === 'ORGANIZATION' && (
        <Paragraph
          data-size="xs"
          style={{
            margin: 0,
            marginTop: 'var(--ds-spacing-3)',
            color: 'var(--ds-color-neutral-text-subtle)',
            padding: 'var(--ds-spacing-2)',
            backgroundColor: 'var(--ds-color-info-surface-default)',
            borderRadius: 'var(--ds-border-radius-sm)',
          }}
        >
          Fakturaen sendes til {value.organizationName}. Priser kan være forskjellig fra privatpriser.
        </Paragraph>
      )}
    </div>
  );
}

export default BookingContextSelector;
