/**
 * Rental Object Custody Tab
 * Allows management of resource-scoped delegation (User/Org grants).
 * 
 * Reference: MASTER PROMPT - RENTAL OBJECT CUSTODY
 */
import { useState } from 'react';
import {
import { useT } from '@xala/i18n';
  Button,
  Heading,
  Paragraph,
  Badge,
  TrashIcon,
  PlusIcon,
  Card,
  Skeleton,
} from '@xala/ds';
import { 
  useRentalObjectCustody, 
  useCreateCustodyGrant, 
  useRevokeCustodyGrant,
  useBackofficeOrganizations,
  useUsers,
} from '@digilist/client-sdk';

export function RentalObjectCustodyTab({ rentalObjectId }: { rentalObjectId: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGrant, setNewGrant] = useState<{
  const t = useT();
    granteeType: 'USER' | 'ORG';
    granteeId: string;
    scopes: string[];
    effectiveFrom?: string;
    effectiveTo?: string;
    reason?: string;
  }>({
    granteeType: 'ORG',
    granteeId: '',
    scopes: ['RO_VIEW'],
  });
  
  // Queries
  const { data: grants, isLoading: isLoadingGrants } = useRentalObjectCustody(rentalObjectId);
  const { data: orgs } = useBackofficeOrganizations();
  const { data: usersData } = useUsers();
  
  // Mutations
  const createGrant = useCreateCustodyGrant();
  const revokeGrant = useRevokeCustodyGrant();

  const handleCreate = async () => {
    if (!newGrant.granteeId) {
      alert('Vennligst velg en mottaker');
      return;
    }
    await createGrant.mutateAsync({ 
      rentalObjectId, 
      data: {
        granteeType: newGrant.granteeType,
        granteeId: newGrant.granteeId,
        scopes: newGrant.scopes as any,
        effectiveFrom: newGrant.effectiveFrom,
        effectiveTo: newGrant.effectiveTo,
        reason: newGrant.reason,
      } 
    });
    setIsModalOpen(false);
  };

  const handleRevoke = async (grantId: string) => {
    if (window.confirm(t('common.er_du_sikker_paa'))) {
      await revokeGrant.mutateAsync({ grantId, _rentalObjectId: rentalObjectId });
    }
  };

  if (isLoadingGrants) {
    return <Skeleton height={200} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Heading level={3} data-size="sm" style={{ margin: 0 }}>Ansvar og delegasjon</Heading>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
            Administrer hvem som har ansvar for dette objektet.
          </Paragraph>
        </div>
        <Button 
          type="button" 
          variant="primary" 
          onClick={() => setIsModalOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}
        >
          <PlusIcon size={16} />
          Tildel ansvar
        </Button>
      </div>

      {/* Grants Table */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--ds-color-neutral-border-subtle)', backgroundColor: 'var(--ds-color-neutral-surface-subtle)' }}>
              <th style={{ padding: 'var(--ds-spacing-3) var(--ds-spacing-4)' }}>Mottaker</th>
              <th style={{ padding: 'var(--ds-spacing-3) var(--ds-spacing-4)' }}>Type</th>
              <th style={{ padding: 'var(--ds-spacing-3) var(--ds-spacing-4)' }}>{t('common.omfang_scopes')}</th>
              <th style={{ padding: 'var(--ds-spacing-3) var(--ds-spacing-4)' }}>Periode</th>
              <th style={{ padding: 'var(--ds-spacing-3) var(--ds-spacing-4)' }}>Status</th>
              <th style={{ padding: 'var(--ds-spacing-3) var(--ds-spacing-4)', textAlign: 'right' }}>Handlinger</th>
            </tr>
          </thead>
          <tbody>
            {grants && (grants as any[]).length > 0 ? (
              (grants as any[]).map((grant) => (
                <>
                  <tr key={grant.id} style={{ borderBottom: '1px solid var(--ds-color-neutral-border-subtle)' }}>
                    <td style={{ padding: 'var(--ds-spacing-3) var(--ds-spacing-4)' }}>
                      {grant.granteeType === 'ORG' 
                        ? (orgs as any)?.data?.find((o: any) => o.id === grant.granteeId)?.name || grant.granteeId
                        : (usersData as any)?.data?.find((u: any) => u.id === grant.granteeId)?.fullName || grant.granteeId
                      }
                    </td>
                    <td style={{ padding: 'var(--ds-spacing-3) var(--ds-spacing-4)' }}>
                      <Badge variant={grant.granteeType === 'ORG' ? 'info' : 'neutral'}>
                        {grant.granteeType === 'ORG' ? 'Organisasjon' : 'Bruker'}
                      </Badge>
                    </td>
                    <td style={{ padding: 'var(--ds-spacing-3) var(--ds-spacing-4)' }}>
                      <div style={{ display: 'flex', gap: 'var(--ds-spacing-1)', flexWrap: 'wrap' }}>
                        {(grant.scopes as string[]).map(s => (
                          <Badge key={s} variant="neutral" data-size="xs">{s}</Badge>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: 'var(--ds-spacing-3) var(--ds-spacing-4)', fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                      {grant.effectiveFrom ? new Date(grant.effectiveFrom).toLocaleDateString() : 'Alltid'} 
                      {grant.effectiveTo ? ` - ${new Date(grant.effectiveTo).toLocaleDateString()}` : ''}
                    </td>
                    <td style={{ padding: 'var(--ds-spacing-3) var(--ds-spacing-4)' }}>
                      <Badge variant={grant.status === 'ACTIVE' ? 'success' : 'neutral'}>
                        {grant.status === 'ACTIVE' ? 'Aktiv' : 'Tilbaketrukket'}
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
                  
                  {/* Subgrants for Organization */}
                  {grant.granteeType === 'ORG' && grant.subgrants && grant.subgrants.length > 0 && (
                    grant.subgrants.map((sub: any) => (
                      <tr key={sub.id} style={{ borderBottom: '1px solid var(--ds-color-neutral-border-subtle)', backgroundColor: 'var(--ds-color-neutral-surface-subtle)' }}>
                        <td style={{ padding: 'var(--ds-spacing-2) var(--ds-spacing-4) var(--ds-spacing-2) var(--ds-spacing-8)', fontSize: 'var(--ds-font-size-sm)' }}>
                          ↳ {(usersData as any)?.data?.find((u: any) => u.id === sub.memberUserId)?.fullName || sub.memberUserId}
                        </td>
                        <td style={{ padding: 'var(--ds-spacing-2) var(--ds-spacing-4)' }}>
                          <Badge variant="neutral" data-size="xs">Medlem</Badge>
                        </td>
                        <td style={{ padding: 'var(--ds-spacing-2) var(--ds-spacing-4)' }}>
                          <div style={{ display: 'flex', gap: 'var(--ds-spacing-1)', flexWrap: 'wrap' }}>
                            {(sub.scopes as string[]).map(s => (
                              <Badge key={s} variant="neutral" data-size="xs" style={{ fontSize: '10px' }}>{s}</Badge>
                            ))}
                          </div>
                        </td>
                        <td style={{ padding: 'var(--ds-spacing-2) var(--ds-spacing-4)', fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                          {sub.effectiveFrom ? new Date(sub.effectiveFrom).toLocaleDateString() : ''}
                        </td>
                        <td style={{ padding: 'var(--ds-spacing-2) var(--ds-spacing-4)' }}>
                          <Badge variant={sub.status === 'ACTIVE' ? 'success' : 'neutral'} data-size="xs">
                            {sub.status === 'ACTIVE' ? 'Aktiv' : 'Inaktiv'}
                          </Badge>
                        </td>
                        <td style={{ padding: 'var(--ds-spacing-2) var(--ds-spacing-4)', textAlign: 'right' }}>
                          {/* Subgrant revocation could be added here if needed */}
                        </td>
                      </tr>
                    ))
                  )}
                </>
              ))
            ) : (
              <tr>
                <td colSpan={5} style={{ padding: 'var(--ds-spacing-8)', textAlign: 'center', color: 'var(--ds-color-neutral-text-subtle)' }}>
                  t('common.ingen_delegasjoner_registrert_for')
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      {/* Simplified Add Grant UI (Modal placeholder) */}
      {isModalOpen && (
        <div style={{ 
          position: 'fixed', 
          top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'var(--ds-color-neutral-surface-overlay)', 
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1000 
        }}>
          <Card style={{ width: '500px', padding: 'var(--ds-spacing-6)' }}>
            <Heading level={3}>{t('common.tildel_nytt_ansvar')}</Heading>
            <Paragraph>{t('common.dette_vil_gi_en')}</Paragraph>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)', marginTop: 'var(--ds-spacing-4)' }}>
              <div>
                <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-1)', fontSize: 'var(--ds-font-size-sm)' }}>{t('common.type_mottaker')}</label>
                <select 
                  value={newGrant.granteeType} 
                  onChange={(e) => setNewGrant({...newGrant, granteeType: e.target.value as 'USER' | 'ORG', granteeId: ''})}
                  style={{ width: '100%', padding: 'var(--ds-spacing-2)', borderRadius: 'var(--ds-border-radius-md)', border: '1px solid var(--ds-color-neutral-border-default)' }}
                >
                  <option value="ORG">Organisasjon</option>
                  <option value="USER">Bruker</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-1)', fontSize: 'var(--ds-font-size-sm)' }}>{t('common.velg_mottaker')}</label>
                <select 
                  value={newGrant.granteeId} 
                  onChange={(e) => setNewGrant({...newGrant, granteeId: e.target.value})}
                  style={{ width: '100%', padding: 'var(--ds-spacing-2)', borderRadius: 'var(--ds-border-radius-md)', border: '1px solid var(--ds-color-neutral-border-default)' }}
                >
                  <option value="">{t('common.velg')}</option>
                  {newGrant.granteeType === 'ORG' 
                    ? (orgs as any)?.data?.map((o: any) => <option key={o.id} value={o.id}>{o.name}</option>)
                    : (usersData as any)?.data?.map((u: any) => <option key={u.id} value={u.id}>{u.fullName}</option>)
                  }
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-1)', fontSize: 'var(--ds-font-size-sm)' }}>{t('common.rettigheter_scopes')}</label>
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
                          setNewGrant({...newGrant, scopes});
                        }}
                      />
                      {scope}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--ds-spacing-4)' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-1)', fontSize: 'var(--ds-font-size-sm)' }}>{t('common.gyldig_fra')}</label>
                  <input 
                    type="datetime-local" 
                    value={newGrant.effectiveFrom || ''} 
                    onChange={(e) => setNewGrant({...newGrant, effectiveFrom: e.target.value})}
                    style={{ width: '100%', padding: 'var(--ds-spacing-2)', borderRadius: 'var(--ds-border-radius-md)', border: '1px solid var(--ds-color-neutral-border-default)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-1)', fontSize: 'var(--ds-font-size-sm)' }}>{t('common.gyldig_til')}</label>
                  <input 
                    type="datetime-local" 
                    value={newGrant.effectiveTo || ''} 
                    onChange={(e) => setNewGrant({...newGrant, effectiveTo: e.target.value})}
                    style={{ width: '100%', padding: 'var(--ds-spacing-2)', borderRadius: 'var(--ds-border-radius-md)', border: '1px solid var(--ds-color-neutral-border-default)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-1)', fontSize: 'var(--ds-font-size-sm)' }}>Begrunnelse</label>
                <textarea 
                  value={newGrant.reason || ''} 
                  onChange={(e) => setNewGrant({...newGrant, reason: e.target.value})}
                  placeholder={t('common.valgfri_begrunnelse_for_delegasjonen')}
                  style={{ width: '100%', padding: 'var(--ds-spacing-2)', borderRadius: 'var(--ds-border-radius-md)', border: '1px solid var(--ds-color-neutral-border-default)', minHeight: '80px' }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', justifyContent: 'flex-end', marginTop: 'var(--ds-spacing-4)' }}>
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Avbryt</Button>
                <Button 
                  type="button" 
                  variant="primary" 
                  onClick={handleCreate}
                  disabled={createGrant.isPending}
                >
                  {createGrant.isPending ? t('common.tildeler') : 'Tildel'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
