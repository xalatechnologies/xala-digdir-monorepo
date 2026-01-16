/**
 * Demo Rental Objects Seed Data
 * SSA-L Compliance: ≥40 rental objects for Skien kommune demo
 *
 * Categories covered:
 * - Sports facilities (idrettshaller, baner)
 * - Cultural venues (kulturhus, scener)
 * - Meeting rooms (møterom)
 * - Equipment/resources (utstyr)
 * - Youth facilities (ungdomslokaler)
 * - Community centers (grendehus)
 * - Schools/educational (skoler)
 * - Parks and outdoor (parker/uteområder)
 */

// ============================================================================
// UUID Constants (deterministic for testing)
// ============================================================================

// Tenant IDs (reuse from main seed)
export const TENANT_SKIEN = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
export const TENANT_PORSGRUNN = 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d';

// Organization IDs (reuse from main seed)
export const ORG_SKIEN_HALL = '11111111-1111-1111-1111-111111111111';
export const ORG_KULTURHUS = '22222222-2222-2222-2222-222222222222';
export const ORG_PORSGRUNN = '33333333-3333-3333-3333-333333333333';
export const ORG_UNGDOMSKLUBB = '44444444-4444-4444-4444-444444444444';

// New organization IDs for expanded demo
export const ORG_SKIEN_SKOLE = '66666666-1111-1111-1111-111111111111';
export const ORG_SKIEN_BIBLIOTEK = '77777777-1111-1111-1111-111111111111';
export const ORG_SKIEN_PARK = '88888888-1111-1111-1111-111111111111';
export const ORG_SKIEN_GRENDEHUS = '99999999-1111-1111-1111-111111111111';

// ============================================================================
// Rental Object UUID Generator (deterministic)
// ============================================================================
function generateRentalObjectId(index: number): string {
  const hex = index.toString(16).padStart(4, '0');
  return `d0000000-${hex}-4000-8000-000000000000`;
}

// ============================================================================
// Demo Rental Objects (40+ objects)
// ============================================================================

export interface DemoRentalObject {
  id: string;
  tenantId: string;
  organizationId: string;
  name: string;
  slug: string;
  type: 'SPACE' | 'RESOURCE' | 'EVENT' | 'SERVICE' | 'VEHICLE' | 'OTHER';
  status: 'published' | 'draft' | 'archived';
  description: string;
  capacity: number | null;
  pricing: {
    basePrice: number;
    currency: string;
    unit: 'hour' | 'day' | 'booking' | 'week' | 'month';
    weekendModifier?: number;
    memberDiscount?: number;
  };
  images: string[];
  metadata: {
    location?: {
      address: string;
      postalCode: string;
      city: string;
      country: string;
      coordinates?: { lat: number; lng: number };
    };
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
    amenities?: string[];
    faq?: Array<{ question: string; answer: string }>;
    rules?: Array<{ icon: string; text: string }>;
    approvalRequired?: boolean;
    minBookingHours?: number;
    maxBookingHours?: number;
    advanceBookingDays?: number;
  };
}

