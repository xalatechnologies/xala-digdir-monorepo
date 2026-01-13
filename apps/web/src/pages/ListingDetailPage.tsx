/**
 * ListingDetailPage
 *
 * Full listing detail page with all tabs and booking functionality.
 * Fetches real listing data from API via @digilist/client-sdk.
 */
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ContentLayout,
  Breadcrumb,
  ImageSlider,
  ListingDetailHeader,
  FacilityChips,
  AdditionalServicesList,
  ContactInfoCard,
  LocationCard,
  OpeningHoursCard,
  UnifiedBookingEngine,
  GuidelinesTab,
  FAQTab,
  ListingTabs,
  TabContent,
  TabEmptyState,
  RequireAuthModal,
  Heading,
  Paragraph,
  Spinner,
  SparklesIcon,
  determineBookingMode,
} from '@xala/ds';
import type {
  ListingDetail,
  BreadcrumbItem,
  GalleryImage,
  Facility,
  AdditionalService,
  OpeningHoursDay,
  GuidelineSection,
  FAQItem,
  BookingConfig,
  BookingSelection,
  BookingFormData,
  AvailabilitySlot,
  BookingPriceUnit,
  KeyFact,
  TabConfig,
  ShareData,
} from '@xala/ds';
import { useListing, type Listing } from '@digilist/client-sdk';

// Mapbox token from environment
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

/**
 * Transform API Listing to ListingDetail format used by components
 */
function transformApiListingToDetail(apiListing: Listing): ListingDetail {
  // Cast to Record for flexible property access - API metadata can have arbitrary fields
  const metadata = (apiListing.metadata || {}) as Record<string, unknown>;

  // Transform images
  const images: GalleryImage[] = (apiListing.images || []).map((src: string, index: number) => ({
    id: `${index + 1}`,
    src,
    alt: `${apiListing.name} - Bilde ${index + 1}`,
    thumbnail: src.replace(/w=\d+/, 'w=200').replace(/h=\d+/, 'h=150'),
  }));

  // Transform facilities
  const facilitiesArray = metadata.facilities as string[] | undefined;
  const facilities: Facility[] = (facilitiesArray || []).map((label: string, index: number) => ({
    id: `facility-${index}`,
    label,
  }));

  // Build location string
  const location = [metadata.address, metadata.postalCode, metadata.city]
    .filter(Boolean)
    .join(', ') || 'Ukjent adresse';

  // Build the result with required fields
  const result: ListingDetail = {
    id: apiListing.id,
    name: apiListing.name,
    category: (metadata.category as string) || apiListing.type || 'Lokale',
    listingType: apiListing.type,
    location,
    description: apiListing.description || '',
    images,
    facilities,
  };

  // Add optional fields only if they have values
  if (apiListing.capacity) {
    result.capacity = apiListing.capacity;
  }

  // Additional services
  const additionalServices = metadata.additionalServices as AdditionalService[] | undefined;
  if (additionalServices && additionalServices.length > 0) {
    result.additionalServices = additionalServices;
  }

  // Contact info
  const contactInfo = buildContactInfo(metadata);
  if (Object.keys(contactInfo).length > 0) {
    result.contact = contactInfo;
  }

  // Coordinates
  if (typeof metadata.latitude === 'number' && typeof metadata.longitude === 'number') {
    result.coordinates = {
      latitude: metadata.latitude,
      longitude: metadata.longitude,
    };
  }

  // Opening hours - use provided or default
  result.openingHours = buildOpeningHours(metadata);

  // Price info
  if (apiListing.pricing?.basePrice) {
    result.price = apiListing.pricing.basePrice;
    result.priceUnit = mapPriceUnit(apiListing.pricing.unit || 'hour');
    result.currency = 'NOK';
  }

  // Guidelines and FAQ
  const guidelines = metadata.guidelines as GuidelineSection[] | undefined;
  result.guidelines = guidelines && guidelines.length > 0 ? guidelines : defaultGuidelines;

  const faq = metadata.faq as FAQItem[] | undefined;
  result.faq = faq && faq.length > 0 ? faq : defaultFaq;

  return result;
}

