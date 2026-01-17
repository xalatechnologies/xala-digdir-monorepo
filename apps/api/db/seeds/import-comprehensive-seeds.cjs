#!/usr/bin/env node
/**
 * Import comprehensive seed data into PostgreSQL
 * Reads rental-objects-comprehensive.json and inserts into database
 */

const fs = require('fs');
const { Client } = require('pg');

async function importSeeds() {
  const seedData = JSON.parse(fs.readFileSync('./rental-objects-comprehensive.json', 'utf-8'));
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Insert tenants
    for (const tenant of seedData.tenants) {
      await client.query(`
        INSERT INTO platform.tenants (id, slug, name, status)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          status = EXCLUDED.status
      `, [tenant.id, tenant.slug, tenant.name, tenant.status]);
    }
    console.log(`✅ Inserted ${seedData.tenants.length} tenants`);

    // Insert organizations
    for (const org of seedData.organizations) {
      await client.query(`
        INSERT INTO platform.organizations (id, tenant_id, name, slug, status)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          slug = EXCLUDED.slug,
          status = EXCLUDED.status
      `, [org.id, org.tenant_id, org.name, org.slug, org.status]);
    }
    console.log(`✅ Inserted ${seedData.organizations.length} organizations`);

    // Insert users  
    for (const user of seedData.users) {
      await client.query(`
        INSERT INTO platform.users (id, tenant_id, organization_id, email, name, role, status, demo_token)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO UPDATE SET
          email = EXCLUDED.email,
          name = EXCLUDED.name,
          role = EXCLUDED.role,
          status = EXCLUDED.status
      `, [user.id, user.tenant_id, user.organization_id, user.email, user.name, user.role, user.status, user.demo_token]);
    }
    console.log(`✅ Inserted ${seedData.users.length} users`);

    // Insert rental objects
    for (const obj of seedData.rental_objects) {
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
        obj.id, obj.tenant_id, obj.organization_id, obj.name, obj.slug, obj.description,
        obj.category_key, obj.time_mode, JSON.stringify(obj.features), obj.status, obj.requires_approval,
        obj.capacity, JSON.stringify(obj.images), JSON.stringify(obj.pricing), JSON.stringify(obj.metadata)
      ]);
    }
    console.log(`✅ Inserted ${seedData.rental_objects.length} rental objects`);

    console.log('');
    console.log('🎊 Import complete!');
    console.log('');
    console.log('Summary:');
    console.log(`  - ${seedData.tenants.length} tenants`);
    console.log(`  - ${seedData.organizations.length} organizations`);
    console.log(`  - ${seedData.users.length} users`);
    console.log(`  - ${seedData.rental_objects.length} rental objects`);
    console.log('');

  } catch (error) {
    console.error('❌ Error importing seeds:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run import
importSeeds().catch(console.error);
