/**
 * Demo Bookings Seed Data
 * SSA-L Compliance: Existing bookings for demo testing
 *
 * Booking statuses covered:
 * - pending: Awaiting approval from caseworker
 * - confirmed: Approved and ready for use
 * - completed: Past bookings that have been fulfilled
 * - cancelled: Cancelled bookings (various reasons)
 *
 * Coverage includes:
 * - Various rental object types (sports, cultural, meeting rooms)
 * - Different user roles (citizens, organizations)
 * - Different time periods (past, upcoming, future)
 * - Payment states (paid, unpaid, refunded)
 * - Approval-required vs free-booking flows
 */

// ============================================================================
// UUID Constants (reuse from other seeds)
// ============================================================================

// Tenant IDs
export const TENANT_SKIEN = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
export const TENANT_PORSGRUNN = 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d';

// Organization IDs
export const ORG_SKIEN_HALL = '11111111-1111-1111-1111-111111111111';
export const ORG_KULTURHUS = '22222222-2222-2222-2222-222222222222';
export const ORG_PORSGRUNN = '33333333-3333-3333-3333-333333333333';
export const ORG_UNGDOMSKLUBB = '44444444-4444-4444-4444-444444444444';

// User IDs (from demo-users.seed.ts)
export const USER_ADMIN_SKIEN = 'u0000000-0001-4000-8000-000000000000';
export const USER_CASEWORKER_IDRETT = 'u0000000-0004-4000-8000-000000000000';
export const USER_CASEWORKER_KULTUR = 'u0000000-0005-4000-8000-000000000000';
export const USER_CITIZEN_OLE = 'u0000000-0009-4000-8000-000000000000';
export const USER_CITIZEN_KARI = 'u0000000-000a-4000-8000-000000000000';
export const USER_CITIZEN_PER = 'u0000000-000b-4000-8000-000000000000';
export const USER_CITIZEN_LISE = 'u0000000-000c-4000-8000-000000000000';
export const USER_CITIZEN_ANNA = 'u0000000-000e-4000-8000-000000000000';

// Rental Object IDs (from demo-rental-objects.seed.ts - generateRentalObjectId pattern)
function getRentalObjectId(index: number): string {
  const hex = index.toString(16).padStart(4, '0');
  return `d0000000-${hex}-4000-8000-000000000000`;
}

// Common rental object references
export const RENTAL_HALL_A = getRentalObjectId(1); // Skien Idrettshall - Hall A
export const RENTAL_HALL_B = getRentalObjectId(2); // Skien Idrettshall - Hall B
export const RENTAL_KUNSTGRESS = getRentalObjectId(3); // Gimsøy Kunstgressbane
export const RENTAL_TENNIS = getRentalObjectId(4); // Skien Tennishall
export const RENTAL_SVOMME_KONKURRANSE = getRentalObjectId(5); // Svømmehall Konkurranse
export const RENTAL_SVOMME_TRENING = getRentalObjectId(6); // Svømmehall Trening
export const RENTAL_IBSENHUSET_HOVEDSCENE = getRentalObjectId(11); // Ibsenhuset Hovedscene
export const RENTAL_IBSENHUSET_LILLE = getRentalObjectId(12); // Ibsenhuset Lille Scene
export const RENTAL_KULTURHUS_STORSAL = getRentalObjectId(13); // Kulturhuset Storsal
export const RENTAL_OVINGSSTUDIO_A = getRentalObjectId(14); // Øvingsstudio A
export const RENTAL_OVINGSSTUDIO_B = getRentalObjectId(15); // Øvingsstudio B
export const RENTAL_KUNSTVERKSTED = getRentalObjectId(16); // Kunstverksted
export const RENTAL_DANSESTUDIO = getRentalObjectId(17); // Dansestudio
export const RENTAL_MOTEROM_IBSEN = getRentalObjectId(21); // Møterom Ibsen
export const RENTAL_MOTEROM_HAMSUN = getRentalObjectId(22); // Møterom Hamsun
export const RENTAL_STUDIEROM_1 = getRentalObjectId(23); // Bibliotek Studierom 1
export const RENTAL_UNGDOMSHUSET = getRentalObjectId(35); // Ungdomshuset Skien
export const RENTAL_GRENDEHUS_GULSET = getRentalObjectId(36); // Grendehus Gulset
export const RENTAL_PORSGRUNN_STADION = getRentalObjectId(41); // Porsgrunn Stadion