function buildOpeningHours(metadata: Record<string, unknown>): OpeningHoursDay[] {
  const openingHoursData = metadata.openingHours as Record<string, { open: string; close: string }> | undefined;

  if (openingHoursData) {
    const dayNames: Record<string, string> = {
      monday: 'Mandag',
      tuesday: 'Tirsdag',
      wednesday: 'Onsdag',
      thursday: 'Torsdag',
      friday: 'Fredag',
      saturday: 'Lørdag',
      sunday: 'Søndag',
    };

    return Object.entries(openingHoursData).map(([day, hours]) => ({
      day: dayNames[day] || day,
      hours: hours.open && hours.close ? `${hours.open} - ${hours.close}` : 'Stengt',
      isClosed: !hours.open || !hours.close,
    }));
  }

  // Default opening hours
  return [
    { day: 'Mandag-Fredag', hours: '08:00 - 22:00' },
    { day: 'Lørdag', hours: '09:00 - 18:00' },
    { day: 'Søndag', hours: 'Stengt', isClosed: true },
  ];
}

function mapPriceUnit(unit: string): string {
  const unitMap: Record<string, string> = {
    hour: 'time',
    day: 'dag',
    week: 'uke',
    month: 'måned',
    event: 'arrangement',
  };
  return unitMap[unit] || unit;
}

function buildContactInfo(metadata: Record<string, unknown>): NonNullable<ListingDetail['contact']> {
  const contact: NonNullable<ListingDetail['contact']> = {};
  if (typeof metadata.contactEmail === 'string') {
    contact.email = metadata.contactEmail;
  }
  if (typeof metadata.contactPhone === 'string') {
    contact.phone = metadata.contactPhone;
  }
  if (typeof metadata.contactName === 'string') {
    contact.name = metadata.contactName;
  }
  return contact;
}

// Default guidelines if not provided by API
const defaultGuidelines: GuidelineSection[] = [
  {
    id: 'cancellation',
    title: 'Avbestilling',
    content: 'Avbestilling må skje senest 24 timer før reservert tidspunkt. Ved senere avbestilling belastes 50% av totalpris.',
  },
  {
    id: 'damages',
    title: 'Skader',
    content: 'Leietaker er ansvarlig for eventuelle skader på lokalet eller utstyr som oppstår under leieperioden.',
  },
  {
    id: 'cleaning',
    title: 'Renhold',
    content: 'Lokalet skal forlates i ryddig stand. Søppel kastes i anviste beholdere.',
  },
];

// Default FAQ if not provided by API
const defaultFaq: FAQItem[] = [
  {
    id: 'how-to-book',
    question: 'Hvordan booker jeg?',
    answer: 'Velg ønskede tidspunkter i kalenderen, fyll ut kontaktinformasjon, og bekreft bookingen.',
  },
  {
    id: 'cancellation-policy',
    question: 'Hva er avbestillingsreglene?',
    answer: 'Du kan avbestille gratis inntil 24 timer før reservert tidspunkt.',
  },
];

// Generate mock availability slots for the calendar
function generateMockAvailabilitySlots(startDate: Date): AvailabilitySlot[] {
  const slots: AvailabilitySlot[] = [];

  for (let day = 0; day < 7; day++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + day);

    for (let hour = 8; hour <= 19; hour++) {
      // Randomly assign status, but more likely to be available
      const random = Math.random();
      let status: 'available' | 'occupied' | 'blocked' | 'past';

      // Check if this is in the past
      const slotDate = new Date(date);
      slotDate.setHours(hour, 0, 0, 0);
      const now = new Date();

      if (slotDate < now) {
        status = 'past';
      } else if (random < 0.65) {
        status = 'available';
      } else if (random < 0.85) {
        status = 'occupied';
      } else {
        status = 'blocked';
      }

      slots.push({
        id: `${date.toISOString().split('T')[0]}-${hour}`,
        date: new Date(date),
        startTime: `${hour.toString().padStart(2, '0')}:00`,
        endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
        status,
      });
    }
  }

  return slots;
}

