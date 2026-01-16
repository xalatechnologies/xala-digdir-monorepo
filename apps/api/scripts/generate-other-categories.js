// Generate 10 rental objects from OTHER categories (UTSTYR, TJENESTER, PAKKER)
const TENANT_SKIEN = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
const ORG_SKIEN_HALL = '11111111-1111-1111-1111-111111111111';

// Category-specific data
const CATEGORIES = {
  UTSTYR: {
    items: [
      { name: 'Fotballutstyr Pakke', desc: 'Komplett pakke med baller, vester, kjegler og mål', price: 300, capacity: 25, images: 'sports_equipment' },
      { name: 'Lydanlegg Profesjonell', desc: 'Profesjonelt PA-system med mikrofoner og mixer', price: 800, capacity: 500, images: 'audio' },
      { name: 'Projektor HD', desc: 'Full HD projektor med lerret og HDMI-tilkobling', price: 400, capacity: 200, images: 'projector' },
      { name: 'Stoler og Bord Sett', desc: '50 stoler og 10 bord for arrangementer', price: 200, capacity: 50, images: 'furniture' },
    ],
    timeMode: 'PERIOD'
  },
  TJENESTER: {
    items: [
      { name: 'Rengjøringstjeneste', desc: 'Profesjonell rengjøring etter arrangement', price: 1200, capacity: 1, images: 'cleaning' },
      { name: 'Catering Service', desc: 'Mattilbud for arrangementer (pr. person)', price: 250, capacity: 100, images: 'catering' },
      { name: 'Vaktmestertjeneste', desc: 'Teknisk support og vaktmester under arrangement', price: 500, capacity: 1, images: 'maintenance' },
    ],
    timeMode: 'PERIOD'
  },
  PAKKER: {
    items: [
      { name: 'Fotballkamp Pakke', desc: 'Hall + utstyr + dommer for fotballkamp', price: 2500, capacity: 50, images: 'football' },
      { name: 'Konsert Pakke', desc: 'Sal + lydanlegg + tekniker for konsert', price: 5000, capacity: 300, images: 'concert' },
      { name: 'Bursdagsfest Pakke', desc: 'Rom + dekorasjoner + aktivitetsutstyr', price: 1500, capacity: 30, images: 'party' },
    ],
    timeMode: 'PERIOD'
  }
};

const IMAGE_SETS = {
  sports_equipment: [
    'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1200&q=80',
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&q=80',
    'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=1200&q=80',
  ],
  audio: [
    'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&q=80',
    'https://images.unsplash.com/photo-1519508232229-2c6af21a6c8d?w=1200&q=80',
    'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1200&q=80',
  ],
  projector: [
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&q=80',
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&q=80',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80',
  ],
  furniture: [
    'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=1200&q=80',
    'https://images.unsplash.com/photo-1571624436279-b272aff752b5?w=1200&q=80',
    'https://images.unsplash.com/photo-1552581234-26160f608093?w=1200&q=80',
  ],
  cleaning: [
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&q=80',
    'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=1200&q=80',
    'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=1200&q=80',
  ],
  catering: [
    'https://images.unsplash.com/photo-1555244162-803834f70033?w=1200&q=80',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80',
    'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=1200&q=80',
  ],
  maintenance: [
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&q=80',
    'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=1200&q=80',
    'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=1200&q=80',
  ],
  football: [
    'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=1200&q=80',
    'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1200&q=80',
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=80',
  ],
  concert: [
    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=80',
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&q=80',
    'https://images.unsplash.com/photo-1501612780327-45045538702b?w=1200&q=80',
  ],
  party: [
    'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200&q=80',
    'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&q=80',
    'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1200&q=80',
  ],
};

function generateSlug(name, index) {
  return name
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') + `-${index}`;
}

const objects = [];
let index = 0;

