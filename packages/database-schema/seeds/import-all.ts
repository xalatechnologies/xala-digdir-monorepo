#!/usr/bin/env node
/**
 * Unified Seed Importer for Digilist Platform
 * Uses raw SQL matching actual table columns from SQL migrations
 */

import postgres from 'postgres';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL required');
  process.exit(1);
}

const sql = postgres(DATABASE_URL);

async function importSeeds(): Promise<void> {
  console.log('\n' + '='.repeat(60));
  console.log(' @digilist/database-schema - Unified Seed Import');
  console.log('='.repeat(60) + '\n');

  let tenants = 0, organizations = 0, users = 0, rentalObjects = 0, bookings = 0, translations = 0;

  try {
    const rentalData = JSON.parse(
      readFileSync(join(__dirname, 'domain/rental-objects-comprehensive.json'), 'utf-8')
    );
    const bookingsData = JSON.parse(
      readFileSync(join(__dirname, 'domain/bookings-calendar.json'), 'utf-8')
    );
    const translationsData = JSON.parse(
      readFileSync(join(__dirname, 'platform/translations.json'), 'utf-8')
    );

    // ========== PLATFORM ==========
    console.log('📦 Phase 1: Platform Seeds\n' + '-'.repeat(40));

    // Tenants
    console.log('   └─ Tenants...');
    for (const t of rentalData.tenants || []) {
      await sql`
        INSERT INTO platform.tenants (id, slug, name, status)
        VALUES (${t.id}, ${t.slug}, ${t.name}, 'ACTIVE')
        ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
      `;
      tenants++;
    }
    console.log(`      ✅ ${tenants} tenants`);

    // Organizations
    console.log('   └─ Organizations...');
    for (const o of rentalData.organizations || []) {
      await sql`
        INSERT INTO platform.organizations (id, tenant_id, name, status)
        VALUES (${o.id}, ${o.tenant_id}, ${o.name}, 'ACTIVE')
        ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
      `;
      organizations++;
    }
    console.log(`      ✅ ${organizations} organizations`);

    // Users
    console.log('   └─ Users...');
    for (const u of rentalData.users || []) {
      await sql`
        INSERT INTO platform.users (id, tenant_id, email, display_name, status)
        VALUES (${u.id}, ${u.tenant_id}, ${u.email}, ${u.name}, 'ACTIVE')
        ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email
      `;
      users++;
    }
    console.log(`      ✅ ${users} users`);

    // Translations
    console.log('   └─ Translations...');
    for (const trans of translationsData.translations || []) {
      await sql`
        INSERT INTO platform.translations (
          tenant_id, namespace, key, language, value, is_system_default
        )
        VALUES (
          ${trans.tenantId}, ${trans.namespace}, ${trans.key},
          ${trans.language}, ${trans.value}, ${trans.isSystemDefault}
        )
        ON CONFLICT (tenant_id, namespace, key, language) 
        DO UPDATE SET value = EXCLUDED.value
      `;
      translations++;
    }
    console.log(`      ✅ ${translations} translations\n`);

    // ========== DOMAIN ==========
    console.log('📦 Phase 2: Domain Seeds\n' + '-'.repeat(40));

    // Rental Objects
    console.log('   └─ Rental Objects...');
    for (const r of rentalData.rental_objects || []) {
      await sql`
        INSERT INTO domain.rental_objects (
          id, tenant_id, organization_id, title, description,
          type_code, status, capacity, booking_mode
        )
        VALUES (
          ${r.id}, ${r.tenant_id}, ${r.organization_id}, ${r.name}, ${r.description},
          'SPACE', 'PUBLISHED', ${r.capacity || null}, 'SINGLE_SLOT'
        )
        ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, status = 'PUBLISHED'
      `;
      rentalObjects++;
    }
    console.log(`      ✅ ${rentalObjects} rental objects`);

    // Bookings
    console.log('   └─ Bookings...');
    for (const b of bookingsData.bookings || []) {
      await sql`
        INSERT INTO domain.bookings (
          id, tenant_id, rental_object_id, booked_by_user_id,
          start_at, end_at, status, booking_mode
        )
        VALUES (
          ${b.id}, ${b.tenant_id}, ${b.rental_object_id}, ${b.user_id},
          ${b.start_time}::timestamptz, ${b.end_time}::timestamptz,
          'APPROVED', 'SINGLE_SLOT'
        )
        ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status
      `;
      bookings++;
    }
    console.log(`      ✅ ${bookings} bookings\n`);

    // ========== SUMMARY ==========
    console.log('='.repeat(60));
    console.log(' ✅ Seed import completed!');
    console.log('='.repeat(60));
    console.log(`\nPlatform: ${tenants} tenants, ${organizations} orgs, ${users} users, ${translations} translations`);
    console.log(`Domain: ${rentalObjects} rental objects, ${bookings} bookings\n`);

  } catch (error: any) {
    console.error('\n❌ Seed failed:', error.message);
    console.error('Code:', error.code);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

importSeeds();