export const DEMO_RENTAL_OBJECTS: DemoRentalObject[] = [
  // ============================================================================
  // SPORTS FACILITIES (1-10)
  // ============================================================================
  {
    id: generateRentalObjectId(1),
    tenantId: TENANT_SKIEN,
    organizationId: ORG_SKIEN_HALL,
    name: 'Skien Idrettshall - Hall A',
    slug: 'skien-idrettshall-hall-a',
    type: 'SPACE',
    status: 'published',
    description:
      'Stor flerbrukshall med plass til håndball, basketball og volleyball. Moderne sportsgulv og elektronisk måltavle.',
    capacity: 500,
    pricing: { basePrice: 1500, currency: 'NOK', unit: 'hour', weekendModifier: 1.5 },
    images: [
      'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=1200',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200',
    ],
    metadata: {
      location: { address: 'Idrettsveien 1', postalCode: '3724', city: 'Skien', country: 'Norway' },
      contactName: 'Kari Nordmann',
      contactEmail: 'booking@skien-idrettshall.no',
      contactPhone: '+47 35 58 20 00',
      amenities: ['changing_rooms', 'showers', 'parking', 'scoreboard', 'tribune', 'wifi'],
      approvalRequired: false,
      minBookingHours: 1,
      maxBookingHours: 8,
      advanceBookingDays: 90,
    },
  },
  {
    id: generateRentalObjectId(2),
    tenantId: TENANT_SKIEN,
    organizationId: ORG_SKIEN_HALL,
    name: 'Skien Idrettshall - Hall B (Treningshall)',
    slug: 'skien-idrettshall-hall-b',
    type: 'SPACE',
    status: 'published',
    description:
      'Mindre treningshall perfekt for gymnastikk, kampsport og aerobics. Speilvegg og matter tilgjengelig.',
    capacity: 100,
    pricing: { basePrice: 800, currency: 'NOK', unit: 'hour' },
    images: ['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200'],
    metadata: {
      location: { address: 'Idrettsveien 1', postalCode: '3724', city: 'Skien', country: 'Norway' },
      contactName: 'Ole Jensen',
      contactEmail: 'booking@skien-idrettshall.no',
      contactPhone: '+47 35 58 20 01',
      amenities: ['changing_rooms', 'showers', 'mirrors', 'mats', 'sound_system'],
      approvalRequired: false,
    },
  },
  {
    id: generateRentalObjectId(3),
    tenantId: TENANT_SKIEN,
    organizationId: ORG_SKIEN_HALL,
    name: 'Gimsøy Kunstgressbane',
    slug: 'gimsoy-kunstgressbane',
    type: 'SPACE',
    status: 'published',
    description:
      'Full størrelse kunstgressbane med flomlys. FIFA-godkjent underlag for kamper og trening.',
    capacity: 30,
    pricing: { basePrice: 1200, currency: 'NOK', unit: 'hour' },
    images: ['https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=1200'],
    metadata: {
      location: { address: 'Gimsøyveien 45', postalCode: '3730', city: 'Skien', country: 'Norway' },
      contactName: 'Erik Larsen',
      contactEmail: 'bane@skien.kommune.no',
      contactPhone: '+47 35 58 30 00',
      amenities: ['floodlights', 'changing_rooms', 'parking'],
      approvalRequired: true,
    },
  },
  {
    id: generateRentalObjectId(4),
    tenantId: TENANT_SKIEN,
    organizationId: ORG_SKIEN_HALL,
    name: 'Skien Tennishall',
    slug: 'skien-tennishall',
    type: 'SPACE',
    status: 'published',
    description: 'Innendørs tennishall med 4 baner. Hardcourt underlag.',
    capacity: 16,
    pricing: { basePrice: 600, currency: 'NOK', unit: 'hour' },
    images: ['https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=1200'],
    metadata: {
      location: { address: 'Tennisveien 2', postalCode: '3724', city: 'Skien', country: 'Norway' },
      contactName: 'Lisa Berg',
      contactEmail: 'tennis@skien.kommune.no',
      contactPhone: '+47 35 58 20 10',
      amenities: ['changing_rooms', 'showers', 'equipment_rental'],
      approvalRequired: false,
    },
  },
  {
    id: generateRentalObjectId(5),
    tenantId: TENANT_SKIEN,
    organizationId: ORG_SKIEN_HALL,
    name: 'Skien Svømmehall - Konkurransebasseng',
    slug: 'skien-svommehall-konkurranse',
    type: 'SPACE',
    status: 'published',
    description: '50-meters olympisk konkurransebasseng med 8 baner. Elektronisk tidtaking.',
    capacity: 200,
    pricing: { basePrice: 2000, currency: 'NOK', unit: 'hour' },
    images: ['https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?w=1200'],
    metadata: {
      location: { address: 'Badeparken 1', postalCode: '3724', city: 'Skien', country: 'Norway' },
      contactName: 'Anna Hansen',
      contactEmail: 'svommehall@skien.kommune.no',
      contactPhone: '+47 35 58 25 00',
      amenities: ['changing_rooms', 'showers', 'sauna', 'timing_system', 'spectator_area'],
      approvalRequired: true,
    },
  },
  {
    id: generateRentalObjectId(6),
    tenantId: TENANT_SKIEN,
    organizationId: ORG_SKIEN_HALL,
    name: 'Skien Svømmehall - Treningsbasseng',
    slug: 'skien-svommehall-trening',
    type: 'SPACE',
    status: 'published',
    description: '25-meters treningsbasseng med 6 baner. Perfekt for svømmekurs og trening.',
    capacity: 60,
    pricing: { basePrice: 1000, currency: 'NOK', unit: 'hour' },
    images: ['https://images.unsplash.com/photo-1600965962102-9d260a71890d?w=1200'],
    metadata: {
      location: { address: 'Badeparken 1', postalCode: '3724', city: 'Skien', country: 'Norway' },
      contactName: 'Anna Hansen',
      contactEmail: 'svommehall@skien.kommune.no',
      contactPhone: '+47 35 58 25 00',
      amenities: ['changing_rooms', 'showers'],
      approvalRequired: false,
    },
  },
  {
    id: generateRentalObjectId(7),
    tenantId: TENANT_SKIEN,
    organizationId: ORG_SKIEN_HALL,
    name: 'Borgeåsen Skianlegg',
    slug: 'borgeasen-skianlegg',
    type: 'SPACE',
    status: 'published',
    description: 'Lysløype og skistadion med 5 km preparerte løyper. Moderne skiskytteranlegg.',
    capacity: 100,
    pricing: { basePrice: 500, currency: 'NOK', unit: 'hour' },
    images: ['https://images.unsplash.com/photo-1551524559-8af4e6624178?w=1200'],
    metadata: {
      location: {
        address: 'Borgeåsveien 100',
        postalCode: '3728',
        city: 'Skien',
        country: 'Norway',
      },
      contactName: 'Per Olsen',
      contactEmail: 'ski@skien.kommune.no',
      contactPhone: '+47 35 58 30 10',
      amenities: ['floodlights', 'wax_cabin', 'parking', 'biathlon_range'],
      approvalRequired: true,
    },
  },
  {
    id: generateRentalObjectId(8),
    tenantId: TENANT_SKIEN,
    organizationId: ORG_SKIEN_HALL,
    name: 'Skien Klatrehall',
    slug: 'skien-klatrehall',
    type: 'SPACE',
    status: 'published',
    description:
      'Innendørs klatrehall med buldrevegg og høye vegger opptil 15 meter. Sertifisert sikringsutstyr.',
    capacity: 40,
    pricing: { basePrice: 700, currency: 'NOK', unit: 'hour' },
    images: ['https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1200'],
    metadata: {
      location: {
        address: 'Klatreparken 3',
        postalCode: '3724',
        city: 'Skien',
        country: 'Norway',
      },
      contactName: 'Morten Klatresen',
      contactEmail: 'klatring@skien.kommune.no',
      contactPhone: '+47 35 58 28 00',
      amenities: ['equipment_rental', 'changing_rooms', 'cafe'],
      approvalRequired: false,
    },
  },
  {
    id: generateRentalObjectId(9),
    tenantId: TENANT_SKIEN,
    organizationId: ORG_SKIEN_HALL,
    name: 'Skien Ishall',
    slug: 'skien-ishall',
    type: 'SPACE',
    status: 'published',
    description:
      'Innendørs ishall med NHL-størrelse isbane. Perfekt for ishockey, kunstløp og curling.',
    capacity: 300,
    pricing: { basePrice: 1800, currency: 'NOK', unit: 'hour' },
    images: ['https://images.unsplash.com/photo-1515703407324-5f753afd8be8?w=1200'],
    metadata: {
      location: { address: 'Ishallveien 5', postalCode: '3724', city: 'Skien', country: 'Norway' },
      contactName: 'Stein Isberg',
      contactEmail: 'ishall@skien.kommune.no',
      contactPhone: '+47 35 58 29 00',
      amenities: ['changing_rooms', 'equipment_rental', 'spectator_area', 'snack_bar'],
      approvalRequired: true,
    },
  },
  {
    id: generateRentalObjectId(10),
    tenantId: TENANT_SKIEN,
    organizationId: ORG_SKIEN_HALL,
    name: 'Friluftsbadet Skien',
    slug: 'friluftsbadet-skien',
    type: 'SPACE',
    status: 'published',
    description: 'Utendørs friluftsbad med 50m basseng, stupetårn og barnebasseng. Sesongåpent.',
    capacity: 500,
    pricing: { basePrice: 3000, currency: 'NOK', unit: 'day' },
    images: ['https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=1200'],
    metadata: {
      location: {
        address: 'Friluftsbadveien 1',
        postalCode: '3724',
        city: 'Skien',
        country: 'Norway',
      },
      contactName: 'Liv Sommer',
      contactEmail: 'friluftsbad@skien.kommune.no',
      contactPhone: '+47 35 58 26 00',
      amenities: ['changing_rooms', 'diving_board', 'kids_pool', 'sunbathing_area', 'kiosk'],
      approvalRequired: true,
    },
  },

  // ============================================================================
  // CULTURAL VENUES (11-20)
  // ============================================================================
  {
    id: generateRentalObjectId(11),
    tenantId: TENANT_SKIEN,
    organizationId: ORG_KULTURHUS,
    name: 'Ibsenhuset - Hovedscene',
    slug: 'ibsenhuset-hovedscene',
    type: 'SPACE',
    status: 'published',
    description:
      'Profesjonell teaterscene med 800 sitteplasser. Komplett lyd- og lysanlegg, orkestergrav.',
    capacity: 800,
    pricing: { basePrice: 8000, currency: 'NOK', unit: 'day' },
    images: ['https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=1200'],
    metadata: {
      location: {
        address: 'Ibsengate 1',
        postalCode: '3724',
        city: 'Skien',
        country: 'Norway',
      },
      contactName: 'Henrik Teater',
      contactEmail: 'scene@ibsenhuset.no',
      contactPhone: '+47 35 90 55 00',
      amenities: ['stage', 'lighting', 'sound_system', 'orchestra_pit', 'backstage', 'greenroom'],
      approvalRequired: true,
    },
  },
  {
    id: generateRentalObjectId(12),
    tenantId: TENANT_SKIEN,
    organizationId: ORG_KULTURHUS,
    name: 'Ibsenhuset - Lille Scene',
    slug: 'ibsenhuset-lille-scene',
    type: 'SPACE',
    status: 'published',
    description: 'Intimt teaterrom for mindre produksjoner. Fleksibelt sceneområde, 150 plasser.',
    capacity: 150,
    pricing: { basePrice: 3000, currency: 'NOK', unit: 'day' },
    images: ['https://images.unsplash.com/photo-1503095396549-807759245b35?w=1200'],
    metadata: {
      location: { address: 'Ibsengate 1', postalCode: '3724', city: 'Skien', country: 'Norway' },
      contactName: 'Solveig Scene',
      contactEmail: 'scene@ibsenhuset.no',
      contactPhone: '+47 35 90 55 01',
      amenities: ['stage', 'lighting', 'sound_system', 'backstage'],
      approvalRequired: true,
    },
  },
  {
    id: generateRentalObjectId(13),
    tenantId: TENANT_SKIEN,
    organizationId: ORG_KULTURHUS,
    name: 'Kulturhuset Skien - Storsal',
    slug: 'kulturhuset-storsal',
    type: 'SPACE',
    status: 'published',
    description:
      'Multifunksjonell storsal for konserter, konferanser og messer. 1200 stående, 600 sittende.',
    capacity: 1200,
    pricing: { basePrice: 10000, currency: 'NOK', unit: 'day' },
    images: ['https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200'],
    metadata: {
      location: {
        address: 'Kulturhusgata 5',
        postalCode: '3724',
        city: 'Skien',
        country: 'Norway',
      },
      contactName: 'Kultur Koordinator',
      contactEmail: 'booking@kulturhuset-skien.no',
      contactPhone: '+47 35 58 40 00',
      amenities: ['stage', 'lighting', 'sound_system', 'catering_kitchen', 'wheelchair_access'],
      approvalRequired: true,
    },
  },
  {
    id: generateRentalObjectId(14),
    tenantId: TENANT_SKIEN,
    organizationId: ORG_KULTURHUS,
    name: 'Øvingsstudio A',
    slug: 'ovingsstudio-a',
    type: 'SPACE',
    status: 'published',
    description:
      'Profesjonelt lydtett øvingsstudio for band og musikere. Backline, PA og mikrofoner inkludert.',
    capacity: 10,
    pricing: { basePrice: 250, currency: 'NOK', unit: 'hour', memberDiscount: 0.2 },
    images: ['https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200'],
    metadata: {
      location: {
        address: 'Kulturhusgata 5',
        postalCode: '3724',
        city: 'Skien',
        country: 'Norway',
      },
      contactName: 'Rock Manager',
      contactEmail: 'studio@kulturhuset-skien.no',
      contactPhone: '+47 35 58 40 10',
      amenities: ['soundproof', 'drums', 'amplifiers', 'pa_system', 'recording'],
      approvalRequired: false,
    },
  },
  {
    id: generateRentalObjectId(15),
    tenantId: TENANT_SKIEN,
    organizationId: ORG_KULTURHUS,
    name: 'Øvingsstudio B',
    slug: 'ovingsstudio-b',
    type: 'SPACE',
    status: 'published',
    description: 'Mindre øvingsstudio for akustiske ensembler og soloartister.',
    capacity: 5,
    pricing: { basePrice: 150, currency: 'NOK', unit: 'hour', memberDiscount: 0.2 },
    images: ['https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=1200'],
    metadata: {
      location: {
        address: 'Kulturhusgata 5',
        postalCode: '3724',
        city: 'Skien',
        country: 'Norway',
      },
      contactName: 'Rock Manager',
      contactEmail: 'studio@kulturhuset-skien.no',
      contactPhone: '+47 35 58 40 10',
      amenities: ['soundproof', 'piano', 'music_stands'],
      approvalRequired: false,
    },
  },
  {
    id: generateRentalObjectId(16),
    tenantId: TENANT_SKIEN,
    organizationId: ORG_KULTURHUS,
    name: 'Kunstverksted',
    slug: 'kunstverksted',
    type: 'SPACE',
    status: 'published',
    description:
      'Verksted for kunst og håndverk. Keramikkovn, staffelier, arbeidsbord og verktøy tilgjengelig.',
    capacity: 20,
    pricing: { basePrice: 400, currency: 'NOK', unit: 'hour' },
    images: ['https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1200'],
    metadata: {
      location: {
        address: 'Kulturhusgata 5',
        postalCode: '3724',
        city: 'Skien',
        country: 'Norway',
      },
      contactName: 'Kreativ Leder',
      contactEmail: 'verksted@kulturhuset-skien.no',
      contactPhone: '+47 35 58 40 20',
      amenities: ['kiln', 'easels', 'work_tables', 'sink', 'storage'],
      approvalRequired: false,
    },
  },
  {
    id: generateRentalObjectId(17),
    tenantId: TENANT_SKIEN,
    organizationId: ORG_KULTURHUS,
    name: 'Dansestudio',
    slug: 'dansestudio',
    type: 'SPACE',
    status: 'published',
    description:
      'Profesjonelt dansestudio med fjærgulv, speilvegg og lydanlegg. Egnet for alle danseformer.',
    capacity: 30,
    pricing: { basePrice: 500, currency: 'NOK', unit: 'hour' },
    images: ['https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=1200'],
    metadata: {
      location: {
        address: 'Kulturhusgata 5',
        postalCode: '3724',
        city: 'Skien',
        country: 'Norway',
      },
      contactName: 'Dans Koordinator',
      contactEmail: 'dans@kulturhuset-skien.no',
      contactPhone: '+47 35 58 40 30',
      amenities: ['sprung_floor', 'mirrors', 'sound_system', 'barres', 'changing_rooms'],
      approvalRequired: false,
    },
  },
  {
    id: generateRentalObjectId(18),
    tenantId: TENANT_SKIEN,
    organizationId: ORG_KULTURHUS,
    name: 'Kinosal 1',
    slug: 'kinosal-1',
    type: 'SPACE',
    status: 'published',
    description:
      'Moderne kinosal med 200 seter, 4K projektor og Dolby Atmos lydsystem. Perfekt for filmvisninger og presentasjoner.',
    capacity: 200,
    pricing: { basePrice: 2500, currency: 'NOK', unit: 'hour' },
    images: ['https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200'],
    metadata: {
      location: {
        address: 'Kulturhusgata 5',
        postalCode: '3724',
        city: 'Skien',
        country: 'Norway',
      },
      contactName: 'Kino Sjef',
      contactEmail: 'kino@kulturhuset-skien.no',
      contactPhone: '+47 35 58 40 40',
      amenities: ['4k_projector', 'dolby_atmos', 'wheelchair_access'],
      approvalRequired: true,
    },
  },
  {
    id: generateRentalObjectId(19),
    tenantId: TENANT_SKIEN,
    organizationId: ORG_KULTURHUS,
    name: 'Galleri Skien',
    slug: 'galleri-skien',
    type: 'SPACE',
    status: 'published',
    description:
      'Fleksibelt gallerilokale for kunstutstillinger. 150 kvm med justerbar belysning og hengesystem.',
    capacity: 100,
    pricing: { basePrice: 1500, currency: 'NOK', unit: 'day' },
    images: ['https://images.unsplash.com/photo-1531685250784-7569952593d2?w=1200'],
    metadata: {
      location: {
        address: 'Kulturhusgata 5',
        postalCode: '3724',
        city: 'Skien',
        country: 'Norway',
      },
      contactName: 'Galleri Kurator',
      contactEmail: 'galleri@kulturhuset-skien.no',
      contactPhone: '+47 35 58 40 50',
      amenities: ['track_lighting', 'hanging_system', 'security', 'reception_desk'],
      approvalRequired: true,
    },
  },
  {
    id: generateRentalObjectId(20),
    tenantId: TENANT_SKIEN,
    organizationId: ORG_KULTURHUS,
    name: 'Festsal Henrik',
    slug: 'festsal-henrik',
    type: 'SPACE',
    status: 'published',
    description:
      'Elegant festsal med historisk interiør. Ideell for bryllup, jubileer og formelle middager.',
    capacity: 120,
    pricing: { basePrice: 5000, currency: 'NOK', unit: 'day', weekendModifier: 1.25 },
    images: ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200'],
    metadata: {
      location: { address: 'Ibsengate 1', postalCode: '3724', city: 'Skien', country: 'Norway' },
      contactName: 'Event Koordinator',
      contactEmail: 'festsal@ibsenhuset.no',
      contactPhone: '+47 35 90 55 10',
      amenities: ['catering_kitchen', 'dance_floor', 'stage', 'grand_piano', 'coat_room'],
      approvalRequired: true,
    },
  },

  // ============================================================================
  // MEETING ROOMS (21-28)
  // ============================================================================
  {
    id: generateRentalObjectId(21),
    tenantId: TENANT_SKIEN,
    organizationId: ORG_SKIEN_HALL,
    name: 'Møterom Ibsen',
    slug: 'moterom-ibsen',
    type: 'SPACE',
    status: 'published',
    description:
      'Profesjonelt møterom for opptil 20 personer. Projektor, whiteboard og videokonferanseutstyr.',
    capacity: 20,
    pricing: { basePrice: 400, currency: 'NOK', unit: 'hour' },
    images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200'],
    metadata: {
      location: { address: 'Idrettsveien 1', postalCode: '3724', city: 'Skien', country: 'Norway' },
      contactName: 'Booking Service',
      contactEmail: 'moterom@skien.kommune.no',
      contactPhone: '+47 35 58 20 20',
      amenities: ['projector', 'whiteboard', 'video_conference', 'wifi', 'coffee'],
      approvalRequired: false,
    },
  },
  {
    id: generateRentalObjectId(22),
    tenantId: TENANT_SKIEN,
    organizationId: ORG_SKIEN_HALL,
    name: 'Møterom Hamsun',
    slug: 'moterom-hamsun',
    type: 'SPACE',
    status: 'published',
    description: 'Mindre møterom for 8-10 personer. Smart TV og trådløs presentasjon.',
    capacity: 10,
    pricing: { basePrice: 250, currency: 'NOK', unit: 'hour' },
    images: ['https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=1200'],
    metadata: {
      location: { address: 'Idrettsveien 1', postalCode: '3724', city: 'Skien', country: 'Norway' },
      contactName: 'Booking Service',
      contactEmail: 'moterom@skien.kommune.no',
      contactPhone: '+47 35 58 20 20',
      amenities: ['smart_tv', 'whiteboard', 'wifi'],
      approvalRequired: false,
    },
  },
  {
    id: generateRentalObjectId(23),
    tenantId: TENANT_SKIEN,
    organizationId: ORG_SKIEN_BIBLIOTEK,
    name: 'Biblioteket - Studierom 1',
    slug: 'bibliotek-studierom-1',
    type: 'SPACE',
    status: 'published',
    description: 'Stille studierom i biblioteket. Perfekt for gruppearbeid og lesegrupper.',
    capacity: 8,
    pricing: { basePrice: 0, currency: 'NOK', unit: 'hour' },
    images: ['https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1200'],
    metadata: {
      location: {
        address: 'Bibliotekgata 10',
        postalCode: '3724',
        city: 'Skien',
        country: 'Norway',
      },
      contactName: 'Bibliotek Service',
      contactEmail: 'booking@skien-bibliotek.no',
      contactPhone: '+47 35 58 50 00',
      amenities: ['wifi', 'power_outlets', 'whiteboard'],
      approvalRequired: false,
    },
  },
  {
    id: generateRentalObjectId(24),
    tenantId: TENANT_SKIEN,
    organizationId: ORG_SKIEN_BIBLIOTEK,
    name: 'Biblioteket - Studierom 2',
    slug: 'bibliotek-studierom-2',
    type: 'SPACE',
    status: 'published',
    description: 'Stort studierom i biblioteket med interaktiv tavle.',
    capacity: 12,
    pricing: { basePrice: 0, currency: 'NOK', unit: 'hour' },
    images: ['https://images.unsplash.com/photo-1568667256549-094345857637?w=1200'],
    metadata: {
      location: {
        address: 'Bibliotekgata 10',
        postalCode: '3724',
        city: 'Skien',
        country: 'Norway',
      },
      contactName: 'Bibliotek Service',
      contactEmail: 'booking@skien-bibliotek.no',
      contactPhone: '+47 35 58 50 00',
      amenities: ['wifi', 'power_outlets', 'interactive_board'],
      approvalRequired: false,
    },
  },
  {
    id: generateRentalObjectId(25),
    tenantId: TENANT_SKIEN,
    organizationId: ORG_KULTURHUS,
    name: 'Konferanserom Store',
    slug: 'konferanserom-store',
    type: 'SPACE',
    status: 'published',
    description:
      'Stort konferanserom med plass til 50 personer. Fullverdig AV-utstyr og catering mulig.',
    capacity: 50,
    pricing: { basePrice: 800, currency: 'NOK', unit: 'hour' },
    images: ['https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200'],
    metadata: {
      location: {
        address: 'Kulturhusgata 5',
        postalCode: '3724',
        city: 'Skien',
        country: 'Norway',
      },
      contactName: 'Konferanse Booking',
      contactEmail: 'konferanse@kulturhuset-skien.no',
      contactPhone: '+47 35 58 40 60',
      amenities: ['projector', 'microphones', 'video_conference', 'catering_available'],
      approvalRequired: true,
    },
  },
  {
    id: generateRentalObjectId(26),
    tenantId: TENANT_SKIEN,
    organizationId: ORG_KULTURHUS,
    name: 'Konferanserom Lille',
    slug: 'konferanserom-lille',
    type: 'SPACE',
    status: 'published',
    description: 'Mindre konferanserom for workshops og seminarer. 25 plasser.',
    capacity: 25,
    pricing: { basePrice: 500, currency: 'NOK', unit: 'hour' },
    images: ['https://images.unsplash.com/photo-1462826303086-329426d1aef5?w=1200'],
    metadata: {
      location: {
        address: 'Kulturhusgata 5',
        postalCode: '3724',
        city: 'Skien',
        country: 'Norway',
      },
      contactName: 'Konferanse Booking',
      contactEmail: 'konferanse@kulturhuset-skien.no',
      contactPhone: '+47 35 58 40 60',
      amenities: ['projector', 'whiteboard', 'flipchart'],
      approvalRequired: false,
    },
  },
  {
    id: generateRentalObjectId(27),
    tenantId: TENANT_SKIEN,
    organizationId: ORG_SKIEN_SKOLE,
    name: 'Skolens Aula',
    slug: 'skolens-aula',
    type: 'SPACE',
    status: 'published',
    description: 'Stor aula på Skien videregående skole. Scene, 300 plasser, projektor.',
    capacity: 300,
    pricing: { basePrice: 1500, currency: 'NOK', unit: 'hour' },
    images: ['https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200'],
    metadata: {
      location: { address: 'Skolegata 15', postalCode: '3724', city: 'Skien', country: 'Norway' },
      contactName: 'Skole Administrator',
      contactEmail: 'booking@skien-vgs.no',
      contactPhone: '+47 35 58 60 00',
      amenities: ['stage', 'projector', 'sound_system', 'wheelchair_access'],
      approvalRequired: true,
    },
  },
  {
    id: generateRentalObjectId(28),
    tenantId: TENANT_SKIEN,
    organizationId: ORG_SKIEN_SKOLE,
    name: 'Klasserom Teknologi',
    slug: 'klasserom-teknologi',
    type: 'SPACE',
    status: 'published',
    description: 'Datarom med 25 arbeidsstasjoner. Perfekt for IT-kurs og workshops.',
    capacity: 25,
    pricing: { basePrice: 600, currency: 'NOK', unit: 'hour' },
    images: ['https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200'],
    metadata: {
      location: { address: 'Skolegata 15', postalCode: '3724', city: 'Skien', country: 'Norway' },
      contactName: 'IT Koordinator',
      contactEmail: 'it@skien-vgs.no',
      contactPhone: '+47 35 58 60 10',
      amenities: ['computers', 'projector', 'software', 'wifi'],
      approvalRequired: true,
    },
  },

  // ============================================================================
  // EQUIPMENT / RESOURCES (29-34)
  // ============================================================================
  {
    id: generateRentalObjectId(29),
    tenantId: TENANT_SKIEN,
    organizationId: ORG_KULTURHUS,
    name: 'PA-anlegg Komplett',
    slug: 'pa-anlegg-komplett',
    type: 'RESOURCE',
    status: 'published',
    description:
      'Profesjonelt PA-anlegg med mikser, høyttalere, subwoofer og mikrofoner. For opptil 500 personer.',
    capacity: 1,
    pricing: { basePrice: 1500, currency: 'NOK', unit: 'day' },
    images: ['https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200'],
    metadata: {
      contactName: 'Teknisk Avdeling',
      contactEmail: 'utstyr@kulturhuset-skien.no',
      contactPhone: '+47 35 58 40 70',
      amenities: ['mixer', 'speakers', 'subwoofer', 'microphones', 'cables'],
      approvalRequired: false,
    },
  },
  {
    id: generateRentalObjectId(30),
    tenantId: TENANT_SKIEN,
    organizationId: ORG_KULTURHUS,
    name: 'Projektor 4K',
    slug: 'projektor-4k',
    type: 'RESOURCE',
    status: 'published',
    description: 'Epson 4K-projektor med 5000 lumen. HDMI og trådløs tilkobling.',
    capacity: 1,
    pricing: { basePrice: 500, currency: 'NOK', unit: 'day' },
    images: ['https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=1200'],
    metadata: {
      contactName: 'Teknisk Avdeling',
      contactEmail: 'utstyr@kulturhuset-skien.no',
      contactPhone: '+47 35 58 40 70',
      approvalRequired: false,
    },
  },
  {
    id: generateRentalObjectId(31),
    tenantId: TENANT_SKIEN,
    organizationId: ORG_KULTURHUS,
    name: 'Lysrigg Mobil',
    slug: 'lysrigg-mobil',
    type: 'RESOURCE',
    status: 'published',
    description: 'Mobil lysrigg med LED-spots, moving heads og DMX-styring.',
    capacity: 1,
    pricing: { basePrice: 2000, currency: 'NOK', unit: 'day' },
    images: ['https://images.unsplash.com/photo-1504501650895-2441b7915699?w=1200'],
    metadata: {
      contactName: 'Teknisk Avdeling',
      contactEmail: 'utstyr@kulturhuset-skien.no',
      contactPhone: '+47 35 58 40 70',
      approvalRequired: true,
    },
  },
  {
    id: generateRentalObjectId(32),
    tenantId: TENANT_SKIEN,
    organizationId: ORG_SKIEN_HALL,
    name: 'Bord og Stoler Pakke (50 sett)',
    slug: 'bord-stoler-pakke',
    type: 'RESOURCE',
    status: 'published',
    description: '50 sammenleggbare bord og 200 stoler for arrangementer.',
    capacity: 1,
    pricing: { basePrice: 800, currency: 'NOK', unit: 'day' },
    images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200'],
    metadata: {
      contactName: 'Utstyr Utleie',
      contactEmail: 'utstyr@skien-idrettshall.no',
      contactPhone: '+47 35 58 20 30',
      approvalRequired: false,
    },
  },
  {
    id: generateRentalObjectId(33),
    tenantId: TENANT_SKIEN,
    organizationId: ORG_KULTURHUS,
    name: 'Steinway Konsertflygel',
    slug: 'steinway-konsertflygel',
    type: 'RESOURCE',
    status: 'published',
    description: 'Steinway Model D konsertflygel. Profesjonell stemming inkludert.',
    capacity: 1,
    pricing: { basePrice: 3000, currency: 'NOK', unit: 'day' },
    images: ['https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=1200'],
    metadata: {
      contactName: 'Instrumentansvarlig',
      contactEmail: 'flygel@ibsenhuset.no',
      contactPhone: '+47 35 90 55 20',
      approvalRequired: true,
    },
  },
  {
    id: generateRentalObjectId(34),
    tenantId: TENANT_SKIEN,
    organizationId: ORG_SKIEN_PARK,
    name: 'Scene Utendørs',
    slug: 'scene-utendors',
    type: 'RESOURCE',
    status: 'published',
    description: 'Mobil utendørsscene 8x6 meter med tak. Enkel montering.',
    capacity: 1,
    pricing: { basePrice: 5000, currency: 'NOK', unit: 'day' },
    images: ['https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1200'],
    metadata: {
      contactName: 'Park og Friluft',
      contactEmail: 'park@skien.kommune.no',
      contactPhone: '+47 35 58 70 00',
      approvalRequired: true,
    },
  },

  // ============================================================================
  // COMMUNITY CENTERS / YOUTH (35-40)
  // ============================================================================
  {
    id: generateRentalObjectId(35),
    tenantId: TENANT_SKIEN,
    organizationId: ORG_UNGDOMSKLUBB,
    name: 'Ungdomshuset Skien',
    slug: 'ungdomshuset-skien',
    type: 'SPACE',
    status: 'published',
    description:
      'Aktivitetslokale for ungdom med spillrom, musikkrom og kafé. Gratis for ungdomsgrupper.',
    capacity: 80,
    pricing: { basePrice: 0, currency: 'NOK', unit: 'hour' },
    images: ['https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=1200'],
    metadata: {
      location: {
        address: 'Ungdomsveien 5',
        postalCode: '3724',
        city: 'Skien',
        country: 'Norway',
      },
      contactName: 'Ungdomsleder',
      contactEmail: 'ungdom@skien.kommune.no',
      contactPhone: '+47 35 58 80 00',
      amenities: ['gaming_room', 'music_room', 'cafe', 'wifi'],
      approvalRequired: false,
    },
  },
  {
    id: generateRentalObjectId(36),
    tenantId: TENANT_SKIEN,
    organizationId: ORG_SKIEN_GRENDEHUS,
    name: 'Grendehus Gulset',
    slug: 'grendehus-gulset',
    type: 'SPACE',
    status: 'published',
    description: 'Tradisjonelt grendehus med kjøkken og stor sal. Perfekt for fester og møter.',
    capacity: 100,
    pricing: { basePrice: 1000, currency: 'NOK', unit: 'day' },
    images: ['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200'],
    metadata: {
      location: { address: 'Gulsetveien 45', postalCode: '3730', city: 'Skien', country: 'Norway' },
      contactName: 'Grendehus Styret',
      contactEmail: 'gulset@grendehus.no',
      contactPhone: '+47 35 58 90 00',
      amenities: ['kitchen', 'tables_chairs', 'stage', 'parking'],
      approvalRequired: true,
    },
  },
  {
    id: generateRentalObjectId(37),
    tenantId: TENANT_SKIEN,
    organizationId: ORG_SKIEN_GRENDEHUS,
    name: 'Grendehus Borgestad',
    slug: 'grendehus-borgestad',
    type: 'SPACE',
    status: 'published',
    description: 'Moderne grendehus med fleksibelt lokale. Nytt kjøkken og handicap-tilpasset.',
    capacity: 80,
    pricing: { basePrice: 800, currency: 'NOK', unit: 'day' },
    images: ['https://images.unsplash.com/photo-1564078516393-cf04bd966897?w=1200'],
    metadata: {
      location: {
        address: 'Borgestadveien 88',
        postalCode: '3729',
        city: 'Skien',
        country: 'Norway',
      },
      contactName: 'Grendehus Styret',
      contactEmail: 'borgestad@grendehus.no',
      contactPhone: '+47 35 58 90 10',
      amenities: ['kitchen', 'tables_chairs', 'wheelchair_access', 'parking'],
      approvalRequired: true,
    },
  },
  {
    id: generateRentalObjectId(38),
    tenantId: TENANT_SKIEN,
    organizationId: ORG_SKIEN_GRENDEHUS,
    name: 'Grendehus Klosterskogen',
    slug: 'grendehus-klosterskogen',
    type: 'SPACE',
    status: 'published',
    description: 'Koselig grendehus i naturskjønne omgivelser. Ideelt for konfirmasjoner og bryllup.',
    capacity: 60,
    pricing: { basePrice: 700, currency: 'NOK', unit: 'day' },
    images: ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200'],
    metadata: {
      location: {
        address: 'Klosterskogveien 20',
        postalCode: '3727',
        city: 'Skien',
        country: 'Norway',
      },
      contactName: 'Grendehus Styret',
      contactEmail: 'klosterskogen@grendehus.no',
      contactPhone: '+47 35 58 90 20',
      amenities: ['kitchen', 'outdoor_area', 'barbecue', 'parking'],
      approvalRequired: true,
    },
  },
  {
    id: generateRentalObjectId(39),
    tenantId: TENANT_SKIEN,
    organizationId: ORG_SKIEN_PARK,
    name: 'Brekkeparken Paviljong',
    slug: 'brekkeparken-paviljong',
    type: 'SPACE',
    status: 'published',
    description:
      'Historisk paviljong i Brekkeparken. Åpen struktur, ideell for sommerarrangementer.',
    capacity: 150,
    pricing: { basePrice: 2000, currency: 'NOK', unit: 'day' },
    images: ['https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=1200'],
    metadata: {
      location: {
        address: 'Brekkeparken 1',
        postalCode: '3724',
        city: 'Skien',
        country: 'Norway',
      },
      contactName: 'Park og Friluft',
      contactEmail: 'park@skien.kommune.no',
      contactPhone: '+47 35 58 70 00',
      amenities: ['outdoor_seating', 'power_outlets', 'water_access'],
      approvalRequired: true,
    },
  },
  {
    id: generateRentalObjectId(40),
    tenantId: TENANT_SKIEN,
    organizationId: ORG_SKIEN_PARK,
    name: 'Telemark Museum Festplass',
    slug: 'telemark-museum-festplass',
    type: 'SPACE',
    status: 'published',
    description:
      'Stor utendørs festplass ved Telemark Museum. Kapasitet for store arrangementer og festivaler.',
    capacity: 2000,
    pricing: { basePrice: 10000, currency: 'NOK', unit: 'day' },
    images: ['https://images.unsplash.com/photo-1472653431158-6364773b2a56?w=1200'],
    metadata: {
      location: {
        address: 'Øvregate 41',
        postalCode: '3724',
        city: 'Skien',
        country: 'Norway',
      },
      contactName: 'Museum Administrator',
      contactEmail: 'event@telemarkmuseum.no',
      contactPhone: '+47 35 54 45 00',
      amenities: ['power_grid', 'water_access', 'security_available', 'parking'],
      approvalRequired: true,
    },
  },

  // ============================================================================
  // ADDITIONAL RENTAL OBJECTS (41-45) - Ensuring 45+ total
  // ============================================================================
  {
    id: generateRentalObjectId(41),
    tenantId: TENANT_PORSGRUNN,
    organizationId: ORG_PORSGRUNN,
    name: 'Porsgrunn Stadion - Hovedbane',
    slug: 'porsgrunn-stadion-hovedbane',
    type: 'SPACE',
    status: 'published',
    description:
      'Hovedbane med naturgress og tribune for 5000 tilskuere. Fullverdig flomlysanlegg.',
    capacity: 30,
    pricing: { basePrice: 2000, currency: 'NOK', unit: 'hour' },
    images: ['https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200'],
    metadata: {
      location: {
        address: 'Stadionveien 15',
        postalCode: '3933',
        city: 'Porsgrunn',
        country: 'Norway',
      },
      contactName: 'Stadion Administrator',
      contactEmail: 'stadion@porsgrunn.kommune.no',
      contactPhone: '+47 35 55 10 00',
      amenities: ['floodlights', 'changing_rooms', 'tribune', 'parking'],
      approvalRequired: true,
    },
  },
  {
    id: generateRentalObjectId(42),
    tenantId: TENANT_PORSGRUNN,
    organizationId: ORG_PORSGRUNN,
    name: 'Porsgrunn Friidrettsstadion',
    slug: 'porsgrunn-friidrettsstadion',
    type: 'SPACE',
    status: 'published',
    description:
      '8-baners 400m løpebane med Mondo-dekke. Alle kastøvelser og hopp tilgjengelig.',
    capacity: 100,
    pricing: { basePrice: 1500, currency: 'NOK', unit: 'hour' },
    images: ['https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=1200'],
    metadata: {
      location: {
        address: 'Atletikkveien 3',
        postalCode: '3933',
        city: 'Porsgrunn',
        country: 'Norway',
      },
      contactName: 'Friidrett Koordinator',
      contactEmail: 'friidrett@porsgrunn.kommune.no',
      contactPhone: '+47 35 55 10 10',
      amenities: ['running_track', 'long_jump', 'high_jump', 'throwing_area', 'changing_rooms'],
      approvalRequired: true,
    },
  },
  {
    id: generateRentalObjectId(43),
    tenantId: TENANT_SKIEN,
    organizationId: ORG_SKIEN_HALL,
    name: 'Squashhall Skien',
    slug: 'squashhall-skien',
    type: 'SPACE',
    status: 'published',
    description: '4 squashbaner med glass-vegg på bane 1. Utstyr kan leies.',
    capacity: 8,
    pricing: { basePrice: 200, currency: 'NOK', unit: 'hour' },
    images: ['https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1200'],
    metadata: {
      location: { address: 'Idrettsveien 1', postalCode: '3724', city: 'Skien', country: 'Norway' },
      contactName: 'Squash Booking',
      contactEmail: 'squash@skien-idrettshall.no',
      contactPhone: '+47 35 58 20 40',
      amenities: ['equipment_rental', 'changing_rooms', 'showers'],
      approvalRequired: false,
    },
  },
  {
    id: generateRentalObjectId(44),
    tenantId: TENANT_SKIEN,
    organizationId: ORG_SKIEN_HALL,
    name: 'Badmintonhall',
    slug: 'badmintonhall',
    type: 'SPACE',
    status: 'published',
    description: '6 badmintonbaner med profesjonelt underlag. Racketer og baller kan leies.',
    capacity: 24,
    pricing: { basePrice: 300, currency: 'NOK', unit: 'hour' },
    images: ['https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=1200'],
    metadata: {
      location: { address: 'Idrettsveien 1', postalCode: '3724', city: 'Skien', country: 'Norway' },
      contactName: 'Badminton Booking',
      contactEmail: 'badminton@skien-idrettshall.no',
      contactPhone: '+47 35 58 20 50',
      amenities: ['equipment_rental', 'changing_rooms', 'showers', 'spectator_area'],
      approvalRequired: false,
    },
  },
  {
    id: generateRentalObjectId(45),
    tenantId: TENANT_SKIEN,
    organizationId: ORG_SKIEN_BIBLIOTEK,
    name: 'Makerspace Skien',
    slug: 'makerspace-skien',
    type: 'SPACE',
    status: 'published',
    description:
      'Kreativt verksted med 3D-printere, laserkutter, CNC-maskin og elektronikk-utstyr.',
    capacity: 15,
    pricing: { basePrice: 100, currency: 'NOK', unit: 'hour' },
    images: ['https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200'],
    metadata: {
      location: {
        address: 'Bibliotekgata 10',
        postalCode: '3724',
        city: 'Skien',
        country: 'Norway',
      },
      contactName: 'Makerspace Koordinator',
      contactEmail: 'makerspace@skien-bibliotek.no',
      contactPhone: '+47 35 58 50 10',
      amenities: ['3d_printer', 'laser_cutter', 'cnc', 'electronics_bench', 'wifi'],
      approvalRequired: false,
    },
  },
];

