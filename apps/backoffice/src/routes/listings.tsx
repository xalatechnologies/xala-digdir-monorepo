import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Table,
  Dropdown,
  Spinner,
  ListingStatusBadge,
  PlusIcon,
  MoreVerticalIcon,
} from '@xala/ds';
import {
  useListings,
  usePublishListing,
  useArchiveListing,
  type ListingType,
  type ListingStatus,
  type Listing,
} from '@digilist/client-sdk';

function formatPrice(listing: Listing): string {
  const price = listing.pricing?.basePrice ?? listing.pricing?.hourlyRate ?? 0;
  const unit = listing.pricing?.unit === 'hour' ? 'time' : listing.pricing?.unit === 'day' ? 'dag' : 'booking';
  return `${price} kr/${unit}`;
}

type TabType = 'space' | 'resource' | 'service';

export function ListingsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('space');

  // Fetch all listings from API
  const { data: listingsData, isLoading } = useListings();
  const allListings = listingsData?.data ?? [];

  const publishListing = usePublishListing();
  const archiveListing = useArchiveListing();

  const typeMap: Record<TabType, ListingType> = {
    space: 'SPACE',
    resource: 'RESOURCE',
    service: 'SERVICE',
  };

  // Filter listings by type
  const filteredListings = useMemo(() => {
    return allListings.filter((l) => l.type === typeMap[activeTab]);
  }, [allListings, activeTab]);

  // Calculate tab counts
  const tabCounts = useMemo(() => ({
    space: allListings.filter((l) => l.type === 'SPACE').length,
    resource: allListings.filter((l) => l.type === 'RESOURCE').length,
    service: allListings.filter((l) => l.type === 'SERVICE').length,
  }), [allListings]);

  const handlePublish = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await publishListing.mutateAsync(id);
  };

  const handleArchive = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Er du sikker på at du vil arkivere denne oppføringen?')) {
      await archiveListing.mutateAsync(id);
    }
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
      {isLoading ? (
        <Card style={{ padding: 'var(--ds-spacing-8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spinner />
        </Card>
      ) : filteredListings.length === 0 ? (
        <Card style={{ padding: 'var(--ds-spacing-8)', textAlign: 'center' }}>
          <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
            Ingen {activeTab === 'space' ? 'lokaler' : activeTab === 'resource' ? 'utstyr' : 'tjenester'} funnet.
          </Paragraph>
        </Card>
      ) : (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell>Navn</Table.HeaderCell>
                <Table.HeaderCell>Pris</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>Sist endret</Table.HeaderCell>
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
                    {formatPrice(listing)}
                  </Table.Cell>
                  <Table.Cell>
                    <ListingStatusBadge status={listing.status} />
                  </Table.Cell>
                  <Table.Cell>
                    {new Date(listing.updatedAt).toLocaleDateString('nb-NO')}
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
                          <MoreVerticalIcon />
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
                              <Dropdown.Button onClick={(e) => handlePublish(listing.id, e)}>
                                Publiser
                              </Dropdown.Button>
                            </Dropdown.Item>
                          )}
                          {listing.status === 'published' && (
                            <Dropdown.Item>
                              <Dropdown.Button onClick={(e) => handleArchive(listing.id, e)}>
                                Avpubliser
                              </Dropdown.Button>
                            </Dropdown.Item>
                          )}
                          <Dropdown.Item>
                            <Dropdown.Button>Kopier</Dropdown.Button>
                          </Dropdown.Item>
                          <Dropdown.Item>
                            <Dropdown.Button onClick={(e) => handleArchive(listing.id, e)}>
                              Arkiver
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
