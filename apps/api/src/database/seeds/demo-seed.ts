/**
 * Demo Seed Script
 * Seeds deterministic demo data for Skien Kommune demo
 * 
 * Usage:
 *   pnpm db:seed:demo
 *   NODE_ENV=demo tsx apps/api/src/database/seeds/demo-seed.ts
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../schema';
import { eq } from 'drizzle-orm';

// ============================================================================
// Configuration
// ============================================================================

const DEMO_TENANT = {
  id: 'd0000000-0000-0000-0000-000000000001',
  name: 'Cheyenne Kommune',
  slug: 'cheyenne',
  domain: 'cheyenne.digilist.no',
  status: 'active',
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
  enabledRentalObjectCategories: ['LOCALE', 'ARRANGEMENT'],
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
  { name: 'Kulturhuset - Storsalen', capacity: 500, pricePerHour: 2500, requiresApproval: true, ageRestriction: null },
  { name: 'Kulturhuset - Lillsalen', capacity: 150, pricePerHour: 1200, requiresApproval: true, ageRestriction: null },
  { name: 'Rådhussalen', capacity: 300, pricePerHour: 2000, requiresApproval: true, ageRestriction: null },
  { name: 'Festiviteten - Hovedsal', capacity: 400, pricePerHour: 3000, requiresApproval: true, ageRestriction: null },
  { name: 'Festiviteten - Kabaret', capacity: 100, pricePerHour: 1000, requiresApproval: false, ageRestriction: null },
  
  // Medium venues
  { name: 'Samfunnshuset - Storstue', capacity: 80, pricePerHour: 800, requiresApproval: false, ageRestriction: null },
  { name: 'Samfunnshuset - Festsal', capacity: 120, pricePerHour: 1000, requiresApproval: true, ageRestriction: null },
  { name: 'Biblioteket - Auditorium', capacity: 60, pricePerHour: 600, requiresApproval: false, ageRestriction: null },
  { name: 'Biblioteket - Møterom A', capacity: 20, pricePerHour: 300, requiresApproval: false, ageRestriction: null },
  { name: 'Biblioteket - Møterom B', capacity: 15, pricePerHour: 250, requiresApproval: false, ageRestriction: null },
  
  // Community centers
  { name: 'Grendehuset Vest', capacity: 50, pricePerHour: 500, requiresApproval: false, ageRestriction: null },
  { name: 'Grendehuset Øst', capacity: 45, pricePerHour: 450, requiresApproval: false, ageRestriction: null },
  { name: 'Grendehuset Nord', capacity: 60, pricePerHour: 550, requiresApproval: false, ageRestriction: null },
  { name: 'Grendehuset Sør', capacity: 55, pricePerHour: 500, requiresApproval: false, ageRestriction: null },
  { name: 'Ungdomshuset', capacity: 100, pricePerHour: 0, requiresApproval: true, ageRestriction: 25 },
  
  // Sports facilities
  { name: 'Idrettshallen - Hovedhall', capacity: 200, pricePerHour: 1500, requiresApproval: true, ageRestriction: null },
  { name: 'Idrettshallen - Treningsrom', capacity: 30, pricePerHour: 400, requiresApproval: false, ageRestriction: null },
  { name: 'Svømmehallen - Hovedbasseng', capacity: 50, pricePerHour: 1200, requiresApproval: true, ageRestriction: null },
  { name: 'Svømmehallen - Barnebasseng', capacity: 20, pricePerHour: 600, requiresApproval: false, ageRestriction: null },
  { name: 'Tennishallen', capacity: 20, pricePerHour: 800, requiresApproval: false, ageRestriction: null },
  
  // Meeting rooms
  { name: 'Kommunehuset - Styrerom', capacity: 12, pricePerHour: 400, requiresApproval: true, ageRestriction: null },
  { name: 'Kommunehuset - Møterom 1', capacity: 8, pricePerHour: 200, requiresApproval: false, ageRestriction: null },
  { name: 'Kommunehuset - Møterom 2', capacity: 10, pricePerHour: 250, requiresApproval: false, ageRestriction: null },
  { name: 'Næringshuset - Konferanserom', capacity: 40, pricePerHour: 600, requiresApproval: false, ageRestriction: null },
  { name: 'Næringshuset - Møterom', capacity: 16, pricePerHour: 300, requiresApproval: false, ageRestriction: null },
  
  // Schools
  { name: 'Skolen - Gymsal', capacity: 150, pricePerHour: 500, requiresApproval: true, ageRestriction: null },
  { name: 'Skolen - Aula', capacity: 200, pricePerHour: 700, requiresApproval: true, ageRestriction: null },
  { name: 'Skolen - Klasserom', capacity: 30, pricePerHour: 200, requiresApproval: true, ageRestriction: null },
  
  // Outdoor
  { name: 'Byparken - Paviljong', capacity: 80, pricePerHour: 300, requiresApproval: false, ageRestriction: null },
  { name: 'Strandpromenaden - Scene', capacity: 500, pricePerHour: 1000, requiresApproval: true, ageRestriction: null },
];

// ============================================================================
// Rental Objects - ARRANGEMENT (10+)
// ============================================================================

const ARRANGEMENT_OBJECTS = [
  { name: 'Bryllupspakke - Komplett', capacity: 150, pricePerHour: 5000, requiresApproval: true, ageRestriction: null },
  { name: 'Konferansepakke - Halvdag', capacity: 50, pricePerHour: 2000, requiresApproval: false, ageRestriction: null },
  { name: 'Konferansepakke - Heldag', capacity: 50, pricePerHour: 3500, requiresApproval: false, ageRestriction: null },
  { name: 'Julebordarrangement', capacity: 100, pricePerHour: 4000, requiresApproval: true, ageRestriction: 18 },
  { name: 'Bursdagsfeiring - Barn', capacity: 20, pricePerHour: 800, requiresApproval: false, ageRestriction: null },
  { name: 'Bursdagsfeiring - Voksen', capacity: 30, pricePerHour: 1200, requiresApproval: false, ageRestriction: 18 },
  { name: 'Firmafest - Standard', capacity: 80, pricePerHour: 3000, requiresApproval: true, ageRestriction: null },
  { name: 'Seminar - Halv dag', capacity: 40, pricePerHour: 1500, requiresApproval: false, ageRestriction: null },
  { name: 'Workshop - Kreativ', capacity: 20, pricePerHour: 1000, requiresApproval: false, ageRestriction: null },
  { name: 'Utstilling - Kunstgalleri', capacity: 100, pricePerHour: 2500, requiresApproval: true, ageRestriction: null },
  { name: 'Konsertarrangement', capacity: 300, pricePerHour: 6000, requiresApproval: true, ageRestriction: null },
  { name: 'Teaterforestilling', capacity: 150, pricePerHour: 4000, requiresApproval: true, ageRestriction: null },
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
    totalPrice: 10000,
    notes: 'Konfirmasjonsfest',
  },
  // Approved
  {
    status: 'approved',
    startTime: new Date('2026-02-20T18:00:00Z'),
    endTime: new Date('2026-02-20T23:00:00Z'),
    userId: 'u0000000-0000-0000-0000-000000000001',
    rentalObjectIndex: 5,
    totalPrice: 4000,
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
    totalPrice: 15000,
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
    totalPrice: 4800,
    notes: 'Firmamøte',
  },
  // Completed
  {
    status: 'completed',
    startTime: new Date('2026-01-10T10:00:00Z'),
    endTime: new Date('2026-01-10T15:00:00Z'),
    userId: 'u0000000-0000-0000-0000-000000000001',
    rentalObjectIndex: 10,
    totalPrice: 2500,
    notes: 'Årsmøte',
  },
];

// ============================================================================
// Sample Blocks (Maintenance/Blackout)
// ============================================================================

const SAMPLE_BLOCKS = [
  {
    type: 'MAINTENANCE',
    rentalObjectIndex: 0,
    startTime: new Date('2026-02-22T00:00:00Z'),
    endTime: new Date('2026-02-23T23:59:59Z'),
    reason: 'Planlagt vedlikehold av ventilasjonsanlegg',
  },
  {
    type: 'BLACKOUT',
    rentalObjectIndex: 15,
    startTime: new Date('2026-03-17T00:00:00Z'),
    endTime: new Date('2026-03-17T23:59:59Z'),
    reason: 'St. Patricks Day - Intern arrangement',
  },
  {
    type: 'MAINTENANCE',
    rentalObjectIndex: 17,
    startTime: new Date('2026-04-01T08:00:00Z'),
    endTime: new Date('2026-04-05T18:00:00Z'),
    reason: 'Oppussing av garderober',
  },
];

// ============================================================================
// Seed Functions
// ============================================================================

async function seedTenant(db: ReturnType<typeof drizzle>) {
  console.log('🏢 Seeding demo tenant...');
  
  // Check if tenant exists
  const existing = await db.query.tenants.findFirst({
    where: eq(schema.tenants.id, DEMO_TENANT.id),
  });

  if (existing) {
    console.log('  ⚠️  Demo tenant already exists, updating...');
    await db.update(schema.tenants)
      .set({
        name: DEMO_TENANT.name,
        slug: DEMO_TENANT.slug,
        domain: DEMO_TENANT.domain,
        featureFlags: DEMO_TENANT.featureFlags,
        enabledRentalObjectCategories: DEMO_TENANT.enabledRentalObjectCategories,
        status: DEMO_TENANT.status,
      })
      .where(eq(schema.tenants.id, DEMO_TENANT.id));
  } else {
    await db.insert(schema.tenants).values({
      id: DEMO_TENANT.id,
      name: DEMO_TENANT.name,
      slug: DEMO_TENANT.slug,
      domain: DEMO_TENANT.domain,
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
    const existing = await db.query.users.findFirst({
      where: eq(schema.users.id, user.id),
    });

    if (existing) {
      console.log(`  ⚠️  User ${user.email} already exists, skipping...`);
      continue;
    }

    await db.insert(schema.users).values({
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
  
  console.log(`  ✅ ${DEMO_USERS.length} demo users seeded`);
}

async function seedRentalObjects(db: ReturnType<typeof drizzle>, tenantId: string) {
  console.log('🏠 Seeding rental objects...');
  
  const rentalObjectIds: string[] = [];
  let index = 0;

  // Seed LOCALE objects
  for (const obj of LOCALE_OBJECTS) {
    const id = `r${String(index).padStart(7, '0')}-0000-0000-0000-000000000001`;
    
    const existing = await db.query.rentalObjects.findFirst({
      where: eq(schema.rentalObjects.id, id),
    });

    if (!existing) {
      await db.insert(schema.rentalObjects).values({
        id,
        tenantId,
        name: obj.name,
        description: `${obj.name} - Et flott lokale for ditt arrangement. Kapasitet: ${obj.capacity} personer.`,
        category: 'LOCALE',
        bookingMode: 'PERIOD',
        status: 'published',
        capacity: obj.capacity,
        basePrice: String(obj.pricePerHour),
        currency: 'NOK',
        requiresApproval: obj.requiresApproval,
        metadata: {
          pricePerHour: obj.pricePerHour,
          ageRestriction: obj.ageRestriction,
          amenities: ['WiFi', 'Projector', 'Whiteboard'],
          parkingSpaces: Math.floor(obj.capacity / 5),
          accessibleEntry: true,
        },
      });
      console.log(`  ✅ Created LOCALE: ${obj.name}`);
    }
    
    rentalObjectIds.push(id);
    index++;
  }

  // Seed ARRANGEMENT objects
  for (const obj of ARRANGEMENT_OBJECTS) {
    const id = `r${String(index).padStart(7, '0')}-0000-0000-0000-000000000001`;
    
    const existing = await db.query.rentalObjects.findFirst({
      where: eq(schema.rentalObjects.id, id),
    });

    if (!existing) {
      await db.insert(schema.rentalObjects).values({
        id,
        tenantId,
        name: obj.name,
        description: `${obj.name} - En komplett pakke for ditt arrangement. Maks ${obj.capacity} gjester.`,
        category: 'ARRANGEMENT',
        bookingMode: 'PERIOD',
        status: 'published',
        capacity: obj.capacity,
        basePrice: String(obj.pricePerHour),
        currency: 'NOK',
        requiresApproval: obj.requiresApproval,
        metadata: {
          pricePerHour: obj.pricePerHour,
          ageRestriction: obj.ageRestriction,
          includesSetup: true,
          includesCatering: obj.name.includes('pakke'),
        },
      });
      console.log(`  ✅ Created ARRANGEMENT: ${obj.name}`);
    }
    
    rentalObjectIds.push(id);
    index++;
  }
  
  console.log(`  ✅ ${LOCALE_OBJECTS.length + ARRANGEMENT_OBJECTS.length} rental objects seeded`);
  return rentalObjectIds;
}

async function seedBookings(db: ReturnType<typeof drizzle>, tenantId: string, rentalObjectIds: string[]) {
  console.log('📅 Seeding sample bookings...');
  
  let created = 0;
  
  for (const booking of SAMPLE_BOOKINGS) {
    const rentalObjectId = rentalObjectIds[booking.rentalObjectIndex];
    const id = `b${String(created).padStart(7, '0')}-0000-0000-0000-000000000001`;
    
    const existing = await db.query.bookings.findFirst({
      where: eq(schema.bookings.id, id),
    });

    if (!existing) {
      await db.insert(schema.bookings).values({
        id,
        tenantId,
        rentalObjectId,
        userId: booking.userId,
        status: booking.status,
        startTime: booking.startTime,
        endTime: booking.endTime,
        totalPrice: String(booking.totalPrice),
        currency: 'NOK',
        notes: booking.notes,
        metadata: booking.metadata || {},
      });
      
      console.log(`  ✅ Created booking: ${booking.status.toUpperCase()} - ${booking.notes}`);
      created++;
    }
  }
  
  console.log(`  ✅ ${created} sample bookings seeded`);
}

async function seedBlocks(db: ReturnType<typeof drizzle>, tenantId: string, rentalObjectIds: string[]) {
  console.log('🚫 Seeding blocked periods...');
  
  // Note: This requires a blocks table. If it doesn't exist, we'll skip.
  try {
    let created = 0;
    
    for (const block of SAMPLE_BLOCKS) {
      const rentalObjectId = rentalObjectIds[block.rentalObjectIndex];
      
      // Insert block (schema may vary)
      // await db.insert(schema.blocks).values({
      //   tenantId,
      //   rentalObjectId,
      //   type: block.type,
      //   startTime: block.startTime,
      //   endTime: block.endTime,
      //   reason: block.reason,
      // });
      
      console.log(`  ⚠️  Block: ${block.type} - ${block.reason} (blocks table may not exist)`);
      created++;
    }
    
    console.log(`  ✅ ${created} blocked periods defined (implementation pending)`);
  } catch (error) {
    console.log('  ⚠️  Blocks table not found, skipping...');
  }
}

// ============================================================================
// Main Execution
// ============================================================================

async function seed() {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║          🌱 DEMO SEED - Cheyenne Kommune 🌱                  ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');

  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL not set');
    process.exit(1);
  }

  const pool = new Pool({ connectionString });
  const db = drizzle(pool, { schema });

  try {
    // Seed in order
    const tenantId = await seedTenant(db);
    await seedUsers(db, tenantId);
    const rentalObjectIds = await seedRentalObjects(db, tenantId);
    await seedBookings(db, tenantId, rentalObjectIds);
    await seedBlocks(db, tenantId, rentalObjectIds);

    console.log('');
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║                ✅ DEMO SEED COMPLETE! ✅                     ║');
    console.log('╠══════════════════════════════════════════════════════════════╣');
    console.log('║                                                              ║');
    console.log('║  📊 Summary:                                                 ║');
    console.log(`║    • Tenant: ${DEMO_TENANT.name.padEnd(40)}║`);
    console.log(`║    • Users: ${DEMO_USERS.length} demo accounts                                 ║`);
    console.log(`║    • Rental Objects: ${LOCALE_OBJECTS.length + ARRANGEMENT_OBJECTS.length} (${LOCALE_OBJECTS.length} LOCALE, ${ARRANGEMENT_OBJECTS.length} ARRANGEMENT)       ║`);
    console.log(`║    • Sample Bookings: ${SAMPLE_BOOKINGS.length}                                   ║`);
    console.log(`║    • Blocked Periods: ${SAMPLE_BLOCKS.length}                                     ║`);
    console.log('║                                                              ║');
    console.log('╠══════════════════════════════════════════════════════════════╣');
    console.log('║                                                              ║');
    console.log('║  🔐 Demo Credentials:                                        ║');
    console.log('║    • citizen@demo.no      (CITIZEN)                          ║');
    console.log('║    • caseworker@demo.no   (CASEWORKER)                       ║');
    console.log('║    • admin@demo.no        (ADMIN)                            ║');
    console.log('║    • saas@demo.no         (SAAS_ADMIN)                       ║');
    console.log('║                                                              ║');
    console.log('║  🔑 All accounts use BankID login                            ║');
    console.log('║                                                              ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log('');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run if called directly
seed().catch(console.error);

export { seed, DEMO_TENANT, DEMO_USERS, LOCALE_OBJECTS, ARRANGEMENT_OBJECTS };
