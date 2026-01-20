import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Tag,
} from '@xala/ds';
import { MapPinIcon, ClockIcon, PhoneIcon, MailIcon, UsersIcon, StarIcon } from '@xala/ds';
import { ImageGallery } from '../../src/blocks/ImageGallery';
import { ImageSlider } from '../../src/blocks/ImageSlider';
import { ContactInfoCard } from '../../src/blocks/ContactInfoCard';
import { LocationCard } from '../../src/blocks/LocationCard';
import { OpeningHoursCard } from '../../src/blocks/OpeningHoursCard';
import { CapacityCard } from '../../src/blocks/CapacityCard';
import { FacilityChips } from '../../src/blocks/FacilityChips';
import type { GalleryImage, Facility } from '../../src/types/listing-detail';

/**
 * Listing detail components for rental object detail pages.
 *
 * ## Components
 * - **ImageGallery**: Hero image with vertical thumbnail sidebar
 * - **ImageSlider**: Horizontal carousel slider
 * - **ContactInfoCard**: Contact information display
 * - **LocationCard**: Location with map preview
 * - **OpeningHoursCard**: Opening hours display
 * - **CapacityCard**: Capacity and accessibility info
 * - **FacilityChips**: Facility/amenity chips
 *
 * ## Features
 * - Image navigation
 * - Responsive layouts
 * - Norwegian localization
 * - Accessibility support
 */
