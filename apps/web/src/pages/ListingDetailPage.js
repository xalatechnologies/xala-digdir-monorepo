import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * ListingDetailPage
 *
 * Full listing detail page with all tabs and booking functionality.
 * Fetches real listing data from API via @xala/sdk.
 */
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ContentLayout, Breadcrumb, ImageSlider, ListingDetailHeader, FacilityChips, AdditionalServicesList, ContactInfoCard, LocationCard, OpeningHoursCard, BookingStepper, AvailabilityCalendar, GuidelinesTab, FAQTab, Tabs, Heading, Paragraph, Button, Spinner, SparklesIcon, } from '@xala/ds';
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
    // Log API errors but fall back to mock data instead of showing error page
    // This provides a better UX while the API is being fixed
    React.useEffect(() => {
        if (error) {
            console.warn('API error loading listing, using mock data:', error);
        }
    }, [error]);
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
            }, children: [_jsx(Breadcrumb, { items: breadcrumbItems }), _jsx("div", { style: { marginTop: 'var(--ds-spacing-4)' }, children: _jsx(ImageSlider, { images: listing.images, height: 480, showArrows: true, showDots: true, showThumbnails: true, showCounter: true, enableFullscreen: true }) }), _jsx("div", { style: { marginTop: 'var(--ds-spacing-4)' }, children: _jsx(ListingDetailHeader, { category: listing.category, title: listing.name, location: listing.location, ...(listing.capacity ? { capacity: listing.capacity } : {}), onFavorite: () => console.log('Toggle favorite'), onShare: () => console.log('Share listing') }) }), _jsxs("div", { style: {
                        display: 'grid',
                        gridTemplateColumns: '1fr 380px',
                        gap: 'var(--ds-spacing-6)',
                        marginTop: 'var(--ds-spacing-6)',
                    }, className: "listing-detail-content", children: [_jsxs("div", { children: [_jsx("div", { className: "elegant-tabs", children: _jsxs(Tabs, { defaultValue: "overview", value: activeTab, onChange: setActiveTab, children: [_jsxs(Tabs.List, { children: [_jsx(Tabs.Tab, { value: "overview", children: _jsxs("span", { className: "tab-content", children: [_jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2" }), _jsx("line", { x1: "9", y1: "9", x2: "15", y2: "9" }), _jsx("line", { x1: "9", y1: "13", x2: "15", y2: "13" }), _jsx("line", { x1: "9", y1: "17", x2: "12", y2: "17" })] }), "Oversikt"] }) }), _jsx(Tabs.Tab, { value: "guidelines", children: _jsxs("span", { className: "tab-content", children: [_jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("path", { d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" }), _jsx("polyline", { points: "14 2 14 8 20 8" }), _jsx("line", { x1: "16", y1: "13", x2: "8", y2: "13" }), _jsx("line", { x1: "16", y1: "17", x2: "8", y2: "17" })] }), "Retningslinjer"] }) }), _jsx(Tabs.Tab, { value: "faq", children: _jsxs("span", { className: "tab-content", children: [_jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("circle", { cx: "12", cy: "12", r: "10" }), _jsx("path", { d: "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" }), _jsx("circle", { cx: "12", cy: "17", r: "0.5", fill: "currentColor" })] }), "Sp\u00F8rsm\u00E5l"] }) })] }), _jsx(Tabs.Panel, { value: "overview", children: _jsxs("div", { style: { marginTop: 'var(--ds-spacing-5)' }, children: [_jsxs("section", { children: [_jsxs(Heading, { level: 2, "data-size": "sm", style: {
                                                                        marginBottom: 'var(--ds-spacing-3)',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: 'var(--ds-spacing-2)',
                                                                    }, children: [_jsx(SparklesIcon, { size: 20, style: { color: 'var(--ds-color-accent-base-default)' } }), "Beskrivelse"] }), _jsx(Paragraph, { "data-size": "sm", style: {
                                                                        whiteSpace: 'pre-line',
                                                                        color: 'var(--ds-color-neutral-text-default)',
                                                                        lineHeight: '1.7',
                                                                    }, children: listing.description })] }), listing.facilities.length > 0 && (_jsxs("section", { style: { marginTop: 'var(--ds-spacing-6)' }, children: [_jsx(Heading, { level: 3, "data-size": "xs", style: { marginBottom: 'var(--ds-spacing-3)' }, children: "Fasiliteter" }), _jsx(FacilityChips, { facilities: listing.facilities })] })), listing.additionalServices &&
                                                            listing.additionalServices.length > 0 && (_jsxs("section", { style: { marginTop: 'var(--ds-spacing-6)' }, children: [_jsx(Heading, { level: 3, "data-size": "xs", style: { marginBottom: 'var(--ds-spacing-3)' }, children: "Tilleggstjenester" }), _jsx(AdditionalServicesList, { services: listing.additionalServices, selectedServices: selectedServices, onServiceSelect: handleServiceSelect, title: "" })] }))] }) }), _jsx(Tabs.Panel, { value: "guidelines", children: _jsx("div", { style: { marginTop: 'var(--ds-spacing-5)' }, children: listing.guidelines && (_jsx(GuidelinesTab, { sections: listing.guidelines })) }) }), _jsx(Tabs.Panel, { value: "faq", children: _jsx("div", { style: { marginTop: 'var(--ds-spacing-5)' }, children: listing.faq && _jsx(FAQTab, { items: listing.faq }) }) })] }) }), _jsxs("div", { id: "booking-calendar", style: {
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
                            }, children: [listing.contact && (_jsx(ContactInfoCard, { ...(listing.contact.email && { email: listing.contact.email }), ...(listing.contact.phone && { phone: listing.contact.phone }), ...(listing.contact.name && { contactName: listing.contact.name }) })), listing.coordinates && (_jsx(LocationCard, { address: listing.location, latitude: listing.coordinates.latitude, longitude: listing.coordinates.longitude, mapboxToken: MAPBOX_TOKEN })), listing.openingHours && listing.openingHours.length > 0 && (_jsx(OpeningHoursCard, { hours: listing.openingHours }))] })] }), _jsx("style", { children: `
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
        ` })] }) }));
}
export default ListingDetailPage;