// Create booking config from listing data
function createBookingConfig(listing: ListingDetail): BookingConfig {
  const listingType = (listing.listingType || 'SPACE') as BookingConfig['listingType'];
  const priceUnit = (listing.priceUnit || 'time') as BookingPriceUnit;

  // Map Norwegian price unit to English
  const unitMap: Record<string, BookingPriceUnit> = {
    'time': 'hour',
    'dag': 'day',
    'uke': 'week',
    'måned': 'month',
    'arrangement': 'booking',
    'hour': 'hour',
    'day': 'day',
    'week': 'week',
    'month': 'month',
  };

  const normalizedUnit = unitMap[priceUnit] || 'hour';
  const mode = determineBookingMode(listingType, normalizedUnit);

  const config: BookingConfig = {
    listingId: listing.id,
    listingType,
    mode,
    pricing: {
      basePrice: listing.price || 0,
      currency: listing.currency || 'NOK',
      unit: normalizedUnit,
      vatPercentage: 25,
    },
    rules: {
      requireApproval: false,
      minLeadTimeHours: 24,
      maxAdvanceDays: 90,
      cancellationPolicy: 'moderate',
      freeCancellationHours: 48,
      allowSameDayBooking: true,
    },
    schedule: [
      { dayOfWeek: 1, isOpen: true, openTime: '08:00', closeTime: '22:00' },
      { dayOfWeek: 2, isOpen: true, openTime: '08:00', closeTime: '22:00' },
      { dayOfWeek: 3, isOpen: true, openTime: '08:00', closeTime: '22:00' },
      { dayOfWeek: 4, isOpen: true, openTime: '08:00', closeTime: '22:00' },
      { dayOfWeek: 5, isOpen: true, openTime: '08:00', closeTime: '22:00' },
      { dayOfWeek: 6, isOpen: true, openTime: '09:00', closeTime: '18:00' },
      { dayOfWeek: 0, isOpen: false },
    ],
    slotDurationMinutes: 60,
    bufferMinutes: 0,
  };

  // Add optional maxAttendees if listing has capacity
  if (listing.capacity !== undefined) {
    config.rules.maxAttendees = listing.capacity;
  }

  return config;
}

