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
    console.log('📦 Phase 1: Platform Seeds');
    console.log('----------------------------------------');

    // Tenants FIRST (required for users foreign key)
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
        INSERT INTO platform.organizations (id, tenant_id, name, slug, status, type)
        VALUES (${o.id}, ${o.tenant_id}, ${o.name}, ${o.slug}, ${o.status || 'active'}, 'other')
        ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, slug = EXCLUDED.slug
      `;
      organizations++;
    }
    console.log(`      ✅ ${rentalData.organizations?.length || 0} organizations`);

    // Demo Users (after tenants and organizations)
    console.log('   └─ Demo Users...');
    const demoUsersData = JSON.parse(
      readFileSync(join(__dirname, 'platform/demo-users.json'), 'utf-8')
    );
    for (const user of demoUsersData) {
      await sql`
        INSERT INTO platform.users (id, tenant_id, email, name, national_id, role, status, demo_token, metadata)
        VALUES (
          ${user.id}, 
          ${user.tenant_id}, 
          ${user.email}, 
          ${user.name}, 
          ${user.national_id},
          ${user.role},
          ${user.status},
          ${user.demo_token},
          ${JSON.stringify(user.metadata)}::jsonb
        )
        ON CONFLICT (id) DO UPDATE SET 
          email = EXCLUDED.email,
          name = EXCLUDED.name,
          national_id = EXCLUDED.national_id,
          demo_token = EXCLUDED.demo_token,
          metadata = EXCLUDED.metadata
      `;
      users++;
    }
    console.log(`      ✅ ${demoUsersData.length} demo users`);

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
          id, tenant_id, organization_id, name, slug, description,
          category_key, status, capacity, requires_approval,
          images, pricing, metadata
        )
        VALUES (
          ${r.id}, ${r.tenant_id}, ${r.organization_id}, ${r.name}, ${r.slug}, ${r.description},
          ${r.category_key || 'LOKALER_OG_BANER'}, 'published', ${r.capacity || null}, ${r.requires_approval || false},
          ${JSON.stringify(r.images || [])}::jsonb, ${JSON.stringify(r.pricing || {})}::jsonb, ${JSON.stringify(r.metadata || {})}::jsonb
        )
        ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, status = 'published'
      `;
      rentalObjects++;
    }
    console.log(`      ✅ ${rentalObjects} rental objects`);

    // Bookings
    console.log('   └─ Bookings...');
    for (const b of bookingsData.bookings || []) {
      await sql`
        INSERT INTO domain.bookings (
          id, tenant_id, rental_object_id, user_id,
          start_time, end_time, status
        )
        VALUES (
          ${b.id}, ${b.tenant_id}, ${b.rental_object_id}, ${b.user_id},
          ${b.start_time}, ${b.end_time},
          'approved'
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
