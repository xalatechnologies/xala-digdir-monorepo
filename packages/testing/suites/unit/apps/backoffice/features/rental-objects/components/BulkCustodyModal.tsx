/**
 * Bulk Custody Assignment Modal
 * Allows assigning custody for multiple rental objects at once.
 */
import { useState } from 'react';
import {
  Button,
  Heading,
  Paragraph,
  Card,
} from '@xalatechnologies/platform/ui';
import { 
  useBackofficeOrganizations,
  useUsers,
  custodyService
} from '@digilist/client-sdk';

interface BulkCustodyModalProps {
  selectedIds: string[];
  onClose: () => void;
  onSuccess: () => void;
}

export function BulkCustodyModal({ selectedIds, onClose, onSuccess }: BulkCustodyModalProps) {
  const [granteeType, setGranteeType] = useState<'USER' | 'ORG'>('ORG');
  const [granteeId, setGranteeId] = useState('');
  const [scopes, setScopes] = useState<string[]>(['RO_VIEW']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: orgs } = useBackofficeOrganizations();
  const { data: usersData } = useUsers();

  const handleSubmit = async () => {
    if (!granteeId) {
      alert('Vennligst velg en mottaker');
      return;
    }

    setIsSubmitting(true);
    try {
      await custodyService.bulkAssign({
        rentalObjectIds: selectedIds,
        granteeType,
        granteeId,
        scopes,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      alert('Feil ved tildeling: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, left: 0, right: 0, bottom: 0, 
      backgroundColor: 'var(--ds-color-neutral-surface-overlay)', 
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 1000 
    }}>
      <Card style={{ width: '500px', padding: 'var(--ds-spacing-6)' }}>
        <Heading level={3}>Massetildeling av ansvar</Heading>
        <Paragraph>Du tildeler ansvar for {selectedIds.length} valgte objekter.</Paragraph>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)', marginTop: 'var(--ds-spacing-4)' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-1)', fontSize: 'var(--ds-font-size-sm)' }}>Type mottaker</label>
            <select 
              value={granteeType} 
              onChange={(e) => {
                setGranteeType(e.target.value as 'USER' | 'ORG');
                setGranteeId('');
              }}
              style={{ width: '100%', padding: 'var(--ds-spacing-2)', borderRadius: 'var(--ds-border-radius-md)', border: '1px solid var(--ds-color-neutral-border-default)' }}
            >
              <option value="ORG">Organisasjon</option>
              <option value="USER">Bruker</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-1)', fontSize: 'var(--ds-font-size-sm)' }}>Velg mottaker</label>
            <select 
              value={granteeId} 
              onChange={(e) => setGranteeId(e.target.value)}
              style={{ width: '100%', padding: 'var(--ds-spacing-2)', borderRadius: 'var(--ds-border-radius-md)', border: '1px solid var(--ds-color-neutral-border-default)' }}
            >
              <option value="">Velg...</option>
              {granteeType === 'ORG' 
                ? (orgs as any)?.data?.map((o: any) => <option key={o.id} value={o.id}>{o.name}</option>)
                : (usersData as any)?.data?.map((u: any) => <option key={u.id} value={u.id}>{u.fullName}</option>)
              }
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-1)', fontSize: 'var(--ds-font-size-sm)' }}>Rettigheter (Scopes)</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--ds-spacing-2)' }}>
              {['RO_VIEW', 'RO_EDIT', 'RO_BOOKING_MANAGE', 'RO_MAINTENANCE', 'RO_MEDIA'].map(scope => (
                <label key={scope} style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)', fontSize: 'var(--ds-font-size-sm)' }}>
                  <input 
                    type="checkbox" 
                    checked={scopes.includes(scope)}
                    onChange={(e) => {
                      const newScopes = e.target.checked 
                        ? [...scopes, scope]
                        : scopes.filter(s => s !== scope);
                      setScopes(newScopes);
                    }}
                  />
                  {scope}
                </label>
              ))}
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', justifyContent: 'flex-end', marginTop: 'var(--ds-spacing-4)' }}>
            <Button type="button" variant="secondary" onClick={onClose}>Avbryt</Button>
            <Button 
              type="button" 
              variant="primary" 
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Tildeler...' : 'Tildel ansvar'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
