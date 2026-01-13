import { useMemo } from 'react';
import { Card, Heading, Paragraph, Button, Table, Dropdown, Spinner, Badge, SeasonalLeaseStatusBadge, PlusIcon, MoreVerticalIcon } from '@xala/ds';
import {
  useSeasonalLeases,
  useOrganizations,
  useListings,
  type SeasonalLease,
  type SeasonalLeaseStatus,
  weekdayNames,
  formatWeekdays,
  formatPeriod,
  formatTimeSlot,
} from '@digilist/client-sdk';

export function SeasonsPage() {
  // Fetch seasonal leases from API
  const { data: leasesData, isLoading } = useSeasonalLeases();
  const leases = leasesData?.data ?? [];

  // Fetch organizations and listings for name lookups
  const { data: orgsData } = useOrganizations();
  const { data: listingsData } = useListings();

  const organizations = orgsData?.data ?? [];
  const listings = listingsData?.data ?? [];

  // Create lookup maps
  const orgMap = useMemo(() => {
    const map: Record<string, string> = {};
    organizations.forEach((org) => {
      map[org.id] = org.name;
    });
    return map;
  }, [organizations]);

  const listingMap = useMemo(() => {
    const map: Record<string, string> = {};
    listings.forEach((listing) => {
      map[listing.id] = listing.name;
    });
    return map;
  }, [listings]);

  // Calculate statistics
  const activeCount = leases.filter((l) => l.status === 'active').length;
  const pendingCount = leases.filter((l) => l.status === 'pending').length;
  const totalRevenue = leases
    .filter((l) => l.status === 'active' || l.status === 'pending')
    .reduce((sum, l) => sum + (l.totalPrice || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Heading level={1} data-size="lg" style={{ margin: 0 }}>
            Sesongleie
          </Heading>
          <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)', marginBottom: 0 }}>
            Administrer faste leieperioder for organisasjoner.
          </Paragraph>
        </div>
        <Button type="button" variant="primary" data-size="md">
          <PlusIcon />
          Opprett sesongleie
        </Button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--ds-spacing-4)' }}>
        <Card style={{ padding: 'var(--ds-spacing-5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                Aktive avtaler
              </Paragraph>
              <Heading level={2} data-size="xl" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)' }}>
                {activeCount}
              </Heading>
            </div>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--ds-border-radius-md)',
                backgroundColor: 'var(--ds-color-success-surface-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--ds-color-success-text-default)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>
        </Card>

        <Card style={{ padding: 'var(--ds-spacing-5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                Venter godkjenning
              </Paragraph>
              <Heading level={2} data-size="xl" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)' }}>
                {pendingCount}
              </Heading>
            </div>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--ds-border-radius-md)',
                backgroundColor: 'var(--ds-color-warning-surface-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--ds-color-warning-text-default)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
          </div>
        </Card>

        <Card style={{ padding: 'var(--ds-spacing-5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                Total omsetning
              </Paragraph>
              <Heading level={2} data-size="xl" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)' }}>
                {totalRevenue.toLocaleString('nb-NO')} kr
              </Heading>
            </div>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--ds-border-radius-md)',
                backgroundColor: 'var(--ds-color-accent-surface-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--ds-color-accent-text-default)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: 'var(--ds-spacing-8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Spinner />
          </div>
        ) : leases.length === 0 ? (
          <div style={{ padding: 'var(--ds-spacing-8)', textAlign: 'center' }}>
            <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
              Ingen sesongleieavtaler funnet.
            </Paragraph>
          </div>
        ) : (
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell>ID</Table.HeaderCell>
                <Table.HeaderCell>Organisasjon</Table.HeaderCell>
                <Table.HeaderCell>Lokale</Table.HeaderCell>
                <Table.HeaderCell>Periode</Table.HeaderCell>
                <Table.HeaderCell>Ukedager</Table.HeaderCell>
                <Table.HeaderCell>Tidspunkt</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>Pris</Table.HeaderCell>
                <Table.HeaderCell style={{ width: '60px' }}></Table.HeaderCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {leases.map((lease) => (
                <Table.Row key={lease.id}>
                  <Table.Cell>
                    <span style={{ fontFamily: 'monospace', fontSize: 'var(--ds-font-size-sm)' }}>
                      {lease.id.slice(0, 8)}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <span style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>
                      {orgMap[lease.organizationId] || lease.organizationId}
                    </span>
                  </Table.Cell>
                  <Table.Cell>{listingMap[lease.listingId] || lease.listingId}</Table.Cell>
                  <Table.Cell>{formatPeriod(lease.startDate, lease.endDate)}</Table.Cell>
                  <Table.Cell>
                    <div style={{ display: 'flex', gap: 'var(--ds-spacing-1)', flexWrap: 'wrap' }}>
                      {formatWeekdays(lease.weekdays).map((day, idx) => (
                        <Badge key={idx} data-color="neutral" data-size="sm">
                          {day}
                        </Badge>
                      ))}
                    </div>
                  </Table.Cell>
                  <Table.Cell>{formatTimeSlot(lease.startTime, lease.endTime)}</Table.Cell>
                  <Table.Cell>
                    <SeasonalLeaseStatusBadge status={lease.status} />
                  </Table.Cell>
                  <Table.Cell>{(lease.totalPrice || 0).toLocaleString('nb-NO')} kr</Table.Cell>
                  <Table.Cell>
                    <Dropdown.TriggerContext>
                      <Dropdown.Trigger asChild>
                        <Button type="button" variant="tertiary" data-size="sm" aria-label="Handlinger">
                          <MoreVerticalIcon />
                        </Button>
                      </Dropdown.Trigger>
                      <Dropdown placement="bottom-end">
                        <Dropdown.List>
                          <Dropdown.Item>
                            <Dropdown.Button>Rediger</Dropdown.Button>
                          </Dropdown.Item>
                          <Dropdown.Item>
                            <Dropdown.Button>Se i kalender</Dropdown.Button>
                          </Dropdown.Item>
                          <Dropdown.Item>
                            <Dropdown.Button>Forleng avtale</Dropdown.Button>
                          </Dropdown.Item>
                          <Dropdown.Item>
                            <Dropdown.Button>Avslutt avtale</Dropdown.Button>
                          </Dropdown.Item>
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
