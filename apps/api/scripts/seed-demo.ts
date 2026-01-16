/**
 * Master Demo Seed Runner Script
 * SSA-L Compliance: Orchestrates demo data seeding for Skien kommune demo
 *
 * This script seeds the database with:
 * - 15 demo users (admins, caseworkers, citizens)
 * - 45+ rental objects across multiple categories
 * - 30+ bookings with varied statuses
 *
 * Run with: pnpm db:seed:demo
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/database/schema/index';

// Import demo seed data
import {
  DEMO_USERS,
  getDemoUsersCount,
  getAdminUsers,
  getCaseworkerUsers,
  getCitizenUsers,
  toDatabaseFormat as userToDatabaseFormat,
} from '../src/database/seeds/demo-users.seed';

import {
  DEMO_RENTAL_OBJECTS,
  getRentalObjectsCount,
  getRentalObjectsByType,
  toDatabaseFormat as rentalObjectToDatabaseFormat,
} from '../src/database/seeds/demo-rental-objects.seed';

import {
  DEMO_BOOKINGS,
  getDemoBookingsCount,
  getDemoBookingsByStatus,
  toDatabaseFormat as bookingToDatabaseFormat,
} from '../src/database/seeds/demo-bookings.seed';

// ============================================================================
// Constants from demo seeds (for organizations that need to be created)
// ============================================================================

const TENANT_SKIEN = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
const TENANT_PORSGRUNN = 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d';

// Organization IDs used by demo data
const DEMO_ORGANIZATIONS = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    tenantId: TENANT_SKIEN,
    name: 'Skien Idrettshall',
    slug: 'skien-idrettshall',
    type: 'sports_facility',
    status: 'active',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    tenantId: TENANT_SKIEN,
    name: 'Skien Kulturhus',
    slug: 'skien-kulturhus',
    type: 'cultural_center',
    status: 'active',
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    tenantId: TENANT_PORSGRUNN,
    name: 'Porsgrunn IL Hovedklubb',
    slug: 'porsgrunn-il-hovedklubb',
    type: 'sports_club',
    status: 'active',
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    tenantId: TENANT_SKIEN,
    name: 'Skien Ungdomsklubb',
    slug: 'skien-ungdomsklubb',
    type: 'youth_organization',
    status: 'active',
  },
  {
    id: '66666666-1111-1111-1111-111111111111',
    tenantId: TENANT_SKIEN,
    name: 'Skien Videregående Skole',
    slug: 'skien-vgs',
    type: 'educational',
    status: 'active',
  },
  {
    id: '77777777-1111-1111-1111-111111111111',
    tenantId: TENANT_SKIEN,
    name: 'Skien Bibliotek',
    slug: 'skien-bibliotek',
    type: 'cultural_center',
    status: 'active',
  },
  {
    id: '88888888-1111-1111-1111-111111111111',
    tenantId: TENANT_SKIEN,
    name: 'Skien Park og Friluft',
    slug: 'skien-park-friluft',
    type: 'parks',
    status: 'active',
  },
  {
    id: '99999999-1111-1111-1111-111111111111',
    tenantId: TENANT_SKIEN,
    name: 'Skien Grendehus',
    slug: 'skien-grendehus',
    type: 'community_center',
    status: 'active',
  },
];

const DEMO_TENANTS = [
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
    name: 'Porsgrunn Kommune',
    slug: 'porsgrunn-kommune',
    domain: 'porsgrunn.digilist.no',
    status: 'active',
    settings: {
      features: { rbac: true, auditLogs: true },
      branding: { primaryColor: '#059669', name: 'Porsgrunn Kommune' },
    },
  },
];

const DEMO_SUBSCRIPTIONS = [
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
];

// ============================================================================
// Seed Runner
// ============================================================================

async function seedDemo() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is required');
    process.exit(1);
  }

  console.log('🌱 Starting SSA-L Demo Database Seed...\n');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  DIGILIST SSA-L Demo Data Seeder');
  console.log('  Norwegian Municipal Booking System');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const sql = postgres(databaseUrl, { max: 1 });
  const db = drizzle(sql, { schema });

  try {
    // ========================================================================
    // Phase 1: Clear existing data (respecting foreign key constraints)
    // ========================================================================
    console.log('🧹 Phase 1: Clearing existing data...');

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

    console.log('   ✓ Cleared all existing data\n');

    // ========================================================================
    // Phase 2: Seed foundation entities (tenants, organizations)
    // ========================================================================
    console.log('🏛️  Phase 2: Seeding foundation entities...');

    // Insert tenants
    await db.insert(schema.tenants).values(DEMO_TENANTS);
    console.log(`   ✓ Inserted ${DEMO_TENANTS.length} tenants`);

    // Insert organizations
    await db.insert(schema.organizations).values(DEMO_ORGANIZATIONS);
    console.log(`   ✓ Inserted ${DEMO_ORGANIZATIONS.length} organizations`);

    // Insert subscriptions
    await db.insert(schema.subscriptions).values(DEMO_SUBSCRIPTIONS);
    console.log(`   ✓ Inserted ${DEMO_SUBSCRIPTIONS.length} subscriptions\n`);

    // ========================================================================
    // Phase 3: Seed demo users
    // ========================================================================
    console.log('👥 Phase 3: Seeding demo users...');

    const usersForDb = DEMO_USERS.map(userToDatabaseFormat);
    await db.insert(schema.users).values(usersForDb);

    console.log(`   ✓ Inserted ${getDemoUsersCount()} users:`);
    console.log(`     - ${getAdminUsers().length} admin users`);
    console.log(`     - ${getCaseworkerUsers().length} caseworker users`);
    console.log(`     - ${getCitizenUsers().length} citizen users\n`);

    // ========================================================================
    // Phase 4: Seed demo rental objects (listings)
    // ========================================================================
    console.log('🏠 Phase 4: Seeding demo rental objects...');

    const listingsForDb = DEMO_RENTAL_OBJECTS.map(rentalObjectToDatabaseFormat);
    await db.insert(schema.listings).values(listingsForDb);

    console.log(`   ✓ Inserted ${getRentalObjectsCount()} rental objects:`);
    console.log(`     - ${getRentalObjectsByType('SPACE').length} spaces`);
    console.log(`     - ${getRentalObjectsByType('RESOURCE').length} resources\n`);

    // ========================================================================
    // Phase 5: Seed demo bookings
    // ========================================================================
    console.log('📅 Phase 5: Seeding demo bookings...');

    const bookingsForDb = DEMO_BOOKINGS.map(bookingToDatabaseFormat);
    await db.insert(schema.bookings).values(bookingsForDb);

    console.log(`   ✓ Inserted ${getDemoBookingsCount()} bookings:`);
    console.log(`     - ${getDemoBookingsByStatus('completed').length} completed`);
    console.log(`     - ${getDemoBookingsByStatus('confirmed').length} confirmed`);
    console.log(`     - ${getDemoBookingsByStatus('pending').length} pending`);
    console.log(`     - ${getDemoBookingsByStatus('cancelled').length} cancelled\n`);

    // ========================================================================
    // Summary
    // ========================================================================
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✅ SSA-L Demo seed completed successfully!');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('\n📊 Summary:');
    console.log(`   • ${DEMO_TENANTS.length} tenants (Skien, Porsgrunn)`);
    console.log(`   • ${DEMO_ORGANIZATIONS.length} organizations`);
    console.log(`   • ${getDemoUsersCount()} users (admin, caseworker, citizen)`);
    console.log(`   • ${getRentalObjectsCount()} rental objects`);
    console.log(`   • ${getDemoBookingsCount()} bookings`);
    console.log('\n🔐 Demo login accounts:');
    console.log('   Admin:      admin@skien.kommune.no');
    console.log('   Caseworker: saksbehandler.idrett@skien.kommune.no');
    console.log('   Citizen:    ole.nordmann@example.no');
    console.log('\n🚀 Ready for SSA-L demo!\n');
  } catch (error) {
    console.error('❌ Demo seed failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

// Run the seeder
seedDemo();