// Mock listing data
const mockListingDetail: ListingDetail = {
  id: '1',
  name: 'Bragernes Møterom',
  category: 'Møterom',
  listingType: 'SPACE',
  location: 'Nedre Storgate 15, 3017 Drammen',
  description: `Profesjonelt møterom i hjertet av Drammen. Utstyrt med moderne teknologi for presentasjoner og videokonferanser.

Rommet er perfekt for møter, workshops og presentasjoner. Med plass til opptil 25 personer og alt nødvendig utstyr inkludert, kan du fokusere på det som er viktig.

Vi tilbyr fleksible bookingmuligheter fra timebasert leie til hele dager. Kaffe og te er inkludert, og catering kan bestilles som tilleggstjeneste.`,
  images: [
    {
      id: '1',
      src: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&h=900&fit=crop',
      alt: 'Møterom hovedbilde',
      thumbnail:
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=200&h=150&fit=crop',
    },
    {
      id: '2',
      src: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1600&h=900&fit=crop',
      alt: 'Møterom interiør',
      thumbnail:
        'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=200&h=150&fit=crop',
    },
    {
      id: '3',
      src: 'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=1600&h=900&fit=crop',
      alt: 'Møterom utsikt',
      thumbnail:
        'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=200&h=150&fit=crop',
    },
    {
      id: '4',
      src: 'https://images.unsplash.com/photo-1462826303086-329426d1aef5?w=1600&h=900&fit=crop',
      alt: 'Presentasjonsområde',
      thumbnail:
        'https://images.unsplash.com/photo-1462826303086-329426d1aef5?w=200&h=150&fit=crop',
    },
    {
      id: '5',
      src: 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=1600&h=900&fit=crop',
      alt: 'Arbeidsområde',
      thumbnail:
        'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=200&h=150&fit=crop',
    },
  ],
  capacity: 25,
  facilities: [
    { id: 'projector', label: 'Projektor' },
    { id: 'whiteboard', label: 'Tavle' },
    { id: 'wifi', label: 'WiFi' },
    { id: 'video', label: 'Videokonferanse' },
    { id: 'coffee', label: 'Kaffemaskin' },
    { id: 'ac', label: 'Klimaanlegg' },
  ],
  additionalServices: [
    {
      id: 'catering',
      name: 'Catering',
      description: 'Lunsj og forfriskninger',
      price: 250,
      currency: 'NOK',
    },
    {
      id: 'parking',
      name: 'Parkering',
      description: 'Reservert parkeringsplass',
      price: 100,
      currency: 'NOK',
    },
    {
      id: 'tech-support',
      name: 'Teknisk støtte',
      description: 'Dedikert tekniker på stedet',
      price: 500,
      currency: 'NOK',
    },
  ],
  contact: {
    email: 'booking@bragernes-moterom.no',
    phone: '+47 32 12 34 56',
    name: 'Kari Nordmann',
  },
  coordinates: {
    latitude: 59.7439,
    longitude: 10.2045,
  },
  openingHours: [
    { day: 'Mandag-Fredag', hours: '08:00 - 22:00' },
    { day: 'Lørdag', hours: '09:00 - 18:00' },
    { day: 'Søndag', hours: 'Stengt', isClosed: true },
  ],
  price: 450,
  priceUnit: 'time',
  currency: 'NOK',
  guidelines: [
    {
      id: 'cancellation',
      title: 'Avbestilling',
      content:
        'Avbestilling må skje senest 24 timer før reservert tidspunkt. Ved senere avbestilling belastes 50% av totalpris. Ved uteblivelse uten varsel belastes full pris.',
    },
    {
      id: 'damages',
      title: 'Skader',
      content:
        'Leietaker er ansvarlig for eventuelle skader på lokalet eller utstyr som oppstår under leieperioden. Vennligst meld fra om skader umiddelbart.',
    },
    {
      id: 'cleaning',
      title: 'Renhold',
      content:
        'Lokalet skal forlates i ryddig stand. Søppel kastes i anviste beholdere. Ekstra rengjøring vil bli fakturert.',
    },
    {
      id: 'rules',
      title: 'Husregler',
      content:
        'Røyking er ikke tillatt. Kjæledyr er ikke tillatt med mindre avtalt på forhånd. Støynivå skal holdes på et akseptabelt nivå.',
    },
    {
      id: 'safety',
      title: 'Sikkerhet',
      content:
        'Nødutganger og brannslokkingsutstyr skal ikke blokkeres. Gjør deg kjent med rømningsveier ved ankomst. Ved brannalarm, forlat bygget umiddelbart.',
    },
  ],
  faq: [
    {
      id: 'how-to-book',
      question: 'Hvordan booker jeg?',
      answer:
        'Velg ønskede tidspunkter i kalenderen, fyll ut kontaktinformasjon, og bekreft bookingen. Du vil motta en bekreftelse på e-post.',
    },
    {
      id: 'cancellation-policy',
      question: 'Hva er avbestillingsreglene?',
      answer:
        'Du kan avbestille gratis inntil 24 timer før reservert tidspunkt. Ved senere avbestilling belastes 50% av totalpris.',
    },
    {
      id: 'parking',
      question: 'Er det tilgjengelig parkering?',
      answer:
        'Ja, det finnes parkeringshus i nærheten. Du kan også bestille reservert parkeringsplass som tilleggstjeneste.',
    },
    {
      id: 'extend-booking',
      question: 'Kan jeg forlenge bookingen?',
      answer:
        'Ja, du kan forlenge bookingen så lenge det er ledige tidspunkter. Kontakt oss for å gjøre endringer i en eksisterende booking.',
    },
    {
      id: 'equipment',
      question: 'Hva er inkludert i prisen?',
      answer:
        'Prisen inkluderer bruk av møterommet med alt standardutstyr: projektor, tavle, WiFi og videokonferanseutstyr. Kaffe og te er også inkludert.',
    },
  ],
};

