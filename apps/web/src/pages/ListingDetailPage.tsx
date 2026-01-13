/**
 * ListingDetailPage
 *
 * Full listing detail page with tabs matching the Digilist design.
 * Structure: Breadcrumb -> ImageSlider -> Header -> Tabs -> Content + Sidebar -> Calendar
 */
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ContentLayout,
  Breadcrumb,
  ImageSlider,
  UnifiedBookingEngine,
  RequireAuthModal,
  Heading,
  Paragraph,
  Spinner,
  determineBookingMode,
} from '@xala/ds';
import type {
  BreadcrumbItem,
  GalleryImage,
  AdditionalService,
  OpeningHoursDay,
  GuidelineSection,
  FAQItem,
  BookingConfig,
  BookingSelection,
  BookingFormData,
  AvailabilitySlot,
  BookingPriceUnit,
} from '@xala/ds';
import {
  usePublicListing,
  type Listing,
} from '@digilist/client-sdk';

// Mapbox token from environment
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// =============================================================================
// Icons
// =============================================================================

function CheckIcon({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function UsersIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function MailIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function PhoneIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function MapPinIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function ClockIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function HeartIcon({ size = 20, filled = false }: { size?: number; filled?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function ShareIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

// Facility Icons
function ProjectorIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="10" rx="2" />
      <circle cx="8" cy="12" r="2" />
      <path d="M18 12h.01" />
    </svg>
  );
}

function WhiteboardIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="14" rx="2" />
      <path d="M3 17h18" />
    </svg>
  );
}

function WifiIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.55a11 11 0 0 1 14.08 0" />
      <path d="M1.42 9a16 16 0 0 1 21.16 0" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <circle cx="12" cy="20" r="1" />
    </svg>
  );
}

function VideoIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" />
    </svg>
  );
}

// =============================================================================
// Types
// =============================================================================

interface ListingDetail {
  id: string;
  name: string;
  category: string;
  listingType?: string;
  location: string;
  description?: string;
  images: GalleryImage[];
  facilities: { id: string; label: string }[];
  capacity?: number;
  additionalServices?: AdditionalService[];
  contact?: {
    email?: string;
    phone?: string;
    name?: string;
  };
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  openingHours?: OpeningHoursDay[];
  price?: number;
  priceUnit?: string;
  currency?: string;
  guidelines?: GuidelineSection[];
  faq?: FAQItem[];
}

// =============================================================================
// Transform Functions
// =============================================================================

