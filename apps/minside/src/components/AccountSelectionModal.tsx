import { useState, useEffect, useRef } from 'react';
import { Button, Heading, Paragraph, Card, Spinner } from '@xala/ds';
import { useAccountContext } from '../hooks/useAccountContext';
import type { Organization } from '@digilist/client-sdk/types';

/**
 * Account Selection Modal
 *
 * Post-login modal for selecting account type (personal or organization).
 * Shows immediately after login if user hasn't made a selection yet.
 *
 * Features:
 * - Two-step selection: Account type → Organization (if applicable)
 * - Cannot be dismissed (blocking modal)
 * - Mobile-responsive design
 * - Loading states for organization fetch
 */

// =============================================================================
// Icons
// =============================================================================

function UserIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M12 6h.01" />
      <path d="M12 10h.01" />
      <path d="M12 14h.01" />
      <path d="M16 10h.01" />
      <path d="M16 14h.01" />
      <path d="M8 10h.01" />
      <path d="M8 14h.01" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// =============================================================================
// Component
// =============================================================================

export interface AccountSelectionModalProps {
  open: boolean;
}

type SelectionStep = 'account-type' | 'organization';

export function AccountSelectionModal({ open }: AccountSelectionModalProps) {
  const {
    organizations,
    isLoadingOrganizations,
    switchToPersonal,
    switchToOrganization,
    markAccountAsSelected,
  } = useAccountContext();

  const dialogRef = useRef<HTMLDialogElement>(null);
  const [step, setStep] = useState<SelectionStep>('account-type');
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

  // Show/hide modal based on open prop
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  // Handlers
  const handlePersonalSelect = () => {
    switchToPersonal();
    markAccountAsSelected();
    dialogRef.current?.close();
  };

  const handleOrganizationSelect = () => {
    if (organizations.length === 0) {
      // No organizations available
      // TODO: Show message or redirect to create organization
      return;
    }
    setStep('organization');
  };

  const handleOrganizationConfirm = () => {
    if (!selectedOrgId) return;

    switchToOrganization(selectedOrgId);
    markAccountAsSelected();
    dialogRef.current?.close();
  };

  const handleBack = () => {
    setStep('account-type');
    setSelectedOrgId(null);
  };

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setStep('account-type');
      setSelectedOrgId(null);
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      style={{
        border: 'none',
        borderRadius: 'var(--ds-border-radius-lg)',
        padding: 0,
        maxWidth: '560px',
        width: '90vw',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
        backgroundColor: 'var(--ds-color-neutral-background-default)',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: 'var(--ds-spacing-6)',
          borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
          textAlign: 'center',
        }}
      >
        <Heading level={2} data-size="md" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>
          {step === 'account-type' ? 'Hvordan vil du fortsette?' : 'Velg organisasjon'}
        </Heading>
        <Paragraph style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
          {step === 'account-type'
            ? 'Velg om du vil bruke tjenesten som privatperson eller på vegne av en organisasjon'
            : 'Velg hvilken organisasjon du representerer'}
        </Paragraph>
      </div>

      {/* Body */}
      <div style={{ padding: 'var(--ds-spacing-6)' }}>
        {step === 'account-type' && (
          <div
            style={{
              display: 'grid',
              gap: 'var(--ds-spacing-4)',
              gridTemplateColumns: window.innerWidth >= 768 ? '1fr 1fr' : '1fr',
            }}
          >
            {/* Personal Account Option */}
            <Card
              asChild
              style={{
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: '2px solid var(--ds-color-neutral-border-default)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--ds-color-accent-border-default)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--ds-color-neutral-border-default)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <button
                type="button"
                onClick={handlePersonalSelect}
                style={{
                  all: 'unset',
                  width: '100%',
                  padding: 'var(--ds-spacing-5)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 'var(--ds-spacing-3)',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: 'var(--ds-border-radius-full)',
                    backgroundColor: 'var(--ds-color-accent-surface-default)',
                    color: 'var(--ds-color-accent-base-default)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <UserIcon />
                </div>
                <Heading level={3} data-size="sm" style={{ margin: 0 }}>
                  Som privatperson
                </Heading>
                <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                  Book og administrer egne aktiviteter
                </Paragraph>
              </button>
            </Card>

            {/* Organization Account Option */}
            <Card
              asChild
              style={{
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: '2px solid var(--ds-color-neutral-border-default)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--ds-color-accent-border-default)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--ds-color-neutral-border-default)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <button
                type="button"
                onClick={handleOrganizationSelect}
                disabled={isLoadingOrganizations}
                style={{
                  all: 'unset',
                  width: '100%',
                  padding: 'var(--ds-spacing-5)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 'var(--ds-spacing-3)',
                  textAlign: 'center',
                  opacity: isLoadingOrganizations ? 0.6 : 1,
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: 'var(--ds-border-radius-full)',
                    backgroundColor: 'var(--ds-color-success-surface-default)',
                    color: 'var(--ds-color-success-base-default)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isLoadingOrganizations ? <Spinner /> : <BuildingIcon />}
                </div>
                <Heading level={3} data-size="sm" style={{ margin: 0 }}>
                  På vegne av organisasjon
                </Heading>
                <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                  Representér en organisasjon du er tilknyttet
                </Paragraph>
              </button>
            </Card>
          </div>
        )}

        {step === 'organization' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
            {organizations.length === 0 ? (
              <Card style={{ padding: 'var(--ds-spacing-5)', textAlign: 'center' }}>
                <Paragraph style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                  Du er ikke tilknyttet noen organisasjoner ennå.
                </Paragraph>
              </Card>
            ) : (
              organizations.map((org: Organization) => (
                <Card
                  key={org.id}
                  asChild
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    border: selectedOrgId === org.id
                      ? '2px solid var(--ds-color-accent-border-default)'
                      : '2px solid var(--ds-color-neutral-border-default)',
                    backgroundColor: selectedOrgId === org.id
                      ? 'var(--ds-color-accent-surface-default)'
                      : undefined,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedOrgId(org.id)}
                    style={{
                      all: 'unset',
                      width: '100%',
                      padding: 'var(--ds-spacing-4)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--ds-spacing-3)',
                    }}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: 'var(--ds-border-radius-md)',
                        backgroundColor: 'var(--ds-color-success-surface-default)',
                        color: 'var(--ds-color-success-base-default)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <BuildingIcon />
                    </div>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <Heading level={4} data-size="xs" style={{ margin: 0 }}>
                        {org.name}
                      </Heading>
                      {org.organizationNumber && (
                        <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                          Org.nr: {org.organizationNumber}
                        </Paragraph>
                      )}
                    </div>
                    {selectedOrgId === org.id && (
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: 'var(--ds-border-radius-full)',
                          backgroundColor: 'var(--ds-color-accent-base-default)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <CheckIcon />
                      </div>
                    )}
                  </button>
                </Card>
              ))
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: step === 'organization' ? 'space-between' : 'flex-end',
          gap: 'var(--ds-spacing-3)',
          padding: 'var(--ds-spacing-4) var(--ds-spacing-6)',
          borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
          backgroundColor: 'var(--ds-color-neutral-background-subtle)',
        }}
      >
        {step === 'organization' && (
          <Button type="button" variant="secondary" onClick={handleBack}>
            Tilbake
          </Button>
        )}
        {step === 'organization' && (
          <Button
            type="button"
            variant="primary"
            onClick={handleOrganizationConfirm}
            disabled={!selectedOrgId}
          >
            Fortsett
          </Button>
        )}
      </div>
    </dialog>
  );
}
