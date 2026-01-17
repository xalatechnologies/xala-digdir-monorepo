/**
 * Demo Seed - V3 Model Complete
 * 4 Categories + 3 Time Modes + Features + Rule Sets
 * 
 * Seed order:
 * 1. Categories, Time Modes, Features, Rule Sets (seed tables)
 * 2. Tenant + Users
 * 3. Rental Objects (40+)
 * 4. Bookings + Blackouts
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import { tenants, users, rentalObjects, bookings } from '../schema/index';
import { CATEGORIES, TIME_MODES, FEATURES, RULE_SETS } from './data/rental-domain-data';

// =============================================================================
// TENANT CONFIG
// =============================================================================

const DEMO_TENANT = {
  id: 'd0000000-0000-0000-0000-000000000001',
  name: 'Skien Kommune',
  slug: 'skien',
  domain: 'skien.digilist.no',
  status: 'active',
  settings: {},
  featureFlags: {
    'backoffice.orgManagement': true,
    'backoffice.reporting': true,
    'backoffice.auditLog': true,
  },
  enabledRentalObjectCategories: [
    'LOKALER_OG_BANER',
    'UTSTYR_OG_INVENTAR', 
    'KJORETOY_OG_TRANSPORT',
    'OPPLEVELSER_OG_ARRANGEMENT',
  ],
};

const DEMO_USERS = [
  // Demo token users
  { id: 'a0000000-0000-0000-0000-000000000001', email: 'admin@skien.kommune.no', name: 'Admin Skien', role: 'admin', demoToken: 'skien-admin-001' },
  { id: 'a0000000-0000-0000-0000-000000000002', email: 'demo@xala.no', name: 'Demo Xala', role: 'admin', demoToken: 'xala-demo-001' },
  { id: 'a0000000-0000-0000-0000-000000000003', email: 'leder@porsgrunn-il.no', name: 'Leder Porsgrunn IL', role: 'admin', demoToken: 'porsgrunn-admin-001' },
  { id: 'a0000000-0000-0000-0000-000000000004', email: 'ola.hansen@kommune.no', name: 'Ola Hansen', role: 'member', demoToken: 'skien-citizen-001' },
  { id: 'a0000000-0000-0000-0000-000000000005', email: 'staff@skien.kommune.no', name: 'Staff Skien', role: 'case_handler', demoToken: 'skien-staff-001' },

  // Vipps test users
  { id: 'b0000000-0000-0000-0000-000000000001', email: 'vipps.bruker@test.no', name: 'Vipps Bruker', nationalId: '24014005907', role: 'member', metadata: { phone: '95303914', auth_method: 'vipps' } },
  { id: 'b0000000-0000-0000-0000-000000000002', email: 'vipps.admin@test.no', name: 'Vipps Admin', nationalId: '19075716691', role: 'admin', metadata: { phone: '93279034', auth_method: 'vipps' } },
  { id: 'b0000000-0000-0000-0000-000000000003', email: 'vipps.saksbehandler@test.no', name: 'Vipps Saksbehandler', nationalId: '15055200413', role: 'case_handler', metadata: { phone: '46637228', auth_method: 'vipps' } },
  { id: 'b0000000-0000-0000-0000-000000000004', email: 'vipps.organisasjon@test.no', name: 'Vipps Organisasjon', nationalId: '25059995475', role: 'admin', metadata: { phone: '40825303', auth_method: 'vipps' } },
  { id: 'b0000000-0000-0000-0000-000000000005', email: 'vipps.aktor.admin@test.no', name: 'Vipps Aktør Admin', nationalId: '01028731015', role: 'admin', metadata: { phone: '91138813', auth_method: 'vipps', actor_type: 'admin' } },
  { id: 'b0000000-0000-0000-0000-000000000006', email: 'vipps.aktor.utleier@test.no', name: 'Vipps Aktør Utleier', nationalId: '21090295842', role: 'member', metadata: { phone: '98393410', auth_method: 'vipps', actor_type: 'lessor' } },
  { id: 'b0000000-0000-0000-0000-000000000007', email: 'vipps.aktor.saksbehandler@test.no', name: 'Vipps Aktør Saksbehandler', nationalId: '09013039841', role: 'case_handler', metadata: { phone: '47030508', auth_method: 'vipps', actor_type: 'case_handler' } },

  // BankID test users
  { id: 'c0000000-0000-0000-0000-000000000001', email: 'bankid.bruker@test.no', name: 'BankID Bruker', nationalId: '15860771346', role: 'member', metadata: { auth_method: 'bankid' } },
  { id: 'c0000000-0000-0000-0000-000000000002', email: 'bankid.saksbehandler@test.no', name: 'BankID Saksbehandler', nationalId: '06881271913', role: 'case_handler', metadata: { auth_method: 'bankid' } },
  { id: 'c0000000-0000-0000-0000-000000000003', email: 'bankid.admin@test.no', name: 'BankID Admin', nationalId: '30916326773', role: 'admin', metadata: { auth_method: 'bankid' } },
  { id: 'c0000000-0000-0000-0000-000000000004', email: 'bankid.organisasjon@test.no', name: 'BankID Organisasjon', nationalId: '19860324957', role: 'admin', metadata: { auth_method: 'bankid' } },
  { id: 'c0000000-0000-0000-0000-000000000005', email: 'bankid.aktor.admin@test.no', name: 'BankID Aktør Admin', nationalId: '03852358504', role: 'admin', metadata: { auth_method: 'bankid', actor_type: 'admin' } },
  { id: 'c0000000-0000-0000-0000-000000000006', email: 'bankid.aktor.utleier@test.no', name: 'BankID Aktør Utleier', nationalId: '13891199915', role: 'member', metadata: { auth_method: 'bankid', actor_type: 'lessor' } },
  { id: 'c0000000-0000-0000-0000-000000000007', email: 'bankid.aktor.saksbehandler@test.no', name: 'BankID Aktør Saksbehandler', nationalId: '16837147593', role: 'case_handler', metadata: { auth_method: 'bankid', actor_type: 'case_handler' } },
];

// =============================================================================
// RENTAL OBJECTS BY CATEGORY
// =============================================================================

interface RentalObjectSeed {
  name: string;
  timeMode: string;
  ruleSetKey: string;
  capacity?: number;
  features?: string[];
  inventoryTotal?: number;
  requiresApproval?: boolean;
}

const RENTAL_OBJECTS: Record<string, RentalObjectSeed[]> = {
  // LOKALER_OG_BANER (25 objects)
  LOKALER_OG_BANER: [
    // Large venues - PERIOD mode
    { name: 'Kulturhuset - Storsalen', timeMode: 'PERIOD', ruleSetKey: 'RS_LOKALE_STANDARD', capacity: 500 },
    { name: 'Kulturhuset - Lillsalen', timeMode: 'PERIOD', ruleSetKey: 'RS_LOKALE_STANDARD', capacity: 150 },
    { name: 'Rådhussalen', timeMode: 'PERIOD', ruleSetKey: 'RS_LOKALE_STANDARD', capacity: 300 },
    { name: 'Festiviteten - Hovedsal', timeMode: 'PERIOD', ruleSetKey: 'RS_LOKALE_STANDARD', capacity: 400 },
    { name: 'Festiviteten - Kabaret', timeMode: 'PERIOD', ruleSetKey: 'RS_LOKALE_STANDARD', capacity: 100 },
    
    // Sports facilities - SLOT mode
    { name: 'Idrettshallen - Hovedhall', timeMode: 'SLOT', ruleSetKey: 'RS_BANE_SLOT', capacity: 200 },
    { name: 'Idrettshallen - Treningsrom', timeMode: 'SLOT', ruleSetKey: 'RS_BANE_SLOT', capacity: 30 },
    { name: 'Svømmehallen - Hovedbasseng', timeMode: 'SLOT', ruleSetKey: 'RS_BANE_SLOT', capacity: 50 },
    { name: 'Tennisbane 1', timeMode: 'SLOT', ruleSetKey: 'RS_BANE_SLOT', capacity: 4 },
    { name: 'Tennisbane 2', timeMode: 'SLOT', ruleSetKey: 'RS_BANE_SLOT', capacity: 4 },
    { name: 'Padelbane 1', timeMode: 'SLOT', ruleSetKey: 'RS_BANE_SLOT', capacity: 4 },
    { name: 'Padelbane 2', timeMode: 'SLOT', ruleSetKey: 'RS_BANE_SLOT', capacity: 4 },
    
    // Meeting rooms - PERIOD mode
    { name: 'Kommunehuset - Styrerom', timeMode: 'PERIOD', ruleSetKey: 'RS_LOKALE_STANDARD', capacity: 12 },
    { name: 'Kommunehuset - Møterom 1', timeMode: 'PERIOD', ruleSetKey: 'RS_LOKALE_STANDARD', capacity: 8 },
    { name: 'Kommunehuset - Møterom 2', timeMode: 'PERIOD', ruleSetKey: 'RS_LOKALE_STANDARD', capacity: 10 },
    { name: 'Biblioteket - Auditorium', timeMode: 'PERIOD', ruleSetKey: 'RS_LOKALE_STANDARD', capacity: 60 },
    { name: 'Biblioteket - Grupperom A', timeMode: 'PERIOD', ruleSetKey: 'RS_LOKALE_STANDARD', capacity: 8 },
    { name: 'Biblioteket - Grupperom B', timeMode: 'PERIOD', ruleSetKey: 'RS_LOKALE_STANDARD', capacity: 6 },
    
    // Community centers - PERIOD mode all day bookings
    { name: 'Grendehuset Vest', timeMode: 'ALL_DAY', ruleSetKey: 'RS_LOKALE_STANDARD', capacity: 50 },
    { name: 'Grendehuset Øst', timeMode: 'ALL_DAY', ruleSetKey: 'RS_LOKALE_STANDARD', capacity: 45 },
    { name: 'Grendehuset Nord', timeMode: 'ALL_DAY', ruleSetKey: 'RS_LOKALE_STANDARD', capacity: 60 },
    { name: 'Ungdomshuset', timeMode: 'PERIOD', ruleSetKey: 'RS_LOKALE_STANDARD', capacity: 100 },
    
    // Outdoor
    { name: 'Byparken - Paviljong', timeMode: 'PERIOD', ruleSetKey: 'RS_LOKALE_STANDARD', capacity: 80 },
    { name: 'Strandpromenaden - Scene', timeMode: 'ALL_DAY', ruleSetKey: 'RS_LOKALE_STANDARD', capacity: 500 },
    { name: 'Fotballbane - Kunstgress', timeMode: 'SLOT', ruleSetKey: 'RS_BANE_SLOT', capacity: 30 },
  ],

  // UTSTYR_OG_INVENTAR (8 objects with inventory)
  UTSTYR_OG_INVENTAR: [
    { name: 'Partytelt 6x12m', timeMode: 'ALL_DAY', ruleSetKey: 'RS_UTSTYR_HELDAG', features: ['INVENTORY'], inventoryTotal: 3 },
    { name: 'Projektor HD', timeMode: 'ALL_DAY', ruleSetKey: 'RS_UTSTYR_HELDAG', features: ['INVENTORY'], inventoryTotal: 5 },
    { name: 'Lydanlegg PA', timeMode: 'ALL_DAY', ruleSetKey: 'RS_UTSTYR_HELDAG', features: ['INVENTORY'], inventoryTotal: 2 },
    { name: 'Stoler (sett á 50)', timeMode: 'ALL_DAY', ruleSetKey: 'RS_UTSTYR_HELDAG', features: ['INVENTORY'], inventoryTotal: 4 },
    { name: 'Bord 180cm (sett á 10)', timeMode: 'ALL_DAY', ruleSetKey: 'RS_UTSTYR_HELDAG', features: ['INVENTORY'], inventoryTotal: 6 },
    { name: 'Grill - Stor', timeMode: 'ALL_DAY', ruleSetKey: 'RS_UTSTYR_HELDAG', features: ['INVENTORY'], inventoryTotal: 3 },
    { name: 'Ismaskin', timeMode: 'ALL_DAY', ruleSetKey: 'RS_UTSTYR_HELDAG', features: ['INVENTORY'], inventoryTotal: 2 },
    { name: 'Popcornmaskin', timeMode: 'ALL_DAY', ruleSetKey: 'RS_UTSTYR_HELDAG', features: ['INVENTORY'], inventoryTotal: 2 },
  ],

  // KJORETOY_OG_TRANSPORT (4 objects)
  KJORETOY_OG_TRANSPORT: [
    { name: 'Kommunebil - VW Transporter', timeMode: 'ALL_DAY', ruleSetKey: 'RS_KJORETOY', features: ['INVENTORY'], inventoryTotal: 1, requiresApproval: true },
    { name: 'Elektrisk sykkel', timeMode: 'ALL_DAY', ruleSetKey: 'RS_UTSTYR_HELDAG', features: ['INVENTORY'], inventoryTotal: 5 },
    { name: 'Tilhenger - Liten', timeMode: 'ALL_DAY', ruleSetKey: 'RS_KJORETOY', features: ['INVENTORY'], inventoryTotal: 2 },
    { name: 'Tilhenger - Stor', timeMode: 'ALL_DAY', ruleSetKey: 'RS_KJORETOY', features: ['INVENTORY'], inventoryTotal: 1 },
  ],

  // OPPLEVELSER_OG_ARRANGEMENT (5 objects with shared capacity)
  OPPLEVELSER_OG_ARRANGEMENT: [
    { name: 'Konferanse - Digital markedsføring', timeMode: 'SLOT', ruleSetKey: 'RS_EVENT_KAPASITET', features: ['SHARED_CAPACITY'], capacity: 50 },
    { name: 'Workshop - Kreativ skriving', timeMode: 'SLOT', ruleSetKey: 'RS_EVENT_KAPASITET', features: ['SHARED_CAPACITY', 'PACKAGES'], capacity: 20 },
    { name: 'Kurs - Norsk for nybegynnere', timeMode: 'SLOT', ruleSetKey: 'RS_EVENT_KAPASITET', features: ['SHARED_CAPACITY'], capacity: 15 },
    { name: 'Konsert - Akustisk kveld', timeMode: 'PERIOD', ruleSetKey: 'RS_EVENT_KAPASITET', features: ['SHARED_CAPACITY'], capacity: 100 },
    { name: 'Omvisning - Byhistorie', timeMode: 'SLOT', ruleSetKey: 'RS_EVENT_KAPASITET', features: ['SHARED_CAPACITY'], capacity: 25 },
  ],
};

// =============================================================================
// DEMO BOOKINGS
// =============================================================================

const DEMO_BOOKINGS = [
  { status: 'pending', rentalObjectIndex: 0, startTime: new Date('2026-02-15T10:00:00Z'), endTime: new Date('2026-02-15T14:00:00Z'), notes: 'Konfirmasjonsfest' },
  { status: 'approved', rentalObjectIndex: 5, startTime: new Date('2026-02-20T18:00:00Z'), endTime: new Date('2026-02-20T19:00:00Z'), notes: 'Trening' },
  { status: 'confirmed', rentalObjectIndex: 10, startTime: new Date('2026-02-22T17:00:00Z'), endTime: new Date('2026-02-22T18:00:00Z'), notes: 'Padel med venner' },
  { status: 'confirmed', rentalObjectIndex: 12, startTime: new Date('2026-02-25T09:00:00Z'), endTime: new Date('2026-02-25T12:00:00Z'), notes: 'Styremøte' },
  { status: 'completed', rentalObjectIndex: 3, startTime: new Date('2026-01-10T19:00:00Z'), endTime: new Date('2026-01-10T23:00:00Z'), notes: 'Konsert' },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// =============================================================================
// SEED FUNCTION
// =============================================================================

async function seedV3Demo() {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║     🌱 V3 DEMO SEED - Complete Domain Model 🌱              ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ DATABASE_URL not set');
    process.exit(1);
  }

  const sql = postgres(connectionString, { max: 10 });
  const db = drizzle(sql);

  try {
    // 1. Seed Tenant
    console.log('🏢 Seeding tenant...');
    const existing = await db.select().from(tenants).where(eq(tenants.id, DEMO_TENANT.id)).limit(1);
    if (existing.length === 0) {
      await db.insert(tenants).values(DEMO_TENANT as any);
    }
    console.log('  ✅ Tenant: Skien Kommune');

    // 2. Seed Users
    console.log('👥 Seeding users...');
    for (const user of DEMO_USERS) {
      const exists = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
      if (exists.length === 0) {
        await db.insert(users).values({
          ...user,
          tenantId: DEMO_TENANT.id,
          status: 'active',
          nationalId: (user as any).nationalId || null,
          demoToken: (user as any).demoToken || null,
          metadata: (user as any).metadata || {}
        });
        const authMethod = (user as any).metadata?.auth_method || 'demo';
        console.log(`  ✅ User: ${user.email} (${user.role}) [${authMethod}]`);
      }
    }

    // 3. Seed Rental Objects
    console.log('🏠 Seeding rental objects...');
    const rentalObjectIds: string[] = [];
    let objectIndex = 0;

    for (const [categoryKey, objects] of Object.entries(RENTAL_OBJECTS)) {
      console.log(`  📁 Category: ${categoryKey}`);
      
      for (const obj of objects) {
        const id = `r${String(objectIndex).padStart(7, '0')}-0000-0000-0000-000000000001`;
        const slug = slugify(obj.name);
        
        const exists = await db.select().from(rentalObjects).where(eq(rentalObjects.id, id)).limit(1);
        if (exists.length === 0) {
          await db.insert(rentalObjects).values({
            id,
            tenantId: DEMO_TENANT.id,
            name: obj.name,
            slug,
            categoryKey,
            timeMode: obj.timeMode,
            features: obj.features || [],
            ruleSetKey: obj.ruleSetKey,
            status: 'published',
            capacity: obj.capacity,
            inventoryTotal: obj.inventoryTotal,
            requiresApproval: obj.requiresApproval || false,
            pricing: { basePrice: 500, currency: 'NOK', unit: obj.timeMode === 'ALL_DAY' ? 'day' : 'hour' },
            metadata: {},
          });
          console.log(`    ✅ ${obj.name} (${obj.timeMode})`);
        }
        
        rentalObjectIds.push(id);
        objectIndex++;
      }
    }

    // 4. Seed Bookings
    console.log('📅 Seeding demo bookings...');
    for (let i = 0; i < DEMO_BOOKINGS.length; i++) {
      const booking = DEMO_BOOKINGS[i];
      const id = `b${String(i).padStart(7, '0')}-0000-0000-0000-000000000001`;
      
      const exists = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
      if (exists.length === 0) {
        await db.insert(bookings).values({
          id,
          tenantId: DEMO_TENANT.id,
          rentalObjectId: rentalObjectIds[booking.rentalObjectIndex],
          userId: DEMO_USERS[0].id,
          status: booking.status,
          startTime: booking.startTime,
          endTime: booking.endTime,
          notes: booking.notes,
          currency: 'NOK',
        });
        console.log(`  ✅ Booking: ${booking.notes} (${booking.status})`);
      }
    }

    // Summary
    console.log('');
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║                ✅ V3 DEMO SEED COMPLETE ✅                  ║');
    console.log('╠══════════════════════════════════════════════════════════════╣');
    console.log('║                                                              ║');
    console.log('║  📊 Summary:                                                 ║');
    console.log('║    • Categories: 4 (LOKALER, UTSTYR, KJORETOY, OPPLEVELSER) ║');
    console.log('║    • Time Modes: 3 (PERIOD, SLOT, ALL_DAY)                  ║');
    console.log('║    • Features: 3 (INVENTORY, SHARED_CAPACITY, PACKAGES)     ║');
    console.log(`║    • Rental Objects: ${rentalObjectIds.length}                                     ║`);
    console.log(`║    • Demo Bookings: ${DEMO_BOOKINGS.length}                                       ║`);
    console.log(`║    • Test Users: ${DEMO_USERS.length} (5 demo, 7 Vipps, 7 BankID)             ║`);
    console.log('║                                                              ║');
    console.log('╠══════════════════════════════════════════════════════════════╣');
    console.log('║                                                              ║');
    console.log('║  🔐 Demo Token Credentials:                                  ║');
    console.log('║    • admin@skien.kommune.no (skien-admin-001)               ║');
    console.log('║    • demo@xala.no (xala-demo-001)                           ║');
    console.log('║    • ola.hansen@kommune.no (skien-citizen-001)              ║');
    console.log('║                                                              ║');
    console.log('║  🔐 Vipps Test Users: 7 users with Norwegian test numbers    ║');
    console.log('║  🔐 BankID Test Users: 7 users with Norwegian test IDs       ║');
    console.log('║                                                              ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

seedV3Demo();

export { seedV3Demo, DEMO_TENANT, DEMO_USERS, RENTAL_OBJECTS, CATEGORIES, TIME_MODES, FEATURES, RULE_SETS };
