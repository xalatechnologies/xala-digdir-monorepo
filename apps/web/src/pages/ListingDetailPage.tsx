/**
 * ListingDetailPage
 *
 * Listing detail page using feature-based architecture.
 * Structure: Breadcrumb -> ImageSlider -> ListingDetailsLayout
 */
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ContentLayout,
  Breadcrumb,
  ImageSlider,
  Spinner,
  Paragraph,
  Heading,
  Stack,
} from '@xala/ds';
import type { BreadcrumbItem, GalleryImage } from '@xala/ds';
import {
  useListing,
  useListingBySlug,
  transformListing as sdkTransformListing,
  type Listing as ApiListing,
  type TransformedListing,
} from '@digilist/client-sdk';
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
  type ListingEvent,
  logAuditEvent,
} from '../features/listing-details';
import { ReviewList } from '../features/reviews/components/ReviewList';
import { ReviewForm } from '../features/reviews/components/ReviewForm';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const TENANT_ID = import.meta.env.VITE_TENANT_ID;

/**
 * Adapt SDK TransformedListing to feature Listing type
 * Uses the SDK's transformListing as base and maps to feature-specific types
 */
function transformApiToListing(api: ApiListing): Listing {
  // Use SDK transformer as base
  const transformed = sdkTransformListing(api);
  const meta = api.metadata || {};
  const metaAny = meta as Record<string, unknown>;

  // Map listing type
  const typeMap: Record<string, ListingType> = {
    EQUIPMENT: 'EQUIPMENT', EVENT: 'EVENT', FACILITY: 'FACILITY', SPACE: 'FACILITY',
  };
  const listingType: ListingType = typeMap[api.type] || 'OTHER';

  // Map amenities to feature type
  const amenities: Amenity[] = transformed.amenities.map((a) => ({
    id: a.id,
    name: a.name,
    icon: a.icon,
    category: a.category,
    description: a.name,
  }));

  // Map facilities to feature type
  const includedFacilities: IncludedFacility[] = transformed.facilities.map((f) => ({
    id: f.id,
    name: f.name,
    quantity: f.quantity,
    description: f.description,
  }));

  // Map rules to feature type
  const rules: Rule[] = transformed.rules.map((r) => ({
    id: r.id,
    title: r.title,
    content: r.content,
    category: 'general' as const,
  }));

  // Map FAQ to feature type
  const faq: FAQItem[] = transformed.faq.map((f) => ({
    id: f.id,
    question: f.question,
    answer: f.answer,
  }));

  // Map opening hours to feature type
  const openingHours: OpeningHours = {
    regular: transformed.openingHours.regular.map((day) => ({
      day: day.day,
      dayIndex: day.dayIndex,
      open: day.open,
      close: day.close,
      isClosed: day.isClosed,
    })),
  };

  // Build feature metadata
  const metadata: ListingMetadata = {
    description: transformed.description || '',
    amenities,
    includedFacilities,
    rules,
    faq,
    highlights: transformed.highlights,
  };

  // Build feature key facts
  const keyFacts: KeyFacts = {
    ...(transformed.keyFacts.capacity ? { capacity: transformed.keyFacts.capacity } : {}),
    bookingMode: 'SLOTS' as BookingMode,
  };

  // Build contact if exists
  const contact = transformed.contact ? {
    ...(transformed.contact.name ? { name: transformed.contact.name } : {}),
    ...(transformed.contact.email ? { email: transformed.contact.email } : {}),
    ...(transformed.contact.phone ? { phone: transformed.contact.phone } : {}),
  } : undefined;

  return {
    id: transformed.id,
    tenantId: TENANT_ID,
    type: listingType,
    name: transformed.name,
    category: (metaAny.category as string) || api.type,
    status: 'published',
    images: transformed.images.map((img) => ({
      id: img.id,
      url: img.url,
      alt: img.alt,
      isPrimary: img.isPrimary,
      order: img.order,
    })),
    address: {
      formatted: transformed.address.formatted,
      street: transformed.address.street,
      postalCode: transformed.address.postalCode,
      city: transformed.address.city,
      ...(transformed.address.coordinates ? { coordinates: transformed.address.coordinates } : {}),
    },
    ...(contact && Object.keys(contact).length > 0 ? { contact } : {}),
    openingHours,
    keyFacts,
    metadata,
    // Activity data from API (if available)
    ...((metaAny.events as ListingEvent[])?.length && {
      activityData: {
        type: 'events' as const,
        events: metaAny.events as ListingEvent[],
        totalCount: (metaAny.events as ListingEvent[]).length,
      },
    }),
    bookingConfig: { enabled: true, mode: 'SLOTS', approval: 'NONE', paymentRequired: false },
    ...(transformed.pricing ? {
      pricing: {
        basePrice: transformed.pricing.basePrice,
        currency: transformed.pricing.currency,
        unit: transformed.pricing.unit,
        displayPrice: transformed.pricing.displayPrice,
      },
    } : {}),
    createdAt: transformed.createdAt,
    updatedAt: transformed.updatedAt,
  };
}


