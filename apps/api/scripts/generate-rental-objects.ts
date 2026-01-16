/**
 * Generate 40 Comprehensive Rental Objects
 * Norwegian facilities with complete metadata
 */

const TENANT_SKIEN = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
const ORG_SKIEN_HALL = '11111111-1111-1111-1111-111111111111';

// Facility types for "LOKALER_OG_BANER" category
const FACILITY_TYPES = [
  'Idrettshall', 'Fotballbane', 'Tennisbane', 'Svømmehall', 'Treningsstudio',
  'Kunstgressbane', 'Basketballbane', 'Håndballhall', 'Turnhall', 'Klatrehall',
  'Dansestudio', 'Kampsportstudio', 'Yogastudio', 'Squashbane', 'Badmintonhall',
  'Innebandy', 'Volleyballbane', 'Bordtennisrom', 'Bowlinghall', 'Klubbhus'
];

const CITIES = ['Skien', 'Porsgrunn', 'Bamble', 'Notodden', 'Kragerø'];
const STREETS = ['Idrettsveien', 'Parkveien', 'Håndballgata', 'Kulturhusgata', 'Sportsbakken', 'Hallveien'];

// Image sets for different facility types
const IMAGE_SETS = {
  sports_hall: [
    'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=1200&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
    'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=1200&q=80',
  ],
  football: [
    'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=1200&q=80',
    'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1200&q=80',
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=80',
  ],
  tennis: [
    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1200&q=80',
    'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=1200&q=80',
    'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=1200&q=80',
  ],
  gym: [
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80',
    'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1200&q=80',
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&q=80',
  ],
  pool: [
    'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=1200&q=80',
    'https://images.unsplash.com/photo-1519499772995-d59618c8c015?w=1200&q=80',
    'https://images.unsplash.com/photo-1600965962102-9d260a71890d?w=1200&q=80',
  ],
};

function getImages(facilityName: string): string[] {
  if (facilityName.includes('Fotball')) return IMAGE_SETS.football;
  if (facilityName.includes('Tennis')) return IMAGE_SETS.tennis;
  if (facilityName.includes('Trenings') || facilityName.includes('Kamp') || facilityName.includes('Yoga')) return IMAGE_SETS.gym;
  if (facilityName.includes('Svømme')) return IMAGE_SETS.pool;
  return IMAGE_SETS.sports_hall;
}

