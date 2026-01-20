import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Badge,
  Tag,
} from '@xala/ds';
import { RentalObjectCard } from '../../src/blocks/RentalObjectCard';
import { RentalObjectGrid } from '../../src/blocks/RentalObjectGrid';
import { RentalObjectListItem } from '../../src/blocks/RentalObjectListItem';
import type { RentalObjectCardProps } from '../../src/blocks/RentalObjectCard';
import type { RentalObjectListItemProps } from '../../src/blocks/RentalObjectListItem';

/**
 * RentalObject components for displaying rental objects (listings/venues).
 *
 * ## Components
 * - **RentalObjectCard**: Card view for grid layouts
 * - **RentalObjectGrid**: Responsive grid container (3/2/1 columns)
 * - **RentalObjectListItem**: Horizontal list view with image and map
 *
 * ## Features
 * - Multiple listing types (SPACE, RESOURCE, EVENT, SERVICE, VEHICLE)
 * - Favorite and share actions
 * - Location map integration
 * - Price display
 * - Facility chips
 * - Capacity indicator
 *
 * ## Accessibility
 * - Keyboard navigation
 * - Screen reader labels
 * - Focus management
 */
const meta: Meta<typeof RentalObjectGrid> = {
  title: 'Blocks/RentalObjects',
  component: RentalObjectGrid,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
Rental object display components for Norwegian municipal booking systems.

## View Modes
- **Grid**: 3-column responsive grid with cards
- **List**: Horizontal items with image, content, and map

## Listing Types
- SPACE: Meeting rooms, sports halls, venues
- RESOURCE: Equipment, tools
- EVENT: Concerts, workshops
- SERVICE: Professional services
- VEHICLE: Cars, boats, bikes
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RentalObjectGrid>;

// =============================================================================
// Sample Data
// =============================================================================

const sampleListings: (RentalObjectCardProps & { id: string })[] = [
  {
    id: '1',
    name: 'Idrettshall Sentrum',
    type: 'Idrettshall',
    listingType: 'SPACE',
    location: 'Oslo Sentrum',
    description: 'Moderne idrettshall med plass til 500 tilskuere. Perfekt for håndball, basketball og innendørs fotball.',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
    facilities: ['Garderobe', 'Dusj', 'Parkering', 'WiFi'],
    capacity: 500,
    price: 1500,
    priceUnit: 'time',
    currency: 'NOK',
  },
  {
    id: '2',
    name: 'Møterom Fjorden',
    type: 'Møterom',
    listingType: 'SPACE',
    location: 'Bergen Sentrum',
    description: 'Elegant møterom med utsikt over Vågen. Utstyrt med moderne AV-utstyr og videokonferanse.',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
    facilities: ['Projektor', 'Whiteboard', 'Kaffe', 'WiFi'],
    capacity: 20,
    price: 800,
    priceUnit: 'time',
    currency: 'NOK',
  },
  {
    id: '3',
    name: 'Kulturhus Aurora',
    type: 'Kulturhus',
    listingType: 'EVENT',
    location: 'Tromsø',
    description: 'Kulturhus med scene og sal for 300 personer. Ideelt for konserter, teater og konferanser.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    facilities: ['Scene', 'Lys', 'Lyd', 'Garderobe', 'Bar'],
    capacity: 300,
    price: 5000,
    priceUnit: 'dag',
    currency: 'NOK',
  },
  {
    id: '4',
    name: 'Svømmehall Vest',
    type: 'Svømmehall',
    listingType: 'SPACE',
    location: 'Stavanger',
    description: '50-meters olympisk basseng med stupetårn. Åpent for klubber og private arrangementer.',
    image: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=800&q=80',
    facilities: ['Garderobe', 'Sauna', 'Kafeteria', 'Parkering'],
    capacity: 200,
    price: 2500,
    priceUnit: 'time',
    currency: 'NOK',
  },
  {
    id: '5',
    name: 'Motorsykkel Honda CBR',
    type: 'Motorsykkel',
    listingType: 'VEHICLE',
    location: 'Trondheim',
    description: 'Honda CBR 600RR sportssykkel for daglig leie. Hjelm og sikkerhetsutstyr inkludert.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    facilities: ['Hjelm', 'Hansker', 'GPS'],
    capacity: 1,
    price: 1200,
    priceUnit: 'dag',
    currency: 'NOK',
  },
  {
    id: '6',
    name: 'Profesjonelt kamerautstyr',
    type: 'Utstyr',
    listingType: 'RESOURCE',
    location: 'Kristiansand',
    description: 'Canon EOS R5 med objektiver og belysningssett for profesjonell fotografering.',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80',
    facilities: ['Kamera', 'Objektiver', 'Stativ', 'Belysning'],
    capacity: 1,
    price: 600,
    priceUnit: 'dag',
    currency: 'NOK',
  },
];

// =============================================================================
// Grid Stories
// =============================================================================

/**
 * Default grid with rental object cards
 */
export const GridDefault: Story = {
  render: () => {
    const [favorites, setFavorites] = useState<string[]>([]);

    const toggleFavorite = (id: string) => {
      setFavorites(prev =>
        prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
      );
    };

    return (
      <RentalObjectGrid>
        {sampleListings.map((listing) => (
          <RentalObjectCard
            key={listing.id}
            {...listing}
            isFavorited={favorites.includes(listing.id)}
            onFavorite={() => toggleFavorite(listing.id)}
            onShare={() => console.log('Share:', listing.id)}
            onClick={() => console.log('Click:', listing.id)}
          />
        ))}
      </RentalObjectGrid>
    );
  },
};

/**
 * Grid with 2 columns max
 */
export const GridTwoColumns: Story = {
  render: () => (
    <RentalObjectGrid maxColumns={2}>
      {sampleListings.slice(0, 4).map((listing) => (
        <RentalObjectCard
          key={listing.id}
          {...listing}
          onClick={() => console.log('Click:', listing.id)}
        />
      ))}
    </RentalObjectGrid>
  ),
};

/**
 * Grid with custom gap
 */
export const GridCustomGap: Story = {
  render: () => (
    <RentalObjectGrid gap={48}>
      {sampleListings.slice(0, 3).map((listing) => (
        <RentalObjectCard
          key={listing.id}
          {...listing}
          onClick={() => console.log('Click:', listing.id)}
        />
      ))}
    </RentalObjectGrid>
  ),
};

// =============================================================================
// List Item Stories
// =============================================================================

/**
 * List view with rental object items
 */
export const ListView: Story = {
  render: () => {
    const [favorites, setFavorites] = useState<string[]>([]);

    const toggleFavorite = (id: string) => {
      setFavorites(prev =>
        prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
      );
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
        {sampleListings.slice(0, 4).map((listing) => (
          <RentalObjectListItem
            key={listing.id}
            id={listing.id}
            name={listing.name}
            type={listing.type}
            listingType={listing.listingType}
            location={listing.location}
            description={listing.description}
            image={listing.image}
            facilities={listing.facilities}
            capacity={listing.capacity}
            price={listing.price}
            priceUnit={listing.priceUnit}
            currency={listing.currency}
            isFavorited={favorites.includes(listing.id)}
            onFavorite={() => toggleFavorite(listing.id)}
            onShare={() => console.log('Share:', listing.id)}
            onClick={() => console.log('Click:', listing.id)}
          />
        ))}
      </div>
    );
  },
};

/**
 * List item without map
 */
export const ListItemNoMap: Story = {
  render: () => (
    <RentalObjectListItem
      id="1"
      name="Idrettshall Sentrum"
      type="Idrettshall"
      listingType="SPACE"
      location="Oslo Sentrum"
      description="Moderne idrettshall med plass til 500 tilskuere. Perfekt for håndball, basketball og innendørs fotball."
      image="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80"
      facilities={['Garderobe', 'Dusj', 'Parkering', 'WiFi']}
      capacity={500}
      price={1500}
      priceUnit="time"
      showMap={false}
      onClick={() => console.log('Click')}
    />
  ),
};

/**
 * List item with coordinates (shows map)
 */
export const ListItemWithCoordinates: Story = {
  render: () => (
    <RentalObjectListItem
      id="1"
      name="Operahuset"
      type="Konsertsal"
      listingType="EVENT"
      location="Bjørvika, Oslo"
      description="Den Norske Opera & Ballett. Verdensledende scene for opera og ballett i hjertet av Oslo."
      image="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80"
      facilities={['Scene', 'Lyd', 'Lys', 'Garderobe', 'Restaurant']}
      capacity={1364}
      price={50000}
      priceUnit="dag"
      latitude={59.9075}
      longitude={10.7530}
      showMap={true}
      onClick={() => console.log('Click')}
    />
  ),
};

/**
 * Minimal list item
 */
export const ListItemMinimal: Story = {
  render: () => (
    <RentalObjectListItem
      id="1"
      name="Lite møterom"
      type="Møterom"
      location="Sentrum"
      description="Enkelt møterom for 6 personer."
      image="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80"
      showCapacity={false}
      showFacilities={false}
      showMap={false}
      showPrice={false}
      showTypeBadge={false}
      showListingType={false}
      onClick={() => console.log('Click')}
    />
  ),
};

// =============================================================================
// View Mode Toggle Example
// =============================================================================

/**
 * Toggle between grid and list view
 */
export const ViewModeToggle: Story = {
  render: () => {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [favorites, setFavorites] = useState<string[]>([]);

    const toggleFavorite = (id: string) => {
      setFavorites(prev =>
        prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
      );
    };

    return (
      <div>
        {/* View Toggle */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--ds-spacing-4)',
          padding: 'var(--ds-spacing-3)',
          backgroundColor: 'var(--ds-color-neutral-surface-hover)',
          borderRadius: 'var(--ds-border-radius-md)',
        }}>
          <Paragraph data-size="sm" style={{ margin: 0 }}>
            {sampleListings.length} resultater
          </Paragraph>
          <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'tertiary'}
              data-size="sm"
              onClick={() => setViewMode('grid')}
            >
              Rutenett
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'tertiary'}
              data-size="sm"
              onClick={() => setViewMode('list')}
            >
              Liste
            </Button>
          </div>
        </div>

        {/* Content */}
        {viewMode === 'grid' ? (
          <RentalObjectGrid>
            {sampleListings.map((listing) => (
              <RentalObjectCard
                key={listing.id}
                {...listing}
                isFavorited={favorites.includes(listing.id)}
                onFavorite={() => toggleFavorite(listing.id)}
                onShare={() => console.log('Share:', listing.id)}
                onClick={() => console.log('Click:', listing.id)}
              />
            ))}
          </RentalObjectGrid>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
            {sampleListings.map((listing) => (
              <RentalObjectListItem
                key={listing.id}
                id={listing.id}
                name={listing.name}
                type={listing.type}
                listingType={listing.listingType}
                location={listing.location}
                description={listing.description}
                image={listing.image}
                facilities={listing.facilities}
                capacity={listing.capacity}
                price={listing.price}
                priceUnit={listing.priceUnit}
                currency={listing.currency}
                isFavorited={favorites.includes(listing.id)}
                onFavorite={() => toggleFavorite(listing.id)}
                onShare={() => console.log('Share:', listing.id)}
                onClick={() => console.log('Click:', listing.id)}
              />
            ))}
          </div>
        )}
      </div>
    );
  },
};

