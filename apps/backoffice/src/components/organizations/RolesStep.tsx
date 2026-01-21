/**
 * Roles Step Component
 * Default role configuration for organization setup
 */

import { useCallback } from 'react';
import { Stack, Paragraph, Heading, Card, Checkbox } from '@xalatechnologies/platform/ui';
import { useT } from '@xala/i18n';

// =============================================================================
// Types
// =============================================================================

export interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isDefault?: boolean;
}

export interface RolesStepProps {
  actorType?: string;
  selectedRoles?: string[];
  onChange: (roles: string[]) => void;
  errors?: string[];
}

// =============================================================================
// Constants
// =============================================================================

/**
 * Default role templates based on actor type
 */


// =============================================================================
// Component
// =============================================================================

export function RolesStep({ actorType = 'municipality', selectedRoles = ['admin'], onChange, errors = [] }: RolesStepProps) {
  // Translation function available for future localization
  const t = useT();

  /**
   * Default role templates based on actor type
   */
  const DEFAULT_ROLES: Record<string, RoleDefinition[]> = {
    municipality: [
      {
        id: 'admin',
        name: 'Administrator',
        description: t('common.full_tilgang_til_alle'),
        permissions: [
          'organization:manage',
          'users:manage',
          'listings:manage',
          'bookings:manage',
          'settings:manage',
          'reports:view',
          'audit:view',
        ],
      },
      {
        id: 'manager',
        name: 'Manager',
        description: t('common.administrer_anlegg_og_bookinger'),
        permissions: [
          'listings:manage',
          'bookings:manage',
          'reports:view',
        ],
      },
      {
        id: 'member',
        name: 'Medlem',
        description: t('common.grunnleggende_medlem_med_visnings'),
        permissions: [
          'listings:view',
          'bookings:create',
          'bookings:view',
        ],
        isDefault: true,
      },
    ],
    organization: [
      {
        id: 'admin',
        name: 'Administrator',
        description: t('common.full_tilgang_til_organisasjonsfunksjoner'),
        permissions: [
          'organization:manage',
          'users:manage',
          'bookings:manage',
          'settings:manage',
        ],
      },
      {
        id: 'member',
        name: 'Medlem',
        description: t('common.standard_medlem_med_bookingtilgang'),
        permissions: [
          'listings:view',
          'bookings:create',
          'bookings:view',
        ],
        isDefault: true,
      },
    ],
  };

  // Get roles for the actor type (fallback to organization roles if actorType is not found)
  const availableRoles = DEFAULT_ROLES[actorType] || DEFAULT_ROLES.organization || [];

  // Handle role toggle
  const handleRoleToggle = useCallback(
    (roleId: string) => {
      // Admin role is always required
      if (roleId === 'admin') {
        return;
      }

      const isSelected = selectedRoles.includes(roleId);
      if (isSelected) {
        onChange(selectedRoles.filter((id) => id !== roleId));
      } else {
        onChange([...selectedRoles, roleId]);
      }
    },
    [selectedRoles, onChange]
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Header */}
      <div>
        <Heading level={2} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
          Standardroller
        </Heading>
        <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
          Velg hvilke standardroller som skal opprettes for denne organisasjonen. Administrator-rollen er påkrevd og opprettes alltid.
        </Paragraph>
      </div>

      {errors.length > 0 && (
        <div
          style={{
            padding: 'var(--ds-spacing-3)',
            backgroundColor: 'var(--ds-color-danger-surface-default)',
            borderRadius: 'var(--ds-border-radius-md)',
            border: '1px solid var(--ds-color-danger-border-default)',
          }}
        >
          {errors.map((error, idx) => (
            <Paragraph key={idx} data-size="sm" style={{ color: 'var(--ds-color-danger-text-default)', margin: 0 }}>
              {error}
            </Paragraph>
          ))}
        </div>
      )}

      {/* Roles List */}
      <Card
        style={{
          padding: 'var(--ds-spacing-5)',
          backgroundColor: 'var(--ds-color-neutral-background-default)',
          border: '1px solid var(--ds-color-neutral-border-subtle)',
        }}
      >
        <div style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--ds-color-accent-base-default)' }}>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <div>
              <Heading level={3} data-size="xs" style={{ margin: 0 }}>
                Tilgjengelige roller
              </Heading>
              <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                Velg roller som skal være tilgjengelige i organisasjonen
              </Paragraph>
            </div>
          </div>
        </div>

        <Stack spacing={4}>
          {availableRoles.map((role) => {
            const isSelected = selectedRoles.includes(role.id);
            const isRequired = role.id === 'admin';

            return (
              <div
                key={role.id}
                style={{
                  padding: 'var(--ds-spacing-4)',
                  border: `1px solid ${
                    isSelected
                      ? 'var(--ds-color-accent-border-default)'
                      : 'var(--ds-color-neutral-border-subtle)'
                  }`,
                  borderRadius: 'var(--ds-border-radius-md)',
                  backgroundColor: isSelected
                    ? 'var(--ds-color-accent-surface-subtle)'
                    : 'var(--ds-color-neutral-surface-default)',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--ds-spacing-3)' }}>
                  <Checkbox
                    checked={isSelected}
                    onChange={() => handleRoleToggle(role.id)}
                    disabled={isRequired}
                    aria-label={`Velg ${role.name} rolle`}
                    style={{ marginTop: '2px' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)', marginBottom: 'var(--ds-spacing-1)' }}>
                      <Heading level={4} data-size="2xs" style={{ margin: 0 }}>
                        {role.name}
                      </Heading>
                      {isRequired && (
                        <span
                          style={{
                            padding: '2px var(--ds-spacing-2)',
                            backgroundColor: 'var(--ds-color-accent-surface-default)',
                            color: 'var(--ds-color-accent-text-default)',
                            borderRadius: 'var(--ds-border-radius-sm)',
                            fontSize: 'var(--ds-font-size-2xs)',
                            fontWeight: 'var(--ds-font-weight-medium)',
                          }}
                        >
                          Påkrevd
                        </span>
                      )}
                      {role.isDefault && (
                        <span
                          style={{
                            padding: '2px var(--ds-spacing-2)',
                            backgroundColor: 'var(--ds-color-info-surface-default)',
                            color: 'var(--ds-color-info-text-default)',
                            borderRadius: 'var(--ds-border-radius-sm)',
                            fontSize: 'var(--ds-font-size-2xs)',
                            fontWeight: 'var(--ds-font-weight-medium)',
                          }}
                        >
                          Standard
                        </span>
                      )}
                    </div>
                    <Paragraph data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                      {role.description}
                    </Paragraph>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ds-spacing-1)' }}>
                      {role.permissions.map((permission) => (
                        <span
                          key={permission}
                          style={{
                            padding: '2px var(--ds-spacing-2)',
                            backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
                            color: 'var(--ds-color-neutral-text-default)',
                            borderRadius: 'var(--ds-border-radius-sm)',
                            fontSize: 'var(--ds-font-size-2xs)',
                            border: '1px solid var(--ds-color-neutral-border-subtle)',
                          }}
                        >
                          {permission}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </Stack>
      </Card>

      {/* Info Section */}
      <div
        style={{
          padding: 'var(--ds-spacing-4)',
          backgroundColor: 'var(--ds-color-info-surface-default)',
          borderRadius: 'var(--ds-border-radius-md)',
          border: '1px solid var(--ds-color-info-border-default)',
          display: 'flex',
          gap: 'var(--ds-spacing-3)',
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{ color: 'var(--ds-color-info-text-default)', flexShrink: 0, marginTop: '2px' }}
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <div>
          <Heading level={4} data-size="2xs" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)', color: 'var(--ds-color-info-text-default)' }}>
            Om roller og tillatelser
          </Heading>
          <ul style={{ margin: 0, paddingLeft: 'var(--ds-spacing-4)', color: 'var(--ds-color-info-text-default)' }}>
            <li><Paragraph data-size="xs" style={{ margin: 0 }}>Administrator-rollen er påkrevd og gir full tilgang til organisasjonen</Paragraph></li>
            <li><Paragraph data-size="xs" style={{ margin: 0 }}>Standard-rollen tildeles automatisk til nye medlemmer</Paragraph></li>
            <li><Paragraph data-size="xs" style={{ margin: 0 }}>{t('organizations.text.duKanTilpasseRollerOgTillatelserSenereIInnstillingene')}</Paragraph></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
