// Generate 40 rental objects for seeding
const TENANT_SKIEN = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
const ORG_SKIEN_HALL = '11111111-1111-1111-1111-111111111111'; // Skien Idrettshall
const HALL_A_ID = 'd0000001-0000-0000-0000-000000000001';

const FACILITY_TYPES = [
  'Idrettshall A', 'Fotballbane 1', 'Tennisbane 1', 'Svømmehall', 'Treningsstudio 1',
  'Kunstgressbane', 'Basketballbane', 'Håndballhall', 'Turnhall', 'Klatrehall',
  'Dansestudio', 'Kampsportstudio', 'Yogastudio', 'Squashbane', 'Badmintonhall',
  'Innebandyhall', 'Volleyballbane', 'Bordtennisrom', 'Bowlinghall', 'Klubbhus',
  'Kultursal', 'Konsertsal', 'Teatersal', 'Kinosal', 'Forelesningssal',
  'Seminarrom', 'Møterom A', 'Gymsal', 'Skøytebane', 'Curlinghall',
  'Fotballbane 2', 'Idrettshall B', 'Tennisbane 2', 'Treningsstudio 2', 'Møterom B',
  'Spillestudio', 'Podcaststudio', 'Filmstudio', 'Lydstudio', 'Multihall',
];

const CITIES = ['Skien', 'Porsgrunn', 'Bamble', 'Notodden', 'Kragerø'];
const STREETS = ['Idrettsveien', 'Parkveien', 'Håndballgata', 'Kulturhusgata', 'Sportsbakken', 'Hallveien'];

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

function getImages(name) {
  if (name.includes('Fotball')) return IMAGE_SETS.football;
  if (name.includes('Tennis')) return IMAGE_SETS.tennis;
  if (name.includes('Trenings') || name.includes('Kamp') || name.includes('Yoga')) return IMAGE_SETS.gym;
  if (name.includes('Svømme')) return IMAGE_SETS.pool;
  return IMAGE_SETS.sports_hall;
}

function generateSlug(name, index) {
  return name
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') + `-${index}`;
}

function generateId(index) {
  if (index === 0) return HALL_A_ID;
  // Generate UUID in format: d0000001-0000-0001-0000-000000000000
  const hex = index.toString(16).padStart(4, '0');
  return `d0000001-0000-${hex}-0000-000000000000`;
}

const objects = FACILITY_TYPES.map((facilityType, i) => {
  const city = CITIES[i % CITIES.length];
  const street = STREETS[i % STREETS.length];
  const streetNumber = (i % 50) + 1;
  const postalCode = `37${20 + (i % 80)}`;
  const size = facilityType.includes('studio') || facilityType.includes('rom') ? 'small' : facilityType.includes('hall') || facilityType.includes('bane') ? 'large' : 'medium';
  const basePrices = { small: 500, medium: 1000, large: 1500 };
  const basePrice = basePrices[size];
  const capacity = size === 'small' ? 20 : size === 'medium' ? 100 : 300;

  return {
    id: generateId(i),
    tenantId: TENANT_SKIEN,
    organizationId: ORG_SKIEN_HALL,
    name: facilityType,
    slug: generateSlug(facilityType, i),
    type: 'SPACE',
    categoryKey: 'LOKALER_OG_BANER',
    timeMode: 'PERIOD',
    status: 'published',
    description: `Moderne ${facilityType.toLowerCase()} i ${city}. Perfekt for treninger, kamper og arrangementer. Godt vedlikeholdt med moderne fasiliteter.`,
    capacity,
    pricing: {
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
    },
    images: getImages(facilityType),
    metadata: {
      location: { address: `${street} ${streetNumber}`, postalCode, city, country: 'Norway' },
      contactName: 'Booking Avdeling',
      contactEmail: `booking@${city.toLowerCase()}.kommune.no`,
      contactPhone: `+47 35 ${50 + (i % 50)} ${10 + (i % 90)} 00`,
      openingHours: {
        monday: { open: '06:00', close: '23:00' },
        tuesday: { open: '06:00', close: '23:00' },
        wednesday: { open: '06:00', close: '23:00' },
        thursday: { open: '06:00', close: '23:00' },
        friday: { open: '06:00', close: '23:00' },
        saturday: { open: '08:00', close: '22:00' },
        sunday: { open: '08:00', close: '22:00' },
        holidays: { open: '10:00', close: '20:00' },
      },
      amenities: ['changing_rooms', 'showers', 'parking', 'wifi', 'first_aid'],
      regulations: {
        age: { minimum: 16, supervision: 'Nødvendig for under 18 år' },
        insurance: { required: true, minCoverage: 5000000, provider: 'Egen forsikring eller anleggsforsikring tilgjengelig' },
        cancellation: { policy: 'Gratis avbestilling inntil 24 timer før', fee: { within24h: 500, within12h: 1000 } },
        liability: { userResponsible: true, deposit: 3000, cleaningFee: 800 },
        capacity: { maximum: capacity, fireCode: 'I henhold til TEK17 forskrifter' },
        accessibility: { wheelchairAccess: true, hearingLoop: i % 3 === 0, parking: 'HC-plasser tilgjengelig' },
      },
      bookingRules: {
        advance: { min: 24, max: 180, unit: 'hours/days' },
        duration: { min: 1, max: 8, unit: 'hours' },
        recurring: { allowed: true, maxWeeks: 52 },
        approval: { required: false, autoApprove: true, approvalTime: 4 },
      },
      faq: [
        { question: 'Hva er kapasiteten?', answer: `Lokalet har plass til ${capacity} personer.` },
        { question: 'Er det parkeringsmuligheter?', answer: 'Ja, gratis parkering for 50+ biler.' },
        { question: 'Finnes det garderober?', answer: 'Ja, garderober med dusjer og toaletter.' },
        { question: 'Er WiFi inkludert?', answer: 'Ja, gratis WiFi i hele anlegget.' },
        { question: 'Kan jeg avbestille?', answer: 'Gratis avbestilling inntil 24 timer før.' },
        { question: 'Tilbyr dere rabatter?', answer: 'Ja! 15% medlemsrabatt, 20% studentrabatt, 25% for frivillige.' },
      ],
      rules: [
        { icon: 'shoe', text: 'Kun innendørssko med lyse såler' },
        { icon: 'food', text: 'Mat og drikke kun i fellesområder' },
        { icon: 'clock', text: 'Punktlig fremmøte og avslutning' },
        { icon: 'trash', text: 'Rydd opp etter bruk' },
        { icon: 'volume', text: 'Respekter støyregler etter kl. 22:00' },
        { icon: 'fire', text: 'Røyking forbudt' },
        { icon: 'insurance', text: 'Forsikring anbefales' },
        { icon: 'respect', text: 'Vær hensynsfull' },
      ],
    },
  };
});

console.log(JSON.stringify({ version: '1.0', generatedAt: new Date().toISOString(), description: '40 Norwegian rental objects', objects }, null, 2));
