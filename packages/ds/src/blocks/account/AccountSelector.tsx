/**
 * Account Selector Block
 * 
 * Two-step account selection component for choosing between personal and organization accounts.
 * 
 * This component is props-based to follow Thin App architecture.
 * Apps should wire AccountContextProvider data to props.
 * 
 * @example
 * ```tsx
 * const { organizations, isLoadingOrganizations, switchToPersonal, switchToOrganization } = useAccountContext();
 * 
 * <AccountSelector
 *   organizations={organizations}
 *   isLoadingOrganizations={isLoadingOrganizations}
 *   onPersonalSelect={() => { switchToPersonal(); markAccountAsSelected(); }}
 *   onOrganizationSelect={(orgId) => { switchToOrganization(orgId); markAccountAsSelected(); }}
 *   rememberChoice={rememberChoice}
 *   onRememberChoiceChange={setRememberChoice}
 *   showRememberChoice={true}
 * />
 * ```
 */

import { useState } from 'react';
import { Button, Checkbox, Spinner } from '@xala/ds';
import { UserIcon, BuildingIcon, CheckIcon, ArrowLeftIcon } from '@xala/ds';
import { useT } from '@xala/i18n';
import type { Organization } from '@digilist/client-sdk/types';

// =============================================================================
// Types
// =============================================================================

export type AccountSelectionType = 'personal' | 'organization';

export interface AccountSelectorProps {
  /** List of available organizations */
  organizations: Organization[];
  /** Whether organizations are currently loading */
  isLoadingOrganizations: boolean;
  /** Callback when personal account is selected */
  onPersonalSelect: () => void;
  /** Callback when organization account is selected */
  onOrganizationSelect: (organizationId: string) => void;
  /** Whether to show "Remember my choice" checkbox */
  showRememberChoice?: boolean;
  /** Current value of remember choice checkbox */
  rememberChoice?: boolean;
  /** Callback when remember choice changes */
  onRememberChoiceChange?: (value: boolean) => void;
  /** Custom class name */
  className?: string;
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
        <BuildingIcon size={24} />
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
          <CheckIcon size={16} />
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
  organizations,
  isLoadingOrganizations,
  onPersonalSelect,
  onOrganizationSelect,
  showRememberChoice = true,
  rememberChoice = false,
  onRememberChoiceChange,
  className,
}: AccountSelectorProps): React.ReactElement {
  const t = useT();
  const [step, setStep] = useState<SelectionStep>('account-type');
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

  const handlePersonalSelect = (): void => {
    onPersonalSelect();
  };

  const handleOrganizationClick = (): void => {
    if (organizations.length === 0) return;
    setStep('organization');
  };

  const handleOrganizationConfirm = (): void => {
    if (!selectedOrgId) return;
    onOrganizationSelect(selectedOrgId);
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
            icon={<UserIcon size={24} />}
            title={t('minside.accountSelection.personalTitle')}
            description={t('minside.accountSelection.personalDescription')}
            onClick={handlePersonalSelect}
          />
          <AccountOption
            icon={<BuildingIcon size={24} />}
            title={t('minside.accountSelection.organizationTitle')}
            description={
              isLoadingOrganizations
                ? t('state.loading')
                : organizations.length === 0
                  ? t('minside.accountSelection.noOrgs')
                  : t('minside.accountSelection.organizationDescription')
            }
            onClick={handleOrganizationClick}
            disabled={isLoadingOrganizations || organizations.length === 0}
          />
        </div>

        {/* Remember Choice Checkbox */}
        {showRememberChoice && onRememberChoiceChange && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--ds-spacing-2)',
            }}
          >
            <Checkbox
              checked={rememberChoice}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onRememberChoiceChange(e.target.checked)}
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
        aria-label={t('action.back')}
        style={{
          marginBottom: 'var(--ds-spacing-4)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--ds-spacing-2)',
        }}
      >
        <ArrowLeftIcon size={20} />
        {t('action.back')}
      </Button>

      {/* Organization List */}
      {isLoadingOrganizations ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
          <Spinner aria-label={t('state.loading')} />
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
      {showRememberChoice && onRememberChoiceChange && (
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onRememberChoiceChange(e.target.checked)}
            value="remember"
            label={t('minside.accountSelection.rememberChoice')}
          />
        </div>
      )}
    </div>
  );
}
