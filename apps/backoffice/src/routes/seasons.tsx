import { useMemo } from 'react';
import { Card, Heading, Paragraph, Button, Badge, Table, Dropdown, Spinner } from '@xala/ds';
import { useSeasonalLeases, useOrganizations, useListings, type SeasonalLease, type SeasonalLeaseStatus } from '@digilist/client-sdk';

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

// Map weekday numbers to Norwegian abbreviations (0 = Sunday, 1 = Monday, etc.)
const weekdayNames: Record<number, string> = {
  0: 'Søn',
  1: 'Man',
  2: 'Tir',
  3: 'Ons',
  4: 'Tor',
  5: 'Fre',
  6: 'Lør',
};

function formatWeekdays(weekdays: number[]): string[] {
  return weekdays.map((day) => weekdayNames[day] || '');
}

function formatPeriod(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return `${start.toLocaleDateString('nb-NO', { day: '2-digit', month: '2-digit' })} - ${end.toLocaleDateString('nb-NO', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
}

function formatTimeSlot(startTime: string, endTime: string): string {
  return `${startTime}-${endTime}`;
}

function StatusBadge({ status }: { status: SeasonalLeaseStatus }) {
  const config: Record<SeasonalLeaseStatus, { color: 'success' | 'info' | 'neutral' | 'warning'; label: string }> = {
    active: { color: 'success', label: 'Aktiv' },
    pending: { color: 'warning', label: 'Venter' },
    expired: { color: 'neutral', label: 'Utløpt' },
    terminated: { color: 'neutral', label: 'Avsluttet' },
  };
  const cfg = config[status] || { color: 'neutral', label: status };
  return <Badge data-color={cfg.color} data-size="sm">{cfg.label}</Badge>;
}

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
                    <StatusBadge status={lease.status} />
                  </Table.Cell>
                  <Table.Cell>{(lease.totalPrice || 0).toLocaleString('nb-NO')} kr</Table.Cell>
                  <Table.Cell>
                    <Dropdown.TriggerContext>
                      <Dropdown.Trigger asChild>
                        <Button type="button" variant="tertiary" data-size="sm" aria-label="Handlinger">
                          <MoreIcon />
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
