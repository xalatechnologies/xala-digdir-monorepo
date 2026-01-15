/**
 * Account Selector Component
 *
 * Displays account selection options for users in minside.
 * Allows users to choose between Personal and Organization accounts.
 */
import React, { useState } from 'react';
import { Button, Checkbox, Spinner } from '@xala/ds';
import { useT } from '@xala/i18n';
import { useAccountContext } from '../providers/AccountContextProvider';
import type { Organization } from '@digilist/client-sdk/types';

// =============================================================================
// Types
// =============================================================================

export type AccountSelectionType = 'personal' | 'organization';

export interface AccountSelectorProps {
  /** Callback fired when account is selected */
  onAccountSelect?: (type: AccountSelectionType, organizationId?: string) => void;
  /** Show the "Remember my choice" checkbox */
  showRememberChoice?: boolean;
  /** Custom class name */
  className?: string;
}

// =============================================================================
// Icons
// =============================================================================

function UserIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01" />
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

function ArrowLeftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

// =============================================================================
// Account Option Component
// =============================================================================

interface AccountOptionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
}

function AccountOption({
  icon,
  title,
  description,
  onClick,
  disabled = false,
}: AccountOptionProps): React.ReactElement {
  return (
    <Button
      type="button"
      variant="secondary"
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--ds-spacing-4)',
        width: '100%',
        padding: 'var(--ds-spacing-5)',
        height: 'auto',
        textAlign: 'left',
        justifyContent: 'flex-start',
        minHeight: '88px',
      }}
    >
      <div
        style={{
          flexShrink: 0,
          width: '48px',
          height: '48px',
          borderRadius: 'var(--ds-border-radius-md)',
          backgroundColor: 'var(--ds-color-accent-surface-default)',
          color: 'var(--ds-color-accent-base-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </div>
      <div>
        <div
          style={{
            fontSize: 'var(--ds-font-size-md)',
            fontWeight: 'var(--ds-font-weight-medium)',
            color: 'var(--ds-color-neutral-text-default)',
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 'var(--ds-font-size-sm)',
            color: 'var(--ds-color-neutral-text-subtle)',
            marginTop: 'var(--ds-spacing-1)',
          }}
        >
          {description}
        </div>
      </div>
    </Button>
  );
}

// =============================================================================
// Organization Option Component
// =============================================================================

interface OrganizationOptionProps {
  organization: Organization;
  isSelected: boolean;
  onClick: () => void;
}