// =============================================================================
// Listing Type Variations
// =============================================================================

/**
 * All listing types showcased
 */
export const ListingTypes: Story = {
  render: () => {
    const listingTypes: { type: RentalObjectCardProps['listingType']; name: string; description: string }[] = [
      { type: 'SPACE', name: 'Møterom Aker', description: 'Lokaler og rom' },
      { type: 'RESOURCE', name: 'Projektor HD', description: 'Utstyr og ressurser' },
      { type: 'EVENT', name: 'Sommerfest 2026', description: 'Arrangementer' },
      { type: 'SERVICE', name: 'IT-support', description: 'Tjenester' },
      { type: 'VEHICLE', name: 'Elsykkel', description: 'Kjøretøy' },
      { type: 'OTHER', name: 'Diverse', description: 'Andre typer' },
    ];

    return (
      <RentalObjectGrid>
        {listingTypes.map((item, i) => (
          <RentalObjectCard
            key={i}
            id={`type-${i}`}
            name={item.name}
            type={item.description}
            listingType={item.type}
            location="Oslo"
            description={`Eksempel på ${item.description.toLowerCase()} for booking.`}
            image={`https://images.unsplash.com/photo-${1500000000000 + i * 10000}?w=800&q=80`}
            onClick={() => console.log('Click:', item.type)}
          />
        ))}
      </RentalObjectGrid>
    );
  },
};

