import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * ListingDetailPage
 *
 * Full listing detail page with all tabs and booking functionality.
 * Fetches real listing data from API via @xala/sdk.
 */
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ContentLayout, Breadcrumb, ImageSlider, ListingDetailHeader, CapacityCard, FacilityChips, AdditionalServicesList, ContactInfoCard, LocationCard, OpeningHoursCard, BookingStepper, AvailabilityCalendar, GuidelinesTab, FAQTab, Tabs, Heading, Paragraph, Button, Card, Spinner, SparklesIcon, UsersIcon, ClockIcon, CheckCircleIcon, ChevronRightIcon, StarIcon, ShieldIcon, } from '@xala/ds';
import { useListing } from '@xala/sdk';
// Mapbox token from environment
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
/**
 * Transform API Listing to ListingDetail format used by components
 */
function transformApiListingToDetail(apiListing) {
    const metadata = apiListing.metadata || {};
    // Transform images
    const images = (apiListing.images || []).map((src, index) => ({
        id: `${index + 1}`,
        src,
        alt: `${apiListing.name} - Bilde ${index + 1}`,
        thumbnail: src.replace(/w=\d+/, 'w=200').replace(/h=\d+/, 'h=150'),
    }));
    // Transform facilities
    const facilitiesArray = metadata.facilities;
    const facilities = (facilitiesArray || []).map((label, index) => ({
        id: `facility-${index}`,
        label,
    }));
    // Build location string
    const location = [metadata.address, metadata.postalCode, metadata.city]
        .filter(Boolean)
        .join(', ') || 'Ukjent adresse';
    // Build the result with required fields
    const result = {
        id: apiListing.id,
        name: apiListing.name,
        category: metadata.category || apiListing.type || 'Lokale',
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
    const additionalServices = metadata.additionalServices;
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
    const guidelines = metadata.guidelines;
    result.guidelines = guidelines && guidelines.length > 0 ? guidelines : defaultGuidelines;
    const faq = metadata.faq;
    result.faq = faq && faq.length > 0 ? faq : defaultFaq;
    return result;
}
function buildOpeningHours(metadata) {
    const openingHoursData = metadata.openingHours;
    if (openingHoursData) {
        const dayNames = {
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
function mapPriceUnit(unit) {
    const unitMap = {
        hour: 'time',
        day: 'dag',
        week: 'uke',
        month: 'måned',
        event: 'arrangement',
    };
    return unitMap[unit] || unit;
}
function buildContactInfo(metadata) {
    const contact = {};
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
const defaultGuidelines = [
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
const defaultFaq = [
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
// Mock booking steps
const bookingSteps = [
    { id: 'select', label: 'Velg tidspunkter' },
    { id: 'details', label: 'Detaljer og vilkår' },
    { id: 'confirm', label: 'Bekreft' },
    { id: 'send', label: 'Send' },
];
// Generate mock time slots for the calendar
function generateMockTimeSlots(startDate) {
    const slots = [];
    for (let day = 0; day < 7; day++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + day);
        for (let hour = 8; hour <= 17; hour++) {
            // Randomly assign status, but more likely to be available
            const random = Math.random();
            let status;
            if (random < 0.6) {
                status = 'available';
            }
            else if (random < 0.85) {
                status = 'occupied';
            }
            else {
                status = 'unavailable';
            }
            slots.push({
                id: `${date.toISOString()}-${hour}`,
                date: new Date(date),
                startTime: `${hour.toString().padStart(2, '0')}:00`,
                endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
                status,
            });
        }
    }
    return slots;
}
// Mock listing data
const mockListingDetail = {
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
            thumbnail: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=200&h=150&fit=crop',
        },
        {
            id: '2',
            src: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1600&h=900&fit=crop',
            alt: 'Møterom interiør',
            thumbnail: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=200&h=150&fit=crop',
        },
        {
            id: '3',
            src: 'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=1600&h=900&fit=crop',
            alt: 'Møterom utsikt',
            thumbnail: 'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=200&h=150&fit=crop',
        },
        {
            id: '4',
            src: 'https://images.unsplash.com/photo-1462826303086-329426d1aef5?w=1600&h=900&fit=crop',
            alt: 'Presentasjonsområde',
            thumbnail: 'https://images.unsplash.com/photo-1462826303086-329426d1aef5?w=200&h=150&fit=crop',
        },
        {
            id: '5',
            src: 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=1600&h=900&fit=crop',
            alt: 'Arbeidsområde',
            thumbnail: 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=200&h=150&fit=crop',
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
            content: 'Avbestilling må skje senest 24 timer før reservert tidspunkt. Ved senere avbestilling belastes 50% av totalpris. Ved uteblivelse uten varsel belastes full pris.',
        },
        {
            id: 'damages',
            title: 'Skader',
            content: 'Leietaker er ansvarlig for eventuelle skader på lokalet eller utstyr som oppstår under leieperioden. Vennligst meld fra om skader umiddelbart.',
        },
        {
            id: 'cleaning',
            title: 'Renhold',
            content: 'Lokalet skal forlates i ryddig stand. Søppel kastes i anviste beholdere. Ekstra rengjøring vil bli fakturert.',
        },
        {
            id: 'rules',
            title: 'Husregler',
            content: 'Røyking er ikke tillatt. Kjæledyr er ikke tillatt med mindre avtalt på forhånd. Støynivå skal holdes på et akseptabelt nivå.',
        },
        {
            id: 'safety',
            title: 'Sikkerhet',
            content: 'Nødutganger og brannslokkingsutstyr skal ikke blokkeres. Gjør deg kjent med rømningsveier ved ankomst. Ved brannalarm, forlat bygget umiddelbart.',
        },
    ],
    faq: [
        {
            id: 'how-to-book',
            question: 'Hvordan booker jeg?',
            answer: 'Velg ønskede tidspunkter i kalenderen, fyll ut kontaktinformasjon, og bekreft bookingen. Du vil motta en bekreftelse på e-post.',
        },
        {
            id: 'cancellation-policy',
            question: 'Hva er avbestillingsreglene?',
            answer: 'Du kan avbestille gratis inntil 24 timer før reservert tidspunkt. Ved senere avbestilling belastes 50% av totalpris.',
        },
        {
            id: 'parking',
            question: 'Er det tilgjengelig parkering?',
            answer: 'Ja, det finnes parkeringshus i nærheten. Du kan også bestille reservert parkeringsplass som tilleggstjeneste.',
        },
        {
            id: 'extend-booking',
            question: 'Kan jeg forlenge bookingen?',
            answer: 'Ja, du kan forlenge bookingen så lenge det er ledige tidspunkter. Kontakt oss for å gjøre endringer i en eksisterende booking.',
        },
        {
            id: 'equipment',
            question: 'Hva er inkludert i prisen?',
            answer: 'Prisen inkluderer bruk av møterommet med alt standardutstyr: projektor, tavle, WiFi og videokonferanseutstyr. Kaffe og te er også inkludert.',
        },
    ],
};
export function ListingDetailPage() {
    const params = useParams();
    const navigate = useNavigate();
    // Fetch listing data from API
    const { data: apiResponse, isLoading, error } = useListing(params.id || '');
    // State for booking flow
    const [currentBookingStep, setCurrentBookingStep] = React.useState(0);
    const [selectedSlots, setSelectedSlots] = React.useState([]);
    const [selectedServices, setSelectedServices] = React.useState([]);
    const [calendarStartDate, setCalendarStartDate] = React.useState(() => {
        const today = new Date();
        // Start from Monday of current week
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(today.setDate(diff));
    });
    // Generate time slots for current week
    const timeSlots = React.useMemo(() => generateMockTimeSlots(calendarStartDate), [calendarStartDate]);
    // Active tab state
    const [activeTab, setActiveTab] = React.useState('overview');
    // Transform API data to ListingDetail format, or use mock data as fallback
    const listing = React.useMemo(() => {
        if (apiResponse?.data) {
            return transformApiListingToDetail(apiResponse.data);
        }
        return mockListingDetail;
    }, [apiResponse]);
    // Show loading state
    if (isLoading) {
        return (_jsx(ContentLayout, { maxWidth: "1440px", className: "main-content-layout", children: _jsx("main", { id: "main", style: {
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '60vh',
                    padding: 'var(--ds-spacing-8)',
                }, children: _jsxs("div", { style: { textAlign: 'center' }, children: [_jsx(Spinner, { "aria-label": "Laster innhold..." }), _jsx(Paragraph, { "data-size": "sm", style: { marginTop: 'var(--ds-spacing-4)', color: 'var(--ds-color-neutral-text-subtle)' }, children: "Laster lokale..." })] }) }) }));
    }
    // Show error state
    if (error && !apiResponse?.data) {
        return (_jsx(ContentLayout, { maxWidth: "1440px", className: "main-content-layout", children: _jsx("main", { id: "main", style: {
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '60vh',
                    padding: 'var(--ds-spacing-8)',
                }, children: _jsxs("div", { style: { textAlign: 'center' }, children: [_jsx(Heading, { level: 2, "data-size": "md", style: { marginBottom: 'var(--ds-spacing-4)' }, children: "Lokalet ble ikke funnet" }), _jsx(Paragraph, { "data-size": "sm", style: { color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-4)' }, children: "Det oppstod en feil ved lasting av lokalet. Pr\u00F8v igjen senere." }), _jsx(Button, { type: "button", variant: "secondary", onClick: () => navigate('/'), children: "Tilbake til forsiden" })] }) }) }));
    }
    // Breadcrumb items
    const breadcrumbItems = [
        { label: 'Hjem', href: '/', onClick: () => navigate('/') },
        { label: 'Fasiliteter', href: '/', onClick: () => navigate('/') },
        { label: listing.name },
    ];
    // Handle slot click
    const handleSlotClick = (slot) => {
        setSelectedSlots((prev) => {
            const exists = prev.some((s) => new Date(s.date).toDateString() ===
                new Date(slot.date).toDateString() &&
                s.startTime === slot.startTime);
            if (exists) {
                return prev.filter((s) => !(new Date(s.date).toDateString() ===
                    new Date(slot.date).toDateString() &&
                    s.startTime === slot.startTime));
            }
            else {
                return [...prev, slot];
            }
        });
    };
    // Handle week navigation
    const handleWeekChange = (direction) => {
        setCalendarStartDate((prev) => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
            return newDate;
        });
    };
    // Handle service selection
    const handleServiceSelect = (serviceId, selected) => {
        setSelectedServices((prev) => selected ? [...prev, serviceId] : prev.filter((id) => id !== serviceId));
    };
    return (_jsx(ContentLayout, { maxWidth: "1440px", className: "main-content-layout", children: _jsxs("main", { id: "main", style: {
                paddingTop: 'var(--ds-spacing-4)',
                paddingBottom: 'var(--ds-spacing-8)',
            }, children: [_jsx(Breadcrumb, { items: breadcrumbItems }), _jsx("div", { style: { marginTop: 'var(--ds-spacing-4)' }, children: _jsx(ImageSlider, { images: listing.images, height: 480, showArrows: true, showDots: true, showThumbnails: true, showCounter: true, enableFullscreen: true }) }), _jsx("div", { style: { marginTop: 'var(--ds-spacing-4)' }, children: _jsx(ListingDetailHeader, { category: listing.category, title: listing.name, location: listing.location, onFavorite: () => console.log('Toggle favorite'), onShare: () => console.log('Share listing') }) }), _jsxs("div", { style: {
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        gap: 'var(--ds-spacing-3)',
                        padding: 'var(--ds-spacing-4)',
                        marginTop: 'var(--ds-spacing-4)',
                        backgroundColor: 'var(--ds-color-neutral-surface-default)',
                        borderRadius: 'var(--ds-border-radius-xl)',
                        border: '1px solid var(--ds-color-neutral-border-subtle)',
                    }, className: "quick-stats-bar", children: [_jsxs("div", { style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--ds-spacing-2)',
                                padding: 'var(--ds-spacing-2) var(--ds-spacing-4)',
                                backgroundColor: 'var(--ds-color-neutral-background-default)',
                                borderRadius: 'var(--ds-border-radius-lg)',
                                boxShadow: 'var(--ds-shadow-xs)',
                            }, children: [_jsx("div", { style: {
                                        padding: 'var(--ds-spacing-1)',
                                        borderRadius: 'var(--ds-border-radius-md)',
                                        backgroundColor: 'var(--ds-color-info-surface-default)',
                                    }, children: _jsx(UsersIcon, { size: 16, style: { color: 'var(--ds-color-info-base-default)' } }) }), _jsxs("div", { children: [_jsx(Paragraph, { "data-size": "xs", style: { margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }, children: "Kapasitet" }), _jsxs(Paragraph, { "data-size": "sm", style: { margin: 0, fontWeight: 'var(--ds-font-weight-semibold)' }, children: [listing.capacity, " personer"] })] })] }), _jsxs("div", { style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--ds-spacing-2)',
                                padding: 'var(--ds-spacing-2) var(--ds-spacing-4)',
                                backgroundColor: 'var(--ds-color-neutral-background-default)',
                                borderRadius: 'var(--ds-border-radius-lg)',
                                boxShadow: 'var(--ds-shadow-xs)',
                            }, children: [_jsx("div", { style: {
                                        padding: 'var(--ds-spacing-1)',
                                        borderRadius: 'var(--ds-border-radius-md)',
                                        backgroundColor: 'var(--ds-color-success-surface-default)',
                                    }, children: _jsx(ClockIcon, { size: 16, style: { color: 'var(--ds-color-success-base-default)' } }) }), _jsxs("div", { children: [_jsx(Paragraph, { "data-size": "xs", style: { margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }, children: "\u00C5pent" }), _jsx(Paragraph, { "data-size": "sm", style: { margin: 0, fontWeight: 'var(--ds-font-weight-semibold)' }, children: "08:00 - 22:00" })] })] }), _jsxs("div", { style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--ds-spacing-2)',
                                padding: 'var(--ds-spacing-2) var(--ds-spacing-4)',
                                backgroundColor: 'var(--ds-color-neutral-background-default)',
                                borderRadius: 'var(--ds-border-radius-lg)',
                                boxShadow: 'var(--ds-shadow-xs)',
                            }, children: [_jsx("div", { style: {
                                        padding: 'var(--ds-spacing-1)',
                                        borderRadius: 'var(--ds-border-radius-md)',
                                        backgroundColor: 'var(--ds-color-accent-surface-default)',
                                    }, children: _jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "var(--ds-color-accent-base-default)", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("rect", { x: "2", y: "6", width: "20", height: "12", rx: "2" }), _jsx("path", { d: "M22 10H2" })] }) }), _jsxs("div", { children: [_jsx(Paragraph, { "data-size": "xs", style: { margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }, children: "Pris fra" }), _jsxs(Paragraph, { "data-size": "sm", style: { margin: 0, fontWeight: 'var(--ds-font-weight-semibold)' }, children: [listing.price, " ", listing.currency, "/", listing.priceUnit] })] })] }), _jsxs("div", { style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--ds-spacing-1)',
                                marginLeft: 'auto',
                            }, children: [[...Array(5)].map((_, i) => (_jsx(StarIcon, { size: 16, style: {
                                        color: i < 4 ? 'var(--ds-color-warning-base-default)' : 'var(--ds-color-neutral-border-default)',
                                        fill: i < 4 ? 'var(--ds-color-warning-base-default)' : 'none',
                                    } }, i))), _jsx(Paragraph, { "data-size": "sm", style: { margin: 0, marginLeft: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }, children: "(24)" })] })] }), _jsxs("div", { style: {
                        display: 'grid',
                        gridTemplateColumns: '1fr 380px',
                        gap: 'var(--ds-spacing-6)',
                        marginTop: 'var(--ds-spacing-6)',
                    }, className: "listing-detail-content", children: [_jsxs("div", { children: [_jsx("div", { className: "enhanced-tabs", children: _jsxs(Tabs, { defaultValue: "overview", value: activeTab, onChange: setActiveTab, children: [_jsxs(Tabs.List, { style: {
                                                    backgroundColor: 'var(--ds-color-neutral-surface-default)',
                                                    borderRadius: 'var(--ds-border-radius-lg)',
                                                    padding: 'var(--ds-spacing-1)',
                                                    gap: 'var(--ds-spacing-1)',
                                                    border: '1px solid var(--ds-color-neutral-border-subtle)',
                                                }, children: [_jsx(Tabs.Tab, { value: "overview", children: "Oversikt" }), _jsx(Tabs.Tab, { value: "calendar", children: "Aktivitetskalender" }), _jsx(Tabs.Tab, { value: "guidelines", children: "Retningslinjer" }), _jsx(Tabs.Tab, { value: "faq", children: "Ofte stilte sp\u00F8rsm\u00E5l" })] }), _jsx(Tabs.Panel, { value: "overview", children: _jsxs("div", { style: { marginTop: 'var(--ds-spacing-5)' }, children: [_jsxs("section", { children: [_jsxs(Heading, { level: 2, "data-size": "sm", style: {
                                                                        marginBottom: 'var(--ds-spacing-3)',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: 'var(--ds-spacing-2)',
                                                                    }, children: [_jsx(SparklesIcon, { size: 20, style: { color: 'var(--ds-color-accent-base-default)' } }), "Beskrivelse"] }), _jsx(Paragraph, { "data-size": "sm", style: {
                                                                        whiteSpace: 'pre-line',
                                                                        color: 'var(--ds-color-neutral-text-default)',
                                                                        lineHeight: '1.7',
                                                                    }, children: listing.description })] }), listing.capacity && (_jsx("div", { style: { marginTop: 'var(--ds-spacing-6)' }, children: _jsx(CapacityCard, { maxCapacity: listing.capacity }) })), listing.facilities.length > 0 && (_jsxs("section", { style: { marginTop: 'var(--ds-spacing-6)' }, children: [_jsx(Heading, { level: 3, "data-size": "xs", style: { marginBottom: 'var(--ds-spacing-3)' }, children: "Fasiliteter" }), _jsx(FacilityChips, { facilities: listing.facilities })] })), listing.additionalServices &&
                                                            listing.additionalServices.length > 0 && (_jsxs("section", { style: { marginTop: 'var(--ds-spacing-6)' }, children: [_jsx(Heading, { level: 3, "data-size": "xs", style: { marginBottom: 'var(--ds-spacing-3)' }, children: "Tilleggstjenester" }), _jsx(AdditionalServicesList, { services: listing.additionalServices, selectedServices: selectedServices, onServiceSelect: handleServiceSelect })] }))] }) }), _jsx(Tabs.Panel, { value: "calendar", children: _jsx("div", { style: { marginTop: 'var(--ds-spacing-5)' }, children: _jsx(Paragraph, { "data-size": "sm", style: { color: 'var(--ds-color-neutral-text-subtle)' }, children: "Se ledighetskalenderen nedenfor for \u00E5 velge \u00F8nskede tidspunkter." }) }) }), _jsx(Tabs.Panel, { value: "guidelines", children: _jsx("div", { style: { marginTop: 'var(--ds-spacing-5)' }, children: listing.guidelines && (_jsx(GuidelinesTab, { sections: listing.guidelines })) }) }), _jsx(Tabs.Panel, { value: "faq", children: _jsx("div", { style: { marginTop: 'var(--ds-spacing-5)' }, children: listing.faq && _jsx(FAQTab, { items: listing.faq }) }) })] }) }), _jsxs("div", { id: "booking-calendar", style: {
                                        marginTop: 'var(--ds-spacing-8)',
                                        padding: 'var(--ds-spacing-6)',
                                        backgroundColor: 'var(--ds-color-neutral-surface-default)',
                                        borderRadius: 'var(--ds-border-radius-xl)',
                                        border: '1px solid var(--ds-color-neutral-border-subtle)',
                                    }, className: "booking-section", children: [_jsxs("div", { style: { marginBottom: 'var(--ds-spacing-5)' }, children: [_jsx(Heading, { level: 2, "data-size": "lg", style: { margin: 0 }, children: "Ledighetskalender" }), _jsx(Paragraph, { "data-size": "sm", style: {
                                                        margin: 0,
                                                        marginTop: 'var(--ds-spacing-2)',
                                                        color: 'var(--ds-color-neutral-text-subtle)',
                                                    }, children: "Legg inn din reservasjon raskt og enkelt p\u00E5 4 steg." })] }), _jsx(BookingStepper, { steps: bookingSteps, currentStep: currentBookingStep, onStepClick: (index) => {
                                                if (index <= currentBookingStep) {
                                                    setCurrentBookingStep(index);
                                                }
                                            } }), _jsx("div", { style: { marginTop: 'var(--ds-spacing-6)' }, children: _jsx(AvailabilityCalendar, { startDate: calendarStartDate, timeSlots: timeSlots, selectedSlots: selectedSlots, onSlotClick: handleSlotClick, onWeekChange: handleWeekChange, showTips: false }) }), selectedSlots.length > 0 && (_jsxs("div", { style: {
                                                marginTop: 'var(--ds-spacing-5)',
                                                padding: 'var(--ds-spacing-4)',
                                                backgroundColor: 'var(--ds-color-accent-surface-default)',
                                                borderRadius: 'var(--ds-border-radius-lg)',
                                            }, children: [_jsxs(Heading, { level: 3, "data-size": "xs", style: {
                                                        marginBottom: 'var(--ds-spacing-3)',
                                                        color: 'var(--ds-color-accent-text-default)',
                                                    }, children: ["Valgte tidspunkter (", selectedSlots.length, ")"] }), _jsx("div", { style: {
                                                        display: 'flex',
                                                        flexWrap: 'wrap',
                                                        gap: 'var(--ds-spacing-2)',
                                                    }, children: selectedSlots.map((slot) => (_jsx("div", { style: {
                                                            padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                                                            backgroundColor: 'var(--ds-color-accent-base-default)',
                                                            borderRadius: 'var(--ds-border-radius-full)',
                                                            color: 'var(--ds-color-accent-contrast-default)',
                                                        }, children: _jsxs(Paragraph, { "data-size": "xs", style: {
                                                                margin: 0,
                                                                fontWeight: 'var(--ds-font-weight-medium)',
                                                            }, children: [new Date(slot.date).toLocaleDateString('nb-NO', {
                                                                    weekday: 'short',
                                                                    day: 'numeric',
                                                                    month: 'short',
                                                                }), ' ', "kl. ", slot.startTime] }) }, slot.id))) }), _jsx(Button, { type: "button", variant: "primary", "data-color": "accent", style: {
                                                        marginTop: 'var(--ds-spacing-4)',
                                                        width: '100%',
                                                    }, onClick: () => setCurrentBookingStep(1), children: "Fortsett til detaljer" })] }))] })] }), _jsxs("aside", { style: {
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 'var(--ds-spacing-4)',
                                position: 'sticky',
                                top: 'calc(var(--header-height, 70px) + var(--ds-spacing-4))',
                                alignSelf: 'start',
                                height: 'fit-content',
                            }, children: [_jsxs(Card, { className: "booking-cta-card", style: {
                                        overflow: 'hidden',
                                        border: '2px solid var(--ds-color-neutral-border-subtle)',
                                        boxShadow: 'var(--ds-shadow-md)',
                                    }, children: [_jsxs("div", { style: {
                                                background: 'linear-gradient(135deg, var(--ds-color-accent-base-default) 0%, var(--ds-color-accent-base-hover) 100%)',
                                                padding: 'var(--ds-spacing-5)',
                                                color: 'white',
                                            }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--ds-spacing-2)' }, children: [_jsx(Paragraph, { "data-size": "sm", style: { margin: 0, opacity: 0.9 }, children: "Pris fra" }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-1)' }, children: [_jsx(StarIcon, { size: 14, style: { fill: 'var(--ds-color-warning-base-default)', color: 'var(--ds-color-warning-base-default)' } }), _jsx(Paragraph, { "data-size": "sm", style: { margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }, children: "4.8" })] })] }), _jsxs("div", { style: { display: 'flex', alignItems: 'baseline', gap: 'var(--ds-spacing-2)' }, children: [_jsxs(Heading, { level: 2, "data-size": "xl", style: { margin: 0, color: 'white' }, children: [listing.price, " ", listing.currency] }), _jsxs(Paragraph, { "data-size": "sm", style: { margin: 0, opacity: 0.8 }, children: ["/ ", listing.priceUnit] })] })] }), _jsxs("div", { style: { padding: 'var(--ds-spacing-5)' }, children: [_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)', marginBottom: 'var(--ds-spacing-4)' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }, children: [_jsx("div", { style: {
                                                                        width: '32px',
                                                                        height: '32px',
                                                                        borderRadius: 'var(--ds-border-radius-md)',
                                                                        backgroundColor: 'var(--ds-color-success-surface-default)',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                    }, children: _jsx(CheckCircleIcon, { size: 16, style: { color: 'var(--ds-color-success-base-default)' } }) }), _jsxs("div", { children: [_jsx(Paragraph, { "data-size": "sm", style: { margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }, children: "Ledig i dag" }), _jsx(Paragraph, { "data-size": "xs", style: { margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }, children: "Flere tidspunkter tilgjengelig" })] })] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }, children: [_jsx("div", { style: {
                                                                        width: '32px',
                                                                        height: '32px',
                                                                        borderRadius: 'var(--ds-border-radius-md)',
                                                                        backgroundColor: 'var(--ds-color-info-surface-default)',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                    }, children: _jsx(UsersIcon, { size: 16, style: { color: 'var(--ds-color-info-base-default)' } }) }), _jsxs("div", { children: [_jsxs(Paragraph, { "data-size": "sm", style: { margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }, children: ["Maks ", listing.capacity, " personer"] }), _jsx(Paragraph, { "data-size": "xs", style: { margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }, children: "Kapasitet for grupper" })] })] })] }), _jsxs(Button, { type: "button", variant: "primary", "data-color": "accent", style: {
                                                        width: '100%',
                                                        height: '48px',
                                                        fontWeight: 'var(--ds-font-weight-semibold)',
                                                        boxShadow: 'var(--ds-shadow-sm)',
                                                    }, onClick: () => {
                                                        const calendarSection = document.getElementById('booking-calendar');
                                                        calendarSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                                    }, children: [_jsxs("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("rect", { x: "3", y: "4", width: "18", height: "18", rx: "2", ry: "2" }), _jsx("line", { x1: "16", y1: "2", x2: "16", y2: "6" }), _jsx("line", { x1: "8", y1: "2", x2: "8", y2: "6" }), _jsx("line", { x1: "3", y1: "10", x2: "21", y2: "10" })] }), "Book n\u00E5", _jsx(ChevronRightIcon, { size: 16, style: { marginLeft: 'auto' } })] }), _jsx(Paragraph, { "data-size": "xs", style: {
                                                        margin: 0,
                                                        marginTop: 'var(--ds-spacing-3)',
                                                        textAlign: 'center',
                                                        color: 'var(--ds-color-neutral-text-subtle)',
                                                    }, children: "Gratis avbestilling inntil 24 timer f\u00F8r" })] })] }), _jsxs("div", { style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--ds-spacing-3)',
                                        padding: 'var(--ds-spacing-4)',
                                        backgroundColor: 'var(--ds-color-success-surface-default)',
                                        borderRadius: 'var(--ds-border-radius-lg)',
                                        border: '1px solid var(--ds-color-success-border-subtle)',
                                    }, children: [_jsx(ShieldIcon, { size: 20, style: { color: 'var(--ds-color-success-base-default)' } }), _jsxs("div", { children: [_jsx(Paragraph, { "data-size": "sm", style: { margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }, children: "Sikker booking" }), _jsx(Paragraph, { "data-size": "xs", style: { margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }, children: "Betaling skjer etter godkjenning" })] })] }), listing.contact && (_jsx(ContactInfoCard, { ...(listing.contact.email && { email: listing.contact.email }), ...(listing.contact.phone && { phone: listing.contact.phone }), ...(listing.contact.name && { contactName: listing.contact.name }) })), listing.coordinates && (_jsx(LocationCard, { address: listing.location, latitude: listing.coordinates.latitude, longitude: listing.coordinates.longitude, mapboxToken: MAPBOX_TOKEN })), listing.openingHours && listing.openingHours.length > 0 && (_jsx(OpeningHoursCard, { hours: listing.openingHours }))] })] }), _jsx("style", { children: `
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

          /* Enhanced Tab Styling */
          .enhanced-tabs [role="tablist"] {
            display: flex !important;
            border-bottom: none !important;
            background: transparent !important;
          }

          .enhanced-tabs [role="tab"] {
            flex: 1;
            padding: var(--ds-spacing-3) var(--ds-spacing-4) !important;
            border: none !important;
            border-radius: var(--ds-border-radius-md) !important;
            background-color: transparent !important;
            color: var(--ds-color-neutral-text-subtle) !important;
            font-weight: var(--ds-font-weight-medium) !important;
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
            cursor: pointer;
            text-align: center;
            position: relative;
          }

          .enhanced-tabs [role="tab"]:hover:not([aria-selected="true"]) {
            background-color: var(--ds-color-neutral-surface-hover) !important;
            color: var(--ds-color-neutral-text-default) !important;
          }

          .enhanced-tabs [role="tab"][aria-selected="true"] {
            background-color: var(--ds-color-accent-surface-default) !important;
            color: var(--ds-color-accent-text-default) !important;
            font-weight: var(--ds-font-weight-semibold) !important;
            box-shadow: var(--ds-shadow-sm) !important;
          }

          .enhanced-tabs [role="tab"]:focus-visible {
            outline: 2px solid var(--ds-color-focus-outer);
            outline-offset: 2px;
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

            /* Stack tabs on mobile */
            .enhanced-tabs [role="tablist"] {
              flex-direction: column !important;
              gap: var(--ds-spacing-1) !important;
            }

            .enhanced-tabs [role="tab"] {
              width: 100% !important;
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
        ` })] }) }));
}
export default ListingDetailPage;
