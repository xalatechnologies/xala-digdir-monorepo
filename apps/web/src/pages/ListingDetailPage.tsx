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
  type ListingEvent,
  logAuditEvent,
} from '../features/listing-details';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const TENANT_ID = import.meta.env.VITE_TENANT_ID || 'default-tenant';

// Default data for fallback
const defaultAmenities: Amenity[] = [
  { id: 'wifi', name: 'WiFi', category: 'connectivity' },
  { id: 'projector', name: 'Projektor', category: 'av' },
  { id: 'whiteboard', name: 'Whiteboard', category: 'av' },
  { id: 'parking', name: 'Parkering', category: 'facilities' },
  { id: 'coffee', name: 'Kaffe/Te', category: 'amenities' },
  { id: 'ac', name: 'Klimaanlegg', category: 'comfort' },
];

const defaultRules: Rule[] = [
  { id: 'cancel', title: 'Avbestilling', content: 'Avbestilling må skje senest 24 timer før booket tid. Ved senere avbestilling belastes fullt beløp.', category: 'cancellation' },
  { id: 'cleaning', title: 'Renhold', content: 'Lokalet skal forlates i samme stand som ved ankomst. Alt søppel skal kastes i anviste beholdere. Ved behov for ekstra renhold kan gebyr påløpe.', category: 'cleaning' },
  { id: 'noise', title: 'Støy og ro', content: 'Vis hensyn til naboer og andre brukere. Høy musikk og støyende aktiviteter er kun tillatt i angitte tidsrom.', category: 'noise' },
  { id: 'safety', title: 'Sikkerhet', content: 'Nødutganger skal holdes frie til enhver tid. Røyking er ikke tillatt innendørs. Brannslukningsutstyr skal ikke flyttes eller blokkeres.', category: 'safety' },
  { id: 'equipment', title: 'Utstyr', content: 'Alt utstyr skal behandles forsiktig og returneres til opprinnelig plassering. Skader må meldes umiddelbart.', category: 'general' },
];

const defaultFaq: FAQItem[] = [
  { id: 'faq1', question: 'Hvordan booker jeg lokalet?', answer: 'Velg ønsket dato og tidspunkt i kalenderen, og følg instruksjonene for å fullføre bookingen. Du vil motta en bekreftelse på e-post.' },
  { id: 'faq2', question: 'Kan jeg avbestille bookingen?', answer: 'Ja, du kan avbestille inntil 24 timer før booket tid uten kostnad. Ved senere avbestilling gjelder våre avbestillingsregler.' },
  { id: 'faq3', question: 'Hva er inkludert i prisen?', answer: 'Prisen inkluderer tilgang til lokalet og standard fasiliteter som WiFi, projektor og whiteboard. Ekstra tjenester kan bestilles separat.' },
  { id: 'faq4', question: 'Er det parkering tilgjengelig?', answer: 'Ja, det er gratis parkering for gjester. Parkeringsplasser er tilgjengelige etter først-til-mølla-prinsippet.' },
  { id: 'faq5', question: 'Kan jeg forlenge bookingen?', answer: 'Ja, du kan forlenge bookingen hvis lokalet er ledig. Kontakt oss eller sjekk tilgjengelighet i kalenderen.' },
];

const defaultEvents: ListingEvent[] = [
  { id: 'evt1', title: 'Yoga i parken', description: 'Ukentlig yoga-økt for alle nivåer', startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), startTime: '10:00', endTime: '11:30', status: 'upcoming', organizer: 'Helsestudio AS' },
  { id: 'evt2', title: 'Fotballtrening', description: 'Trening for juniorlaget', startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), startTime: '17:00', endTime: '19:00', status: 'upcoming', organizer: 'Lokalt idrettslag' },
  { id: 'evt3', title: 'Bedriftsmøte', description: 'Kvartalsvis samling', startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), startTime: '09:00', endTime: '16:00', status: 'upcoming', organizer: 'Tech Solutions' },
  { id: 'evt4', title: 'Workshop: Kreativ skriving', description: 'Lær grunnleggende teknikker', startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), startTime: '18:00', endTime: '20:00', status: 'past', organizer: 'Kulturhuset' },
];