function OrganizationOption({
  organization,
  isSelected,
  onClick,
}: OrganizationOptionProps): React.ReactElement {
  return (
    <Button
      type="button"
      variant="tertiary"
      onClick={onClick}
      style={{
        all: 'unset',
        width: '100%',
        padding: 'var(--ds-spacing-4)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--ds-spacing-3)',
        cursor: 'pointer',
        backgroundColor: isSelected
          ? 'var(--ds-color-success-surface-default)'
          : 'transparent',
        borderRadius: 'var(--ds-border-radius-md)',
        transition: 'background-color 0.2s',
        border: isSelected
          ? '2px solid var(--ds-color-success-border-default)'
          : '2px solid var(--ds-color-neutral-border-default)',
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: 'var(--ds-border-radius-full)',
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
        <div
          style={{
            fontSize: 'var(--ds-font-size-md)',
            fontWeight: 'var(--ds-font-weight-medium)',
          }}
        >
          {organization.name}
        </div>
        {organization.organizationNumber && (
          <div
            style={{
              fontSize: 'var(--ds-font-size-sm)',
              color: 'var(--ds-color-neutral-text-subtle)',
            }}
          >
            Org.nr: {organization.organizationNumber}
          </div>
        )}
      </div>
      {isSelected && (
        <div style={{ color: 'var(--ds-color-success-base-default)' }}>
          <CheckIcon />
        </div>
      )}
    </Button>
  );
}

// =============================================================================
// Account Selector Component
// =============================================================================

type SelectionStep = 'account-type' | 'organization';

export function AccountSelector({
  onAccountSelect,
  showRememberChoice = true,
  className,
}: AccountSelectorProps): React.ReactElement {
  const {
    organizations,
    isLoadingOrganizations,
    switchToPersonal,
    switchToOrganization,
    markAccountAsSelected,
    rememberChoice,
    setRememberChoice,
  } = useAccountContext();
  const t = useT();

  const [step, setStep] = useState<SelectionStep>('account-type');
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

  const handlePersonalSelect = (): void => {
    switchToPersonal();
    markAccountAsSelected();
    onAccountSelect?.('personal');
  };

  const handleOrganizationClick = (): void => {
    if (organizations.length === 0) return;
    setStep('organization');
  };

  const handleOrganizationConfirm = (): void => {
    if (!selectedOrgId) return;
    switchToOrganization(selectedOrgId);
    markAccountAsSelected();
    onAccountSelect?.('organization', selectedOrgId);
  };

  const handleBack = (): void => {
    setStep('account-type');
    setSelectedOrgId(null);
  };

  // Account type selection step
  if (step === 'account-type') {
    return (
      <div
        className={className}
        style={{
          width: '100%',
          maxWidth: '400px',
        }}
      >
        {/* Account Options */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--ds-spacing-3)',
            marginBottom: showRememberChoice ? 'var(--ds-spacing-6)' : '0',
          }}
        >
          <AccountOption
            icon={<UserIcon />}
            title={t('minside.accountSelection.personalTitle')}
            description={t('minside.accountSelection.personalDescription')}
            onClick={handlePersonalSelect}
          />
          <AccountOption
            icon={<BuildingIcon />}
            title={t('minside.accountSelection.organizationTitle')}
            description={
              isLoadingOrganizations
                ? t('minside.accountSelection.loadingOrgs')
                : organizations.length === 0
                  ? t('minside.accountSelection.noOrgs')
                  : t('minside.accountSelection.organizationDescription')
            }
            onClick={handleOrganizationClick}
            disabled={isLoadingOrganizations || organizations.length === 0}
          />
        </div>

        {/* Remember Choice Checkbox */}
        {showRememberChoice && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--ds-spacing-2)',
            }}
          >
            <Checkbox
              checked={rememberChoice}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRememberChoice(e.target.checked)}
              value="remember"
              label={t('minside.accountSelection.rememberChoice')}
            />
          </div>
        )}
      </div>
    );
  }

  // Organization selection step
  return (
    <div
      className={className}
      style={{
        width: '100%',
        maxWidth: '400px',
      }}
    >
      {/* Back button */}
      <Button
        type="button"
        variant="tertiary"
        onClick={handleBack}
        aria-label={t('common.back')}
        style={{
          marginBottom: 'var(--ds-spacing-4)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--ds-spacing-2)',
        }}
      >
        <ArrowLeftIcon />
        {t('common.back')}
      </Button>

      {/* Organization List */}
      {isLoadingOrganizations ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
          <Spinner aria-label={t('minside.accountSelection.loadingOrgs')} />
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--ds-spacing-3)',
            marginBottom: 'var(--ds-spacing-6)',
          }}
        >
          {organizations.map((org) => (
            <OrganizationOption
              key={org.id}
              organization={org}
              isSelected={selectedOrgId === org.id}
              onClick={() => setSelectedOrgId(org.id)}
            />
          ))}
        </div>
      )}

      {/* Confirm Button */}
      <Button
        type="button"
        variant="primary"
        onClick={handleOrganizationConfirm}
        disabled={!selectedOrgId}
        style={{ width: '100%' }}
      >
        {t('minside.accountSelection.continue')}
      </Button>

      {/* Remember Choice Checkbox */}
      {showRememberChoice && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--ds-spacing-2)',
            marginTop: 'var(--ds-spacing-4)',
          }}
        >
          <Checkbox
            checked={rememberChoice}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRememberChoice(e.target.checked)}
            value="remember"
            label={t('minside.accountSelection.rememberChoice')}
          />
        </div>
      )}
    </div>
  );
}

export default AccountSelector;
