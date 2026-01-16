/**
 * Access Grants Page
 * Commune Admin view for managing organization access to rental objects
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Badge,
  Table,
  Dropdown,
  Spinner,
  PlusIcon,
  MoreVerticalIcon,
  FilterIcon,
  ShieldCheckIcon,
  EyeIcon,
  TrashIcon,
  HeaderSearch,
} from '@xala/ds';
import {
  useAccessGrants,
  useRevokeAccess,
  type AccessGrantWithDetails,
  type AccessGrantStatus,
} from '@digilist/client-sdk';
import { useT } from '@xala/i18n';

const statusLabels: Record<AccessGrantStatus, string> = {
  active: 'Aktiv',
  revoked: 'Tilbakekalt',
  expired: 'Utl\u00F8pt',
};

const statusColors: Record<AccessGrantStatus, 'success' | 'danger' | 'warning'> = {
  active: 'success',
  revoked: 'danger',
  expired: 'warning',
};

export function AccessGrantsPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const t = useT();
  const navigate = useNavigate();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AccessGrantStatus | 'all'>('all');

  // Queries
  const { data: grantsData, isLoading } = useAccessGrants({
    status: statusFilter === 'all' ? undefined : statusFilter,
  });
  const grants = (grantsData?.data ?? []) as AccessGrantWithDetails[];

  // Mutations
  const revokeAccessMutation = useRevokeAccess();

  // Filter grants by search query
  const filteredGrants = useMemo(() => {
    if (!searchQuery) return grants;
    const query = searchQuery.toLowerCase();
    return grants.filter(
      (grant) =>
        grant.organization?.name?.toLowerCase().includes(query) ||
        grant.rentalObject?.name?.toLowerCase().includes(query)
    );
  }, [grants, searchQuery]);

  // Handlers
  const handleRevoke = async (id: string) => {
    if (confirm('Er du sikker p\u00E5 at du vil tilbakekalle denne tilgangen?')) {
      await revokeAccessMutation.mutateAsync({ id, reason: 'Manuelt tilbakekalt' });
    }
  };

  const handleViewDetail = (grant: AccessGrantWithDetails) => {
    navigate(`/organizations/${grant.organizationId}`);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '\u2014';
    return new Date(dateString).toLocaleDateString('nb-NO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-5)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Heading level={2} data-size="md">
            Tilgangstildelinger
          </Heading>
          <Paragraph
            data-size="sm"
            style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-1)' }}
          >
            Administrer organisasjoners tilgang til utleieobjekter
          </Paragraph>
        </div>
        <Button type="button" onClick={() => navigate('/access-grants/new')}>
          <PlusIcon />
          Ny tildeling
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1 1 300px', minWidth: '200px' }}>
            <HeaderSearch
              placeholder="S\u00F8k etter organisasjon eller utleieobjekt..."
              value={searchQuery}
              onSearchChange={(value) => setSearchQuery(value)}
            />
          </div>

          <Dropdown.TriggerContext>
            <Dropdown.Trigger variant="secondary" data-size="sm">
              <FilterIcon />
              Status: {statusFilter === 'all' ? 'Alle' : statusLabels[statusFilter]}
            </Dropdown.Trigger>
            <Dropdown>
              <Dropdown.List>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setStatusFilter('all')}>Alle</Dropdown.Button>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setStatusFilter('active')}>Aktiv</Dropdown.Button>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setStatusFilter('revoked')}>Tilbakekalt</Dropdown.Button>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Dropdown.Button onClick={() => setStatusFilter('expired')}>Utl\u00F8pt</Dropdown.Button>
                </Dropdown.Item>
              </Dropdown.List>
            </Dropdown>
          </Dropdown.TriggerContext>
        </div>
      </Card>

      {/* Results */}
      <Card>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
            <Spinner data-size="lg" aria-label="Laster..." />
          </div>
        ) : filteredGrants.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--ds-spacing-8)' }}>
            <ShieldCheckIcon
              style={{
                fontSize: 'var(--ds-font-size-heading-lg)',
                color: 'var(--ds-color-neutral-text-subtle)',
                marginBottom: 'var(--ds-spacing-3)',
              }}
            />
            <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
              Ingen tilgangstildelinger funnet
            </Heading>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              {searchQuery || statusFilter !== 'all'
                ? 'Pr\u00F8v \u00E5 endre s\u00F8kekriteriene'
                : 'Opprett din f\u00F8rste tilgangstildeling for \u00E5 komme i gang'}
            </Paragraph>
            {!searchQuery && statusFilter === 'all' && (
              <Button
                data-size="sm"
                style={{ marginTop: 'var(--ds-spacing-4)' }}
                type="button"
                onClick={() => navigate('/access-grants/new')}
              >
                <PlusIcon />
                Ny tildeling
              </Button>
            )}
          </div>
        ) : (
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell>Organisasjon</Table.HeaderCell>
                <Table.HeaderCell>Utleieobjekt</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>Tildelt</Table.HeaderCell>
                <Table.HeaderCell>Utl\u00F8per</Table.HeaderCell>
                <Table.HeaderCell style={{ width: '80px' }}>Handlinger</Table.HeaderCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {filteredGrants.map((grant) => (
                <Table.Row
                  key={grant.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleViewDetail(grant)}
                >
                  <Table.Cell>
                    <div style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>
                      {grant.organization?.name ?? '\u2014'}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div style={{ fontSize: 'var(--ds-font-size-sm)' }}>
                      {grant.rentalObject?.name ?? '\u2014'}
                    </div>
                    {grant.rentalObject?.type && (
                      <div
                        style={{
                          fontSize: 'var(--ds-font-size-xs)',
                          color: 'var(--ds-color-neutral-text-subtle)',
                        }}
                      >
                        {grant.rentalObject.type}
                      </div>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={statusColors[grant.status]}>{statusLabels[grant.status]}</Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <div style={{ fontSize: 'var(--ds-font-size-sm)' }}>{formatDate(grant.grantedAt)}</div>
                    {grant.grantedByUser?.name && (
                      <div
                        style={{
                          fontSize: 'var(--ds-font-size-xs)',
                          color: 'var(--ds-color-neutral-text-subtle)',
                        }}
                      >
                        av {grant.grantedByUser.name}
                      </div>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    {grant.expiresAt ? (
                      <div style={{ fontSize: 'var(--ds-font-size-sm)' }}>{formatDate(grant.expiresAt)}</div>
                    ) : (
                      <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                        Ingen utl\u00F8psdato
                      </div>
                    )}
                  </Table.Cell>
                  <Table.Cell onClick={(e) => e.stopPropagation()}>
                    <Dropdown.TriggerContext>
                      <Dropdown.Trigger variant="tertiary" data-size="sm">
                        <MoreVerticalIcon />
                      </Dropdown.Trigger>
                      <Dropdown>
                        <Dropdown.List>
                          <Dropdown.Item>
                            <Dropdown.Button onClick={() => handleViewDetail(grant)}>
                              <EyeIcon />
                              Vis organisasjon
                            </Dropdown.Button>
                          </Dropdown.Item>
                          {grant.status === 'active' && (
                            <Dropdown.Item>
                              <Dropdown.Button onClick={() => handleRevoke(grant.id)} data-color="danger">
                                <TrashIcon />
                                Tilbakekall tilgang
                              </Dropdown.Button>
                            </Dropdown.Item>
                          )}
                        </Dropdown.List>
                      </Dropdown>
                    </Dropdown.TriggerContext>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </Card>
    </div>
  );
}
