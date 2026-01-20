import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
} from '@xala/ds';
import { UserIcon, BuildingIcon, CheckIcon, SettingsIcon } from '@xala/ds';
import { AccountSwitcher } from '../../src/blocks/account/AccountSwitcher';
import type { AccountType, ActiveAccount } from '../../src/blocks/account/AccountSwitcher';

/**
 * Account management components for switching between personal and organization accounts.
 *
 * ## Components
 * - **AccountSwitcher**: Dropdown for switching between accounts
 * - **AccountSelector**: Full-page account selection
 * - **AccountSelectionModal**: Modal for account selection
 *
 * ## Features
 * - Personal account mode
 * - Organization account mode
 * - Multiple organizations support
 * - Quick switching
 * - Organization management link
 *
 * ## Use Cases
 * - Header account dropdown
 * - Initial account selection
 * - Account context switching
 */
const meta: Meta<typeof AccountSwitcher> = {
  title: 'Blocks/Account',
  component: AccountSwitcher,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
Account switching components for multi-tenant municipal applications.

## Account Types
- **Personal**: User's individual account
- **Organization**: Kommune/municipal organization accounts

## Typical Flow
1. User logs in with BankID
2. If user belongs to organizations, show AccountSelector
3. User selects personal or organization mode
4. AccountSwitcher in header allows quick switching
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AccountSwitcher>;

// =============================================================================
// Sample Data
// =============================================================================

const sampleOrganizations = [
  {
    id: 'org-1',
    tenantId: 'tenant-1',
    name: 'Oslo Kommune',
    organizationNumber: '958935420',
    actorType: 'municipality' as const,
    status: 'active' as const,
    verified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'org-2',
    tenantId: 'tenant-2',
    name: 'Bergen Kommune',
    organizationNumber: '964338531',
    actorType: 'municipality' as const,
    status: 'active' as const,
    verified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'org-3',
    tenantId: 'tenant-3',
    name: 'Trondheim Kommune',
    organizationNumber: '942110464',
    actorType: 'municipality' as const,
    status: 'active' as const,
    verified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// =============================================================================
// Account Switcher Stories
// =============================================================================

/**
 * Personal account mode
 */
export const PersonalAccount: Story = {
  render: () => {
    const [accountType, setAccountType] = useState<AccountType>('personal');
    const [selectedOrg, setSelectedOrg] = useState<typeof sampleOrganizations[0] | null>(null);

    const activeAccount: ActiveAccount = {
      type: accountType,
      id: accountType === 'personal' ? 'user-1' : selectedOrg?.id || '',
      name: accountType === 'personal' ? 'Ola Nordmann' : selectedOrg?.name || '',
      displayName: accountType === 'personal' ? 'Min konto' : selectedOrg?.name || '',
    };

    return (
      <div style={{ padding: 'var(--ds-spacing-4)', backgroundColor: 'var(--ds-color-neutral-surface-hover)', borderRadius: 'var(--ds-border-radius-md)' }}>
        <AccountSwitcher
          accountType={accountType}
          selectedOrganization={selectedOrg}
          organizations={sampleOrganizations}
          activeAccount={activeAccount}
          onSwitchToPersonal={() => {
            setAccountType('personal');
            setSelectedOrg(null);
          }}
          onSwitchToOrganization={(orgId) => {
            setAccountType('organization');
            setSelectedOrg(sampleOrganizations.find(o => o.id === orgId) || null);
          }}
          onManageOrganizations={() => console.log('Manage organizations')}
        />
      </div>
    );
  },
};

/**
 * Organization account mode
 */
export const OrganizationAccount: Story = {
  render: () => {
    const [accountType, setAccountType] = useState<AccountType>('organization');
    const [selectedOrg, setSelectedOrg] = useState<typeof sampleOrganizations[0] | null>(sampleOrganizations[0]!);

    const activeAccount: ActiveAccount = {
      type: accountType,
      id: accountType === 'personal' ? 'user-1' : selectedOrg?.id || '',
      name: accountType === 'personal' ? 'Ola Nordmann' : selectedOrg?.name || '',
      displayName: accountType === 'personal' ? 'Min konto' : selectedOrg?.name || '',
    };

    return (
      <div style={{ padding: 'var(--ds-spacing-4)', backgroundColor: 'var(--ds-color-neutral-surface-hover)', borderRadius: 'var(--ds-border-radius-md)' }}>
        <AccountSwitcher
          accountType={accountType}
          selectedOrganization={selectedOrg}
          organizations={sampleOrganizations}
          activeAccount={activeAccount}
          onSwitchToPersonal={() => {
            setAccountType('personal');
            setSelectedOrg(null);
          }}
          onSwitchToOrganization={(orgId) => {
            setAccountType('organization');
            setSelectedOrg(sampleOrganizations.find(o => o.id === orgId) || null);
          }}
          onManageOrganizations={() => console.log('Manage organizations')}
        />
      </div>
    );
  },
};

/**
 * No organizations (personal only)
 */
export const NoOrganizations: Story = {
  render: () => {
    const activeAccount: ActiveAccount = {
      type: 'personal',
      id: 'user-1',
      name: 'Ola Nordmann',
      displayName: 'Min konto',
    };

    return (
      <div style={{ padding: 'var(--ds-spacing-4)', backgroundColor: 'var(--ds-color-neutral-surface-hover)', borderRadius: 'var(--ds-border-radius-md)' }}>
        <AccountSwitcher
          accountType="personal"
          selectedOrganization={null}
          organizations={[]}
          activeAccount={activeAccount}
          onSwitchToPersonal={() => console.log('Personal')}
          onSwitchToOrganization={() => console.log('No orgs')}
        />
      </div>
    );
  },
};

/**
 * Many organizations
 */
export const ManyOrganizations: Story = {
  render: () => {
    const manyOrgs = [
      ...sampleOrganizations,
      { ...sampleOrganizations[0]!, id: 'org-4', tenantId: 'tenant-4', name: 'Stavanger Kommune', organizationNumber: '964965226' },
      { ...sampleOrganizations[0]!, id: 'org-5', tenantId: 'tenant-5', name: 'Kristiansand Kommune', organizationNumber: '964965227' },
      { ...sampleOrganizations[0]!, id: 'org-6', tenantId: 'tenant-6', name: 'Tromsø Kommune', organizationNumber: '940101808' },
    ];

    const [accountType, setAccountType] = useState<AccountType>('personal');
    const [selectedOrg, setSelectedOrg] = useState<typeof sampleOrganizations[0] | null>(null);

    const activeAccount: ActiveAccount = {
      type: accountType,
      id: accountType === 'personal' ? 'user-1' : selectedOrg?.id || '',
      name: accountType === 'personal' ? 'Ola Nordmann' : selectedOrg?.name || '',
      displayName: accountType === 'personal' ? 'Min konto' : selectedOrg?.name || '',
    };

    return (
      <div style={{ padding: 'var(--ds-spacing-4)', backgroundColor: 'var(--ds-color-neutral-surface-hover)', borderRadius: 'var(--ds-border-radius-md)' }}>
        <AccountSwitcher
          accountType={accountType}
          selectedOrganization={selectedOrg}
          organizations={manyOrgs}
          activeAccount={activeAccount}
          onSwitchToPersonal={() => {
            setAccountType('personal');
            setSelectedOrg(null);
          }}
          onSwitchToOrganization={(orgId) => {
            setAccountType('organization');
            setSelectedOrg(manyOrgs.find(o => o.id === orgId) || null);
          }}
          onManageOrganizations={() => console.log('Manage organizations')}
        />
      </div>
    );
  },
};

// =============================================================================
// Account Selector (Full Page) - Demo
// =============================================================================

/**
 * Full-page account selector (for initial selection)
 */
export const AccountSelectorFullPage: Story = {
  render: () => {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    return (
      <div style={{
        maxWidth: '500px',
        margin: '0 auto',
        padding: 'var(--ds-spacing-6)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--ds-spacing-6)' }}>
          <Heading level={1} data-size="lg" style={{ margin: '0 0 var(--ds-spacing-2) 0' }}>
            Velg konto
          </Heading>
          <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
            Velg hvilken konto du vil bruke
          </Paragraph>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
          {/* Personal Account */}
          <button
            type="button"
            onClick={() => setSelectedId('personal')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--ds-spacing-4)',
              padding: 'var(--ds-spacing-4)',
              backgroundColor: selectedId === 'personal' ? 'var(--ds-color-accent-surface-default)' : 'var(--ds-color-neutral-background-default)',
              border: `2px solid ${selectedId === 'personal' ? 'var(--ds-color-accent-border-default)' : 'var(--ds-color-neutral-border-default)'}`,
              borderRadius: 'var(--ds-border-radius-md)',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
            }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--ds-border-radius-full)',
              backgroundColor: 'var(--ds-color-accent-surface-default)',
              color: 'var(--ds-color-accent-base-default)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <UserIcon size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <Paragraph data-size="md" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)' }}>
                Personlig konto
              </Paragraph>
              <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                Ola Nordmann
              </Paragraph>
            </div>
            {selectedId === 'personal' && (
              <CheckIcon size={20} style={{ color: 'var(--ds-color-accent-base-default)' }} />
            )}
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)', margin: 'var(--ds-spacing-2) 0' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--ds-color-neutral-border-subtle)' }} />
            <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
              ORGANISASJONER
            </Paragraph>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--ds-color-neutral-border-subtle)' }} />
          </div>

          {/* Organizations */}
          {sampleOrganizations.map((org) => (
            <button
              key={org.id}
              type="button"
              onClick={() => setSelectedId(org.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--ds-spacing-4)',
                padding: 'var(--ds-spacing-4)',
                backgroundColor: selectedId === org.id ? 'var(--ds-color-success-surface-default)' : 'var(--ds-color-neutral-background-default)',
                border: `2px solid ${selectedId === org.id ? 'var(--ds-color-success-border-default)' : 'var(--ds-color-neutral-border-default)'}`,
                borderRadius: 'var(--ds-border-radius-md)',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
              }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--ds-border-radius-md)',
                backgroundColor: 'var(--ds-color-success-surface-default)',
                color: 'var(--ds-color-success-base-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <BuildingIcon size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <Paragraph data-size="md" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)' }}>
                  {org.name}
                </Paragraph>
                <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                  Org.nr: {org.organizationNumber}
                </Paragraph>
              </div>
              {selectedId === org.id && (
                <CheckIcon size={20} style={{ color: 'var(--ds-color-success-base-default)' }} />
              )}
            </button>
          ))}
        </div>

        {/* Continue Button */}
        <Button
          variant="primary"
          data-size="lg"
          disabled={!selectedId}
          style={{ width: '100%', marginTop: 'var(--ds-spacing-6)' }}
          onClick={() => console.log('Selected:', selectedId)}
        >
          Fortsett
        </Button>
      </div>
    );
  },
};