// Transform API listing to feature Listing type
function transformApiToListing(api: ApiListing): Listing {
  const meta = (api.metadata || {}) as Record<string, unknown>;
  const typeMap: Record<string, ListingType> = { EQUIPMENT: 'EQUIPMENT', EVENT: 'EVENT', FACILITY: 'FACILITY', SPACE: 'FACILITY' };
  const listingType: ListingType = typeMap[api.type] || 'OTHER';

  // Amenities - use API data or defaults
  const apiAmenities = (meta.facilities as string[]) || [];
  const amenities: Amenity[] = apiAmenities.length > 0
    ? apiAmenities.map((f, i) => ({ id: `a-${i}`, name: f, description: f, category: 'general' }))
    : defaultAmenities;

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

  // Rules - use API data or defaults
  const apiRules = (meta.guidelines as Array<{ id: string; title: string; content: string }>) || [];
  const rules: Rule[] = apiRules.length > 0
    ? apiRules.map((g, i) => ({ id: g.id || `rule-${i}`, title: g.title, content: g.content, category: 'general' as const }))
    : defaultRules;

  // FAQ - use API data or defaults
  const apiFaq = (meta.faq as Array<{ id: string; question: string; answer: string }>) || [];
  const faq: FAQItem[] = apiFaq.length > 0
    ? apiFaq.map((f, i) => ({ id: f.id || `faq-${i}`, question: f.question, answer: f.answer }))
    : defaultFaq;

  const keyFacts: KeyFacts = { ...(api.capacity ? { capacity: api.capacity } : { capacity: 50 }), bookingMode: 'SLOTS' as BookingMode };
  const metadata: ListingMetadata = {
    description: api.description || 'Moderne og fleksibelt lokale perfekt for møter, workshops og arrangementer. Sentralt beliggende med god tilgang til offentlig transport.',
    amenities,
    includedFacilities,
    rules,
    faq,
    highlights: ((meta.highlights as string[]) || ['Sentralt beliggende', 'Moderne fasiliteter', 'Fleksible løsninger'])
  };

  // Build address - use API data or provide default
  const address = meta.address
    ? {
        formatted: [meta.address, meta.postalCode, meta.city].filter(Boolean).join(', '),
        ...(typeof meta.latitude === 'number' ? { coordinates: { latitude: meta.latitude as number, longitude: meta.longitude as number } } : {}),
      }
    : {
        formatted: 'Oslo, Norge',
        coordinates: { latitude: 59.9139, longitude: 10.7522 },
      };

  // Build contact - use API data or provide default
  const contact = meta.contactEmail
    ? {
        email: meta.contactEmail as string,
        ...(meta.contactPhone ? { phone: meta.contactPhone as string } : {}),
        ...(meta.contactName ? { name: meta.contactName as string } : {}),
      }
    : {
        email: 'kontakt@digilist.no',
        phone: '+47 123 45 678',
      };

  return {
    id: api.id,
    tenantId: TENANT_ID,
    type: listingType,
    name: api.name,
    category: (meta.category as string) || api.type,
    status: 'published',
    images: (api.images || []).map((src: string, i: number) => ({ id: `${i}`, url: src, alt: `${api.name} - ${i + 1}`, isPrimary: i === 0, order: i })),
    address,
    contact,
    openingHours: buildOpeningHours(meta),
    keyFacts,
    metadata,
    activityData: {
      type: 'events',
      events: defaultEvents,
      totalCount: defaultEvents.length,
    },
    bookingConfig: { enabled: true, mode: 'SLOTS', approval: 'NONE', paymentRequired: false },
    ...(api.pricing?.basePrice ? { pricing: { basePrice: api.pricing.basePrice, currency: 'NOK', unit: 'time', displayPrice: `${api.pricing.basePrice} kr/time` } } : { pricing: { basePrice: 500, currency: 'NOK', unit: 'time', displayPrice: '500 kr/time' } }),
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
  const isAuthenticated = false; // Mock auth state

  // Transform API data
  const listing = React.useMemo((): Listing | null => {
    if (apiResponse?.data) return transformApiToListing(apiResponse.data);
    return null;
  }, [apiResponse]);

  // Gallery images for ImageSlider
  const galleryImages: GalleryImage[] = React.useMemo(() =>
    listing?.images.map(img => ({ id: img.id, src: img.url, alt: img.alt || listing.name, thumbnail: img.url })) || [],
  [listing]);

  // Log errors
  React.useEffect(() => {
    if (error) console.error('API error loading listing:', error);
  }, [error]);

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

  // Not found state
  if (!listing) {
    return (
      <ContentLayout maxWidth="1440px">
        <main id="main" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <div style={{ textAlign: 'center', padding: 'var(--ds-spacing-8)' }}>
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
      <main id="main" style={{ paddingTop: 'var(--ds-spacing-4)', paddingBottom: 'var(--ds-spacing-8)' }}>
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