// ============================================================================
// Demo Booking UUID Generator (deterministic)
// ============================================================================
function generateBookingId(index: number): string {
  const hex = index.toString(16).padStart(4, '0');
  return `bk000000-${hex}-4000-8000-000000000000`;
}

// ============================================================================
// Time Utilities
// ============================================================================
const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

function getDateWithTime(daysOffset: number, hour: number, minute: number = 0): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  date.setHours(hour, minute, 0, 0);
  return date;
}

// ============================================================================
// Demo Booking Types
// ============================================================================

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded' | 'partial';

export interface DemoBooking {
  id: string;
  tenantId: string;
  listingId: string;
  userId: string;
  status: BookingStatus;
  startTime: Date;
  endTime: Date;
  totalPrice: string;
  currency: string;
  notes: string | null;
  metadata: {
    paymentStatus: PaymentStatus;
    paymentMethod?: string;
    paymentReference?: string;
    cancellationReason?: string;
    approvedBy?: string;
    approvedAt?: string;
    purpose?: string;
    attendees?: number;
    organizationName?: string;
    contactPhone?: string;
    specialRequirements?: string;
  };
}

// ============================================================================
// Demo Bookings (30+ bookings covering various scenarios)
// ============================================================================

export const DEMO_BOOKINGS: DemoBooking[] = [
  // ============================================================================
  // COMPLETED BOOKINGS (Past - indices 1-8)
  // ============================================================================
  {
    id: generateBookingId(1),
    tenantId: TENANT_SKIEN,
    listingId: RENTAL_HALL_A,
    userId: USER_CITIZEN_OLE,
    status: 'completed',
    startTime: getDateWithTime(-14, 18, 0),
    endTime: getDateWithTime(-14, 20, 0),
    totalPrice: '3000.00',
    currency: 'NOK',
    notes: 'Håndballtrening for Skien Håndballklubb U16',
    metadata: {
      paymentStatus: 'paid',
      paymentMethod: 'vipps',
      paymentReference: 'VIPPS-DEMO-001',
      purpose: 'Håndballtrening',
      attendees: 25,
      organizationName: 'Skien Håndballklubb',
    },
  },
  {
    id: generateBookingId(2),
    tenantId: TENANT_SKIEN,
    listingId: RENTAL_OVINGSSTUDIO_A,
    userId: USER_CITIZEN_LISE,
    status: 'completed',
    startTime: getDateWithTime(-10, 19, 0),
    endTime: getDateWithTime(-10, 22, 0),
    totalPrice: '750.00',
    currency: 'NOK',
    notes: 'Bandøving for Skien Kammerorkester',
    metadata: {
      paymentStatus: 'paid',
      paymentMethod: 'card',
      paymentReference: 'CARD-DEMO-002',
      purpose: 'Orkesterøving',
      attendees: 8,
      organizationName: 'Skien Kammerorkester',
    },
  },
  {
    id: generateBookingId(3),
    tenantId: TENANT_SKIEN,
    listingId: RENTAL_MOTEROM_IBSEN,
    userId: USER_CITIZEN_PER,
    status: 'completed',
    startTime: getDateWithTime(-7, 10, 0),
    endTime: getDateWithTime(-7, 12, 0),
    totalPrice: '800.00',
    currency: 'NOK',
    notes: 'Styremøte for borettslaget',
    metadata: {
      paymentStatus: 'paid',
      paymentMethod: 'invoice',
      paymentReference: 'INV-DEMO-003',
      purpose: 'Styremøte',
      attendees: 12,
      organizationName: 'Skien Borettslag',
    },
  },
  {
    id: generateBookingId(4),
    tenantId: TENANT_SKIEN,
    listingId: RENTAL_DANSESTUDIO,
    userId: USER_CITIZEN_KARI,
    status: 'completed',
    startTime: getDateWithTime(-5, 17, 0),
    endTime: getDateWithTime(-5, 19, 0),
    totalPrice: '1000.00',
    currency: 'NOK',
    notes: 'Dansekurs for nybegynnere',
    metadata: {
      paymentStatus: 'paid',
      paymentMethod: 'vipps',
      paymentReference: 'VIPPS-DEMO-004',
      purpose: 'Dansekurs',
      attendees: 20,
    },
  },
  {
    id: generateBookingId(5),
    tenantId: TENANT_SKIEN,
    listingId: RENTAL_STUDIEROM_1,
    userId: USER_CITIZEN_OLE,
    status: 'completed',
    startTime: getDateWithTime(-4, 14, 0),
    endTime: getDateWithTime(-4, 17, 0),
    totalPrice: '0.00',
    currency: 'NOK',
    notes: 'Studiegruppe - eksamensforberedelse',
    metadata: {
      paymentStatus: 'paid',
      purpose: 'Studiegruppe',
      attendees: 6,
    },
  },
  {
    id: generateBookingId(6),
    tenantId: TENANT_SKIEN,
    listingId: RENTAL_KUNSTGRESS,
    userId: USER_CITIZEN_KARI,
    status: 'completed',
    startTime: getDateWithTime(-3, 18, 0),
    endTime: getDateWithTime(-3, 20, 0),
    totalPrice: '2400.00',
    currency: 'NOK',
    notes: 'Fotballtrening for juniorlaget',
    metadata: {
      paymentStatus: 'paid',
      paymentMethod: 'card',
      paymentReference: 'CARD-DEMO-006',
      approvedBy: USER_CASEWORKER_IDRETT,
      approvedAt: getDateWithTime(-10, 9, 0).toISOString(),
      purpose: 'Fotballtrening',
      attendees: 22,
      organizationName: 'Skien Fotballklubb',
    },
  },
  {
    id: generateBookingId(7),
    tenantId: TENANT_SKIEN,
    listingId: RENTAL_TENNIS,
    userId: USER_CITIZEN_PER,
    status: 'completed',
    startTime: getDateWithTime(-2, 10, 0),
    endTime: getDateWithTime(-2, 12, 0),
    totalPrice: '1200.00',
    currency: 'NOK',
    notes: 'Tennis med venner',
    metadata: {
      paymentStatus: 'paid',
      paymentMethod: 'vipps',
      paymentReference: 'VIPPS-DEMO-007',
      purpose: 'Fritid',
      attendees: 4,
    },
  },
  {
    id: generateBookingId(8),
    tenantId: TENANT_PORSGRUNN,
    listingId: RENTAL_PORSGRUNN_STADION,
    userId: USER_CITIZEN_ANNA,
    status: 'completed',
    startTime: getDateWithTime(-1, 17, 0),
    endTime: getDateWithTime(-1, 19, 0),
    totalPrice: '4000.00',
    currency: 'NOK',
    notes: 'Friidrettstrening for Porsgrunn IL',
    metadata: {
      paymentStatus: 'paid',
      paymentMethod: 'invoice',
      paymentReference: 'INV-DEMO-008',
      approvedBy: 'u0000000-0008-4000-8000-000000000000', // Porsgrunn caseworker
      approvedAt: getDateWithTime(-8, 11, 0).toISOString(),
      purpose: 'Friidrettstrening',
      attendees: 30,
      organizationName: 'Porsgrunn IL',
    },
  },

  // ============================================================================
  // CONFIRMED BOOKINGS (Upcoming - indices 9-18)
  // ============================================================================
  {
    id: generateBookingId(9),
    tenantId: TENANT_SKIEN,
    listingId: RENTAL_HALL_A,
    userId: USER_CITIZEN_OLE,
    status: 'confirmed',
    startTime: getDateWithTime(1, 18, 0),
    endTime: getDateWithTime(1, 20, 0),
    totalPrice: '3000.00',
    currency: 'NOK',
    notes: 'Ukentlig håndballtrening',
    metadata: {
      paymentStatus: 'paid',
      paymentMethod: 'vipps',
      paymentReference: 'VIPPS-DEMO-009',
      purpose: 'Håndballtrening',
      attendees: 25,
      organizationName: 'Skien Håndballklubb',
    },
  },
  {
    id: generateBookingId(10),
    tenantId: TENANT_SKIEN,
    listingId: RENTAL_HALL_B,
    userId: USER_CITIZEN_KARI,
    status: 'confirmed',
    startTime: getDateWithTime(2, 16, 0),
    endTime: getDateWithTime(2, 18, 0),
    totalPrice: '1600.00',
    currency: 'NOK',
    notes: 'Kampsporttrening - Judo',
    metadata: {
      paymentStatus: 'paid',
      paymentMethod: 'card',
      paymentReference: 'CARD-DEMO-010',
      purpose: 'Kampsporttrening',
      attendees: 15,
      organizationName: 'Skien Judoklubb',
    },
  },
  {
    id: generateBookingId(11),
    tenantId: TENANT_SKIEN,
    listingId: RENTAL_OVINGSSTUDIO_B,
    userId: USER_CITIZEN_LISE,
    status: 'confirmed',
    startTime: getDateWithTime(3, 19, 0),
    endTime: getDateWithTime(3, 21, 0),
    totalPrice: '300.00',
    currency: 'NOK',
    notes: 'Pianoøving',
    metadata: {
      paymentStatus: 'paid',
      paymentMethod: 'vipps',
      paymentReference: 'VIPPS-DEMO-011',
      purpose: 'Musikkøving',
      attendees: 1,
    },
  },
  {
    id: generateBookingId(12),
    tenantId: TENANT_SKIEN,
    listingId: RENTAL_MOTEROM_HAMSUN,
    userId: USER_CITIZEN_PER,
    status: 'confirmed',
    startTime: getDateWithTime(4, 9, 0),
    endTime: getDateWithTime(4, 11, 0),
    totalPrice: '500.00',
    currency: 'NOK',
    notes: 'Jobbintervjuer',
    metadata: {
      paymentStatus: 'paid',
      paymentMethod: 'invoice',
      paymentReference: 'INV-DEMO-012',
      purpose: 'Forretning',
      attendees: 5,
      organizationName: 'Telemark Konsulent AS',
    },
  },
  {
    id: generateBookingId(13),
    tenantId: TENANT_SKIEN,
    listingId: RENTAL_KUNSTVERKSTED,
    userId: USER_CITIZEN_OLE,
    status: 'confirmed',
    startTime: getDateWithTime(5, 14, 0),
    endTime: getDateWithTime(5, 17, 0),
    totalPrice: '1200.00',
    currency: 'NOK',
    notes: 'Keramikkurs for barn',
    metadata: {
      paymentStatus: 'paid',
      paymentMethod: 'card',
      paymentReference: 'CARD-DEMO-013',
      purpose: 'Kunst og håndverk',
      attendees: 12,
      specialRequirements: 'Trenger tilgang til keramikkovn',
    },
  },
  {
    id: generateBookingId(14),
    tenantId: TENANT_SKIEN,
    listingId: RENTAL_SVOMME_TRENING,
    userId: USER_CITIZEN_KARI,
    status: 'confirmed',
    startTime: getDateWithTime(6, 7, 0),
    endTime: getDateWithTime(6, 8, 0),
    totalPrice: '1000.00',
    currency: 'NOK',
    notes: 'Morgensvømming for voksne',
    metadata: {
      paymentStatus: 'paid',
      paymentMethod: 'vipps',
      paymentReference: 'VIPPS-DEMO-014',
      purpose: 'Svømmekurs',
      attendees: 20,
    },
  },
  {
    id: generateBookingId(15),
    tenantId: TENANT_SKIEN,
    listingId: RENTAL_UNGDOMSHUSET,
    userId: USER_CITIZEN_OLE,
    status: 'confirmed',
    startTime: getDateWithTime(7, 18, 0),
    endTime: getDateWithTime(7, 22, 0),
    totalPrice: '0.00',
    currency: 'NOK',
    notes: 'Ungdomsklubb kveld',
    metadata: {
      paymentStatus: 'paid',
      purpose: 'Ungdomsaktivitet',
      attendees: 40,
      organizationName: 'Skien Ungdomsråd',
    },
  },
  {
    id: generateBookingId(16),
    tenantId: TENANT_SKIEN,
    listingId: RENTAL_IBSENHUSET_LILLE,
    userId: USER_CITIZEN_LISE,
    status: 'confirmed',
    startTime: getDateWithTime(14, 19, 0),
    endTime: getDateWithTime(14, 22, 0),
    totalPrice: '9000.00',
    currency: 'NOK',
    notes: 'Konsert med Skien Kammerorkester',
    metadata: {
      paymentStatus: 'paid',
      paymentMethod: 'invoice',
      paymentReference: 'INV-DEMO-016',
      approvedBy: USER_CASEWORKER_KULTUR,
      approvedAt: getDateWithTime(-7, 14, 0).toISOString(),
      purpose: 'Konsert',
      attendees: 120,
      organizationName: 'Skien Kammerorkester',
      specialRequirements: 'Behov for flygel og full lysrigg',
    },
  },
  {
    id: generateBookingId(17),
    tenantId: TENANT_SKIEN,
    listingId: RENTAL_GRENDEHUS_GULSET,
    userId: USER_CITIZEN_PER,
    status: 'confirmed',
    startTime: getDateWithTime(21, 12, 0),
    endTime: getDateWithTime(21, 22, 0),
    totalPrice: '1000.00',
    currency: 'NOK',
    notes: 'Konfirmasjon',
    metadata: {
      paymentStatus: 'paid',
      paymentMethod: 'card',
      paymentReference: 'CARD-DEMO-017',
      approvedBy: 'u0000000-0007-4000-8000-000000000000', // Grendehus caseworker
      approvedAt: getDateWithTime(-14, 10, 0).toISOString(),
      purpose: 'Privat arrangement',
      attendees: 60,
      contactPhone: '+47 900 55 666',
    },
  },
  {
    id: generateBookingId(18),
    tenantId: TENANT_PORSGRUNN,
    listingId: RENTAL_PORSGRUNN_STADION,
    userId: USER_CITIZEN_ANNA,
    status: 'confirmed',
    startTime: getDateWithTime(3, 17, 0),
    endTime: getDateWithTime(3, 19, 0),
    totalPrice: '4000.00',
    currency: 'NOK',
    notes: 'Friidrettsstevne forberedelser',
    metadata: {
      paymentStatus: 'paid',
      paymentMethod: 'invoice',
      paymentReference: 'INV-DEMO-018',
      approvedBy: 'u0000000-0008-4000-8000-000000000000',
      approvedAt: getDateWithTime(-5, 9, 0).toISOString(),
      purpose: 'Friidrett',
      attendees: 50,
      organizationName: 'Porsgrunn IL',
    },
  },

  // ============================================================================
  // PENDING BOOKINGS (Awaiting approval - indices 19-24)
  // ============================================================================
  {
    id: generateBookingId(19),
    tenantId: TENANT_SKIEN,
    listingId: RENTAL_SVOMME_KONKURRANSE,
    userId: USER_CITIZEN_KARI,
    status: 'pending',
    startTime: getDateWithTime(10, 18, 0),
    endTime: getDateWithTime(10, 21, 0),
    totalPrice: '6000.00',
    currency: 'NOK',
    notes: 'Svømmestevne for ungdom',
    metadata: {
      paymentStatus: 'unpaid',
      purpose: 'Svømmestevne',
      attendees: 100,
      organizationName: 'Telemark Svømmeklubb',
      specialRequirements: 'Behov for elektronisk tidtaking og dommerbord',
    },
  },
  {
    id: generateBookingId(20),
    tenantId: TENANT_SKIEN,
    listingId: RENTAL_IBSENHUSET_HOVEDSCENE,
    userId: USER_CITIZEN_LISE,
    status: 'pending',
    startTime: getDateWithTime(30, 19, 0),
    endTime: getDateWithTime(30, 23, 0),
    totalPrice: '32000.00',
    currency: 'NOK',
    notes: 'Årskonsert med Telemark Symfoniorkester',
    metadata: {
      paymentStatus: 'unpaid',
      purpose: 'Konsert',
      attendees: 600,
      organizationName: 'Telemark Symfoniorkester',
      specialRequirements: 'Full orkesteroppsett, flygel, lysdesign',
    },
  },
  {
    id: generateBookingId(21),
    tenantId: TENANT_SKIEN,
    listingId: RENTAL_KULTURHUS_STORSAL,
    userId: USER_CITIZEN_PER,
    status: 'pending',
    startTime: getDateWithTime(45, 10, 0),
    endTime: getDateWithTime(45, 18, 0),
    totalPrice: '10000.00',
    currency: 'NOK',
    notes: 'Karrieremesse for studenter',
    metadata: {
      paymentStatus: 'unpaid',
      purpose: 'Messe',
      attendees: 500,
      organizationName: 'Universitetet i Sørøst-Norge',
      specialRequirements: 'Behov for 30 messestands og fullverdig PA',
    },
  },
  {
    id: generateBookingId(22),
    tenantId: TENANT_SKIEN,
    listingId: RENTAL_KUNSTGRESS,
    userId: USER_CITIZEN_OLE,
    status: 'pending',
    startTime: getDateWithTime(8, 10, 0),
    endTime: getDateWithTime(8, 14, 0),
    totalPrice: '4800.00',
    currency: 'NOK',
    notes: 'Bedriftsfotball turnering',
    metadata: {
      paymentStatus: 'unpaid',
      purpose: 'Bedriftsarrangement',
      attendees: 80,
      organizationName: 'Skien Næringsforening',
      contactPhone: '+47 900 11 222',
    },
  },
  {
    id: generateBookingId(23),
    tenantId: TENANT_SKIEN,
    listingId: RENTAL_GRENDEHUS_GULSET,
    userId: USER_CITIZEN_KARI,
    status: 'pending',
    startTime: getDateWithTime(60, 17, 0),
    endTime: getDateWithTime(60, 23, 0),
    totalPrice: '1000.00',
    currency: 'NOK',
    notes: 'Bryllupsfest',
    metadata: {
      paymentStatus: 'unpaid',
      purpose: 'Privat arrangement',
      attendees: 80,
      contactPhone: '+47 900 33 444',
      specialRequirements: 'Tilgang til kjøkken, behov for ekstra bord og stoler',
    },
  },
  {
    id: generateBookingId(24),
    tenantId: TENANT_PORSGRUNN,
    listingId: RENTAL_PORSGRUNN_STADION,
    userId: USER_CITIZEN_ANNA,
    status: 'pending',
    startTime: getDateWithTime(15, 10, 0),
    endTime: getDateWithTime(15, 16, 0),
    totalPrice: '12000.00',
    currency: 'NOK',
    notes: 'Regionalt friidrettsstevne',
    metadata: {
      paymentStatus: 'unpaid',
      purpose: 'Friidrettsstevne',
      attendees: 200,
      organizationName: 'Telemark Friidrettskrets',
      specialRequirements: 'Behov for tidtakingsutstyr og resultattavle',
    },
  },

  // ============================================================================
  // CANCELLED BOOKINGS (Various reasons - indices 25-30)
  // ============================================================================
  {
    id: generateBookingId(25),
    tenantId: TENANT_SKIEN,
    listingId: RENTAL_HALL_A,
    userId: USER_CITIZEN_OLE,
    status: 'cancelled',
    startTime: getDateWithTime(-1, 18, 0),
    endTime: getDateWithTime(-1, 20, 0),
    totalPrice: '3000.00',
    currency: 'NOK',
    notes: 'Kansellert pga sykdom i laget',
    metadata: {
      paymentStatus: 'refunded',
      paymentMethod: 'vipps',
      paymentReference: 'VIPPS-DEMO-025',
      cancellationReason: 'sickness',
      purpose: 'Håndballtrening',
      organizationName: 'Skien Håndballklubb',
    },
  },
  {
    id: generateBookingId(26),
    tenantId: TENANT_SKIEN,
    listingId: RENTAL_KUNSTGRESS,
    userId: USER_CITIZEN_KARI,
    status: 'cancelled',
    startTime: getDateWithTime(5, 18, 0),
    endTime: getDateWithTime(5, 20, 0),
    totalPrice: '2400.00',
    currency: 'NOK',
    notes: 'Kansellert pga dårlig vær (storm)',
    metadata: {
      paymentStatus: 'refunded',
      paymentMethod: 'card',
      paymentReference: 'CARD-DEMO-026',
      cancellationReason: 'weather',
      purpose: 'Fotballkamp',
      organizationName: 'Skien Fotballklubb',
    },
  },
  {
    id: generateBookingId(27),
    tenantId: TENANT_SKIEN,
    listingId: RENTAL_MOTEROM_IBSEN,
    userId: USER_CITIZEN_PER,
    status: 'cancelled',
    startTime: getDateWithTime(-3, 13, 0),
    endTime: getDateWithTime(-3, 15, 0),
    totalPrice: '800.00',
    currency: 'NOK',
    notes: 'Avlyst møte - flyttet til digitalt format',
    metadata: {
      paymentStatus: 'refunded',
      paymentMethod: 'invoice',
      paymentReference: 'INV-DEMO-027',
      cancellationReason: 'moved_online',
      purpose: 'Styremøte',
      organizationName: 'Skien Borettslag',
    },
  },
  {
    id: generateBookingId(28),
    tenantId: TENANT_SKIEN,
    listingId: RENTAL_IBSENHUSET_LILLE,
    userId: USER_CITIZEN_LISE,
    status: 'cancelled',
    startTime: getDateWithTime(-21, 19, 0),
    endTime: getDateWithTime(-21, 22, 0),
    totalPrice: '9000.00',
    currency: 'NOK',
    notes: 'Kansellert - hovedartist ble syk',
    metadata: {
      paymentStatus: 'refunded',
      paymentMethod: 'invoice',
      paymentReference: 'INV-DEMO-028',
      cancellationReason: 'performer_illness',
      purpose: 'Konsert',
      organizationName: 'Skien Kammerorkester',
    },
  },
  {
    id: generateBookingId(29),
    tenantId: TENANT_SKIEN,
    listingId: RENTAL_TENNIS,
    userId: USER_CITIZEN_OLE,
    status: 'cancelled',
    startTime: getDateWithTime(2, 14, 0),
    endTime: getDateWithTime(2, 16, 0),
    totalPrice: '1200.00',
    currency: 'NOK',
    notes: 'Kansellert av bruker - endrede planer',
    metadata: {
      paymentStatus: 'partial',
      paymentMethod: 'vipps',
      paymentReference: 'VIPPS-DEMO-029',
      cancellationReason: 'user_request',
      purpose: 'Fritid',
    },
  },
  {
    id: generateBookingId(30),
    tenantId: TENANT_SKIEN,
    listingId: RENTAL_DANSESTUDIO,
    userId: USER_CITIZEN_KARI,
    status: 'cancelled',
    startTime: getDateWithTime(-8, 17, 0),
    endTime: getDateWithTime(-8, 19, 0),
    totalPrice: '1000.00',
    currency: 'NOK',
    notes: 'Kansellert - for få påmeldte til kurset',
    metadata: {
      paymentStatus: 'refunded',
      paymentMethod: 'card',
      paymentReference: 'CARD-DEMO-030',
      cancellationReason: 'insufficient_participants',
      purpose: 'Dansekurs',
    },
  },
];

