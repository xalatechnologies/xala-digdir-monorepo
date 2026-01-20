/**
 * Account Selection Modal Block
 *
 * Post-login modal for selecting account type (personal or organization).
 * Shows immediately after login if user hasn't made a selection yet.
 *
 * This component is props-based to follow Thin App architecture.
 * Apps should wire their AccountContext data to these props.
 *
 * @example
 * ```tsx
 * function App() {
 *   const ctx = useAccountContext();
 *   return (
 *     <AccountSelectionModal
 *       open={ctx.needsSelection}
 *       organizations={ctx.organizations}
 *       isLoadingOrganizations={ctx.isLoading}
 *       rememberChoice={ctx.rememberChoice}
 *       onRememberChoiceChange={ctx.setRememberChoice}
 *       onPersonalSelect={() => {
 *         ctx.switchToPersonal();
 *         ctx.markAccountAsSelected();
 *       }}
 *       onOrganizationSelect={(orgId) => {
 *         ctx.switchToOrganization(orgId);
 *         ctx.markAccountAsSelected();
 *       }}
 *     />
 *   );
 * }
 * ```
 */

import React, { useState, useEffect, useRef } from 'react';
import { Button, Checkbox, Spinner, Heading, Paragraph, Card } from '@xala/ds';
import { UserIcon, BuildingIcon, CheckIcon } from '@xala/ds';
import type { Organization } from '@digilist/client-sdk/types';

// =============================================================================
// Types
// =============================================================================

export interface AccountSelectionModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Available organizations for selection */
  organizations: Organization[];
  /** Whether organizations are being loaded */
  isLoadingOrganizations: boolean;
  /** Current remember choice value */
  rememberChoice?: boolean;
  /** Callback when remember choice changes */
  onRememberChoiceChange?: (value: boolean) => void;
  /** Callback when personal account is selected */
  onPersonalSelect: () => void;
  /** Callback when organization is selected */
  onOrganizationSelect: (organizationId: string) => void;
  /** Labels for i18n */
  labels?: {
    title?: string;
    subtitle?: string;
    selectOrganizationTitle?: string;
    selectOrganizationSubtitle?: string;
    personalAccount?: string;
    personalAccountDesc?: string;
    organizationAccount?: string;
    organizationAccountDesc?: string;
    noOrganizations?: string;
    orgNumber?: string;
    rememberChoice?: string;
    back?: string;
    continue?: string;
  };
}

// =============================================================================
// Default Labels
// =============================================================================

const defaultLabels = {
  title: 'Velg kontotype',
  subtitle: 'Hvordan vil du bruke tjenesten?',
  selectOrganizationTitle: 'Velg organisasjon',
  selectOrganizationSubtitle: 'Hvilken organisasjon vil du bruke?',
  personalAccount: 'Personlig konto',
  personalAccountDesc: 'Bruk tjenesten som privatperson',
  organizationAccount: 'Organisasjonskonto',
  organizationAccountDesc: 'Bruk tjenesten på vegne av din organisasjon',
  noOrganizations: 'Du har ingen organisasjoner registrert',
  orgNumber: 'Org.nr',
  rememberChoice: 'Husk mitt valg',
  back: 'Tilbake',
  continue: 'Fortsett',
};

// =============================================================================
// Component
// =============================================================================

type SelectionStep = 'account-type' | 'organization';