function transformApiListingToDetail(apiListing: Listing): ListingDetail {
  const metadata = (apiListing.metadata || {}) as Record<string, unknown>;
  const location = metadata.location as Record<string, unknown> | undefined;

  // Transform images
  const images: GalleryImage[] = (apiListing.images || []).map((src: string, index: number) => ({
    id: `${index + 1}`,
    src,
    alt: `${apiListing.name} - Bilde ${index + 1}`,
    thumbnail: src.replace(/w=\d+/, 'w=200').replace(/h=\d+/, 'h=150'),
  }));

  // Transform facilities (from amenities)
  const amenities = metadata.amenities as string[] | undefined;
  const facilities = (amenities || []).map((label: string, index: number) => ({
    id: `facility-${index}`,
    label,
  }));

  // Build location string
  const locationString = location
    ? [location.address, location.postalCode, location.city].filter(Boolean).join(', ')
    : 'Ukjent adresse';

  const result: ListingDetail = {
    id: apiListing.id,
    name: apiListing.name,
    category: (metadata.category as string) || apiListing.type || 'Lokale',
    listingType: apiListing.type,
    location: locationString,
    description: apiListing.description || '',
    images,
    facilities,
  };

  if (apiListing.capacity) {
    result.capacity = apiListing.capacity;
  }

  // Additional services
  const additionalServices = metadata.additionalServices as AdditionalService[] | undefined;
  if (additionalServices && additionalServices.length > 0) {
    result.additionalServices = additionalServices;
  }

  // Contact info
  if (metadata.contactEmail || metadata.contactPhone) {
    const contact: { email?: string; phone?: string; name?: string } = {};
    if (metadata.contactEmail) contact.email = metadata.contactEmail as string;
    if (metadata.contactPhone) contact.phone = metadata.contactPhone as string;
    if (metadata.contactName) contact.name = metadata.contactName as string;
    result.contact = contact;
  }

  // Coordinates
  if (location && typeof location.lat === 'number' && typeof location.lng === 'number') {
    result.coordinates = {
      latitude: location.lat,
      longitude: location.lng,
    };
  }

  // Opening hours
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
    const grouped: Record<string, string[]> = {};
    const dayNames: Record<string, string> = {
      monday: 'Mandag', tuesday: 'Tirsdag', wednesday: 'Onsdag',
      thursday: 'Torsdag', friday: 'Fredag', saturday: 'Lørdag', sunday: 'Søndag',
    };

    // Group days with same hours
    Object.entries(openingHoursData).forEach(([day, hours]) => {
      const timeStr = hours.open && hours.close ? `${hours.open} - ${hours.close}` : 'Stengt';
      if (!grouped[timeStr]) grouped[timeStr] = [];
      grouped[timeStr].push(dayNames[day] || day);
    });

    return Object.entries(grouped).map(([hours, days]) => ({
      day: days.join(', '),
      hours,
      isClosed: hours === 'Stengt',
    }));
  }

  return [
    { day: 'Mandag-Fredag', hours: '08:00 - 22:00' },
    { day: 'Lørdag', hours: '09:00 - 20:00' },
    { day: 'Søndag', hours: '10:00 - 18:00' },
  ];
}

function mapPriceUnit(unit: string): string {
  const unitMap: Record<string, string> = {
    hour: 'time', day: 'dag', week: 'uke', month: 'måned', event: 'arrangement',
  };
  return unitMap[unit] || unit;
}

// Default guidelines if not provided by API
const defaultGuidelines: GuidelineSection[] = [
  { id: 'cancellation', title: 'Avbestilling', content: 'Avbestilling må skje senest 24 timer før reservert tidspunkt.' },
  { id: 'damages', title: 'Skader', content: 'Leietaker er ansvarlig for eventuelle skader på lokalet eller utstyr.' },
  { id: 'cleaning', title: 'Renhold', content: 'Lokalet skal forlates i ryddig stand.' },
];

// Default FAQ if not provided by API
const defaultFaq: FAQItem[] = [
  { id: 'how-to-book', question: 'Hvordan booker jeg?', answer: 'Velg ønskede tidspunkter i kalenderen og bekreft bookingen.' },
  { id: 'cancellation-policy', question: 'Hva er avbestillingsreglene?', answer: 'Du kan avbestille gratis inntil 24 timer før.' },
];

