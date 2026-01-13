import { useNavigate } from 'react-router-dom';
import { Card, Heading, Paragraph, Button, Badge, Table, Dropdown } from '@xala/ds';

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const MoreIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="19" r="1" />
  </svg>
);

// Mock data
interface Organization {
  id: string;
  name: string;
  orgNumber: string;
  memberCount: number;
  activeBookings: number;
  seasonLeases: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

const mockOrganizations: Organization[] = [
  { id: '1', name: 'Nordre Follo IL', orgNumber: '912 345 678', memberCount: 450, activeBookings: 8, seasonLeases: 2, status: 'active', createdAt: '2022-03-15' },
  { id: '2', name: 'Ski Håndball', orgNumber: '923 456 789', memberCount: 280, activeBookings: 5, seasonLeases: 1, status: 'active', createdAt: '2022-05-20' },
  { id: '3', name: 'Ås Turnforening', orgNumber: '934 567 890', memberCount: 320, activeBookings: 4, seasonLeases: 1, status: 'active', createdAt: '2022-08-10' },
  { id: '4', name: 'Langhus Fotball', orgNumber: '945 678 901', memberCount: 380, activeBookings: 6, seasonLeases: 1, status: 'active', createdAt: '2023-01-05' },
  { id: '5', name: 'Vestby Korps', orgNumber: '956 789 012', memberCount: 65, activeBookings: 2, seasonLeases: 0, status: 'active', createdAt: '2023-04-18' },
  { id: '6', name: 'Ås Kultur', orgNumber: '967 890 123', memberCount: 120, activeBookings: 3, seasonLeases: 0, status: 'active', createdAt: '2023-06-01' },
  { id: '7', name: 'Gamle Klubben', orgNumber: '978 901 234', memberCount: 45, activeBookings: 0, seasonLeases: 0, status: 'inactive', createdAt: '2021-11-30' },
];

function StatusBadge({ status }: { status: Organization['status'] }) {
  return (
    <Badge data-color={status === 'active' ? 'success' : 'neutral'} data-size="sm">
      {status === 'active' ? 'Aktiv' : 'Inaktiv'}
    </Badge>
  );
}

export function OrganizationsPage() {
  const navigate = useNavigate();

  const totalMembers = mockOrganizations.reduce((sum, o) => sum + o.memberCount, 0);
  const activeOrgs = mockOrganizations.filter((o) => o.status === 'active').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Heading level={1} data-size="lg" style={{ margin: 0 }}>
            Organisasjoner
          </Heading>
          <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)', marginBottom: 0 }}>
            Administrer registrerte organisasjoner og deres medlemmer.
          </Paragraph>
        </div>
        <Button type="button" variant="primary" data-size="md">
          <PlusIcon />
          Legg til organisasjon
        </Button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--ds-spacing-4)' }}>
        <Card style={{ padding: 'var(--ds-spacing-5)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
            Totalt organisasjoner
          </Paragraph>
          <Heading level={2} data-size="xl" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)' }}>
            {mockOrganizations.length}
          </Heading>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-5)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
            Aktive organisasjoner
          </Paragraph>
          <Heading level={2} data-size="xl" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)' }}>
            {activeOrgs}
          </Heading>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-5)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
            Totalt medlemmer
          </Paragraph>
          <Heading level={2} data-size="xl" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)' }}>
            {totalMembers.toLocaleString('nb-NO')}
          </Heading>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-5)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
            Med sesongleie
          </Paragraph>
          <Heading level={2} data-size="xl" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)' }}>
            {mockOrganizations.filter((o) => o.seasonLeases > 0).length}
          </Heading>
        </Card>
      </div>

      {/* Table */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <Table>
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell>Navn</Table.HeaderCell>
              <Table.HeaderCell>Org.nr</Table.HeaderCell>
              <Table.HeaderCell>Medlemmer</Table.HeaderCell>
              <Table.HeaderCell>Aktive bookinger</Table.HeaderCell>
              <Table.HeaderCell>Sesongleie</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell>Registrert</Table.HeaderCell>
              <Table.HeaderCell style={{ width: '60px' }}></Table.HeaderCell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {mockOrganizations.map((org) => (
              <Table.Row
                key={org.id}
                onClick={() => navigate(`/organizations/${org.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <Table.Cell>
                  <span style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>
                    {org.name}
                  </span>
                </Table.Cell>
                <Table.Cell>
                  <span style={{ fontFamily: 'monospace', fontSize: 'var(--ds-font-size-sm)' }}>
                    {org.orgNumber}
                  </span>
                </Table.Cell>
                <Table.Cell>{org.memberCount}</Table.Cell>
                <Table.Cell>
                  {org.activeBookings > 0 ? (
                    <Badge data-color="accent" data-size="sm">{org.activeBookings}</Badge>
                  ) : (
                    <span style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>0</span>
                  )}
                </Table.Cell>
                <Table.Cell>
                  {org.seasonLeases > 0 ? (
                    <Badge data-color="success" data-size="sm">{org.seasonLeases}</Badge>
                  ) : (
                    <span style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>0</span>
                  )}
                </Table.Cell>
                <Table.Cell>
                  <StatusBadge status={org.status} />
                </Table.Cell>
                <Table.Cell>
                  {new Date(org.createdAt).toLocaleDateString('nb-NO')}
                </Table.Cell>
                <Table.Cell>
                  <Dropdown.TriggerContext>
                    <Dropdown.Trigger asChild>
                      <Button
                        type="button"
                        variant="tertiary"
                        data-size="sm"
                        onClick={(e) => e.stopPropagation()}
                        aria-label="Handlinger"
                      >
                        <MoreIcon />
                      </Button>
                    </Dropdown.Trigger>
                    <Dropdown placement="bottom-end">
                      <Dropdown.List>
                        <Dropdown.Item>
                          <Dropdown.Button onClick={() => navigate(`/organizations/${org.id}`)}>
                            Se detaljer
                          </Dropdown.Button>
                        </Dropdown.Item>
                        <Dropdown.Item>
                          <Dropdown.Button>Rediger</Dropdown.Button>
                        </Dropdown.Item>
                        <Dropdown.Item>
                          <Dropdown.Button>Se bookinger</Dropdown.Button>
                        </Dropdown.Item>
                        <Dropdown.Item>
                          <Dropdown.Button>
                            {org.status === 'active' ? 'Deaktiver' : 'Aktiver'}
                          </Dropdown.Button>
                        </Dropdown.Item>
                      </Dropdown.List>
                    </Dropdown>
                  </Dropdown.TriggerContext>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Card>
    </div>
  );
}
