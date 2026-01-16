/**
 * Database Seed Script
 * Norwegian demo data for production-ready demo
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/database/schema/index';
import { logger } from '../src/core/logger';

// ============================================================================
// UUID Constants (valid UUIDs for all entities)
// ============================================================================

// Tenants
const TENANT_SKIEN = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
const TENANT_PORSGRUNN = 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d';
const TENANT_DEMO = 'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e';

// Organizations
const ORG_SKIEN_HALL = '11111111-1111-1111-1111-111111111111';
const ORG_KULTURHUS = '22222222-2222-2222-2222-222222222222';
const ORG_PORSGRUNN = '33333333-3333-3333-3333-333333333333';
const ORG_UNGDOMSKLUBB = '44444444-4444-4444-4444-444444444444';
const ORG_DEMO = '55555555-5555-5555-5555-555555555555';

// Users
const USER_ADMIN = '66666666-6666-6666-6666-666666666666'; // Kari Nordmann (saksbehandler)
const USER_MANAGER = '77777777-7777-7777-7777-777777777777';
const USER_STAFF = '88888888-8888-8888-8888-888888888888';
const USER_PIL_ADMIN = '99999999-9999-9999-9999-999999999999';
const USER_PIL_MEMBER = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const USER_DEMO = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const USER_OLA_HANSEN = '01a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c'; // Citizen for Minside testing

// Bookings for Ola Hansen (Minside testing)
const BOOKING_OLA_1 = 'b0a1c2d3-e4f5-4a6b-8c7d-9e0f1a2b3c4d';
const BOOKING_OLA_2 = 'b0a1c2d3-e4f5-4a6b-8c7d-9e0f1a2b3c4e';
const BOOKING_OLA_3 = 'b0a1c2d3-e4f5-4a6b-8c7d-9e0f1a2b3c4f';
const BOOKING_OLA_4 = 'b0a1c2d3-e4f5-4a6b-8c7d-9e0f1a2b3c50';
const BOOKING_OLA_5 = 'b0a1c2d3-e4f5-4a6b-8c7d-9e0f1a2b3c51';
const BOOKING_OLA_6 = 'b0a1c2d3-e4f5-4a6b-8c7d-9e0f1a2b3c52';
const BOOKING_OLA_7 = 'b0a1c2d3-e4f5-4a6b-8c7d-9e0f1a2b3c53';
const BOOKING_OLA_8 = 'b0a1c2d3-e4f5-4a6b-8c7d-9e0f1a2b3c54';

// Conversations for Ola Hansen
const CONV_BOOKING_QUESTION = 'c0a1b2c3-d4e5-4f6a-7b8c-9d0e1f2a3b4c';
const CONV_WEEKEND_AVAILABILITY = 'c0a1b2c3-d4e5-4f6a-7b8c-9d0e1f2a3b4d';
const CONV_WEATHER_CANCEL = 'c0a1b2c3-d4e5-4f6a-7b8c-9d0e1f2a3b4e';

// Listings
const LISTING_HALL_A = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
const LISTING_HALL_B = 'dddddddd-dddd-dddd-dddd-dddddddddddd';
const LISTING_MEETING = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
const LISTING_SCENE = 'ffffffff-ffff-ffff-ffff-ffffffffffff';
const LISTING_STUDIO = '11111111-2222-3333-4444-555555555555';
const LISTING_PROJECTOR = '22222222-3333-4444-5555-666666666666';
const LISTING_PA = '33333333-4444-5555-6666-777777777777';
const LISTING_FOTBALL = '44444444-5555-6666-7777-888888888888';
const LISTING_KLUBBHUS = '55555555-6666-7777-8888-999999999999';
const LISTING_DEMO = '66666666-7777-8888-9999-aaaaaaaaaaaa';

// ============================================================================
// Seed Data
// ============================================================================

const TENANTS = [
  {
    id: TENANT_SKIEN,
    name: 'Skien Kommune',
    slug: 'skien-kommune',
    domain: 'skien.digilist.no',
    status: 'active',
    settings: {
      features: { rbac: true, auditLogs: true, invitations: true },
      branding: { primaryColor: '#1E40AF', name: 'Skien Kommune' },
    },
  },
  {
    id: TENANT_PORSGRUNN,
    name: 'Porsgrunn Idrettslag',
    slug: 'porsgrunn-il',
    domain: null,
    status: 'active',
    settings: {
      features: { rbac: true, auditLogs: true },
      branding: { primaryColor: '#059669' },
    },
  },
  {
    id: TENANT_DEMO,
    name: 'Demo Organization',
    slug: 'demo-org',
    domain: null,
    status: 'active',
    settings: {},
  },
];

const ORGANIZATIONS = [
  {
    id: ORG_SKIEN_HALL,
    tenantId: TENANT_SKIEN,
    name: 'Skien Idrettshall',
    slug: 'skien-idrettshall',
    type: 'sports_facility',
    status: 'active',
  },
  {
    id: ORG_KULTURHUS,
    tenantId: TENANT_SKIEN,
    name: 'Skien Kulturhus',
    slug: 'skien-kulturhus',
    type: 'cultural_center',
    status: 'active',
  },
  {
    id: ORG_PORSGRUNN,
    tenantId: TENANT_PORSGRUNN,
    name: 'Porsgrunn IL Hovedklubb',
    slug: 'porsgrunn-il-hovedklubb',
    type: 'sports_club',
    status: 'active',
  },
  {
    id: ORG_UNGDOMSKLUBB,
    tenantId: TENANT_SKIEN,
    name: 'Skien Ungdomsklubb',
    slug: 'skien-ungdomsklubb',
    type: 'youth_organization',
    status: 'active',
  },
  {
    id: ORG_DEMO,
    tenantId: TENANT_DEMO,
    name: 'Demo Facility',
    slug: 'demo-facility',
    type: 'other',
    status: 'active',
  },
];

const USERS = [
  {
    id: USER_ADMIN,
    tenantId: TENANT_SKIEN,
    organizationId: ORG_SKIEN_HALL,
    email: 'admin@skien.kommune.no',
    name: 'Kari Nordmann',
    role: 'admin',
    status: 'active',
  },
  {
    id: USER_MANAGER,
    tenantId: TENANT_SKIEN,
    organizationId: ORG_SKIEN_HALL,
    email: 'manager@skien.kommune.no',
    name: 'Ole Jensen',
    role: 'manager',
    status: 'active',
  },
  {
    id: USER_STAFF,
    tenantId: TENANT_SKIEN,
    organizationId: ORG_KULTURHUS,
    email: 'staff@skien.kommune.no',
    name: 'Anna Hansen',
    role: 'staff',
    status: 'active',
  },
  {
    id: USER_PIL_ADMIN,
    tenantId: TENANT_PORSGRUNN,
    organizationId: ORG_PORSGRUNN,
    email: 'leder@porsgrunn-il.no',
    name: 'Erik Larsen',
    role: 'admin',
    status: 'active',
  },
  {
    id: USER_PIL_MEMBER,
    tenantId: TENANT_PORSGRUNN,
    organizationId: ORG_PORSGRUNN,
    email: 'medlem@porsgrunn-il.no',
    name: 'Lisa Berg',
    role: 'member',
    status: 'active',
  },
  {
    id: USER_DEMO,
    tenantId: TENANT_DEMO,
    organizationId: ORG_DEMO,
    email: 'demo@xala.no',
    name: 'Demo User',
    role: 'admin',
    status: 'active',
  },
  // Minside test user - citizen
  {
    id: USER_OLA_HANSEN,
    tenantId: TENANT_SKIEN,
    organizationId: ORG_SKIEN_HALL,
    email: 'ola.hansen@kommune.no',
    name: 'Ola Hansen',
    role: 'user',
    status: 'active',
  },
];

const SUBSCRIPTIONS = [
  {
    tenantId: TENANT_SKIEN,
    plan: 'enterprise',
    status: 'active',
    currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  },
  {
    tenantId: TENANT_PORSGRUNN,
    plan: 'pro',
    status: 'active',
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  },
  {
    tenantId: TENANT_DEMO,
    plan: 'free',
    status: 'active',
  },
];

const LISTINGS = [
  {
    id: LISTING_HALL_A,
    tenantId: TENANT_SKIEN,
    organizationId: ORG_SKIEN_HALL,
    name: 'Hall A - Hovedhall',
    slug: 'hall-a-hovedhall',
    type: 'SPACE',
    status: 'published',
    description: 'Stor idrettshall for håndball, basketball og arrangementer. 1200 m². Moderne gulv, elektronisk måltavle og fullverdig tribuneanlegg.',
    capacity: 500,
    pricing: { basePrice: 1500, currency: 'NOK', unit: 'hour' },
    images: [
      'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=1200&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
      'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=1200&q=80',
      'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=1200&q=80',
    ],
    metadata: {
      location: { address: 'Idrettsveien 1', postalCode: '3724', city: 'Skien', country: 'Norway' },
      contactName: 'Kari Nordmann',
      contactEmail: 'booking@skien-idrettshall.no',
      contactPhone: '+47 35 58 20 00',
      amenities: ['changing_rooms', 'showers', 'parking', 'scoreboard', 'tribune'],
      faq: [
        { question: 'Hva er gulvtypen?', answer: 'Sportsgulv av høy kvalitet, godkjent for konkurranser på nasjonalt nivå.' },
        { question: 'Kan jeg leie hallen til arrangement?', answer: 'Ja, hallen kan leies til konserter, messer og andre arrangementer. Kontakt oss for tilbud.' },
        { question: 'Er det tribuneplass?', answer: 'Ja, tribunen har plass til 500 tilskuere med gode siktlinjer.' },
        { question: 'Finnes det garderober?', answer: 'Det er 4 garderober med dusjer, totalt kapasitet for 100 personer.' },
        { question: 'Hvordan er parkeringsmulighetene?', answer: 'Gratis parkering for 150 biler rett utenfor hallen.' },
        { question: 'Er det WiFi?', answer: 'Ja, gratis høyhastighets WiFi er tilgjengelig i hele anlegget.' },
      ],
      rules: [
        { icon: 'shoe', text: 'Kun innendørssko med lyse såler tillatt' },
        { icon: 'food', text: 'Mat og drikke kun i fellesområder' },
        { icon: 'clock', text: 'Lokalet må forlates senest 30 min etter leietid' },
        { icon: 'trash', text: 'Leietaker er ansvarlig for opprydding' },
        { icon: 'volume', text: 'Musikk og høy lyd tillatt til kl. 22:00' },
        { icon: 'fire', text: 'Røyking og åpen ild er forbudt' },
      ],
    },
  },
  {
    id: LISTING_HALL_B,
    tenantId: TENANT_SKIEN,
    organizationId: ORG_SKIEN_HALL,
    name: 'Hall B - Treningshall',
    slug: 'hall-b-treningshall',
    type: 'SPACE',
    status: 'published',
    description: 'Mindre treningshall for gymnastikk og kampsport. 400 m². Speilvegg og matter tilgjengelig.',
    capacity: 100,
    pricing: { basePrice: 800, currency: 'NOK', unit: 'hour' },
    images: [
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80',
      'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1200&q=80',
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&q=80',
    ],
    metadata: {
      location: { address: 'Idrettsveien 1', postalCode: '3724', city: 'Skien', country: 'Norway' },
      contactName: 'Ole Jensen',
      contactEmail: 'booking@skien-idrettshall.no',
      contactPhone: '+47 35 58 20 01',
      amenities: ['changing_rooms', 'showers', 'mirrors', 'mats', 'sound_system'],
      faq: [
        { question: 'Er matter inkludert?', answer: 'Ja, gymnastikkmatter og kampsportmatter er inkludert i prisen.' },
        { question: 'Kan jeg bruke eget lydanlegg?', answer: 'Ja, men vi har også et integrert lydanlegg med Bluetooth-tilkobling.' },
        { question: 'Er det speilvegg?', answer: 'Ja, hele den ene veggen er dekket med speil, perfekt for dans og aerobics.' },
        { question: 'Hva er gulvtypen?', answer: 'Mykt sportsgulv ideelt for gymnastikk, yoga og kampsporter.' },
        { question: 'Kan jeg lagre utstyr?', answer: 'Nei, alt utstyr må tas med etter hver økt.' },
      ],
      rules: [
        { icon: 'shoe', text: 'Bare treningstøy eller kampsportbekledning' },
        { icon: 'barefoot', text: 'Barbeint eller inner sko på matter' },
        { icon: 'clean', text: 'Rengjør matter etter bruk' },
        { icon: 'food', text: 'Kun vann tillatt i hallen' },
        { icon: 'clock', text: 'Oppmøte minst 5 min før leietid' },
        { icon: 'volume', text: 'Moderat musikkvolum' },
      ],
    },
  },
  {
    id: LISTING_MEETING,
    tenantId: TENANT_SKIEN,
    organizationId: ORG_SKIEN_HALL,
    name: 'Møterom 1',
    slug: 'moterom-1',
    type: 'SPACE',
    status: 'published',
    description: 'Moderne møterom med projektor og whiteboard. Perfekt for styremøter og presentasjoner.',
    capacity: 20,
    pricing: { basePrice: 300, currency: 'NOK', unit: 'hour' },
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80',
      'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=1200&q=80',
      'https://images.unsplash.com/photo-1462826303086-329426d1aef5?w=1200&q=80',
      'https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=1200&q=80',
    ],
    metadata: {
      location: { address: 'Idrettsveien 1', postalCode: '3724', city: 'Skien', country: 'Norway' },
      contactName: 'Anna Hansen',
      contactEmail: 'moterom@skien-idrettshall.no',
      contactPhone: '+47 35 58 20 02',
      amenities: ['projector', 'whiteboard', 'video_conference', 'wifi', 'coffee'],
      faq: [
        { question: 'Er det projektor?', answer: 'Ja, 4K-projektor med HDMI og trådløs tilkobling er inkludert.' },
        { question: 'Kan jeg bestille catering?', answer: 'Ja, vi samarbeider med lokal cateringpartner. Bestill minst 24 timer i forveien.' },
        { question: 'Er det videokonferanseutstyr?', answer: 'Ja, rommet har kamera og mikrofon for Teams/Zoom-møter.' },
        { question: 'Finnes det whiteboard?', answer: 'Ja, stor whiteboard med tusjer og viskelær er tilgjengelig.' },
        { question: 'Er kaffe inkludert?', answer: 'Kaffe og te kan bestilles som tillegstjeneste.' },
      ],
      rules: [
        { icon: 'clock', text: 'Avbestilling senest 24 timer før' },
        { icon: 'clean', text: 'La rommet være ryddig ved avreise' },
        { icon: 'trash', text: 'Kast søppel i riktige beholdere' },
        { icon: 'volume', text: 'Respekter nabomøter - moderat lydnivå' },
        { icon: 'food', text: 'Mat tillatt, men rydd opp etter deg' },
      ],
      additionalServices: [
        { name: 'Kaffe og te', price: 50, currency: 'NOK' },
        { name: 'Lunch catering', price: 200, currency: 'NOK' },
      ],
    },
  },
  {
    id: LISTING_SCENE,
    tenantId: TENANT_SKIEN,
    organizationId: ORG_KULTURHUS,
    name: 'Hovedscene',
    slug: 'hovedscene',
    type: 'SPACE',
    status: 'published',
    description: 'Profesjonell scene med lyd- og lysanlegg. 800 sitteplasser. Perfekt for konserter, teater og store arrangementer.',
    capacity: 800,
    pricing: { basePrice: 5000, currency: 'NOK', unit: 'day' },
    images: [
      'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=1200&q=80',
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&q=80',
      'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=1200&q=80',
      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=80',
    ],
    metadata: {
      location: { address: 'Kulturhusgata 5', postalCode: '3724', city: 'Skien', country: 'Norway' },
      contactName: 'Erik Johansen',
      contactEmail: 'scene@skien-kulturhus.no',
      contactPhone: '+47 35 58 30 00',
      amenities: ['stage', 'lighting', 'sound_system', 'backstage', 'greenroom', 'parking'],
      stageSpecs: { width: 15, depth: 10, height: 8, rigging: true },
      faq: [
        { question: 'Er tekniker inkludert?', answer: 'Nei, tekniker kan leies som tilleggstjeneste til 3000 kr/dag.' },
        { question: 'Kan jeg bruke eget lyd/lys?', answer: 'Ja, men våre teknikere må godkjenne oppsettet av sikkerhetshensyn.' },
        { question: 'Finnes det backstage?', answer: 'Ja, 3 garderober med speil, kjøleskap og WiFi.' },
        { question: 'Hva er scenebredden?', answer: 'Scenen er 15 meter bred, 10 meter dyp og 8 meter høy.' },
        { question: 'Er det flygel?', answer: 'Ja, Steinway konsertflygel kan leies for 2000 kr.' },
        { question: 'Har dere riggepunkter?', answer: 'Ja, 24 riggepunkter med max 500 kg kapasitet hver.' },
      ],
      rules: [
        { icon: 'fire', text: 'Pyroteknikk kun etter godkjenning fra brannvesen' },
        { icon: 'volume', text: 'Max 105 dB på publikumsplass' },
        { icon: 'clock', text: 'Rigging/nedrigg avtales på forhånd' },
        { icon: 'security', text: 'Vakthold påkrevd ved publikumsarrangementer' },
        { icon: 'alcohol', text: 'Alkoholservering krever skjenkebevilling' },
        { icon: 'age', text: 'Aldersgrense bestemmes av arrangør' },
      ],
      additionalServices: [
        { name: 'Tekniker (dag)', price: 3000, currency: 'NOK' },
        { name: 'Flygel', price: 2000, currency: 'NOK' },
      ],
    },
  },
  {
    id: LISTING_STUDIO,
    tenantId: TENANT_SKIEN,
    organizationId: ORG_KULTURHUS,
    name: 'Øvingsstudio',
    slug: 'ovingsstudio',
    type: 'SPACE',
    status: 'published',
    description: 'Lydtett studio for band og musikkøving. Backline inkludert med trommer, forsterker og PA.',
    capacity: 10,
    pricing: { basePrice: 200, currency: 'NOK', unit: 'hour' },
    images: [
      'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&q=80',
      'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=1200&q=80',
      'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=1200&q=80',
    ],
    metadata: {
      location: { address: 'Kulturhusgata 5', postalCode: '3724', city: 'Skien', country: 'Norway' },
      contactName: 'Lisa Berg',
      contactEmail: 'studio@skien-kulturhus.no',
      contactPhone: '+47 35 58 30 01',
      amenities: ['soundproof', 'drums', 'amplifiers', 'pa_system', 'recording'],
      studioSpecs: { sqm: 40, soundproofing: 'Professional', backline: true },
      faq: [
        { question: 'Hva er inkludert?', answer: 'Trommesett, gitarforsterker, bassforsterker, PA med mikrofoner.' },
        { question: 'Kan jeg ta opptak?', answer: 'Ja, enkelt opptaksutstyr er tilgjengelig. Profesjonelt studio kan bookes separat.' },
        { question: 'Er rommet lydtett?', answer: 'Ja, profesjonell lydisolering - spill så høyt du vil!' },
        { question: 'Finnes det keyboard?', answer: 'Nei, keyboard må medbringes. Vi har keyboardstativ.' },
        { question: 'Hva med cymbaler?', answer: 'Cymbaler er inkludert, men du kan gjerne bruke egne.' },
      ],
      rules: [
        { icon: 'volume', text: 'Ingen begrensning på lydnivå inne i studio' },
        { icon: 'clock', text: 'Avslutt punktlig - andre venter' },
        { icon: 'clean', text: 'Rydd bort kabler og mikrofoner etter bruk' },
        { icon: 'equipment', text: 'Rapporter skader umiddelbart' },
        { icon: 'food', text: 'Mat og drikke kun i loungeområdet' },
      ],
    },
  },
  {
    id: LISTING_PROJECTOR,
    tenantId: TENANT_SKIEN,
    organizationId: ORG_KULTURHUS,
    name: 'Projektor (4K)',
    slug: 'projektor-4k',
    type: 'RESOURCE',
    status: 'published',
    description: 'Epson 4K-projektor for presentasjoner og film. 5000 lumen, HDMI og trådløs tilkobling.',
    capacity: 1,
    pricing: { basePrice: 500, currency: 'NOK', unit: 'day' },
    images: [
      'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=1200&q=80',
      'https://images.unsplash.com/photo-1606676539940-12768ce0e762?w=1200&q=80',
      'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=1200&q=80',
    ],
    metadata: {
      contactName: 'Teknisk avdeling',
      contactEmail: 'utstyr@skien-kulturhus.no',
      contactPhone: '+47 35 58 30 10',
      equipmentSpecs: { brand: 'Epson', resolution: '4K', lumens: 5000, connections: ['HDMI', 'USB-C', 'Wireless'] },
      faq: [
        { question: 'Hva er oppløsningen?', answer: '4K UHD (3840x2160), perfekt for film og presentasjoner.' },
        { question: 'Er lerret inkludert?', answer: 'Nei, lerret kan leies separat eller bruk egen vegg.' },
        { question: 'Hvordan kobler jeg til?', answer: 'HDMI-kabel inkludert. Trådløs via AirPlay eller Miracast.' },
        { question: 'Hvor kraftig er den?', answer: '5000 lumen - egnet for rom med dagslys.' },
        { question: 'Får jeg opplæring?', answer: 'Ja, kort opplæring ved henting.' },
      ],
      rules: [
        { icon: 'careful', text: 'Håndter forsiktig - verdifullt utstyr' },
        { icon: 'transport', text: 'Bruk medfølgende bag ved transport' },
        { icon: 'clean', text: 'Ikke rør linsen - bruk linseklut' },
        { icon: 'clock', text: 'Returner innen avtalt tid' },
        { icon: 'damage', text: 'Skader faktureres leietaker' },
      ],
    },
  },
  {
    id: LISTING_PA,
    tenantId: TENANT_SKIEN,
    organizationId: ORG_KULTURHUS,
    name: 'PA-anlegg',
    slug: 'pa-anlegg',
    type: 'RESOURCE',
    status: 'published',
    description: 'Komplett PA-anlegg med mikser, høyttalere og mikrofoner. Egnet for arrangementer opp til 200 personer.',
    capacity: 1,
    pricing: { basePrice: 1000, currency: 'NOK', unit: 'day' },
    images: [
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&q=80',
      'https://images.unsplash.com/photo-1558584673-c834fb1cc3b1?w=1200&q=80',
      'https://images.unsplash.com/photo-1598517836719-3cbc2e90a535?w=1200&q=80',
      'https://images.unsplash.com/photo-1571327073757-e928898c02f8?w=1200&q=80',
    ],
    metadata: {
      contactName: 'Teknisk avdeling',
      contactEmail: 'utstyr@skien-kulturhus.no',
      contactPhone: '+47 35 58 30 10',
      equipmentSpecs: { type: 'PA System', power: '2000W', channels: 16, includes: ['Mixer', 'Speakers', 'Microphones', 'Cables'] },
      faq: [
        { question: 'Hva er inkludert?', answer: 'Mikser (16 kanaler), 2x høyttalere, 2x subwoofer, 4 mikrofoner, alle kabler.' },
        { question: 'Hvor mange personer dekker det?', answer: 'Egnet for arrangementer med opp til 200 personer innendørs.' },
        { question: 'Får jeg opplæring?', answer: 'Ja, 15 min grunnopplæring ved henting.' },
        { question: 'Kan jeg koble til laptop?', answer: 'Ja, via minijack eller Bluetooth.' },
        { question: 'Trenger jeg tekniker?', answer: 'Enkle oppsett er DIY-vennlige. Større events anbefales tekniker.' },
      ],
      rules: [
        { icon: 'transport', text: 'Hentes og leveres i våre lokaler' },
        { icon: 'careful', text: 'Ikke utsett for regn eller fukt' },
        { icon: 'volume', text: 'Følg lokale støyforskrifter' },
        { icon: 'clock', text: 'Retur innen kl. 12 dagen etter' },
        { icon: 'check', text: 'Sjekk at alt utstyr returneres komplett' },
      ],
    },
  },
  {
    id: LISTING_FOTBALL,
    tenantId: TENANT_PORSGRUNN,
    organizationId: ORG_PORSGRUNN,
    name: 'Fotballbane - Kunstgress',
    slug: 'fotballbane-kunstgress',
    type: 'SPACE',
    status: 'published',
    description: 'Full størrelse kunstgressbane med flomlys. FIFA-godkjent underlag. Garderober og kafeteria på området.',
    capacity: 30,
    pricing: { basePrice: 1200, currency: 'NOK', unit: 'hour' },
    images: [
      'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=1200&q=80',
      'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1200&q=80',
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=80',
      'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=1200&q=80',
    ],
    metadata: {
      location: { address: 'Stadionveien 15', postalCode: '3933', city: 'Porsgrunn', country: 'Norway' },
      contactName: 'Erik Larsen',
      contactEmail: 'booking@porsgrunn-il.no',
      contactPhone: '+47 35 55 10 00',
      amenities: ['changing_rooms', 'showers', 'floodlights', 'cafe', 'parking'],
      pitchSpecs: { surface: 'FIFA Quality Pro', size: '105x68m', floodlights: true },
      faq: [
        { question: 'Er ballen inkludert?', answer: 'Nei, ta med egen ball. Baller kan kjøpes i cafeen.' },
        { question: 'Når slås flomlyset på?', answer: 'Automatisk ved mørkets frembrudd, slukkes ved leietidens slutt.' },
        { question: 'Finnes det garderober?', answer: 'Ja, 4 garderober med dusjer og toaletter.' },
        { question: 'Kan jeg leie halv bane?', answer: 'Ja, banen kan deles på tvers for 600 kr/time.' },
        { question: 'Er det lov med metallknotter?', answer: 'Nei, kun gummi- eller plastknotter for å beskytte kunstgresset.' },
        { question: 'Hva skjer ved regn?', answer: 'Banen har god drenering og kan brukes i de fleste værforhold.' },
      ],
      rules: [
        { icon: 'shoe', text: 'Kun gummi/plastknotter - ikke metall' },
        { icon: 'food', text: 'Mat og drikke kun i kafeteriaen' },
        { icon: 'trash', text: 'Ingen søppel på banen' },
        { icon: 'dog', text: 'Hunder ikke tillatt på banen' },
        { icon: 'gate', text: 'Lås porten etter bruk kveldstid' },
        { icon: 'respect', text: 'Respekter naboer - dempe lyd etter kl. 22' },
      ],
    },
  },
  {
    id: LISTING_KLUBBHUS,
    tenantId: TENANT_PORSGRUNN,
    organizationId: ORG_PORSGRUNN,
    name: 'Klubbhus',
    slug: 'klubbhus',
    type: 'SPACE',
    status: 'published',
    description: 'Koselig klubbhus med kjøkken og møterom. Perfekt for årsmøter, feiringer og sosiale arrangementer.',
    capacity: 50,
    pricing: { basePrice: 600, currency: 'NOK', unit: 'hour' },
    images: [
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80',
      'https://images.unsplash.com/photo-1564078516393-cf04bd966897?w=1200&q=80',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80',
    ],
    metadata: {
      location: { address: 'Stadionveien 15', postalCode: '3933', city: 'Porsgrunn', country: 'Norway' },
      contactName: 'Erik Larsen',
      contactEmail: 'booking@porsgrunn-il.no',
      contactPhone: '+47 35 55 10 00',
      amenities: ['kitchen', 'meeting_room', 'wifi', 'projector', 'handicap_access'],
      faq: [
        { question: 'Hva finnes på kjøkkenet?', answer: 'Komfyr, kjøleskap, oppvaskmaskin, kaffetrakter og grunnleggende bestikk.' },
        { question: 'Kan jeg servere alkohol?', answer: 'Ja, men du trenger skjenkebevilling for salg. Privat servering er OK.' },
        { question: 'Er det grill?', answer: 'Ja, gassgrill på uteområdet. Grillkull må medbringes for kullgrill.' },
        { question: 'Finnes det lydanlegg?', answer: 'Enkelt Bluetooth-høyttaler. Større PA kan leies.' },
        { question: 'Hva med rengjøring?', answer: 'Du må rydde og vaske etter bruk. Renholdsutstyr finnes.' },
      ],
      rules: [
        { icon: 'clean', text: 'Rengjør kjøkken og lokale etter bruk' },
        { icon: 'trash', text: 'Søppel kastes i containere ute' },
        { icon: 'volume', text: 'Musikk kun til kl. 23:00' },
        { icon: 'fire', text: 'Røyking kun på uteområdet' },
        { icon: 'door', text: 'Lås alle dører ved avreise' },
        { icon: 'alcohol', text: 'Ansvarlig alkoholservering' },
      ],
    },
  },
  {
    id: LISTING_DEMO,
    tenantId: TENANT_DEMO,
    organizationId: ORG_DEMO,
    name: 'Demo Hall',
    slug: 'demo-hall',
    type: 'SPACE',
    status: 'published',
    description: 'Demo facility for testing all booking features.',
    capacity: 100,
    pricing: { basePrice: 0, currency: 'NOK', unit: 'hour' },
    images: [
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80',
      'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200&q=80',
      'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=1200&q=80',
    ],
    metadata: {
      location: { address: 'Demo Street 1', postalCode: '0000', city: 'Oslo', country: 'Norway' },
      contactName: 'Demo Support',
      contactEmail: 'demo@xala.no',
      contactPhone: '+47 22 00 00 00',
      amenities: ['demo', 'testing', 'wifi', 'projector'],
      faq: [
        { question: 'Hva er dette?', answer: 'Dette er en demo-oppføring for å teste alle funksjoner.' },
        { question: 'Er det gratis?', answer: 'Ja, demo-oppføringer har ingen pris.' },
        { question: 'Kan jeg booke dette?', answer: 'Ja, du kan teste hele bookingflyten.' },
        { question: 'Blir det registrert?', answer: 'Ja, bookinger vises i systemet.' },
        { question: 'Hvem kontakter jeg?', answer: 'Demo bruker epostadresse demo@xala.no.' },
      ],
      rules: [
        { icon: 'demo', text: 'Dette er kun for testing' },
        { icon: 'info', text: 'Ingen reell booking blir opprettet' },
        { icon: 'test', text: 'Alle funksjoner kan testes fritt' },
        { icon: 'safe', text: 'Ingen betalingsinformasjon lagres' },
        { icon: 'help', text: 'Kontakt support ved spørsmål' },
      ],
    },
  },
];

// Collect listing and user IDs for bookings
const LISTING_IDS = [LISTING_HALL_A, LISTING_HALL_B, LISTING_MEETING, LISTING_SCENE, LISTING_STUDIO];
const USER_IDS = [USER_ADMIN, USER_MANAGER, USER_STAFF];

// Generate bookings with proper UUIDs
function generateUUID(index: number, prefix: string): string {
  const hex = index.toString(16).padStart(4, '0');
  return `${prefix}${hex}-0000-4000-8000-000000000000`;
}

// ============================================================================
// Ola Hansen's Bookings (Minside Testing) - 8 bookings with varied statuses
// ============================================================================
function generateOlaBookings() {
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;
  const HOUR = 60 * 60 * 1000;

  const getTime = (daysOffset: number, hour: number) => {
    const time = new Date(now + daysOffset * DAY);
    time.setHours(hour, 0, 0, 0);
    return time;
  };

  return [
    // 1. Confirmed - Tomorrow 10:00-12:00 (paid)
    {
      id: BOOKING_OLA_1,
      tenantId: TENANT_SKIEN,
      listingId: LISTING_HALL_A,
      userId: USER_OLA_HANSEN,
      status: 'confirmed',
      startTime: getTime(1, 10),
      endTime: getTime(1, 12),
      totalPrice: '450.00',
      currency: 'NOK',
      metadata: { paymentStatus: 'paid', paymentMethod: 'card' },
    },
    // 2. Confirmed - +4 days 14:00-16:00 (paid)
    {
      id: BOOKING_OLA_2,
      tenantId: TENANT_SKIEN,
      listingId: LISTING_HALL_A,
      userId: USER_OLA_HANSEN,
      status: 'confirmed',
      startTime: getTime(4, 14),
      endTime: getTime(4, 16),
      totalPrice: '450.00',
      currency: 'NOK',
      metadata: { paymentStatus: 'paid', paymentMethod: 'card' },
    },
    // 3. Confirmed - +7 days 18:00-20:00 (paid)
    {
      id: BOOKING_OLA_3,
      tenantId: TENANT_SKIEN,
      listingId: LISTING_HALL_A,
      userId: USER_OLA_HANSEN,
      status: 'confirmed',
      startTime: getTime(7, 18),
      endTime: getTime(7, 20),
      totalPrice: '450.00',
      currency: 'NOK',
      metadata: { paymentStatus: 'paid', paymentMethod: 'card' },
    },
    // 4. Pending - +10 days 09:00-11:00 (unpaid)
    {
      id: BOOKING_OLA_4,
      tenantId: TENANT_SKIEN,
      listingId: LISTING_HALL_A,
      userId: USER_OLA_HANSEN,
      status: 'pending',
      startTime: getTime(10, 9),
      endTime: getTime(10, 11),
      totalPrice: '450.00',
      currency: 'NOK',
      metadata: { paymentStatus: 'unpaid' },
    },
    // 5. Pending - +14 days 14:00-16:00 (unpaid)
    {
      id: BOOKING_OLA_5,
      tenantId: TENANT_SKIEN,
      listingId: LISTING_HALL_A,
      userId: USER_OLA_HANSEN,
      status: 'pending',
      startTime: getTime(14, 14),
      endTime: getTime(14, 16),
      totalPrice: '450.00',
      currency: 'NOK',
      metadata: { paymentStatus: 'unpaid' },
    },
    // 6. Completed - -7 days 10:00-12:00 (paid)
    {
      id: BOOKING_OLA_6,
      tenantId: TENANT_SKIEN,
      listingId: LISTING_HALL_A,
      userId: USER_OLA_HANSEN,
      status: 'completed',
      startTime: getTime(-7, 10),
      endTime: getTime(-7, 12),
      totalPrice: '450.00',
      currency: 'NOK',
      metadata: { paymentStatus: 'paid', paymentMethod: 'card' },
    },
    // 7. Completed - -3 days 16:00-18:00 (paid)
    {
      id: BOOKING_OLA_7,
      tenantId: TENANT_SKIEN,
      listingId: LISTING_HALL_A,
      userId: USER_OLA_HANSEN,
      status: 'completed',
      startTime: getTime(-3, 16),
      endTime: getTime(-3, 18),
      totalPrice: '450.00',
      currency: 'NOK',
      metadata: { paymentStatus: 'paid', paymentMethod: 'card' },
    },
    // 8. Cancelled - -1 day 18:00-20:00 (refunded)
    {
      id: BOOKING_OLA_8,
      tenantId: TENANT_SKIEN,
      listingId: LISTING_HALL_A,
      userId: USER_OLA_HANSEN,
      status: 'cancelled',
      startTime: getTime(-1, 18),
      endTime: getTime(-1, 20),
      totalPrice: '450.00',
      currency: 'NOK',
      notes: 'Kansellert pga dårlig vær. Full refusjon gitt.',
      metadata: { paymentStatus: 'refunded', cancellationReason: 'weather' },
    },
  ];
}

function generateBookings() {
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;
  const HOUR = 60 * 60 * 1000;
  const bookings = [];

  // Past bookings (completed) - for other users
  for (let i = 0; i < 10; i++) {
    const daysAgo = Math.floor(Math.random() * 7) + 1;
    const startHour = 9 + Math.floor(Math.random() * 8);
    const start = new Date(now - daysAgo * DAY);
    start.setHours(startHour, 0, 0, 0);
    const end = new Date(start.getTime() + (1 + Math.floor(Math.random() * 3)) * HOUR);

    bookings.push({
      id: generateUUID(i, 'b00c'),
      tenantId: TENANT_SKIEN,
      listingId: LISTING_IDS[Math.floor(Math.random() * LISTING_IDS.length)],
      userId: USER_IDS[Math.floor(Math.random() * USER_IDS.length)],
      status: 'completed',
      startTime: start,
      endTime: end,
      totalPrice: (500 + Math.random() * 2000).toFixed(2),
      currency: 'NOK',
    });
  }

  // Upcoming bookings (confirmed) - for other users
  for (let i = 0; i < 10; i++) {
    const daysAhead = Math.floor(Math.random() * 7) + 1;
    const startHour = 9 + Math.floor(Math.random() * 8);
    const start = new Date(now + daysAhead * DAY);
    start.setHours(startHour, 0, 0, 0);
    const end = new Date(start.getTime() + (1 + Math.floor(Math.random() * 3)) * HOUR);

    bookings.push({
      id: generateUUID(i + 10, 'b00d'),
      tenantId: TENANT_SKIEN,
      listingId: LISTING_IDS[Math.floor(Math.random() * LISTING_IDS.length)],
      userId: USER_IDS[Math.floor(Math.random() * USER_IDS.length)],
      status: 'confirmed',
      startTime: start,
      endTime: end,
      totalPrice: (500 + Math.random() * 2000).toFixed(2),
      currency: 'NOK',
    });
  }

  // Add Ola Hansen's bookings
  bookings.push(...generateOlaBookings());

  return bookings;
}

// ============================================================================
// Ola Hansen's Conversations & Messages
// ============================================================================
function generateConversations() {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);

  return [
    // Conversation 1: Booking question (completed)
    {
      id: CONV_BOOKING_QUESTION,
      tenantId: TENANT_SKIEN,
      userId: USER_OLA_HANSEN,
      bookingId: BOOKING_OLA_1,
      subject: 'Spørsmål om Hall A booking',
      status: 'active',
      unreadCount: 0,
      lastMessageAt: yesterday,
      createdAt: twoDaysAgo,
      updatedAt: yesterday,
    },
    // Conversation 2: Weekend availability (has unread)
    {
      id: CONV_WEEKEND_AVAILABILITY,
      tenantId: TENANT_SKIEN,
      userId: USER_OLA_HANSEN,
      subject: 'Tilgjengelighet helgen',
      status: 'active',
      unreadCount: 1, // 1 unread message from admin
      lastMessageAt: now,
      createdAt: yesterday,
      updatedAt: now,
    },
    // Conversation 3: Weather cancellation (completed)
    {
      id: CONV_WEATHER_CANCEL,
      tenantId: TENANT_SKIEN,
      userId: USER_OLA_HANSEN,
      bookingId: BOOKING_OLA_8,
      subject: 'Kansellering pga vær',
      status: 'closed',
      unreadCount: 0,
      lastMessageAt: fiveDaysAgo,
      createdAt: fiveDaysAgo,
      updatedAt: fiveDaysAgo,
    },
  ];
}

function generateMessages() {
  const now = Date.now();
  const MINUTE = 60 * 1000;
  const HOUR = 60 * MINUTE;
  const DAY = 24 * HOUR;

  const msgId = (index: number) => generateUUID(index, 'a0a1');

  return [
    // Conversation 1: Booking question
    {
      id: msgId(1),
      conversationId: CONV_BOOKING_QUESTION,
      senderType: 'user',
      senderId: USER_OLA_HANSEN,
      content: 'Hei! Jeg lurer på om det er mulig å forlenge bookingen min med en time?',
      createdAt: new Date(now - 2 * DAY),
      readAt: new Date(now - 2 * DAY + 30 * MINUTE),
    },
    {
      id: msgId(2),
      conversationId: CONV_BOOKING_QUESTION,
      senderType: 'admin',
      senderId: USER_ADMIN,
      content: 'Hei Ola! Ja, det er mulig. Ønsker du at jeg oppdaterer bookingen?',
      createdAt: new Date(now - 2 * DAY + 35 * MINUTE),
      readAt: new Date(now - 2 * DAY + 40 * MINUTE),
    },
    {
      id: msgId(3),
      conversationId: CONV_BOOKING_QUESTION,
      senderType: 'user',
      senderId: USER_OLA_HANSEN,
      content: 'Ja, det hadde vært fantastisk! Kan du bekrefte totalprisen?',
      createdAt: new Date(now - 2 * DAY + 45 * MINUTE),
      readAt: new Date(now - 2 * DAY + 50 * MINUTE),
    },
    {
      id: msgId(4),
      conversationId: CONV_BOOKING_QUESTION,
      senderType: 'admin',
      senderId: USER_ADMIN,
      content: 'Bookingen er oppdatert. Ny totalpris er 675 kr.',
      createdAt: new Date(now - 1 * DAY),
      readAt: new Date(now - 1 * DAY + 10 * MINUTE),
    },
    {
      id: msgId(5),
      conversationId: CONV_BOOKING_QUESTION,
      senderType: 'user',
      senderId: USER_OLA_HANSEN,
      content: 'Takk for rask hjelp! 👍',
      createdAt: new Date(now - 1 * DAY + 15 * MINUTE),
      readAt: new Date(now - 1 * DAY + 20 * MINUTE),
    },
    {
      id: msgId(6),
      conversationId: CONV_BOOKING_QUESTION,
      senderType: 'admin',
      senderId: USER_ADMIN,
      content: 'Bare hyggelig! Alt er klart for din booking.',
      createdAt: new Date(now - 1 * DAY + 25 * MINUTE),
      readAt: new Date(now - 1 * DAY + 30 * MINUTE),
    },

    // Conversation 2: Weekend availability (has unread)
    {
      id: msgId(7),
      conversationId: CONV_WEEKEND_AVAILABILITY,
      senderType: 'user',
      senderId: USER_OLA_HANSEN,
      content: 'Er det ledige tider i helgen?',
      createdAt: new Date(now - 1 * DAY),
      readAt: new Date(now - 1 * DAY + 30 * MINUTE),
    },
    {
      id: msgId(8),
      conversationId: CONV_WEEKEND_AVAILABILITY,
      senderType: 'admin',
      senderId: USER_ADMIN,
      content: 'La meg sjekke kalenderen.',
      createdAt: new Date(now - 1 * DAY + 35 * MINUTE),
      readAt: new Date(now - 1 * DAY + 40 * MINUTE),
    },
    {
      id: msgId(9),
      conversationId: CONV_WEEKEND_AVAILABILITY,
      senderType: 'admin',
      senderId: USER_ADMIN,
      content: 'Vi har ledige tider på lørdag! 14:00-16:00 og 16:00-18:00.',
      createdAt: new Date(now - 30 * MINUTE),
      readAt: null, // UNREAD - Ola hasn't seen this yet
    },

    // Conversation 3: Weather cancellation
    {
      id: msgId(10),
      conversationId: CONV_WEATHER_CANCEL,
      senderType: 'user',
      senderId: USER_OLA_HANSEN,
      content: 'Jeg må kansellere bookingen min. Det regner hele dagen.',
      createdAt: new Date(now - 5 * DAY),
      readAt: new Date(now - 5 * DAY + 30 * MINUTE),
    },
    {
      id: msgId(11),
      conversationId: CONV_WEATHER_CANCEL,
      senderType: 'admin',
      senderId: USER_ADMIN,
      content: 'Jeg forstår. Jeg kansellerer nå. Full refusjon siden det er værrelatert.',
      createdAt: new Date(now - 5 * DAY + 35 * MINUTE),
      readAt: new Date(now - 5 * DAY + 40 * MINUTE),
    },
    {
      id: msgId(12),
      conversationId: CONV_WEATHER_CANCEL,
      senderType: 'user',
      senderId: USER_OLA_HANSEN,
      content: 'Når kan jeg forvente refusjonen?',
      createdAt: new Date(now - 5 * DAY + 45 * MINUTE),
      readAt: new Date(now - 5 * DAY + 50 * MINUTE),
    },
    {
      id: msgId(13),
      conversationId: CONV_WEATHER_CANCEL,
      senderType: 'admin',
      senderId: USER_ADMIN,
      content: 'Refusjon er behandlet. 3-5 virkedager.',
      createdAt: new Date(now - 5 * DAY + 55 * MINUTE),
      readAt: new Date(now - 5 * DAY + 60 * MINUTE),
    },
  ];
}

// ============================================================================
// Calendar Allocations (for busy times)
// ============================================================================
function generateAllocations(bookings: any[]) {
  // Create allocations for confirmed bookings to block calendar slots
  return bookings
    .filter((b) => b.status === 'confirmed' && b.userId === USER_OLA_HANSEN)
    .map((booking, index) => ({
      id: generateUUID(index, 'a00b'),
      tenantId: booking.tenantId,
      listingId: booking.listingId,
      bookingId: booking.id,
      userId: booking.userId,
      title: `Booking - ${booking.userId === USER_OLA_HANSEN ? 'Ola Hansen' : 'Bruker'}`,
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: 'confirmed',
      metadata: { source: 'booking' },
    }));
}

// ============================================================================
// Seed Runner
// ============================================================================

async function seed() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    logger.error('❌ DATABASE_URL environment variable is required');
    process.exit(1);
  }

  logger.info('🌱 Starting database seed...\n');

  const sql = postgres(databaseUrl, { max: 1 });
  const db = drizzle(sql, { schema });

  try {
    // Clear existing data (in reverse order of dependencies)
    logger.info('🧹 Clearing existing data...');
    await db.delete(schema.messages);
    await db.delete(schema.conversations);
    await db.delete(schema.allocations);
    await db.delete(schema.usage);
    await db.delete(schema.incidents);
    await db.delete(schema.alerts);
    await db.delete(schema.auditLogs);
    await db.delete(schema.bookings);
    await db.delete(schema.listings);
    await db.delete(schema.subscriptions);
    await db.delete(schema.users);
    await db.delete(schema.organizations);
    await db.delete(schema.tenants);

    // Insert tenants
    logger.info('📦 Inserting tenants...');
    await db.insert(schema.tenants).values(TENANTS);

    // Insert organizations
    logger.info('🏢 Inserting organizations...');
    await db.insert(schema.organizations).values(ORGANIZATIONS);

    // Insert users
    logger.info('👥 Inserting users...');
    await db.insert(schema.users).values(USERS);

    // Insert subscriptions
    logger.info('💳 Inserting subscriptions...');
    await db.insert(schema.subscriptions).values(SUBSCRIPTIONS);

    // Insert listings
    logger.info('📋 Inserting listings...');
    await db.insert(schema.listings).values(LISTINGS);

    // Insert bookings
    logger.info('📅 Inserting bookings...');
    const bookings = generateBookings();
    await db.insert(schema.bookings).values(bookings);

    // Insert conversations for Minside testing
    logger.info('💬 Inserting conversations...');
    const conversations = generateConversations();
    await db.insert(schema.conversations).values(conversations);

    // Insert messages for Minside testing
    logger.info('✉️ Inserting messages...');
    const messages = generateMessages();
    await db.insert(schema.messages).values(messages);

    // Insert allocations for calendar blocking
    logger.info('📆 Inserting allocations...');
    const allocations = generateAllocations(bookings);
    await db.insert(schema.allocations).values(allocations);

    // Count Ola's specific data
    const olaBookings = bookings.filter((b: any) => b.userId === USER_OLA_HANSEN);

    logger.info('\n✅ Seed completed successfully!');
    logger.info(`   - ${TENANTS.length} tenants`);
    logger.info(`   - ${ORGANIZATIONS.length} organizations`);
    logger.info(`   - ${USERS.length} users`);
    logger.info(`   - ${SUBSCRIPTIONS.length} subscriptions`);
    logger.info(`   - ${LISTINGS.length} listings`);
    logger.info(`   - ${bookings.length} bookings (${olaBookings.length} for Ola Hansen)`);
    logger.info(`   - ${conversations.length} conversations`);
    logger.info(`   - ${messages.length} messages`);
    logger.info(`   - ${allocations.length} allocations`);
  } catch (error) {
    logger.error({ error }, '❌ Seed failed');
    process.exit(1);
  } finally {
    await sql.end();
  }
}

seed();
