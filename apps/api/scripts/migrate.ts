/**
 * Database Migration Script
 *
 * Supports multiple migration strategies:
 * 1. Drizzle Kit migrations (if ./drizzle folder exists)
 * 2. Raw SQL migrations (from ./src/database/migrations)
 * 3. Feature flags catalog seeding (automatic)
 *
 * Usage:
 *   pnpm db:migrate              # Run migrations
 *   pnpm db:migrate --validate   # Validate setup (no database required)
 */
import { existsSync, readdirSync, readFileSync } from 'fs';
import { join, resolve } from 'path';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from '../src/database/schema/index';
import { logger } from '../src/core/logger';

const DRIZZLE_MIGRATIONS_FOLDER = './drizzle';

async function runDrizzleMigrations(databaseUrl: string): Promise<void> {
  if (!existsSync(DRIZZLE_MIGRATIONS_FOLDER)) {
    throw new Error(`Drizzle migrations folder not found: ${DRIZZLE_MIGRATIONS_FOLDER}`);
  }

  const sql = postgres(databaseUrl, { max: 1 });
  const db = drizzle(sql, { schema });

  try {
    await migrate(db, { migrationsFolder: DRIZZLE_MIGRATIONS_FOLDER });
  } finally {
    await sql.end();
  }
}

/**
 * Validate mode - checks all migration files and seeds without requiring database
 */
async function runValidation(): Promise<void> {
  console.log('');
  console.log('='.repeat(60));
  console.log(' Migration Validation (--validate mode)');
  console.log('='.repeat(60));
  console.log('');

  let errors = 0;

  // Check Drizzle migrations
  console.log('');
  console.log('📦 Checking Drizzle migrations...');
  if (!existsSync(DRIZZLE_MIGRATIONS_FOLDER)) {
    console.log('  ❌ Drizzle migrations folder missing');
    errors++;
  } else {
    const folderPath = resolve(DRIZZLE_MIGRATIONS_FOLDER);
    const files = readdirSync(folderPath)
      .filter(f => f.endsWith('.sql'))
      .sort();

    console.log(`  ✅ Drizzle migrations folder exists (${files.length} .sql file(s))`);
    for (const file of files) {
      const filePath = join(folderPath, file);
      try {
        const content = readFileSync(filePath, 'utf-8');
        if (content.trim().length === 0) {
          console.log(`  ❌ ${file}: Empty file`);
          errors++;
        }
      } catch {
        console.log(`  ❌ ${file}: Cannot read file`);
        errors++;
      }
    }
  }

  // Check schema exports
  console.log('');
  console.log('📊 Checking schema exports...');
  const requiredTables = ['featureFlagsCatalog', 'tenantFeatureFlags', 'orgFeatureFlags', 'plans', 'brandingTokens'];
  for (const table of requiredTables) {
    if (table in schema) {
      console.log(`  ✅ ${table}`);
    } else {
      console.log(`  ❌ ${table}: Missing from schema`);
      errors++;
    }
  }

  // Summary
  console.log('');
  console.log('='.repeat(60));
  if (errors === 0) {
    console.log(' ✅ Validation passed! Ready to run migrations.');
    console.log('');
    console.log(' To run actual migrations:');
    console.log('   export DATABASE_URL="postgresql://user:pass@localhost:5432/digilist"');
    console.log('   pnpm db:migrate');
  } else {
    console.log(` ❌ Validation failed with ${errors} error(s)`);
  }
  console.log('='.repeat(60));
  console.log('');

  process.exit(errors > 0 ? 1 : 0);
}

async function runMigration() {
  const databaseUrl = process.env.DATABASE_URL;
  const validateOnly = process.argv.includes('--validate');

  // Validate mode - no database required
  if (validateOnly) {
    await runValidation();
    return;
  }

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is required');
    console.error('');
    console.error('Example:');
    console.error('  export DATABASE_URL="postgresql://user:pass@localhost:5432/digilist"');
    console.error('');
    console.error('For validation only (no database):');
    console.error('  pnpm db:migrate --validate');
    process.exit(1);
  }

  console.log('');
  console.log('='.repeat(60));
  console.log(' Database Migration');
  logger.info('🔄 Starting database migration...\n');

  try {
    console.log('📦 Step 1: Drizzle Migrations');
    await runDrizzleMigrations(databaseUrl);
    console.log('  ✅ Drizzle migrations completed');

    console.log('');
    console.log('='.repeat(60));
    console.log(' Migration completed successfully!');
    console.log('='.repeat(60));
    console.log('');
  } catch (error) {
    logger.error({ error }, '❌ Migration failed');
    process.exit(1);
  }
}

runMigration();
