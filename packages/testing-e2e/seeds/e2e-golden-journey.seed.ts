/**
 * E2E Golden Journey Seed Script
 * 
 * Creates deterministic test data for the Golden Booking Journey E2E test suite.
 * This script is idempotent and can be run multiple times safely.
 * 
 * Creates:
 * - E2E tenant with feature flags enabled
 * - Test users (citizen, case handler, admin)
 * - Test rental object (listing) with guaranteed availability
 * - Test time slots (1 free, 1 booked, 1 blocked)
 * 
 * Usage:
 *   pnpm tsx packages/testing-e2e/seeds/e2e-golden-journey.seed.ts
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, and } from 'drizzle-orm';
import * as schema from '@digilist/database-schema';
import { randomUUID } from 'crypto';

// =============================================================================
// Configuration
// =============================================================================

const E2E_TENANT_KEY = 'e2e-tenant';
const E2E_LISTING_KEY = 'E2E_LISTING_1';

const E2E_USERS = {
  citizen: {
    email: 'e2e.citizen@example.com',
    firstName: 'E2E',
    lastName: 'Citizen',
    role: 'CITIZEN' as const,
  },
  caseHandler: {
    email: 'e2e.casehandler@example.com',
    firstName: 'E2E',
    lastName: 'Case Handler',
    role: 'CASE_HANDLER' as const,
  },
  admin: {
    email: 'e2e.admin@example.com',
    firstName: 'E2E',
    lastName: 'Admin',
    role: 'TENANT_ADMIN' as const,
  },
} as const;

// Guaranteed free slot: Next weekday at 18:00-20:00
function getGuaranteedFreeSlot() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Set to 18:00
  tomorrow.setHours(18, 0, 0, 0);
  
  const startTime = tomorrow;
  const endTime = new Date(tomorrow);
  endTime.setHours(20, 0, 0, 0);
  
  return { startTime, endTime };
}

// Booked slot: Next weekday at 14:00-16:00
function getBookedSlot() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  tomorrow.setHours(14, 0, 0, 0);
  
  const startTime = tomorrow;
  const endTime = new Date(tomorrow);
  endTime.setHours(16, 0, 0, 0);
  
  return { startTime, endTime };
}

// Blocked slot: Next weekday at 10:00-12:00
function getBlockedSlot() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  tomorrow.setHours(10, 0, 0, 0);
  
  const startTime = tomorrow;
  const endTime = new Date(tomorrow);
  endTime.setHours(12, 0, 0, 0);
  
  return { startTime, endTime };
}

// =============================================================================
// Main Seed Function
// =============================================================================

async function seedGoldenJourney() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://digilist_dev:digilist_dev@localhost:5432/digilist_test';
  
  console.log('🌱 Starting E2E Golden Journey seed...');
  console.log(`📦 Database: ${connectionString.replace(/:[^:]*@/, ':****@')}`);
  
  const client = postgres(connectionString);
  const db = drizzle(client, { schema });
  
  try {
    // 1. Create or get E2E tenant
    console.log('\n1️⃣ Creating E2E tenant...');
    const tenantId = await createE2ETenant(db);
    console.log(`   ✅ Tenant: ${tenantId}`);
    
    // 2. Create test users
    console.log('\n2️⃣ Creating test users...');
    const users = await createTestUsers(db, tenantId);
    console.log(`   ✅ Citizen: ${users.citizen.id} (${users.citizen.email})`);
    console.log(`   ✅ Case Handler: ${users.caseHandler.id} (${users.caseHandler.email})`);
    console.log(`   ✅ Admin: ${users.admin.id} (${users.admin.email})`);
    
    // 3. Create test rental object (listing)
    console.log('\n3️⃣ Creating test rental object...');
    const rentalObject = await createTestRentalObject(db, tenantId);
    console.log(`   ✅ Rental Object: ${rentalObject.id}`);
    console.log(`   ✅ Title: ${rentalObject.name}`);
    console.log(`   ✅ Status: ${rentalObject.status}`);
    
    // 4. Create test time slots
    console.log('\n4️⃣ Creating test time slots...');
    const slots = await createTestSlots(db, tenantId, rentalObject.id, users.citizen.id);
    console.log(`   ✅ Free Slot: ${slots.freeSlot.startTime.toISOString()} - ${slots.freeSlot.endTime.toISOString()}`);
    console.log(`   ✅ Booked Slot: ${slots.bookedSlot.startTime.toISOString()} - ${slots.bookedSlot.endTime.toISOString()}`);
    console.log(`   ✅ Blocked Slot: ${slots.blockedSlot.startTime.toISOString()} - ${slots.blockedSlot.endTime.toISOString()}`);
    
    console.log('\n✅ E2E Golden Journey seed complete!');
    console.log('\n📋 Test Data Summary:');
    console.log('━'.repeat(80));
    console.log(`Tenant ID:        ${tenantId}`);
    console.log(`Tenant Key:       ${E2E_TENANT_KEY}`);
    console.log(`Listing ID:       ${rentalObject.id}`);
    console.log(`Listing Key:      ${E2E_LISTING_KEY}`);
    console.log(`\nUsers:`);
    console.log(`  Citizen:        ${users.citizen.email}`);
    console.log(`  Case Handler:   ${users.caseHandler.email}`);
    console.log(`  Admin:          ${users.admin.email}`);
    console.log(`\nTest Slots:`);
    console.log(`  Free:           ${slots.freeSlot.startTime.toISOString()}`);
    console.log(`  Booked:         ${slots.bookedSlot.startTime.toISOString()}`);
    console.log(`  Blocked:        ${slots.blockedSlot.startTime.toISOString()}`);
    console.log('━'.repeat(80));
    
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// =============================================================================
// Helper Functions
// =============================================================================

async function createE2ETenant(db: any) {
  // Check if tenant exists
  const existing = await db
    .select()
    .from(schema.tenants)
    .where(eq(schema.tenants.slug, E2E_TENANT_KEY))
    .limit(1);
  
  if (existing.length > 0) {
    console.log('   ℹ️  Tenant already exists, reusing...');
    return existing[0].id;
  }
  
  // Create new tenant
  const [tenant] = await db
    .insert(schema.tenants)
    .values({
      id: randomUUID(),
      name: 'E2E Test Tenant',
      slug: E2E_TENANT_KEY,
      status: 'ACTIVE',
      featureFlags: {
        booking: true,
        messaging: true,
        approvalWorkflow: true,
        auditLog: true,
      },
      metadata: {
        purpose: 'e2e-testing',
        createdBy: 'e2e-seed-script',
      },
    })
    .returning();
  
  return tenant.id;
}

async function createTestUsers(db: any, tenantId: string) {
  const result: Record<string, any> = {};
  
  for (const [key, userData] of Object.entries(E2E_USERS)) {
    // Check if user exists
    const existing = await db
      .select()
      .from(schema.users)
      .where(
        and(
          eq(schema.users.email, userData.email),
          eq(schema.users.tenantId, tenantId)
        )
      )
      .limit(1);
    
    if (existing.length > 0) {
      console.log(`   ℹ️  User ${userData.email} already exists, reusing...`);
      result[key] = existing[0];
      continue;
    }
    
    // Create new user
    const [user] = await db
      .insert(schema.users)
      .values({
        id: randomUUID(),
        tenantId,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        status: 'ACTIVE',
        emailVerified: true,
      })
      .returning();
    
    result[key] = user;
  }
  
  return result as { citizen: any; caseHandler: any; admin: any };
}

async function createTestRentalObject(db: any, tenantId: string) {
  // Check if rental object exists
  const existing = await db
    .select()
    .from(schema.rentalObjects)
    .where(
      and(
        eq(schema.rentalObjects.tenantId, tenantId),
        eq(schema.rentalObjects.metadata, { testKey: E2E_LISTING_KEY })
      )
    )
    .limit(1);
  
  if (existing.length > 0) {
    console.log('   ℹ️  Rental object already exists, reusing...');
    return existing[0];
  }
  
  // Create new rental object
  const [rentalObject] = await db
    .insert(schema.rentalObjects)
    .values({
      id: randomUUID(),
      tenantId,
      name: 'E2E Test Hall',
      slug: 'e2e-test-hall',
      description: 'Test rental object for E2E Golden Journey tests',
      categoryKey: 'SPORTS_HALL',
      status: 'PUBLISHED',
      requiresApproval: true,
      bookingTimeMode: 'SLOT',
      features: {
        hasCalendar: true,
        supportsSingleSlot: true,
        supportsRecurring: true,
      },
      openingHours: {
        1: { open: '08:00', close: '22:00' }, // Monday
        2: { open: '08:00', close: '22:00' }, // Tuesday
        3: { open: '08:00', close: '22:00' }, // Wednesday
        4: { open: '08:00', close: '22:00' }, // Thursday
        5: { open: '08:00', close: '22:00' }, // Friday
        6: { open: '10:00', close: '18:00' }, // Saturday
        0: { open: '10:00', close: '18:00' }, // Sunday
      },
      metadata: {
        testKey: E2E_LISTING_KEY,
        purpose: 'e2e-golden-journey',
      },
    })
    .returning();
  
  return rentalObject;
}

async function createTestSlots(db: any, tenantId: string, rentalObjectId: string, citizenUserId: string) {
  const freeSlotTimes = getGuaranteedFreeSlot();
  const bookedSlotTimes = getBookedSlot();
  const blockedSlotTimes = getBlockedSlot();
  
  // Clean up existing test slots for this rental object
  await db
    .delete(schema.bookings)
    .where(
      and(
        eq(schema.bookings.tenantId, tenantId),
        eq(schema.bookings.rentalObjectId, rentalObjectId)
      )
    );
  
  await db
    .delete(schema.blocks)
    .where(
      and(
        eq(schema.blocks.tenantId, tenantId),
        eq(schema.blocks.rentalObjectId, rentalObjectId)
      )
    );
  
  // Create booked slot
  const [bookedSlot] = await db
    .insert(schema.bookings)
    .values({
      id: randomUUID(),
      tenantId,
      rentalObjectId,
      userId: citizenUserId,
      status: 'confirmed',
      startTime: bookedSlotTimes.startTime,
      endTime: bookedSlotTimes.endTime,
      bookingMode: 'SINGLE_SLOT',
      totalPrice: 500,
      currency: 'NOK',
      metadata: {
        purpose: 'e2e-booked-slot',
      },
    })
    .returning();
  
  // Create blocked slot
  const [blockedSlot] = await db
    .insert(schema.blocks)
    .values({
      id: randomUUID(),
      tenantId,
      rentalObjectId,
      startTime: blockedSlotTimes.startTime,
      endTime: blockedSlotTimes.endTime,
      reason: 'E2E test blocked slot',
      blockType: 'MAINTENANCE',
      metadata: {
        purpose: 'e2e-blocked-slot',
      },
    })
    .returning();
  
  return {
    freeSlot: freeSlotTimes,
    bookedSlot: {
      ...bookedSlot,
      startTime: bookedSlotTimes.startTime,
      endTime: bookedSlotTimes.endTime,
    },
    blockedSlot: {
      ...blockedSlot,
      startTime: blockedSlotTimes.startTime,
      endTime: blockedSlotTimes.endTime,
    },
  };
}

// =============================================================================
// Run Seed
// =============================================================================

if (require.main === module) {
  seedGoldenJourney()
    .then(() => {
      console.log('\n🎉 Seed completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Seed failed:', error);
      process.exit(1);
    });
}

export { seedGoldenJourney };