// Generate objects for each category
Object.entries(CATEGORIES).forEach(([categoryKey, categoryData]) => {
  categoryData.items.forEach((item) => {
    const id = `e0000001-0000-${(index + 1).toString(16).padStart(4, '0')}-0000-000000000000`;
    
    objects.push({
      id,
      tenantId: TENANT_SKIEN,
      organizationId: ORG_SKIEN_HALL,
      name: item.name,
      slug: generateSlug(item.name, index),
      type: 'SPACE',
      categoryKey,
      timeMode: categoryData.timeMode,
      status: 'published',
      description: item.desc,
      capacity: item.capacity,
      pricing: {
        basePrice: item.price,
        currency: 'NOK',
        unit: categoryKey === 'UTSTYR' ? 'day' : categoryKey === 'TJENESTER' ? 'service' : 'package',
        tiers: [
          { type: 'base', price: item.price, label: 'Grunnpris' },
          { type: 'half_day', price: Math.round(item.price * 0.6), duration: 4, label: 'Halvdag' },
          { type: 'full_day', price: item.price, duration: 8, label: 'Heldag' },
          { type: 'weekly', price: Math.round(item.price * 5), duration: 168, label: 'Uke (7 dager)' },
        ],
        discounts: [
          { type: 'member', percentage: 10, label: 'Medlemsrabatt' },
          { type: 'student', percentage: 15, label: 'Studentrabatt' },
          { type: 'nonprofit', percentage: 20, label: 'Frivillig organisasjon' },
        ],
      },
      images: IMAGE_SETS[item.images],
      metadata: {
        location: {
          address: `Idrettsveien ${index + 1}`,
          postalCode: `37${20 + index}`,
          city: 'Skien',
          country: 'Norway'
        },
        contactName: 'Booking Avdeling',
        contactEmail: 'booking@skien.kommune.no',
        contactPhone: `+47 35 50 ${10 + index} 00`,
        openingHours: {
          monday: { open: '07:00', close: '22:00' },
          tuesday: { open: '07:00', close: '22:00' },
          wednesday: { open: '07:00', close: '22:00' },
          thursday: { open: '07:00', close: '22:00' },
          friday: { open: '07:00', close: '22:00' },
          saturday: { open: '09:00', close: '20:00' },
          sunday: { open: '09:00', close: '20:00' },
          holidays: { open: '10:00', close: '18:00' },
        },
        amenities: categoryKey === 'UTSTYR' 
          ? ['storage', 'maintenance', 'insurance']
          : categoryKey === 'TJENESTER'
          ? ['professional_staff', 'flexible_hours', 'quality_guarantee']
          : ['all_inclusive', 'customizable', 'dedicated_support'],
        regulations: {
          age: { minimum: 18, supervision: 'Ansvarlig voksen påkrevd' },
          insurance: { required: true, minCoverage: 2000000, provider: 'Inkludert i leieprisen' },
          cancellation: { policy: 'Gratis avbestilling inntil 48 timer før', fee: { within48h: Math.round(item.price * 0.5), within24h: item.price } },
          liability: { userResponsible: true, deposit: 1000, cleaningFee: 500 },
          capacity: { maximum: item.capacity, fireCode: 'I henhold til TEK17' },
          accessibility: { wheelchairAccess: true, hearingLoop: false, parking: 'Tilgjengelig' },
        },
        bookingRules: {
          advance: { min: 48, max: 180, unit: 'hours/days' },
          duration: { min: categoryKey === 'TJENESTER' ? 2 : 4, max: 24, unit: 'hours' },
          recurring: { allowed: true, maxWeeks: 26 },
          approval: { required: categoryKey === 'PAKKER', autoApprove: categoryKey !== 'PAKKER', approvalTime: 8 },
        },
        faq: [
          { question: 'Hva er inkludert?', answer: `${item.desc}. Alt utstyr og tjenester er inkludert i prisen.` },
          { question: 'Kan jeg avbestille?', answer: 'Gratis avbestilling inntil 48 timer før.' },
          { question: 'Er det noen ekstra kostnader?', answer: 'Depositum på 1000 NOK returneres etter godkjent bruk.' },
          { question: 'Hvordan bestiller jeg?', answer: 'Book via nettsiden eller ring oss direkte.' },
          { question: 'Er forsikring inkludert?', answer: 'Ja, grunnforsikring er inkludert på alt utstyr og tjenester.' },
          { question: 'Tilbyr dere rabatter?', answer: 'Ja! 10-20% rabatt for medlemmer, studenter og frivillige organisasjoner.' },
        ],
        rules: [
          { icon: 'check', text: 'Behandle utstyret forsiktig' },
          { icon: 'clock', text: 'Lever tilbake i god tid' },
          { icon: 'clean', text: 'Rengjør utstyret etter bruk' },
          { icon: 'report', text: 'Rapporter skader umiddelbart' },
          { icon: 'respect', text: 'Følg bruksanvisningen' },
          { icon: 'insurance', text: 'Forsikring dekker kun normal bruk' },
        ],
        categorySpecific: categoryKey === 'UTSTYR' 
          ? { condition: 'excellent', maintenanceDate: '2026-01-01', serialNumber: `EQ-${index.toString().padStart(4, '0')}` }
          : categoryKey === 'TJENESTER'
          ? { staffRequired: true, minimumNotice: 48, qualifications: ['Certified', 'Insured', 'Experienced'] }
          : { includedItems: item.desc.split(' + '), customizable: true, setupTime: 2 },
      },
    });
    
    index++;
  });
});

console.log(JSON.stringify({ version: '1.0', generatedAt: new Date().toISOString(), description: '10 objects from UTSTYR, TJENESTER, PAKKER categories', objects }, null, 2));
