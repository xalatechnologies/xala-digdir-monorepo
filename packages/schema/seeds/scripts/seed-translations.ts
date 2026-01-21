/**
 * Seed translations to database
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SEED_FILE = path.resolve(__dirname, '../platform/translations.json');

interface TranslationEntry {
  tenantId: null;
  namespace: string;
  key: string;
  language: string;
  value: string;
  isSystemDefault: boolean;
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }

  console.log('📖 Reading seed file...');
  const entries: TranslationEntry[] = JSON.parse(fs.readFileSync(SEED_FILE, 'utf-8'));
  console.log(`  Found ${entries.length} entries`);

  console.log('\n🔌 Connecting to database...');
  const client = new pg.Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    console.log('\n🗑️  Clearing existing translations...');
    await client.query('DELETE FROM platform.translations WHERE is_system_default = true');

    console.log('\n🌱 Seeding translations...');
    
    // Use batch insert for performance
    const batchSize = 500;
    let inserted = 0;

    for (let i = 0; i < entries.length; i += batchSize) {
      const batch = entries.slice(i, i + batchSize);
      
      const values: string[] = [];
      const params: (string | boolean | null)[] = [];
      let paramIndex = 1;

      for (const entry of batch) {
        values.push(`($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3}, $${paramIndex + 4})`);
        params.push(entry.namespace, entry.key, entry.language, entry.value, entry.isSystemDefault);
        paramIndex += 5;
      }

      const query = `
        INSERT INTO platform.translations (namespace, key, language, value, is_system_default)
        VALUES ${values.join(', ')}
        ON CONFLICT (tenant_id, namespace, key, language) 
        WHERE tenant_id IS NULL
        DO UPDATE SET value = EXCLUDED.value, is_system_default = EXCLUDED.is_system_default
      `;

      await client.query(query, params);
      inserted += batch.length;
      
      if (inserted % 2000 === 0 || inserted === entries.length) {
        console.log(`  Progress: ${inserted}/${entries.length} (${Math.round(inserted / entries.length * 100)}%)`);
      }
    }

    console.log(`\n✅ Done! Seeded ${inserted} translations`);

    // Verify
    const result = await client.query('SELECT COUNT(*) FROM platform.translations WHERE is_system_default = true');
    console.log(`  Verified: ${result.rows[0].count} system default translations in database`);

  } finally {
    await client.end();
  }
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