export function ListingDetailPage(): React.ReactElement {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch listing data from API
  const { data: apiResponse, isLoading, error } = useListing(params.id || '');

  // State for booking flow with UnifiedBookingEngine
  const [currentBookingStep, setCurrentBookingStep] = React.useState(0);
  const [selectedServices, setSelectedServices] = React.useState<string[]>([]);
  const [calendarStartDate, setCalendarStartDate] = React.useState(() => {
    const today = new Date();
    // Start from Monday of current week
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(today.setDate(diff));
  });

  // Active tab state
  const [activeTab, setActiveTab] = React.useState('overview');

  // Favorites state
  const [isFavorited, setIsFavorited] = React.useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = React.useState(false);
  const [showAuthModal, setShowAuthModal] = React.useState(false);

  // Mock auth state - in production this would come from auth context
  const isAuthenticated = false; // Set to false to test auth gating

  // Transform API data to ListingDetail format, or use mock data as fallback
  const listing: ListingDetail = React.useMemo(() => {
    if (apiResponse?.data) {
      return transformApiListingToDetail(apiResponse.data);
    }
    return mockListingDetail;
  }, [apiResponse]);

  // Generate availability slots for current week
  const availabilitySlots = React.useMemo(
    () => generateMockAvailabilitySlots(calendarStartDate),
    [calendarStartDate]
  );

  // Create booking configuration from listing
  const bookingConfig = React.useMemo(
    () => createBookingConfig(listing),
    [listing]
  );

  // Handle service selection - useCallback to maintain stable reference
  const handleServiceSelect = React.useCallback((serviceId: string, selected: boolean) => {
    setSelectedServices((prev) =>
      selected ? [...prev, serviceId] : prev.filter((id) => id !== serviceId)
    );
  }, []);

  // Build key facts from listing
  const keyFacts = React.useMemo((): KeyFact[] => {
    const facts: KeyFact[] = [];

    if (listing.capacity) {
      facts.push({
        type: 'capacity',
        label: 'Kapasitet',
        value: `${listing.capacity} personer`,
      });
    }

    if (listing.price) {
      facts.push({
        type: 'bookingMode',
        label: 'Pris',
        value: `${listing.price} kr/${listing.priceUnit || 'time'}`,
      });
    }

    return facts;
  }, [listing]);

  // Share data
  const shareData: ShareData = React.useMemo(() => ({
    url: typeof window !== 'undefined' ? window.location.href : '',
    title: listing.name,
    description: listing.description?.slice(0, 150) || `Book ${listing.name}`,
  }), [listing]);

  // Build tab configuration
  const tabConfig: TabConfig[] = React.useMemo(() => [
    {
      id: 'overview',
      label: 'Oversikt',
      visible: true,
      content: (
        <TabContent>
          {/* Description */}
          <section>
            <Heading
              level={2}
              data-size="sm"
              style={{
                marginBottom: 'var(--ds-spacing-3)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--ds-spacing-2)',
              }}
            >
              <SparklesIcon size={20} style={{ color: 'var(--ds-color-accent-base-default)' }} />
              Beskrivelse
            </Heading>
            <Paragraph
              data-size="sm"
              style={{
                whiteSpace: 'pre-line',
                color: 'var(--ds-color-neutral-text-default)',
                lineHeight: '1.7',
              }}
            >
              {listing.description}
            </Paragraph>
          </section>

          {/* Facilities */}
          {listing.facilities.length > 0 && (
            <section>
              <Heading
                level={3}
                data-size="xs"
                style={{ marginBottom: 'var(--ds-spacing-3)' }}
              >
                Fasiliteter
              </Heading>
              <FacilityChips facilities={listing.facilities} />
            </section>
          )}

          {/* Additional Services */}
          {listing.additionalServices && listing.additionalServices.length > 0 && (
            <section>
              <Heading
                level={3}
                data-size="xs"
                style={{ marginBottom: 'var(--ds-spacing-3)' }}
              >
                Tilleggstjenester
              </Heading>
              <AdditionalServicesList
                services={listing.additionalServices}
                selectedServices={selectedServices}
                onServiceSelect={handleServiceSelect}
                title=""
              />
            </section>
          )}
        </TabContent>
      ),
    },
    {
      id: 'guidelines',
      label: 'Retningslinjer',
      visible: !!listing.guidelines && listing.guidelines.length > 0,
      content: listing.guidelines ? (
        <TabContent>
          <GuidelinesTab sections={listing.guidelines} />
        </TabContent>
      ) : (
        <TabEmptyState
          title="Ingen retningslinjer"
          description="Det er ikke lagt til retningslinjer for dette lokalet."
        />
      ),
    },
    {
      id: 'faq',
      label: 'Spørsmål',
      visible: !!listing.faq && listing.faq.length > 0,
      ...(listing.faq && listing.faq.length > 0 ? { badge: listing.faq.length } : {}),
      content: listing.faq ? (
        <TabContent>
          <FAQTab items={listing.faq} />
        </TabContent>
      ) : (
        <TabEmptyState
          title="Ingen spørsmål"
          description="Det er ikke lagt til ofte stilte spørsmål for dette lokalet."
        />
      ),
    },
  ], [listing, selectedServices, handleServiceSelect]);

  // Log API errors but fall back to mock data instead of showing error page
  React.useEffect(() => {
    if (error) {
      console.warn('API error loading listing, using mock data:', error);
    }
  }, [error]);

  // Show loading state - AFTER all hooks are defined
  if (isLoading) {
    return (
      <ContentLayout maxWidth="1440px" className="main-content-layout">
        <main
          id="main"
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '60vh',
            padding: 'var(--ds-spacing-8)',
          }}
        >
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

  // Breadcrumb items - defined after hooks to use listing.name
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Hjem', href: '/', onClick: () => navigate('/') },
    { label: 'Fasiliteter', href: '/', onClick: () => navigate('/') },
    { label: listing.name },
  ];

  // Handle favorite toggle
  const handleFavoriteToggle = async () => {
    setIsFavoriteLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setIsFavorited((prev) => !prev);
      // In production: auditLog({ type: isFavorited ? 'FAVORITE_REMOVED' : 'FAVORITE_ADDED', listingId: listing.id });
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  // Handle booking submission from UnifiedBookingEngine
  const handleBookingSubmit = async (selection: BookingSelection, formData: BookingFormData) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // In production, this would send the booking to the API
    console.log('Booking submitted:', { selection, formData, listingId: listing.id });

    // The UnifiedBookingEngine handles the success state internally
  };

  return (
    <ContentLayout maxWidth="1440px" className="main-content-layout">
      <main
        id="main"
        style={{
          paddingTop: 'var(--ds-spacing-4)',
          paddingBottom: 'var(--ds-spacing-8)',
        }}
      >
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Image Slider with arrows and dots */}
        <div style={{ marginTop: 'var(--ds-spacing-4)' }}>
          <ImageSlider
            images={listing.images}
            height={480}
            showArrows
            showDots
            showThumbnails
            showCounter
            enableFullscreen
          />
        </div>

        {/* Header with enhanced features */}
        <div style={{ marginTop: 'var(--ds-spacing-4)' }}>
          <ListingDetailHeader
            category={listing.category}
            listingType={listing.listingType}
            title={listing.name}
            location={listing.location}
            keyFacts={keyFacts}
            isFavorited={isFavorited}
            isAuthenticated={isAuthenticated}
            isFavoriteLoading={isFavoriteLoading}
            onFavorite={handleFavoriteToggle}
            onAuthRequired={() => setShowAuthModal(true)}
            shareData={shareData}
            shareUtmParams={{
              source: 'listing_detail',
              medium: 'web',
              campaign: 'share',
            }}
            onShare={() => {
              // Audit log share event
              console.log('Share tracked:', listing.id);
            }}
          />
        </div>

        {/* Auth Required Modal for Favorites */}
        <RequireAuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onLogin={() => {
            setShowAuthModal(false);
            // Navigate to login
            navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
          }}
          onRegister={() => {
            setShowAuthModal(false);
            navigate('/register?redirect=' + encodeURIComponent(window.location.pathname));
          }}
          actionContext="favorite"
        />

        {/* Main Content Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 380px',
            gap: 'var(--ds-spacing-6)',
            marginTop: 'var(--ds-spacing-6)',
          }}
          className="listing-detail-content"
        >
          {/* Left Column - Main Content */}
          <div>
            {/* Enhanced Tabs using ListingTabs component */}
            <div className="elegant-tabs">
              <ListingTabs
                tabs={tabConfig}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                variant="subtle"
              />
            </div>

            {/* Unified Booking Engine - Adaptive to listing type */}
            <div id="booking-section" style={{ marginTop: 'var(--ds-spacing-8)' }}>
              <UnifiedBookingEngine
                config={bookingConfig}
                listingName={listing.name}
                {...(listing.images[0]?.src ? { listingImage: listing.images[0].src } : {})}
                availableSlots={availabilitySlots}
                additionalServices={listing.additionalServices || []}
                currentStep={currentBookingStep}
                onStepChange={setCurrentBookingStep}
                onSubmit={handleBookingSubmit}
              />
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <aside
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--ds-spacing-4)',
              position: 'sticky',
              top: 'calc(var(--header-height, 70px) + var(--ds-spacing-4))',
              alignSelf: 'start',
              height: 'fit-content',
            }}
          >
            {/* Contact Info */}
            {listing.contact && (
              <ContactInfoCard
                {...(listing.contact.email && { email: listing.contact.email })}
                {...(listing.contact.phone && { phone: listing.contact.phone })}
                {...(listing.contact.name && { contactName: listing.contact.name })}
              />
            )}

            {/* Location Map */}
            {listing.coordinates && (
              <LocationCard
                address={listing.location}
                latitude={listing.coordinates.latitude}
                longitude={listing.coordinates.longitude}
                mapboxToken={MAPBOX_TOKEN}
              />
            )}

            {/* Opening Hours */}
            {listing.openingHours && listing.openingHours.length > 0 && (
              <OpeningHoursCard hours={listing.openingHours} />
            )}
          </aside>
        </div>

        {/* Enhanced Responsive CSS and Animations */}
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
          .listing-detail-content > div,
          .listing-detail-content > aside {
            animation: fadeInUp 0.5s ease-out forwards;
          }

          .listing-detail-content > aside {
            animation-delay: 0.1s;
          }

          /* Tab panel animations */
          [role="tabpanel"] > div {
            animation: fadeInUp 0.3s ease-out;
          }

          /* Card hover effects */
          .price-summary-card,
          .contact-info-card,
          .location-card,
          .opening-hours-card {
            transition: transform 0.2s ease, box-shadow 0.2s ease;
          }

          .price-summary-card:hover,
          .contact-info-card:hover,
          .location-card:hover,
          .opening-hours-card:hover {
            transform: translateY(-2px);
            box-shadow: var(--ds-shadow-md);
          }

          /* ═══════════════════════════════════════════════════════════
             Professional Tabs - Clean Underline Style
             ═══════════════════════════════════════════════════════════ */

          .elegant-tabs {
            margin-bottom: var(--ds-spacing-6);
          }

          .elegant-tabs [role="tablist"] {
            display: flex !important;
            gap: 0 !important;
            background: transparent !important;
            border: none !important;
            border-bottom: 1px solid var(--ds-color-neutral-border-subtle) !important;
            border-radius: 0 !important;
            padding: 0 !important;
          }

          /* Base tab styling */
          .elegant-tabs [role="tab"] {
            flex: 1;
            padding: var(--ds-spacing-4) var(--ds-spacing-5) !important;
            background-color: transparent !important;
            border: none !important;
            border-bottom: 3px solid transparent !important;
            border-radius: 0 !important;
            margin-bottom: -1px !important;
            color: var(--ds-color-neutral-text-subtle) !important;
            font-weight: var(--ds-font-weight-medium) !important;
            font-size: var(--ds-font-size-sm) !important;
            cursor: pointer;
            position: relative;
            transition: all 0.2s ease !important;
            white-space: nowrap;
          }

          /* Tab content wrapper with icon */
          .elegant-tabs .tab-content {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: var(--ds-spacing-2);
          }

          .elegant-tabs .tab-content svg {
            opacity: 0.5;
            transition: all 0.2s ease;
            flex-shrink: 0;
          }

          /* Hover state for unselected tabs */
          .elegant-tabs [role="tab"]:hover:not([aria-selected="true"]) {
            color: var(--ds-color-neutral-text-default) !important;
            border-bottom-color: var(--ds-color-neutral-border-default) !important;
          }

          .elegant-tabs [role="tab"]:hover:not([aria-selected="true"]) .tab-content svg {
            opacity: 0.7;
          }

          /* Selected tab - accent underline */
          .elegant-tabs [role="tab"][aria-selected="true"] {
            color: var(--ds-color-accent-base-default) !important;
            font-weight: var(--ds-font-weight-semibold) !important;
            border-bottom-color: var(--ds-color-accent-base-default) !important;
            background-color: transparent !important;
          }

          .elegant-tabs [role="tab"][aria-selected="true"] .tab-content svg {
            opacity: 1;
            color: var(--ds-color-accent-base-default);
          }

          /* Focus state */
          .elegant-tabs [role="tab"]:focus-visible {
            outline: 2px solid var(--ds-color-focus-outer) !important;
            outline-offset: -2px !important;
          }

          /* Facility chips styling */
          .facility-chip {
            transition: all 0.2s ease !important;
          }

          .facility-chip:hover {
            border-color: var(--ds-color-accent-border-subtle) !important;
            transform: translateY(-1px);
            box-shadow: var(--ds-shadow-sm) !important;
          }

          /* Service card hover */
          .service-card:hover {
            border-color: var(--ds-color-accent-border-default) !important;
            box-shadow: var(--ds-shadow-md) !important;
          }

          /* Booking section styling */
          .booking-section {
            box-shadow: var(--ds-shadow-sm);
            transition: box-shadow 0.3s ease;
          }

          .booking-section:hover {
            box-shadow: var(--ds-shadow-md);
          }

          /* Responsive breakpoints */
          @media (max-width: 991px) {
            .listing-detail-content {
              grid-template-columns: 1fr !important;
            }

            .listing-detail-content > aside {
              position: static !important;
              order: -1;
            }

            .booking-section {
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

            /* Calendar responsive */
            .availability-calendar-grid {
              font-size: var(--ds-font-size-xs);
              overflow-x: auto;
            }

            /* Hide thumbnails on mobile */
            .image-slider-thumbnails {
              display: none !important;
            }

            /* Tabs stay horizontal on mobile, just smaller */
            .elegant-tabs [role="tab"] {
              padding: var(--ds-spacing-3) var(--ds-spacing-2) !important;
              font-size: var(--ds-font-size-xs) !important;
            }

            .elegant-tabs .tab-content svg {
              display: none;
            }

            /* Facility grid on mobile - 2 columns */
            .facility-chips {
              grid-template-columns: repeat(2, 1fr) !important;
            }

            /* Header layout on mobile */
            .listing-detail-header > div:nth-child(2) {
              flex-direction: column;
              align-items: flex-start !important;
            }
          }

          /* Smooth scrolling */
          html {
            scroll-behavior: smooth;
          }

          /* Focus states for accessibility */
          .availability-calendar-cell:focus {
            outline: 2px solid var(--ds-color-focus-outer);
            outline-offset: -2px;
            z-index: 1;
          }

          /* Button hover enhancements */
          button[type="button"] {
            transition: all 0.2s ease !important;
          }

          /* Chip/tag hover effects */
          .facility-chip {
            transition: transform 0.2s ease, background-color 0.2s ease;
          }

          .facility-chip:hover {
            transform: translateY(-1px);
          }
        `}</style>
      </main>
    </ContentLayout>
  );
}

export default ListingDetailPage;
