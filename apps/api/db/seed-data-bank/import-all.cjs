#!/usr/bin/env node
/**
 * Unified seed importer for Digilist Platform
 * Single entrypoint that imports all critical business tables in correct order
 * 
 * Usage:
 *   DATABASE_URL=postgresql://... node import-all.cjs
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const SEED_DIR = __dirname;

async function importAll() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const client = new Client({ connectionString: databaseUrl });

  try {
    await client.connect();
    console.log('✅ Connected to database');
    console.log('');
    console.log('='.repeat(60));
    console.log(' Digilist Platform - Unified Seed Import');
    console.log('='.repeat(60));
    console.log('');

    // Load seed data files
    const rentalObjectsData = JSON.parse(
      fs.readFileSync(path.join(SEED_DIR, 'rental-objects-comprehensive.json'), 'utf-8')
    );
    const bookingsData = JSON.parse(
      fs.readFileSync(path.join(SEED_DIR, 'bookings-calendar.json'), 'utf-8')
    );
    const activitiesData = JSON.parse(
      fs.readFileSync(path.join(SEED_DIR, 'activities-queue.json'), 'utf-8')
    );

    // Step 1: Import tenants (platform schema)
    console.log('📦 Step 1: Importing tenants...');
    for (const tenant of rentalObjectsData.tenants) {
      await client.query(`
        INSERT INTO platform.tenants (id, slug, name, status)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          status = EXCLUDED.status
      `, [tenant.id, tenant.slug, tenant.name, tenant.status]);
    }
    console.log(`   ✅ Inserted ${rentalObjectsData.tenants.length} tenants`);
    console.log('');

    // Step 2: Import organizations (platform schema)
    console.log('📦 Step 2: Importing organizations...');
    for (const org of rentalObjectsData.organizations) {
      await client.query(`
        INSERT INTO platform.organizations (id, tenant_id, name, slug, status)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          slug = EXCLUDED.slug,
          status = EXCLUDED.status
      `, [org.id, org.tenant_id, org.name, org.slug, org.status]);
    }
    console.log(`   ✅ Inserted ${rentalObjectsData.organizations.length} organizations`);
    console.log('');

    // Step 3: Import users (platform schema)
    console.log('📦 Step 3: Importing users...');
    for (const user of rentalObjectsData.users) {
      await client.query(`
        INSERT INTO platform.users (id, tenant_id, organization_id, email, name, role, status, demo_token)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO UPDATE SET
          email = EXCLUDED.email,
          name = EXCLUDED.name,
          role = EXCLUDED.role,
          status = EXCLUDED.status
      `, [
        user.id,
        user.tenant_id,
        user.organization_id,
        user.email,
        user.name,
        user.role,
        user.status,
        user.demo_token
      ]);
    }
    console.log(`   ✅ Inserted ${rentalObjectsData.users.length} users`);
    console.log('');

    // Step 4: Import rental objects (domain schema - FIXED)
    console.log('📦 Step 4: Importing rental objects...');
    for (const obj of rentalObjectsData.rental_objects) {
      await client.query(`
        INSERT INTO domain.rental_objects (
          id, tenant_id, organization_id, name, slug, description,
          category_key, time_mode, features, status, requires_approval,
          capacity, images, pricing, metadata
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          slug = EXCLUDED.slug,
          description = EXCLUDED.description,
          category_key = EXCLUDED.category_key,
          time_mode = EXCLUDED.time_mode,
          features = EXCLUDED.features,
          status = EXCLUDED.status,
          requires_approval = EXCLUDED.requires_approval,
          capacity = EXCLUDED.capacity,
          images = EXCLUDED.images,
          pricing = EXCLUDED.pricing,
          metadata = EXCLUDED.metadata,
          updated_at = NOW()
      `, [
        obj.id,
        obj.tenant_id,
        obj.organization_id,
        obj.name,
        obj.slug,
        obj.description,
        obj.category_key,
        obj.time_mode,
        JSON.stringify(obj.features),
        obj.status,
        obj.requires_approval,
        obj.capacity,
        JSON.stringify(obj.images),
        JSON.stringify(obj.pricing),
        JSON.stringify(obj.metadata)
      ]);
    }
    console.log(`   ✅ Inserted ${rentalObjectsData.rental_objects.length} rental objects`);
    console.log('');

    // Step 5: Import bookings (domain schema - FIXED)
    console.log('📦 Step 5: Importing bookings...');
    for (const booking of bookingsData.bookings) {
      await client.query(`
        INSERT INTO domain.bookings (
          id, tenant_id, rental_object_id, user_id,
          start_time, end_time, status, total_price, currency, notes,
          created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (id) DO UPDATE SET
          status = EXCLUDED.status,
          notes = EXCLUDED.notes,
          updated_at = EXCLUDED.updated_at
      `, [
        booking.id,
        booking.tenant_id,
        booking.rental_object_id,
        booking.user_id,
        booking.start_time,
        booking.end_time,
        booking.status,
        booking.total_price,
        booking.currency,
        booking.notes,
        booking.created_at,
        booking.updated_at
      ]);
    }
    console.log(`   ✅ Inserted ${bookingsData.bookings.length} bookings`);
    console.log('');

    // Step 6: Import audit logs (compliance schema - FIXED)
    console.log('📦 Step 6: Importing audit logs...');
    for (const activity of activitiesData.activities) {
      await client.query(`
        INSERT INTO compliance.audit_logs (
          id, tenant_id, user_id, action, resource, resource_id,
          metadata, timestamp
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO NOTHING
      `, [
        activity.id,
        activity.tenant_id,
        activity.actor_id, // Map actor_id to user_id
        activity.action,
        activity.resource_type, // Map resource_type to resource
        activity.resource_id,
        JSON.stringify(activity.metadata),
        activity.created_at
      ]);
    }
    console.log(`   ✅ Inserted ${activitiesData.activities.length} audit log entries`);
    console.log('');

    // Summary
    console.log('='.repeat(60));
    console.log(' ✅ Seed import completed successfully!');
    console.log('='.repeat(60));
    console.log('');
    console.log('Summary:');
    console.log(`  - ${rentalObjectsData.tenants.length} tenants`);
    console.log(`  - ${rentalObjectsData.organizations.length} organizations`);
    console.log(`  - ${rentalObjectsData.users.length} users`);
    console.log(`  - ${rentalObjectsData.rental_objects.length} rental objects`);
    console.log(`  - ${bookingsData.bookings.length} bookings`);
    console.log(`  - ${activitiesData.activities.length} audit logs`);
    console.log('');
    console.log('Note: Feature flags are seeded via migrate.ts (seedFeatureFlags)');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('❌ Seed import failed:');
    console.error(error.message);
    console.error('');
    if (error.code === 'ENOENT') {
      console.error('Missing seed data file. Ensure all JSON files exist in:');
      console.error(`  ${SEED_DIR}/`);
    } else if (error.code === '42P01') {
      console.error('Database table does not exist. Run migrations first:');
      console.error('  pnpm --filter @digilist/api db:migrate');
    } else if (error.code === '42703') {
      console.error('Database column does not exist. Schema mismatch detected.');
      console.error('Run migrations to update schema:');
      console.error('  pnpm --filter @digilist/api db:migrate');
    }
    console.error('');
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run import
importAll().catch(console.error);
