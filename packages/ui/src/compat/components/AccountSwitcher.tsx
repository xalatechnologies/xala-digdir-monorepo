/**
 * AccountSwitcher Component
 *
 * Component for switching between personal and organization accounts.
 */

import React from 'react';

export interface AccountSwitcherProps {
  currentAccount?: 'personal' | 'organization';
  organizations?: { id: string; name: string }[];
  selectedOrganization?: { id: string; name: string } | null;
  onSwitch?: (type: 'personal' | 'organization', orgId?: string) => void;
}

export function AccountSwitcher({
  currentAccount = 'personal',
  organizations = [],
  selectedOrganization,
  onSwitch,
}: AccountSwitcherProps): React.ReactElement {
  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <select
        value={currentAccount === 'organization' && selectedOrganization ? selectedOrganization.id : 'personal'}
        onChange={(e) => {
          if (e.target.value === 'personal') {
            onSwitch?.('personal');
          } else {
            onSwitch?.('organization', e.target.value);
          }
        }}
        style={{
          padding: '0.5rem',
          borderRadius: 'var(--ds-border-radius-md)',
          border: '1px solid var(--ds-color-neutral-border-default)',
        }}
      >
        <option value="personal">Personlig konto</option>
        {organizations.map((org) => (
          <option key={org.id} value={org.id}>{org.name}</option>
        ))}
      </select>
    </div>
  );
}