function generateSlug(name: string): string {
  return name.toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function generatePricing(size: 'small' | 'medium' | 'large') {
  const basePrices = { small: 500, medium: 1000, large: 1500 };
  const basePrice = basePrices[size];
  
  return {
    basePrice,
    currency: 'NOK',
    unit: 'hour',
    tiers: [
      { type: 'hourly', price: basePrice, minDuration: 1, maxDuration: 4, label: 'Timepris' },
      { type: 'half_day', price: basePrice * 3, duration: 4, label: 'Halvdag (4 timer)' },
      { type: 'full_day', price: basePrice * 5, duration: 8, label: 'Heldag (8 timer)' },
      { type: 'weekly', price: basePrice * 20, duration: 168, label: 'Uke (7 dager)' },
    ],
    discounts: [
      { type: 'member', percentage: 15, label: 'Medlemsrabatt' },
      { type: 'student', percentage: 20, label: 'Studentrabatt' },
      { type: 'nonprofit', percentage: 25, label: 'Frivillig organisasjon' },
    ],
  };
}

function generateOpeningHours() {
  return {
    monday: { open: '06:00', close: '23:00' },
    tuesday: { open: '06:00', close: '23:00' },
    wednesday: { open: '06:00', close: '23:00' },
    thursday: { open: '06:00', close: '23:00' },
    friday: { open: '06:00', close: '23:00' },
    saturday: { open: '08:00', close: '22:00' },
    sunday: { open: '08:00', close: '22:00' },
    holidays: { open: '10:00', close: '20:00' },
  };
}

function generateFAQ(facilityType: string) {
  return [
    { question: 'Hva er kapasiteten?', answer: `Lokalet passer perfekt for treninger, kamper og arrangementer.` },
    { question: 'Er det parkeringsmuligheter?', answer: 'Ja, gratis parkering rett utenfor anlegget.' },
    { question: 'Finnes det garderober?', answer: 'Ja, garderober med dusjer og toaletter er tilgjengelig.' },
    { question: 'Er WiFi inkludert?', answer: 'Ja, gratis høyhastighets WiFi i hele anlegget.' },
    { question: 'Kan jeg avbestille?', answer: 'Gratis avbestilling inntil 24 timer før bookingen.' },
    { question: 'Tilbyr dere rabatter?', answer: 'Ja! 15% medlemsrabatt, 20% studentrabatt, og 25% for frivillige organisasjoner.' },
  ];
}

function generateRules() {
  return [
    { icon: 'shoe', text: 'Kun innendørssko med lyse såler' },
    { icon: 'food', text: 'Mat og drikke kun i fellesområder' },
    { icon: 'clock', text: 'Punktlig fremmøte og avslutning' },
    { icon: 'trash', text: 'Rydd opp etter bruk' },
    { icon: 'volume', text: 'Respekter støyregler etter kl. 22:00' },
    { icon: 'fire', text: 'Røyking forbudt' },
    { icon: 'insurance', text: 'Forsikring anbefales' },
    { icon: 'respect', text: 'Vær hensynsfull mot andre brukere' },
  ];
}

function generateRegulations() {
  return {
    age: { minimum: 16, supervision: 'Nødvendig for under 18 år' },
    insurance: { required: true, minCoverage: 5000000, provider: 'Egen forsikring eller anleggsforsikring tilgjengelig' },
    cancellation: { policy: 'Gratis avbestilling inntil 24 timer før', fee: { within24h: 500, within12h: 1000 } },
    liability: { userResponsible: true, deposit: 3000, cleaningFee: 800 },
    capacity: { maximum: 200, fireCode: 'I henhold til TEK17 forskrifter' },
    accessibility: { wheelchairAccess: true, hearingLoop: false, parking: 'HC-plasser tilgjengelig' },
  };
}

function generateBookingRules() {
  return {
    advance: { min: 24, max: 180, unit: 'hours/days' },
    duration: { min: 1, max: 8, unit: 'hours' },
    recurring: { allowed: true, maxWeeks: 52 },
    approval: { required: false, autoApprove: true, approvalTime: 4 },
  };
}

export function generate40RentalObjects() {
  const rentalObjects = [];
  
  for (let i = 0; i < 40; i++) {
    const facilityType = FACILITY_TYPES[i % FACILITY_TYPES.length];
    const number = Math.floor(i / FACILITY_TYPES.length) + 1;
    const suffix = number > 1 ? ` ${number}` : '';
    const name = `${facilityType}${suffix}`;
    const city = CITIES[i % CITIES.length];
    const street = STREETS[i % STREETS.length];
    const streetNumber = (i % 50) + 1;
    const postalCode = `37${20 + (i % 80)}`;
    
    // Determine size based on facility type
    const size = facilityType.includes('studio') || facilityType.includes('rom') ? 'small' :
                 facilityType.includes('hall') || facilityType.includes('bane') ? 'large' : 'medium';
    
    const capacity = size === 'small' ? 20 : size === 'medium' ? 100 : 300;
    
    rentalObjects.push({
      id: `rental-${String(i + 1).padStart(3, '0')}-${Date.now()}`,
      tenantId: TENANT_SKIEN,
      organizationId: ORG_SKIEN_HALL,
      name,
      slug: generateSlug(name),
      description: `Moderne ${facilityType.toLowerCase()} i ${city}. Perfekt for treninger, kamper og arrangementer. Godt vedlikeholdt og med moderne fasiliteter.`,
      capacity,
      pricing: generatePricing(size),
      images: getImages(name),
      categoryKey: 'LOKALER_OG_BANER',
      timeMode: 'PERIOD',
      status: 'published',
      metadata: {
        location: {
          address: `${street} ${streetNumber}`,
          postalCode,
          city,
          country: 'Norway',
        },
        contactName: 'Booking Avdeling',
        contactEmail: `booking@${generateSlug(city)}.kommune.no`,
        contactPhone: `+47 35 ${50 + (i % 50)} ${10 + (i % 90)} 00`,
        openingHours: generateOpeningHours(),
        amenities: ['changing_rooms', 'showers', 'parking', 'wifi', 'first_aid'],
        regulations: generateRegulations(),
        bookingRules: generateBookingRules(),
        faq: generateFAQ(facilityType),
        rules: generateRules(),
      },
    });
  }
  
  return rentalObjects;
}

// Export for use in seed script
export const RENTAL_OBJECTS_40 = generate40RentalObjects();
