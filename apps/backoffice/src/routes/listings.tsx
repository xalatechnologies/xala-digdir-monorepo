import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Badge,
  Table,
  Dropdown,
} from '@xala/ds';
import type { ListingType, ListingStatus } from '@xala/sdk';

// Mock data for listings
interface ListingItem {
  id: string;
  name: string;
  type: ListingType;
  price: number;
  priceUnit: string;
  status: ListingStatus;
  updatedAt: string;
  assignee: string;
}

const mockListings: ListingItem[] = [
  { id: '1', name: 'Storhallen A', type: 'SPACE', price: 500, priceUnit: 'time', status: 'published', updatedAt: '2024-01-10', assignee: 'Kari N.' },
  { id: '2', name: 'Møterom 3B', type: 'SPACE', price: 200, priceUnit: 'time', status: 'published', updatedAt: '2024-01-09', assignee: 'Ola H.' },
  { id: '3', name: 'Gymsalen', type: 'SPACE', price: 400, priceUnit: 'time', status: 'draft', updatedAt: '2024-01-08', assignee: 'Kari N.' },
  { id: '4', name: 'Konferanserom', type: 'SPACE', price: 300, priceUnit: 'time', status: 'archived', updatedAt: '2024-01-05', assignee: 'Ola H.' },
  { id: '5', name: 'Projektor HD', type: 'RESOURCE', price: 50, priceUnit: 'dag', status: 'published', updatedAt: '2024-01-10', assignee: 'Kari N.' },
  { id: '6', name: 'Lydanlegg', type: 'RESOURCE', price: 100, priceUnit: 'dag', status: 'published', updatedAt: '2024-01-09', assignee: 'Ola H.' },
  { id: '7', name: 'Stoler (sett à 20)', type: 'RESOURCE', price: 150, priceUnit: 'dag', status: 'draft', updatedAt: '2024-01-07', assignee: 'Kari N.' },
  { id: '8', name: 'Rengjøring', type: 'SERVICE', price: 800, priceUnit: 'booking', status: 'published', updatedAt: '2024-01-10', assignee: 'Kari N.' },
  { id: '9', name: 'Vaktmester', type: 'SERVICE', price: 500, priceUnit: 'time', status: 'published', updatedAt: '2024-01-08', assignee: 'Ola H.' },
];

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

function StatusBadge({ status }: { status: ListingStatus }) {
  const colors: Record<ListingStatus, 'success' | 'warning' | 'neutral'> = {
    published: 'success',
    draft: 'warning',
    archived: 'neutral',
  };
  const labels: Record<ListingStatus, string> = {
    published: 'Publisert',
    draft: 'Utkast',
    archived: 'Arkivert',
  };
  return <Badge data-color={colors[status]} data-size="sm">{labels[status]}</Badge>;
}

type TabType = 'space' | 'resource' | 'service';

export function ListingsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('space');

  const typeMap: Record<TabType, ListingType> = {
    space: 'SPACE',
    resource: 'RESOURCE',
    service: 'SERVICE',
  };

  const filteredListings = mockListings.filter(
    (l) => l.type === typeMap[activeTab]
  );

  const tabCounts = {
    space: mockListings.filter((l) => l.type === 'SPACE').length,
    resource: mockListings.filter((l) => l.type === 'RESOURCE').length,
    service: mockListings.filter((l) => l.type === 'SERVICE').length,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Heading level={1} data-size="lg" style={{ margin: 0 }}>
            Lokaler & Ressurser
          </Heading>
          <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)', marginBottom: 0 }}>
            Administrer lokaler, utstyr og tjenester som kan leies ut.
          </Paragraph>
        </div>
        <Button type="button" variant="primary" data-size="md">
          <PlusIcon />
          Opprett ny
        </Button>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--ds-spacing-1)',
          borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
          paddingBottom: 'var(--ds-spacing-1)',
        }}
      >
        <Button
          type="button"
          variant={activeTab === 'space' ? 'primary' : 'tertiary'}
          data-size="sm"
          onClick={() => setActiveTab('space')}
        >
          Lokaler ({tabCounts.space})
        </Button>
        <Button
          type="button"
          variant={activeTab === 'resource' ? 'primary' : 'tertiary'}
          data-size="sm"
          onClick={() => setActiveTab('resource')}
        >
          Utstyr ({tabCounts.resource})
        </Button>
        <Button
          type="button"
          variant={activeTab === 'service' ? 'primary' : 'tertiary'}
          data-size="sm"
          onClick={() => setActiveTab('service')}
        >
          Tjenester ({tabCounts.service})
        </Button>
      </div>

      {/* Table */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <Table>
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell>Navn</Table.HeaderCell>
              <Table.HeaderCell>Pris</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell>Sist endret</Table.HeaderCell>
              <Table.HeaderCell>Ansvarlig</Table.HeaderCell>
              <Table.HeaderCell style={{ width: '60px' }}></Table.HeaderCell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {filteredListings.map((listing) => (
              <Table.Row
                key={listing.id}
                onClick={() => navigate(`/listings/${listing.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <Table.Cell>
                  <span style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>
                    {listing.name}
                  </span>
                </Table.Cell>
                <Table.Cell>
                  {listing.price} kr/{listing.priceUnit}
                </Table.Cell>
                <Table.Cell>
                  <StatusBadge status={listing.status} />
                </Table.Cell>
                <Table.Cell>
                  {new Date(listing.updatedAt).toLocaleDateString('nb-NO')}
                </Table.Cell>
                <Table.Cell>{listing.assignee}</Table.Cell>
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
                          <Dropdown.Button onClick={() => navigate(`/listings/${listing.id}`)}>
                            Rediger
                          </Dropdown.Button>
                        </Dropdown.Item>
                        {listing.status === 'draft' && (
                          <Dropdown.Item>
                            <Dropdown.Button>Publiser</Dropdown.Button>
                          </Dropdown.Item>
                        )}
                        {listing.status === 'published' && (
                          <Dropdown.Item>
                            <Dropdown.Button>Avpubliser</Dropdown.Button>
                          </Dropdown.Item>
                        )}
                        <Dropdown.Item>
                          <Dropdown.Button>Kopier</Dropdown.Button>
                        </Dropdown.Item>
                        <Dropdown.Item>
                          <Dropdown.Button>Arkiver</Dropdown.Button>
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

      {filteredListings.length === 0 && (
        <Card style={{ padding: 'var(--ds-spacing-8)', textAlign: 'center' }}>
          <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
            Ingen {activeTab === 'space' ? 'lokaler' : activeTab === 'resource' ? 'utstyr' : 'tjenester'} funnet.
          </Paragraph>
        </Card>
      )}
    </div>
  );
}
