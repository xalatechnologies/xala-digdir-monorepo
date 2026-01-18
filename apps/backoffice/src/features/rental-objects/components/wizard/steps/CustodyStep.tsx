/**
 * Custody Step - Rental Object Wizard
 * Allows assigning custody/delegation during rental object creation/editing
 */
import { useT } from '@xala/i18n';
import { Heading, Paragraph, Button, Card, Badge, TrashIcon, PlusIcon } from '@xala/ds';
import { useState } from 'react';
import { 
  useBackofficeOrganizations, 
  useTenantAdminUsers,
  useCreateCustodyGrant,
  useRevokeCustodyGrant 
} from '@digilist/client-sdk';
import type { useRentalObjectWizard } from '../../../hooks/useRentalObjectWizard';

export interface CustodyStepProps {
  wizard: ReturnType<typeof useRentalObjectWizard>;
}

export function CustodyStep({ wizard }: CustodyStepProps) {
  const t = useT();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGrant, setNewGrant] = useState<{
    granteeType: 'USER' | 'ORG';
    granteeId: string;
    scopes: string[];
    canSubdelegate?: boolean;
    effectiveFrom?: string;
    effectiveTo?: string;
    reason?: string;
  }>({
    granteeType: 'ORG',
    granteeId: '',
    scopes: ['RO_VIEW'],
  });

  const { data: orgsData } = useBackofficeOrganizations();
  const { data: usersData } = useTenantAdminUsers();
  const createGrant = useCreateCustodyGrant();
  const revokeGrant = useRevokeCustodyGrant();

  const rentalObjectId = wizard.formData.id;
  const existingGrants = wizard.formData.custodyGrants || [];

  const handleCreate = async () => {
    if (!newGrant.granteeId || !rentalObjectId) {
      alert('Please select a grantee and ensure the rental object is saved');
      return;
    }
    await createGrant.mutateAsync({
      rentalObjectId,
      data: {
        granteeType: newGrant.granteeType,
        granteeId: newGrant.granteeId,
        scopes: newGrant.scopes as any,
        canSubdelegate: newGrant.canSubdelegate,
        effectiveFrom: newGrant.effectiveFrom,
        effectiveTo: newGrant.effectiveTo,
        reason: newGrant.reason,
      },
    });
    setIsModalOpen(false);
  };

  const handleRevoke = async (grantId: string) => {
    if (window.confirm('t('common.are_you_sure_you')')) {
      await revokeGrant.mutateAsync({ grantId, _rentalObjectId: rentalObjectId! });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      <div>
        <Heading level={2} data-size="md" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>
          {t('wizard.custody.title')}
        </Heading>
        <Paragraph style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
          {t('wizard.custody.description')}
        </Paragraph>
      </div>

      {!rentalObjectId && (
        <Card style={{ padding: 'var(--ds-spacing-4)', backgroundColor: 'var(--ds-color-warning-surface-default)' }}>
          <Paragraph>
            Please save the rental object first before assigning custody. This step will become available after creation.
          </Paragraph>
        </Card>
      )}

      {rentalObjectId && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="button" variant="primary" onClick={() => setIsModalOpen(true)}>
              <PlusIcon size={16} />
              Assign Custody
            </Button>
          </div>

          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--ds-color-neutral-border-subtle)', backgroundColor: 'var(--ds-color-neutral-surface-subtle)' }}>
                  <th style={{ padding: 'var(--ds-spacing-3) var(--ds-spacing-4)' }}>Grantee</th>
                  <th style={{ padding: 'var(--ds-spacing-3) var(--ds-spacing-4)' }}>Type</th>
                  <th style={{ padding: 'var(--ds-spacing-3) var(--ds-spacing-4)' }}>Scopes</th>
                  <th style={{ padding: 'var(--ds-spacing-3) var(--ds-spacing-4)' }}>Status</th>
                  <th style={{ padding: 'var(--ds-spacing-3) var(--ds-spacing-4)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {existingGrants.length > 0 ? (
                  existingGrants.map((grant: any) => (
                    <tr key={grant.id} style={{ borderBottom: '1px solid var(--ds-color-neutral-border-subtle)' }}>
                      <td style={{ padding: 'var(--ds-spacing-3) var(--ds-spacing-4)' }}>
                        {grant.granteeType === 'ORG'
                          ? (orgsData as any)?.data?.find((o: any) => o.id === grant.granteeId)?.name || grant.granteeId
                          : (usersData as any)?.data?.find((u: any) => u.id === grant.granteeId)?.fullName || grant.granteeId}
                      </td>
                      <td style={{ padding: 'var(--ds-spacing-3) var(--ds-spacing-4)' }}>
                        <Badge variant={grant.granteeType === 'ORG' ? 'info' : 'neutral'}>
                          {grant.granteeType === 'ORG' ? 'Organization' : 'User'}
                        </Badge>
                      </td>
                      <td style={{ padding: 'var(--ds-spacing-3) var(--ds-spacing-4)' }}>
                        <div style={{ display: 'flex', gap: 'var(--ds-spacing-1)', flexWrap: 'wrap' }}>
                          {grant.scopes.map((s: string) => (
                            <Badge key={s} variant="neutral" data-size="xs">{s}</Badge>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: 'var(--ds-spacing-3) var(--ds-spacing-4)' }}>
                        <Badge variant={grant.status === 'ACTIVE' ? 'success' : 'neutral'}>
                          {grant.status}
                        </Badge>
                      </td>
                      <td style={{ padding: 'var(--ds-spacing-3) var(--ds-spacing-4)', textAlign: 'right' }}>
                        {grant.status === 'ACTIVE' && (
                          <Button
                            type="button"
                            variant="tertiary"
                            data-size="sm"
                            onClick={() => handleRevoke(grant.id)}
                            style={{ color: 'var(--ds-color-danger-text-default)' }}
                          >
                            <TrashIcon size={14} />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ padding: 'var(--ds-spacing-8)', textAlign: 'center', color: 'var(--ds-color-neutral-text-subtle)' }}>
                      t('common.no_custody_grants_assigned')
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        </>
      )}

      {/* Modal for creating grant */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'var(--ds-color-neutral-surface-overlay)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1000
        }}>
          <Card style={{ width: '500px', padding: 'var(--ds-spacing-6)' }}>
            <Heading level={3}>{t('common.assign_custody')}</Heading>
            <Paragraph>{t('common.grant_permissions_to_a')}</Paragraph>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)', marginTop: 'var(--ds-spacing-4)' }}>
              <div>
                <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-1)', fontSize: 'var(--ds-font-size-sm)' }}>{t('common.grantee_type')}</label>
                <select
                  value={newGrant.granteeType}
                  onChange={(e) => setNewGrant({ ...newGrant, granteeType: e.target.value as 'USER' | 'ORG', granteeId: '' })}
                  style={{ width: '100%', padding: 'var(--ds-spacing-2)', borderRadius: 'var(--ds-border-radius-md)', border: '1px solid var(--ds-color-neutral-border-default)' }}
                >
                  <option value="ORG">{t('common.backoffice_organization')}</option>
                  <option value="USER">{t('common.backoffice_user')}</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-1)', fontSize: 'var(--ds-font-size-sm)' }}>{t('common.select_grantee')}</label>
                <select
                  value={newGrant.granteeId}
                  onChange={(e) => setNewGrant({ ...newGrant, granteeId: e.target.value })}
                  style={{ width: '100%', padding: 'var(--ds-spacing-2)', borderRadius: 'var(--ds-border-radius-md)', border: '1px solid var(--ds-color-neutral-border-default)' }}
                >
                  <option value="">{t('common.choose')}</option>
                  {newGrant.granteeType === 'ORG'
                    ? (orgsData as any)?.data?.map((o: any) => <option key={o.id} value={o.id}>{o.name}</option>)
                    : (usersData as any)?.data?.map((u: any) => <option key={u.id} value={u.id}>{u.fullName}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-1)', fontSize: 'var(--ds-font-size-sm)' }}>Scopes</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--ds-spacing-2)' }}>
                  {['RO_VIEW', 'RO_EDIT', 'RO_BOOKING_MANAGE', 'RO_MAINTENANCE', 'RO_MEDIA', 'RO_PRICING', 'RO_REPORTING', 'RO_DELEGATE'].map(scope => (
                    <label key={scope} style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)', fontSize: 'var(--ds-font-size-sm)' }}>
                      <input
                        type="checkbox"
                        checked={newGrant.scopes.includes(scope)}
                        onChange={(e) => {
                          const scopes = e.target.checked
                            ? [...newGrant.scopes, scope]
                            : newGrant.scopes.filter(s => s !== scope);
                          setNewGrant({ ...newGrant, scopes });
                        }}
                      />
                      {scope}
                    </label>
                  ))}
                </div>
              </div>

              {newGrant.granteeType === 'ORG' && (
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)', fontSize: 'var(--ds-font-size-sm)' }}>
                    <input
                      type="checkbox"
                      checked={newGrant.canSubdelegate}
                      onChange={(e) => setNewGrant({ ...newGrant, canSubdelegate: e.target.checked })}
                    />
                    Allow sub-delegation to organization members
                  </label>
                </div>
              )}

              <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', justifyContent: 'flex-end', marginTop: 'var(--ds-spacing-4)' }}>
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleCreate}
                  disabled={createGrant.isPending}
                >
                  {createGrant.isPending ? 'Assigning...' : 'Assign'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
