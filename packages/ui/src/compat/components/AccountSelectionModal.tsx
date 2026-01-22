/**
 * AccountSelectionModal Component
 *
 * Modal for selecting between personal and organization accounts.
 */

import React, { useState, useId } from 'react';
import { Dialog, Button, Heading, Paragraph, Card, Radio } from '@digdir/designsystemet-react';
import { useT } from '../../i18n';

export interface Organization {
  id: string;
  name: string;
  orgNumber?: string;
}

export interface AccountSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (accountType: 'personal' | 'organization', organizationId?: string) => void;
  organizations?: Organization[];
  currentAccountType?: 'personal' | 'organization';
  currentOrganizationId?: string;
  userName?: string;
}

export function AccountSelectionModal({
  open,
  onClose,
  onSelect,
  organizations = [],
  currentAccountType = 'personal',
  currentOrganizationId,
  userName,
}: AccountSelectionModalProps): React.ReactElement | null {
  const t = useT();
  const personalId = useId();
  const [selected, setSelected] = useState<string>(
    currentAccountType === 'personal' ? 'personal' : currentOrganizationId || 'personal'
  );

  const handleConfirm = () => {
    if (selected === 'personal') {
      onSelect('personal');
    } else {
      onSelect('organization', selected);
    }
    onClose();
  };

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose}>
      <Dialog.Block>
        <Heading level={2}>{t('account.selectAccount', 'Velg konto')}</Heading>
      </Dialog.Block>
      <Dialog.Block>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Personal Account */}
          <Card
            onClick={() => setSelected('personal')}
            style={{
              cursor: 'pointer',
              border: selected === 'personal' ? '2px solid var(--ds-color-accent-base-default)' : undefined,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Radio
                aria-labelledby={personalId}
                checked={selected === 'personal'}
                onChange={() => setSelected('personal')}
                value="personal"
              />
              <div>
                <Heading level={3} id={personalId}>{t('account.personal', 'Personlig konto')}</Heading>
                {userName && <Paragraph>{userName}</Paragraph>}
              </div>
            </div>
          </Card>

          {/* Organization Accounts */}
          {organizations.map((org) => {
            const orgLabelId = `org-${org.id}`;
            return (
              <Card
                key={org.id}
                onClick={() => setSelected(org.id)}
                style={{
                  cursor: 'pointer',
                  border: selected === org.id ? '2px solid var(--ds-color-accent-base-default)' : undefined,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Radio
                    aria-labelledby={orgLabelId}
                    checked={selected === org.id}
                    onChange={() => setSelected(org.id)}
                    value={org.id}
                  />
                  <div>
                    <Heading level={3} id={orgLabelId}>{org.name}</Heading>
                    {org.orgNumber && (
                      <Paragraph>
                        {t('account.orgNumber', 'Org.nr')}: {org.orgNumber}
                      </Paragraph>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </Dialog.Block>
      <Dialog.Block>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel', 'Avbryt')}
          </Button>
          <Button onClick={handleConfirm}>
            {t('common.confirm', 'Bekreft')}
          </Button>
        </div>
      </Dialog.Block>
    </Dialog>
  );
}
