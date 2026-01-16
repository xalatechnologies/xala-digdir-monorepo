/**
 * Standalone seed script for VPS
 * Loads 40 rental objects from JSON and inserts into database
 */
import postgres from 'postgres';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL required');
  process.exit(1);
}

const sql = postgres(DATABASE_URL);

async function seed() {
  try {
    console.log('🌾 Loading rental objects from JSON...');
    const jsonPath = join(__dirname, '../data/rental-objects-40-full.json');
    const data = JSON.parse(readFileSync(jsonPath, 'utf-8'));
    
    console.log(`✅ Loaded ${data.objects.length} rental objects`);
    
    // Clear existing rental objects for tenant
    const TENANT_ID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
    await sql`DELETE FROM rental_objects WHERE tenant_id = ${TENANT_ID}`;
    console.log('🗑️  Cleared existing rental objects');
    
    // Insert all 40 objects
    for (const obj of data.objects) {
      await sql`
        INSERT INTO rental_objects (
          id, tenant_id, organization_id, name, slug,
          category_key, time_mode, features, requires_approval,
          status, description, capacity,
          pricing, images, metadata, created_at, updated_at
        ) VALUES (
          ${obj.id},
          ${obj.tenantId},
          ${obj.organizationId},
          ${obj.name},
          ${obj.slug},
          ${obj.categoryKey},
          ${obj.timeMode},
          ${sql.json([])},
          ${false},
          ${obj.status},
          ${obj.description},
          ${obj.capacity},
          ${sql.json(obj.pricing)},
          ${sql.json(obj.images)},
          ${sql.json(obj.metadata)},
          NOW(),
          NOW()
        )
      `;
    }
    
    console.log(`✅ Inserted ${data.objects.length} rental objects`);
    
    // Verify
    const count = await sql`SELECT COUNT(*) as count FROM rental_objects WHERE tenant_id = ${TENANT_ID}`;
    console.log(`✅ Database now has ${count[0].count} rental objects for Skien Kommune`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
