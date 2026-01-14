/**
 * Organizations routes - List view only (detail pages moved to organizations/ folder)
 */
import { useNavigate } from 'react-router-dom';
import { Card, Heading, Paragraph, Button, Badge, Table, Dropdown, Spinner } from '@xala/ds';
import { useOrganizations, formatDate, type Organization as OrgType } from '@digilist/client-sdk';

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

function StatusBadge({ status }: { status: OrgType['status'] }) {
  return (
    <Badge data-color={status === 'active' ? 'success' : status === 'inactive' ? 'neutral' : 'danger'} data-size="sm">
      {status === 'active' ? 'Aktiv' : status === 'inactive' ? 'Inaktiv' : 'Suspendert'}
    </Badge>
  );
}

export function OrganizationsPage() {
  const navigate = useNavigate();

  // Fetch organizations from SDK
  const { data, isLoading } = useOrganizations({ limit: 100 });
  const organizations = data?.data ?? [];

  // Calculate stats from real data
  const activeOrgs = organizations.filter((o) => o.status === 'active').length;

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 'var(--ds-spacing-8)' }}>
        <Spinner data-size="lg" aria-label="Laster organisasjoner..." />
      </div>
    );
  }

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
        <Button type="button" variant="primary" data-size="md" onClick={() => navigate('/organizations/new')}>
          <PlusIcon />
          Legg til organisasjon
        </Button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--ds-spacing-4)' }}>
        <Card style={{ padding: 'var(--ds-spacing-5)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
            Totalt organisasjoner
          </Paragraph>
          <Heading level={2} data-size="xl" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)' }}>
            {organizations.length}
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
            Verifiserte
          </Paragraph>
          <Heading level={2} data-size="xl" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)' }}>
            {organizations.filter((o) => o.verified).length}
          </Heading>
        </Card>
      </div>

      {/* Table */}
      {organizations.length === 0 ? (
        <Card style={{ padding: 'var(--ds-spacing-8)', textAlign: 'center' }}>
          <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
            Ingen organisasjoner
          </Heading>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-4)' }}>
            Det finnes ingen registrerte organisasjoner ennå.
          </Paragraph>
          <Button type="button" variant="primary" onClick={() => navigate('/organizations/new')}>
            <PlusIcon />
            Legg til første organisasjon
          </Button>
        </Card>
      ) : (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell>Navn</Table.HeaderCell>
                <Table.HeaderCell>Type</Table.HeaderCell>
                <Table.HeaderCell>Org.nr</Table.HeaderCell>
                <Table.HeaderCell>Kontakt</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>Registrert</Table.HeaderCell>
                <Table.HeaderCell style={{ width: '60px' }}></Table.HeaderCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {organizations.map((org) => (
                <Table.Row
                  key={org.id}
                  onClick={() => navigate(`/organizations/${org.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <Table.Cell>
                    <div>
                      <span style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>
                        {org.name}
                      </span>
                      {org.verified && (
                        <Badge data-color="success" data-size="sm" style={{ marginLeft: 'var(--ds-spacing-2)' }}>
                          Verifisert
                        </Badge>
                      )}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <span style={{ fontSize: 'var(--ds-font-size-sm)', textTransform: 'capitalize' }}>
                      {org.actorType === 'private' ? 'Privatperson' :
                       org.actorType === 'business' ? 'Bedrift' :
                       org.actorType === 'sports_club' ? 'Idrettslag' :
                       org.actorType === 'youth_organization' ? 'Ungdomsorg.' :
                       org.actorType === 'school' ? 'Skole' :
                       org.actorType === 'municipality' ? 'Kommune' : org.actorType}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    {org.organizationNumber ? (
                      <span style={{ fontFamily: 'monospace', fontSize: 'var(--ds-font-size-sm)' }}>
                        {org.organizationNumber}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--ds-color-neutral-text-subtle)', fontSize: 'var(--ds-font-size-sm)' }}>
                        -
                      </span>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    {org.email ? (
                      <a href={`mailto:${org.email}`} onClick={(e) => e.stopPropagation()} style={{ color: 'var(--ds-color-accent-text-default)', fontSize: 'var(--ds-font-size-sm)' }}>
                        {org.email}
                      </a>
                    ) : org.phone ? (
                      <a href={`tel:${org.phone}`} onClick={(e) => e.stopPropagation()} style={{ color: 'var(--ds-color-accent-text-default)', fontSize: 'var(--ds-font-size-sm)' }}>
                        {org.phone}
                      </a>
                    ) : (
                      <span style={{ color: 'var(--ds-color-neutral-text-subtle)', fontSize: 'var(--ds-font-size-sm)' }}>
                        -
                      </span>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <StatusBadge status={org.status} />
                  </Table.Cell>
                  <Table.Cell>
                    {formatDate(org.createdAt)}
                  </Table.Cell>
                  <Table.Cell onClick={(e) => e.stopPropagation()}>
                    <Dropdown.TriggerContext>
                      <Dropdown.Trigger asChild>
                        <Button
                          type="button"
                          variant="tertiary"
                          data-size="sm"
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
                            <Dropdown.Button onClick={() => navigate(`/organizations/${org.id}/edit`)}>
                              Rediger
                            </Dropdown.Button>
                          </Dropdown.Item>
                          <Dropdown.Item>
                            <Dropdown.Button onClick={() => navigate(`/bookings?organizationId=${org.id}`)}>
                              Se bookinger
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
      )}
    </div>
  );
}