export function AccountSelectionModal({
  open,
  organizations,
  isLoadingOrganizations,
  rememberChoice = false,
  onRememberChoiceChange,
  onPersonalSelect,
  onOrganizationSelect,
  labels: customLabels,
}: AccountSelectionModalProps): React.ReactElement | null {
  const labels = { ...defaultLabels, ...customLabels };
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

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setStep('account-type');
      setSelectedOrgId(null);
    }
  }, [open]);

  const handlePersonalSelect = () => {
    onPersonalSelect();
  };

  const handleOrganizationClick = () => {
    if (organizations.length === 0) return;
    setStep('organization');
  };

  const handleOrganizationConfirm = () => {
    if (selectedOrgId) {
      onOrganizationSelect(selectedOrgId);
    }
  };

  const handleBack = () => {
    setStep('account-type');
    setSelectedOrgId(null);
  };

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      style={{
        border: 'none',
        borderRadius: 'var(--ds-border-radius-lg)',
        padding: 0,
        maxWidth: '560px',
        width: '90vw',
        boxShadow: 'var(--ds-shadow-xlarge)',
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
          {step === 'account-type' ? labels.title : labels.selectOrganizationTitle}
        </Heading>
        <Paragraph style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
          {step === 'account-type' ? labels.subtitle : labels.selectOrganizationSubtitle}
        </Paragraph>
      </div>

      {/* Body */}
      <div style={{ padding: 'var(--ds-spacing-6)' }}>
        {step === 'account-type' && (
          <div
            style={{
              display: 'grid',
              gap: 'var(--ds-spacing-4)',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            }}
          >
            {/* Personal Account Option */}
            <button
              type="button"
              onClick={handlePersonalSelect}
              style={{
                all: 'unset',
                cursor: 'pointer',
              }}
            >
              <Card
                style={{
                  padding: 'var(--ds-spacing-5)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 'var(--ds-spacing-3)',
                  textAlign: 'center',
                  border: '2px solid var(--ds-color-neutral-border-default)',
                  transition: 'all 0.2s',
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
                  {labels.personalAccount}
                </Heading>
                <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                  {labels.personalAccountDesc}
                </Paragraph>
              </Card>
            </button>

            {/* Organization Account Option */}
            <button
              type="button"
              onClick={handleOrganizationClick}
              disabled={isLoadingOrganizations}
              style={{
                all: 'unset',
                cursor: isLoadingOrganizations ? 'wait' : 'pointer',
                opacity: isLoadingOrganizations ? 0.6 : 1,
              }}
            >
              <Card
                style={{
                  padding: 'var(--ds-spacing-5)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 'var(--ds-spacing-3)',
                  textAlign: 'center',
                  border: '2px solid var(--ds-color-neutral-border-default)',
                  transition: 'all 0.2s',
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
                  {isLoadingOrganizations ? <Spinner aria-hidden="true" /> : <BuildingIcon />}
                </div>
                <Heading level={3} data-size="sm" style={{ margin: 0 }}>
                  {labels.organizationAccount}
                </Heading>
                <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                  {labels.organizationAccountDesc}
                </Paragraph>
              </Card>
            </button>
          </div>
        )}

        {step === 'organization' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
            {organizations.length === 0 ? (
              <Card style={{ padding: 'var(--ds-spacing-5)', textAlign: 'center' }}>
                <Paragraph style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                  {labels.noOrganizations}
                </Paragraph>
              </Card>
            ) : (
              organizations.map((org) => (
                <button
                  key={org.id}
                  type="button"
                  onClick={() => setSelectedOrgId(org.id)}
                  style={{
                    all: 'unset',
                    cursor: 'pointer',
                  }}
                >
                  <Card
                    style={{
                      padding: 'var(--ds-spacing-4)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--ds-spacing-3)',
                      border: selectedOrgId === org.id
                        ? '2px solid var(--ds-color-accent-border-default)'
                        : '2px solid var(--ds-color-neutral-border-default)',
                      backgroundColor: selectedOrgId === org.id
                        ? 'var(--ds-color-accent-surface-default)'
                        : undefined,
                      transition: 'all 0.2s',
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
                          {labels.orgNumber}: {org.organizationNumber}
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
                          color: 'var(--ds-color-neutral-contrast-default)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <CheckIcon />
                      </div>
                    )}
                  </Card>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--ds-spacing-3)',
          padding: 'var(--ds-spacing-4) var(--ds-spacing-6)',
          borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
          backgroundColor: 'var(--ds-color-neutral-background-subtle)',
        }}
      >
        {/* Remember choice checkbox */}
        {onRememberChoiceChange && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
            <Checkbox
              id="remember-choice"
              aria-label={labels.rememberChoice}
              checked={rememberChoice}
              onChange={(e) => onRememberChoiceChange(e.target.checked)}
            />
            <label htmlFor="remember-choice" style={{ fontSize: 'var(--ds-font-size-sm)' }}>
              {labels.rememberChoice}
            </label>
          </div>
        )}

        {/* Action buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: step === 'organization' ? 'space-between' : 'flex-end',
            gap: 'var(--ds-spacing-3)',
          }}
        >
          {step === 'organization' && (
            <Button type="button" variant="secondary" onClick={handleBack}>
              {labels.back}
            </Button>
          )}
          {step === 'organization' && (
            <Button
              type="button"
              variant="primary"
              onClick={handleOrganizationConfirm}
              disabled={!selectedOrgId}
            >
              {labels.continue}
            </Button>
          )}
        </div>
      </div>
    </dialog>
  );
}
