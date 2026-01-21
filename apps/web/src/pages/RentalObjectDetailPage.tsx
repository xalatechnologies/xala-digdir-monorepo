/**
 * RentalObjectDetailPage
 *
 * Rental object detail page using feature-based architecture.
 * Structure: Breadcrumb -> ImageSlider -> RentalObjectDetailsLayout
 */
import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import type { FlowContext } from '@digilist/client-sdk';
import {
  ContentLayout,
  Breadcrumb,
  ImageSlider,
  Spinner,
  Paragraph,
} from '@xalatechnologies/platform/ui';
import type { BreadcrumbItem, GalleryImage } from '@xalatechnologies/platform/ui';
import {
  useRentalObject,
  useRentalObjectBySlug,
  type RentalObject as ApiListing,
} from '@digilist/client-sdk';
import {
  RentalObjectDetailsLayout,
  type RentalObject,
  type RentalObjectType,
  type BookingMode,
  type OpeningHours,
  type KeyFacts,
  type RentalObjectMetadata,
  type Rule,
  type FAQItem,
  type Amenity,
  logAuditEvent,
} from '../features/rental-object-details';
import { useAuth } from '../hooks/useAuth';
import { useT } from '@xala/i18n';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const TENANT_ID = import.meta.env.VITE_TENANT_ID;

/**
 * Navigation state passed when redirecting with flow context after login
 * This allows the listing page to restore booking state (selected slots, etc.)
 */
interface FlowContextNavigationState {
  /** The restored flow context containing booking state */
  flowContext: FlowContext;
  /** Whether this navigation is from a flow restoration */
  isFlowRestoration: boolean;
}

/**
 * Navigation state when flow context expired
 */
interface FlowContextExpiredState {
  /** Indicates the booking session expired */
  flowContextExpired: true;
}

/**
 * Map API DTO directly to feature Listing type
 * The API now returns pre-formatted DTOs via toDetailsProjection,
 * so we just need to map field names - no complex transformation needed.
 * @param api - The API rental object data
 * @param t - Translation function for localizing day names
 */
