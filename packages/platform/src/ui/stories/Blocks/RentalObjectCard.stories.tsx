import type { Meta, StoryObj } from '@storybook/react-vite';
import { RentalObjectCard } from '@xalatechnologies/platform/ui/blocks/RentalObjectCard';

const meta: Meta<typeof RentalObjectCard> = {
  title: 'Blocks/RentalObjectCard',
  component: RentalObjectCard,
  parameters: {
    docs: {
      description: {
        component: `
RentalObjectCard displays rental listing information with images, pricing, and actions.

## Features
- Grid and detailed variants
- Image with badge overlays
- Favorite and share actions
- Capacity and pricing display
- Facility tags

## When to Use
- Listing grids and search results
- Featured listings
- Popup/modal detail views
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RentalObjectCard>;

const sampleListing = {
  id: '1',
  name: 'Stort møterom med projektor',
  type: 'Møterom',
  listingType: 'SPACE' as const,
  location: 'Oslo Sentrum',
  description: 'Moderne møterom med plass til 20 personer. Utstyrt med projektor, whiteboard og videokonferanseutstyr.',
  image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop',
  facilities: ['WiFi', 'Projektor', 'Whiteboard'],
  capacity: 20,
  price: 500,
  priceUnit: 'time',
  currency: 'kr',
  available: true,
};

/**
 * Default grid card
 */
export const Default: Story = {
  args: {
    ...sampleListing,
    onClick: (id: string) => console.log('Clicked:', id),
    onFavorite: (id: string) => console.log('Favorite:', id),
    onShare: (id: string) => console.log('Share:', id),
  },
};

/**
 * Card with rating (when enabled)
 */
export const WithRating: Story = {
  args: {
    ...sampleListing,
    showRating: true,
    rating: 4.8,
    reviewCount: 24,
    onClick: (id: string) => console.log('Clicked:', id),
  },
};

/**
 * Card with price displayed
 */
export const WithPrice: Story = {
  args: {
    ...sampleListing,
    showPrice: true,
    onClick: (id: string) => console.log('Clicked:', id),
  },
};

/**
 * Favorited state
 */
export const Favorited: Story = {
  args: {
    ...sampleListing,
    isFavorited: true,
    onClick: (id: string) => console.log('Clicked:', id),
    onFavorite: (id: string) => console.log('Toggle favorite:', id),
  },
};

/**
 * Unavailable listing
 */
export const Unavailable: Story = {
  args: {
    ...sampleListing,
    available: false,
    onClick: (id: string) => console.log('Clicked:', id),
  },
};

/**
 * Detailed variant for popup/modal
 */
export const Detailed: Story = {
  args: {
    ...sampleListing,
    variant: 'detailed',
    showPrice: true,
    onClick: (id: string) => console.log('Clicked:', id),
    onClose: () => console.log('Close clicked'),
  },
};

/**
 * Minimal card (no facilities, no description)
 */
export const Minimal: Story = {
  args: {
    ...sampleListing,
    showFacilities: false,
    showDescription: false,
    showFavoriteButton: false,
    showShareButton: false,
    onClick: (id: string) => console.log('Clicked:', id),
  },
};

/**
 * Different listing types
 */
export const ListingTypes: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--ds-spacing-4)' }}>
      <RentalObjectCard
        {...sampleListing}
        id="1"
        name="Møterom A"
        listingType="SPACE"
        type="Lokale"
      />
      <RentalObjectCard
        {...sampleListing}
        id="2"
        name="Projektor HD"
        listingType="RESOURCE"
        type="Utstyr"
      />
      <RentalObjectCard
        {...sampleListing}
        id="3"
        name="Sommerfest 2024"
        listingType="EVENT"
        type="Arrangement"
      />
    </div>
  ),
};