const meta: Meta<typeof ImageGallery> = {
  title: 'Blocks/ListingDetail',
  component: ImageGallery,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
Detail page components for rental object listings.

## Use Cases
- Rental object detail pages
- Venue information display
- Booking context panels
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ImageGallery>;

// =============================================================================
// Sample Data
// =============================================================================

const sampleImages: GalleryImage[] = [
  {
    id: '1',
    src: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80',
    alt: 'Idrettshall hovedbilde',
    thumbnail: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&q=80',
  },
  {
    id: '2',
    src: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1200&q=80',
    alt: 'Treningsområde',
    thumbnail: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=300&q=80',
  },
  {
    id: '3',
    src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
    alt: 'Garderobe',
    thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=80',
  },
  {
    id: '4',
    src: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=1200&q=80',
    alt: 'Svømmebasseng',
    thumbnail: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=300&q=80',
  },
];

const sampleFacilities: Facility[] = [
  { id: '1', label: 'Garderobe', icon: '🚿' },
  { id: '2', label: 'Dusj', icon: '🚿' },
  { id: '3', label: 'WiFi', icon: '📶' },
  { id: '4', label: 'Parkering', icon: '🅿️' },
  { id: '5', label: 'Kafeteria', icon: '☕' },
  { id: '6', label: 'Rullestol', icon: '♿' },
  { id: '7', label: 'Heis', icon: '🛗' },
  { id: '8', label: 'Projektor', icon: '📽️' },
];

// =============================================================================
// Image Gallery Stories
// =============================================================================

/**
 * Default image gallery with thumbnails
 */
export const GalleryDefault: Story = {
  render: () => (
    <ImageGallery
      images={sampleImages}
      showCounter={true}
      height={500}
      onImageClick={(index) => console.log('Clicked image:', index)}
    />
  ),
};

/**
 * Gallery with single image (no thumbnails)
 */
export const GallerySingleImage: Story = {
  render: () => (
    <ImageGallery
      images={[sampleImages[0]!]}
      showCounter={false}
      height={400}
    />
  ),
};

/**
 * Gallery with many thumbnails
 */
export const GalleryManyImages: Story = {
  render: () => (
    <ImageGallery
      images={[...sampleImages, ...sampleImages]}
      maxThumbnails={4}
      height={500}
    />
  ),
};

/**
 * Empty gallery state
 */
export const GalleryEmpty: Story = {
  render: () => (
    <ImageGallery
      images={[]}
      height={400}
    />
  ),
};

// =============================================================================
// Image Slider Stories
// =============================================================================

/**
 * Horizontal image slider
 */
export const SliderDefault: Story = {
  render: () => (
    <ImageSlider
      images={sampleImages}
      showCounter={true}
      showArrows={true}
      height={400}
    />
  ),
};

/**
 * Auto-playing slider
 */
export const SliderAutoplay: Story = {
  render: () => (
    <ImageSlider
      images={sampleImages}
      autoPlay={3000}
      height={400}
    />
  ),
};

// =============================================================================
// Contact Info Card Stories
// =============================================================================

/**
 * Contact information card
 */
export const ContactInfo: Story = {
  render: () => (
    <div style={{ maxWidth: '400px' }}>
      <ContactInfoCard
        contactName="Oslo Idrettshall"
        phone="+47 22 33 44 55"
        email="booking@osloidrettshall.no"
        website="https://osloidrettshall.no"
        title="Oslo Kommune"
      />
    </div>
  ),
};

/**
 * Minimal contact card (only required fields)
 */
export const ContactInfoMinimal: Story = {
  render: () => (
    <div style={{ maxWidth: '400px' }}>
      <ContactInfoCard
        contactName="Kontaktperson"
        email="kontakt@example.no"
      />
    </div>
  ),
};

// =============================================================================
// Location Card Stories
// =============================================================================

/**
 * Location card with address
 */
export const Location: Story = {
  render: () => (
    <div style={{ maxWidth: '400px' }}>
      <LocationCard
        address="Sonja Henies plass 2, 0185 Oslo"
        latitude={59.9075}
        longitude={10.7530}
      />
    </div>
  ),
};

/**
 * Location card without map
 */
export const LocationNoMap: Story = {
  render: () => (
    <div style={{ maxWidth: '400px' }}>
      <LocationCard
        address="Bryggen 5, 5003 Bergen"
        showExpandLink={false}
      />
    </div>
  ),
};

// =============================================================================
// Opening Hours Card Stories
// =============================================================================

/**
 * Standard opening hours
 */
export const OpeningHours: Story = {
  render: () => (
    <div style={{ maxWidth: '400px' }}>
      <OpeningHoursCard
        hours={[
          { day: 'Mandag', hours: '08:00 - 22:00' },
          { day: 'Tirsdag', hours: '08:00 - 22:00' },
          { day: 'Onsdag', hours: '08:00 - 22:00' },
          { day: 'Torsdag', hours: '08:00 - 22:00' },
          { day: 'Fredag', hours: '08:00 - 20:00' },
          { day: 'Lørdag', hours: '10:00 - 18:00' },
          { day: 'Søndag', hours: 'Stengt', isClosed: true },
        ]}
      />
    </div>
  ),
};

/**
 * Always open
 */
export const OpeningHours24_7: Story = {
  render: () => (
    <div style={{ maxWidth: '400px' }}>
      <OpeningHoursCard
        hours={[
          { day: 'Mandag - Søndag', hours: 'Døgnåpent' },
        ]}
        title="Åpningstider (Tilgang med nøkkelkort hele døgnet)"
      />
    </div>
  ),
};

// =============================================================================
// Capacity Card Stories
// =============================================================================

/**
 * Capacity card with accessibility info
 */
export const Capacity: Story = {
  render: () => (
    <div style={{ maxWidth: '400px' }}>
      <CapacityCard
        maxCapacity={500}
        label="MAKS TILLATT"
      />
    </div>
  ),
};

/**
 * Simple capacity
 */
export const CapacitySimple: Story = {
  render: () => (
    <div style={{ maxWidth: '400px' }}>
      <CapacityCard
        maxCapacity={20}
      />
    </div>
  ),
};

// =============================================================================
// Facility Chips Stories
// =============================================================================

/**
 * Facility chips display
 */
export const Facilities: Story = {
  render: () => (
    <FacilityChips
      facilities={sampleFacilities}
    />
  ),
};

/**
 * Facility chips with max display
 */
export const FacilitiesLimited: Story = {
  render: () => (
    <FacilityChips
      facilities={sampleFacilities}
      maxVisible={4}
    />
  ),
};

// =============================================================================
// Complete Detail Page Example
// =============================================================================

/**
 * Complete listing detail sidebar
 */
export const CompleteDetailSidebar: Story = {
  render: () => (
    <div style={{ maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
      {/* Price Card */}
      <Card style={{ padding: 'var(--ds-spacing-4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 'var(--ds-spacing-3)' }}>
          <Heading level={3} data-size="lg" style={{ margin: 0 }}>
            1 500 kr
          </Heading>
          <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
            per time
          </Paragraph>
        </div>
        <Button variant="primary" style={{ width: '100%' }}>
          Book nå
        </Button>
      </Card>

      {/* Capacity */}
      <CapacityCard
        maxCapacity={500}
      />

      {/* Facilities */}
      <Card style={{ padding: 'var(--ds-spacing-4)' }}>
        <Heading level={4} data-size="xs" style={{ margin: '0 0 var(--ds-spacing-3) 0' }}>
          Fasiliteter
        </Heading>
        <FacilityChips facilities={sampleFacilities} maxVisible={6} />
      </Card>

      {/* Location */}
      <LocationCard
        address="Sonja Henies plass 2, 0185 Oslo"
        latitude={59.9075}
        longitude={10.7530}
      />

      {/* Opening Hours */}
      <OpeningHoursCard
        hours={[
          { day: 'Mandag - Fredag', hours: '08:00 - 22:00' },
          { day: 'Lørdag', hours: '10:00 - 18:00' },
          { day: 'Søndag', hours: 'Stengt', isClosed: true },
        ]}
      />

      {/* Contact */}
      <ContactInfoCard
        contactName="Oslo Idrettshall"
        phone="+47 22 33 44 55"
        email="booking@osloidrettshall.no"
        title="Oslo Kommune"
      />
    </div>
  ),
};

/**
 * Complete detail page layout
 */
export const CompleteDetailPage: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 'var(--ds-spacing-6)' }}>
      {/* Main Content */}
      <div>
        {/* Gallery */}
        <ImageGallery
          images={sampleImages}
          height={450}
          onImageClick={(index) => console.log('Open lightbox:', index)}
        />

        {/* Title and Info */}
        <div style={{ marginTop: 'var(--ds-spacing-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)', marginBottom: 'var(--ds-spacing-2)' }}>
            <Tag data-color="accent" data-size="sm">Idrettshall</Tag>
            <Tag data-color="success" data-size="sm">Ledig i dag</Tag>
          </div>
          <Heading level={1} data-size="xl" style={{ margin: '0 0 var(--ds-spacing-2) 0' }}>
            Oslo Idrettshall Sentrum
          </Heading>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-4)', color: 'var(--ds-color-neutral-text-subtle)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-1)' }}>
              <MapPinIcon size={16} />
              Oslo Sentrum
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-1)' }}>
              <UsersIcon size={16} />
              500 personer
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-1)' }}>
              <StarIcon size={16} />
              4.8 (24 anmeldelser)
            </span>
          </div>
        </div>

        {/* Description */}
        <div style={{ marginTop: 'var(--ds-spacing-6)' }}>
          <Heading level={2} data-size="sm" style={{ margin: '0 0 var(--ds-spacing-3) 0' }}>
            Om lokalet
          </Heading>
          <Paragraph data-size="md" style={{ margin: 0 }}>
            Moderne idrettshall i hjertet av Oslo. Hallen er utstyrt med profesjonelt gulv
            egnet for håndball, basketball, innendørs fotball og volleyball. Tribuneplass
            for 500 tilskuere. Garderober med dusj og toaletter. Gratis parkering for besøkende.
          </Paragraph>
        </div>

        {/* Facilities Section */}
        <div style={{ marginTop: 'var(--ds-spacing-6)' }}>
          <Heading level={2} data-size="sm" style={{ margin: '0 0 var(--ds-spacing-3) 0' }}>
            Fasiliteter
          </Heading>
          <FacilityChips facilities={sampleFacilities} />
        </div>
      </div>

      {/* Sidebar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
        {/* Booking Card */}
        <Card style={{ padding: 'var(--ds-spacing-5)', position: 'sticky', top: 'var(--ds-spacing-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 'var(--ds-spacing-4)' }}>
            <Heading level={3} data-size="lg" style={{ margin: 0 }}>
              1 500 kr
            </Heading>
            <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
              per time
            </Paragraph>
          </div>

          <Button variant="primary" data-size="lg" style={{ width: '100%', marginBottom: 'var(--ds-spacing-3)' }}>
            Velg tidspunkt
          </Button>

          <Paragraph data-size="xs" style={{ margin: 0, textAlign: 'center', color: 'var(--ds-color-neutral-text-subtle)' }}>
            Gratis avbestilling inntil 24 timer før
          </Paragraph>
        </Card>

        {/* Contact */}
        <ContactInfoCard
          contactName="Booking"
          phone="+47 22 33 44 55"
          email="booking@osloidrettshall.no"
          title="Oslo Kommune"
        />

        {/* Opening Hours */}
        <OpeningHoursCard
          hours={[
            { day: 'Man - Fre', hours: '08:00 - 22:00' },
            { day: 'Lørdag', hours: '10:00 - 18:00' },
            { day: 'Søndag', hours: 'Stengt', isClosed: true },
          ]}
        />
      </div>
    </div>
  ),
};
