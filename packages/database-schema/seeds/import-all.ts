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
      const slug = t.slug || t.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      await sql`
        INSERT INTO platform.tenants (id, slug, name, status)
        VALUES (${t.id}, ${slug}, ${t.name}, 'ACTIVE')
        ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, slug = EXCLUDED.slug
      `;
      tenants++;
    }
    console.log(`      ✅ ${tenants} tenants`);

    // Organizations
    console.log('   └─ Organizations...');
    for (const o of rentalData.organizations || []) {
      const slug = o.slug || (o.name ? o.name.toLowerCase().replace(/[^a-z0-9]/g, '-') : `org-${o.id.substring(0, 8)}`);
      await sql`
        INSERT INTO platform.organizations (id, tenant_id, name, slug, status, type)
        VALUES (${o.id}, ${o.tenant_id}, ${o.name}, ${slug}, ${o.status || 'active'}, 'other')
        ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, slug = EXCLUDED.slug
      `;
      organizations++;
    }
    console.log(`      ✅ ${organizations} organizations`);

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
          ${user.national_id || null},
          ${user.role || 'member'},
          ${user.status || 'active'},
          ${user.demo_token || null},
          ${JSON.stringify(user.metadata || {})}::jsonb
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
        INSERT INTO platform.users (id, tenant_id, email, name, status)
        VALUES (${u.id}, ${u.tenant_id}, ${u.email}, ${u.name}, 'active')
        ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email
      `;
      users++;
    }
    console.log(`      ✅ ${users} total users (including demo)`);

    // Translations
    console.log('   └─ Translations...');
    for (const trans of translationsData) {
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
        ON CONFLICT (id) DO UPDATE SET 
          name = EXCLUDED.name, 
          status = 'published',
          metadata = EXCLUDED.metadata,
          images = EXCLUDED.images,
          pricing = EXCLUDED.pricing
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
    console.log(`      ✅ ${bookings} bookings`);

    // Allocations (calendar blocks)
    console.log('   └─ Allocations...');
    let allocations = 0;
    try {
      const allocationsData = JSON.parse(
        readFileSync(join(__dirname, 'domain/allocations.json'), 'utf-8')
      );
      for (const a of allocationsData) {
        await sql`
          INSERT INTO domain.allocations (
            id, tenant_id, rental_object_id, title,
            start_time, end_time, status, notes, metadata
          )
          VALUES (
            ${a.id}, ${a.tenantId}, ${a.rentalObjectId}, ${a.title},
            ${a.startTime}, ${a.endTime}, ${a.status || 'confirmed'},
            ${a.notes || null}, ${JSON.stringify(a.metadata || {})}::jsonb
          )
          ON CONFLICT (id) DO UPDATE SET 
            title = EXCLUDED.title,
            start_time = EXCLUDED.start_time,
            end_time = EXCLUDED.end_time,
            status = EXCLUDED.status
        `;
        allocations++;
      }
      console.log(`      ✅ ${allocations} allocations`);
    } catch (e) {
      console.log(`      ⏭️ allocations.json not found, skipping`);
    }

    // Blocks (maintenance/blackout periods)
    console.log('   └─ Blocks...');
    let blocks = 0;
    try {
      const blocksData = JSON.parse(
        readFileSync(join(__dirname, 'domain/blocks.json'), 'utf-8')
      );
      for (const b of blocksData) {
        await sql`
          INSERT INTO domain.blocks (
            id, tenant_id, rental_object_id, title, reason,
            start_date, end_date, all_day, recurring, recurrence_rule,
            visibility, status
          )
          VALUES (
            ${b.id}, ${b.tenantId}, ${b.rentalObjectId}, ${b.title}, ${b.reason || null},
            ${b.startDate}, ${b.endDate}, ${b.allDay || false}, ${b.recurring || false},
            ${b.recurrenceRule || null}, ${b.visibility || 'public'}, ${b.status || 'active'}
          )
          ON CONFLICT (id) DO UPDATE SET 
            title = EXCLUDED.title,
            start_date = EXCLUDED.start_date,
            end_date = EXCLUDED.end_date,
            status = EXCLUDED.status
        `;
        blocks++;
      }
      console.log(`      ✅ ${blocks} blocks`);
    } catch (e) {
      console.log(`      ⏭️ blocks.json not found, skipping`);
    }

    console.log('');

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