// ============================================================================
// Export Functions
// ============================================================================

/**
 * Get all demo bookings for seeding
 */
export function getDemoBookings(): DemoBooking[] {
  return DEMO_BOOKINGS;
}

/**
 * Get demo bookings count
 */
export function getDemoBookingsCount(): number {
  return DEMO_BOOKINGS.length;
}

/**
 * Get demo bookings by status
 */
export function getDemoBookingsByStatus(status: BookingStatus): DemoBooking[] {
  return DEMO_BOOKINGS.filter((booking) => booking.status === status);
}

/**
 * Get demo bookings by tenant
 */
export function getDemoBookingsByTenant(tenantId: string): DemoBooking[] {
  return DEMO_BOOKINGS.filter((booking) => booking.tenantId === tenantId);
}

/**
 * Get demo bookings by user
 */
export function getDemoBookingsByUser(userId: string): DemoBooking[] {
  return DEMO_BOOKINGS.filter((booking) => booking.userId === userId);
}

/**
 * Get demo bookings by listing (rental object)
 */
export function getDemoBookingsByListing(listingId: string): DemoBooking[] {
  return DEMO_BOOKINGS.filter((booking) => booking.listingId === listingId);
}

/**
 * Get pending bookings (for caseworker queue)
 */
export function getPendingBookings(): DemoBooking[] {
  return getDemoBookingsByStatus('pending');
}