// =============================================================================
// In Header Context
// =============================================================================

/**
 * Account switcher in header context
 */
export const InHeaderContext: Story = {
  render: () => {
    const [accountType, setAccountType] = useState<AccountType>('organization');
    const [selectedOrg, setSelectedOrg] = useState<typeof sampleOrganizations[0] | null>(sampleOrganizations[0]!);

    const activeAccount: ActiveAccount = {
      type: accountType,
      id: accountType === 'personal' ? 'user-1' : selectedOrg?.id || '',
      name: accountType === 'personal' ? 'Ola Nordmann' : selectedOrg?.name || '',
      displayName: accountType === 'personal' ? 'Min konto' : selectedOrg?.name || '',
    };

    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'var(--ds-spacing-4)',
        backgroundColor: 'var(--ds-color-neutral-background-default)',
        borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
      }}>
        {/* Logo */}
        <Heading level={1} data-size="sm" style={{ margin: 0, color: 'var(--ds-color-accent-base-default)' }}>
          DIGILIST
        </Heading>

        {/* Account Switcher */}
        <AccountSwitcher
          accountType={accountType}
          selectedOrganization={selectedOrg}
          organizations={sampleOrganizations}
          activeAccount={activeAccount}
          onSwitchToPersonal={() => {
            setAccountType('personal');
            setSelectedOrg(null);
          }}
          onSwitchToOrganization={(orgId) => {
            setAccountType('organization');
            setSelectedOrg(sampleOrganizations.find(o => o.id === orgId) || null);
          }}
          onManageOrganizations={() => console.log('Manage organizations')}
        />
      </div>
    );
  },
};