// ============================================================================
// Export Functions
// ============================================================================

/**
 * Get all demo rental objects for seeding
 */
export function getDemoRentalObjects(): DemoRentalObject[] {
  return DEMO_RENTAL_OBJECTS;
}

/**
 * Get rental objects count
 */
export function getRentalObjectsCount(): number {
  return DEMO_RENTAL_OBJECTS.length;
}

/**
 * Get rental objects by type
 */
export function getRentalObjectsByType(type: DemoRentalObject['type']): DemoRentalObject[] {
  return DEMO_RENTAL_OBJECTS.filter((obj) => obj.type === type);
}

/**
 * Get rental objects by tenant
 */
export function getRentalObjectsByTenant(tenantId: string): DemoRentalObject[] {
  return DEMO_RENTAL_OBJECTS.filter((obj) => obj.tenantId === tenantId);
}

/**
 * Get rental objects requiring approval
 */
export function getRentalObjectsRequiringApproval(): DemoRentalObject[] {
  return DEMO_RENTAL_OBJECTS.filter((obj) => obj.metadata.approvalRequired === true);
}

/**
 * Transform to database-compatible format for Drizzle insert
 */
export function toDatabaseFormat(rentalObject: DemoRentalObject) {
  return {
    id: rentalObject.id,
    tenantId: rentalObject.tenantId,
    organizationId: rentalObject.organizationId,
    name: rentalObject.name,
    slug: rentalObject.slug,
    type: rentalObject.type,
    status: rentalObject.status,
    description: rentalObject.description,
    capacity: rentalObject.capacity,
    pricing: rentalObject.pricing,
    images: rentalObject.images,
    metadata: rentalObject.metadata,
  };
}

// ============================================================================
// Self-verification
// ============================================================================
if (require.main === module) {
  console.log(`Total demo rental objects: ${getRentalObjectsCount()}`);
  console.log(`SPACE type: ${getRentalObjectsByType('SPACE').length}`);
  console.log(`RESOURCE type: ${getRentalObjectsByType('RESOURCE').length}`);
  console.log(`Skien tenant: ${getRentalObjectsByTenant(TENANT_SKIEN).length}`);
  console.log(`Porsgrunn tenant: ${getRentalObjectsByTenant(TENANT_PORSGRUNN).length}`);
  console.log(`Requiring approval: ${getRentalObjectsRequiringApproval().length}`);
}
