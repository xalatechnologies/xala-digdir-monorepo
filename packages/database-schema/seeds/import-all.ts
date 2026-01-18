/**
 * Unified Seed Importer for Digilist Platform
 * 
 * Single entrypoint that imports all seed data in correct dependency order.
 * Uses Drizzle ORM with @digilist/database-schema tables.
 * 
 * Usage:
 *   DATABASE_URL=postgresql://... pnpm --filter @digilist/database-schema seed
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Import tables from schema package
import { tenants, organizations, users } from '../src/core/index.js';
import { rentalObjects, bookings } from '../src/domain/index.js';
import { auditLogs } from '../src/compliance/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  process.exit(1);
}

const queryClient = postgres(DATABASE_URL);
const db = drizzle(queryClient);

interface SeedStats {
  tenants: number;
  organizations: number;
  users: number;
  rentalObjects: number;
  bookings: number;
  auditLogs: number;
}

async function importSeeds(): Promise<void> {
  console.log('');
  console.log('='.repeat(60));
  console.log(' @digilist/database-schema - Unified Seed Import');
  console.log('='.repeat(60));
  console.log('');

  const stats: SeedStats = {
    tenants: 0,
    organizations: 0,
    users: 0,
    rentalObjects: 0,
    bookings: 0,
    auditLogs: 0,
  };

  try {
    // ==========================================
    // PLATFORM SEEDS (tenants, organizations, users)
    // ==========================================
    console.log('📦 Phase 1: Platform Seeds');
    console.log('-'.repeat(40));
    
    const rentalData = JSON.parse(
      readFileSync(join(__dirname, 'domain/rental-objects-comprehensive.json'), 'utf-8')
    );

    // 1.1 Tenants
    console.log('   └─ Importing tenants...');
    for (const tenant of rentalData.tenants || []) {
      await db.insert(tenants).values({
        id: tenant.id,
        slug: tenant.slug,
        name: tenant.name,
        status: tenant.status,
      }).onConflictDoUpdate({
        target: tenants.id,
        set: { name: tenant.name, status: tenant.status },
      });
      stats.tenants++;
    }
    console.log(`      ✅ ${stats.tenants} tenants`);

    // 1.2 Organizations
    console.log('   └─ Importing organizations...');
    for (const org of rentalData.organizations || []) {
      await db.insert(organizations).values({
        id: org.id,
        tenantId: org.tenant_id,
        name: org.name,
        slug: org.slug,
        status: org.status || 'active',
      }).onConflictDoUpdate({
        target: organizations.id,
        set: { name: org.name, slug: org.slug, status: org.status },
      });
      stats.organizations++;
    }
    console.log(`      ✅ ${stats.organizations} organizations`);

    // 1.3 Users
    console.log('   └─ Importing users...');
    for (const user of rentalData.users || []) {
      await db.insert(users).values({
        id: user.id,
        tenantId: user.tenant_id,
        organizationId: user.organization_id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status || 'active',
        demoToken: user.demo_token,
      }).onConflictDoUpdate({
        target: users.id,
        set: { email: user.email, name: user.name, role: user.role },
      });
      stats.users++;
    }
    console.log(`      ✅ ${stats.users} users`);
    console.log('');

    // ==========================================
    // DOMAIN SEEDS (rental objects, bookings)
    // ==========================================
    console.log('📦 Phase 2: Domain Seeds');
    console.log('-'.repeat(40));

    // 2.1 Rental Objects
    console.log('   └─ Importing rental objects...');
    for (const obj of rentalData.rental_objects || []) {
      await db.insert(rentalObjects).values({
        id: obj.id,
        tenantId: obj.tenant_id,
        organizationId: obj.organization_id,
        name: obj.name,
        slug: obj.slug,
        description: obj.description,
        categoryKey: obj.category_key,
        timeMode: obj.time_mode,
        features: obj.features,
        status: obj.status,
        requiresApproval: obj.requires_approval,
        capacity: obj.capacity,
        images: obj.images,
        pricing: obj.pricing,
        metadata: obj.metadata,
      }).onConflictDoUpdate({
        target: rentalObjects.id,
        set: { name: obj.name, slug: obj.slug, status: obj.status },
      });
      stats.rentalObjects++;
    }
    console.log(`      ✅ ${stats.rentalObjects} rental objects`);

    // 2.2 Bookings
    const bookingsData = JSON.parse(
      readFileSync(join(__dirname, 'domain/bookings-calendar.json'), 'utf-8')
    );
    console.log('   └─ Importing bookings...');
    for (const booking of bookingsData.bookings || []) {
      await db.insert(bookings).values({
        id: booking.id,
        tenantId: booking.tenant_id,
        rentalObjectId: booking.rental_object_id,
        userId: booking.user_id,
        startTime: new Date(booking.start_time),
        endTime: new Date(booking.end_time),
        status: booking.status,
        totalPrice: booking.total_price?.toString(),
        currency: booking.currency,
        notes: booking.notes,
      }).onConflictDoUpdate({
        target: bookings.id,
        set: { status: booking.status },
      });
      stats.bookings++;
    }
    console.log(`      ✅ ${stats.bookings} bookings`);
    console.log('');

    // ==========================================
    // COMPLIANCE SEEDS (audit logs)
    // ==========================================
    console.log('📦 Phase 3: Compliance Seeds');
    console.log('-'.repeat(40));

    const activitiesData = JSON.parse(
      readFileSync(join(__dirname, 'compliance/activities-queue.json'), 'utf-8')
    );
    console.log('   └─ Importing audit logs...');
    for (const activity of activitiesData.activities || []) {
      await db.insert(auditLogs).values({
        id: activity.id,
        tenantId: activity.tenant_id,
        userId: activity.actor_id,
        action: activity.action,
        resource: activity.resource_type,
        resourceId: activity.resource_id,
        metadata: activity.metadata,
        timestamp: new Date(activity.created_at),
      }).onConflictDoNothing();
      stats.auditLogs++;
    }
    console.log(`      ✅ ${stats.auditLogs} audit logs`);
    console.log('');

    // ==========================================
    // SUMMARY
    // ==========================================
    console.log('='.repeat(60));
    console.log(' ✅ Seed import completed successfully!');
    console.log('='.repeat(60));
    console.log('');
    console.log('Summary:');
    console.log(`  Platform: ${stats.tenants} tenants, ${stats.organizations} orgs, ${stats.users} users`);
    console.log(`  Domain:   ${stats.rentalObjects} rental objects, ${stats.bookings} bookings`);
    console.log(`  Compliance: ${stats.auditLogs} audit logs`);
    console.log('');

  } catch (error: any) {
    console.error('');
    console.error('❌ Seed import failed:');
    console.error(error.message);
    if (error.code === '42P01') {
      console.error('');
      console.error('Database table does not exist. Run migrations first:');
      console.error('  pnpm --filter @digilist/database-schema db:migrate');
    }
    process.exit(1);
  } finally {
    await queryClient.end();
  }
}

importSeeds();
