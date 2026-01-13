import { Card, Heading, Paragraph, Spinner, Table, Badge } from '@xala/ds';
import type { BackofficeRole } from '../hooks/useAuth';

// Mock data until API is connected
const mockUsers = [
  { id: '1', name: 'Ola Nordmann', email: 'ola@kommune.no', role: 'admin' as BackofficeRole },
  { id: '2', name: 'Kari Hansen', email: 'kari@kommune.no', role: 'saksbehandler' as BackofficeRole },
  { id: '3', name: 'Per Olsen', email: 'per@kommune.no', role: 'saksbehandler' as BackofficeRole },
];

const roleLabels: Record<BackofficeRole, string> = {
  admin: 'Administrator',
  saksbehandler: 'Saksbehandler',
};

const roleColors: Record<BackofficeRole, string> = {
  admin: 'accent',
  saksbehandler: 'info',
};

export function UsersPage() {
  const isLoading = false;
  const users = mockUsers;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-5)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Heading level={2} data-size="md">
            Brukeradministrasjon
          </Heading>
          <Paragraph
            data-size="sm"
            style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-1)' }}
          >
            Administrer brukere og roller
          </Paragraph>
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
          <Spinner aria-label="Laster brukere..." data-size="lg" />
        </div>
      ) : users.length > 0 ? (
        <Card style={{ overflow: 'hidden' }}>
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell>Navn</Table.HeaderCell>
                <Table.HeaderCell>E-post</Table.HeaderCell>
                <Table.HeaderCell>Rolle</Table.HeaderCell>
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
            Ingen brukere funnet.
          </Paragraph>
        </Card>
      )}
    </div>
  );
}