// Generate mock availability slots
function generateMockAvailabilitySlots(startDate: Date): AvailabilitySlot[] {
  const slots: AvailabilitySlot[] = [];
  for (let day = 0; day < 7; day++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + day);
    for (let hour = 8; hour <= 19; hour++) {
      const slotDate = new Date(date);
      slotDate.setHours(hour, 0, 0, 0);
      const now = new Date();
      let status: 'available' | 'occupied' | 'blocked' | 'past';
      if (slotDate < now) {
        status = 'past';
      } else {
        const random = Math.random();
        status = random < 0.65 ? 'available' : random < 0.85 ? 'occupied' : 'blocked';
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

// Create booking config
function createBookingConfig(listing: ListingDetail): BookingConfig {
  const listingType = (listing.listingType || 'SPACE') as BookingConfig['listingType'];
  const priceUnit = (listing.priceUnit || 'time') as BookingPriceUnit;
  const unitMap: Record<string, BookingPriceUnit> = {
    'time': 'hour', 'dag': 'day', 'uke': 'week', 'måned': 'month',
    'hour': 'hour', 'day': 'day', 'week': 'week', 'month': 'month',
  };
  const normalizedUnit = unitMap[priceUnit] || 'hour';
  const mode = determineBookingMode(listingType, normalizedUnit);

  return {
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
}

// Mock listing data
const mockListingDetail: ListingDetail = {
  id: '1',
  name: 'Møterom 101',
  category: 'Rom',
  listingType: 'SPACE',
  location: 'Storgata 1, 0155 Oslo',
  description: 'Dette er et eksempel på beskrivelse av fasiliteten. Her kan det stå informasjon om rommet, utstyret eller tjenesten som listes.',
  images: [
    { id: '1', src: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&h=900&fit=crop', alt: 'Møterom', thumbnail: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=200&h=150&fit=crop' },
    { id: '2', src: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1600&h=900&fit=crop', alt: 'Møterom 2', thumbnail: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=200&h=150&fit=crop' },
    { id: '3', src: 'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=1600&h=900&fit=crop', alt: 'Møterom 3', thumbnail: 'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=200&h=150&fit=crop' },
  ],
  capacity: 50,
  facilities: [
    { id: 'projector', label: 'Projektor' },
    { id: 'whiteboard', label: 'Tavle' },
    { id: 'wifi', label: 'WiFi' },
    { id: 'video', label: 'Videokonferanse' },
  ],
  additionalServices: [
    { id: 'extra-time', name: 'Ekstra tid', description: 'Forleng bookingen med 30 minutter', price: 200, currency: 'NOK' },
    { id: 'equipment', name: 'Utstyr', description: 'Inkluderer ballnett, musikanlegg og annet utstyr', price: 150, currency: 'NOK' },
    { id: 'caretaker', name: 'Vaktmesterhjelp', description: 'Hjelp med oppsett og nedrigg av utstyr', price: 300, currency: 'NOK' },
    { id: 'security', name: 'Sikkerhet', description: 'Vaktmester til stede under hele arrangementet', price: 500, currency: 'NOK' },
  ],
  contact: { email: 'kontakt@digilist.no', phone: '+47 12 34 56 78' },
  coordinates: { latitude: 59.9139, longitude: 10.7522 },
  openingHours: [
    { day: 'Mandag-Fredag', hours: '08:00 - 22:00' },
    { day: 'Lørdag', hours: '09:00 - 20:00' },
    { day: 'Søndag', hours: '10:00 - 18:00' },
  ],
  price: 500,
  priceUnit: 'time',
  currency: 'NOK',
  guidelines: defaultGuidelines,
  faq: defaultFaq,
};

// =============================================================================
// Facility Icon Mapper
// =============================================================================

function getFacilityIcon(label: string): React.ReactElement {
  const lowerLabel = label.toLowerCase();
  if (lowerLabel.includes('projektor') || lowerLabel.includes('projector')) return <ProjectorIcon size={14} />;
  if (lowerLabel.includes('tavle') || lowerLabel.includes('whiteboard')) return <WhiteboardIcon size={14} />;
  if (lowerLabel.includes('wifi') || lowerLabel.includes('internet')) return <WifiIcon size={14} />;
  if (lowerLabel.includes('video') || lowerLabel.includes('konferanse')) return <VideoIcon size={14} />;
  return <CheckIcon size={14} />;
}

// =============================================================================
// Main Component
// =============================================================================

export function ListingDetailPage(): React.ReactElement {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch listing data from API
  const { data: apiResponse, isLoading, error } = usePublicListing(params.id || '');

  // State
  const [activeTab, setActiveTab] = React.useState('overview');
  const [currentBookingStep, setCurrentBookingStep] = React.useState(0);
  const [selectedServices, setSelectedServices] = React.useState<string[]>([]);
  const [calendarStartDate] = React.useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(today.setDate(diff));
  });
  const [isFavorited, setIsFavorited] = React.useState(false);
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const isAuthenticated = false;

  // Transform API data to ListingDetail format
  const listing: ListingDetail = React.useMemo(() => {
    if (apiResponse?.data) {
      return transformApiListingToDetail(apiResponse.data);
    }
    return mockListingDetail;
  }, [apiResponse]);

  // Generate availability slots
  const availabilitySlots = React.useMemo(() => generateMockAvailabilitySlots(calendarStartDate), [calendarStartDate]);

  // Create booking configuration
  const bookingConfig = React.useMemo(() => createBookingConfig(listing), [listing]);

  // Log API errors
  React.useEffect(() => {
    if (error) console.warn('API error loading listing, using mock data:', error);
  }, [error]);

  // Loading state
  if (isLoading) {
    return (
      <ContentLayout maxWidth="1440px" className="main-content-layout">
        <main id="main" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', padding: 'var(--ds-spacing-8)' }}>
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

  // Breadcrumb items
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Hjem', href: '/', onClick: () => navigate('/') },
    { label: 'Fasiliteter', href: '/listings', onClick: () => navigate('/listings') },
    { label: listing.name },
  ];

  // Handle booking submission
  const handleBookingSubmit = async (selection: BookingSelection, formData: BookingFormData) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log('Booking submitted:', { selection, formData, listingId: listing.id });
  };

  // Tabs
  const tabs = [
    { id: 'overview', label: 'Oversikt' },
    { id: 'calendar', label: 'Aktivitetskalender' },
    { id: 'guidelines', label: 'Retningslinjer' },
    { id: 'faq', label: 'FAQ' },
  ];

  return (
    <ContentLayout maxWidth="1440px" className="main-content-layout">
      <main id="main" style={{ paddingTop: 'var(--ds-spacing-4)', paddingBottom: 'var(--ds-spacing-8)' }}>
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Image Slider */}
        <div style={{ marginTop: 'var(--ds-spacing-4)' }}>
          <ImageSlider images={listing.images} height={420} showArrows showDots showThumbnails showCounter enableFullscreen />
        </div>

        {/* Header */}
        <div style={{ marginTop: 'var(--ds-spacing-4)' }}>
          {/* Category Badge */}
          <span style={{
            display: 'inline-block',
            padding: 'var(--ds-spacing-1) var(--ds-spacing-3)',
            backgroundColor: 'var(--ds-color-neutral-surface-default)',
            border: '1px solid var(--ds-color-neutral-border-default)',
            borderRadius: 'var(--ds-border-radius-md)',
            fontSize: 'var(--ds-font-size-sm)',
            color: 'var(--ds-color-neutral-text-default)',
            marginBottom: 'var(--ds-spacing-2)',
          }}>
            {listing.category}
          </span>

          {/* Title Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 'var(--ds-spacing-2)' }}>
            <Heading level={1} data-size="lg" style={{ margin: 0 }}>
              {listing.name}
            </Heading>
            <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
              <button
                type="button"
                onClick={() => isAuthenticated ? setIsFavorited(!isFavorited) : setShowAuthModal(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 'var(--ds-spacing-2)',
                  color: isFavorited ? 'var(--ds-color-danger-base-default)' : 'var(--ds-color-neutral-text-subtle)',
                }}
                aria-label={isFavorited ? 'Fjern fra favoritter' : 'Legg til favoritter'}
              >
                <HeartIcon filled={isFavorited} />
              </button>
              <button
                type="button"
                onClick={() => navigator.share?.({ title: listing.name, url: window.location.href })}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 'var(--ds-spacing-2)',
                  color: 'var(--ds-color-neutral-text-subtle)',
                }}
                aria-label="Del"
              >
                <ShareIcon />
              </button>
            </div>
          </div>

          {/* Location */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)', marginTop: 'var(--ds-spacing-2)', color: 'var(--ds-color-neutral-text-subtle)' }}>
            <MapPinIcon size={16} />
            <Paragraph data-size="sm" style={{ margin: 0 }}>{listing.location}</Paragraph>
          </div>
        </div>

        {/* Pill Tabs */}
        <div style={{ marginTop: 'var(--ds-spacing-6)' }}>
          <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', borderBottom: '1px solid var(--ds-color-neutral-border-subtle)', paddingBottom: 'var(--ds-spacing-3)' }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: 'var(--ds-spacing-3) var(--ds-spacing-5)',
                  borderRadius: 'var(--ds-border-radius-full)',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 'var(--ds-font-size-sm)',
                  fontWeight: 'var(--ds-font-weight-medium)',
                  transition: 'all 0.2s ease',
                  backgroundColor: activeTab === tab.id ? 'var(--ds-color-accent-base-default)' : 'transparent',
                  color: activeTab === tab.id ? 'white' : 'var(--ds-color-neutral-text-subtle)',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 'var(--ds-spacing-6)', marginTop: 'var(--ds-spacing-6)' }} className="listing-detail-grid">
          {/* Left Column - Tab Content */}
          <div>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
                {/* Description */}
                <section>
                  <Heading level={2} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-3)' }}>
                    Beskrivelse
                  </Heading>
                  <Paragraph data-size="md" style={{ margin: 0, lineHeight: '1.6', color: 'var(--ds-color-neutral-text-default)' }}>
                    {listing.description}
                  </Paragraph>
                </section>

                {/* Capacity Card */}
                {listing.capacity && (
                  <section>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--ds-spacing-4)',
                      padding: 'var(--ds-spacing-4)',
                      backgroundColor: 'var(--ds-color-neutral-surface-default)',
                      borderRadius: 'var(--ds-border-radius-lg)',
                      border: '1px solid var(--ds-color-neutral-border-subtle)',
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '48px',
                        height: '48px',
                        backgroundColor: 'var(--ds-color-neutral-background-default)',
                        borderRadius: 'var(--ds-border-radius-md)',
                        color: 'var(--ds-color-accent-base-default)',
                      }}>
                        <UsersIcon size={24} />
                      </div>
                      <div>
                        <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'var(--ds-font-weight-medium)' }}>
                          Maks tillatt
                        </Paragraph>
                        <Paragraph data-size="md" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)' }}>
                          {listing.capacity} personer
                        </Paragraph>
                      </div>
                    </div>
                  </section>
                )}

                {/* Facilities */}
                {listing.facilities.length > 0 && (
                  <section>
                    <Paragraph data-size="xs" style={{ margin: 0, marginBottom: 'var(--ds-spacing-3)', color: 'var(--ds-color-neutral-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'var(--ds-font-weight-medium)' }}>
                      Fasiliteter
                    </Paragraph>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ds-spacing-2)' }}>
                      {listing.facilities.map((facility) => (
                        <span
                          key={facility.id}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 'var(--ds-spacing-2)',
                            padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                            backgroundColor: 'var(--ds-color-neutral-surface-default)',
                            border: '1px solid var(--ds-color-neutral-border-default)',
                            borderRadius: 'var(--ds-border-radius-full)',
                            fontSize: 'var(--ds-font-size-sm)',
                            color: 'var(--ds-color-neutral-text-default)',
                          }}
                        >
                          {getFacilityIcon(facility.label)}
                          {facility.label}
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                {/* Additional Services */}
                {listing.additionalServices && listing.additionalServices.length > 0 && (
                  <section>
                    <Paragraph data-size="xs" style={{ margin: 0, marginBottom: 'var(--ds-spacing-3)', color: 'var(--ds-color-neutral-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'var(--ds-font-weight-medium)' }}>
                      Tilleggstjenester
                    </Paragraph>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
                      {listing.additionalServices.map((service) => {
                        const isSelected = selectedServices.includes(service.id);
                        return (
                          <div
                            key={service.id}
                            onClick={() => setSelectedServices(prev => isSelected ? prev.filter(id => id !== service.id) : [...prev, service.id])}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setSelectedServices(prev => isSelected ? prev.filter(id => id !== service.id) : [...prev, service.id]);
                              }
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 'var(--ds-spacing-3)',
                              padding: 'var(--ds-spacing-4)',
                              backgroundColor: isSelected ? 'var(--ds-color-accent-surface-default)' : 'var(--ds-color-neutral-background-default)',
                              border: `1px solid ${isSelected ? 'var(--ds-color-accent-border-default)' : 'var(--ds-color-neutral-border-subtle)'}`,
                              borderRadius: 'var(--ds-border-radius-lg)',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                            }}
                          >
                            {/* Green Check Icon */}
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '24px',
                              height: '24px',
                              flexShrink: 0,
                              color: 'var(--ds-color-success-base-default)',
                            }}>
                              <CheckIcon size={20} color="var(--ds-color-success-base-default)" />
                            </div>

                            {/* Content */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)', color: 'var(--ds-color-neutral-text-default)' }}>
                                {service.name}
                              </Paragraph>
                              {service.description && (
                                <Paragraph data-size="xs" style={{ margin: 'var(--ds-spacing-1) 0 0 0', color: 'var(--ds-color-neutral-text-subtle)' }}>
                                  {service.description}
                                </Paragraph>
                              )}
                            </div>

                            {/* Price Badge */}
                            <div style={{
                              padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                              backgroundColor: 'var(--ds-color-accent-surface-default)',
                              borderRadius: 'var(--ds-border-radius-md)',
                              color: 'var(--ds-color-accent-base-default)',
                              fontSize: 'var(--ds-font-size-sm)',
                              fontWeight: 'var(--ds-font-weight-semibold)',
                              flexShrink: 0,
                            }}>
                              +{service.price} kr
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}
              </div>
            )}

            {/* Guidelines Tab */}
            {activeTab === 'guidelines' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
                {listing.guidelines?.map((guideline) => (
                  <div key={guideline.id} style={{
                    padding: 'var(--ds-spacing-4)',
                    backgroundColor: 'var(--ds-color-neutral-surface-default)',
                    borderRadius: 'var(--ds-border-radius-lg)',
                    border: '1px solid var(--ds-color-neutral-border-subtle)',
                  }}>
                    <Heading level={3} data-size="xs" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>
                      {guideline.title}
                    </Heading>
                    <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                      {guideline.content}
                    </Paragraph>
                  </div>
                ))}
              </div>
            )}

            {/* FAQ Tab */}
            {activeTab === 'faq' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
                {listing.faq?.map((item) => (
                  <details key={item.id} style={{
                    padding: 'var(--ds-spacing-4)',
                    backgroundColor: 'var(--ds-color-neutral-surface-default)',
                    borderRadius: 'var(--ds-border-radius-lg)',
                    border: '1px solid var(--ds-color-neutral-border-subtle)',
                  }}>
                    <summary style={{
                      cursor: 'pointer',
                      fontWeight: 'var(--ds-font-weight-medium)',
                      color: 'var(--ds-color-neutral-text-default)',
                    }}>
                      {item.question}
                    </summary>
                    <Paragraph data-size="sm" style={{ margin: 0, marginTop: 'var(--ds-spacing-3)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                      {item.answer}
                    </Paragraph>
                  </details>
                ))}
              </div>
            )}

            {/* Calendar Tab - Show booking engine */}
            {activeTab === 'calendar' && (
              <div>
                <Paragraph data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                  Se tilgjengelige tidspunkter i kalenderen under.
                </Paragraph>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
            {/* Contact Info Card */}
            {listing.contact && (
              <div style={{
                padding: 'var(--ds-spacing-4)',
                backgroundColor: 'var(--ds-color-neutral-background-default)',
                borderRadius: 'var(--ds-border-radius-lg)',
                border: '1px solid var(--ds-color-neutral-border-subtle)',
              }}>
                <Paragraph data-size="xs" style={{ margin: 0, marginBottom: 'var(--ds-spacing-3)', color: 'var(--ds-color-neutral-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'var(--ds-font-weight-medium)' }}>
                  Kontaktinformasjon
                </Paragraph>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
                  {listing.contact.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
                      <div style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                        <MailIcon />
                      </div>
                      <div>
                        <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>E-post</Paragraph>
                        <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>{listing.contact.email}</Paragraph>
                      </div>
                    </div>
                  )}
                  {listing.contact.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
                      <div style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                        <PhoneIcon />
                      </div>
                      <div>
                        <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>Telefon</Paragraph>
                        <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>{listing.contact.phone}</Paragraph>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Location Map Card */}
            <div style={{
              backgroundColor: 'var(--ds-color-neutral-background-default)',
              borderRadius: 'var(--ds-border-radius-lg)',
              border: '1px solid var(--ds-color-neutral-border-subtle)',
              overflow: 'hidden',
            }}>
              <div style={{ padding: 'var(--ds-spacing-3) var(--ds-spacing-4)', borderBottom: '1px solid var(--ds-color-neutral-border-subtle)', display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                <MapPinIcon size={16} />
                <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'var(--ds-font-weight-medium)' }}>
                  Lokasjon
                </Paragraph>
              </div>
              {listing.coordinates ? (
                <div>
                  <a
                    href={`https://www.google.com/maps?q=${listing.coordinates.latitude},${listing.coordinates.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'block', padding: 'var(--ds-spacing-2) var(--ds-spacing-4)', fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-accent-base-default)' }}
                  >
                    View larger map
                  </a>
                  <div style={{ height: '180px', backgroundColor: 'var(--ds-color-neutral-surface-hover)' }}>
                    {MAPBOX_TOKEN ? (
                      <img
                        src={`https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-s+3b82f6(${listing.coordinates.longitude},${listing.coordinates.latitude})/${listing.coordinates.longitude},${listing.coordinates.latitude},14,0/340x180@2x?access_token=${MAPBOX_TOKEN}`}
                        alt="Map"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--ds-color-neutral-text-subtle)' }}>
                        <span>Kart</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ padding: 'var(--ds-spacing-6)', textAlign: 'center', color: 'var(--ds-color-neutral-text-subtle)' }}>
                  <span>Kart ikke tilgjengelig</span>
                </div>
              )}
            </div>

            {/* Opening Hours Card */}
            {listing.openingHours && listing.openingHours.length > 0 && (
              <div style={{
                padding: 'var(--ds-spacing-4)',
                backgroundColor: 'var(--ds-color-neutral-background-default)',
                borderRadius: 'var(--ds-border-radius-lg)',
                border: '1px solid var(--ds-color-neutral-border-subtle)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)', marginBottom: 'var(--ds-spacing-3)' }}>
                  <ClockIcon size={16} />
                  <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'var(--ds-font-weight-medium)' }}>
                    Åpningstider
                  </Paragraph>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
                  {listing.openingHours.map((day, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-default)' }}>
                        {day.day}
                      </Paragraph>
                      <Paragraph data-size="sm" style={{ margin: 0, color: day.isClosed ? 'var(--ds-color-neutral-text-subtle)' : 'var(--ds-color-accent-base-default)', fontWeight: 'var(--ds-font-weight-medium)' }}>
                        {day.hours}
                      </Paragraph>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>

        {/* Booking Calendar Section (Full Width) */}
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

        {/* Auth Modal */}
        <RequireAuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onLogin={() => { setShowAuthModal(false); navigate('/login?redirect=' + encodeURIComponent(window.location.pathname)); }}
          onRegister={() => { setShowAuthModal(false); navigate('/register?redirect=' + encodeURIComponent(window.location.pathname)); }}
          actionContext="favorite"
        />

        {/* Responsive Styles */}
        <style>{`
          @media (max-width: 991px) {
            .listing-detail-grid {
              grid-template-columns: 1fr !important;
            }
          }

          @media (max-width: 599px) {
            .image-slider {
              margin-left: calc(-1 * var(--ds-spacing-4));
              margin-right: calc(-1 * var(--ds-spacing-4));
              border-radius: 0 !important;
            }
          }
        `}</style>
      </main>
    </ContentLayout>
  );
}

export default ListingDetailPage;
