/**
 * ListingDetailPage V2
 *
 * Refactored listing detail page using new feature-based architecture.
 * Structure: Breadcrumb -> ImageSlider (LOCKED) -> ListingDetailsLayout
 */
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ContentLayout,
  Breadcrumb,
  ImageSlider,
  Spinner,
  Paragraph,
} from '@xala/ds';
import type { BreadcrumbItem, GalleryImage } from '@xala/ds';
import { useListing, useListingBySlug, type Listing as ApiListing } from '@digilist/client-sdk';
import {
  ListingDetailsLayout,
  type Listing,
  type ListingType,
  type BookingMode,
  type DayHours,
  type OpeningHours,
  type KeyFacts,
  type ListingMetadata,
  type Rule,
  type FAQItem,
  type Amenity,
  type IncludedFacility,
  logAuditEvent,
} from '../features/listing-details';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const TENANT_ID = import.meta.env.VITE_TENANT_ID || 'default-tenant';

// Transform API listing to feature Listing type
function transformApiToListing(api: ApiListing): Listing {
  const meta = (api.metadata || {}) as Record<string, unknown>;
  const typeMap: Record<string, ListingType> = { EQUIPMENT: 'EQUIPMENT', EVENT: 'EVENT', FACILITY: 'FACILITY', SPACE: 'FACILITY' };
  const listingType: ListingType = typeMap[api.type] || 'OTHER';
  
  const amenities: Amenity[] = ((meta.facilities as string[]) || []).map((f, i) => ({ 
    id: `a-${i}`, 
    name: f,
    description: f,
    category: 'general'
  }));
  
  const includedFacilities: IncludedFacility[] = ((meta.includedEquipment as Array<{ name: string; quantity?: number; description?: string }>) || []).map((e, i) => {
    const facility: IncludedFacility = {
      id: `inc-${i}`,
      name: e.name,
    };
    
    if (e.quantity !== undefined) {
      facility.quantity = e.quantity;
    }
    
    if (e.description !== undefined) {
      facility.description = e.description;
    }
    
    return facility;
  });
  
  const rules: Rule[] = ((meta.guidelines as Array<{ id: string; title: string; content: string }>) || []).map((g, i) => ({
    id: g.id || `rule-${i}`, title: g.title, content: g.content, category: 'general' as const,
  }));
  const faq: FAQItem[] = ((meta.faq as Array<{ id: string; question: string; answer: string }>) || []).map((f, i) => ({
    id: f.id || `faq-${i}`, question: f.question, answer: f.answer,
  }));

  const keyFacts: KeyFacts = { ...(api.capacity ? { capacity: api.capacity } : {}), bookingMode: 'SLOTS' as BookingMode };
  const metadata: ListingMetadata = { 
    description: api.description || '', 
    amenities, 
    includedFacilities, 
    rules, 
    faq,
    highlights: ((meta.highlights as string[]) || [])
  };

  return {
    id: api.id,
    tenantId: TENANT_ID,
    type: listingType,
    name: api.name,
    category: (meta.category as string) || api.type,
    status: 'published',
    images: (api.images || []).map((src: string, i: number) => ({ id: `${i}`, url: src, alt: `${api.name} - ${i + 1}`, isPrimary: i === 0, order: i })),
    ...(meta.address ? {
      address: {
        formatted: [meta.address, meta.postalCode, meta.city].filter(Boolean).join(', '),
        ...(typeof meta.latitude === 'number' ? { coordinates: { latitude: meta.latitude as number, longitude: meta.longitude as number } } : {}),
      },
    } : {}),
    ...(meta.contactEmail ? {
      contact: {
        email: meta.contactEmail as string,
        ...(meta.contactPhone ? { phone: meta.contactPhone as string } : {}),
        ...(meta.contactName ? { name: meta.contactName as string } : {}),
      },
    } : {}),
    openingHours: buildOpeningHours(meta),
    keyFacts,
    metadata,
    bookingConfig: { enabled: true, mode: 'SLOTS', approval: 'NONE', paymentRequired: false },
    ...(api.pricing?.basePrice ? { pricing: { basePrice: api.pricing.basePrice, currency: 'NOK', unit: 'time', displayPrice: `${api.pricing.basePrice} kr/time` } } : {}),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function buildOpeningHours(meta: Record<string, unknown>): OpeningHours {
  const data = meta.openingHours as Record<string, { open: string; close: string }> | undefined;
  const dayMap: Record<string, [string, number]> = {
    monday: ['Mandag', 1], tuesday: ['Tirsdag', 2], wednesday: ['Onsdag', 3],
    thursday: ['Torsdag', 4], friday: ['Fredag', 5], saturday: ['Lørdag', 6], sunday: ['Søndag', 0],
  };
  if (data) {
    const regular: DayHours[] = Object.entries(data).map(([d, h]) => ({
      day: dayMap[d]?.[0] || d, dayIndex: dayMap[d]?.[1] || 0, open: h.open, close: h.close, isClosed: !h.open,
    }));
    return { regular };
  }
  return {
    regular: [
      { day: 'Mandag', dayIndex: 1, open: '08:00', close: '22:00', isClosed: false },
      { day: 'Tirsdag', dayIndex: 2, open: '08:00', close: '22:00', isClosed: false },
      { day: 'Onsdag', dayIndex: 3, open: '08:00', close: '22:00', isClosed: false },
      { day: 'Torsdag', dayIndex: 4, open: '08:00', close: '22:00', isClosed: false },
      { day: 'Fredag', dayIndex: 5, open: '08:00', close: '22:00', isClosed: false },
      { day: 'Lørdag', dayIndex: 6, open: '09:00', close: '18:00', isClosed: false },
      { day: 'Søndag', dayIndex: 0, isClosed: true },
    ],
  };
}

// Mock listing for fallback
const mockListing: Listing = {
  id: 'mock-1', tenantId: TENANT_ID, type: 'FACILITY', name: 'Møterom Oslo', category: 'Møterom', status: 'published',
  images: [
    { id: '1', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800', alt: 'Møterom', isPrimary: true, order: 0 },
    { id: '2', url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800', alt: 'Møterom 2', order: 1 },
    { id: '3', url: 'https://images.unsplash.com/photo-1519452575417-564c1401ecc0?w=800', alt: 'Møterom 3', order: 2 },
    { id: '4', url: 'https://images.unsplash.com/photo-1520333786092-a152e767cdda?w=800', alt: 'Møterom 4', order: 3 },
  ],
  address: { formatted: 'Karl Johans gate 1, Oslo', coordinates: { latitude: 59.9139, longitude: 10.7522 } },
  contact: { name: 'Admin', email: 'admin@example.com', phone: '+47 123 45 678' },
  openingHours: { regular: [
    { day: 'Mandag', dayIndex: 1, open: '08:00', close: '22:00', isClosed: false },
    { day: 'Tirsdag', dayIndex: 2, open: '08:00', close: '22:00', isClosed: false },
    { day: 'Onsdag', dayIndex: 3, open: '08:00', close: '22:00', isClosed: false },
    { day: 'Torsdag', dayIndex: 4, open: '08:00', close: '22:00', isClosed: false },
    { day: 'Fredag', dayIndex: 5, open: '08:00', close: '22:00', isClosed: false },
    { day: 'Lørdag', dayIndex: 6, open: '09:00', close: '18:00', isClosed: false },
    { day: 'Søndag', dayIndex: 0, isClosed: true },
  ] },
  keyFacts: { capacity: 20, bookingMode: 'SLOTS' },
  metadata: {
    description: 'Moderne møterom med utsikt over byen. Perfekt for presentasjoner og workshops.',
    amenities: [{ id: '1', name: 'WiFi' }, { id: '2', name: 'Projektor' }, { id: '3', name: 'Whiteboard' }],
    includedFacilities: [],
    rules: [{ id: '1', title: 'Avbestilling', content: 'Avbestilling må skje senest 24 timer før.', category: 'cancellation' }],
    faq: [{ id: '1', question: 'Hvordan booker jeg?', answer: 'Velg tid i kalenderen og bekreft.' }],
  },
  bookingConfig: { enabled: true, mode: 'SLOTS', approval: 'NONE', paymentRequired: false },
  pricing: { basePrice: 500, currency: 'NOK', unit: 'time', displayPrice: '500 kr/time' },
  createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
};

export function ListingDetailPageV2(): React.ReactElement {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Check if the ID looks like a UUID or slug
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.id || '');
  
  // Fetch by ID if UUID, otherwise fetch by slug
  const { data: apiResponse, isLoading, error } = isUuid 
    ? useListing(params.id || '')
    : useListingBySlug(params.id || '');
  
  const [isFavorited, setIsFavorited] = React.useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = React.useState(false);
  const isAuthenticated = false; // Mock auth state

  // Transform API data or use mock
  const listing = React.useMemo((): Listing => {
    if (apiResponse?.data) return transformApiToListing(apiResponse.data);
    return mockListing;
  }, [apiResponse]);

  // Gallery images for ImageSlider
  const galleryImages: GalleryImage[] = React.useMemo(() =>
    listing.images.map(img => ({ id: img.id, src: img.url, alt: img.alt || listing.name, thumbnail: img.url })),
  [listing]);

  // Log errors
  React.useEffect(() => {
    if (error) console.warn('API error, using mock data:', error);
  }, [error]);

  // Handle favorite toggle
  const handleFavoriteToggle = React.useCallback(async () => {
    setIsFavoriteLoading(true);
    try {
      await new Promise(r => setTimeout(r, 500));
      setIsFavorited(prev => !prev);
      await logAuditEvent(isFavorited ? 'FAVORITE_REMOVED' : 'FAVORITE_ADDED', listing.tenantId, listing.id);
    } finally {
      setIsFavoriteLoading(false);
    }
  }, [listing, isFavorited]);

  // Handle booking click
  const handleBookingClick = React.useCallback(() => {
    const el = document.getElementById('booking-section');
    el?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Log page view
  React.useEffect(() => {
    logAuditEvent('LISTING_VIEWED', listing.tenantId, listing.id);
  }, [listing.id, listing.tenantId]);

  // Loading state
  if (isLoading) {
    return (
      <ContentLayout maxWidth="1440px">
        <main id="main" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <div style={{ textAlign: 'center' }}>
            <Spinner aria-label="Laster innhold..." />
            <Paragraph data-size="sm" style={{ marginTop: 'var(--ds-spacing-4)', color: 'var(--ds-color-neutral-text-subtle)' }}>
              Laster lokale...
            </Paragraph>
          </div>
        </main>
      </ContentLayout>
    );
  }

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Hjem', href: '/', onClick: () => navigate('/') },
    { label: 'Fasiliteter', href: '/listings', onClick: () => navigate('/listings') },
    { label: listing.name },
  ];

  return (
    <ContentLayout maxWidth="1440px">
      <main id="main" style={{ paddingTop: 'var(--ds-spacing-4)', paddingBottom: 'var(--ds-spacing-8)' }}>
        <Breadcrumb items={breadcrumbItems} />

        {/* Image Slider with arrows and dots */}
        <div style={{ marginTop: 'var(--ds-spacing-4)' }}>
          <ImageSlider
            images={galleryImages}
            height={480}
            showArrows
            showDots
            showThumbnails
            showCounter
            enableFullscreen
          />
        </div>

        {/* New feature-based layout */}
        <ListingDetailsLayout
          listing={listing}
          isAuthenticated={isAuthenticated}
          isFavorited={isFavorited}
          isFavoriteLoading={isFavoriteLoading}
          onFavoriteToggle={handleFavoriteToggle}
          onBookingClick={handleBookingClick}
          {...(MAPBOX_TOKEN ? { mapboxToken: MAPBOX_TOKEN } : {})}
        />

        {/* Responsive styles */}
        <style>{`
          /* Fade-in animation */
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          /* Section animations */
          .listing-details-layout > div {
            animation: fadeInUp 0.5s ease-out forwards;
          }

          /* Tab panel animations */
          [role="tabpanel"] > div {
            animation: fadeInUp 0.3s ease-out;
          }

          /* Card hover effects */
          .contact-widget,
          .map-widget,
          .opening-hours-widget,
          .booking-widget-placement {
            transition: transform 0.2s ease, box-shadow 0.2s ease;
          }

          .contact-widget:hover,
          .map-widget:hover,
          .opening-hours-widget:hover,
          .booking-widget-placement:hover {
            transform: translateY(-2px);
            box-shadow: var(--ds-shadow-md);
          }

          /* Responsive breakpoints */
          @media (max-width: 991px) {
            .listing-content-grid {
              grid-template-columns: 1fr !important;
            }

            .booking-widget-placement {
              margin-left: calc(-1 * var(--ds-spacing-4));
              margin-right: calc(-1 * var(--ds-spacing-4));
              border-radius: 0 !important;
            }
          }

          @media (max-width: 599px) {
            /* Image slider mobile adjustments */
            .image-slider {
              margin-left: calc(-1 * var(--ds-spacing-4));
              margin-right: calc(-1 * var(--ds-spacing-4));
              border-radius: 0 !important;
            }

            .image-slider-main {
              border-radius: 0 !important;
            }

            /* Hide thumbnails on mobile */
            .image-slider-thumbnails {
              display: none !important;
            }

            /* Tabs stay horizontal on mobile, just smaller */
            .ds-tabs [role="tab"] {
              padding: var(--ds-spacing-3) var(--ds-spacing-2) !important;
              font-size: var(--ds-font-size-xs) !important;
            }
          }

          /* Smooth scrolling */
          html {
            scroll-behavior: smooth;
          }

          /* Button hover enhancements */
          button[type="button"] {
            transition: all 0.2s ease !important;
          }
        `}</style>
      </main>
    </ContentLayout>
  );
}

export default ListingDetailPageV2;