function transformApiToListing(api: ApiListing, t: (key: string) => string): RentalObject {
  // API DTO is already well-structured, just map to feature types
  const dto = api as any; // API returns flat DTO with all fields

  // Map rental object type - RESOURCE and SPACE are venues so map to FACILITY
  const typeMap: Record<string, RentalObjectType> = {
    EQUIPMENT: 'EQUIPMENT', EVENT: 'EVENT', FACILITY: 'FACILITY',
    SPACE: 'FACILITY', RESOURCE: 'FACILITY',
  };
  const listingType: RentalObjectType = typeMap[dto.type] || 'OTHER';

  // Map images directly from DTO (handle nested url structure)
  const images = (dto.images || []).map((img: any, index: number) => ({
    id: img.id || `img-${index}`,
    // API returns img.url as object {url: string, alt: string} or as string
    url: typeof img.url === 'string' ? img.url : (img.url?.url || img.src || ''),
    alt: img.alt || dto.title || dto.name || '',
    isPrimary: img.isPrimary ?? index === 0,
    order: img.order ?? index,
  }));

  // Map amenities - check both flat dto.amenities and nested dto.metadata.amenities
  const amenitiesSource = dto.allAmenities || dto.amenities || dto.metadata?.amenities || [];
  const amenities: Amenity[] = amenitiesSource.map((a: any, i: number) => ({
    id: typeof a === 'string' ? a : a.id || `amenity-${i}`,
    name: typeof a === 'string' ? a : a.name || a,
    icon: typeof a === 'object' ? a.icon : undefined,
    category: typeof a === 'object' ? a.category : 'general',
    description: typeof a === 'string' ? a : a.name || a,
  }));

  // Map FAQ from DTO
  const faq: FAQItem[] = (dto.faq || []).map((f: any, i: number) => ({
    id: f.id || `faq-${i}`,
    question: f.question || '',
    answer: f.answer || '',
  }));

  // Map rules from DTO
  const rules: Rule[] = (dto.rules || []).map((r: any, i: number) => ({
    id: r.id || `rule-${i}`,
    title: r.title || '',
    content: r.content || r.description || '',
    category: 'general' as const,
  }));

  // Map opening hours from DTO - check both flat and nested in metadata (handle both camelCase and snake_case)
  const openingHoursData = dto.openingHours || dto.metadata?.openingHours || dto.metadata?.opening_hours;

  // Convert opening hours to array format
  let openingHoursArray: any[] = [];
  if (Array.isArray(openingHoursData)) {
    // Already in array format
    openingHoursArray = openingHoursData;
  } else if (openingHoursData && typeof openingHoursData === 'object') {
    // Convert object format {monday: {open, close}, tuesday: {...}} to array
    const dayNameMap: Record<string, { name: string; index: number }> = {
      monday: { name: t('weekdays.monday'), index: 1 },
      tuesday: { name: t('weekdays.tuesday'), index: 2 },
      wednesday: { name: t('weekdays.wednesday'), index: 3 },
      thursday: { name: t('weekdays.thursday'), index: 4 },
      friday: { name: t('weekdays.friday'), index: 5 },
      saturday: { name: t('weekdays.saturday'), index: 6 },
      sunday: { name: t('weekdays.sunday'), index: 0 },
    };

    openingHoursArray = Object.entries(openingHoursData)
      .filter(([key]) => dayNameMap[key])
      .map(([key, hours]: [string, any]) => {
        // Handle array format [{from, to}] and object format {open, close}
        const hoursData = Array.isArray(hours) ? hours[0] : hours;
        const openTime = hoursData?.open || hoursData?.from || '';
        const closeTime = hoursData?.close || hoursData?.to || '';
        return {
          day: dayNameMap[key]?.name || key,
          dayIndex: dayNameMap[key]?.index ?? 0,
          open: openTime,
          close: closeTime,
          isClosed: !openTime && !closeTime,
        };
      });
  }

  const openingHours: OpeningHours = {
    regular: openingHoursArray.map((day: any) => ({
      day: day.day || '',
      dayIndex: day.dayIndex ?? 0,
      open: day.open || day.openTime || '',
      close: day.close || day.closeTime || '',
      isClosed: day.isClosed ?? false,
    })),
  };

  // Build contact from either flat fields or nested metadata
  const contactData = dto.metadata?.contact || {};
  const metadataContactName = dto.metadata?.contactName;
  const metadataContactEmail = dto.metadata?.contactEmail;
  const metadataContactPhone = dto.metadata?.contactPhone;

  const contact = (dto.contactName || dto.contactEmail || dto.contactPhone || contactData.name || contactData.email || contactData.phone || metadataContactName || metadataContactEmail || metadataContactPhone) ? {
    ...(dto.contactName || contactData.name || metadataContactName ? { name: dto.contactName || contactData.name || metadataContactName } : {}),
    ...(dto.contactEmail || contactData.email || metadataContactEmail ? { email: dto.contactEmail || contactData.email || metadataContactEmail } : {}),
    ...(dto.contactPhone || contactData.phone || metadataContactPhone ? { phone: dto.contactPhone || contactData.phone || metadataContactPhone } : {}),
  } : undefined;

  // Build address from either flat fields or nested metadata
  const addressData = dto.metadata?.address || {};
  const locationData = dto.metadata?.location || {};
  const address = {
    formatted: dto.locationFormatted || '',
    street: dto.addressStreet || addressData.street || locationData.address || '',
    postalCode: dto.addressPostalCode || addressData.postalCode || locationData.postalCode || '',
    city: dto.addressCity || dto.city || addressData.city || locationData.city || '',
    ...(dto.latitude || locationData.latitude ? {
      coordinates: {
        latitude: dto.latitude || locationData.latitude,
        longitude: dto.longitude || locationData.longitude
      }
    } : {}),
  };

  // Build metadata
  const metadata: RentalObjectMetadata = {
    description: dto.description || '',
    shortDescription: dto.descriptionExcerpt || dto.description?.slice(0, 150) || '',
    amenities,
    includedFacilities: (dto.includedEquipment || []).map((f: any, i: number) => ({
      id: f.id || `facility-${i}`,
      name: f.name || f,
      quantity: f.quantity,
      description: f.description,
    })),
    rules,
    faq,
    highlights: dto.highlights || [],
  };

  // Map booking mode from API timeMode
  const bookingModeMap: Record<string, BookingMode> = {
    SLOT: 'SINGLE_SLOT',
    PERIOD: 'RECURRING',
    ALL_DAY: 'SINGLE_SLOT',
  };
  const bookingMode = bookingModeMap[dto.timeMode] || 'SINGLE_SLOT';

  // Build key facts
  const keyFacts: KeyFacts = {
    ...(dto.capacity ? { capacity: dto.capacity } : {}),
    bookingMode,
  };

  // Build activity data (empty for now - API doesn't provide it yet)
  const activityData: ActivityData = {
    type: listingType === 'FACILITY' ? 'events' : listingType === 'EQUIPMENT' ? 'rentals' : 'sessions',
    events: [],
    rentals: [],
    totalCount: 0,
  };

  return {
    id: dto.id,
    tenantId: dto.tenantId || TENANT_ID,
    type: listingType,
    name: dto.name || '',
    title: dto.title, // EXPAND phase: include title field from API
    category: dto.typeLabel || dto.type,
    status: 'published',
    images,
    address,
    ...(contact && Object.keys(contact).length > 0 ? { contact } : {}),
    openingHours,
    keyFacts,
    metadata,
    activityData,
    bookingConfig: { enabled: true, mode: bookingMode, approval: 'NONE', paymentRequired: false },
    ...(dto.priceAmount ? {
      pricing: {
        basePrice: dto.priceAmount,
        currency: dto.priceCurrency || 'NOK',
        unit: dto.priceUnit || 'hour',
        displayPrice: dto.priceDisplay || `${dto.priceAmount} ${dto.priceCurrency}`,
      },
    } : {}),
    createdAt: dto.createdAt || new Date().toISOString(),
    updatedAt: dto.updatedAt || new Date().toISOString(),
  };
}


