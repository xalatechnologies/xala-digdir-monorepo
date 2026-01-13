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
interface SeasonLease {
  id: string;
  organization: string;
  listingName: string;
  period: string;
  weekdays: string[];
  timeSlot: string;
  status: 'active' | 'upcoming' | 'expired';
  price: number;
}

const mockSeasonLeases: SeasonLease[] = [
  { id: 'SES-001', organization: 'Nordre Follo IL', listingName: 'Storhallen A', period: '01.01 - 30.06.2024', weekdays: ['Man', 'Ons'], timeSlot: '17:00-20:00', status: 'active', price: 45000 },
  { id: 'SES-002', organization: 'Ski Håndball', listingName: 'Storhallen A', period: '01.01 - 30.06.2024', weekdays: ['Tir', 'Tor'], timeSlot: '16:00-19:00', status: 'active', price: 42000 },
  { id: 'SES-003', organization: 'Ås Turnforening', listingName: 'Gymsalen', period: '01.01 - 30.06.2024', weekdays: ['Man', 'Ons', 'Fre'], timeSlot: '15:00-18:00', status: 'active', price: 38000 },
  { id: 'SES-004', organization: 'Langhus Fotball', listingName: 'Kunstgressbanen', period: '01.04 - 30.09.2024', weekdays: ['Man', 'Ons', 'Fre'], timeSlot: '17:00-20:00', status: 'upcoming', price: 55000 },
  { id: 'SES-005', organization: 'Vestby Korps', listingName: 'Aulaen', period: '01.08 - 31.12.2023', weekdays: ['Tir'], timeSlot: '18:00-21:00', status: 'expired', price: 15000 },
];

function StatusBadge({ status }: { status: SeasonLease['status'] }) {
  const config: Record<SeasonLease['status'], { color: 'success' | 'info' | 'neutral'; label: string }> = {
    active: { color: 'success', label: 'Aktiv' },
    upcoming: { color: 'info', label: 'Kommende' },
    expired: { color: 'neutral', label: 'Utløpt' },
  };
  return <Badge data-color={config[status].color} data-size="sm">{config[status].label}</Badge>;
}

export function SeasonsPage() {
  const activeCount = mockSeasonLeases.filter((s) => s.status === 'active').length;
  const upcomingCount = mockSeasonLeases.filter((s) => s.status === 'upcoming').length;

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
                Kommende
              </Paragraph>
              <Heading level={2} data-size="xl" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)' }}>
                {upcomingCount}
              </Heading>
            </div>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--ds-border-radius-md)',
                backgroundColor: 'var(--ds-color-info-surface-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--ds-color-info-text-default)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                {mockSeasonLeases.filter((s) => s.status !== 'expired').reduce((sum, s) => sum + s.price, 0).toLocaleString('nb-NO')} kr
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
            {mockSeasonLeases.map((lease) => (
              <Table.Row key={lease.id}>
                <Table.Cell>
                  <span style={{ fontFamily: 'monospace', fontSize: 'var(--ds-font-size-sm)' }}>
                    {lease.id}
                  </span>
                </Table.Cell>
                <Table.Cell>
                  <span style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>
                    {lease.organization}
                  </span>
                </Table.Cell>
                <Table.Cell>{lease.listingName}</Table.Cell>
                <Table.Cell>{lease.period}</Table.Cell>
                <Table.Cell>
                  <div style={{ display: 'flex', gap: 'var(--ds-spacing-1)' }}>
                    {lease.weekdays.map((day) => (
                      <Badge key={day} data-color="neutral" data-size="sm">
                        {day}
                      </Badge>
                    ))}
                  </div>
                </Table.Cell>
                <Table.Cell>{lease.timeSlot}</Table.Cell>
                <Table.Cell>
                  <StatusBadge status={lease.status} />
                </Table.Cell>
                <Table.Cell>{lease.price.toLocaleString('nb-NO')} kr</Table.Cell>
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
      </Card>
    </div>
  );
}
