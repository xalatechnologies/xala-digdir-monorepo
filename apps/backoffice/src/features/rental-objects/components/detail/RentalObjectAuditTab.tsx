/**
 * Rental Object Audit Tab
 * Displays audit history for a specific rental object.
 */
import { useT } from '@xalatechnologies/platform/i18n';
import { 
  Heading, 
  Paragraph, 
  Card, 
  Skeleton, 
  Badge,
  Stack,
  Text,
} from '@xalatechnologies/platform/ui';
import { useAuditLog } from '@digilist/client-sdk';

export function RentalObjectAuditTab({ rentalObjectId }: { rentalObjectId: string }) {
  const t = useT();
  const { data: auditLogs, isLoading } = useAuditLog({ 
    resourceId: rentalObjectId,
    limit: 50 
  });

  if (isLoading) return <Skeleton height={300} />;

  const logs = auditLogs?.data || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      <div>
        <Heading level={3} data-size="sm">{t('backoffice.text.endringshistorikk')}</Heading>
        <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          Logg over alle endringer gjort på dette utleieobjektet.
        </Paragraph>
      </div>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--ds-color-neutral-border-subtle)', backgroundColor: 'var(--ds-color-neutral-surface-subtle)' }}>
              <th style={{ padding: 'var(--ds-spacing-3) var(--ds-spacing-4)' }}>{t('backoffice.text.tidspunkt')}</th>
              <th style={{ padding: 'var(--ds-spacing-3) var(--ds-spacing-4)' }}>{t('backoffice.text.user')}</th>
              <th style={{ padding: 'var(--ds-spacing-3) var(--ds-spacing-4)' }}>{t('backoffice.text.handling')}</th>
              <th style={{ padding: 'var(--ds-spacing-3) var(--ds-spacing-4)' }}>{t('backoffice.text.details')}</th>
            </tr>
          </thead>
          <tbody>
            {logs.length > 0 ? (
              logs.map((log: any) => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--ds-color-neutral-border-subtle)' }}>
                  <td style={{ padding: 'var(--ds-spacing-3) var(--ds-spacing-4)', fontSize: 'var(--ds-font-size-xs)' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td style={{ padding: 'var(--ds-spacing-3) var(--ds-spacing-4)', fontSize: 'var(--ds-font-size-sm)' }}>
                    {log.userName || log.userId}
                  </td>
                  <td style={{ padding: 'var(--ds-spacing-3) var(--ds-spacing-4)' }}>
                    <Badge variant={getActionVariant(log.action)} data-size="xs">
                      {log.action}
                    </Badge>
                  </td>
                  <td style={{ padding: 'var(--ds-spacing-3) var(--ds-spacing-4)', fontSize: 'var(--ds-font-size-xs)' }}>
                    {renderDetails(log.metadata)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} style={{ padding: 'var(--ds-spacing-8)', textAlign: 'center', color: 'var(--ds-color-neutral-text-subtle)' }}>
                  t('common.ingen_loggforinger_funnet_for')
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function getActionVariant(action: string): any {
  if (action.includes('CREATE')) return 'success';
  if (action.includes('UPDATE')) return 'info';
  if (action.includes('DELETE') || action.includes('REVOKE')) return 'danger';
  return 'neutral';
}

function renderDetails(metadata: any) {
  if (!metadata) return null;
  
  // Custom rendering for custody actions
  if (metadata.grantId) {
    return (
      <Stack spacing="var(--ds-spacing-1)">
        <Text size="xs">Grant: {metadata.grantId.substring(0, 8)}...</Text>
        {metadata.scopes && <Text size="xs">Scopes: {metadata.scopes.join(', ')}</Text>}
      </Stack>
    );
  }

  return JSON.stringify(metadata).substring(0, 100);
}