export function RentalObjectDetailPage(): React.ReactElement {
  const t = useT();
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if the ID looks like a UUID or slug
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.id || '');

  // Fetch by ID if UUID, otherwise fetch by slug
  const { data: apiResponse, isLoading, error } = isUuid
    ? useRentalObject(params.id || '')
    : useRentalObjectBySlug(params.id || '');

  const [isFavorited, setIsFavorited] = React.useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = React.useState(false);
  const { isAuthenticated } = useAuth();
  // Reviews disabled via feature flag - see tenant settings

  // Check for flow context restoration from login
  const locationState = location.state as FlowContextNavigationState | FlowContextExpiredState | null;
  const flowContext = locationState && 'flowContext' in locationState ? locationState.flowContext : undefined;
  const isFlowRestoration = locationState && 'isFlowRestoration' in locationState ? locationState.isFlowRestoration : false;
  const flowContextExpired = locationState && 'flowContextExpired' in locationState ? locationState.flowContextExpired : false;

  // Track whether we've processed the flow restoration
  const flowRestorationProcessed = React.useRef(false);

  // Show notification when flow context has expired
  React.useEffect(() => {
    if (flowContextExpired && !flowRestorationProcessed.current) {
      flowRestorationProcessed.current = true;
      // Note: In production, this would show a toast notification
      console.info('[ListingDetailPage] Booking session expired - user needs to re-select time slots');
    }
  }, [flowContextExpired]);

  // Log flow restoration for debugging
  React.useEffect(() => {
    if (isFlowRestoration && flowContext && !flowRestorationProcessed.current) {
      flowRestorationProcessed.current = true;
      console.info('[ListingDetailPage] Restoring booking flow context:', {
        rentalObjectId: flowContext.rentalObjectId,
        bookingMode: flowContext.bookingMode,
        selectedSlots: flowContext.selectedSlots?.length || 0,
        hasFormData: !!flowContext.formData,
      });
      // Clear the navigation state to prevent re-processing on refresh
      navigate(location.pathname, { replace: true, state: undefined });
    }
  }, [isFlowRestoration, flowContext, navigate, location.pathname]);

  // Transform API data
  const listing = React.useMemo((): RentalObject | null => {
    if (apiResponse?.data) return transformApiToListing(apiResponse.data, t);
    return null;
  }, [apiResponse, t]);

  // Helper to get display name (prefer title over name during EXPAND phase)
  const getDisplayName = (listing: RentalObject): string => listing.title || listing.name;

  // Gallery images for ImageSlider
  const galleryImages: GalleryImage[] = React.useMemo(() => {
    if (!listing) return [];
    const displayName = getDisplayName(listing);
    return listing.images.map(img => ({ id: img.id, src: img.url, alt: img.alt || displayName, thumbnail: img.url }));
  }, [listing]);


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
      logAuditEvent('RENTAL_OBJECT_VIEWED', listing.tenantId, listing.id);
    }
  }, [listing]);

  // Loading state
  if (isLoading) {
    return (
      <ContentLayout maxWidth="1440px">
        <main id="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <div role="status" aria-live="polite" aria-busy="true" style={{ textAlign: 'center' }}>
            <Spinner aria-label={t('state.loading')} />
            <Paragraph data-size="sm" style={{ marginTop: 'var(--ds-spacing-4)', color: 'var(--ds-color-neutral-text-subtle)' }}>
              {t('state.loading')}
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
              {t('listings.notFound')}
            </Paragraph>
            <Paragraph data-size="sm" style={{ marginBottom: 'var(--ds-spacing-6)', color: 'var(--ds-color-neutral-text-subtle)' }}>
              {error ? t('listings.errorDescription') : t('listings.notFoundDescription')}
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
              {t('listings.backToOverview')}
            </button>
          </div>
        </main>
      </ContentLayout>
    );
  }

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: t('nav.home'), href: '/', onClick: () => navigate('/') },
    { label: t('nav.listings'), href: '/', onClick: () => navigate('/') },
    { label: getDisplayName(listing) },
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
          <RentalObjectDetailsLayout
            listing={listing}
            isAuthenticated={isAuthenticated}
            isFavorited={isFavorited}
            isFavoriteLoading={isFavoriteLoading}
            onFavoriteToggle={handleFavoriteToggle}
            onBookingClick={handleBookingClick}
            {...(MAPBOX_TOKEN ? { mapboxToken: MAPBOX_TOKEN } : {})}
          />
        </div>

        {/* Reviews Section - Hidden for now */}

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

export default RentalObjectDetailPage;
