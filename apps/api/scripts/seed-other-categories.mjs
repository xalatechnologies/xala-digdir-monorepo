/**
 * Seed 10 objects from other categories (UTSTYR, TJENESTER, PAKKER)
 */
import postgres from 'postgres';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL required');
  process.exit(1);
}

const sql = postgres(DATABASE_URL);

async function seed() {
  try {
    console.log('🌾 Loading other category objects from JSON...');
    const jsonPath = join(__dirname, '../data/other-categories-10.json');
    const data = JSON.parse(readFileSync(jsonPath, 'utf-8'));
    
    console.log(`✅ Loaded ${data.objects.length} objects`);
    
    // Insert all objects (no deletion - we're adding to existing)
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
          ${obj.metadata.bookingRules.approval.required},
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
    
    console.log(`✅ Inserted ${data.objects.length} objects`);
    
    // Verify by category
    const TENANT_ID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
    const stats = await sql`
      SELECT category_key, COUNT(*) as count 
      FROM rental_objects 
      WHERE tenant_id = ${TENANT_ID}
      GROUP BY category_key
      ORDER BY category_key
    `;
    
    console.log('✅ Database stats by category:');
    stats.forEach(s => console.log(`   ${s.category_key}: ${s.count} objects`));
    
    const total = await sql`SELECT COUNT(*) as count FROM rental_objects WHERE tenant_id = ${TENANT_ID}`;
    console.log(`✅ Total rental objects: ${total[0].count}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