// =============================================================================
// Loading and Empty States
// =============================================================================

/**
 * Empty state (no results)
 */
export const EmptyState: Story = {
  render: () => (
    <Card style={{ padding: 'var(--ds-spacing-8)', textAlign: 'center' }}>
      <Heading level={3} data-size="sm" style={{ margin: '0 0 var(--ds-spacing-2) 0' }}>
        Ingen resultater
      </Heading>
      <Paragraph data-size="sm" style={{ margin: '0 0 var(--ds-spacing-4) 0', color: 'var(--ds-color-neutral-text-subtle)' }}>
        Vi fant ingen utleieobjekter som matcher søket ditt.
      </Paragraph>
      <Button variant="secondary">Nullstill filter</Button>
    </Card>
  ),
};

/**
 * Loading skeleton (placeholder)
 */
export const LoadingSkeleton: Story = {
  render: () => (
    <RentalObjectGrid>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} style={{ overflow: 'hidden' }}>
          <div style={{
            height: '200px',
            backgroundColor: 'var(--ds-color-neutral-surface-hover)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
          <div style={{ padding: 'var(--ds-spacing-4)' }}>
            <div style={{
              height: '20px',
              width: '60%',
              backgroundColor: 'var(--ds-color-neutral-surface-hover)',
              borderRadius: 'var(--ds-border-radius-sm)',
              marginBottom: 'var(--ds-spacing-2)',
            }} />
            <div style={{
              height: '16px',
              width: '40%',
              backgroundColor: 'var(--ds-color-neutral-surface-hover)',
              borderRadius: 'var(--ds-border-radius-sm)',
              marginBottom: 'var(--ds-spacing-3)',
            }} />
            <div style={{
              height: '48px',
              backgroundColor: 'var(--ds-color-neutral-surface-hover)',
              borderRadius: 'var(--ds-border-radius-sm)',
            }} />
          </div>
          <style>{`
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
          `}</style>
        </Card>
      ))}
    </RentalObjectGrid>
  ),
};