/**
 * Get confirmed upcoming bookings
 */
export function getUpcomingBookings(): DemoBooking[] {
  const now = new Date();
  return DEMO_BOOKINGS.filter(
    (booking) => booking.status === 'confirmed' && booking.startTime > now
  );
}

/**
 * Get completed past bookings
 */
export function getCompletedBookings(): DemoBooking[] {
  return getDemoBookingsByStatus('completed');
}

/**
 * Get cancelled bookings
 */
export function getCancelledBookings(): DemoBooking[] {
  return getDemoBookingsByStatus('cancelled');
}

/**
 * Get bookings by payment status
 */
export function getDemoBookingsByPaymentStatus(paymentStatus: PaymentStatus): DemoBooking[] {
  return DEMO_BOOKINGS.filter((booking) => booking.metadata.paymentStatus === paymentStatus);
}

/**
 * Transform to database-compatible format for Drizzle insert
 */
export function toDatabaseFormat(booking: DemoBooking) {
  return {
    id: booking.id,
    tenantId: booking.tenantId,
    listingId: booking.listingId,
    userId: booking.userId,
    status: booking.status,
    startTime: booking.startTime,
    endTime: booking.endTime,
    totalPrice: booking.totalPrice,
    currency: booking.currency,
    notes: booking.notes,
    metadata: booking.metadata,
  };
}

/**
 * Get all demo bookings in database format
 */
export function getAllDemoBookingsForDatabase() {
  return DEMO_BOOKINGS.map(toDatabaseFormat);
}

// ============================================================================
// Self-verification
// ============================================================================
if (require.main === module) {
  console.log(`Total demo bookings: ${getDemoBookingsCount()}`);
  console.log(`Completed bookings: ${getCompletedBookings().length}`);
  console.log(`Confirmed bookings: ${getDemoBookingsByStatus('confirmed').length}`);
  console.log(`Pending bookings: ${getPendingBookings().length}`);
  console.log(`Cancelled bookings: ${getCancelledBookings().length}`);
  console.log(`Skien tenant: ${getDemoBookingsByTenant(TENANT_SKIEN).length}`);
  console.log(`Porsgrunn tenant: ${getDemoBookingsByTenant(TENANT_PORSGRUNN).length}`);
  console.log(`Paid bookings: ${getDemoBookingsByPaymentStatus('paid').length}`);
  console.log(`Unpaid bookings: ${getDemoBookingsByPaymentStatus('unpaid').length}`);
  console.log(`Refunded bookings: ${getDemoBookingsByPaymentStatus('refunded').length}`);
}
