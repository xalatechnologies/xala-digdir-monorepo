import { Card, Heading, Paragraph, Spinner, Table, Badge } from '@xala/ds';
import { useT } from '@xala/i18n';
import type { BackofficeRole } from '../hooks/useAuth';

// Mock data until API is connected
const mockUsers = [
  { id: '1', name: 'Ola Nordmann', email: 'ola@kommune.no', role: 'admin' as BackofficeRole },
  { id: '2', name: 'Kari Hansen', email: 'kari@kommune.no', role: 'saksbehandler' as BackofficeRole },
  { id: '3', name: 'Per Olsen', email: 'per@kommune.no', role: 'saksbehandler' as BackofficeRole },
];

const roleColors: Record<BackofficeRole, string> = {
  admin: 'accent',
  saksbehandler: 'info',
};

export function UsersPage() {
  const t = useT();
  const isLoading = false;
  const users = mockUsers;

  const roleLabels: Record<BackofficeRole, string> = {
    admin: t('users.admin'),
    saksbehandler: t('users.caseWorker'),
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-5)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Heading level={2} data-size="md">
            {t('users.subtitle')}
          </Heading>
          <Paragraph
            data-size="sm"
            style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-1)' }}
          >
            {t('users.manageRoles')}
          </Paragraph>
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
          <Spinner aria-label={t('users.loadingUsers')} data-size="lg" />
        </div>
      ) : users.length > 0 ? (
        <Card style={{ overflow: 'hidden' }}>
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell>{t('common.name')}</Table.HeaderCell>
                <Table.HeaderCell>{t('users.email')}</Table.HeaderCell>
                <Table.HeaderCell>{t('users.role')}</Table.HeaderCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {users.map((user) => (
                <Table.Row key={user.id}>
                  <Table.Cell>{user.name}</Table.Cell>
                  <Table.Cell>{user.email}</Table.Cell>
                  <Table.Cell>
                    <Badge data-color={roleColors[user.role]}>
                      {roleLabels[user.role]}
                    </Badge>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Card>
      ) : (
        <Card style={{ padding: 'var(--ds-spacing-8)', textAlign: 'center' }}>
          <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
            {t('users.noUsers')}
          </Paragraph>
        </Card>
      )}
    </div>
  );
}
