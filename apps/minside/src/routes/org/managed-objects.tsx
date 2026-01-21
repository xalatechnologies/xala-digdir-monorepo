/**
 * Managed Rental Objects Page (Minzida)
 * Displays objects the organization has custody for.
 */
import { useState } from 'react';
import { useT } from '@xala/i18n';
import {
  Heading,
  Paragraph,
  Card,
  Button,
  Badge,
  Skeleton,
  DashboardPageHeader,
} from '@xalatechnologies/platform/ui';
import { 
  useCreateCustodySubgrant,
  useOrganizationMembers,
  useOrgCustody
} from '@digilist/client-sdk';
import type { CustodyGrant } from '@xala/contracts';
import { useParams } from 'react-router-dom';

export function ManagedRentalObjectsPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const t = useT();
  
  // Fetch objects the organization has custody for
  const { data: grants, isLoading } = useOrgCustody(orgId!);

  if (isLoading) return <Skeleton height={400} />;

  const managedGrants = grants || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      <DashboardPageHeader
        title={t('minside.text.administrerUtleieobjekter')}
        subtitle={t('common.objekter_din_organisasjon_har')}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--ds-spacing-4)' }}>
        {managedGrants.map((grant: CustodyGrant) => (
          <ManagedObjectCard key={grant.id} grant={grant} orgId={orgId!} />
        ))}
        {managedGrants.length === 0 && (
          <Paragraph>{t('common.ingen_utleieobjekter_tildelt_din')}</Paragraph>
        )}
      </div>
    </div>
  );
}

function ManagedObjectCard({ grant, orgId }: { grant: CustodyGrant, orgId: string }) {
  const t = useT();
  const [isSubgrantOpen, setIsSubgrantOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<string[]>(grant.scopes);
  
  const { data: members } = useOrganizationMembers(orgId);
  const createSubgrant = useCreateCustodySubgrant();

  const rentalObject = grant.rentalObject;

  const handleCreateSubgrant = async () => {
    if (!selectedMemberId) return;
    
    await createSubgrant.mutateAsync({
      parentGrantId: grant.id,
      _rentalObjectId: rentalObject.id,
      data: {
        memberUserId: selectedMemberId,
        scopes: selectedScopes,
      }
    });
    setIsSubgrantOpen(false);
  };

  return (
    <Card style={{ padding: 'var(--ds-spacing-4)', display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
      <div>
        <Heading level={3} data-size="sm">{rentalObject?.name || 'Ukjent objekt'}</Heading>
        <Paragraph data-size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          ID: {rentalObject?.id.substring(0, 8)}...
        </Paragraph>
      </div>

      <div style={{ display: 'flex', gap: 'var(--ds-spacing-1)', flexWrap: 'wrap' }}>
        {grant.scopes.map((s: string) => <Badge key={s} variant="neutral" data-size="xs">{s}</Badge>)}
      </div>

      {grant.canSubdelegate && (
        <div style={{ marginTop: 'auto', paddingTop: 'var(--ds-spacing-2)' }}>
          <Button 
            type="button" 
            variant="secondary" 
            data-size="sm" 
            onClick={() => setIsSubgrantOpen(true)}
          >
            Deleger til medlem
          </Button>
        </div>
      )}

      {isSubgrantOpen && (
        <div style={{ 
          position: 'fixed', 
          top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'var(--ds-color-neutral-surface-overlay)', 
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1000 
        }}>
          <Card style={{ width: '450px', padding: 'var(--ds-spacing-6)' }}>
            <Heading level={3}>{t('common.deleger_til_medlem')}</Heading>
            <Paragraph data-size="sm">Velg et medlem og hvilke rettigheter de skal ha for {rentalObject.name}.</Paragraph>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)', marginTop: 'var(--ds-spacing-4)' }}>
              <div>
                <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-1)', fontSize: 'var(--ds-font-size-sm)' }}>{t('common.velg_medlem')}</label>
                <select 
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  style={{ width: '100%', padding: 'var(--ds-spacing-2)', borderRadius: 'var(--ds-border-radius-md)', border: '1px solid var(--ds-color-neutral-border-default)' }}
                >
                  <option value="">{t('action.select')}</option>
                  {(members as any)?.data?.map((m: any) => (
                    <option key={m.userId} value={m.userId}>{m.name || m.userId}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-1)', fontSize: 'var(--ds-font-size-sm)' }}>Rettigheter (maksimum {grant.scopes.length})</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--ds-spacing-2)' }}>
                  {grant.scopes.map((scope: string) => (
                    <label key={scope} style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)', fontSize: 'var(--ds-font-size-sm)' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedScopes.includes(scope)}
                        onChange={(e) => {
                          const newScopes = e.target.checked 
                            ? [...selectedScopes, scope]
                            : selectedScopes.filter(s => s !== scope);
                          setSelectedScopes(newScopes);
                        }}
                      />
                      {scope}
                    </label>
                  ))}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', justifyContent: 'flex-end', marginTop: 'var(--ds-spacing-4)' }}>
                <Button type="button" variant="secondary" onClick={() => setIsSubgrantOpen(false)}>{t('action.cancel')}</Button>
                <Button 
                  type="button" 
                  variant="primary" 
                  onClick={handleCreateSubgrant}
                  disabled={createSubgrant.isPending || !selectedMemberId}
                >
                  {createSubgrant.isPending ? t('state.saving') : 'Gi tilgang'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </Card>
  );
}