export function ListingDetailPage(): React.ReactElement {
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
  // TODO: Replace with real auth state from SDK/provider
  const isAuthenticated = false;
  const [showReviewForm, setShowReviewForm] = React.useState(false);
  const hasCompletedBooking = false;

  // Transform API data
  const listing = React.useMemo((): Listing | null => {
    if (apiResponse?.data) return transformApiToListing(apiResponse.data);
    return null;
  }, [apiResponse]);

  // Gallery images for ImageSlider
  const galleryImages: GalleryImage[] = React.useMemo(() =>
    listing?.images.map(img => ({ id: img.id, src: img.url, alt: img.alt || listing.name, thumbnail: img.url })) || [],
  [listing]);


  // Handle favorite toggle
  const handleFavoriteToggle = React.useCallback(async () => {
    if (!listing) return;
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
    if (listing) {
      logAuditEvent('LISTING_VIEWED', listing.tenantId, listing.id);
    }
  }, [listing]);

  // Loading state
  if (isLoading) {
    return (
      <ContentLayout maxWidth="1440px">
        <main id="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <div role="status" aria-live="polite" aria-busy="true" style={{ textAlign: 'center' }}>
            <Spinner aria-label="Laster innhold..." />
            <Paragraph data-size="sm" style={{ marginTop: 'var(--ds-spacing-4)', color: 'var(--ds-color-neutral-text-subtle)' }}>
              Laster lokale...
            </Paragraph>
          </div>
        </main>
      </ContentLayout>
    );
  }

  // Not found state
  if (!listing) {
    return (
      <ContentLayout maxWidth="1440px">
        <main id="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <div role="alert" aria-live="assertive" style={{ textAlign: 'center', padding: 'var(--ds-spacing-8)' }}>
            <Paragraph data-size="lg" style={{ marginBottom: 'var(--ds-spacing-4)', color: 'var(--ds-color-neutral-text-default)' }}>
              Lokalet ble ikke funnet
            </Paragraph>
            <Paragraph data-size="sm" style={{ marginBottom: 'var(--ds-spacing-6)', color: 'var(--ds-color-neutral-text-subtle)' }}>
              {error ? 'Det oppstod en feil ved lasting av lokalet.' : 'Lokalet du leter etter finnes ikke eller er ikke tilgjengelig.'}
            </Paragraph>
            <button
              type="button"
              onClick={() => navigate('/')}
              style={{
                padding: 'var(--ds-spacing-3) var(--ds-spacing-6)',
                backgroundColor: 'var(--ds-color-accent-base-default)',
                color: 'var(--ds-color-accent-contrast-default)',
                border: 'none',
                borderRadius: 'var(--ds-border-radius-md)',
                cursor: 'pointer',
                fontSize: 'var(--ds-font-size-sm)',
              }}
            >
              Tilbake til oversikten
            </button>
          </div>
        </main>
      </ContentLayout>
    );
  }

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Hjem', href: '/', onClick: () => navigate('/') },
    { label: 'Listing', href: '/', onClick: () => navigate('/') },
    { label: listing.name },
  ];

  return (
    <ContentLayout maxWidth="1440px">
      <main id="main-content" style={{ paddingTop: 'var(--ds-spacing-4)', paddingBottom: 'var(--ds-spacing-8)' }}>
        <div style={{ paddingLeft: 'var(--ds-spacing-2)', paddingRight: 'var(--ds-spacing-2)' }}>
          <Breadcrumb items={breadcrumbItems} />
        </div>

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
        <div style={{ paddingLeft: 'var(--ds-spacing-1)', paddingRight: 'var(--ds-spacing-1)' }}>
          <ListingDetailsLayout
            listing={listing}
            isAuthenticated={isAuthenticated}
            isFavorited={isFavorited}
            isFavoriteLoading={isFavoriteLoading}
            onFavoriteToggle={handleFavoriteToggle}
            onBookingClick={handleBookingClick}
            {...(MAPBOX_TOKEN ? { mapboxToken: MAPBOX_TOKEN } : {})}
          />
        </div>

        {/* Reviews Section */}
        <div
          style={{
            marginTop: 'var(--ds-spacing-8)',
            paddingLeft: 'var(--ds-spacing-1)',
            paddingRight: 'var(--ds-spacing-1)',
          }}
        >
          <Stack gap="32px">
            {/* Reviews Header */}
            <div>
              <Heading
                level={2}
                size="lg"
                style={{
                  marginBottom: 'var(--ds-spacing-2)',
                  color: 'var(--ds-color-neutral-text-default)',
                }}
              >
                Anmeldelser
              </Heading>
              <Paragraph
                size="md"
                style={{
                  color: 'var(--ds-color-neutral-text-subtle)',
                  margin: 0,
                }}
              >
                Les hva andre brukere sier om dette lokalet
              </Paragraph>
            </div>

            {/* Review Form - Show for authenticated users with completed bookings */}
            {isAuthenticated && hasCompletedBooking && showReviewForm && (
              <ReviewForm
                listingId={listing.id}
                bookingId="" // TODO: Get from user's completed bookings via SDK
                onSuccess={() => {
                  setShowReviewForm(false);
                  // Optionally show a success message
                }}
                onCancel={() => {
                  setShowReviewForm(false);
                }}
              />
            )}

            {/* Review List */}
            <ReviewList
              listingId={listing.id}
              queryParams={{ status: 'approved' }}
              showHelpfulCount={true}
              showStatus={false}
              variant="default"
            />
          </Stack>
        </div>

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

export default ListingDetailPage;
