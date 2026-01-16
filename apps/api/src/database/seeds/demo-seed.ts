/**
 * Demo Seed Script
 * Seeds deterministic demo data for Skien Kommune demo
 * 
 * Usage:
 *   pnpm db:seed:demo
 *   DATABASE_URL=xxx tsx apps/api/src/database/seeds/demo-seed.ts
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import {
  tenants,
  users,
  rentalObjects,
  bookings,
} from '../schema/index';

// ============================================================================
// Configuration
// ============================================================================

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
    'backoffice.bulkOperations': false,
    'web.ratings': false,
    'web.favorites': true,
    'web.sharing': true,
    'rentalObject.recurringBookings': false,
    'rentalObject.advancedPricing': false,
    'rentalObject.packageDeals': false,
    'rentalObject.waitlist': false,
    'rentalObject.autoApproval': false,
    'rentalObject.guestBooking': false,
  },
  enabledRentalObjectCategories: ['LOCALE', 'ARRANGEMENT', 'UTSTYR'],
};

const DEMO_USERS = [
  {
    id: 'u0000000-0000-0000-0000-000000000001',
    email: 'citizen@demo.no',
    name: 'Demo Innbygger',
    role: 'CITIZEN',
  },
  {
    id: 'u0000000-0000-0000-0000-000000000002',
    email: 'caseworker@demo.no',
    name: 'Demo Saksbehandler',
    role: 'CASEWORKER',
  },
  {
    id: 'u0000000-0000-0000-0000-000000000003',
    email: 'admin@demo.no',
    name: 'Demo Administrator',
    role: 'ADMIN',
  },
  {
    id: 'u0000000-0000-0000-0000-000000000004',
    email: 'saas@demo.no',
    name: 'Demo SaaS Admin',
    role: 'SAAS_ADMIN',
  },
];

// ============================================================================
// Rental Objects - LOCALE (30+)
// ============================================================================

const LOCALE_OBJECTS = [
  // Large venues
  { name: 'Kulturhuset - Storsalen', capacity: 500, pricePerHour: 2500 },
  { name: 'Kulturhuset - Lillsalen', capacity: 150, pricePerHour: 1200 },
  { name: 'Rådhussalen', capacity: 300, pricePerHour: 2000 },
  { name: 'Festiviteten - Hovedsal', capacity: 400, pricePerHour: 3000 },
  { name: 'Festiviteten - Kabaret', capacity: 100, pricePerHour: 1000 },
  
  // Medium venues
  { name: 'Samfunnshuset - Storstue', capacity: 80, pricePerHour: 800 },
  { name: 'Samfunnshuset - Festsal', capacity: 120, pricePerHour: 1000 },
  { name: 'Biblioteket - Auditorium', capacity: 60, pricePerHour: 600 },
  { name: 'Biblioteket - Møterom A', capacity: 20, pricePerHour: 300 },
  { name: 'Biblioteket - Møterom B', capacity: 15, pricePerHour: 250 },
  
  // Community centers
  { name: 'Grendehuset Vest', capacity: 50, pricePerHour: 500 },
  { name: 'Grendehuset Øst', capacity: 45, pricePerHour: 450 },
  { name: 'Grendehuset Nord', capacity: 60, pricePerHour: 550 },
  { name: 'Grendehuset Sør', capacity: 55, pricePerHour: 500 },
  { name: 'Ungdomshuset', capacity: 100, pricePerHour: 0 },
  
  // Sports facilities
  { name: 'Idrettshallen - Hovedhall', capacity: 200, pricePerHour: 1500 },
  { name: 'Idrettshallen - Treningsrom', capacity: 30, pricePerHour: 400 },
  { name: 'Svømmehallen - Hovedbasseng', capacity: 50, pricePerHour: 1200 },
  { name: 'Svømmehallen - Barnebasseng', capacity: 20, pricePerHour: 600 },
  { name: 'Tennishallen', capacity: 20, pricePerHour: 800 },
  
  // Meeting rooms
  { name: 'Kommunehuset - Styrerom', capacity: 12, pricePerHour: 400 },
  { name: 'Kommunehuset - Møterom 1', capacity: 8, pricePerHour: 200 },
  { name: 'Kommunehuset - Møterom 2', capacity: 10, pricePerHour: 250 },
  { name: 'Næringshuset - Konferanserom', capacity: 40, pricePerHour: 600 },
  { name: 'Næringshuset - Møterom', capacity: 16, pricePerHour: 300 },
  
  // Schools
  { name: 'Skolen - Gymsal', capacity: 150, pricePerHour: 500 },
  { name: 'Skolen - Aula', capacity: 200, pricePerHour: 700 },
  { name: 'Skolen - Klasserom', capacity: 30, pricePerHour: 200 },
  
  // Outdoor
  { name: 'Byparken - Paviljong', capacity: 80, pricePerHour: 300 },
  { name: 'Strandpromenaden - Scene', capacity: 500, pricePerHour: 1000 },
];

// ============================================================================
// Rental Objects - ARRANGEMENT (10+)
// ============================================================================

const ARRANGEMENT_OBJECTS = [
  { name: 'Bryllupspakke - Komplett', capacity: 150, pricePerHour: 5000 },
  { name: 'Konferansepakke - Halvdag', capacity: 50, pricePerHour: 2000 },
  { name: 'Konferansepakke - Heldag', capacity: 50, pricePerHour: 3500 },
  { name: 'Julebordarrangement', capacity: 100, pricePerHour: 4000 },
  { name: 'Bursdagsfeiring - Barn', capacity: 20, pricePerHour: 800 },
  { name: 'Bursdagsfeiring - Voksen', capacity: 30, pricePerHour: 1200 },
  { name: 'Firmafest - Standard', capacity: 80, pricePerHour: 3000 },
  { name: 'Seminar - Halv dag', capacity: 40, pricePerHour: 1500 },
  { name: 'Workshop - Kreativ', capacity: 20, pricePerHour: 1000 },
  { name: 'Utstilling - Kunstgalleri', capacity: 100, pricePerHour: 2500 },
  { name: 'Konsertarrangement', capacity: 300, pricePerHour: 6000 },
  { name: 'Teaterforestilling', capacity: 150, pricePerHour: 4000 },
];

// ============================================================================
// Sample Bookings
// ============================================================================

const SAMPLE_BOOKINGS = [
  // Pending approval
  {
    status: 'pending',
    startTime: new Date('2026-02-15T10:00:00Z'),
    endTime: new Date('2026-02-15T14:00:00Z'),
    userId: 'u0000000-0000-0000-0000-000000000001',
    rentalObjectIndex: 0,
    totalPrice: '10000.00',
    notes: 'Konfirmasjonsfest',
  },
  // Approved
  {
    status: 'approved',
    startTime: new Date('2026-02-20T18:00:00Z'),
    endTime: new Date('2026-02-20T23:00:00Z'),
    userId: 'u0000000-0000-0000-0000-000000000001',
    rentalObjectIndex: 5,
    totalPrice: '4000.00',
    notes: 'Bursdag',
    metadata: {
      approvedBy: 'u0000000-0000-0000-0000-000000000002',
      approvedAt: '2026-02-10T09:00:00Z',
      approvalReason: 'Godkjent for bruk',
    },
  },
  // Rejected
  {
    status: 'rejected',
    startTime: new Date('2026-02-22T10:00:00Z'),
    endTime: new Date('2026-02-22T16:00:00Z'),
    userId: 'u0000000-0000-0000-0000-000000000001',
    rentalObjectIndex: 0,
    totalPrice: '15000.00',
    notes: 'Politisk arrangement',
    metadata: {
      rejectedBy: 'u0000000-0000-0000-0000-000000000002',
      rejectedAt: '2026-02-12T14:00:00Z',
      rejectionReason: 'Lokalet er allerede reservert for vedlikehold',
    },
  },
  // Confirmed
  {
    status: 'confirmed',
    startTime: new Date('2026-03-01T09:00:00Z'),
    endTime: new Date('2026-03-01T17:00:00Z'),
    userId: 'u0000000-0000-0000-0000-000000000001',
    rentalObjectIndex: 23,
    totalPrice: '4800.00',
    notes: 'Firmamøte',
  },
  // Completed
  {
    status: 'completed',
    startTime: new Date('2026-01-10T10:00:00Z'),
    endTime: new Date('2026-01-10T15:00:00Z'),
    userId: 'u0000000-0000-0000-0000-000000000001',
    rentalObjectIndex: 10,
    totalPrice: '2500.00',
    notes: 'Årsmøte',
  },
];

// ============================================================================
// Helper to generate slug
// ============================================================================

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ============================================================================
// Seed Functions
// ============================================================================

async function seedTenant(db: ReturnType<typeof drizzle>) {
  console.log('🏢 Seeding demo tenant...');
  
  // Check if tenant exists
  const existing = await db.select().from(tenants).where(eq(tenants.id, DEMO_TENANT.id)).limit(1);

  if (existing.length > 0) {
    console.log('  ⚠️  Demo tenant already exists, updating...');
    await db.update(tenants)
      .set({
        name: DEMO_TENANT.name,
        slug: DEMO_TENANT.slug,
        domain: DEMO_TENANT.domain,
        featureFlags: DEMO_TENANT.featureFlags,
        enabledRentalObjectCategories: DEMO_TENANT.enabledRentalObjectCategories,
        status: DEMO_TENANT.status,
      })
      .where(eq(tenants.id, DEMO_TENANT.id));
  } else {
    await db.insert(tenants).values({
      id: DEMO_TENANT.id,
      name: DEMO_TENANT.name,
      slug: DEMO_TENANT.slug,
      domain: DEMO_TENANT.domain,
      settings: DEMO_TENANT.settings,
      featureFlags: DEMO_TENANT.featureFlags,
      enabledRentalObjectCategories: DEMO_TENANT.enabledRentalObjectCategories,
      status: DEMO_TENANT.status,
    });
  }
  
  console.log('  ✅ Demo tenant seeded');
  return DEMO_TENANT.id;
}

async function seedUsers(db: ReturnType<typeof drizzle>, tenantId: string) {
  console.log('👥 Seeding demo users...');
  
  for (const user of DEMO_USERS) {
    const existing = await db.select().from(users).where(eq(users.id, user.id)).limit(1);

    if (existing.length > 0) {
      console.log(`  ⚠️  User ${user.email} already exists, skipping...`);
      continue;
    }

    await db.insert(users).values({
      id: user.id,
      tenantId,
      email: user.email,
      name: user.name,
      role: user.role,
      status: 'active',
      metadata: { demo: true },
    });
    
    console.log(`  ✅ Created user: ${user.email} (${user.role})`);
  }
  
  console.log(`  ✅ ${DEMO_USERS.length} demo users processed`);
}

async function seedRentalObjects(db: ReturnType<typeof drizzle>, tenantId: string) {
  console.log('🏠 Seeding rental objects...');
  
  const rentalObjectIds: string[] = [];
  let index = 0;
  let created = 0;

  // Seed LOCALE objects
  for (const obj of LOCALE_OBJECTS) {
    const id = `r${String(index).padStart(7, '0')}-0000-0000-0000-000000000001`;
    const slug = slugify(obj.name);
    
    const existing = await db.select().from(rentalObjects).where(eq(rentalObjects.id, id)).limit(1);

    if (existing.length === 0) {
      await db.insert(rentalObjects).values({
        id,
        tenantId,
        name: obj.name,
        slug,
        description: `${obj.name} - Et flott lokale for ditt arrangement. Kapasitet: ${obj.capacity} personer.`,
        category: 'LOCALE',
        status: 'published',
        capacity: obj.capacity,
        requiresApproval: obj.capacity > 100,
        pricing: {
          basePrice: obj.pricePerHour,
          currency: 'NOK',
          unit: 'hour',
        },
        metadata: {
          amenities: ['WiFi', 'Projector', 'Whiteboard'],
          parkingSpaces: Math.floor(obj.capacity / 5),
          accessibleEntry: true,
        },
      });
      console.log(`  ✅ Created LOCALE: ${obj.name}`);
      created++;
    }
    
    rentalObjectIds.push(id);
    index++;
  }

  // Seed ARRANGEMENT objects
  for (const obj of ARRANGEMENT_OBJECTS) {
    const id = `r${String(index).padStart(7, '0')}-0000-0000-0000-000000000001`;
    const slug = slugify(obj.name);
    
    const existing = await db.select().from(rentalObjects).where(eq(rentalObjects.id, id)).limit(1);

    if (existing.length === 0) {
      await db.insert(rentalObjects).values({
        id,
        tenantId,
        name: obj.name,
        slug,
        description: `${obj.name} - En komplett pakke for ditt arrangement. Maks ${obj.capacity} gjester.`,
        category: 'ARRANGEMENT',
        status: 'published',
        capacity: obj.capacity,
        requiresApproval: true,
        pricing: {
          basePrice: obj.pricePerHour,
          currency: 'NOK',
          unit: 'event',
        },
        metadata: {
          includesSetup: true,
          includesCatering: obj.name.includes('pakke'),
        },
      });
      console.log(`  ✅ Created ARRANGEMENT: ${obj.name}`);
      created++;
    }
    
    rentalObjectIds.push(id);
    index++;
  }
  
  console.log(`  ✅ ${created} new rental objects created (${rentalObjectIds.length} total)`);
  return rentalObjectIds;
}

async function seedBookings(db: ReturnType<typeof drizzle>, tenantId: string, rentalObjectIds: string[]) {
  console.log('📅 Seeding sample bookings...');
  
  let created = 0;
  
  for (let i = 0; i < SAMPLE_BOOKINGS.length; i++) {
    const booking = SAMPLE_BOOKINGS[i];
    const rentalObjectId = rentalObjectIds[booking.rentalObjectIndex];
    const id = `b${String(i).padStart(7, '0')}-0000-0000-0000-000000000001`;
    
    const existing = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);

    if (existing.length === 0) {
      await db.insert(bookings).values({
        id,
        tenantId,
        rentalObjectId,
        userId: booking.userId,
        status: booking.status,
        startTime: booking.startTime,
        endTime: booking.endTime,
        totalPrice: booking.totalPrice,
        currency: 'NOK',
        notes: booking.notes,
        metadata: booking.metadata || {},
      });
      
      console.log(`  ✅ Created booking: ${booking.status.toUpperCase()} - ${booking.notes}`);
      created++;
    }
  }
  
  console.log(`  ✅ ${created} new sample bookings created`);
}

// ============================================================================
// Main Execution
// ============================================================================

async function seed() {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║          🌱 DEMO SEED - Skien Kommune 🌱                     ║');
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
    // Seed in order
    const tenantId = await seedTenant(db);
    await seedUsers(db, tenantId);
    const rentalObjectIds = await seedRentalObjects(db, tenantId);
    await seedBookings(db, tenantId, rentalObjectIds);

    console.log('');
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║                ✅ DEMO SEED COMPLETE! ✅                     ║');
    console.log('╠══════════════════════════════════════════════════════════════╣');
    console.log('║                                                              ║');
    console.log('║  📊 Summary:                                                 ║');
    console.log(`║    • Tenant: Skien Kommune                                  ║`);
    console.log(`║    • Users: ${DEMO_USERS.length} demo accounts                                 ║`);
    console.log(`║    • Rental Objects: ${LOCALE_OBJECTS.length + ARRANGEMENT_OBJECTS.length} (${LOCALE_OBJECTS.length} LOCALE, ${ARRANGEMENT_OBJECTS.length} ARRANGEMENT)       ║`);
    console.log(`║    • Sample Bookings: ${SAMPLE_BOOKINGS.length}                                   ║`);
    console.log('║                                                              ║');
    console.log('╠══════════════════════════════════════════════════════════════╣');
    console.log('║                                                              ║');
    console.log('║  🔐 Demo Credentials (BankID Login):                         ║');
    console.log('║    • citizen@demo.no      (CITIZEN)                          ║');
    console.log('║    • caseworker@demo.no   (CASEWORKER)                       ║');
    console.log('║    • admin@demo.no        (ADMIN)                            ║');
    console.log('║    • saas@demo.no         (SAAS_ADMIN)                       ║');
    console.log('║                                                              ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log('');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

// Run if called directly
seed().catch(console.error);

export { seed, DEMO_TENANT, DEMO_USERS, LOCALE_OBJECTS, ARRANGEMENT_OBJECTS };
